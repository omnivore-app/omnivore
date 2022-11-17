import Models
import Services
import SwiftUI
import Utils
import Views

public struct ShareExtensionView: View {
  let extensionContext: NSExtensionContext?
  @EnvironmentObject var dataService: DataService
  @StateObject var labelsViewModel = LabelsViewModel()
  @StateObject private var viewModel = ShareExtensionViewModel()

  @State var reminderTime: ReminderTime?
  @State var hideUntilReminded = false
  @State var editingTitle = false
  @State var editingLabels = false
  @State var previousLabels: [LinkedItemLabel]?
  @State var messageText: String?

  enum FocusField: Hashable {
    case titleEditor
  }

  @FocusState private var focusedField: FocusField?

  private func handleReminderTimeSelection(_ selectedTime: ReminderTime) {
    if selectedTime == reminderTime {
      reminderTime = nil
      hideUntilReminded = false
    } else {
      reminderTime = selectedTime
      hideUntilReminded = true
    }
  }

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

  private var cloudIconName: String {
    switch viewModel.status {
    case .synced:
      return "checkmark.icloud"
    case .saved, .processing:
      return "icloud"
    case .failed(error: _), .syncFailed(error: _):
      return "exclamationmark.icloud"
    }
  }

  private var cloudIconColor: Color {
    switch viewModel.status {
    case .saved:
      return .appGrayText
    case .processing:
      return .clear
    case .failed(error: _), .syncFailed(error: _):
      return .red
    case .synced:
      return .blue
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

  var titleBar: some View {
    HStack {
      Spacer()

      Image(systemName: "checkmark.circle")
        .frame(width: 15, height: 15)
        .foregroundColor(.appGreenSuccess)
        .opacity(isSynced ? 1.0 : 0.0)

      Text(messageText ?? titleText)
        .font(.appSubheadline)
        .foregroundColor(isSynced ? .appGreenSuccess : .appGrayText)

      Spacer()
    }
  }

  public var titleBox: some View {
    VStack(alignment: .trailing) {
      Button(action: {}, label: {
        Text("Edit")
          .font(.appFootnote)
          .padding(.trailing, 8)
          .onTapGesture {
            editingTitle = true
          }
      })
        .disabled(editingTitle)
        .opacity(editingTitle ? 0.0 : 1.0)

      VStack(alignment: .leading) {
        if !editingTitle {
          Text(self.viewModel.title)
            .font(.appSubheadline)
            .foregroundColor(.appGrayTextContrast)
            .frame(maxWidth: .infinity, alignment: .leading)

          Spacer()

          Text(self.viewModel.url ?? "")
            .font(.appFootnote)
            .foregroundColor(.appGrayText)
            .frame(maxWidth: .infinity, alignment: .leading)
        } else {}
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
      if !editingLabels {
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
          Text("Labels")
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
        ScrollView {
          LabelsMasonaryView(labels: labelsViewModel.labels,
                             selectedLabels: labelsViewModel.selectedLabels,
                             onLabelTap: onLabelTap)
        }.background(Color.appButtonBackground)
          .cornerRadius(8)
      }
    }
    .padding(16)
    .frame(maxWidth: .infinity, maxHeight: self.editingLabels ? .infinity : 60)
    .background(Color.appButtonBackground)
    .cornerRadius(8)
  }

  func onLabelTap(label: LinkedItemLabel, textChip _: TextChip) {
    if let selectedIndex = labelsViewModel.selectedLabels.firstIndex(of: label) {
      labelsViewModel.selectedLabels.remove(at: selectedIndex)
    } else {
      labelsViewModel.selectedLabels.append(label)
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
          Label("Read Later", systemImage: "text.book.closed.fill")
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
      Button(
        action: {},
        label: {
          Button(action: {}, label: { Label("Dismiss", systemImage: "arrow.down.to.line") })
        }
      )
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

  public var body: some View {
    VStack(alignment: .center) {
      Capsule()
        .fill(.gray)
        .frame(width: 60, height: 4)
        .padding(.top, 10)

      if !editingLabels, !editingTitle {
        titleBar
          .padding(.top, 10)
          .padding(.bottom, 12)
      } else {
        ZStack {
          Button(action: {
            withAnimation {
              if editingLabels {
                if let linkedItem = self.viewModel.linkedItem {
                  self.labelsViewModel.selectedLabels = previousLabels ?? []
                  self.labelsViewModel.saveItemLabelChanges(itemID: linkedItem.unwrappedID,
                                                            dataService: self.viewModel.services.dataService)
                }
              }
              editingTitle = false
              editingLabels = false
            }
          }, label: { Text("Cancel") })
            .frame(maxWidth: .infinity, alignment: .leading)

          Text(editingTitle ? "Edit Title" : "Labels").bold()
            .frame(maxWidth: .infinity, alignment: .center)

          Button(action: {
            withAnimation {
              editingTitle = false
              editingLabels = false

              if editingTitle {
                if let linkedItem = self.viewModel.linkedItem {
                  viewModel.submitTitleEdit(dataService: self.viewModel.services.dataService,
                                            itemID: linkedItem.unwrappedID,
                                            title: self.viewModel.title,
                                            description: linkedItem.description)
                }
              }
            }
          }, label: { Text("Done").bold() })
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(8)
        .padding(.bottom, 4)
      }

      if !editingLabels, !editingTitle {
        titleBox
      }

      if editingTitle {
        ScrollView(showsIndicators: false) {
          VStack(alignment: .center, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
              TextEditor(text: $viewModel.title)
                .lineSpacing(6)
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
            }
          }
          .padding(8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)

        Spacer()
      }

      if !editingTitle {
        labelsSection
          .padding(.top, 12)
          .onTapGesture {
            withAnimation {
              previousLabels = self.labelsViewModel.selectedLabels
              editingLabels = true
            }
          }
      }

      Spacer()

      if !editingLabels, !editingTitle {
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
    .environmentObject(viewModel.services.dataService)
    .task {
      await labelsViewModel.loadLabelsFromStore(dataService: viewModel.services.dataService)
    }
  }
}

struct ApplyLabelsListView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = LabelsViewModel()

  let linkedItem: LinkedItem?

  func isSelected(_ label: LinkedItemLabel) -> Bool {
    viewModel.selectedLabels.contains(where: { $0.id == label.id })
  }

  var body: some View {
    List {
      Section(
        content: {
          ForEach(viewModel.labels.applySearchFilter(viewModel.labelSearchFilter), id: \.self) { label in
            Button(
              action: {
                if isSelected(label) {
                  viewModel.selectedLabels.removeAll(where: { $0.id == label.id })
                } else {
                  viewModel.selectedLabels.append(label)
                }
                if let linkedItem = linkedItem {
                  viewModel.saveItemLabelChanges(itemID: linkedItem.unwrappedID, dataService: dataService)
                }
              },
              label: {
                HStack {
                  TextChip(feedItemLabel: label)
                  Spacer()
                  if isSelected(label) {
                    Image(systemName: "checkmark.circle.fill")
                      .foregroundColor(.checkmarkBlue)
                  } else {
                    Image(systemName: "circle")
                      .foregroundColor(.appGraySolid)
                  }
                }
                .contentShape(Rectangle())
              }
            )
            #if os(iOS)
              .listRowSeparator(.hidden)
            #endif
            .buttonStyle(PlainButtonStyle())
          }

        },
        header: {
          Text("Labels")
            .font(.appFootnote)
            .foregroundColor(.appGrayText)
        }
      )
      #if os(iOS)
        .listRowSeparator(.hidden)
      #endif
      Button(
        action: { viewModel.showCreateLabelModal = true },
        label: {
          HStack {
            Image(systemName: "plus.circle.fill").foregroundColor(.green)
            Text("Create a new Label").foregroundColor(.appGrayTextContrast)
            Spacer()
          }
        }
      )
      .disabled(viewModel.isLoading)
    }
    .listStyle(PlainListStyle())
    .padding(.vertical, 0)
    .task {
      await viewModel.loadLabelsFromStore(dataService: dataService)
    }
    .sheet(isPresented: $viewModel.showCreateLabelModal) {
      CreateLabelView(viewModel: viewModel)
    }
  }
}
