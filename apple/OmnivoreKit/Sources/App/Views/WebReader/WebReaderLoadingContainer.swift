import CoreData
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

      let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "id == %@", requestID)
      if let existingItem = try? dataService.viewContext.fetch(fetchRequest).first,
         existingItem.serverSyncStatus == ServerSyncStatus.isNSync.rawValue
      {
        print("USING EXISTING ITEM", existingItem.serverSyncStatus)
        item = existingItem
        return
      }

      // If the page was locally created, make sure they are synced before we pull content
      await dataService.syncUnsyncedArticleContent(itemID: requestID)
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

    @EnvironmentObject var dataService: DataService
    @StateObject var viewModel = WebReaderLoadingContainerViewModel()

    public var body: some View {
      if let item = viewModel.item {
        WebReaderContainerView(item: item)
          .navigationBarHidden(true)
          .navigationViewStyle(.stack)
          .accentColor(.appGrayTextContrast)
          .task { viewModel.trackReadEvent() }
      } else if let errorMessage = viewModel.errorMessage {
        Text(errorMessage)
      } else {
        ProgressView()
          .task { await viewModel.loadItem(dataService: dataService, requestID: requestID) }
      }
    }
  }
#endif
