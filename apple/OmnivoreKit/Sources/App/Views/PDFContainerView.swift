import Combine
import Models
import SwiftUI
import Utils
import Services

@MainActor final class PDFContainerViewModel: ObservableObject {
  func trackReadEvent(item: Models.LibraryItem, reader: String) {
    let itemID = item.unwrappedID
    let slug = item.unwrappedSlug
    let originalArticleURL = item.unwrappedPageURLString

    EventTracker.track(
      .linkRead(
        linkID: itemID,
        slug: slug,
        reader: reader,
        originalArticleURL: originalArticleURL
      )
    )
  }
}

struct PDFContainerView: View {
  let item: Models.LibraryItem
  let pdfItem: PDFItem?


  @EnvironmentObject var dataService: DataService
  @StateObject private var viewModel = PDFContainerViewModel()

  init(item: Models.LibraryItem) {
    self.item = item
    self.pdfItem = PDFItem.make(item: item)
  }

  var body: some View {
        NavigationView {
          pdfContainerView
            .navigationBarBackButtonHidden(false)
        }
        .navigationViewStyle(.stack)
    .ignoresSafeArea(.all, edges: .bottom)
    .onAppear {
      viewModel.trackReadEvent(item: item, reader: "PDF")
    }
  }

  @ViewBuilder private var pdfContainerView: some View {
    if let pdfItem = pdfItem, let pdfURL = pdfItem.pdfURL {
      #if os(iOS)
        PDFViewer(viewModel: PDFViewerViewModel(pdfItem: pdfItem))
          .navigationBarTitleDisplayMode(.inline)
      #elseif os(macOS)
        PDFWrapperView(pdfURL: pdfURL)
      #endif
    } else {
      HStack(alignment: .center) {
        Spacer()
        Text("Loading")
        Spacer()
      }
    }
  }
  
}
