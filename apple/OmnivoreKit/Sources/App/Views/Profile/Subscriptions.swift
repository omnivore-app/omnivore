import Models
import Services
import SwiftUI
import Transmission
import Views

enum UnsubscribeState {
  case none
  case isUnsubscribing
  case unsubscribeSuccess
  case unsubscribeFailure
}

@MainActor final class SubscriptionsViewModel: ObservableObject {
  @Published var isLoading = true
  @Published var feeds = [Subscription]()
  @Published var newsletters = [Subscription]()
  @Published var hasNetworkError = false
  @Published var subscriptionNameToCancel: String?
  @Published var presentingSubscription: Subscription?
  @Published var unsubscribeState: UnsubscribeState = .none

  func loadSubscriptions(dataService: DataService) async {
    isLoading = true

    do {
      let subscriptions = try await dataService.subscriptions().filter { $0.status == SubscriptionStatus.active }
      feeds = subscriptions.filter { $0.type == .feed }
      newsletters = subscriptions.filter { $0.type == .newsletter }
    } catch {
      hasNetworkError = true
    }

    isLoading = false
  }

  func cancelSubscription(dataService _: DataService, subscription: Subscription) async {
    unsubscribeState = .isUnsubscribing
    let subscriptionName = subscription.name

    //   do {
    //     try await dataService.deleteSubscription(subscriptionName: subscriptionName)
//      let index = subscriptions.firstIndex { $0.name == subscriptionName }
//      if let index = index {
//        subscriptions.remove(at: index)
//      }
//    unsubscribeState = .unsubscribeSuccess
//    } catch {
//      appLogger.debug("failed to remove subscription")
//      unsubscribeState = .unsubscribeFailure
//    }
  }
}

struct UnsubscribeToast: View {
  @ObservedObject var viewModel: SubscriptionsViewModel

  var body: some View {
    HStack {
      if viewModel.unsubscribeState == .isUnsubscribing {
        Text("Unsubscribing...")
        Spacer()
        ProgressView()
      } else if viewModel.unsubscribeState == .unsubscribeSuccess {
        Text("You have been unsubscribed.")
        Spacer()
        Button(action: {
          
        }, label: {
          Text("Done").bold()
        })
      } else if viewModel.unsubscribeState == .unsubscribeFailure {
        Text("There was an error unsubscribing")
        Spacer()
        Button(action: {
          
        }, label: {
          Text("Done").bold()
        })
      }
    }
    .frame(minHeight: 50)
    .frame(maxWidth: .infinity)
    .padding(.bottom, 30)
    .padding(.horizontal, 15)
    .background(Color.systemBackground)
  }
}

struct SubscriptionsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = SubscriptionsViewModel()
  @State private var deleteConfirmationShown = false
  @State private var showDeleteCompleted = false

  @State private var showSubscriptionsSheet = false
  @State private var showUnsubscribeToast = false

  var body: some View {
    Group {
      WindowLink(level: .alert, transition: .move(edge: .bottom).combined(with: .opacity), isPresented: $showUnsubscribeToast) {
        UnsubscribeToast(viewModel: viewModel)
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
    .formSheet(isPresented: $showSubscriptionsSheet) {
      if let presentingSubscription = viewModel.presentingSubscription {
        SubscriptionSettingsView(
          subscription: presentingSubscription,
          viewModel: viewModel,
          dataService: dataService,
          dismiss: { showSubscriptionsSheet = false },
          unsubscribe: { subscription in
            showSubscriptionsSheet = false

            viewModel.unsubscribeState = .isUnsubscribing
            showUnsubscribeToast = true
            Task {
              await viewModel.cancelSubscription(dataService: dataService, subscription: subscription)
            }
          }
        )
      }
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
        ForEach(viewModel.feeds, id: \.subscriptionID) { subscription in
          Button(action: {
            viewModel.presentingSubscription = subscription
            showSubscriptionsSheet = true
          }, label: {
            SubscriptionCell(subscription: subscription)
          })
        }
      }
//      Section("Newsletters") {
//        ForEach(viewModel.newsletters, id: \.subscriptionID) { subscription in
//          SubscriptionCell(subscription: subscription)
//            .swipeActions(edge: .trailing) {
//              Button(
//                role: .destructive,
//                action: {
//                  deleteConfirmationShown = true
//                  viewModel.subscriptionNameToCancel = subscription.name
//                },
//                label: {
//                  Image(systemName: "trash")
//                }
//              )
//            }
//            .onTapGesture {
//              expandedSubscription = subscription
//              showSubscriptionsSheet = true
//            }
//        }
//      }
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

struct SubscriptionSettingsView: View {
  let subscription: Subscription
  let viewModel: SubscriptionsViewModel
  let dataService: DataService

  @State var prefetchContent = false
  @State var deleteConfirmationShown = false
  @State var showDeleteCompleted = false

  let dismiss: () -> Void
  let unsubscribe: (_: Subscription) -> Void

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
        Toggle(isOn: $prefetchContent, label: { Text("Prefetch Content:").foregroundColor(.appGrayText) })
        HStack {
          Text("Destination Folder:")
            .foregroundColor(.appGrayText)
          Spacer()
          Menu(content: {}, label: {
            Text("Following <>")
          })
        }
      }.listStyle(.insetGrouped)

      Spacer()
      Button("Unsubscribe", role: .destructive) { deleteConfirmationShown = true }
        .frame(maxWidth: .infinity)
        .buttonStyle(RoundedRectButtonStyle(color: Color.red, textColor: Color.white))
    }
    .frame(minWidth: 200, minHeight: 200)
    .alert("Are you sure you want to cancel this subscription?", isPresented: $deleteConfirmationShown) {
      Button("Yes", role: .destructive) {
        unsubscribe(subscription)
      }
      Button("No", role: .cancel) {
        viewModel.subscriptionNameToCancel = nil
      }
    }
  }
}
