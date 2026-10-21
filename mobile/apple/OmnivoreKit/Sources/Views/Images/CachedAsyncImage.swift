//
//  CachedAsyncImage.swift
//
//
//  Created by Jackson Harper on 11/8/23.
//

// from: https://github.com/pitt500/Pokedex

import SwiftUI

struct CachedAsyncImage<Content>: View where Content: View {
  private let url: URL
  private let scale: CGFloat
  private let transaction: Transaction
  private let content: (AsyncImagePhase) -> Content

  init(
    url: URL,
    scale: CGFloat = 1.0,
    transaction: Transaction = Transaction(),
    @ViewBuilder content: @escaping (AsyncImagePhase) -> Content
  ) {
    self.url = url
    self.scale = scale
    self.transaction = transaction
    self.content = content
  }

  var body: some View {
    if let cached = ImageCache[url] {
      // _ = print("cached \(url.absoluteString)")
      content(.success(cached))
    } else {
      // _ = print("request \(url.absoluteString)")
      AsyncImage(
        url: url,
        scale: scale,
        transaction: transaction
      ) { phase in
        cacheAndRender(phase: phase)
      }
    }
  }

  func cacheAndRender(phase: AsyncImagePhase) -> some View {
    if case let .success(image) = phase {
      ImageCache[url] = image
    }

    return content(phase)
  }
}

private enum ImageCache {
  private static var cache: [URL: Image] = [:]

  static subscript(url: URL) -> Image? {
    get {
      ImageCache.cache[url]
    }
    set {
      ImageCache.cache[url] = newValue
    }
  }
}
