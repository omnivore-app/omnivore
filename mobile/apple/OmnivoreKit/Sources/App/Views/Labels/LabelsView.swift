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

  @Environment(\.dismiss) private var dismiss

  @AppStorage(UserDefaultKey.hideSystemLabels.rawValue) var hideSystemLabels = false

  var body: some View {
    List {
      Section {
        ForEach(viewModel.labels, id: \.id) { label in
          HStack {
            TextChip(feedItemLabel: label).allowsHitTesting(false)
            Spacer()
            if !isSystemLabel(label) {
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
        createLabelButton
      }
      Section("Label settings") {
        Toggle("Hide system labels", isOn: $hideSystemLabels)
      }
    }
    .navigationTitle(LocalText.labelsGeneric)
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
      Button(LocalText.cancelGeneric, role: .cancel) { self.labelToRemove = nil }
    }
    .onChange(of: hideSystemLabels) { newValue in
      PublicValet.hideLabels = newValue

      Task {
        await viewModel.loadLabels(dataService: dataService, item: nil)
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: Notification.Name("ScrollToTop"))) { _ in
      dismiss()
    }
    .sheet(isPresented: $viewModel.showCreateLabelModal) {
      CreateLabelView(viewModel: viewModel, newLabelName: viewModel.labelSearchFilter)
    }
    .task { await viewModel.loadLabels(dataService: dataService, item: nil) }
  }

  var createLabelButton: some View {
    Button(
      action: { viewModel.showCreateLabelModal = true },
      label: {
        Label(title: {
          let trimmedLabelName = viewModel.labelSearchFilter.trimmingCharacters(in: .whitespacesAndNewlines)
          Text(
            viewModel.labelSearchFilter.count > 0 && viewModel.labelSearchFilter != ZWSP ?
              "Create: \"\(trimmedLabelName)\" label" :
              LocalText.createLabelMessage
          )
        }, icon: {
          Image.addLink
        })
      }
    )
    .disabled(viewModel.isLoading)
  }
}

struct CreateLabelView: View {
  @EnvironmentObject var dataService: DataService
  @ObservedObject var viewModel: LabelsViewModel

  @State private var newLabelName: String
  @State private var newLabelColor = Color.clear

  init(viewModel: LabelsViewModel, newLabelName: String = "") {
    self.viewModel = viewModel
    self.newLabelName = newLabelName
  }

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

  var innerBody: some View {
    VStack {
      TextField(LocalText.labelNamePlaceholder, text: $newLabelName)
        .textFieldStyle(StandardTextFieldStyle())
        .onChange(of: newLabelName) { inputLabelName in
          newLabelName = String(inputLabelName.prefix(viewModel.labelNameMaxLength))
        }

      Text("\(newLabelName.count)/\(viewModel.labelNameMaxLength)")
        .font(.caption)
        .frame(maxWidth: .infinity, alignment: .trailing)
        .foregroundColor(newLabelName.count < viewModel.labelNameMaxLength ? .gray : .red)

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
      #if os(iOS)
        ToolbarItem(placement: .barLeading) {
          cancelCreateLabelButton
        }
        ToolbarItem(placement: .barTrailing) {
          createLabelButton
        }
      #else
        ToolbarItemGroup {
          createLabelButton
          cancelCreateLabelButton
        }
      #endif
    }
  }

  var cancelCreateLabelButton: some View {
    Button(
      action: { viewModel.showCreateLabelModal = false },
      label: { Text(LocalText.cancelGeneric).foregroundColor(.appGrayTextContrast) }
    )
  }

  var createLabelButton: some View {
    Button(
      action: {
        viewModel.createLabel(
          dataService: dataService,
          name: newLabelName,
          color: newLabelColor,
          description: nil
        )
      },
      label: { Text(LocalText.genericCreate).foregroundColor(.appGrayTextContrast) }
    )
    .opacity(shouldDisableCreateButton ? 0.2 : 1)
    .disabled(shouldDisableCreateButton)
  }

  var body: some View {
    #if os(iOS)
      NavigationView {
        innerBody
          .navigationTitle("Create New Label")
          .navigationBarTitleDisplayMode(.inline)
          .task {
            newLabelColor = swatches.first ?? .clear
          }
      }
    #else
      innerBody
        .task {
          newLabelColor = swatches.first ?? .clear
        }
    #endif
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
