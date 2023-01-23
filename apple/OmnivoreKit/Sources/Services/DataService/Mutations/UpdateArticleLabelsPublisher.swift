import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func updateItemLabels(itemID: String, labelIDs: [String]) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let linkedItem = LinkedItem.lookup(byID: itemID, inContext: self.backgroundContext) else { return }

      if let existingLabels = linkedItem.labels {
        linkedItem.removeFromLabels(existingLabels)
      }

      for labelID in labelIDs {
        if let labelObject = LinkedItemLabel.lookup(byID: labelID, inContext: self.backgroundContext) {
          linkedItem.addToLabels(labelObject)
        }
      }

      // Send update to server
      self.syncLabelUpdates(itemID: itemID, labelIDs: labelIDs)
    }
  }

  func syncLabelUpdates(itemID: String, labelIDs: [String]) {
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

    let mutation = Selection.Mutation {
      try $0.setLabels(
        input: InputObjects.SetLabelsInput(
          labelIds: labelIDs,
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
        guard let linkedItem = LinkedItem.lookup(byID: itemID, inContext: context) else { return }
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
