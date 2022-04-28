import Foundation
import Models
import SwiftUI
import Utils

enum AsyncImageStatus {
  case loading
  case loaded(image: Image)
  case error
}

struct AsyncLoadingImage<Content: View>: View {
  let viewBuilder: (AsyncImageStatus) -> Content
  let url: URL
  @StateObject private var imageLoader = ImageLoader()

  init(url: URL, @ViewBuilder viewBuilder: @escaping (AsyncImageStatus) -> Content) {
    self.url = url
    self.viewBuilder = viewBuilder
  }

  var body: some View {
    viewBuilder(imageLoader.status)
      .task { await imageLoader.load(fromUrl: url) }
  }
}

@MainActor private final class ImageLoader: ObservableObject {
  @Published var status: AsyncImageStatus = .loading
  var loadStarted = false

  func load(fromUrl url: URL) async {
    guard !loadStarted else { return }
    loadStarted = true

    if let cachedImage = ImageCache.shared[url] {
      #if os(iOS)
        status = .loaded(image: Image(uiImage: cachedImage))
      #else
        status = .loaded(image: Image(nsImage: cachedImage))
      #endif
      return
    }

    if let imageData = try? await fetchImageData(url: url) {
      #if os(iOS)
        let fetchedImage = UIImage(data: imageData)
      #else
        let fetchedImage = NSImage(data: imageData)
      #endif

      guard let fetchedImage = fetchedImage else {
        status = .error
        return
      }
      ImageCache.shared[url] = fetchedImage

      #if os(iOS)
        status = .loaded(image: Image(uiImage: fetchedImage))
      #else
        status = .loaded(image: Image(nsImage: fetchedImage))
      #endif
    } else {
      status = .error
    }
  }
}

private func fetchImageData(url: URL) async throws -> Data {
  do {
    let (data, response) = try await URLSession.shared.data(from: url)

    if let httpResponse = response as? HTTPURLResponse, 200 ..< 300 ~= httpResponse.statusCode {
      return data
    } else {
      throw BasicError.message(messageText: "failed")
    }
  } catch {
    throw BasicError.message(messageText: "failed")
  }
}
