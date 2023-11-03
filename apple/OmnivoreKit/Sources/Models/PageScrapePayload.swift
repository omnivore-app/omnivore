import Foundation

#if os(iOS)
  import MobileCoreServices
#endif

import UniformTypeIdentifiers

let URLREGEX = #"[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"#

public struct HighlightData {
  public let highlightHTML: String
  public let highlightText: String

  public static func make(dict: NSDictionary?) -> HighlightData? {
    if
      let dict = dict,
      let highlightHTML = dict["highlightHTML"] as? String,
      let highlightText = dict["highlightText"] as? String
    {
      return HighlightData(highlightHTML: highlightHTML, highlightText: highlightText)
    }
    return nil
  }
}

public struct PageScrapePayload {
  public enum ContentType {
    case none
    case pdf(localUrl: URL)
    case html(html: String, title: String?, iconURL: URL?, highlightData: HighlightData?)
  }

  public let url: String
  public let contentType: ContentType

  init(url: String) {
    self.url = url
    self.contentType = .none
  }

  init(url: String, localUrl: URL) {
    self.url = url
    self.contentType = .pdf(localUrl: localUrl)
  }

  init(localUrl: URL) {
    self.url = localUrl.absoluteString
    self.contentType = .pdf(localUrl: localUrl)
  }

  init(url: String, title: String?, html: String, iconURL: URL?, highlightData: HighlightData?) {
    self.url = url
    self.contentType = .html(html: html, title: title, iconURL: iconURL, highlightData: highlightData)
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
    let PDFKey = UTType.pdf.identifier
    let propertyListKey = UTType.propertyList.identifier

    let group = DispatchGroup()

    for attachment in attachments where attachment.hasItemConformingToTypeIdentifier(PDFKey) {
      group.enter()
      attachment.loadItem(
        forTypeIdentifier: PDFKey,
        options: nil
      ) { item, _ in
        if let payload = PageScrapePayload.make(item: item) {
          pageScrapePayload = payload
        }
        group.leave()
      }
    }

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
    return PageScrapePayload(url: url.absoluteString)
  }

  static func make(item: NSSecureCoding?) -> PageScrapePayload? {
    if let dictionary = item as? NSDictionary {
      return makeFromDictionary(dictionary)
    }
    if let url = item as? NSURL {
      return makeFromURL(url as URL)
    }
    if let data = item as? NSData {
      return makeFromData(data)
    }
    return nil
  }

  static func sharedContainerURL() -> URL {
    #if os(iOS)
      let appGroupID = "group.app.omnivoreapp"
    #else
      let appGroupID = "QJF2XZ86HB.app.omnivore.app"
    #endif
    return FileManager.default.containerURL(
      forSecurityApplicationGroupIdentifier: appGroupID
    )!
  }

  static func makeFromData(_ data: NSData) -> PageScrapePayload? {
    // Copy PDFs into a temporary file where they are staged for processing.
    var fileURL = sharedContainerURL()
    let filePath = UUID().uuidString.lowercased() + ".pdf"
    fileURL.appendPathComponent(filePath)

    do {
      try data.write(to: fileURL)
      return PageScrapePayload(localUrl: fileURL)
    } catch {
      print("error copying file locally", error)
      return nil
    }
  }

  static func makeFromURL(_ url: URL) -> PageScrapePayload? {
    if url.isFileURL {
      let type = try? url.resourceValues(forKeys: [.typeIdentifierKey]).typeIdentifier
      if type == UTType.pdf.identifier {
        // Copy PDFs into a temporary file where they are staged for processing.
        var dest = sharedContainerURL()
        let localFile = UUID().uuidString.lowercased() + ".pdf"
        dest.appendPathComponent(localFile)
        do {
          try FileManager.default.copyItem(at: url, to: dest)
          return PageScrapePayload(url: url.absoluteString, localUrl: dest)
        } catch {
          print("error copying file locally", error)
        }
      }

      // If file is not a pdf then return nil
      return nil
    }
    return PageScrapePayload(url: url.absoluteString)
  }

  static func makeFromDictionary(_ dictionary: NSDictionary) -> PageScrapePayload? {
    let results = dictionary[NSExtensionJavaScriptPreprocessingResultsKey] as? NSDictionary
    guard let url = results?["url"] as? String else { return nil }
    let html = results?["originalHTML"] as? String
    let title = results?["title"] as? String
    let contentType = results?["contentType"] as? String
    var iconURL: URL?

    if let urlStr = results?["iconURL"] as? String {
      iconURL = URL(string: urlStr)
    }

    // If we were not able to capture any HTML, treat this as a URL and
    // see if the backend can do better.
    if html == nil || html!.isEmpty {
      return PageScrapePayload(url: url)
    }

    // If its a PDF that we opened through Safari we don't have access to the
    // file content, so pass the URL to the backend and let it download it.
    if contentType == "application/pdf" {
      return PageScrapePayload(url: url)
    }

    if let html = html {
      return PageScrapePayload(url: url,
                               title: title,
                               html: html,
                               iconURL: iconURL,
                               highlightData: HighlightData.make(dict: results))
    }

    return PageScrapePayload(url: url)
  }
}
