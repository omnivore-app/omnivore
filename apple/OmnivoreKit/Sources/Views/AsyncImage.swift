import Combine
import Foundation
import Models
import SwiftUI
import Utils

enum AsyncImageStatus {
  case loading
  case loaded(image: Image)
  case error
}

struct AsyncImage<Content: View>: View {
  let viewBuilder: (AsyncImageStatus) -> Content
  let url: URL
  @StateObject private var imageLoader = ImageLoader()

  init(url: URL, @ViewBuilder viewBuilder: @escaping (AsyncImageStatus) -> Content) {
    self.url = url
    self.viewBuilder = viewBuilder
  }

  var body: some View {
    viewBuilder(imageLoader.status)
      .onAppear {
        imageLoader.load(fromUrl: url)
      }
  }
}

private final class ImageLoader: ObservableObject {
  @Published var status: AsyncImageStatus = .loading
  var loadStarted = false

  private var subscriptions = Set<AnyCancellable>()

  func load(fromUrl url: URL) {
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

    fetch(url: url).sink(
      receiveCompletion: { [weak self] completion in
        guard case .failure = completion else { return }
        self?.status = .error
      }, receiveValue: { [weak self] data in
        #if os(iOS)
          let fetchedImage = UIImage(data: data)
        #else
          let fetchedImage = NSImage(data: data)#endif
        guard let fetchedImage = fetchedImage else {
          self?.status = .error
          return
        }
        ImageCache.shared[url] = fetchedImage

        #if os(iOS)
          self?.status = .loaded(image: Image(uiImage: fetchedImage))
        #else
          self?.status = .loaded(image: Image(nsImage: fetchedImage))
        #endif
      }
    )
    .store(in: &subscriptions)
  }
}

private func fetch(url: URL) -> AnyPublisher<Data, BasicError> {
  let request = URLRequest(url: url)

  return URLSession.DataTaskPublisher(request: request, session: .shared)
    .tryMap { data, response in
      guard let httpResponse = response as? HTTPURLResponse, 200 ..< 300 ~= httpResponse.statusCode else {
        throw BasicError.message(messageText: "failed")
      }
      return data
    }
    .mapError { _ in
      BasicError.message(messageText: "failed")
    }
    .receive(on: DispatchQueue.main)
    .eraseToAnyPublisher()
}
