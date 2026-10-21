import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func setLabelsForHighlight(highlightID: String, labelIDs: [String]) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let highlight = Highlight.lookup(byID: highlightID, inContext: self.backgroundContext) else { return }

      if let existingLabels = highlight.labels {
        highlight.removeFromLabels(existingLabels)
      }

      for labelID in labelIDs {
        if let labelObject = LinkedItemLabel.lookup(byID: labelID, inContext: self.backgroundContext) {
          highlight.addToLabels(labelObject)
        }
      }

      // Send update to server
      self.syncHighlightLabelUpdates(highlightID: highlightID, labelIDs: labelIDs)
    }
  }

  func syncHighlightLabelUpdates(highlightID: String, labelIDs: [String]) {
    enum MutationResult {
      case saved(labels: [InternalLinkedItemLabel])
      case error(errorCode: Enums.SetLabelsErrorCode)
    }

    let selection = Selection<MutationResult, Unions.SetLabelsResult> {
      try $0.on(
        setLabelsError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) },
        setLabelsSuccess: .init { .saved(labels: try $0.labels(selection: highlightLabelSelection.list)) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.setLabelsForHighlight(
        input: InputObjects.SetLabelsForHighlightInput(
          highlightId: highlightID,
          labelIds: OptionalArgument(labelIDs)
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
        guard let highlight = Highlight.lookup(byID: highlightID, inContext: context) else { return }
        highlight.serverSyncStatus = Int64(syncStatus.rawValue)

        do {
          try context.save()
          logger.debug("Highlight labels updated succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to update highlight labels: \(error.localizedDescription)")
        }
      }
    }
  }
}
