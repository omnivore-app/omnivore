import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func createNewsletter() async throws -> NSManagedObjectID {
    enum MutationResult {
      case saved(newsletterEmail: InternalNewsletterEmail)
      case error(errorCode: Enums.CreateNewsletterEmailErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateNewsletterEmailResult> {
      try $0.on(
        createNewsletterEmailError: .init {
          .error(errorCode: try $0.errorCodes().first ?? .badRequest)
        },
        createNewsletterEmailSuccess: .init {
          .saved(newsletterEmail: try $0.newsletterEmail(selection: Selection.NewsletterEmail {
            InternalNewsletterEmail(
              emailId: try $0.id(),
              email: try $0.address(),
              folder: try $0.folder(),
              descriptionNote: try $0.description(),
              confirmationCode: try $0.confirmationCode()
            )
          }))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createNewsletterEmail(selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { [weak self] queryResult in
        guard let payload = try? queryResult.get(), let self = self else {
          continuation.resume(throwing: BasicError.message(messageText: "network error"))
          return
        }

        switch payload.data {
        case let .saved(newsletterEmail: newsletterEmail):
          if let newsletterEmailObjectID = newsletterEmail.persist(context: self.backgroundContext) {
            continuation.resume(returning: newsletterEmailObjectID)
          } else {
            continuation.resume(throwing: BasicError.message(messageText: "CoreData error"))
          }
        case let .error(errorCode: errorCode):
          continuation.resume(throwing: BasicError.message(messageText: errorCode.rawValue))
        }
      }
    }
  }
}
