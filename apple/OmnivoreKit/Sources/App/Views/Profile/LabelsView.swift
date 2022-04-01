import Combine
import Models
import Services
import SwiftUI
import Views

final class LabelsViewModel: ObservableObject {
  private var hasLoadedInitialLabels = false
  @Published var isLoading = false
  @Published var labels = [FeedItemLabel]()

  var subscriptions = Set<AnyCancellable>()

  func loadLabels(dataService: DataService) {
    isLoading = true

    dataService.labelsPublisher().sink(
      receiveCompletion: { _ in },
      receiveValue: { [weak self] result in
        self?.isLoading = false
        self?.labels = result
        self?.hasLoadedInitialLabels = true
      }
    )
    .store(in: &subscriptions)
  }

  func createLabel(dataService: DataService, name: String, color: Color, description: String?) {
    isLoading = true

    dataService.createLabelPublisher(
      name: name,
      color: color.hex ?? "",
      description: description
    ).sink(
      receiveCompletion: { [weak self] _ in
        self?.isLoading = false
      },
      receiveValue: { [weak self] result in
        self?.isLoading = false
        self?.labels.insert(result, at: 0)
      }
    )
    .store(in: &subscriptions)
  }
}

struct LabelsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = LabelsViewModel()

  @State private var newLabelName = ""
  @State private var newLabelColor = Color.clear

  let footerText = "Use labels to create curated collections of links."

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          innerBody
        }
      #elseif os(macOS)
        List {
          innerBody
        }
        .listStyle(InsetListStyle())
      #endif
    }
    .onAppear { viewModel.loadLabels(dataService: dataService) }
  }

  private var innerBody: some View {
    Group {
      Section(footer: Text(footerText)) {
        TextField("Label Name", text: $newLabelName)
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
          label: { Text("Create Label") }
        )
        .disabled(viewModel.isLoading || newLabelName.isEmpty || newLabelColor == .clear)
      }

      if !viewModel.labels.isEmpty {
        Section(header: Text("Labels")) {
          ForEach(viewModel.labels, id: \.id) { label in
            Text(label.name)
          }
        }
      }
    }
    .navigationTitle("Labels")
  }
}
