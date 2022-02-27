import Combine
import Foundation
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

    let placeholder = UIImage()

    private var cancellable: AnyCancellable?

    func load(fromUrl url: URL) {
      if let cachedImage = ImageCache.shared[url] {
        image = cachedImage
        return
      }

      cancellable = URLSession.shared
        .dataTaskPublisher(for: url)
        .map { UIImage(data: $0.data) }
        .handleEvents(receiveOutput: {
          ImageCache.shared[url] = $0
        })
        .replaceError(with: nil)
        .receive(on: DispatchQueue.main)
        .assign(to: \.image, on: self)
    }
  }

#elseif os(macOS)
  private final class ImageLoader: ObservableObject {
    @Published var image: NSImage?

    let placeholder = NSImage(systemSymbolName: "photo", accessibilityDescription: "photo-placeholder")!

    private var cancellable: AnyCancellable?

    func load(fromUrl url: URL) {
      if let cachedImage = ImageCache.shared[url] {
        image = cachedImage
        return
      }

      cancellable = URLSession.shared
        .dataTaskPublisher(for: url)
        .map { NSImage(data: $0.data) }
        .handleEvents(receiveOutput: {
          ImageCache.shared[url] = $0
        })
        .replaceError(with: nil)
        .receive(on: DispatchQueue.main)
        .assign(to: \.image, on: self)
    }
  }
#endif
