import Models
import Services
import SwiftUI
import Utils
import Views

// swiftlint:disable file_length type_body_length
public struct ShareExtensionView: View {
  let extensionContext: NSExtensionContext?
  @StateObject var labelsViewModel = LabelsViewModel()
  @StateObject private var viewModel = ShareExtensionViewModel()

  @State var previousLabels: [LinkedItemLabel]?
  @State var messageText: String?
  @State var showSearchLabels = false

  @State var viewState = ViewState.mainView
  @State var showHighlightInstructionAlert = false

  @State var showAddNoteModal = false

  enum FocusField: Hashable {
    case titleEditor
  }

  enum ViewState {
    case mainView
    case editingTitle
    case editingLabels
    case viewingHighlight
  }

  @FocusState private var focusedField: FocusField?

  private var titleText: String {
    switch viewModel.status {
    case .saved, .synced, .syncFailed(error: _):
      return "Saved to Omnivore"
    case .processing:
      return "Saving to Omnivore"
    case .failed(error: _):
      return "Error saving to Omnivore"
    }
  }

  private var titleColor: Color {
    switch viewModel.status {
    case .saved, .processing:
      return .appGrayText
    case .failed(error: _), .syncFailed(error: _):
      return .red
    case .synced:
      return .appGreenSuccess
    }
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

//  var titleBar: some View {
//    HStack {
//      Spacer()
//
//      Image(systemName: "checkmark.circle")
//        .frame(width: 15, height: 15)
//        .foregroundColor(.appGreenSuccess)
//        .opacity(isSynced ? 1.0 : 0.0)
//
//      Text(messageText ?? titleText)
//        .font(.appSubheadline)
//        .foregroundColor(titleColor)
//
//      Spacer()
//    }
//  }

  public var titleBox: some View {
    VStack(alignment: .trailing) {
      Button(action: {}, label: {
        Text("Edit")
          .font(.appFootnote)
          .padding(.trailing, 8)
          .onTapGesture {
            viewState = .editingTitle
          }
      })
        .disabled(viewState == .editingTitle)
        .opacity(viewState == .editingTitle ? 0.0 : 1.0)

      VStack(alignment: .leading) {
        if viewState != .editingTitle {
          Text(self.viewModel.title)
            .font(.appSubheadline)
            .lineLimit(2)
            .fixedSize(horizontal: false, vertical: true)
            .foregroundColor(.appGrayTextContrast)
            .frame(maxWidth: .infinity, alignment: .leading)

          Spacer()

          Text(self.viewModel.url ?? "")
            .font(.appFootnote)
            .foregroundColor(.appGrayText)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
      }
      .frame(maxWidth: .infinity, maxHeight: 60)
      .padding()
      .overlay(
        RoundedRectangle(cornerRadius: 8)
          .stroke(Color.appGrayBorder, lineWidth: 1)
      )
    }
  }

  var labelsSection: some View {
    HStack {
      if viewState != .editingLabels {
        ZStack {
          Circle()
            .foregroundColor(Color.blue)
            .frame(width: 34, height: 34)

          Image(systemName: "tag")
            .font(.appCallout)
            .frame(width: 34, height: 34)
        }
        .padding(.trailing, 8)

        VStack {
          Text(LocalText.labelsGeneric)
            .font(.appSubheadline)
            .foregroundColor(Color.appGrayTextContrast)
            .frame(maxWidth: .infinity, alignment: .leading)

          let labelCount = labelsViewModel.selectedLabels.count
          Text(labelCount > 0 ?
            "\(labelCount) label\(labelCount > 1 ? "s" : "") selected"
            : "Add labels to your saved link")
            .font(.appFootnote)
            .foregroundColor(Color.appGrayText)
            .frame(maxWidth: .infinity, alignment: .leading)
        }

        Spacer()

        Image(systemName: "chevron.right")
          .font(.appCallout)
      } else {
        VStack(spacing: 15) {
          SearchBar(searchTerm: $labelsViewModel.labelSearchFilter)

          // swiftlint:disable line_length
          ScrollView {
            LabelsMasonaryView(labels: labelsViewModel.labels.applySearchFilter(labelsViewModel.labelSearchFilter),
                               selectedLabels: labelsViewModel.selectedLabels.applySearchFilter(labelsViewModel.labelSearchFilter),
                               onLabelTap: onLabelTap)
            Button(
              action: { labelsViewModel.showCreateLabelModal = true },
              label: {
                HStack {
                  let trimmedLabelName = labelsViewModel.labelSearchFilter.trimmingCharacters(in: .whitespacesAndNewlines)
                  Image(systemName: "tag").foregroundColor(.blue)
                  Text(
                    labelsViewModel.labelSearchFilter.count > 0 ?
                      "Create: \"\(trimmedLabelName)\" label" :
                      LocalText.createLabelMessage
                  ).foregroundColor(.blue)
                    .font(Font.system(size: 14))
                  Spacer()
                }
              }
            )
            .buttonStyle(PlainButtonStyle())
            .padding(10)
          }.background(Color.appButtonBackground)
          // swiftlint:enable line_length
        }
      }
    }
    .padding(viewState == .editingLabels ? 0 : 16)
    .background(Color.extensionBackground)
    .frame(maxWidth: .infinity, maxHeight: viewState == .editingLabels ? .infinity : 60)
    .cornerRadius(8)
  }

  var highlightSection: some View {
    HStack {
      if viewState != .viewingHighlight {
        ZStack {
          Circle()
            .foregroundColor(Color.appBackground)
            .frame(width: 34, height: 34)

          Image(systemName: "highlighter")
            .font(.appCallout)
            .frame(width: 34, height: 34)
            .foregroundColor(Color.black)
        }
        .padding(.trailing, 8)

        VStack {
          Text(LocalText.genericHighlight)
            .font(.appSubheadline)
            .foregroundColor(Color.appGrayTextContrast)
            .frame(maxWidth: .infinity, alignment: .leading)

          Text(viewModel.highlightData != nil ?
            viewModel.highlightData!.highlightText
            : "Select text before saving to create highlight")
            .font(.appFootnote)
            .foregroundColor(Color.appGrayText)
            .frame(maxWidth: .infinity, alignment: .leading)
        }

        Spacer()

        Image(systemName: "chevron.right")
          .font(.appCallout)
      } else if let highlightText = self.viewModel.highlightData?.highlightText {
        Text(highlightText)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
          .cornerRadius(8)
          .padding(0)
      }
    }
    .padding(16)
    .frame(maxWidth: .infinity, maxHeight: viewState == .viewingHighlight ? .infinity : 60)
    .background(Color.appButtonBackground)
    .cornerRadius(8)
  }

  func onLabelTap(label: LinkedItemLabel, textChip _: TextChip) {
    if labelsViewModel.selectedLabels.contains(label) {
      labelsViewModel.selectedLabels.remove(label)
    } else {
      labelsViewModel.selectedLabels.insert(label)
    }

    if let linkedItem = viewModel.linkedItem {
      labelsViewModel.saveItemLabelChanges(itemID: linkedItem.unwrappedID, dataService: viewModel.services.dataService)
    }
  }

  var primaryButtons: some View {
    HStack {
      Button(
        action: { viewModel.handleReadNowAction(extensionContext: extensionContext) },
        label: {
          Label("Read Now", systemImage: "book")
            .padding(16)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
      )
      .foregroundColor(.appGrayTextContrast)
      .background(Color.appButtonBackground)
      .frame(height: 52)
      .cornerRadius(8)

      Spacer(minLength: 8)

      Button(
        action: {
          extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        },
        label: {
          Label(LocalText.readLaterGeneric, systemImage: "text.book.closed.fill")
            .padding(16)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
      )
      .foregroundColor(.black)
      .background(Color.appBackground)
      .frame(height: 52)
      .cornerRadius(8)
    }
  }

  var moreActionsMenu: some View {
    Menu {
      Button(action: {}, label: {
        Label(
          "Edit Info",
          systemImage: "info.circle"
        )
      })
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
            self.viewModel.removeLink(dataService: self.viewModel.services.dataService, objectID: linkedItem.objectID)
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
      Text("More Actions")
        .font(.appFootnote)
        .foregroundColor(Color.blue)
        .frame(maxWidth: .infinity)
        .padding(8)
        .padding(.bottom, 8)
    }
  }

  var editingViewTitle: String {
    switch viewState {
    case .editingTitle:
      return "Edit Title"
    case .editingLabels:
      return LocalText.labelsGeneric
    case .viewingHighlight:
      return LocalText.genericHighlight
    default:
      return ""
    }
  }

  func submitEditTitle() {
    if viewState == .editingTitle {
      if let linkedItem = viewModel.linkedItem {
        viewModel.submitTitleEdit(dataService: viewModel.services.dataService,
                                  itemID: linkedItem.unwrappedID,
                                  title: viewModel.title,
                                  description: linkedItem.descriptionText ?? "")
      }
    }
    viewState = .mainView
  }

  var articleInfoBox: some View {
    HStack(alignment: .top, spacing: 15) {
      AsyncImage(url: self.viewModel.iconURL)
        .frame(width: 56, height: 56).overlay(
          RoundedRectangle(cornerRadius: 14)
            .stroke(.white, lineWidth: 1)
        ).cornerRadius(14)
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
      // .opacity(isSynced ? 1.0 : 0.0)
    }
  }

  var noteBox: some View {
    Button(action: {
      NotificationCenter.default.post(name: Notification.Name("ExpandForm"), object: nil)
      // showAddNoteModal = true
    }, label: { Text("Add note...") })
      .foregroundColor(Color.extensionTextSubtle)
      .font(Font.system(size: 13, weight: .semibold))
      .frame(height: 50, alignment: .top)
      .frame(maxWidth: .infinity, alignment: .leading)
  }

  var labelsBox: some View {
    Button(action: {}, label: {
      Label {
        Text("Add Labels").font(Font.system(size: 12, weight: .medium)).tint(Color.white)
      } icon: {
        Image.label.resizable(resizingMode: .stretch).frame(width: 17, height: 17).tint(Color.white)
      }.padding(.leading, 10).padding(.trailing, 12)
    })
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

      labelsBox
    }.padding(15)
      .background(Color.extensionPanelBackground)
      .cornerRadius(14)
  }

  var moreMenuButton: some View {
    Menu {
      Button(action: {}, label: {
        Label(
          "Edit Info",
          systemImage: "info.circle"
        )
      })
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
            self.viewModel.removeLink(dataService: self.viewModel.services.dataService, objectID: linkedItem.objectID)
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
    }
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
    })
  }

  var titleBar: some View {
    HStack {
      Text("Saved to Omnivore")
        .font(Font.system(size: 22, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)

      Spacer()
      moreMenuButton
      closeButton
    }
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: 15) {
      titleBar
        .padding(.top, 15)

      infoBox

      Spacer(minLength: 1)

      HStack {
        Spacer()
        Button(action: {
          viewModel.handleReadNowAction(extensionContext: extensionContext)
        }, label: {
          Text("Read Now")
            .font(Font.system(size: 17, weight: .semibold))
            .tint(Color.white)
            .padding(20)
        })
          .frame(height: 50)
          .background(Color.blue)
          .cornerRadius(24)
          .padding(15)
      }.frame(maxWidth: .infinity)
    }.padding(.horizontal, 15)
      .background(Color.extensionBackground)
      .onAppear {
        viewModel.savePage(extensionContext: extensionContext)
      }
  }

  public var oldbody: some View {
    VStack(alignment: .center) {
      Capsule()
        .fill(.gray)
        .frame(width: 60, height: 4)
        .padding(.top, 10)

      if viewState == .mainView {
        titleBar
          .padding(.top, 10)
          .padding(.bottom, 12)
      } else {
        ZStack {
          Text(editingViewTitle).bold()
            .frame(maxWidth: .infinity, alignment: .center)

          Button(action: {
            withAnimation {
              submitEditTitle()
            }
          }, label: { Text(LocalText.doneGeneric).bold() })
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(8)
        .padding(.bottom, 4)
      }

      if viewState == .mainView {
        titleBox
      }

      if viewState == .editingTitle {
        ScrollView(showsIndicators: false) {
          VStack(alignment: .center, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
              TextEditor(text: $viewModel.title)
                .textFieldStyle(.roundedBorder)
                .lineSpacing(6)
                .submitLabel(.done)
                .accentColor(.appGraySolid)
                .foregroundColor(.appGrayTextContrast)
                .font(.appSubheadline)
                .padding(8)
                .background(
                  RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(Color.appGrayBorder, lineWidth: 1)
                    .background(RoundedRectangle(cornerRadius: 8).fill(Color.systemBackground))
                )
                .frame(height: 100)
                .focused($focusedField, equals: .titleEditor)
                .task {
                  self.focusedField = .titleEditor
                }
                .onChange(of: viewModel.title) { text in
                  if text.last?.isNewline == .some(true) {
                    viewModel.title.removeLast()
                    submitEditTitle()
                  }
                }
            }
          }
          .padding(8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)

        Spacer()
      }

      if viewState != .editingTitle {
        if viewState != .viewingHighlight {
          labelsSection
            .onTapGesture {
              withAnimation {
                previousLabels = Array(self.labelsViewModel.selectedLabels)
                viewState = .editingLabels
              }
            }
        }
        if viewState != .editingLabels {
          highlightSection
            .onTapGesture {
              withAnimation {
                if viewModel.highlightData != nil {
                  viewState = .viewingHighlight
                } else {
                  showHighlightInstructionAlert = true
                }
              }
            }
        }
      }

      Spacer()

      if viewState == .mainView {
        Divider()
          .padding(.bottom, 20)

        primaryButtons

        moreActionsMenu
      }
    }
    .frame(
      maxWidth: .infinity,
      maxHeight: .infinity,
      alignment: .topLeading
    )
    .padding(.horizontal, 16)
    .onAppear {
      viewModel.savePage(extensionContext: extensionContext)
    }
    .sheet(isPresented: $labelsViewModel.showCreateLabelModal) {
      CreateLabelView(viewModel: labelsViewModel, newLabelName: labelsViewModel.labelSearchFilter)
    }
    .alert("Before saving an article select text in Safari to create a highlight on save.",
           isPresented: $showHighlightInstructionAlert) {
      Button(LocalText.genericOk, role: .cancel) { showHighlightInstructionAlert = false }
    }
    .task {
      await labelsViewModel.loadLabelsFromStore(dataService: viewModel.services.dataService)
    }.environmentObject(viewModel.services.dataService)
  }
}
