import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

enum PDFProvider {
  static var pdfViewerProvider: ((URL, LinkedItem) -> AnyView)?
}

@MainActor final class LinkItemDetailViewModel: ObservableObject {
  @Published var item: LinkedItem
  @Published var webAppWrapperViewModel: WebAppWrapperViewModel?

  var subscriptions = Set<AnyCancellable>()

  init(item: LinkedItem) {
    self.item = item
  }

  func handleArchiveAction(dataService: DataService) {
    dataService.archiveLink(objectID: item.objectID, archived: !item.isArchived)
    Snackbar.show(message: !item.isArchived ? "Link archived" : "Link moved to Inbox")
  }

  func handleDeleteAction(dataService: DataService) {
    Snackbar.show(message: "Link removed")
    dataService.removeLink(objectID: item.objectID)
  }

  func updateItemReadStatus(dataService: DataService) {
    dataService.updateLinkReadingProgress(
      itemID: item.unwrappedID,
      readingProgress: item.isRead ? 0 : 100,
      anchorIndex: 0
    )
  }

  func loadWebAppWrapper(dataService: DataService, rawAuthCookie: String?) async {
    let viewer: Viewer? = await {
      if let currentViewer = dataService.currentViewer {
        return currentViewer
      }

      guard let viewerObjectID = try? await dataService.fetchViewer() else { return nil }

      var result: Viewer?

      await dataService.viewContext.perform {
        result = dataService.viewContext.object(with: viewerObjectID) as? Viewer
      }

      return result
    }()

    if let viewer = viewer {
      createWebAppWrapperViewModel(
        username: viewer.unwrappedUsername,
        dataService: dataService,
        rawAuthCookie: rawAuthCookie
      )
    }
  }

  func trackReadEvent() {
    EventTracker.track(
      .linkRead(
        linkID: item.unwrappedID,
        slug: item.unwrappedSlug,
        originalArticleURL: item.unwrappedPageURLString
      )
    )
  }

  private func createWebAppWrapperViewModel(username: String, dataService: DataService, rawAuthCookie: String?) {
    let baseURL = dataService.appEnvironment.webAppBaseURL

    let urlRequest = URLRequest.webRequest(
      baseURL: dataService.appEnvironment.webAppBaseURL,
      urlPath: "/app/\(username)/\(item.unwrappedSlug)",
      queryParams: ["isAppEmbedView": "true", "highlightBarDisabled": isMacApp ? "false" : "true"]
    )

    webAppWrapperViewModel = WebAppWrapperViewModel(
      webViewURLRequest: urlRequest,
      baseURL: baseURL,
      rawAuthCookie: rawAuthCookie
    )
  }
}

struct LinkItemDetailView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>

  static let navBarHeight = 50.0
  @ObservedObject private var viewModel: LinkItemDetailViewModel
  @State private var showFontSizePopover = false
  @State private var navBarVisibilityRatio = 1.0
  @State private var showDeleteConfirmation = false

  init(viewModel: LinkItemDetailViewModel) {
    self.viewModel = viewModel
  }

  var toggleReadStatusToolbarItem: some View {
    Button(
      action: {
        viewModel.updateItemReadStatus(dataService: dataService)
      },
      label: {
        Image(systemName: viewModel.item.isRead ? "line.horizontal.3.decrease.circle" : "checkmark.circle")
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

  var fontAdjustmentPopoverView: some View {
    FontSizeAdjustmentPopoverView(
      increaseFontAction: { viewModel.webAppWrapperViewModel?.sendIncreaseFontSignal = true },
      decreaseFontAction: { viewModel.webAppWrapperViewModel?.sendDecreaseFontSignal = true }
    )
  }

  // We always want this hidden but setting it to false initially
  // fixes a bug where SwiftUI searchable will always show the nav bar
  // if the search field is active when pushing.
  @State var hideNavBar = false

  var body: some View {
    #if os(iOS)
      if viewModel.item.isPDF {
        fixedNavBarReader
          .navigationBarHidden(hideNavBar)
          .task {
            hideNavBar = true
            viewModel.trackReadEvent()
          }
      } else {
        WebReaderContainerView(item: viewModel.item)
          .navigationBarHidden(hideNavBar)
          .task {
            hideNavBar = true
            viewModel.trackReadEvent()
          }
      }
    #else
      fixedNavBarReader
        .task { viewModel.trackReadEvent() }
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
              action: { viewModel.handleArchiveAction(dataService: dataService) },
              label: {
                Label(
                  viewModel.item.isArchived ? "Unarchive" : "Archive",
                  systemImage: viewModel.item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
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
  }

  #if os(iOS)
    @ViewBuilder private var hidingNavBarReader: some View {
      if let webAppWrapperViewModel = viewModel.webAppWrapperViewModel {
        ZStack {
          WebAppWrapperView(
            viewModel: webAppWrapperViewModel,
            navBarVisibilityRatioUpdater: {
              if $0 < 1 {
                showFontSizePopover = false
              }
              navBarVisibilityRatio = $0
            }
          )
          if showFontSizePopover {
            VStack {
              Color.clear
                .contentShape(Rectangle())
                .frame(height: LinkItemDetailView.navBarHeight)
              HStack {
                Spacer()
                fontAdjustmentPopoverView
                  .background(Color.appButtonBackground)
                  .cornerRadius(8)
                  .padding(.trailing, 44)
              }
              Spacer()
            }
            .background(
              Color.clear
                .contentShape(Rectangle())
                .onTapGesture {
                  showFontSizePopover = false
                }
            )
          }
          VStack(spacing: 0) {
            navBar
            Spacer()
          }
        }
      } else {
        VStack(spacing: 0) {
          navBar
          Spacer()
        }
        .task {
          await viewModel.loadWebAppWrapper(
            dataService: dataService,
            rawAuthCookie: authenticator.omnivoreAuthCookieString
          )
        }
      }
    }
  #endif

  @ViewBuilder private var fixedNavBarReader: some View {
    if let pdfURL = viewModel.item.pdfURL {
      #if os(iOS)
        PDFProvider.pdfViewerProvider?(pdfURL, viewModel.item)
          .navigationBarTitleDisplayMode(.inline)
      #elseif os(macOS)
        PDFWrapperView(pdfURL: pdfURL)
      #endif
    } else if let webAppWrapperViewModel = viewModel.webAppWrapperViewModel {
      WebAppWrapperView(viewModel: webAppWrapperViewModel)
        .toolbar {
          ToolbarItem(placement: .automatic) {
            Button(
              action: { showFontSizePopover = true },
              label: {
                Image(systemName: "textformat.size")
              }
            )
            #if os(iOS)
              .fittedPopover(isPresented: $showFontSizePopover) {
                fontAdjustmentPopoverView
              }
            #else
              .popover(isPresented: $showFontSizePopover) {
                fontAdjustmentPopoverView
              }
            #endif
          }
        }
    } else {
      HStack(alignment: .center) {
        Spacer()
        Text("Loading...")
        Spacer()
      }
      .task {
        await viewModel.loadWebAppWrapper(
          dataService: dataService,
          rawAuthCookie: authenticator.omnivoreAuthCookieString
        )
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
