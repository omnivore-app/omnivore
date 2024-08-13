import Models
import Services
import SwiftUI
import Utils
import Views

// swiftlint:disable file_length type_body_length
public struct ShareExtensionView: View {
  let extensionContext: NSExtensionContext?
  @StateObject var viewModel: ShareExtensionViewModel
  @StateObject var labelsViewModel: LabelsViewModel

  @State var previousLabels: [LinkedItemLabel]?
  @State var messageText: String?
  @State var showSearchLabels = false

  @State var viewState = ViewState.mainView
  @State var showHighlightInstructionAlert = false

  @State var showAddNoteModal = false

  enum FocusField: Hashable {
    case noteEditor
    case labelEditor
  }

  enum ViewState {
    case mainView
    case editingTitle
    case editingLabels
    case viewingHighlight
  }

  @FocusState private var focusedField: FocusField?

  public init(viewModel: ShareExtensionViewModel,
              labelsViewModel: LabelsViewModel,
              extensionContext: NSExtensionContext?)
  {
    _viewModel = StateObject(wrappedValue: viewModel)
    _labelsViewModel = StateObject(wrappedValue: labelsViewModel)
    self.extensionContext = extensionContext

    #if os(iOS)
      UITextView.appearance().textContainerInset = UIEdgeInsets(top: 8, left: 4, bottom: 10, right: 4)
    #endif
  }

  private func localImage(from url: URL) -> Image? {
    #if os(iOS)
      if let data = try? Data(contentsOf: url), let img = UIImage(data: data) {
        return Image(uiImage: img)
      }
    #else
      if let data = try? Data(contentsOf: url), let img = NSImage(data: data) {
        return Image(nsImage: img)
      }
    #endif
    return nil
  }

  var isSynced: Bool {
    switch viewModel.status {
    case .synced:
      return true
    default:
      return false
    }
  }

  var articleInfoBox: some View {
    HStack(alignment: .top, spacing: 15) {
      AsyncImage(url: self.viewModel.iconURL) { phase in
        if let image = phase.image {
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: 56, height: 56)
        } else {
          Color.appButtonBackground
            .frame(width: 56, height: 56)
        }
      }
      .frame(width: 56, height: 56).overlay(
        RoundedRectangle(cornerRadius: 5)
          .stroke(.white, lineWidth: 1)
      ).cornerRadius(5)
      VStack(alignment: .leading) {
        Text(self.viewModel.url ?? "")
          .font(Font.system(size: 12))
          .lineLimit(1)
          .foregroundColor(Color.extensionTextSubtle)
          .frame(height: 14)

        Text(self.viewModel.title)
          .font(Font.system(size: 13, weight: .semibold))
          .lineSpacing(1.25)
          .foregroundColor(.appGrayTextContrast)
          .fixedSize(horizontal: false, vertical: true)
          .lineLimit(2)
          .frame(height: 33)
          .frame(maxWidth: .infinity, alignment: .leading)
      }.padding(.vertical, 2)
      // Spacer()
      Image(systemName: "checkmark.circle")
        .frame(width: 15, height: 15)
        .foregroundColor(.appGreenSuccess)
        .opacity(isSynced ? 1.0 : 0.0)
    }
  }

  var hasNoteText: Bool {
    !viewModel.noteText.isEmpty
  }

  var noteBox: some View {
    Button(action: {
      NotificationCenter.default.post(name: Notification.Name("ShowAddNoteSheet"), object: nil)
    }, label: {
      VStack {
        Text(hasNoteText ? viewModel.noteText : "Add note...")
          .frame(maxWidth: .infinity, alignment: .topLeading)
          .multilineTextAlignment(.leading)
        Spacer()
      }
    })
      .buttonStyle(.plain)
      .foregroundColor(hasNoteText ?
        Color.appGrayTextContrast : Color.extensionTextSubtle
      )
      .font(Font.system(size: 13, weight: .semibold))
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      .contentShape(Rectangle())
  }

  var labelsButton: some View {
    Button(action: {
      NotificationCenter.default.post(name: Notification.Name("ShowEditLabelsSheet"), object: nil)
    }, label: {
      Label {
        Text("Add Labels").font(Font.system(size: 12, weight: .medium)).tint(Color.white)
      } icon: {
        Image.label.resizable(resizingMode: .stretch).frame(width: 17, height: 17).tint(Color.white)
      }
      .foregroundColor(Color.white)
      .padding(.leading, 10).padding(.trailing, 12)
    })
      .buttonStyle(.plain)
      .frame(height: 28)
      .background(Color.blue)
      .cornerRadius(24)
  }

  var infoBox: some View {
    VStack(alignment: .leading, spacing: 15) {
      articleInfoBox

      Divider()
        .frame(maxWidth: .infinity)
        .frame(height: 1)
        .background(Color(hex: "545458")?.opacity(0.65))

      noteBox

      labelsButton
    }.padding(15)
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(Color.extensionPanelBackground)
      .cornerRadius(14)
  }

  var labelsBox: some View {
    ScrollView(.vertical) {
      LabelsMasonaryView(labels: labelsViewModel.labels,
                         selectedLabels: labelsViewModel.selectedLabels,
                         onLabelTap: { label, _ in
                           if !labelsViewModel.selectedLabels.contains(label) {
                             labelsViewModel.selectedLabels += [label]
                           } else {
                             labelsViewModel.selectedLabels.removeAll { $0.unwrappedID == label.unwrappedID }
                           }
                           if let itemID = viewModel.linkedItem?.id {
                             labelsViewModel.saveItemLabelChanges(
                               itemID: itemID,
                               dataService: viewModel.services.dataService
                             )
                           }
                         })
    }
    .padding(.bottom, 15)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.extensionPanelBackground)
    .cornerRadius(14)
  }

  var moreMenuButton: some View {
    Menu {
      #if os(iOS)
        Button(action: {
          NotificationCenter.default.post(name: Notification.Name("ShowEditInfoSheet"), object: nil)
        }, label: {
          Label(
            "Edit Info",
            systemImage: "info.circle"
          )
        })
      #endif
      Button(action: {
        if let linkedItem = self.viewModel.linkedItem {
          self.viewModel.setLinkArchived(dataService: self.viewModel.services.dataService,
                                         objectID: linkedItem.objectID,
                                         archived: true)
          messageText = "Link Archived"
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(300)) {
            extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
          }
        }
      }, label: {
        Label(
          "Archive",
          systemImage: "archivebox"
        )
      })
      Button(
        action: {
          if let linkedItem = self.viewModel.linkedItem {
            self.viewModel.removeLibraryItem(dataService: self.viewModel.services.dataService, objectID: linkedItem.objectID)
            messageText = "Link Removed"
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(300)) {
              extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
            }
          }
        },
        label: {
          Label("Remove", systemImage: "trash")
        }
      )
    } label: {
      ZStack {
        Circle()
          .foregroundColor(Color.circleButtonBackground)
          .frame(width: 30, height: 30)

        Image(systemName: "ellipsis")
          .resizable(resizingMode: Image.ResizingMode.stretch)
          .foregroundColor(Color.circleButtonForeground)
          .aspectRatio(contentMode: .fit)
          .frame(width: 15, height: 15)
      }
    }.buttonStyle(.plain)
  }

  var closeButton: some View {
    Button(action: {
      extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }, label: {
      ZStack {
        Circle()
          .foregroundColor(Color.circleButtonBackground)
          .frame(width: 30, height: 30)

        Image(systemName: "xmark")
          .resizable(resizingMode: Image.ResizingMode.stretch)
          .foregroundColor(Color.circleButtonForeground)
          .aspectRatio(contentMode: .fit)
          .font(Font.title.weight(.bold))
          .frame(width: 12, height: 12)
      }
    }).buttonStyle(.plain)
  }

  var titleBar: some View {
    HStack {
      Text("Saved to Omnivore")
        .font(Font.system(size: 22, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
      #if os(iOS)
        Spacer()
        moreMenuButton
        closeButton
      #endif
    }
  }

  var displayDismiss: Bool {
    true
  }

  public var body: some View {
    #if os(iOS)
      iOSBody
        .environmentObject(viewModel.services.dataService)
    #else
      macOSBody
        .environmentObject(viewModel.services.dataService)
    #endif
  }

  @AppStorage(UserDefaultKey.visibleShareExtensionTab.rawValue) var visibleTab = "info"

  var iOSBody: some View {
    VStack(alignment: .leading, spacing: 15) {
      titleBar
        .padding(.top, 15)

      TabView(selection: $visibleTab) {
        infoBox
          .tag("info")
          .padding(.horizontal, 15)
        labelsBox
          .tag("labels")
          .padding(.horizontal, 15)
      }
      .tabViewStyle(.page(indexDisplayMode: .never))
      .padding(.horizontal, -15)

      Spacer()

      HStack {
        #if os(macOS)
          moreMenuButton
            .padding(.bottom, 15)
        #endif
        Spacer()
        Button(action: {
          viewModel.dismissExtension(extensionContext: extensionContext)
        }, label: {
          Text("Dismiss")
          #if os(iOS)
            .font(Font.system(size: 17, weight: .semibold))
            .tint(Color.appGrayText)
            .padding(20)
          #endif
        })
        #if os(iOS)
          .frame(height: 50)
          .cornerRadius(24)
        #endif
        .padding(.bottom, 15)
        Button(action: {
          viewModel.handleReadNowAction(extensionContext: extensionContext)
        }, label: {
          Text("Read Now")
            .foregroundColor(Color.white)
          #if os(iOS)
            .font(Font.system(size: 17, weight: .semibold))
            .tint(Color.white)
            .padding(20)
          #endif
        })
          .buttonStyle(.plain)
        #if os(iOS)
          .frame(height: 50)
          .background(Color.blue)
          .cornerRadius(24)
        #endif
        .padding(.bottom, 15)
      }.frame(maxWidth: .infinity)
    }.padding(.horizontal, 15)
      .background(Color.extensionBackground)
      .onAppear {
        viewModel.savePage(extensionContext: extensionContext)
        Task {
          await labelsViewModel.loadLabels(dataService: viewModel.services.dataService, initiallySelectedLabels: [])
        }
      }
  }

  @State var labelsSearch = ZWSP
  @State var isLabelsEntryFocused = false

  func save() {
    if !viewModel.noteText.isEmpty {
      viewModel.saveNote()
    }
    if let itemID = viewModel.linkedItem?.id {
      labelsViewModel.saveItemLabelChanges(itemID: itemID, dataService: viewModel.services.dataService)
    }
  }

  var macOSBody: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(spacing: 10) {
        Text("Saved to Omnivore")
          .font(Font.system(size: 17))
        Image(systemName: "checkmark.circle")
          .foregroundColor(.appGreenSuccess)
          .opacity(isSynced ? 1.0 : 0.0)
        Spacer()
      }.padding(15)

      Divider()

      ZStack(alignment: .topLeading) {
        TextEditor(text: $viewModel.noteText)
          .frame(maxWidth: .infinity)
          .font(Font.system(size: 14))
          .accentColor(.blue)
        #if os(macOS)
          .introspectTextView { textView in
            textView.textContainerInset = NSSize(width: 10, height: 10)
          }
        #endif
        .focused($focusedField, equals: .noteEditor)
        if viewModel.noteText.isEmpty {
          Text("Notes")
            .fontWeight(.light)
            .font(Font.system(size: 14))
            .foregroundColor(.black.opacity(0.25))
            .padding(.leading, 15)
            .padding(.top, 10)
            .allowsHitTesting(false)
        }
      }

      Divider()

      ZStack(alignment: .topLeading) {
        LabelsEntryView(searchTerm: $labelsSearch, isFocused: $isLabelsEntryFocused, viewModel: labelsViewModel)
          .frame(maxWidth: .infinity)
          .padding(.horizontal, 8)
          .focused($focusedField, equals: .labelEditor)

        if labelsViewModel.selectedLabels.isEmpty, labelsSearch == ZWSP {
          Text("Type to add labels")
            .fontWeight(.light)
            .font(Font.system(size: 14))
            .foregroundColor(.black.opacity(0.25))
            .padding(.leading, 15)
            .padding(.top, 10)
            .allowsHitTesting(false)
        }
      }

      Divider()

      HStack {
        moreMenuButton
          .padding(.bottom, 15)
        Spacer()
        Button(action: {
          save()
          extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }, label: {
          Text("Dismiss")
        })
          .padding(.bottom, 15)
        Button(action: {
          save()
          viewModel.handleReadNowAction(extensionContext: extensionContext)
        }, label: {
          Text("Read Now")
        })
          .padding(.bottom, 15)

      }.padding(15)

    }.frame(maxWidth: .infinity)
      .background(Color.isDarkMode ? Color.systemBackground : Color.white)
      .onAppear {
        if let extensionContext = extensionContext {
          viewModel.savePage(extensionContext: extensionContext)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
          focusedField = .labelEditor
        }
        Task {
          await labelsViewModel.loadLabels(dataService: viewModel.services.dataService, initiallySelectedLabels: [])
        }
      }
  }
}

public struct LoggedOutShareExtensionView: View {
  let extensionContext: NSExtensionContext?

  public init(
    extensionContext: NSExtensionContext?)
  {
    self.extensionContext = extensionContext
  }

  public var body: some View {
    VStack(spacing: 20) {
      Text("You are not logged in. Please open the Omnivore app and log in to start saving items to your library")
      Button(action: {
        if let extensionContext = extensionContext {
          extensionContext.completeRequest(returningItems: nil)
        }
      }, label: { Text("Dismiss") })
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(20)
  }
}
