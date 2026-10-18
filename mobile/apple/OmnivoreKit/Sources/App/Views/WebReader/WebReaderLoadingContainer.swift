import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class WebReaderLoadingContainerViewModel: ObservableObject {
  @Published var item: Models.LibraryItem?
  @Published var errorMessage: String?

  func loadItem(dataService: DataService, username: String, requestID: String) async {
    if let cached = Models.LibraryItem.lookup(byID: requestID, inContext: dataService.viewContext) {
      item = cached
      return
    }

    guard let objectID = try? await dataService.loadItemContentUsingRequestID(username: username,
                                                                              requestID: requestID)
    else {
      errorMessage = "Item is no longer available"
      return
    }
    item = dataService.viewContext.object(with: objectID) as? Models.LibraryItem
  }

  func trackReadEvent() {
    guard let item = item else { return }

    EventTracker.track(
      .linkRead(
        linkID: item.unwrappedID,
        slug: item.unwrappedSlug,
        reader: "WEB",
        originalArticleURL: item.unwrappedPageURLString
      )
    )
  }
}

public struct WebReaderLoadingContainer: View {
  let requestID: String

  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @StateObject var viewModel = WebReaderLoadingContainerViewModel()
  @Environment(\.presentationCoordinator) var presentationCoordinator

  public var body: some View {
    if let item = viewModel.item {
      if let pdfItem = PDFItem.make(item: item) {
        #if os(iOS)
        NavigationView {
          PDFViewer(viewModel: PDFViewerViewModel(pdfItem: pdfItem))
            .navigationBarHidden(true)
            .navigationViewStyle(.stack)
            .accentColor(.appGrayTextContrast)
            .onAppear { viewModel.trackReadEvent() }
        }
        #else
          if let pdfURL = pdfItem.pdfURL {
            PDFWrapperView(pdfURL: pdfURL)
          }
        #endif
      } else {
        WebReaderContainerView(item: item)
        #if os(iOS)
          .navigationViewStyle(.stack)
        #endif
        .accentColor(.appGrayTextContrast)
          .onAppear { viewModel.trackReadEvent() }
      }
    } else if let errorMessage = viewModel.errorMessage {
      NavigationView {
        VStack(spacing: 15) {
          Text(errorMessage)
          Button(action: {
            presentationCoordinator.dismiss()
          }, label: {
            Text("Dismiss")
          })
        }
      }
#if os(iOS)
  .navigationViewStyle(.stack)
#endif
    } else {
      ProgressView()
        .task {
          await viewModel.loadItem(dataService: dataService, username: "me", requestID: requestID)
        }
    }
  }
}
