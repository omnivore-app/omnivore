#if os(iOS)
  import UIKit

  public typealias PlatformImage = UIImage
#elseif os(macOS)
  import AppKit

  public typealias PlatformImage = NSImage
#endif

/// Reference: https://www.onswiftwings.com/posts/reusable-image-cache/

public final class ImageCache {
  public static let shared = ImageCache()

  public subscript(_ key: URL) -> PlatformImage? {
    get {
      image(key)
    }
    set {
      insertImage(newValue, url: key)
    }
  }

  public func removeAllObjects() {
    cache.removeAllObjects()
  }

  private let queue = DispatchQueue(label: "app.omnivore.image.cache.queue", attributes: .concurrent)
  private let cache = NSCache<AnyObject, PlatformImage>()

  private init() {
    cache.totalCostLimit = 1024 * 1024 * 50 // 50 MB
  }

  private func image(_ url: URL) -> PlatformImage? {
    var cachedImage: PlatformImage?
    queue.sync {
      cachedImage = cache.object(forKey: url as AnyObject)
    }
    return cachedImage
  }

  private func insertImage(_ image: PlatformImage?, url: URL) {
    guard let image = image else { return }
    queue.async(flags: .barrier) {
      self.cache.setObject(image, forKey: url as AnyObject, cost: image.diskSize)
    }
  }
}

private extension PlatformImage {
  var diskSize: Int {
    #if os(iOS)
      guard let cgImage = cgImage else { return 0 }
      return cgImage.bytesPerRow * cgImage.height
    #elseif os(macOS)
      // Instead of calculating the nsimage size just assume 250k
      // which will allow for up to 200 images in the cache
      (1024 * 1024) / 4
    #endif
  }
}
