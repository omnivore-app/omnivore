// swiftlint:disable line_length
import Foundation
import Models
import SwiftUI
import Views
import WebKit
import Services

@MainActor public final class ExplainViewModel: ObservableObject {
  @Published var isLoading = true
  @Published var explanation = ""

  func load(dataService: DataService, text: String, libraryItemId: String) async {
    isLoading = true

    do {
      
      explanation = try await dataService.explain(text: text, libraryItemId: libraryItemId)
    } catch {
      print("ERROR: ", error)
      explanation = "There was an error generating your explanation"
    }

    isLoading = false
  }
}

@MainActor
struct ExplainView: View {
  let dataService: DataService

  let text: String
  let item: Models.LibraryItem

  @StateObject var viewModel = ExplainViewModel()

  init(dataService: DataService, text: String, item: Models.LibraryItem) {
    self.text = text
    self.item = item
    self.dataService = dataService
  }

  var body: some View {
    if viewModel.isLoading {
      ProgressView()
        .task {
          await viewModel.load(dataService: dataService, text: text, libraryItemId: item.unwrappedID)
        }
    } else {
      Text(viewModel.explanation)
        .font(Font.system(size: 19))
        .lineSpacing(12)
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
  }
}
