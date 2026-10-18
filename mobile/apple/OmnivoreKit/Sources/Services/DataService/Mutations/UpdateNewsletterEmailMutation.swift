import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func updateNewsletterEmail(
    emailID: String, folder: String? = nil, description: String? = nil
  ) async throws -> InternalNewsletterEmail {
    enum MutationResult {
      case result(email: InternalNewsletterEmail)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.UpdateNewsletterEmailResult> {
      try $0.on(
        updateNewsletterEmailError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        updateNewsletterEmailSuccess: .init { .result(email: try $0.newsletterEmail(selection: newsletterEmailSelection)) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.updateNewsletterEmail(
        input: InputObjects.UpdateNewsletterEmailInput(
          description: OptionalArgument(description),
          folder: OptionalArgument(folder),

          id: emailID
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(mutation, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: BasicError.message(messageText: "network error"))
          return
        }

        switch payload.data {
        case let .result(email: email):
          continuation.resume(returning: email)
        case let .error(errorMessage: errorMessage):
          continuation.resume(throwing: BasicError.message(messageText: errorMessage))
        }
      }
    }
  }
}
