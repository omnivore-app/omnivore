import Combine
import Foundation
import Models
import SwiftUI
import Utils

struct AsyncImage: View {
  let isResizable: Bool
  let url: URL?
  @State private var isLoaded = false
  @StateObject private var imageLoader = ImageLoader()

  init(url: URL?, isResizable: Bool = true) {
    self.isResizable = isResizable
    self.url = url
  }

  func load() {
    if let url = url, !isLoaded {
      imageLoader.load(fromUrl: url)
      isLoaded = true
    }
  }

  var body: some View {
    Group {
      #if os(iOS)
        if isResizable {
          Image(uiImage: imageLoader.image ?? imageLoader.placeholder)
            .resizable()
        } else {
          Image(uiImage: imageLoader.image ?? imageLoader.placeholder)
        }
      #elseif os(macOS)
        if isResizable {
          Image(nsImage: imageLoader.image ?? imageLoader.placeholder)
            .resizable()
        } else {
          Image(nsImage: imageLoader.image ?? imageLoader.placeholder)
        }
      #endif
    }
    .onAppear {
      load()
    }
  }
}

#if os(iOS)
  private final class ImageLoader: ObservableObject {
    @Published var image: UIImage?
    @Published var hasFailed = false

    let placeholder = UIImage()

    private var subscriptions = Set<AnyCancellable>()

    func load(fromUrl url: URL) {
      if let cachedImage = ImageCache.shared[url] {
        image = cachedImage
        return
      }

      fetch(url: url).sink(
        receiveCompletion: { [weak self] completion in
          guard case .failure = completion else { return }
          self?.hasFailed = true
        }, receiveValue: { [weak self] data in
          guard let fetchedImage = UIImage(data: data) else {
            self?.hasFailed = true
            return
          }
          ImageCache.shared[url] = fetchedImage
          self?.image = fetchedImage
        }
      )
      .store(in: &subscriptions)
    }
  }

#elseif os(macOS)
  private final class ImageLoader: ObservableObject {
    @Published var image: NSImage?
    @Published var hasFailed = false

    let placeholder = NSImage(systemSymbolName: "photo", accessibilityDescription: "photo-placeholder")!

    private var subscriptions = Set<AnyCancellable>()

    func load(fromUrl url: URL) {
      if let cachedImage = ImageCache.shared[url] {
        image = cachedImage
        return
      }

      fetch(url: url).sink(
        receiveCompletion: { [weak self] completion in
          guard case .failure = completion else { return }
          self?.hasFailed = true
        }, receiveValue: { [weak self] data in
          guard let fetchedImage = NSImage(data: data) else {
            self?.hasFailed = true
            return
          }
          ImageCache.shared[url] = fetchedImage
          self?.image = fetchedImage
        }
      )
      .store(in: &subscriptions)
    }
  }
#endif

func fetch(url: URL) -> AnyPublisher<Data, BasicError> {
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
