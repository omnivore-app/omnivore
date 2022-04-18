import Combine
import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func createNewsletterEmailPublisher() -> AnyPublisher<NewsletterEmail, BasicError> {
    enum MutationResult {
      case saved(newsletterEmail: InternalNewsletterEmail)
      case error(errorCode: Enums.CreateNewsletterEmailErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateNewsletterEmailResult> {
      try $0.on(
        createNewsletterEmailSuccess: .init {
          .saved(newsletterEmail: try $0.newsletterEmail(selection: Selection.NewsletterEmail {
            InternalNewsletterEmail(
              emailId: try $0.id(),
              email: try $0.address(),
              confirmationCode: try $0.confirmationCode()
            )
          }))
        }, createNewsletterEmailError: .init {
          .error(errorCode: try $0.errorCodes().first ?? .badRequest)
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createNewsletterEmail(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return Deferred {
      Future { promise in
        send(mutation, to: path, headers: headers) { result in
          switch result {
          case let .success(payload):
            if let graphqlError = payload.errors {
              promise(.failure(.message(messageText: "graphql error: \(graphqlError)")))
            }

            switch payload.data {
            case let .saved(newsletterEmail: newsletterEmail):
              if let newsletterEmailObject = newsletterEmail.persist(context: self.persistentContainer.viewContext) {
                promise(.success(newsletterEmailObject))
              } else {
                promise(.failure(.message(messageText: "coredata error")))
              }
            case let .error(errorCode: errorCode):
              promise(.failure(.message(messageText: errorCode.rawValue)))
            }
          case .failure:
            promise(.failure(.message(messageText: "graphql error")))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}
