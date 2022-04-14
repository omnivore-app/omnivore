import Combine
import Foundation
import Models
import SwiftGraphQL
import Utils

public extension DataService {
  func fetchViewer() async throws -> Viewer {
    let selection = Selection<Viewer, Objects.User> {
      Viewer(
        username: try $0.profile(
          selection: .init { try $0.username() }
        ),
        name: try $0.name(),
        profileImageURL: try $0.profile(
          selection: .init { try $0.pictureUrl() }
        ),
        userID: try $0.id()
      )
    }

    let query = Selection.Query {
      try $0.me(selection: selection.nonNullOrFail)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { [weak self] result in
        switch result {
        case let .success(payload):
          self?.currentViewer = payload.data
          if UserDefaults.standard.string(forKey: Keys.userIdKey) == nil {
            UserDefaults.standard.setValue(payload.data.userID, forKey: Keys.userIdKey)
            DataService.registerIntercomUser?(payload.data.userID)
          }
          continuation.resume(returning: payload.data)
        case .failure:
          continuation.resume(throwing: BasicError.message(messageText: "http error"))
        }
      }
    }
  }
}

public extension DataService {
  @available(*, deprecated, message: "use async version instead")
  func viewerPublisher() -> AnyPublisher<Viewer, BasicError> {
    internalViewerPublisher()
      .handleEvents(receiveOutput: {
        // Persist ID so AppDelegate can use it to register Intercom users at launch time
        if UserDefaults.standard.string(forKey: Keys.userIdKey) == nil {
          UserDefaults.standard.setValue($0.userID, forKey: Keys.userIdKey)
          DataService.registerIntercomUser?($0.userID)
        }
      })
      .receive(on: DispatchQueue.main)
      .eraseToAnyPublisher()
  }
}

extension DataService {
  func internalViewerPublisher() -> AnyPublisher<Viewer, BasicError> {
    let selection = Selection<Viewer, Objects.User> {
      Viewer(
        username: try $0.profile(
          selection: .init { try $0.username() }
        ),
        name: try $0.name(),
        profileImageURL: try $0.profile(
          selection: .init { try $0.pictureUrl() }
        ),
        userID: try $0.id()
      )
    }

    let query = Selection.Query {
      try $0.me(selection: selection.nonNullOrFail)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return Deferred {
      Future { [weak self] promise in
        send(query, to: path, headers: headers) { result in
          switch result {
          case let .success(payload):
            self?.currentViewer = payload.data
            promise(.success(payload.data))
          case .failure:
            promise(.failure(.message(messageText: "http error")))
          }
        }
      }
    }
    .eraseToAnyPublisher()
  }
}
