import Models
import Services
import SwiftUI
import Views

@MainActor final class SubscriptionsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var subscriptions = [Subscription]()
  @Published var popularSubscriptions = [Subscription]()
  @Published var hasNetworkError = false

  func loadSubscriptions(dataService: DataService) async {
    isLoading = true

    do {
      subscriptions = try await dataService.subscriptions()
    } catch {
      hasNetworkError = true
    }

    isLoading = false
  }
}

struct SubscriptionsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = SubscriptionsViewModel()
  let footerText = "Describe subscriptions here."

  var body: some View {
    Group {
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
    .task { await viewModel.loadSubscriptions(dataService: dataService) }
  }

  private var innerBody: some View {
    Group {
      ForEach(viewModel.subscriptions, id: \.subscriptionID) { subscription in
        Button(
          action: {},
          label: { Text(subscription.name) }
        )
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
          Button(
            role: .destructive,
            action: {
//              itemToRemove = item
//              confirmationShown = true
            },
            label: {
              Image(systemName: "trash")
            }
          )
        }
      }
    }
    .navigationTitle("Subscriptions")
  }
}
