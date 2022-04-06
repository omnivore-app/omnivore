import Combine
import Models
import Services
import SwiftUI
import Views

struct LabelsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = LabelsViewModel()
  @State private var showDeleteConfirmation = false
  @State private var labelToRemoveID: String?

  let footerText = "Use labels to create curated collections of links."

  var body: some View {
    Group {
      #if os(iOS)
        if #available(iOS 15.0, *) {
          Form {
            innerBody
              .alert("Are you sure you want to delete this label?", isPresented: $showDeleteConfirmation) {
                Button("Remove Link", role: .destructive) {
                  if let labelID = labelToRemoveID {
                    withAnimation {
                      viewModel.deleteLabel(dataService: dataService, labelID: labelID)
                    }
                  }
                  self.labelToRemoveID = nil
                }
                Button("Cancel", role: .cancel) { self.labelToRemoveID = nil }
              }
          }
        } else {
          Form { innerBody }
        }

      #elseif os(macOS)
        List {
          innerBody
        }
        .listStyle(InsetListStyle())
      #endif
    }
    .onAppear { viewModel.loadLabels(dataService: dataService, item: nil) }
  }

  private var innerBody: some View {
    Group {
      Section(footer: Text(footerText)) {
        Button(
          action: { viewModel.showCreateEmailModal = true },
          label: {
            HStack {
              Image(systemName: "plus.circle.fill").foregroundColor(.green)
              Text("Create a new Label").foregroundColor(.appGrayTextContrast)
              Spacer()
            }
          }
        )
        .disabled(viewModel.isLoading)
      }

      if !viewModel.labels.isEmpty {
        Section(header: Text("Labels")) {
          ForEach(viewModel.labels, id: \.id) { label in
            HStack {
              TextChip(feedItemLabel: label)
              Spacer()
              Button(
                action: {
                  labelToRemoveID = label.id
                  showDeleteConfirmation = true
                },
                label: { Image(systemName: "trash") }
              )
            }
          }
        }
      }
    }
    .navigationTitle("Labels")
    .sheet(isPresented: $viewModel.showCreateEmailModal) {
      CreateLabelView(viewModel: viewModel)
    }
  }
}

struct CreateLabelView: View {
  @EnvironmentObject var dataService: DataService
  @ObservedObject var viewModel: LabelsViewModel

  @State private var newLabelName = ""
  @State private var newLabelColor = Color.clear

  var body: some View {
    NavigationView {
      VStack(spacing: 16) {
        TextField("Label Name", text: $newLabelName)
          .keyboardType(.alphabet)
          .textFieldStyle(StandardTextFieldStyle())
        ColorPicker(
          newLabelColor == .clear ? "Select Color" : newLabelColor.description,
          selection: $newLabelColor
        )
        Button(
          action: {
            viewModel.createLabel(
              dataService: dataService,
              name: newLabelName,
              color: newLabelColor,
              description: nil
            )
          },
          label: { Text("Create") }
        )
        .buttonStyle(SolidCapsuleButtonStyle(color: .appDeepBackground, width: 300))
        .disabled(viewModel.isLoading || newLabelName.isEmpty || newLabelColor == .clear)
        Spacer()
      }
      .padding()
      .toolbar {
        ToolbarItem(placement: .automatic) {
          Button(
            action: { viewModel.showCreateEmailModal = false },
            label: {
              Image(systemName: "xmark")
                .foregroundColor(.appGrayTextContrast)
            }
          )
        }
      }
      .navigationTitle("Create New Label")
      .navigationBarTitleDisplayMode(.inline)
    }
  }
}
