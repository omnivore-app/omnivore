import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class WebReaderLoadingContainerViewModel: ObservableObject {
  @Published var item: LinkedItem?
  @Published var errorMessage: String?

  func loadItem(dataService: DataService, username: String, requestID: String) async {
    guard let objectID = try? await dataService.loadItemContentUsingRequestID(username: username,
                                                                              requestID: requestID)
    else {
      return
    }
    item = dataService.viewContext.object(with: objectID) as? LinkedItem
  }

  func trackReadEvent() {
    guard let item = item else { return }

    EventTracker.track(
      .linkRead(
        linkID: item.unwrappedID,
        slug: item.unwrappedSlug,
        originalArticleURL: item.unwrappedPageURLString
      )
    )
  }
}

public struct WebReaderLoadingContainer: View {
  let requestID: String

  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = WebReaderLoadingContainerViewModel()

  public var body: some View {
    if let item = viewModel.item {
      if let pdfItem = PDFItem.make(item: item) {
        #if os(iOS)
          PDFViewer(viewModel: PDFViewerViewModel(pdfItem: pdfItem))
            .navigationBarHidden(true)
            .navigationViewStyle(.stack)
            .accentColor(.appGrayTextContrast)
            .task { viewModel.trackReadEvent() }
        #else
          if let pdfURL = pdfItem.pdfURL {
            PDFWrapperView(pdfURL: pdfURL)
          }
        #endif
      } else {
        WebReaderContainerView(item: item)
        #if os(iOS)
          .navigationBarHidden(true)
          .navigationViewStyle(.stack)
        #endif
        .accentColor(.appGrayTextContrast)
          .task { viewModel.trackReadEvent() }
      }
    } else if let errorMessage = viewModel.errorMessage {
      Text(errorMessage)
    } else {
      ProgressView()
        .task {
          if let username = dataService.currentViewer?.username {
            await viewModel.loadItem(dataService: dataService, username: username, requestID: requestID)
          } else {
            viewModel.errorMessage = "You are not logged in."
          }
        }
    }
  }
}
