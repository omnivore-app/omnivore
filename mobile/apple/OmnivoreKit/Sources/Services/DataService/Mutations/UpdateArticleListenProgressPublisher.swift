import CoreData
import Foundation
import Models
import SwiftGraphQL

public extension DataService {
  func updateLinkListeningProgress(itemID: String, listenIndex: Int, listenOffset: Double, listenTime: Double) {
    backgroundContext.perform { [weak self] in
      guard let self = self else { return }
      guard let linkedItem = LibraryItem.lookup(byID: itemID, inContext: self.backgroundContext) else { return }

      linkedItem.update(
        inContext: self.backgroundContext,
        listenPositionIndex: listenIndex,
        listenPositionOffset: listenOffset,
        listenPositionTime: listenTime
      )
    }
  }
}
