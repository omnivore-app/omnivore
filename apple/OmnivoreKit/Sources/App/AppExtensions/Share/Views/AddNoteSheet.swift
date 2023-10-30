//
//  AddNoteSheet.swift
//
//
//  Created by Jackson Harper on 10/26/23.
//

import Models
import Services
import SwiftUI
import Utils
import Views

public struct AddNoteSheet: View {
  @Environment(\.dismiss) private var dismiss

  @StateObject var viewModel: ShareExtensionViewModel
  let highlightId = UUID().uuidString.lowercased()
  let shortId = NanoID.generate(alphabet: NanoID.Alphabet.urlSafe.rawValue, size: 8)

  enum FocusField: Hashable {
    case noteEditor
  }

  @FocusState private var focusedField: FocusField?

  public init(viewModel: ShareExtensionViewModel) {
    _viewModel = StateObject(wrappedValue: viewModel)
    UITextView.appearance().textContainerInset = UIEdgeInsets(top: 8, left: 4, bottom: 10, right: 4)
  }

  func saveNote() {
    if let linkedItem = viewModel.linkedItem {
      _ = viewModel.services.dataService.createNote(shortId: shortId,
                                                    highlightID: highlightId,
                                                    articleId: linkedItem.unwrappedID,
                                                    annotation: viewModel.noteText)
    } else {
      // Maybe we shouldn't even allow this UI without linkeditem existing
    }
  }

  public var body: some View {
    NavigationView {
      TextEditor(text: $viewModel.noteText)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .focused($focusedField, equals: .noteEditor)
        .task {
          self.focusedField = .noteEditor
        }
        .background(Color.extensionPanelBackground)
        .navigationTitle("Add Note")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarItems(leading: Button(action: {
          dismiss()
        }, label: {
          Text("Cancel")
        }))
        .navigationBarItems(trailing: Button(action: {
          saveNote()
          dismiss()
        }, label: {
          Text("Save").bold()
        }))
    }
  }
}
