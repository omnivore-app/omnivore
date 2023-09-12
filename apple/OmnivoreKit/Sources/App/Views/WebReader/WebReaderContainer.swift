import AVFoundation
import Models
import PopupView
import Services
import SwiftUI
import Utils
import Views
import WebKit

// swiftlint:disable file_length type_body_length
struct WebReaderContainerView: View {
  let item: LinkedItem
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
  @State var shareActionID: UUID?
  @State var annotation = String()
  @State var showBottomBar = false
  @State private var bottomBarOpacity = 0.0
  @State private var errorAlertMessage: String?
  @State private var showErrorAlertMessage = false
  @State private var showRecommendSheet = false
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
      showBottomBar = navBarVisible
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
        showBottomBar = navBarVisible
        showNavBarActionID = UUID()
      }
    case "dismissNavBars":
      withAnimation {
        navBarVisible = false
        showBottomBar = false
        showNavBarActionID = UUID()
      }
    default:
      break
    }
  }

  #if os(iOS)
    var audioNavbarItem: some View {
      if audioController.isLoadingItem(itemID: item.unwrappedID) {
        return AnyView(ProgressView()
          .padding(.horizontal))
      } else {
        return AnyView(Button(
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
        ))
      }
    }

    var textToSpeechButtonImage: some View {
      if audioController.state == .stopped || audioController.itemAudioProperties?.itemID != self.item.id {
        return AnyView(Image.headphones)
      }
      let name = audioController.isPlayingItem(itemID: item.unwrappedID) ? "pause.circle" : "play.circle"
      return AnyView(Image(systemName: name).font(.appNavbarIcon))
    }
  #endif

  var bottomButtons: some View {
    HStack(alignment: .center) {
      Button(action: archive, label: {
        item.isArchived ? Image.unarchive : Image.archive
      }).frame(width: 48, height: 48)
        .padding(.leading, 8)
      Divider().opacity(0.8)

      Button(action: delete, label: {
        Image.remove
      }).frame(width: 48, height: 48)
      Divider().opacity(0.8)

      Button(action: editLabels, label: {
        Image.label
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
      audioMenuItem()

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
        Spacer()
      #endif

      Button(
        action: { showLabelsModal = true },
        label: {
          Image.label
        }
      )
      .padding(.trailing, 4)

      Button(
        action: { showNotebookView = true },
        label: {
          Image.notebook
        }
      )
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
    .foregroundColor(ThemeManager.currentTheme.isDark ? .white : .black)
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
          itemObjectID: item.objectID,
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
          showBottomBar: $showBottomBar,
          showHighlightAnnotationModal: $showHighlightAnnotationModal
        )
        .background(ThemeManager.currentBgColor)
        .statusBar(hidden: prefersHideStatusBarInReader)
        .onAppear {
          if item.isUnread {
            dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 0.1, anchorIndex: 0)
          }
          Task {
            await audioController.preload(itemIDs: [item.unwrappedID])
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
        .closeOnTapOutside(true)
    }
    .onReceive(NSNotification.readerSnackBarPublisher) { notification in
      if let message = notification.userInfo?["message"] as? String {
        viewModel.snackbarOperation = SnackbarOperation(message: message,
                                                        undoAction: notification.userInfo?["undoAction"] as? SnackbarUndoAction)
        viewModel.showSnackbar = true
      }
    }
  }

  func archive() {
    dataService.archiveLink(objectID: item.objectID, archived: !item.isArchived)
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
    removeLibraryItemAction(dataService: dataService, objectID: item.objectID)
    #if os(iOS)
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
        pop()
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
