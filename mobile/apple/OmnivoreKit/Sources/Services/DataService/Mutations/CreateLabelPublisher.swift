import CoreData
import Foundation
import Models
import SwiftGraphQL

extension DataService {
  public func createLabel(
    name: String,
    color: String,
    description: String?
  ) throws -> NSManagedObjectID {
    let internalLabel = InternalLinkedItemLabel(
      id: UUID().uuidString,
      name: name,
      color: color,
      createdAt: nil,
      labelDescription: description
    )

    if let labelObjectID = internalLabel.persist(context: backgroundContext) {
      // Send update to server
      syncLabelCreation(label: internalLabel)
      return labelObjectID
    } else {
      throw BasicError.message(messageText: "core data error")
    }
  }

  // swiftlint:disable:next function_body_length
  func syncLabelCreation(label: InternalLinkedItemLabel) {
    enum MutationResult {
      case saved(label: InternalLinkedItemLabel)
      case error(errorCode: Enums.CreateLabelErrorCode)
    }

    let selection = Selection<MutationResult, Unions.CreateLabelResult> {
      try $0.on(
        createLabelError: .init { .error(errorCode: try $0.errorCodes().first ?? .badRequest) },
        createLabelSuccess: .init { .saved(label: try $0.label(selection: feedItemLabelSelection)) }
      )
    }

    let mutation = Selection.Mutation {
      try $0.createLabel(
        input: InputObjects.CreateLabelInput(
          color: OptionalArgument(label.color),
          description: OptionalArgument(label.labelDescription),
          name: label.name
        ),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders
    let context = backgroundContext

    send(mutation, to: path, headers: headers) { result in
      let payload = try? result.get()

      let updatedLabelID: String? = {
        if let payload = try? result.get() {
          switch payload.data {
          case let .saved(label: label):
            return label.id
          case .error:
            return nil
          }
        }
        return nil
      }()

      let syncStatus: ServerSyncStatus = payload == nil ? .needsCreation : .isNSync

      context.perform {
        let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "%K == %@", #keyPath(LinkedItemLabel.name), label.name)

        guard let labelObject = (try? context.fetch(fetchRequest))?.first else { return }
        labelObject.serverSyncStatus = Int64(syncStatus.rawValue)

        // Updated id with the one generated on the server
        if let updatedLabelID = updatedLabelID {
          labelObject.id = updatedLabelID
        }

        do {
          try context.save()
          logger.debug("Label created succesfully")
        } catch {
          context.rollback()
          logger.debug("Failed to create Label: \(error.localizedDescription)")
        }
      }
    }
  }
}
