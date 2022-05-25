import Foundation

#if os(iOS)
  import MobileCoreServices
#endif

import UniformTypeIdentifiers

let URLREGEX = #"[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"#

public struct PageScrapePayload {
  public enum ContentType {
    case html
    case pdf
  }

  public let title: String?
  public let html: String?
  public let url: String
  public let contentType: ContentType

  init(url: String, title: String?, html: String?, contentType: String?) {
    self.url = url
    self.title = title
    self.html = html

    // If the content type was specified and we know its PDF, use that
    // otherwise fallback to using file extensions.
    if let contentType = contentType, contentType == "application/pdf" {
      self.contentType = .pdf
    } else {
      self.contentType = url.hasSuffix(".pdf") ? .pdf : .html
    }
  }
}

public struct PageScrapeError: Error {
  public let message: String
}

public enum PageScraper {
  public static func scrape(
    extensionContext: NSExtensionContext?,
    completion: @escaping (Result<PageScrapePayload, PageScrapeError>) -> Void
  ) {
    let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem
    let extensionAttachments = extensionItem?.attachments

    guard let attachments = extensionAttachments else {
      completion(.failure(PageScrapeError(message: "no attachments")))
      return
    }

    var pageScrapePayload: PageScrapePayload?
    let propertyListKey = UTType.propertyList.identifier

    let group = DispatchGroup()

    for attachment in attachments where attachment.hasItemConformingToTypeIdentifier(propertyListKey) {
      group.enter()
      attachment.loadItem(
        forTypeIdentifier: propertyListKey,
        options: nil
      ) { item, _ in
        if let payload = PageScrapePayload.make(item: item) {
          pageScrapePayload = payload
        }
        group.leave()
      }
    }

    group.notify(queue: .main) {
      if let payload = pageScrapePayload {
        completion(.success(payload))
      } else {
        scrapeURLOnly(extensionContext: extensionContext, completion: completion)
      }
    }
  }

  // swiftlint:disable:next function_body_length
  private static func scrapeURLOnly(
    extensionContext: NSExtensionContext?,
    completion: @escaping (Result<PageScrapePayload, PageScrapeError>) -> Void
  ) {
    let urlKey = UTType.url.identifier

    // First look for a URL type
    let urlFound = extensionContext?.inputItems.first { inputItem in
      let itemProvider = (inputItem as? NSExtensionItem)?.attachments?.first(where: { attachment in
        attachment.hasItemConformingToTypeIdentifier(urlKey)
      })
      let hasPublicURL = itemProvider?.hasItemConformingToTypeIdentifier(urlKey) == true
      if hasPublicURL {
        itemProvider?.loadItem(forTypeIdentifier: urlKey, options: nil) { item, _ in
          let shareURL = item as? URL
          let urlString = (item as? Data).flatMap { String(data: $0, encoding: .utf8) }
          let shareUrlFromData = urlString.flatMap { URL(string: $0) }
          let url = shareURL ?? shareUrlFromData
          let pageScrapePayload = PageScrapePayload.make(url: url)

          DispatchQueue.main.async {
            if let payload = pageScrapePayload {
              return completion(.success(payload))
            } else {
              return completion(.failure(PageScrapeError(message: "could not extract url")))
            }
          }
        }
      }
      return hasPublicURL
    }

    if urlFound != nil {
      return
    }

    let textKey = UTType.text.identifier
    // We didn't find a URL type, so check for a string that contains a URL
    let textUrlFound = extensionContext?.inputItems.first { inputItem in
      let itemProvider = (inputItem as? NSExtensionItem)?.attachments?.first(where: { attachment in
        attachment.hasItemConformingToTypeIdentifier(textKey)
      })
      let hasPublicText = itemProvider?.hasItemConformingToTypeIdentifier(textKey) == true
      if hasPublicText {
        itemProvider?.loadItem(forTypeIdentifier: textKey, options: nil) { item, _ in
          var url: URL?
          if let item = item as? String {
            if let range = item.range(of: URLREGEX, options: .regularExpression) {
              let urlStr = item[range]
              url = URL(string: String(urlStr))
            }
          }

          let pageScrapePayload = PageScrapePayload.make(url: url)

          DispatchQueue.main.async {
            if let payload = pageScrapePayload {
              return completion(.success(payload))
            } else {
              return completion(.failure(PageScrapeError(message: "could not extract url")))
            }
          }
        }
      }
      return hasPublicText
    }

    if textUrlFound != nil {
      return
    }

    completion(.failure(PageScrapeError(message: "could not find a link to save")))
  }

  private static func tryScrapeUrlFromText(
    extensionContext: NSExtensionContext?,
    completion: @escaping (Result<PageScrapePayload, PageScrapeError>) -> Void
  ) {
    let urlKey = UTType.url.identifier
    let textKey = UTType.utf16PlainText.identifier
    let inputItem = extensionContext?.inputItems.first as? NSExtensionItem
    let itemProvider = inputItem?.attachments?.first(where: { attachment in
      attachment.hasItemConformingToTypeIdentifier(urlKey)
    })
    let hasPublicURL = itemProvider?.hasItemConformingToTypeIdentifier(urlKey) == true
    let hasPublicText = itemProvider?.hasItemConformingToTypeIdentifier(textKey) == true

    guard hasPublicURL || hasPublicText else {
      completion(.failure(PageScrapeError(message: "no public url")))
      return
    }

    if hasPublicURL {
      itemProvider?.loadItem(forTypeIdentifier: urlKey, options: nil) { item, _ in
        let shareURL = item as? URL
        let urlString = (item as? Data).flatMap { String(data: $0, encoding: .utf8) }
        let shareUrlFromData = urlString.flatMap { URL(string: $0) }
        let url = shareURL ?? shareUrlFromData
        let pageScrapePayload = PageScrapePayload.make(url: url)

        DispatchQueue.main.async {
          if let payload = pageScrapePayload {
            return completion(.success(payload))
          } else {
            return completion(.failure(PageScrapeError(message: "could not extract url")))
          }
        }
      }
    } else {
      itemProvider?.loadItem(forTypeIdentifier: textKey, options: nil) { item, _ in
        var url: URL?
        if let item = item as? String {
          if let range = item.range(of: URLREGEX, options: .regularExpression) {
            let urlStr = item[range]
            url = URL(string: String(urlStr))
          }
        }

        let pageScrapePayload = PageScrapePayload.make(url: url)

        DispatchQueue.main.async {
          if let payload = pageScrapePayload {
            return completion(.success(payload))
          } else {
            return completion(.failure(PageScrapeError(message: "could not extract url")))
          }
        }
      }
    }
  }
}

private extension PageScrapePayload {
  static func make(url: URL?) -> PageScrapePayload? {
    guard let url = url else { return nil }
    return PageScrapePayload(url: url.absoluteString, title: nil, html: nil, contentType: nil)
  }

  static func make(item: NSSecureCoding?) -> PageScrapePayload? {
    let dictionary = item as? NSDictionary
    let results = dictionary?[NSExtensionJavaScriptPreprocessingResultsKey] as? NSDictionary
    guard let url = results?["url"] as? String else { return nil }
    let html = results?["documentHTML"] as? String
    let title = results?["title"] as? String
    let contentType = results?["contentType"] as? String

    return PageScrapePayload(url: url, title: title, html: html, contentType: contentType)
  }
}
