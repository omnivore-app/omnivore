import CoreData
import Models
import Services
import SwiftUI
import Transmission
import Views

@MainActor
struct ToastOperationHandler {
  let performOperation: (_: Sendable?) -> Void
  let update: (_: OperationStatus, _: String) -> Void
}

typealias OperationStatusHandler = (_: OperationStatus) -> Void

@MainActor final class SubscriptionsViewModel: ObservableObject {
  @Published var isLoading = true
  @Published var feeds = [Subscription]()
  @Published var newsletters = [Subscription]()
  @Published var rules: [Rule]?
  @Published var labels: [LinkedItemLabel]?

  @Published var hasNetworkError = false
  @Published var subscriptionNameToCancel: String?
  @Published var presentingSubscription: Subscription?

  @Published var showOperationToast = false
  @Published var operationStatus: OperationStatus = .none
  @Published var operationMessage: String?

  func loadSubscriptions(dataService: DataService) async {
    isLoading = true

    do {
      let subscriptions = try await dataService.subscriptions().filter { $0.status == SubscriptionStatus.active }
      feeds = subscriptions.filter { $0.type == .feed }
      newsletters = subscriptions.filter { $0.type == .newsletter }
      hasNetworkError = false
    } catch {
      print("error fetching subscriptions: ", error)
      hasNetworkError = true
    }

    do {
      // Also try to get the rules for auto labeling
      rules = try await dataService.rules()
    } catch {
      print("error fetching rules and labels", error)
      rules = []
    }

    await loadLabels(dataService: dataService)

    isLoading = false
  }

  func loadLabels(dataService: DataService) async {
    _ = try? await dataService.labels()
    await loadLabelsFromStore(dataService: dataService)
  }

  func loadLabelsFromStore(dataService: DataService) async {
    let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()

    let fetchedLabels = await dataService.viewContext.perform {
      try? fetchRequest.execute()
    }

    labels = fetchedLabels ?? []
  }

  func cancelSubscription(dataService: DataService, subscription: Subscription) async {
    operationMessage = "Unsubscribing..."
    operationStatus = .isPerforming

    do {
      try await dataService.deleteSubscription(subscriptionName: subscription.name, subscriptionId: subscription.subscriptionID)
      var list = subscription.type == .feed ? feeds : newsletters
      let index = list.firstIndex { $0.subscriptionID == subscription.subscriptionID }
      if let index = index {
        list.remove(at: index)
        switch subscription.type {
        case .feed:
          feeds = list
        case .newsletter:
          newsletters = list
        }
      }
      operationMessage = "Unsubscribed"
      operationStatus = .success
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(2000)) {
        self.showOperationToast = false
      }
    } catch {
      appLogger.debug("failed to remove subscription")
      operationMessage = "Failed to unsubscribe"
      operationStatus = .failure
    }
  }

  func updateSubscription(dataService: DataService, subscription: Subscription, folder: String? = nil, fetchContentType: FetchContentType? = nil) async {
    operationMessage = "Updating subscription..."
    operationStatus = .isPerforming
    do {
      try await dataService.updateSubscription(subscription.subscriptionID, folder: folder, fetchContentType: fetchContentType)
      operationMessage = "Subscription updated"
      operationStatus = .success
    } catch {
      operationMessage = "Failed to update subscription"
      operationStatus = .failure
    }
  }

  func setLabelsRule(dataService: DataService, existingRule: Rule?, ruleName: String, filter: String, labelIDs: [String]) async {
    Task {
      operationMessage = "Creating label rule..."
      operationStatus = .isPerforming
      do {
        // Make sure the labels have been created
        await loadLabels(dataService: dataService)
        let existingLabelIDs = labels?.map(\.unwrappedID) ?? []
        if labelIDs.first(where: { !existingLabelIDs.contains($0) }) != nil {
          throw BasicError.message(messageText: "Label not created")
        }

        _ = try await dataService.createOrUpdateAddLabelsRule(
          existingID: existingRule?.id,
          name: ruleName,
          filter: filter,
          labelIDs: labelIDs
        )
        if let newRules = try? await dataService.rules() {
          if !newRules.contains(where: { $0.name == ruleName }) {
            throw BasicError.message(messageText: "Rule not created")
          }
          rules = newRules
        }
        operationMessage = "Rule created"
        operationStatus = .success
      } catch {
        operationMessage = "Failed to create label rule"
        operationStatus = .failure
      }
    }
  }
}

struct SubscriptionsView: View {
  @EnvironmentObject var dataService: DataService
  @Environment(\.dismiss) private var dismiss

  @StateObject var viewModel = SubscriptionsViewModel()
  @State private var deleteConfirmationShown = false
  @State private var showDeleteCompleted = false

  @State private var showAddFeedView = false

  var body: some View {
    Group {
      WindowLink(level: .alert, transition: .move(edge: .bottom), isPresented: $viewModel.showOperationToast) {
        OperationToast(operationMessage: $viewModel.operationMessage, showOperationToast: $viewModel.showOperationToast, operationStatus: $viewModel.operationStatus)
      } label: {
        EmptyView()
      }.buttonStyle(.plain)

      if viewModel.feeds.isEmpty, viewModel.newsletters.isEmpty, viewModel.isLoading {
        ProgressView()
      } else if viewModel.hasNetworkError {
        VStack {
          Text(LocalText.subscriptionsErrorRetrieving).multilineTextAlignment(.center)
          Button(
            action: { Task { await viewModel.loadSubscriptions(dataService: dataService) } },
            label: { Text(LocalText.genericRetry) }
          )
          .buttonStyle(RoundedRectButtonStyle())
        }
      } else if viewModel.feeds.isEmpty, viewModel.newsletters.isEmpty {
        VStack(alignment: .center) {
          Spacer()
          Text(LocalText.subscriptionsNone)
          Spacer()
        }
      } else {
        #if os(iOS)
          Form {
            innerBody
          }
        #elseif os(macOS)
          List {
            innerBody
          }
          .listStyle(InsetListStyle())
        #endif
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: Notification.Name("ScrollToTop"))) { _ in
      dismiss()
    }
    .sheet(isPresented: $showAddFeedView) {
      let handler = ToastOperationHandler(performOperation: { sendable in
        self.viewModel.showOperationToast = true

        Task {
          _ = await sendable
          viewModel.isLoading = true
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(2000)) {
            Task {
              await self.viewModel.loadSubscriptions(dataService: dataService)
              self.viewModel.showOperationToast = false
            }
          }
        }
      }, update: { state, text in
        viewModel.operationStatus = state
        viewModel.operationMessage = text
      })

      NavigationView {
        LibraryAddFeedView(dismiss: {
          showAddFeedView = false
        }, toastOperationHandler: handler)
          .navigationViewStyle(.stack)
      }
      .navigationViewStyle(.stack)
    }
    .task {
      await viewModel.loadSubscriptions(dataService: dataService)
    }
    .refreshable {
      Task {
        await viewModel.loadSubscriptions(dataService: dataService)
      }
    }
    .onDisappear {
      viewModel.showOperationToast = false
    }
    .navigationTitle("Subscriptions")
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
    #endif
  }

  private var emptyView: some View {
    VStack(alignment: .center, spacing: 20) {
      Text("You don't have any Feed items.")
        .font(Font.system(size: 18, weight: .bold))

      Text("Add an RSS/Atom feed")
        .foregroundColor(Color.blue)
        .onTapGesture {
          showAddFeedView = true
        }
    }
    .frame(minHeight: 80)
    .frame(maxWidth: .infinity)
    .padding()
  }

  private var innerBody: some View {
    List {
      Section("Feeds") {
        if viewModel.feeds.count <= 0, !viewModel.isLoading {
          emptyView
        } else {
          ForEach(viewModel.feeds, id: \.subscriptionID) { subscription in
            PresentationLink(transition: UIDevice.isIPad ? .popover : .sheet(detents: [.medium])) {
              SubscriptionSettingsView(
                subscription: subscription,
                viewModel: viewModel,
                dataService: dataService,
                fetchContentType: subscription.fetchContentType,
                folderSelection: subscription.folder,
                unsubscribe: { _ in
                  viewModel.operationStatus = .isPerforming
                  viewModel.showOperationToast = true
                  Task {
                    await viewModel.cancelSubscription(dataService: dataService, subscription: subscription)
                  }
                }
              ).background(Color.systemBackground)
            } label: {
              SubscriptionCell(subscription: subscription)
            }
          }
          Button(action: { showAddFeedView = true }, label: {
            Label(title: {
              Text("Add a feed")
            }, icon: {
              Image.addLink
            })
          })
        }
      }

      if viewModel.newsletters.count > 0, !viewModel.isLoading {
        Section("Newsletters") {
          ForEach(viewModel.newsletters, id: \.subscriptionID) { subscription in
            PresentationLink(transition: UIDevice.isIPad ? .popover : .sheet(detents: [.medium])) {
              SubscriptionSettingsView(
                subscription: subscription,
                viewModel: viewModel,
                dataService: dataService,
                fetchContentType: subscription.fetchContentType,
                folderSelection: subscription.folder,
                unsubscribe: { _ in
                  viewModel.operationStatus = .isPerforming
                  viewModel.showOperationToast = true
                  Task {
                    await viewModel.cancelSubscription(dataService: dataService, subscription: subscription)
                  }
                }
              )
            } label: {
              SubscriptionCell(subscription: subscription)
            }
          }
        }
      }
    }
    .navigationTitle(LocalText.subscriptionsGeneric)
  }
}

struct SubscriptionRow<Content: View>: View {
  let subscription: Subscription
  let useImageSpacer: Bool

  @ViewBuilder let trailingButton: Content

  var body: some View {
    HStack {
      Group {
        if let icon = subscription.icon, let imageURL = URL(string: icon) {
          AsyncImage(url: imageURL) { phase in
            if let image = phase.image {
              image
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 40, height: 40)
                .cornerRadius(6)
            } else if phase.error != nil {
              Color.clear.frame(width: 40, height: 40, alignment: .top)
            } else {
              Color.clear
                .frame(width: 40, height: 40)
                .cornerRadius(2)
            }
          }
        } else if useImageSpacer {
          Color.clear
            .frame(width: 40, height: 40)
            .cornerRadius(2)
        }
      }.padding(.trailing, 10)

      VStack(alignment: .leading, spacing: 6) {
        Text(subscription.name)
          .font(.appCallout)
          .lineSpacing(1.25)
          .foregroundColor(.appGrayTextContrast)
          .fixedSize(horizontal: false, vertical: true)

        if let updatedDate = subscription.updatedAt {
          Text("Last received: \(updatedDate.formatted())")
            .font(.appCaption)
            .foregroundColor(.appGrayText)
            .fixedSize(horizontal: false, vertical: true)
        }
      }
      .multilineTextAlignment(.leading)
      .padding(.vertical, 8)

      Spacer()

      trailingButton
    }.frame(minHeight: 50)
  }
}

struct SubscriptionCell: View {
  let subscription: Subscription

  var body: some View {
    SubscriptionRow(subscription: subscription, useImageSpacer: true, trailingButton: {
      Image(systemName: "ellipsis")
    })
  }
}

@MainActor
struct SubscriptionSettingsView: View {
  let subscription: Subscription
  let viewModel: SubscriptionsViewModel
  let dataService: DataService

  @State var fetchContentType: FetchContentType
  @State var deleteConfirmationShown = false
  @State var showDeleteCompleted = false
  @State var folderSelection: String = ""
  @State var showLabelsSelector = false

  @State var isLoadingRule = false

  let unsubscribe: (_: Subscription) -> Void

  @Environment(\.dismiss) private var dismiss

  var existingRule: Rule? {
    viewModel.rules?.first { $0.name == ruleName }
  }

  var ruleName: String {
    if let url = subscription.url, subscription.type == .feed {
      return "system.autoLabel.(\(url))"
    }
    return "system.autoLabel.(\(subscription.name))"
  }

  var ruleFilter: String {
    if let url = subscription.url, subscription.type == .feed {
      return "rss:\"\(url)\""
    }
    return "subscription:\"\(subscription.name)\""
  }

  var ruleLabels: [LinkedItemLabel]? {
    if let labelIDs = existingRule?.actions.flatMap(\.params) {
      return Array(labelIDs.compactMap { labelID in
        viewModel.labels?.first(where: { $0.unwrappedID == labelID })
      })
    }
    return nil
  }

  var fetchContentRow: some View {
    Picker(selection: $fetchContentType, content: {
      Text("Always").tag(FetchContentType.always)
      Text("Never").tag(FetchContentType.never)
      Text("When empty").tag(FetchContentType.whenEmpty)
    }, label: { Text("Fetch link") })
    .pickerStyle(MenuPickerStyle())
    .onChange(of: fetchContentType) { newValue in
      Task {
        viewModel.showOperationToast = true
        await viewModel.updateSubscription(
          dataService: dataService,
          subscription: subscription,
          fetchContentType: newValue
        )
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1500)) {
          viewModel.showOperationToast = false
        }
      }
    }
  }

  var folderRow: some View {
    HStack {
      Picker("Destination Folder", selection: $folderSelection) {
        Text("Inbox").tag("inbox")
        Text("Following").tag("following")
      }
      .pickerStyle(MenuPickerStyle())
      .onChange(of: folderSelection) { newValue in
        Task {
          viewModel.showOperationToast = true
          await viewModel.updateSubscription(dataService: dataService, subscription: subscription, folder: newValue)
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1500)) {
            viewModel.showOperationToast = false
          }
        }
      }
    }
  }

  var feedRow: some View {
    VStack {
      Text("Feed URL")
        .frame(maxWidth: .infinity, alignment: .leading)
      Text(subscription.url ?? "")
        .foregroundColor(Color.appGrayText)
        .frame(maxWidth: .infinity, alignment: .leading)
        .lineLimit(1)
    }
    .contextMenu(ContextMenu(menuItems: {
      Button(action: {
        #if os(iOS)
          UIPasteboard.general.string = subscription.url
        #endif

        #if os(macOS)
          let pasteBoard = NSPasteboard.general
          pasteBoard.clearContents()
          pasteBoard.writeObjects([subscription.url as NSString])
        #endif
      }, label: { Text("Copy URL") })
    }))
  }

  var emailRow: some View {
    VStack {
      Text("Received by")
        .frame(maxWidth: .infinity, alignment: .leading)
      Text(subscription.newsletterEmailAddress ?? "")
        .foregroundColor(Color.appGrayText)
        .frame(maxWidth: .infinity, alignment: .leading)
        .lineLimit(1)
    }
    .contextMenu(ContextMenu(menuItems: {
      Button(action: {
        #if os(iOS)
          UIPasteboard.general.string = subscription.newsletterEmailAddress
        #endif

        #if os(macOS)
          let pasteBoard = NSPasteboard.general
          pasteBoard.clearContents()
          pasteBoard.writeObjects([subscription.newsletterEmailAddress as NSString])
        #endif
      }, label: { Text("Copy Address") })
    }))
  }

  var labelRuleRow: some View {
    HStack {
      Text("Add Labels")
      Spacer()
      if isLoadingRule || viewModel.rules != nil {
        Button(action: { showLabelsSelector = true }, label: {
          if let ruleLabels = ruleLabels {
            let labelNames = ruleLabels.map(\.unwrappedName)
            Text("[\(labelNames.joined(separator: ","))]")
          } else {
            Text("Create Rule")
          }
        }).tint(Color.blue)
      } else {
        ProgressView()
      }
    }
  }
//  
//  var notificationRuleRow: some View {
//    HStack {
//      Text("Add Labels")
//      Spacer()
//      if isLoadingRule || viewModel.rules != nil {
//        Button(action: { showLabelsSelector = true }, label: {
//          if let ruleLabels = ruleLabels {
//            let labelNames = ruleLabels.map(\.unwrappedName)
//            Text("[\(labelNames.joined(separator: ","))]")
//          } else {
//            Text("Create Rule")
//          }
//        }).tint(Color.blue)
//      } else {
//        ProgressView()
//      }
//    }
//  }

  var body: some View {
    VStack {
      SubscriptionRow(subscription: subscription, useImageSpacer: false, trailingButton: {
        Button(action: {
          dismiss()
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
      })
        .padding(.top, 15)
        .padding(.horizontal, 15)

      List {
        if subscription.type != .newsletter {
          fetchContentRow
        }

        folderRow
        labelRuleRow

        if subscription.type == .feed {
          feedRow
        }
        if subscription.type == .newsletter {
          emailRow
        }
      }.listStyle(.insetGrouped)

      Spacer()
      Button("Unsubscribe", role: .destructive) { deleteConfirmationShown = true }
        .frame(maxWidth: .infinity)
        .buttonStyle(RoundedRectButtonStyle(color: Color.red, textColor: Color.white))
    }
    .frame(width: UIDevice.isIPad ? 400 : nil, height: UIDevice.isIPad ? 300 : nil)
    .alert("Are you sure you want to cancel this subscription?", isPresented: $deleteConfirmationShown) {
      Button("Yes", role: .destructive) {
        dismiss()
        unsubscribe(subscription)
      }
      Button("No", role: .cancel) {
        viewModel.subscriptionNameToCancel = nil
      }
    }
    .sheet(isPresented: $showLabelsSelector) {
      ApplyLabelsView(mode: .list(ruleLabels ?? []), onSave: { labels in
        Task {
          isLoadingRule = true
          viewModel.showOperationToast = true
          await viewModel.setLabelsRule(
            dataService: dataService,
            existingRule: existingRule,
            ruleName: ruleName,
            filter: ruleFilter,
            labelIDs: labels.map(\.unwrappedID)
          )
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1500)) {
            viewModel.showOperationToast = false
            isLoadingRule = true
          }
        }
      })
    }
  }
}
