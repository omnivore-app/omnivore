import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class LinkItemDetailViewModel: ObservableObject {
  @Published var pdfItem: PDFItem?
  @Published var item: Models.LibraryItem?

  func loadItem(linkedItemObjectID: NSManagedObjectID, dataService: DataService) async {
    let item = await dataService.viewContext.perform {
      dataService.viewContext.object(with: linkedItemObjectID) as? Models.LibraryItem
    }

    if let item = item {
      pdfItem = PDFItem.make(item: item)
      self.item = item
      trackReadEvent(reader: item.isPDF ? "PDF" : "WEB")
    }
  }

  private func trackReadEvent(reader: String) {
    guard let itemID = item?.unwrappedID ?? pdfItem?.itemID else { return }
    guard let slug = item?.unwrappedSlug ?? pdfItem?.slug else { return }
    guard let originalArticleURL = item?.unwrappedPageURLString ?? pdfItem?.downloadURL else { return }

    EventTracker.track(
      .linkRead(
        linkID: itemID,
        slug: slug,
        reader: reader,
        originalArticleURL: originalArticleURL
      )
    )
  }

  var isItemRead: Bool {
    item?.isRead ?? pdfItem?.isRead ?? false
  }

  var isItemArchived: Bool {
    item?.isArchived ?? pdfItem?.isArchived ?? false
  }
}

struct LinkItemDetailView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService

  let linkedItemObjectID: NSManagedObjectID
  let isPDF: Bool

  @StateObject private var viewModel = LinkItemDetailViewModel()

  @State var isEnabled = true
  @Environment(\.dismiss) var dismiss

  init(linkedItemObjectID: NSManagedObjectID, isPDF: Bool) {
    self.linkedItemObjectID = linkedItemObjectID
    self.isPDF = isPDF
  }

  var body: some View {
    Group {
      if isPDF {
        NavigationView {
          pdfContainerView
            .navigationBarBackButtonHidden(false)
        }
        .navigationViewStyle(.stack)
      } else if let item = viewModel.item {
        WebReaderContainerView(item: item)
          .background(ThemeManager.currentBgColor)
      }
    }
    .ignoresSafeArea(.all, edges: .bottom)
    .task {
      await viewModel.loadItem(linkedItemObjectID: linkedItemObjectID, dataService: dataService)
    }
  }

  @ViewBuilder private var pdfContainerView: some View {
    if let pdfItem = viewModel.pdfItem, let pdfURL = pdfItem.pdfURL {
      #if os(iOS)
        PDFViewer(viewModel: PDFViewerViewModel(pdfItem: pdfItem))
          .navigationBarTitleDisplayMode(.inline)
      #elseif os(macOS)
        PDFWrapperView(pdfURL: pdfURL)
      #endif
    } else {
      HStack(alignment: .center) {
        Spacer()
        Text(LocalText.genericLoading)
        Spacer()
      }
    }
  }
}
