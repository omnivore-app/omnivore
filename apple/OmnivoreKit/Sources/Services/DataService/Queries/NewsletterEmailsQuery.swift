import Combine
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func newsletterEmailsPublisher() -> AnyPublisher<[NewsletterEmail], ServerError> {
    enum QueryResult {
      case success(result: [InternalNewsletterEmail])
      case error(error: String)
    }

    let newsletterEmailSelection = Selection.NewsletterEmail {
      InternalNewsletterEmail(
        emailId: try $0.id(),
        email: try $0.address(),
        confirmationCode: try $0.confirmationCode()
      )
    }

    let selection = Selection<QueryResult, Unions.NewsletterEmailsResult> {
      try $0.on(
        newsletterEmailsSuccess: .init {
          QueryResult.success(result: try $0.newsletterEmails(selection: newsletterEmailSelection.list))
        },
        newsletterEmailsError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        }
      )
    }

    let query = Selection.Query {
      try $0.newsletterEmails(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return Deferred {
      Future { promise in
        send(query, to: path, headers: headers) { result in
          switch result {
          case let .success(payload):
            switch payload.data {
            case let .success(result: result):
              if let newsletterEmailObject = result.persist(context: self.persistentContainer.viewContext) {
                promise(.success(newsletterEmailObject))
              } else {
                promise(.failure(.unknown))
              }
            case .error:
              promise(.failure(.unknown))
            }
          case .failure:
            promise(.failure(.unknown))
          }
        }
      }
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
  }
}
