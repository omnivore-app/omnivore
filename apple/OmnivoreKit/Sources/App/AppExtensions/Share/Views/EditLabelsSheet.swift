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

    UITextView.appearance().textContainerInset = UIEdgeInsets(top: 5, left: 2, bottom: 5, right: 2)
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
    VStack(spacing: 15) {
      LabelsEntryView(
        searchTerm: $labelsViewModel.labelSearchFilter,
        viewModel: labelsViewModel
      )

      List {
        Section {
          ForEach(labelsViewModel.labels.applySearchFilter(labelsViewModel.labelSearchFilter), id: \.self) { label in
            Button(
              action: {
//                if labelsViewModel.selectedLabels.contains(label) {
//                  if let idx = viewModel.selectedLabels.firstIndex(of: label) {
//                    viewModel.selectedLabels.remove(at: idx)
//                  }
//                } else {
//                  viewModel.labelSearchFilter = ZWSP
//                  viewModel.selectedLabels.append(label)
//                }
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
          // createLabelButton
        }
      }
      .listStyle(PlainListStyle())

      Spacer()

//      // swiftlint:disable line_length
//      ScrollView {
//        LabelsMasonaryView(
//          labels: labelsViewModel.labels.applySearchFilter(labelsViewModel.labelSearchFilter),
//          selectedLabels: labelsViewModel.selectedLabels.applySearchFilter(labelsViewModel.labelSearchFilter),
//          onLabelTap: onLabelTap
//        )
//
//        Button(
//          action: { labelsViewModel.showCreateLabelModal = true },
//          label: {
//            HStack {
//              let trimmedLabelName = labelsViewModel.labelSearchFilter.trimmingCharacters(in: .whitespacesAndNewlines)
//              Image(systemName: "tag").foregroundColor(.blue)
//              Text(
//                labelsViewModel.labelSearchFilter.count > 0 ?
//                  "Create: \"\(trimmedLabelName)\" label" :
//                  LocalText.createLabelMessage
//              ).foregroundColor(.blue)
//                .font(Font.system(size: 14))
//              Spacer()
//            }
//          }
//        )
//        .buttonStyle(PlainButtonStyle())
//        .padding(10)
//      }
    }
    .background(Color.clear)
    .padding(20)
  }

  public var body: some View {
    NavigationView {
      content
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.extensionBackground)
        .navigationTitle("Set Labels")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarItems(trailing: Button(action: {
          dismiss()
        }, label: {
          Text("Done").bold()
        }))
    }
    .environmentObject(viewModel.services.dataService)
    .task {
      await labelsViewModel.loadLabelsFromStore(dataService: viewModel.services.dataService)
    }
  }
}
