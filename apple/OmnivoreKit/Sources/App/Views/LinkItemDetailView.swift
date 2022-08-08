import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class LinkItemDetailViewModel: ObservableObject {
  @Published var pdfItem: PDFItem?
  @Published var item: LinkedItem?

  func loadItem(linkedItemObjectID: NSManagedObjectID, dataService: DataService) async {
    let item = await dataService.viewContext.perform {
      dataService.viewContext.object(with: linkedItemObjectID) as? LinkedItem
    }

    if let item = item {
      pdfItem = PDFItem.make(item: item)
      self.item = item
    }

    trackReadEvent()
  }

  func handleArchiveAction(dataService: DataService) {
    guard let objectID = item?.objectID ?? pdfItem?.objectID else { return }
    dataService.archiveLink(objectID: objectID, archived: !isItemArchived)
    Snackbar.show(message: !isItemArchived ? "Link archived" : "Link moved to Inbox")
  }

  func handleDeleteAction(dataService: DataService) {
    guard let objectID = item?.objectID ?? pdfItem?.objectID else { return }
    Snackbar.show(message: "Link removed")
    dataService.removeLink(objectID: objectID)
  }

  func updateItemReadStatus(dataService: DataService) {
    guard let itemID = item?.unwrappedID ?? pdfItem?.itemID else { return }

    dataService.updateLinkReadingProgress(
      itemID: itemID,
      readingProgress: isItemRead ? 0 : 100,
      anchorIndex: 0
    )
  }

  private func trackReadEvent() {
    guard let itemID = item?.unwrappedID ?? pdfItem?.itemID else { return }
    guard let slug = item?.unwrappedSlug ?? pdfItem?.slug else { return }
    guard let originalArticleURL = item?.unwrappedPageURLString ?? pdfItem?.originalArticleURL else { return }

    EventTracker.track(
      .linkRead(
        linkID: itemID,
        slug: slug,
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
  @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>

  static let navBarHeight = 50.0
  let linkedItemObjectID: NSManagedObjectID
  let isPDF: Bool

  @StateObject private var viewModel = LinkItemDetailViewModel()
  @State private var showFontSizePopover = false
  @State private var showTitleEdit = false
  @State private var navBarVisibilityRatio = 1.0
  @State private var showDeleteConfirmation = false

  init(linkedItemObjectID: NSManagedObjectID, isPDF: Bool) {
    self.linkedItemObjectID = linkedItemObjectID
    self.isPDF = isPDF
  }

  var toggleReadStatusToolbarItem: some View {
    Button(
      action: {
        viewModel.updateItemReadStatus(dataService: dataService)
      },
      label: {
        Image(systemName: viewModel.isItemRead ? "line.horizontal.3.decrease.circle" : "checkmark.circle")
      }
    )
  }

  var removeLinkToolbarItem: some View {
    Button(
      action: { print("delete item action") },
      label: {
        Image(systemName: "trash")
      }
    )
  }

  var body: some View {
    ZStack { // Using ZStack so .task can be used on if/else body
      if isPDF {
        pdfContainerView
      } else if let item = viewModel.item {
        WebReaderContainerView(item: item)
      }
    }
    .task {
      await viewModel.loadItem(linkedItemObjectID: linkedItemObjectID, dataService: dataService)
    }
    #if os(iOS)
      .navigationBarHidden(true)
    #endif
  }

  var navBar: some View {
    HStack(alignment: .center) {
      Button(
        action: { self.presentationMode.wrappedValue.dismiss() },
        label: {
          Image(systemName: "chevron.backward")
            .font(.appTitleTwo)
            .foregroundColor(.appGrayTextContrast)
            .padding(.horizontal)
        }
      )
      .scaleEffect(navBarVisibilityRatio)
      Spacer()
      Button(
        action: { showFontSizePopover.toggle() },
        label: {
          Image(systemName: "textformat.size")
            .font(.appTitleTwo)
        }
      )
      .padding(.horizontal)
      .scaleEffect(navBarVisibilityRatio)
      Menu(
        content: {
          Group {
            Button(
              action: { showTitleEdit = true },
              label: { Label("Edit Title/Description", systemImage: "textbox") }
            )
            Button(
              action: { viewModel.handleArchiveAction(dataService: dataService) },
              label: {
                Label(
                  viewModel.isItemArchived ? "Unarchive" : "Archive",
                  systemImage: viewModel.isItemArchived ? "tray.and.arrow.down.fill" : "archivebox"
                )
              }
            )
            Button(
              action: { showDeleteConfirmation = true },
              label: { Label("Delete", systemImage: "trash") }
            )
          }
        },
        label: {
          Image.profile
            .padding(.horizontal)
            .scaleEffect(navBarVisibilityRatio)
        }
      )
    }
    .frame(height: readerViewNavBarHeight * navBarVisibilityRatio)
    .opacity(navBarVisibilityRatio)
    .background(Color.systemBackground)
    .onTapGesture {
      showFontSizePopover = false
    }
    .alert("Are you sure?", isPresented: $showDeleteConfirmation) {
      Button("Remove Link", role: .destructive) {
        viewModel.handleDeleteAction(dataService: dataService)
      }
      Button("Cancel", role: .cancel, action: {})
    }
    .sheet(isPresented: $showTitleEdit) {
      if let item = viewModel.item {
        LinkedItemTitleEditView(item: item)
      }
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
        Text("Loading...")
        Spacer()
      }
    }
  }
}

#if os(iOS)
  // Enable swipe to go back behavior if nav bar is hidden
  extension UINavigationController: UIGestureRecognizerDelegate {
    override open func viewDidLoad() {
      super.viewDidLoad()
      interactivePopGestureRecognizer?.delegate = self
    }

    public func gestureRecognizerShouldBegin(_: UIGestureRecognizer) -> Bool {
      viewControllers.count > 1
    }
  }
#endif
