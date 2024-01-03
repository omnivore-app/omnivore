import AVFoundation
import Models
import PopupView
import Services
import SwiftUI
import Transmission
import Utils
import Views
import WebKit

// swiftlint:disable file_length type_body_length
struct WebReaderContainerView: View {
  let item: Models.LibraryItem
  let pop: () -> Void

  @State private var showPreferencesPopover = false
  @State private var showPreferencesFormsheet = false
  @State private var showLabelsModal = false
  @State private var showHighlightLabelsModal = false
  @State private var showTitleEdit = false
  @State private var showNotebookView = false
  @State private var hasPerformedHighlightMutations = false
  @State var showHighlightAnnotationModal = false
  @State private var navBarVisible = true
  @State private var progressViewOpacity = 0.0
  @State var readerSettingsChangedTransactionID: UUID?
  @State var annotationSaveTransactionID: UUID?
  @State var showNavBarActionID: UUID?
  @State var showExpandedAudioPlayer = false
  @State var shareActionID: UUID?
  @State var annotation = String()
  @State private var bottomBarOpacity = 0.0
  @State private var errorAlertMessage: String?
  @State private var showErrorAlertMessage = false
  @State private var showRecommendSheet = false
  @State private var showOpenArchiveSheet = false
  @State private var lastScrollPercentage: Int?
  @State private var isRecovering = false

  @State var safariWebLink: SafariWebLink?
  @State var displayLinkSheet = false
  @State var linkToOpen: URL?

  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController
  @Environment(\.openURL) var openURL
  @StateObject var viewModel = WebReaderViewModel()
  @Environment(\.dismiss) var dismiss

  @AppStorage(UserDefaultKey.prefersHideStatusBarInReader.rawValue) var prefersHideStatusBarInReader = false

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
      navBarVisible = !navBarVisible
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
        navBarVisible = !navBarVisible
        showNavBarActionID = UUID()
      }
    case "dismissNavBars":
      withAnimation {
        navBarVisible = false
        showNavBarActionID = UUID()
      }
    default:
      break
    }
  }

  #if os(iOS)
    var audioNavbarItem: some View {
      if !audioController.playbackError, audioController.isLoadingItem(itemID: item.unwrappedID) {
        return AnyView(ProgressView()
          .padding(.horizontal))
      } else {
        return AnyView(
          Button(
            action: {
              switch audioController.state {
              case .playing:
                if audioController.itemAudioProperties?.itemID == self.item.unwrappedID {
                  audioController.pause()
                  return
                }
                fallthrough
              case .paused:
                if audioController.itemAudioProperties?.itemID == self.item.unwrappedID {
                  audioController.unpause()
                  return
                }
                fallthrough
              default:
                audioController.play(itemAudioProperties: item.audioProperties)
              }
            },
            label: {
              textToSpeechButtonImage
            }
          ).buttonStyle(.plain)
        )
      }
    }

    var textToSpeechButtonImage: some View {
      if audioController.playbackError || audioController.state == .stopped || audioController.itemAudioProperties?.itemID != self.item.id {
        return AnyView(Image.audioPlay.frame(width: 48, height: 48))
      }
      if audioController.isPlayingItem(itemID: item.unwrappedID) {
        return AnyView(Image.audioPause.frame(width: 48, height: 48))
      }
      return AnyView(Image.audioPlay.frame(width: 48, height: 48))
    }
  #endif

  func audioMenuItem() -> some View {
    Button(
      action: {
        viewModel.downloadAudio(audioController: audioController, item: item)
      },
      label: {
        // swiftlint:disable:next line_length
        Label(viewModel.isDownloadingAudio ? "Downloading Audio" : "Download Audio", systemImage: "icloud.and.arrow.down")
      }
    )
  }

  func menuItems(for item: Models.LibraryItem) -> some View {
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
          dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 0, anchorIndex: 0, force: true)
        },
        label: { Label("Reset Read Location", systemImage: "arrow.counterclockwise.circle") }
      )
      audioMenuItem()

      if viewModel.hasOriginalUrl(item) {
        Button(
          action: {
            openOriginalURL(urlString: item.pageURLString)
          },
          label: { Label("Open Original", systemImage: "safari") }
        )
        Button(
          action: {
            showOpenArchiveSheet = true
          },
          label: { Label("Open on Archive.today", systemImage: "globe") }
        )
        Button(
          action: share,
          label: { Label("Share Original", systemImage: "square.and.arrow.up") }
        )
      }
      Button(
        action: copyDeeplink,
        label: { Label("Copy Deeplink", systemImage: "link") }
      )
      Button(
        action: delete,
        label: { Label("Remove", systemImage: "trash") }
      )
      Button(
        action: {
          showRecommendSheet = true
        },
        label: { Label("Recommend", systemImage: "sparkles") }
      )
    }
  }

  let navBarOffset = 100

  var navBar: some View {
    HStack(alignment: .center, spacing: 10) {
      #if os(iOS)
        Button(
          action: {
            pop()
          },
          label: {
            Image.chevronRight
              .padding(.horizontal, 10)
              .padding(.vertical)
          }
        )
        .buttonStyle(.plain)

        Spacer()
      #endif

      Button(
        action: { showLabelsModal = true },
        label: {
          Image.label
        }
      )
      .buttonStyle(.plain)
      .padding(.trailing, 4)

      Button(
        action: { showNotebookView = true },
        label: {
          Image.notebook
        }
      )
      .buttonStyle(.plain)
      .padding(.trailing, 4)

      #if os(iOS)
        audioNavbarItem

        Button(
          action: {
            if UIDevice.current.userInterfaceIdiom == .phone {
              showPreferencesFormsheet.toggle()
            } else {
              showPreferencesPopover.toggle()
            }
          },
          label: {
            Image.readerSettings
          }
        )
        .buttonStyle(.plain)
        .padding(.horizontal, 5)
        .popover(isPresented: $showPreferencesPopover) {
          webPreferencesPopoverView
            .frame(maxWidth: 400, maxHeight: 475)
        }
        .formSheet(isPresented: $showPreferencesFormsheet, modalSize: CGSize(width: 400, height: 475)) {
          webPreferencesPopoverView
        }
      #endif

      #if os(macOS)
        Spacer()
      #endif
      Menu(
        content: {
          menuItems(for: item)
        },
        label: {
          #if os(iOS)
            Image.utilityMenu

          #else
            Text(LocalText.genericOptions)
          #endif
        }
      )
      .buttonStyle(.plain)
      #if os(macOS)
        .frame(maxWidth: 100)
        .padding(.trailing, 16)
      #else
        .padding(.trailing, 16)
      #endif
    }
    .tint(Color(hex: "#2A2A2A"))
    .frame(height: readerViewNavBarHeight)
    .frame(maxWidth: .infinity)
    .foregroundColor(ThemeManager.currentTheme.toolbarColor)
    .background(ThemeManager.currentBgColor)
    .sheet(isPresented: $showLabelsModal) {
      ApplyLabelsView(mode: .item(item), onSave: { labels in
        showLabelsModal = false
        item.labels = NSSet(array: labels)
        readerSettingsChangedTransactionID = UUID()
      })
    }
    .sheet(isPresented: $showTitleEdit) {
      LinkedItemMetadataEditView(item: item, onSave: { title, _ in
        item.title = title
        // We dont need to update description because its never rendered in this view
        readerSettingsChangedTransactionID = UUID()
      })
    }
    #if os(iOS)
      .sheet(isPresented: $showNotebookView, onDismiss: onNotebookViewDismissal) {
        NotebookView(
          viewModel: NotebookViewModel(item: item),
          hasHighlightMutations: $hasPerformedHighlightMutations
        )
      }
    #endif
    #if os(macOS)
      .buttonStyle(PlainButtonStyle())
    #endif
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
      WindowLink(level: .alert, transition: .move(edge: .bottom), isPresented: $viewModel.showOperationToast) {
        OperationToast(operationMessage: $viewModel.operationMessage, showOperationToast: $viewModel.showOperationToast, operationStatus: $viewModel.operationStatus)
      } label: {
        EmptyView()
      }.buttonStyle(.plain)

      if let articleContent = viewModel.articleContent {
        WebReader(
          item: item,
          viewModel: viewModel,
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
          navBarVisibilityUpdater: { visible in
            withAnimation {
              navBarVisible = visible
            }
          },
          readerSettingsChangedTransactionID: $readerSettingsChangedTransactionID,
          annotationSaveTransactionID: $annotationSaveTransactionID,
          showNavBarActionID: $showNavBarActionID,
          shareActionID: $shareActionID,
          annotation: $annotation,
          showHighlightAnnotationModal: $showHighlightAnnotationModal
        )
        .background(ThemeManager.currentBgColor)
        #if os(iOS)
          .statusBar(hidden: prefersHideStatusBarInReader)
        #endif
        .onAppear {
          if item.isUnread {
            dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 0.1, anchorIndex: 0, force: false)
          }
          Task {
            await audioController.preload(itemIDs: [item.unwrappedID])
          }
        }
        .confirmationDialog(linkToOpen?.absoluteString ?? "", isPresented: $displayLinkSheet,
                            titleVisibility: .visible) {
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
            showInLibrarySnackbar("Link Copied")
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
              .ignoresSafeArea(.all, edges: .bottom)
          }
          .fullScreenCover(isPresented: $showExpandedAudioPlayer) {
            ExpandedAudioPlayer(delete: { _ in
              showExpandedAudioPlayer = false
              audioController.stop()
              delete()
            }, archive: { _ in
              showExpandedAudioPlayer = false
              audioController.stop()
              archive()
            }, viewArticle: { _ in
              showExpandedAudioPlayer = false
            })
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
          .formSheet(isPresented: $showOpenArchiveSheet) {
            OpenArchiveTodayView(item: item)
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
          #if os(iOS)
            .navigationViewStyle(StackNavigationViewStyle())
          #endif
        }
        .sheet(isPresented: $showHighlightLabelsModal) {
          if let highlight = Highlight.lookup(byID: self.annotation, inContext: self.dataService.viewContext) {
            ApplyLabelsView(mode: .highlight(highlight)) { selectedLabels in
              viewModel.setLabelsForHighlight(highlightID: highlight.unwrappedID,
                                              labelIDs: selectedLabels.map(\.unwrappedID),
                                              dataService: dataService)
            }
          }
        }
      } else if let errorMessage = viewModel.errorMessage {
        VStack {
          if viewModel.allowRetry, viewModel.hasOriginalUrl(item) {
            if item.state == "DELETED" {
              Text("Item has been deleted, would you like to recover it?").padding()
              if isRecovering {
                ProgressView()
              } else {
                Button("Recover", action: {
                  self.isRecovering = true
                  Task {
                    if !(await dataService.recoverItem(itemID: item.unwrappedID)) {
                      viewModel.snackbar(message: "Error recovering item")
                    } else {
                      await viewModel.loadContent(
                        dataService: dataService,
                        username: dataService.currentViewer?.username ?? "me",
                        itemID: item.unwrappedID
                      )
                    }
                    isRecovering = false
                  }
                }).buttonStyle(RoundedRectButtonStyle())
              }
            } else {
              Text(errorMessage).padding()
              Button("Open Original", action: {
                openOriginalURL(urlString: item.pageURLString)
              }).buttonStyle(RoundedRectButtonStyle())
              if let urlStr = item.pageURLString, let username = dataService.currentViewer?.username, let url = URL(string: urlStr) {
                Button("Attempt to Save Again", action: {
                  viewModel.errorMessage = nil
                  viewModel.saveLinkAndFetch(dataService: dataService, username: username, url: url)
                }).buttonStyle(RoundedRectButtonStyle())
              }
            }
          }
        }
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
          navBar
            .offset(y: navBarVisible ? 0 : -150)

          Spacer()
          if let audioProperties = audioController.itemAudioProperties {
            MiniPlayerViewer(itemAudioProperties: audioProperties)
              .padding(.top, 10)
              .padding(.bottom, navBarVisible ? 10 : 40)
              .background(Color.themeTabBarColor)
              .onTapGesture {
                showExpandedAudioPlayer = true
              }
          }
          if navBarVisible {
            CustomToolBar(
              isFollowing: item.folder == "following",
              isArchived: item.isArchived,
              moveToInboxAction: moveToInbox,
              archiveAction: archive,
              unarchiveAction: archive,
              shareAction: share,
              deleteAction: delete
            )
          }
        }

      #endif
    }
    #if os(macOS)
      .onReceive(NSNotification.readerSettingsChangedPublisher) { _ in
        readerSettingsChangedTransactionID = UUID()
      }
    #endif
    .onAppear {
      try? WebViewManager.shared().dispatchEvent(.saveReadPosition)
    }
    .onDisappear {
      // WebViewManager.shared().loadHTMLString("<html></html>", baseURL: nil)
      WebViewManager.shared().loadHTMLString(WebReaderContent.emptyContent(isDark: Color.isDarkMode), baseURL: nil)
    }
    .popup(isPresented: $viewModel.showSnackbar) {
      if let operation = viewModel.snackbarOperation {
        Snackbar(isShowing: $viewModel.showSnackbar, operation: operation)
      } else {
        EmptyView()
      }
    } customize: {
      $0
        .type(.toast)
        .autohideIn(2)
        .position(.bottom)
        .animation(.spring())
        .isOpaque(false)
    }
    .ignoresSafeArea(.all, edges: .bottom)
    .onReceive(NSNotification.readerSnackBarPublisher) { notification in
      if let message = notification.userInfo?["message"] as? String {
        viewModel.snackbarOperation = SnackbarOperation(message: message,
                                                        undoAction: notification.userInfo?["undoAction"] as? SnackbarUndoAction)
        viewModel.showSnackbar = true
      }
    }
  }

  func moveToInbox() {
    Task {
      viewModel.showOperationToast = true
      viewModel.operationMessage = "Moving to library..."
      viewModel.operationStatus = .isPerforming
      do {
        try await dataService.moveItem(itemID: item.unwrappedID, folder: "inbox")
        viewModel.operationMessage = "Moved to library"
        viewModel.operationStatus = .success
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1500)) {
          viewModel.showOperationToast = false
        }
      } catch {
        viewModel.operationMessage = "Error moving"
        viewModel.operationStatus = .failure
      }
    }
  }

  func archive() {
    let isArchived = item.isArchived
    dataService.archiveLink(objectID: item.objectID, archived: !isArchived)
    #if os(iOS)
      pop()
    #endif
  }

  func recommend() {
    showRecommendSheet = true
  }

  func share() {
    shareActionID = UUID()
  }

  func copyDeeplink() {
    if let deepLink = item.deepLink {
      #if os(iOS)
        UIPasteboard.general.string = deepLink.absoluteString
      #else
        let pasteBoard = NSPasteboard.general
        pasteBoard.clearContents()
        pasteBoard.writeObjects([deepLink.absoluteString as NSString])
      #endif
      showInLibrarySnackbar("Deeplink Copied")
    } else {
      showInLibrarySnackbar("Error copying deeplink")
    }
  }

  func delete() {
    pop()
    #if os(iOS)
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
        removeLibraryItemAction(dataService: dataService, objectID: item.objectID)
      }
    #endif
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
