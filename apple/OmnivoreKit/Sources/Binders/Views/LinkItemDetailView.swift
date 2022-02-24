import Combine
import Models
import Services
import SwiftUI
import Utils
import Views

// TODO: remove this view model
extension LinkItemDetailViewModel {
  static func make(feedItem: FeedItem, services: Services) -> LinkItemDetailViewModel {
    let viewModel = LinkItemDetailViewModel(item: feedItem)
    viewModel.bind(services: services)
    return viewModel
  }

  func bind(services: Services) {
    performActionSubject.sink { [weak self] action in
      switch action {
      case .load:
        self?.loadWebAppWrapper(services: services)
      case let .updateReadStatus(markAsRead: markAsRead):
        self?.updateItemReadStatus(markAsRead: markAsRead, dataService: services.dataService)
      }
    }
    .store(in: &subscriptions)
  }

  private func updateItemReadStatus(markAsRead: Bool, dataService: DataService) {
    dataService
      .updateArticleReadingProgressPublisher(
        itemID: item.id,
        readingProgress: markAsRead ? 100 : 0,
        anchorIndex: 0
      )
      .sink { completion in
        guard case let .failure(error) = completion else { return }
        print(error)
      } receiveValue: { [weak self] feedItem in
        self?.item.readingProgress = feedItem.readingProgress
      }
      .store(in: &subscriptions)
  }

  private func loadWebAppWrapper(services: Services) {
    // Attempt to get `Viewer` from DataService
    if let currentViewer = services.dataService.currentViewer {
      createWebAppWrapperViewModel(username: currentViewer.username, services: services)
      return
    }

    services.dataService.viewerPublisher().sink(
      receiveCompletion: { completion in
        guard case let .failure(error) = completion else { return }
        print(error)
      },
      receiveValue: { [weak self] viewer in
        self?.createWebAppWrapperViewModel(username: viewer.username, services: services)
      }
    )
    .store(in: &subscriptions)
  }

  private func createWebAppWrapperViewModel(username: String, services: Services) {
    let baseURL = services.dataService.appEnvironment.webAppBaseURL

    let urlRequest = URLRequest.webRequest(
      baseURL: services.dataService.appEnvironment.webAppBaseURL,
      urlPath: "/app/\(username)/\(item.slug)",
      queryParams: ["isAppEmbedView": "true", "highlightBarDisabled": isMacApp ? "false" : "true"]
    )

    let newWebAppWrapperViewModel = WebAppWrapperViewModel(
      webViewURLRequest: urlRequest,
      baseURL: baseURL,
      rawAuthCookie: services.authenticator.omnivoreAuthCookieString
    )

    newWebAppWrapperViewModel.performActionSubject.sink { action in
      switch action {
      case let .shareHighlight(highlightID):
        print("show share modal for highlight with id: \(highlightID)")
      }
    }
    .store(in: &newWebAppWrapperViewModel.subscriptions)

    webAppWrapperViewModel = newWebAppWrapperViewModel
  }
}

enum PDFProvider {
  static var pdfViewerProvider: ((URL, FeedItem) -> AnyView)?
}

final class LinkItemDetailViewModel: ObservableObject {
  @Published var item: FeedItem
  @Published var webAppWrapperViewModel: WebAppWrapperViewModel?

  enum Action {
    case load
    case updateReadStatus(markAsRead: Bool)
  }

  var subscriptions = Set<AnyCancellable>()
  let performActionSubject = PassthroughSubject<Action, Never>()

  init(item: FeedItem) {
    self.item = item
  }
}

struct LinkItemDetailView: View {
  @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>

  static let navBarHeight = 50.0
  @ObservedObject private var viewModel: LinkItemDetailViewModel
  @State private var showFontSizePopover = false
  @State private var navBarVisibilityRatio = 1.0

  init(viewModel: LinkItemDetailViewModel) {
    self.viewModel = viewModel
  }

  var toggleReadStatusToolbarItem: some View {
    Button(
      action: { viewModel.performActionSubject.send(.updateReadStatus(markAsRead: !viewModel.item.isRead)) },
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

  var body: some View {
    #if os(iOS)
      if UIDevice.isIPhone, !viewModel.item.isPDF {
        compactInnerBody
      } else {
        innerBody
      }
    #else
      innerBody
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
    }
    .frame(height: LinkItemDetailView.navBarHeight * navBarVisibilityRatio)
    .opacity(navBarVisibilityRatio)
    .background(Color.systemBackground)
  }

  #if os(iOS)
    @ViewBuilder private var compactInnerBody: some View {
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
                  .padding(.trailing, 5)
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
        .navigationBarHidden(true)
      } else {
        VStack(spacing: 0) {
          navBar
          Spacer()
        }
        .onAppear {
          viewModel.performActionSubject.send(.load)
        }
        .navigationBarHidden(true)
      }
    }
  #endif

  @ViewBuilder private var innerBody: some View {
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
      .onAppear {
        viewModel.performActionSubject.send(.load)
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
