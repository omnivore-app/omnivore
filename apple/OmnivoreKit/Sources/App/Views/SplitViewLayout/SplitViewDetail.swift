import Models
import SwiftUI
import Utils
import Views
import Services
import CoreData
import Models
import WebKit

struct PDFDetailView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject private var viewModel = LinkItemDetailViewModel()
  
  let pdfObjectID: NSManagedObjectID
  
  var body: some View {
    if let pdfItem = viewModel.pdfItem, pdfItem.objectID == pdfObjectID {
      PDFViewer(viewModel: PDFViewerViewModel(pdfItem: pdfItem))
        .navigationBarTitleDisplayMode(.inline)
    } else {
      HStack(alignment: .center) {
        Spacer()
        Text(LocalText.genericLoading)
        Spacer()
      }
      .task {
        await viewModel.loadItem(linkedItemObjectID: pdfObjectID, dataService: dataService)
      }
    }
  }
}

struct LinkedItemDetailView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject private var viewModel = LinkItemDetailViewModel()
  
  let linkedItemObjectID: NSManagedObjectID
  
  var body: some View {
    Group {
      if let item = viewModel.item, item.objectID == linkedItemObjectID {
        WebReaderDetailContainerView(item: item)
      } else {
        Text("")
          .task {
            await viewModel.loadItem(linkedItemObjectID: linkedItemObjectID, dataService: dataService)
          }
      }
    }
  }
}

// swiftlint:disable file_length type_body_length
struct WebReaderDetailContainerView: View {
  let item: LinkedItem

  @State private var showPreferencesPopover = false
  @State private var showPreferencesFormsheet = false
  @State private var showLabelsModal = false
  @State private var showHighlightLabelsModal = false
  @State private var showTitleEdit = false
  @State private var showNotebookView = false
  @State private var hasPerformedHighlightMutations = false
  @State var showHighlightAnnotationModal = false
  @State private var navBarVisibilityRatio = 1.0
  @State private var showDeleteConfirmation = false
  @State private var progressViewOpacity = 0.0
  @State var readerSettingsChangedTransactionID: UUID?
  @State var annotationSaveTransactionID: UUID?
  @State var showNavBarActionID: UUID?
  @State var shareActionID: UUID?
  @State var annotation = String()
  @State var showBottomBar = false
  @State private var bottomBarOpacity = 0.0
  @State private var errorAlertMessage: String?
  @State private var showErrorAlertMessage = false
  @State private var showRecommendSheet = false
  @State private var lastScrollPercentage: Int?

  @State var safariWebLink: SafariWebLink?
  @State var displayLinkSheet = false
  @State var linkToOpen: URL?

  @EnvironmentObject var dataService: DataService
  @Environment(\.openURL) var openURL
  @StateObject var viewModel = WebReaderViewModel()

  func webViewActionHandler(message: WKScriptMessage, replyHandler: WKScriptMessageReplyHandler?) {
    if let replyHandler = replyHandler {
      viewModel.webViewActionWithReplyHandler(
        message: message,
        replyHandler: replyHandler,
        dataService: dataService
      )
      return
    }

    if message.name == WebViewAction.highlightAction.rawValue {
      handleHighlightAction(message: message)
    }
  }

  func scrollPercentHandler(percent: Int) {
    lastScrollPercentage = percent
  }

  func onNotebookViewDismissal() {
    // Reload the web view if mutation happened in highlights list modal
    guard hasPerformedHighlightMutations else { return }

    hasPerformedHighlightMutations.toggle()

    Task {
      if let username = dataService.currentViewer?.username {
        await viewModel.loadContent(
          dataService: dataService,
          username: username,
          itemID: item.unwrappedID
        )
      }
    }
  }

  private func tapHandler() {
    withAnimation(.easeIn(duration: 0.08)) {
      navBarVisibilityRatio = navBarVisibilityRatio == 1 ? 0 : 1
      showBottomBar = navBarVisibilityRatio == 1
      showNavBarActionID = UUID()
    }
  }

  private func handleHighlightAction(message: WKScriptMessage) {
    guard let messageBody = message.body as? [String: String] else { return }
    guard let actionID = messageBody["actionID"] else { return }

    switch actionID {
    case "annotate":
      annotation = messageBody["annotation"] ?? ""
      showHighlightAnnotationModal = true
    case "noteCreated":
      showHighlightAnnotationModal = false
    case "highlightError":
      errorAlertMessage = messageBody["error"] ?? "An error occurred."
      showErrorAlertMessage = true
    case "setHighlightLabels":
      annotation = messageBody["highlightID"] ?? ""
      showHighlightLabelsModal = true
    case "pageTapped":
      withAnimation {
        navBarVisibilityRatio = navBarVisibilityRatio == 1 ? 0 : 1
        showBottomBar = navBarVisibilityRatio == 1
        showNavBarActionID = UUID()
      }
    default:
      break
    }
  }

  var bottomButtons: some View {
    HStack(alignment: .center) {
      Button(action: archive, label: {
        Image(systemName: item.isArchived ? "tray.and.arrow.down" : "archivebox")
      }).frame(width: 48, height: 48)
        .padding(.leading, 8)
      Divider().opacity(0.8)

      Button(action: delete, label: {
        Image(systemName: "trash")
      }).frame(width: 48, height: 48)
      Divider().opacity(0.8)

      Button(action: editLabels, label: {
        Image(systemName: "tag")
      }).frame(width: 48, height: 48)
      Divider().opacity(0.8)

      Button(action: recommend, label: {
        Image(systemName: "sparkles")
      }).frame(width: 48, height: 48)

        // We don't have a single note function yet
//      Divider()
//
//      Button(action: addNote, label: {
//        Image(systemName: "note")
//      }).frame(width: 48, height: 48)
        .padding(.trailing, 8)
    }.foregroundColor(.appGrayTextContrast)
  }


  func menuItems(for item: LinkedItem) -> some View {
    let hasLabels = item.labels?.count != 0
    return Group {
      Button(
        action: { showTitleEdit = true },
        label: { Label("Edit Info", systemImage: "info.circle") }
      )
      Button(
        action: editLabels,
        label: { Label(hasLabels ? "Edit Labels" : "Add Labels", systemImage: "tag") }
      )
      Button(
        action: {
          archive()
        },
        label: {
          Label(
            item.isArchived ? "Unarchive" : "Archive",
            systemImage: item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
          )
        }
      )
      Button(
        action: {
          dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 0, anchorIndex: 0)
        },
        label: { Label("Reset Read Location", systemImage: "arrow.counterclockwise.circle") }
      )

      if viewModel.hasOriginalUrl(item) {
        Button(
          action: {
            openOriginalURL(urlString: item.pageURLString)
          },
          label: { Label("Open Original", systemImage: "safari") }
        )
        Button(
          action: share,
          label: { Label("Share Original", systemImage: "square.and.arrow.up") }
        )
      }
      Button(
        action: delete,
        label: { Label("Delete", systemImage: "trash") }
      )
      Button(
        action: {
          showRecommendSheet = true
        },
        label: { Label("Recommend", systemImage: "sparkles") }
      )
    }
  }


  #if os(iOS)
    var webPreferencesPopoverView: some View {
      WebPreferencesPopoverView(
        updateReaderPreferences: { readerSettingsChangedTransactionID = UUID() },
        dismissAction: { showPreferencesPopover = false }
      )
    }
  #endif

  var body: some View {
    ZStack {
      if let articleContent = viewModel.articleContent {
        WebReader(
          item: item,
          articleContent: articleContent,
          openLinkAction: {
            #if os(macOS)
              NSWorkspace.shared.open($0)
            #elseif os(iOS)
              if UIDevice.current.userInterfaceIdiom == .phone, $0.absoluteString != item.unwrappedPageURLString {
                linkToOpen = $0
                displayLinkSheet = true
              } else {
                safariWebLink = SafariWebLink(id: UUID(), url: $0)
              }
            #endif
          },
          tapHandler: tapHandler,
          scrollPercentHandler: scrollPercentHandler,
          webViewActionHandler: webViewActionHandler,
          navBarVisibilityRatioUpdater: {
            navBarVisibilityRatio = $0
          },
          readerSettingsChangedTransactionID: $readerSettingsChangedTransactionID,
          annotationSaveTransactionID: $annotationSaveTransactionID,
          showNavBarActionID: $showNavBarActionID,
          shareActionID: $shareActionID,
          annotation: $annotation,
          showBottomBar: $showBottomBar,
          showHighlightAnnotationModal: $showHighlightAnnotationModal
        )
        .background(ThemeManager.currentBgColor)
        .onAppear {
          if item.isUnread {
            dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 0.1, anchorIndex: 0)
          }
        }
        .confirmationDialog(linkToOpen?.absoluteString ?? "", isPresented: $displayLinkSheet) {
          Button(action: {
            if let linkToOpen = linkToOpen {
              safariWebLink = SafariWebLink(id: UUID(), url: linkToOpen)
            }
          }, label: { Text(LocalText.genericOpen) })
          Button(action: {
            #if os(iOS)
              UIPasteboard.general.string = item.unwrappedPageURLString
            #else
//            Pasteboard.general.string = item.unwrappedPageURLString TODO: fix for mac
            #endif
            showInSnackbar("Link Copied")
          }, label: { Text(LocalText.readerCopyLink) })
          Button(action: {
            if let linkToOpen = linkToOpen {
              viewModel.saveLink(dataService: dataService, url: linkToOpen)
            }
          }, label: { Text(LocalText.readerSave) })
        }
        #if os(iOS)
          .fullScreenCover(item: $safariWebLink) {
            SafariView(url: $0.url)
          }
        #endif
        .alert(errorAlertMessage ?? LocalText.readerError, isPresented: $showErrorAlertMessage) {
          Button(LocalText.genericOk, role: .cancel, action: {
            errorAlertMessage = nil
            showErrorAlertMessage = false
          })
        }
        #if os(iOS)
          .formSheet(isPresented: $showRecommendSheet) {
            let highlightCount = item.highlights.asArray(of: Highlight.self).filter(\.createdByMe).count

            NavigationView {
              RecommendToView(
                dataService: dataService,
                viewModel: RecommendToViewModel(pageID: item.unwrappedID,
                                                highlightCount: highlightCount)
              )
            }.onDisappear {
              showRecommendSheet = false
            }
          }
        #endif
        .sheet(isPresented: $showHighlightAnnotationModal) {
          NavigationView {
            HighlightAnnotationSheet(
              annotation: $annotation,
              onSave: {
                annotationSaveTransactionID = UUID()
              },
              onCancel: {
                showHighlightAnnotationModal = false
              },
              errorAlertMessage: $errorAlertMessage,
              showErrorAlertMessage: $showErrorAlertMessage
            )
          }
        }
        .sheet(isPresented: $showHighlightLabelsModal) {
          if let highlight = Highlight.lookup(byID: self.annotation, inContext: self.dataService.viewContext) {
            ApplyLabelsView(mode: .highlight(highlight), isSearchFocused: false) { selectedLabels in
              viewModel.setLabelsForHighlight(highlightID: highlight.unwrappedID,
                                              labelIDs: selectedLabels.map(\.unwrappedID),
                                              dataService: dataService)
            }
          }
        }
      } else if let errorMessage = viewModel.errorMessage {
        Text(errorMessage).padding()
      } else {
        ProgressView()
          .opacity(progressViewOpacity)
          .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1000)) {
              progressViewOpacity = 1
            }
          }
          .task {
            if let username = dataService.currentViewer?.username {
              await viewModel.loadContent(
                dataService: dataService,
                username: username,
                itemID: item.unwrappedID
              )
            } else {
              viewModel.errorMessage = "You are not logged in."
            }
          }
      }
      #if os(iOS)
        VStack(spacing: 0) {
          Spacer()
          if showBottomBar {
            bottomButtons
              .frame(height: 48)
              .background(Color.webControlButtonBackground)
              .cornerRadius(6)
              .padding(.bottom, 34)
              .shadow(color: .gray.opacity(0.13), radius: 8, x: 0, y: 4)
              .opacity(bottomBarOpacity)
              .onAppear {
                withAnimation(Animation.linear(duration: 0.25)) { self.bottomBarOpacity = 1 }
              }
              .onDisappear {
                self.bottomBarOpacity = 0
              }
          }
        }
      #endif
    }
    .onAppear {
      try? WebViewManager.shared().dispatchEvent(.saveReadPosition)
    }
    .onDisappear {
      // WebViewManager.shared().loadHTMLString("<html></html>", baseURL: nil)
      WebViewManager.shared().loadHTMLString(WebReaderContent.emptyContent(isDark: Color.isDarkMode), baseURL: nil)
    }
  }

  func archive() {
    dataService.archiveLink(objectID: item.objectID, archived: !item.isArchived)
    Snackbar.show(message: !item.isArchived ? "Link archived" : "Link moved to Inbox")
  }

  func recommend() {
    showRecommendSheet = true
  }

  func share() {
    shareActionID = UUID()
  }

  func delete() {
    showDeleteConfirmation = true
  }

  func editLabels() {
    showLabelsModal = true
  }

  func scrollToTop() {}

  func openOriginalURL(urlString: String?) {
    guard
      let urlString = urlString,
      let url = URL(string: urlString)
    else { return }

    openURL(url)
  }
}
