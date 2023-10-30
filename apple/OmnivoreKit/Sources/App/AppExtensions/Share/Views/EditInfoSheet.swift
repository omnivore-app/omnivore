//
//  EditInfoSheet.swift
//
//
//  Created by Jackson Harper on 10/30/23.
//

import Models
import Services
import SwiftUI
import Utils
import Views

public struct EditInfoSheet: View {
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

//  func saveInfo() {
//    if let linkedItem = viewModel.linkedItem {
//      _ = viewModel.services.dataService.updateLinkedItemTitleAndDescription(itemID: linkedItem.unwrappedID, title: title, description: description, author: author)
//    } else {
//      // Maybe we shouldn't even allow this UI without linkeditem existing
//    }
//  }

  public var body: some View {
    if let item = viewModel.linkedItem {
      LinkedItemMetadataEditView(item: item) { title, _ in
        viewModel.title = title
      }
      .environmentObject(viewModel.services.dataService)
    } else {
      ProgressView()
    }
  }
}
