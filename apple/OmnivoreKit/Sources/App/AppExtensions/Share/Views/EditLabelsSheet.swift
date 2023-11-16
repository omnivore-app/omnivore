//
//  EditLabelsSheet.swift
//
//
//  Created by Jackson Harper on 10/27/23.
//

import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor
public struct EditLabelsSheet: View {
  @State var text = ""
  @State var isLabelsEntryFocused = false
  @Environment(\.dismiss) private var dismiss
  @EnvironmentObject var dataService: DataService

  @StateObject var labelsViewModel: LabelsViewModel
  @StateObject var viewModel: ShareExtensionViewModel

  enum FocusField: Hashable {
    case noteEditor
  }

  @FocusState private var focusedField: FocusField?

  public init(viewModel: ShareExtensionViewModel, labelsViewModel: LabelsViewModel) {
    _viewModel = StateObject(wrappedValue: viewModel)
    _labelsViewModel = StateObject(wrappedValue: labelsViewModel)
    #if os(iOS)
      UITextView.appearance().textContainerInset = UIEdgeInsets(top: 5, left: 2, bottom: 5, right: 2)
    #endif
  }

  @MainActor
  func onLabelTap(label: LinkedItemLabel, textChip _: TextChip) {
    if let idx = labelsViewModel.selectedLabels.firstIndex(of: label) {
      labelsViewModel.selectedLabels.remove(at: idx)
    } else {
      labelsViewModel.labelSearchFilter = ZWSP
      labelsViewModel.selectedLabels.append(label)
    }

    if let linkedItem = viewModel.linkedItem {
      labelsViewModel.saveItemLabelChanges(itemID: linkedItem.unwrappedID, dataService: viewModel.services.dataService)
    }
  }

  func isSelected(_ label: LinkedItemLabel) -> Bool {
    labelsViewModel.selectedLabels.contains(where: { $0.id == label.id })
  }

  var content: some View {
    VStack {
      LabelsEntryView(
        searchTerm: $labelsViewModel.labelSearchFilter,
        isFocused: $isLabelsEntryFocused,
        viewModel: labelsViewModel
      )
      .padding(.horizontal, 10)
      .padding(.vertical, 20)

      if labelsViewModel.labelSearchFilter.count >= 63 {
        Text("The maximum length of a label is 64 chars.").foregroundColor(Color.red).font(.footnote)
      }

      List {
        ForEach(labelsViewModel.labels.applySearchFilter(labelsViewModel.labelSearchFilter), id: \.self) { label in
          Button(
            action: {
              if let idx = labelsViewModel.selectedLabels.firstIndex(of: label) {
                labelsViewModel.selectedLabels.remove(at: idx)
              } else {
                labelsViewModel.labelSearchFilter = ZWSP
                labelsViewModel.selectedLabels.append(label)
              }
            },
            label: {
              HStack {
                TextChip(feedItemLabel: label).allowsHitTesting(false)
                Spacer()
                if isSelected(label) {
                  Image(systemName: "checkmark")
                }
              }
              .contentShape(Rectangle())
            }
          )
          .padding(.vertical, 5)
          .frame(maxWidth: .infinity, alignment: .leading)
          #if os(macOS)
            .buttonStyle(PlainButtonStyle())
          #endif
        }
      }
      .listStyle(.plain)
      .background(Color.extensionBackground)

      Spacer()
    }.frame(maxHeight: .infinity)
  }

  public var body: some View {
    NavigationView {
      content
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.extensionBackground)
        .navigationTitle("Set Labels")
      #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarItems(trailing: Button(action: {
          if let linkedItem = viewModel.linkedItem, let linkedItemId = linkedItem.id {
            labelsViewModel.saveItemLabelChanges(
              itemID: linkedItemId,
              dataService: viewModel.services.dataService
            )
          }
          dismiss()
        }, label: {
          Text("Done").bold()
        }))
      #endif
    }
    #if os(iOS)
      .navigationViewStyle(StackNavigationViewStyle())
    #endif
    .environmentObject(viewModel.services.dataService)
      .task {
        await labelsViewModel.loadLabelsFromStore(dataService: viewModel.services.dataService)
      }
  }
}
