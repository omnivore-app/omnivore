import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func setItemLabels(itemID: String, labels: [InternalLinkedItemLabel]) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let linkedItem = LibraryItem.lookup(byID: itemID, inContext: self.backgroundContext) else { return }

      if let existingLabels = linkedItem.labels {
        linkedItem.removeFromLabels(existingLabels)
      }

      for label in labels {
        linkedItem.addToLabels(label.asManagedObject(inContext: self.backgroundContext))
      }

      linkedItem.update(inContext: self.backgroundContext)
      try? self.backgroundContext.save()

      // Send update to server
      self.syncLabelUpdates(itemID: itemID, labels: labels)
    }
  }

  internal func syncLabelUpdates(itemID: String, labels: [InternalLinkedItemLabel]) {
    enum MutationResult {
      case saved(feedItem: [InternalLinkedItemLabel])
      case error(errorCode: Enums.SetLabelsErrorCode)
    }

    let selection = Selection<MutationResult, Unions.SetLabelsResult> {
      try $0.on(
        setLabelsError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) },
        setLabelsSuccess: .init { .saved(feedItem: try $0.labels(selection: feedItemLabelSelection.list)) }
      )
    }

    let labelInputs = labels.compactMap { label in
      InputObjects.CreateLabelInput(
        color: OptionalArgument(label.color),
        description: OptionalArgument(label.labelDescription),
        name: label.name
      )
    }

    let mutation = Selection.Mutation {
      try $0.setLabels(
        input: InputObjects.SetLabelsInput(
          labels: OptionalArgument(labelInputs),
          pageId: itemID
        ),
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
          logger.debug("Item labels updated succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to update item labels: \(error.localizedDescription)")
        }
      }
    }
  }
}
