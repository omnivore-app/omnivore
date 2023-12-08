import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func updateLinkedItemTitleAndDescription(itemID: String, title: String, description: String, author: String?) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let linkedItem = LibraryItem.lookup(byID: itemID, inContext: self.backgroundContext) else { return }

      linkedItem.update(
        inContext: self.backgroundContext,
        newTitle: title,
        newDescription: description,
        newAuthor: author
      )

      // Send update to server
      self.syncLinkedItemTitleAndDescription(
        itemID: itemID,
        title: title,
        author: author,
        description: description
      )
    }
  }

  func syncLinkedItemTitleAndDescription(
    itemID: String,
    title: String,
    author: String?,
    description: String
  ) {
    enum MutationResult {
      case saved(title: String)
      case error(errorMessage: String)
    }

    let selection = Selection<MutationResult, Unions.UpdatePageResult> {
      try $0.on(
        updatePageError: .init { .error(errorMessage: try $0.errorCodes().first?.rawValue ?? "Unknown Error") },
        updatePageSuccess: .init {
          .saved(title: try $0.updatedPage(selection: Selection.Article { try $0.title() }))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.updatePage(
        input: .init(byline: OptionalArgument(author),
                     description: OptionalArgument(description),
                     pageId: itemID,
                     title: OptionalArgument(title)),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    send(mutation, to: path, headers: headers) { result in
      let data = try? result.get()
      let syncStatus: ServerSyncStatus = data == nil ? .needsUpdate : .isNSync

      context.perform {
        guard let linkedItem = LibraryItem.lookup(byID: itemID, inContext: context) else { return }
        linkedItem.serverSyncStatus = Int64(syncStatus.rawValue)

        do {
          try context.save()
          logger.debug("LinkedItem updated succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to update LinkedItem: \(error.localizedDescription)")
        }
      }
    }
  }
}
