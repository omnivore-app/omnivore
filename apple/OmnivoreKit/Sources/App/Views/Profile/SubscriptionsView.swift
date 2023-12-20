import CoreData
import Models
import Services
import SwiftUI
import Transmission
import Views

enum OperationStatus {
  case none
  case isPerforming
  case success
  case failure
}

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
  @Published var rules = [Rule]()
  @Published var labels = [LinkedItemLabel]()

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
    }

    await loadLabelsFromStore(dataService: dataService)

    isLoading = false
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

  func updateSubscription(dataService: DataService, subscription: Subscription, folder: String? = nil, fetchContent: Bool? = nil) async {
    operationMessage = "Updating subscription..."
    operationStatus = .isPerforming
    do {
      try await dataService.updateSubscription(subscription.subscriptionID, folder: folder, fetchContent: fetchContent)
      operationMessage = "Subscription updated"
      operationStatus = .success
    } catch {
      operationMessage = "Failed to update subscription"
      operationStatus = .failure
    }
  }

  func setLabelsRule(dataService: DataService, ruleName: String, filter: String, labelIDs: [String]) async {
    async {
      operationMessage = "Creating label rule..."
      operationStatus = .isPerforming
      do {
        try await dataService.createAddLabelsRule(name: ruleName, filter: filter, labelIDs: labelIDs)
        operationMessage = "Rule created"
        operationStatus = .success
      } catch {
        operationMessage = "Failed to create label rule"
        operationStatus = .failure
      }
    }
  }
}

struct OperationToast: View {
  @ObservedObject var viewModel: SubscriptionsViewModel

  var body: some View {
    VStack {
      HStack {
        if viewModel.operationStatus == .isPerforming {
          Text(viewModel.operationMessage ?? "Performing...")
          Spacer()
          ProgressView()
        } else if viewModel.operationStatus == .success {
          Text(viewModel.operationMessage ?? "Success")
          Spacer()
        } else if viewModel.operationStatus == .failure {
          Text(viewModel.operationMessage ?? "Failure")
          Spacer()
          Button(action: { viewModel.showOperationToast = false }, label: {
            Text("Done").bold()
          })
        }
      }
      .padding(10)
      .frame(minHeight: 50)
      .frame(maxWidth: .infinity)
      .background(Color(hex: "2A2A2A"))
      .cornerRadius(4.0)
      .tint(Color.green)
    }
    .padding(.bottom, 70)
    .padding(.horizontal, 10)
    .ignoresSafeArea(.all, edges: .bottom)
  }
}

struct SubscriptionsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = SubscriptionsViewModel()
  @State private var deleteConfirmationShown = false
  @State private var showDeleteCompleted = false

  @State private var showAddFeedView = false

  var body: some View {
    Group {
      WindowLink(level: .alert, transition: .move(edge: .bottom), isPresented: $viewModel.showOperationToast) {
        OperationToast(viewModel: viewModel)
      } label: {
        EmptyView()
      }
      if viewModel.isLoading {
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
    .navigationTitle("Subscriptions")
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
    #endif
  }

  private var innerBody: some View {
    Group {
      Section("Feeds") {
        if viewModel.feeds.count <= 0, !viewModel.isLoading {
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
        } else {
          ForEach(viewModel.feeds, id: \.subscriptionID) { subscription in
            PresentationLink(transition: UIDevice.isIPad ? .popover : .sheet(detents: [.medium])) {
              SubscriptionSettingsView(
                subscription: subscription,
                viewModel: viewModel,
                dataService: dataService,
                prefetchContent: subscription.fetchContent,
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
                prefetchContent: subscription.fetchContent,
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

  @State var prefetchContent = false
  @State var deleteConfirmationShown = false
  @State var showDeleteCompleted = false
  @State var folderSelection: String = ""
  @State var showLabelsSelector = false

  let unsubscribe: (_: Subscription) -> Void

  @Environment(\.dismiss) private var dismiss

  var ruleName: String {
    if let url = subscription.url, subscription.type == .newsletter {
      return "system.autoLabel.(\(url))"
    }
    return "system.autoLabel.(\(subscription.name))"
  }

  var ruleFilter: String {
    if let url = subscription.url, subscription.type == .newsletter {
      return "rss:\"\(url)\""
    }
    return "subscription:\"\(subscription.name)\""
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
      .onChange(of: prefetchContent) { newValue in
        Task {
          viewModel.showOperationToast = true
          await viewModel.updateSubscription(dataService: dataService, subscription: subscription, fetchContent: newValue)
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1500)) {
            viewModel.showOperationToast = false
          }
        }
      }
    }
  }

  var labelRuleRow: some View {
    HStack {
      Text("Add Labels")
      Spacer()
      Button(action: { showLabelsSelector = true }, label: {
        if let rule = viewModel.rules.first(where: { $0.name == ruleName }) {
          let labelIDs = rule.actions.flatMap(\.params)
          let labelNames = Array(labelIDs.compactMap { labelID in
            viewModel.labels.first(where: { $0.unwrappedID == labelID })?.unwrappedName
          })

          Text("[\(labelNames.joined(separator: ","))]")
        } else {
          Text("[none]")
        }
      })
    }
  }

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
          Toggle(isOn: $prefetchContent, label: { Text("Prefetch Content:") })
            .onAppear {
              prefetchContent = subscription.fetchContent
            }
        }
        folderRow
        labelRuleRow
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
      ApplyLabelsView(mode: .list([]), onSave: { labels in
        Task {
          viewModel.showOperationToast = true
          await viewModel.setLabelsRule(
            dataService: dataService,
            ruleName: ruleName,
            filter: ruleFilter,
            labelIDs: labels.map(\.unwrappedID)
          )
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1500)) {
            viewModel.showOperationToast = false
          }
        }
      })
    }
  }
}
