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

      let existing = existingItemOrItemId(dataService: dataService, requestID: requestID)
      if let existingItem = existing.existingItem, existingItem.isReadyToRead {
        item = existingItem
        return
      }

      // If the page was locally created, make sure they are synced before we pull content
      await dataService.syncUnsyncedArticleContent(itemID: existing.itemID)

      // Fetch the item and it's content
      let item = await fetchLinkedItem(dataService: dataService, requestID: existing.itemID, username: username)
      if let item = item, let itemID = item.id {
        do {
          let articleContent = try await dataService.fetchArticleContent(itemID: itemID, username: username, requestCount: 0)
          // We've fetched the article content, now reload the item from core data
          if let linkedItem = dataService.viewContext.object(with: item.objectID) as? LinkedItem {
            self.item = linkedItem
          } else {
            self.item = nil
          }
        } catch {
          self.item = nil
        }
      } else {
        self.item = nil
      }
    }

    private func fetchLinkedItem(
      dataService: DataService,
      requestID: String,
      username: String,
      requestCount: Int = 1
    ) async -> LinkedItem? {
      guard requestCount < 7 else {
        errorMessage = "Unable to fetch item."
        return nil
      }

      print("FETCHING", requestID, requestCount)

      if let objectID = try? await dataService.fetchLinkedItem(username: username, itemID: requestID) {
        if let linkedItem = dataService.viewContext.object(with: objectID) as? LinkedItem {
          print(" - FROM DATA SERVICE", linkedItem)
          return linkedItem
        } else {
          errorMessage = "Unable to fetch item."
        }
        return nil
      }

      // Retry on error
      do {
        let retryDelayInNanoSeconds = UInt64(requestCount * 2 * 1_000_000_000)
        try await Task.sleep(nanoseconds: retryDelayInNanoSeconds)

        let existing = existingItemOrItemId(dataService: dataService, requestID: requestID)
        if let existingItem = existing.existingItem, existingItem.isReadyToRead {
          print(" - FROM CORE DATA SERVICE", existingItem)
          return existingItem
        }

        let result = await fetchLinkedItem(
          dataService: dataService,
          requestID: existing.itemID,
          username: username,
          requestCount: requestCount + 1
        )
        if let result = result {
          return result
        }
      } catch {
        errorMessage = "Unable to fetch item."
      }
      return nil
    }

    private func existingItemOrItemId(dataService: DataService, requestID: String) -> (existingItem: LinkedItem?, itemID: String) {
      let fetchRequest: NSFetchRequest<Models.LinkedItem> = LinkedItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "createdId == %@ OR id == %@", requestID, requestID)
      if let existingItem = try? dataService.viewContext.fetch(fetchRequest).first {
        // If the existing item is synced, we can use it
        if let itemID = existingItem.id, existingItem.serverSyncStatus == ServerSyncStatus.isNSync.rawValue {
          item = existingItem
          return (existingItem: item, itemID: itemID)
        }

        // If the existing item is not synced, we might have an updated request id
        if let existingID = existingItem.id {
          return (existingItem: nil, itemID: existingID)
        }
      }

      return (existingItem: nil, itemID: requestID)
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
      if let item = viewModel.item, item.isReadyToRead {
        if let pdfItem = PDFItem.make(item: item), let urlStr = item.pageURLString, let remoteUrl = URL(string: urlStr) {
          PDFViewer(remoteURL: remoteUrl, viewModel: PDFViewerViewModel(pdfItem: pdfItem))
            .navigationBarHidden(true)
            .navigationViewStyle(.stack)
            .accentColor(.appGrayTextContrast)
            .task { viewModel.trackReadEvent() }
        } else {
          WebReaderContainerView(item: item)
            .navigationBarHidden(true)
            .navigationViewStyle(.stack)
            .accentColor(.appGrayTextContrast)
            .task { viewModel.trackReadEvent() }
        }
      } else if let errorMessage = viewModel.errorMessage {
        Text(errorMessage)
      } else {
        ProgressView()
          .task { await viewModel.loadItem(dataService: dataService, requestID: requestID) }
      }
    }
  }
#endif
