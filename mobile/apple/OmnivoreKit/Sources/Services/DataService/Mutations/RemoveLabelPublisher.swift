import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func removeLabel(labelID: String, name: String) {
    // Update CoreData
    viewContext.performAndWait {
      guard let label = LinkedItemLabel.lookup(byID: labelID, inContext: self.viewContext) else { return }
      label.serverSyncStatus = Int64(ServerSyncStatus.needsDeletion.rawValue)

      do {
        try viewContext.save()
        logger.debug("Label succesfully marked for deletion")
      } catch {
        viewContext.rollback()
        logger.debug("Failed to mark Label for deletion: \(error.localizedDescription)")
      }
    }

    // Send update to server
    syncLabelDeletion(labelID: labelID, labelName: name)
  }

  func syncLabelDeletion(labelID: String, labelName _: String) {
    enum MutationResult {
      case success(labelID: String)
      case error(errorCode: Enums.DeleteLabelErrorCode)
    }

    let selection = Selection<MutationResult, Unions.DeleteLabelResult> {
      try $0.on(
        deleteLabelError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) },
        deleteLabelSuccess: .init {
          .success(labelID: try $0.label(selection: Selection.Label { try $0.id() }))
        }
      )
    }

    let mutation = Selection.Mutation {
      try $0.deleteLabel(id: labelID, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    send(mutation, to: path, headers: headers) { result in
      let data = try? result.get()
      let isSyncSuccess = data != nil

      context.perform {
        let label = LinkedItemLabel.lookup(byID: labelID, inContext: context)
        guard let label = label else { return }

        if isSyncSuccess {
          label.remove(inContext: context)
        } else {
          label.serverSyncStatus = Int64(ServerSyncStatus.needsDeletion.rawValue)

          do {
            try context.save()
            logger.debug("LinkedItem deleted succesfully")
          } catch {
            context.rollback()
            logger.debug("Failed to delete LinkedItem: \(error.localizedDescription)")
          }
        }
      }
    }
  }
}
