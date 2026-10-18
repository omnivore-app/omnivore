import Foundation
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor
public class LibraryAddFeedViewModel: NSObject, ObservableObject {
  let dataService: DataService
  let feedURL: String
  let prefetchContent: Bool
  let folder: String
  let selectedLabels: [LinkedItemLabel]
  let toastOperationHandler: ToastOperationHandler?

  @Published var isLoading = true
  @Published var errorMessage: String = ""
  @Published var showErrorMessage: Bool = false

  @Published var feeds: [Feed] = []
  @Published var selected: [String] = []

  init(dataService: DataService, feedURL: String, prefetchContent: Bool, folder: String, selectedLabels: [LinkedItemLabel], toastOperationHandler: ToastOperationHandler?) {
    self.dataService = dataService
    self.feedURL = feedURL
    self.prefetchContent = prefetchContent
    self.folder = folder
    self.selectedLabels = selectedLabels
    self.toastOperationHandler = toastOperationHandler
  }

  func scanFeed() async {
    isLoading = true
    if let feedURL = URL(string: feedURL) {
      let result = try? await dataService.scanFeed(feedURL: feedURL)
      if let feeds = result {
        self.feeds = feeds
        selected = feeds.map(\.url)
      } else {
        feeds = []
        error("Error adding feed")
      }
    } else {
      error("invalid URL")
    }
    isLoading = false
  }

  func addFeeds() async {
    if let toastOperationHandler = toastOperationHandler {
      toastOperationHandler.update(OperationStatus.isPerforming, "Subscribing...")

      let selected = self.selected

      let addTask = Task.detached(priority: .background) {
        _ = await withTaskGroup(of: Bool.self) { group in
          for feedURL in selected {
            group.addTask {
              (try? await self.dataService.subscribeToFeed(feedURL: feedURL, folder: self.folder, fetchContent: self.prefetchContent)) ?? false
            }
          }

          var successCount = 0
          var failureCount = 0
          for await value in group {
            if value {
              successCount += 1
            } else {
              failureCount += 1
            }
          }

          let hasFailures = failureCount
          DispatchQueue.main.async {
            if hasFailures > 0 {
              toastOperationHandler.update(OperationStatus.failure, "Failed to subscribe to \(hasFailures) feeds")
            } else {
              toastOperationHandler.update(OperationStatus.success, "Subscribed")
            }
          }
        }
      }
      toastOperationHandler.performOperation(addTask)
    } else {
      _ = await withTaskGroup(of: Bool.self) { group in
        for feedURL in selected {
          group.addTask {
            (try? await self.dataService.subscribeToFeed(feedURL: feedURL, folder: self.folder, fetchContent: self.prefetchContent)) ?? false
          }
        }

        var successCount = 0
        var failureCount = 0
        for await value in group {
          if value {
            successCount += 1
          } else {
            failureCount += 1
          }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(4000)) {
          if failureCount > 0 {
            Snackbar.show(message: "Failed to add \(failureCount) feeds", dismissAfter: 3000)
          } else {
            Snackbar.show(message: "Added \(successCount) feed\(successCount == 0 ? "" : "s")", dismissAfter: 3000)
          }
        }
      }
    }
  }

  func setLabelsRule(dataService _: DataService, existingRule _: Rule?, ruleName _: String, filter _: String, labelIDs _: [String]) async {
//    Task {
//      operationMessage = "Creating label rule..."
//      operationStatus = .isPerforming
//      do {
//        // Make sure the labels have been created
//        await loadLabels(dataService: dataService)
//        let existingLabelIDs = labels?.map(\.unwrappedID) ?? []
//        if labelIDs.first(where: { !existingLabelIDs.contains($0) }) != nil {
//          throw BasicError.message(messageText: "Label not created")
//        }
//
//        _ = try await dataService.createOrUpdateAddLabelsRule(
//          existingID: existingRule?.id,
//          name: ruleName,
//          filter: filter,
//          labelIDs: labelIDs
//        )
//        if let newRules = try? await dataService.rules() {
//          if !newRules.contains(where: { $0.name == ruleName }) {
//            throw BasicError.message(messageText: "Rule not created")
//          }
//          rules = newRules
//        }
//        operationMessage = "Rule created"
//        operationStatus = .success
//      } catch {
//        operationMessage = "Failed to create label rule"
//        operationStatus = .failure
//      }
//    }
  }

  func error(_ msg: String) {
    errorMessage = msg
    showErrorMessage = true
    isLoading = false
  }
}

@MainActor
public struct LibraryScanFeedView: View {
  let dismiss: () -> Void
  @StateObject var viewModel: LibraryAddFeedViewModel

  func isSelected(_ url: String) -> Bool {
    viewModel.selected.contains(url)
  }

  var innerBody: some View {
    if viewModel.isLoading {
      AnyView(ProgressView().frame(maxWidth: .infinity, alignment: .center))
    } else if viewModel.feeds.count == 0 {
      AnyView(Text("No feeds found for URL"))
    } else {
      AnyView(List {
        Section("Choose the feeds to add") {
          ForEach(viewModel.feeds, id: \.title) { feed in
            Button(action: {
              if !isSelected(feed.url) {
                viewModel.selected.append(feed.url)
              } else {
                if let idx = viewModel.selected.firstIndex(of: feed.url) {
                  viewModel.selected.remove(at: idx)
                }
              }
            }, label: {
              HStack {
                Text(feed.title)
                Spacer()
                if isSelected(feed.url) {
                  Image(systemName: "checkmark")
                }
              }
              .contentShape(Rectangle())
            })
          }
        }
      })
    }
  }

  public var body: some View {
    Group {
      #if os(iOS)
        Form {
          innerBody
            .navigationTitle("Select Feeds")
            .navigationBarTitleDisplayMode(.inline)
        }.task {
          await viewModel.scanFeed()
        }
      #else
        innerBody
      #endif
    }
    .toolbar {
      ToolbarItem(placement: .barTrailing) {
        if viewModel.selected.count > 0 {
          Button(action: {
            dismiss()
            Snackbar.show(message: "Adding feeds...", dismissAfter: 2000)
            Task {
              await viewModel.addFeeds()
            }
          }, label: {
            Text("Add").bold().disabled(viewModel.selected.count < 1)
          })
        } else {
          Button(action: {
            dismiss()
          }, label: {
            Text("Done").bold()
          })
        }
      }
    }
  }
}
