import CoreData
import Models
import Services
import SwiftUI
import Views

struct HighlightListItemParams: Identifiable {
  let id = UUID()
  let highlightID: String
  let title: String
  let annotation: String
  let quote: String
  let labels: [LinkedItemLabel]
  let createdBy: InternalUserProfile?
}

struct NoteItemParams: Identifiable {
  let id = UUID()
  let highlightID: String
  let annotation: String?
}

@MainActor final class NotebookViewModel: ObservableObject {
  let item: Models.LibraryItem

  @Published var noteItem: NoteItemParams?
  @Published var highlightItems = [HighlightListItemParams]()

  init(item: Models.LibraryItem) {
    self.item = item
  }

  func load(itemObjectID: NSManagedObjectID, dataService: DataService) {
    if let linkedItem = dataService.viewContext.object(with: itemObjectID) as? Models.LibraryItem {
      loadHighlights(item: linkedItem)
    }
  }

  func updateAnnotation(highlightID: String, annotation: String, dataService: DataService) {
    dataService.updateHighlightAttributes(highlightID: highlightID, annotation: annotation)

    if let index = highlightItems.firstIndex(where: { $0.highlightID == highlightID }) {
      highlightItems[index] = HighlightListItemParams(
        highlightID: highlightID,
        title: highlightItems[index].title,
        annotation: annotation,
        quote: highlightItems[index].quote,
        labels: highlightItems[index].labels,
        createdBy: highlightItems[index].createdBy
      )
    }
  }

  func updateNoteAnnotation(itemObjectID: NSManagedObjectID, annotation: String, dataService: DataService) {
    if let noteItem = self.noteItem {
      dataService.updateHighlightAttributes(highlightID: noteItem.highlightID, annotation: annotation)
      self.noteItem = NoteItemParams(highlightID: noteItem.highlightID, annotation: annotation)
    } else {
      let highlightId = UUID().uuidString.lowercased()
      let shortId = NanoID.generate(alphabet: NanoID.Alphabet.urlSafe.rawValue, size: 8)

      if let linkedItem = dataService.viewContext.object(with: itemObjectID) as? Models.LibraryItem {
        noteItem = NoteItemParams(highlightID: highlightId, annotation: annotation)
        let highlight = dataService.createNote(shortId: shortId,
                                               highlightID: highlightId,
                                               articleId: linkedItem.unwrappedID,
                                               annotation: annotation)
      } else {
        //
      }
    }
  }

  func deleteNote(dataService: DataService) {
    if let highlightID = noteItem?.highlightID {
      dataService.deleteHighlight(highlightID: highlightID)
      noteItem = nil
    }
  }

  func deleteHighlight(highlightID: String, dataService: DataService) {
    dataService.deleteHighlight(highlightID: highlightID)
    highlightItems.removeAll { $0.highlightID == highlightID }
  }

  func setLabelsForHighlight(highlightID: String, labels: [LinkedItemLabel], dataService: DataService) {
    dataService.setLabelsForHighlight(highlightID: highlightID, labelIDs: labels.map(\.unwrappedID))

    if let index = highlightItems.firstIndex(where: { $0.highlightID == highlightID }) {
      highlightItems[index] = HighlightListItemParams(
        highlightID: highlightID,
        title: highlightItems[index].title,
        annotation: highlightItems[index].annotation,
        quote: highlightItems[index].quote,
        labels: labels,
        createdBy: highlightItems[index].createdBy
      )
    }
  }

  func highlightAsMarkdown(item: HighlightListItemParams) -> String {
    var buffer = "> \(item.quote)"
    if !item.annotation.isEmpty {
      buffer += "\n\n\(item.annotation)"
    }
    buffer += "\n"
    return buffer
  }

  func highlightsAsMarkdown() -> String {
    var buffer = "\(item.unwrappedTitle)\n"
    if let author = item.author {
      buffer += "by: \(author)\n"
    }
    if let url = item.pageURLString {
      buffer += "\(url)\n"
    }
    if let noteText = item.noteText {
      buffer += "\n\n\(noteText)\n\n"
    }
    return buffer + "\n\n" + highlightItems.map { highlightAsMarkdown(item: $0) }.lazy.joined(separator: "\n\n")
  }

  private func loadHighlights(item: Models.LibraryItem) {
    let unsortedHighlights = item.highlights.asArray(of: Highlight.self)
      .filter { $0.type == "HIGHLIGHT" && $0.serverSyncStatus != ServerSyncStatus.needsDeletion.rawValue }

    let highlights = unsortedHighlights.sorted { left, right in
      if left.positionPercent > 0, right.positionPercent > 0 {
        return left.positionPercent < right.positionPercent
      }
      return (left.createdAt ?? Date()) < (right.createdAt ?? Date())
    }

    highlightItems = highlights.map {
      HighlightListItemParams(
        highlightID: $0.unwrappedID,
        title: LocalText.genericHighlight,
        annotation: $0.annotation ?? "",
        quote: $0.quote ?? "",
        labels: $0.labels.asArray(of: LinkedItemLabel.self),
        createdBy: $0.createdByMe ? nil : InternalUserProfile.makeSingle($0.createdBy)
      )
    }

    noteItem = item.highlights.asArray(of: Highlight.self)
      .filter { $0.type == "NOTE" && $0.serverSyncStatus != ServerSyncStatus.needsDeletion.rawValue }
      .first
      .map { NoteItemParams(highlightID: $0.unwrappedID, annotation: $0.annotation) }
  }
}
