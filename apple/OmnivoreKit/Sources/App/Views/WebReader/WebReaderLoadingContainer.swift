import Models
import Services
import SwiftUI
import Utils

#if os(iOS)
  @MainActor final class WebReaderLoadingContainerViewModel: ObservableObject {
    @Published var item: LinkedItem?
    @Published var errorMessage: String?

    func loadItem(dataService: DataService, requestID: String) async {
      let username: String? = await {
        if let cachedUsername = dataService.currentViewer?.username {
          return cachedUsername
        }

        if let viewerObjectID = try? await dataService.fetchViewer() {
          let viewer = dataService.viewContext.object(with: viewerObjectID) as? Viewer
          return viewer?.unwrappedUsername
        }

        return nil
      }()

      guard let username = username else { return }

      await fetchLinkedItem(dataService: dataService, requestID: requestID, username: username)
    }

    private func fetchLinkedItem(
      dataService: DataService,
      requestID: String,
      username: String,
      requestCount: Int = 1
    ) async {
      guard requestCount < 7 else {
        errorMessage = "Unable to fetch item."
        return
      }

      if let objectID = try? await dataService.fetchLinkedItem(username: username, itemID: requestID) {
        if let linkedItem = dataService.viewContext.object(with: objectID) as? LinkedItem {
          item = linkedItem
        } else {
          errorMessage = "Unable to fetch item."
        }
        return
      }

      // Retry on error
      do {
        let retryDelayInNanoSeconds = UInt64(requestCount * 2 * 1_000_000_000)
        try await Task.sleep(nanoseconds: retryDelayInNanoSeconds)
        await fetchLinkedItem(
          dataService: dataService,
          requestID: requestID,
          username: username,
          requestCount: requestCount + 1
        )
      } catch {
        errorMessage = "Unable to fetch item."
      }
    }

    func trackReadEvent() {
      guard let item = item else { return }

      EventTracker.track(
        .linkRead(
          linkID: item.unwrappedID,
          slug: item.unwrappedSlug,
          originalArticleURL: item.unwrappedPageURLString
        )
      )
    }
  }

  public struct WebReaderLoadingContainer: View {
    let requestID: String
    let handleClose: () -> Void

    @EnvironmentObject var dataService: DataService
    @StateObject var viewModel = WebReaderLoadingContainerViewModel()

    public var body: some View {
      if let item = viewModel.item {
        WebReaderContainerView(item: item, isPresentedModally: true)
          .navigationBarHidden(true)
          .accentColor(.appGrayTextContrast)
          .task { viewModel.trackReadEvent() }
      } else if let errorMessage = viewModel.errorMessage {
        Text(errorMessage)
      } else {
        ProgressView()
          .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
              Button(
                action: handleClose,
                label: {
                  Image(systemName: "xmark")
                    .foregroundColor(.appGrayTextContrast)
                }
              )
            }
          }
          .task { await viewModel.loadItem(dataService: dataService, requestID: requestID) }
      }
    }
  }
#endif
