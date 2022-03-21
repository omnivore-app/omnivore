import Combine
import Models
import Services
import SwiftUI
import UIKit
import Utils
import Views
import WebKit

struct SafariWebLink: Identifiable {
  let id: UUID
  let url: URL
}

final class WebReaderViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var htmlContent: String?

  var subscriptions = Set<AnyCancellable>()

  func loadContent(dataService: DataService, slug: String) {
    isLoading = true

    guard let viewer = dataService.currentViewer else { return }

    dataService.articleContentPublisher(username: viewer.username, slug: slug).sink(
      receiveCompletion: { [weak self] completion in
        guard case .failure = completion else { return }
        self?.isLoading = false
      },
      receiveValue: { [weak self] htmlContent in
        self?.htmlContent = htmlContent
      }
    )
    .store(in: &subscriptions)
  }
}

struct WebReaderContainerView: View {
  let item: FeedItem

  @State private var showFontSizePopover = false
  @State var showHighlightAnnotationModal = false
  @State var safariWebLink: SafariWebLink?
  @State private var navBarVisibilityRatio = 1.0
  @State private var showDeleteConfirmation = false
  @State private var showOverlay = true
  @State var increaseFontActionID: UUID?
  @State var decreaseFontActionID: UUID?

  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var authenticator: Authenticator
  @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>
  @StateObject var viewModel = WebReaderViewModel()

  var fontAdjustmentPopoverView: some View {
    FontSizeAdjustmentPopoverView(
      increaseFontAction: { increaseFontActionID = UUID() },
      decreaseFontAction: { decreaseFontActionID = UUID() }
    )
  }

  var navBariOS14: some View {
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
    .frame(height: readerViewNavBarHeight * navBarVisibilityRatio)
    .opacity(navBarVisibilityRatio)
    .background(Color.systemBackground)
    .onTapGesture {
      showFontSizePopover = false
    }
  }

  @available(macOS 12.0, *)
  @available(iOS 15.0, *)
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
              action: {}, // ,viewModel.handleArchiveAction(dataService: dataService) },
              label: {
                Label(
                  item.isArchived ? "Unarchive" : "Archive",
                  systemImage: item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
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
//        viewModel.handleDeleteAction(dataService: dataService)
      }
      Button("Cancel", role: .cancel, action: {})
    }
  }

  var body: some View {
    ZStack {
      if let htmlContent = viewModel.htmlContent {
        WebReader(
          htmlContent: htmlContent,
          item: item,
          openLinkAction: { url in print(url) },
          webViewActionHandler: { _ in },
          navBarVisibilityRatioUpdater: {
            if $0 < 1 {
              showFontSizePopover = false
            }
            navBarVisibilityRatio = $0
          },
          authToken: authenticator.authToken ?? "",
          increaseFontActionID: $increaseFontActionID,
          decreaseFontActionID: $decreaseFontActionID,
          annotationSaveTransactionID: nil
        )
        .overlay(
          Group {
            if showOverlay {
              Color.systemBackground
                .transition(.opacity)
                .onAppear {
                  DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(250)) {
                    withAnimation(.linear(duration: 0.2)) {
                      showOverlay = false
                    }
                  }
                }
            }
          }
        )
      } else {
        Color.clear
          .contentShape(Rectangle())
          .onAppear {
            if !viewModel.isLoading {
              viewModel.loadContent(dataService: dataService, slug: item.slug)
            }
          }
      }
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
      if #available(iOS 15.0, *) {
        VStack(spacing: 0) {
          navBar
          Spacer()
        }
        .navigationBarHidden(true)
      } else {
        VStack(spacing: 0) {
          navBariOS14
          Spacer()
        }
        .navigationBarHidden(true)
      }

    }.onDisappear {
      // Clear the shared webview content when exiting
      WebViewManager.shared().loadHTMLString("<html></html>", baseURL: nil)
    }
    .navigationBarHidden(true)
  }
}

// TODO: implement things WebAppWrapperView does
struct WebReader: UIViewRepresentable {
  let htmlContent: String
  let item: FeedItem
  let openLinkAction: (URL) -> Void
  let webViewActionHandler: (WKScriptMessage) -> Void
  let navBarVisibilityRatioUpdater: (Double) -> Void
  let authToken: String

  @Binding var increaseFontActionID: UUID?
  @Binding var decreaseFontActionID: UUID?

  @State var annotationSaveTransactionID: UUID?
  @State private var annotation = String()

  func makeCoordinator() -> WebReaderCoordinator {
    WebReaderCoordinator()
  }

  func fontSize() -> Int {
    let storedSize = UserDefaults.standard.integer(forKey: UserDefaultKey.preferredWebFontSize.rawValue)
    return storedSize <= 1 ? UITraitCollection.current.preferredWebFontSize : storedSize
  }

  func makeUIView(context: Context) -> WKWebView {
    let webView = WebViewManager.create()
    let contentController = WKUserContentController()

    webView.loadHTMLString(
      WebReaderContent(
        htmlContent: htmlContent,
        item: item,
        authToken: authToken,
        isDark: UITraitCollection.current.userInterfaceStyle == .dark,
        fontSize: "\(fontSize())px",
        margin: "0"
      )
      .styledContent,
      baseURL: ViewsPackage.bundleURL
    )

    webView.navigationDelegate = context.coordinator
    webView.isOpaque = false
    webView.backgroundColor = .clear
    webView.configuration.userContentController = contentController
    webView.scrollView.delegate = context.coordinator
    webView.scrollView.contentInset.top = readerViewNavBarHeight
    webView.scrollView.verticalScrollIndicatorInsets.top = readerViewNavBarHeight

    for action in WebViewAction.allCases {
      webView.configuration.userContentController.add(context.coordinator, name: action.rawValue)
    }

    webView.configuration.userContentController.add(webView, name: "viewerAction")

//    webView.configureForOmnivoreAppEmbed(
//      config: WebViewConfig(
//        url: dataService.appEnvironment.webAppBaseURL,
//        themeId: UITraitCollection.current.userInterfaceStyle == .dark ? "Gray" : "LightGray",
//        margin: 0,
//        fontSize: fontSize(),
//        fontFamily: "inter",
//        rawAuthCookie: rawAuthCookie
//      )
//    )

    context.coordinator.linkHandler = openLinkAction
    context.coordinator.webViewActionHandler = webViewActionHandler
    context.coordinator.updateNavBarVisibilityRatio = navBarVisibilityRatioUpdater

    return webView
  }

  func updateUIView(_ webView: WKWebView, context: Context) {
    if annotationSaveTransactionID != context.coordinator.lastSavedAnnotationID {
      context.coordinator.lastSavedAnnotationID = annotationSaveTransactionID
      (webView as? WebView)?.saveAnnotation(annotation: annotation)
    }

    if increaseFontActionID != context.coordinator.previousIncreaseFontActionID {
      context.coordinator.previousIncreaseFontActionID = increaseFontActionID
      (webView as? WebView)?.increaseFontSize()
    }

    if decreaseFontActionID != context.coordinator.previousDecreaseFontActionID {
      context.coordinator.previousDecreaseFontActionID = decreaseFontActionID
      (webView as? WebView)?.decreaseFontSize()
    }
  }
}
