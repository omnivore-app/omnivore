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
  @State var text = ""

  enum FocusField: Hashable {
    case noteEditor
  }

  @FocusState private var focusedField: FocusField?

  public init() {
    UITextView.appearance().textContainerInset = UIEdgeInsets(top: 5, left: 2, bottom: 5, right: 2)
  }

  public var body: some View {
    NavigationView {
      TextEditor(text: $text)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .focused($focusedField, equals: .noteEditor)
        .task {
          self.focusedField = .noteEditor
        }
        .background(Color.extensionPanelBackground)
        .navigationTitle("Add Note")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarItems(leading: Button(action: {}, label: {
          Text("Cancel")
        }))
        .navigationBarItems(trailing: Button(action: {}, label: {
          Text("Save").bold()
        }))
    }
  }
}
