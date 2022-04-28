import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

struct LabelsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = LabelsViewModel()
  @State private var showDeleteConfirmation = false
  @State private var labelToRemove: LinkedItemLabel?

  let footerText = "Use labels to create curated collections of links."

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          innerBody
            .alert("Are you sure you want to delete this label?", isPresented: $showDeleteConfirmation) {
              Button("Delete Label", role: .destructive) {
                if let label = labelToRemove {
                  withAnimation {
                    viewModel.deleteLabel(
                      dataService: dataService,
                      labelID: label.unwrappedID,
                      name: label.unwrappedName
                    )
                  }
                }
                self.labelToRemove = nil
              }
              Button("Cancel", role: .cancel) { self.labelToRemove = nil }
            }
        }
      #elseif os(macOS)
        List {
          innerBody
        }
        .listStyle(InsetListStyle())
      #endif
    }
    .task { await viewModel.loadLabels(dataService: dataService, item: nil) }
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
                  labelToRemove = label
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

  var shouldDisableCreateButton: Bool {
    viewModel.isLoading || newLabelName.isEmpty || newLabelColor == .clear
  }

  let rows = [
    GridItem(.fixed(60)),
    GridItem(.fixed(60)),
    GridItem(.fixed(70))
  ]

  let swatches: [Color] = {
    let webSwatches = webSwatchHexes.map { Color(hex: $0) ?? .clear }
    var additionalSwatches = swatchHexes.map { Color(hex: $0) ?? .clear }.shuffled()
    let firstSwatch = additionalSwatches.remove(at: 0)
    return [firstSwatch] + webSwatches + additionalSwatches
  }()

  var body: some View {
    NavigationView {
      VStack {
        HStack {
          if !newLabelName.isEmpty, newLabelColor != .clear {
            TextChip(text: newLabelName, color: newLabelColor)
          } else {
            Text("Assign a name and color.").font(.appBody)
          }
          Spacer()
        }
        .padding(.bottom, 8)

        TextField("Label Name", text: $newLabelName)
        #if os(iOS)
          .keyboardType(.alphabet)
        #endif
        .textFieldStyle(StandardTextFieldStyle())

        ScrollView(.horizontal, showsIndicators: false) {
          LazyHGrid(rows: rows, alignment: .top, spacing: 20) {
            ForEach(swatches, id: \.self) { swatch in
              ZStack {
                Circle()
                  .fill(swatch)
                  .frame(width: 50, height: 50)
                  .onTapGesture {
                    newLabelColor = swatch
                  }
                  .padding(10)

                if newLabelColor == swatch {
                  Circle()
                    .stroke(swatch, lineWidth: 5)
                    .frame(width: 60, height: 60)
                }
              }
            }
          }
        }
        Spacer()
      }
      .padding()
      .toolbar {
        ToolbarItem(placement: .barLeading) {
          Button(
            action: { viewModel.showCreateEmailModal = false },
            label: { Text("Cancel").foregroundColor(.appGrayTextContrast) }
          )
        }
        ToolbarItem(placement: .barTrailing) {
          Button(
            action: {
              viewModel.createLabel(
                dataService: dataService,
                name: newLabelName,
                color: newLabelColor,
                description: nil
              )
            },
            label: { Text("Create").foregroundColor(.appGrayTextContrast) }
          )
          .opacity(shouldDisableCreateButton ? 0.2 : 1)
          .disabled(shouldDisableCreateButton)
        }
      }
      .navigationTitle("Create New Label")
      #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
      #endif
      .onAppear {
        newLabelColor = swatches.first ?? .clear
      }
    }
  }
}

private let webSwatchHexes = [
  "#FF5D99",
  "#7CFF7B",
  "#FFD234",
  "#7BE4FF",
  "#CE88EF",
  "#EF8C43"
]

private let swatchHexes = [
  "#fff034",
  "#efff34",
  "#d1ff34",
  "#b2ff34",
  "#94ff34",
  "#75ff34",
  "#57ff34",
  "#38ff34",
  "#34ff4e",
  "#34ff6d",
  "#34ff8b",
  "#34ffa9",
  "#34ffc8",
  "#34ffe6",
  "#34f9ff",
  "#34dbff",
  "#34bcff",
  "#349eff",
  "#347fff",
  "#3461ff",
  "#3443ff",
  "#4434ff",
  "#6234ff",
  "#8134ff",
  "#9f34ff",
  "#be34ff",
  "#dc34ff",
  "#fb34ff",
  "#ff34e5",
  "#ff34c7",
  "#ff34a8",
  "#ff348a",
  "#ff346b"
]
