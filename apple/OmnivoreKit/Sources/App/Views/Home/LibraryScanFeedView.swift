import Foundation
import Services
import SwiftUI
import Utils

@MainActor
public class LibraryAddFeedViewModel: NSObject, ObservableObject {
  let dataService: DataService
  let feedURL: String

  @Published var isLoading = true
  @Published var errorMessage: String = ""
  @Published var showErrorMessage: Bool = false

  @Published var feeds: [Feed] = []
  @Published var selected: [String] = []

  init(dataService: DataService, feedURL: String) {
    self.dataService = dataService
    self.feedURL = feedURL
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
    _ = await withTaskGroup(of: Bool.self) { group in
      for feedURL in selected {
        group.addTask {
          (try? await self.dataService.subscribeToFeed(feedURL: feedURL)) ?? false
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
          showInLibrarySnackbar("Failed to add \(failureCount) feeds")
        } else {
          showInLibrarySnackbar("Added \(successCount) feed\(successCount == 0 ? "" : "s")")
        }
      }
    }
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
        Button(action: {
          dismiss()
          showInLibrarySnackbar("Adding feeds...")
          Task {
            await viewModel.addFeeds()
          }
        }, label: {
          Text("Done").bold()
        })
      }
    }
  }
}
