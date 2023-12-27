import CoreData
import Foundation
import Models
import SwiftGraphQL

let newsletterEmailSelection = Selection.NewsletterEmail {
  InternalNewsletterEmail(
    emailId: try $0.id(),
    email: try $0.address(),
    folder: try $0.folder(),
    descriptionNote: try $0.description(),
    confirmationCode: try $0.confirmationCode()
  )
}

public extension DataService {
  func newsletterEmails() async throws -> [NSManagedObjectID] {
    enum QueryResult {
      case success(result: [InternalNewsletterEmail])
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.NewsletterEmailsResult> {
      try $0.on(
        newsletterEmailsError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        newsletterEmailsSuccess: .init {
          QueryResult.success(result: try $0.newsletterEmails(selection: newsletterEmailSelection.list))
        }
      )
    }

    let query = Selection.Query {
      try $0.newsletterEmails(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network request failed"))
          return
        }

        switch payload.data {
        case let .success(result: result):
          if let newsletterEmailObjectIDs = result.persist(context: context) {
            continuation.resume(returning: newsletterEmailObjectIDs)
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "CoreData error"))
          }
        case .error:
          continuation.resume(throwing: BasicError.message(messageText: "Newsletter Email fetch error"))
        }
      }
    }
  }
}
