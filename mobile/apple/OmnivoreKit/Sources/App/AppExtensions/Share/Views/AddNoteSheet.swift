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

  enum FocusField: Hashable {
    case noteEditor
  }

  @FocusState private var focusedField: FocusField?

  public init(viewModel: ShareExtensionViewModel) {
    _viewModel = StateObject(wrappedValue: viewModel)
    #if os(iOS)
      UITextView.appearance().textContainerInset = UIEdgeInsets(top: 8, left: 4, bottom: 10, right: 4)
    #endif
  }

  func saveNote() {
    viewModel.saveNote()
  }

  public var body: some View {
    NavigationView {
      TextEditor(text: $viewModel.noteText)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .focused($focusedField, equals: .noteEditor)
        .task {
          self.focusedField = .noteEditor
        }
        .background(Color.extensionBackground)
        .navigationTitle("Add Note")
      #if os(iOS)
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
      #endif
    }
    #if os(iOS)
      .navigationViewStyle(StackNavigationViewStyle())
    #endif
  }
}
