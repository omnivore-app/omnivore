import Binders
import Combine
import SwiftUI

#if os(iOS)
  import PDFKit
  import PSPDFKit
  import PSPDFKitUI

  struct PDFViewer: View {
    struct ShareLink: Identifiable {
      let id: UUID
      let url: URL
    }

    let pdfURL: URL
    let document: Document
    let viewModel: PDFViewerViewModel
    let coordinator: PDFViewCoordinator
    @State var readerView: Bool = false
    @State private var shareLink: ShareLink?

    init(pdfURL: URL, viewModel: PDFViewerViewModel) {
      self.pdfURL = pdfURL
      self.viewModel = viewModel
      self.document = HighlightedDocument(url: pdfURL, viewModel: viewModel)
      self.coordinator = PDFViewCoordinator(document: document, viewModel: viewModel)
    }

    var body: some View {
      PDFView(document: document)
        .useParentNavigationBar(true)
        .updateConfiguration { builder in
          builder.textSelectionShouldSnapToWord = true
        }
        .updateControllerConfiguration { controller in
          print("document is valid", document.isValid)
          coordinator.setController(controller: controller)

          // Disable the Document Editor
          controller.navigationItem.setRightBarButtonItems(
            [controller.thumbnailsButtonItem],
            for: .thumbnails,
            animated: false
          )

          let barButtonItems = [
            UIBarButtonItem(
              image: UIImage(systemName: "textformat"),
              style: .plain,
              target: controller.settingsButtonItem.target,
              action: controller.settingsButtonItem.action
            ),
            UIBarButtonItem(
              image: UIImage(systemName: "book"),
              style: .plain,
              target: coordinator,
              action: #selector(PDFViewCoordinator.toggleReaderView)
            ),
            UIBarButtonItem(
              image: UIImage(systemName: "magnifyingglass"),
              style: .plain,
              target: controller.searchButtonItem.target,
              action: controller.searchButtonItem.action
            )
          ]

          document.areAnnotationsEnabled = true

          coordinator.viewer = self

          if viewModel.feedItem.readingProgressAnchor > 0 {
            let pageIndex = UInt(viewModel.feedItem.readingProgressAnchor)
            controller.setPageIndex(pageIndex, animated: false)
          }

          controller.navigationItem.setRightBarButtonItems(barButtonItems, for: .document, animated: false)
        }
        .onShouldShowMenuItemsForSelectedText(perform: { pageView, menuItems, selectedText in
          let copy = menuItems.first(where: { $0.identifier == "Copy" })
          let highlight = MenuItem(title: "Highlight", block: {
            _ = self.coordinator.highlightSelection(pageView: pageView, selectedText: selectedText)
          })
//          let share = MenuItem(title: "Share", block: {
//            let shortId = self.coordinator.highlightSelection(pageView: pageView, selectedText: selectedText)
//            if let shareURL = viewModel.highlightShareURL(shortId: shortId) {
//              shareLink = ShareLink(id: UUID(), url: shareURL)
//            }
//          })
          return [copy, highlight /* , share */ ].compactMap { $0 }
        })
        .onShouldShowMenuItemsForSelectedAnnotations(perform: { _, menuItems, annotations in
          var result = [MenuItem]()
          if let copy = menuItems.first(where: { $0.identifier == "Copy" }) {
            result.append(copy)
          }

          let remove = MenuItem(title: "Remove", block: {
            self.coordinator.remove(annotations: annotations)
          })
          result.append(remove)

          let highlights = annotations?.compactMap { $0 as? HighlightAnnotation }
          let shortId = highlights.flatMap { coordinator.shortHighlightIds($0).first }

          if let shortId = shortId {
            /*
             let share = MenuItem(title: "Share", block: {
               if let shareURL = viewModel.highlightShareURL(shortId: shortId) {
                 shareLink = ShareLink(id: UUID(), url: shareURL)
               }
             })
             result.append(share)
              */
          }

          return result
        })
        .fullScreenCover(isPresented: $readerView, content: {
          PDFReaderViewController(document: document)
        })
        .accentColor(Color(red: 255 / 255.0, green: 234 / 255.0, blue: 159 / 255.0))
        .sheet(item: $shareLink) {
          ShareSheet(activityItems: [$0.url])
        }
    }

    class PDFViewCoordinator: NSObject, PDFDocumentViewControllerDelegate, PDFViewControllerDelegate {
      let document: Document
      let viewModel: PDFViewerViewModel
      var subscriptions = Set<AnyCancellable>()

      public var viewer: PDFViewer?
      var controller: PDFViewController?

      init(document: Document, viewModel: PDFViewerViewModel) {
        self.document = document
        self.viewModel = viewModel
      }

      func setController(controller: PDFViewController) {
        self.controller = controller

        controller.pageIndexPublisher.sink { event in
          DispatchQueue.main.async {
            let pageIndex = Int(event.pageIndex)
            if let totalPageCount = controller.document?.pageCount {
              let percent = min(100, max(0, ((Double(pageIndex) + 1.0) / Double(totalPageCount)) * 100.0))
              if percent > self.viewModel.feedItem.readingProgress {
                self.viewModel.updateItemReadProgress(percent: percent, anchorIndex: pageIndex)
              }
            }
          }
        }.store(in: &subscriptions)

        controller.documentPublisher.sink { document in
          print("document published", document.isValid)
        }.store(in: &subscriptions)
      }

      func highlightsOverlap(left: HighlightAnnotation, right: HighlightAnnotation) -> Bool {
        for rect in left.rects ?? [] {
          for hrrect in right.rects ?? [] {
            if rect.intersects(hrrect) {
              return true
            }
          }
        }
        return false
      }

      func overlappingHighlights(pageView: PDFPageView, highlight: HighlightAnnotation) -> [HighlightAnnotation] {
        var result = [HighlightAnnotation]()
        let existingId = (highlight.customData?["omnivoreHighlight"] as? [String: String])?["id"]?.lowercased()
        let pageHighlights = document.annotations(at: pageView.pageIndex, type: HighlightAnnotation.self)

        for annotation in pageHighlights {
          if let customHighlight = annotation.customData?["omnivoreHighlight"] as? [String: String] {
            if customHighlight["id"]?.lowercased() == existingId {
              continue
            }
          }
          if highlightsOverlap(left: highlight, right: annotation) {
            result.append(annotation)
          }
        }

        return result
      }

      func highlightSelection(pageView: PDFPageView, selectedText: String) -> String {
        let highlightID = UUID().uuidString.lowercased()
        let quote = quoteFromSelectedText(selectedText)
        let shortId = NanoID.generate(alphabet: NanoID.Alphabet.urlSafe.rawValue, size: 8)
        let highlight = HighlightAnnotation.textOverlayAnnotation(with: pageView.selectionView.selectedGlyphs)!
        highlight.pageIndex = pageView.pageIndex

        highlight.customData = [
          "omnivoreHighlight": [
            "id": highlightID,
            "shortId": shortId,
            "quote": quote,
            "articleId": viewModel.feedItem.id
          ]
        ]
        document.add(annotations: [highlight])

        let overlapping = overlappingHighlights(pageView: pageView, highlight: highlight)

        if let patchData = try? highlight.generateInstantJSON(), let patch = String(data: patchData, encoding: .utf8) {
          if overlapping.isEmpty {
            viewModel.createHighlight(shortId: shortId, highlightID: highlightID, quote: quote, patch: patch)
          } else {
            let overlappingRects = overlapping.map(\.rects).compactMap { $0 }.flatMap { $0 }
            let rects = overlappingRects + (highlight.rects ?? [])
            let boundingBox = rects.reduce(CGRect.null) { $0.union($1) }
            if let mergedHighlight = HighlightAnnotation.textOverlayAnnotation(
              withRects: rects,
              boundingBox: boundingBox,
              pageIndex: Int(pageView.pageIndex)
            ) {
              mergedHighlight.customData = highlight.customData
              document.add(annotations: [mergedHighlight])
              document.remove(annotations: overlapping + [highlight])

              viewModel.mergeHighlight(
                shortId: shortId,
                highlightID: highlightID,
                quote: quote,
                patch: patch,
                overlapHighlightIdList: highlightIds(overlapping)
              )
            }
          }
        }
        DispatchQueue.main.async {
          pageView.selectionView.discardSelection(animated: false)
        }
        return shortId
      }

      public func remove(annotations: [Annotation]?) {
        if let annotations = annotations {
          document.remove(annotations: annotations)
          viewModel.removeHighlights(highlightIds: highlightIds(annotations.compactMap { $0 as? HighlightAnnotation }))
        }
      }

      @objc public func toggleReaderView() {
        if let viewer = self.viewer {
          viewer.readerView = !viewer.readerView
        }
      }

      func shortHighlightIds(_ annotations: [HighlightAnnotation]) -> [String] {
        annotations.compactMap { ($0.customData?["omnivoreHighlight"] as? [String: String])?["shortId"] }
      }

      func highlightIds(_ annotations: [HighlightAnnotation]) -> [String] {
        annotations.compactMap { ($0.customData?["omnivoreHighlight"] as? [String: String])?["id"]?.lowercased() }
      }

      private func quoteFromSelectedText(_ selectedText: String) -> String {
        let result = selectedText
          .replacingOccurrences(of: "-\r\n", with: "")
          .replacingOccurrences(of: "-\r", with: "")
          .replacingOccurrences(of: "-\n", with: "")
          .replacingOccurrences(of: "\r\n", with: " ")
          .replacingOccurrences(of: "\r", with: " ")
          .replacingOccurrences(of: "\n", with: " ")
        return result
      }
    }
  }

  final class HighlightedDocument: Document {
    var highlightsApplied = false
    let viewModel: PDFViewerViewModel

    init(url: URL, viewModel: PDFViewerViewModel) {
      self.viewModel = viewModel

      super.init(dataProviders: [Self.dataProvider(forUrl: url)], loadCheckpointIfAvailable: false)
    }

    private static func dataProvider(forUrl url: URL) -> DataProviding {
      if url.isFileURL {
        return FileDataProvider(fileURL: url)
      } else {
        return URLDataProvider(url: url)
      }
    }

    override func didCreateDocumentProvider(_ documentProvider: PDFDocumentProvider) -> PDFDocumentProvider {
      DispatchQueue.main.async { [self] in
        if self.highlightsApplied {
          return
        }

        var annnotations: [Annotation] = []
        for highlight in self.viewModel.allHighlights() {
          let data = highlight.patch.data(using: String.Encoding.utf8)
          if let data = data {
            guard let annotation = try? Annotation(fromInstantJSON: data, documentProvider: documentProvider) else {
              continue
            }
            annnotations.append(annotation)
          }
        }
        add(annotations: annnotations)

        highlightsApplied = true
      }

      return documentProvider
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) {
      fatalError("init(coder:) has not been implemented")
    }
  }

  struct ShareSheet: UIViewControllerRepresentable {
    typealias Callback = (
      _ activityType: UIActivity.ActivityType?,
      _ completed: Bool,
      _ returnedItems: [Any]?,
      _ error: Error?
    ) -> Void

    let activityItems: [Any]
    let applicationActivities: [UIActivity]? = nil
    let excludedActivityTypes: [UIActivity.ActivityType]? = nil
    let callback: Callback? = nil

    func makeUIViewController(context _: Context) -> UIActivityViewController {
      let controller = UIActivityViewController(
        activityItems: activityItems,
        applicationActivities: applicationActivities
      )
      controller.excludedActivityTypes = excludedActivityTypes
      controller.completionWithItemsHandler = callback
      return controller
    }

    func updateUIViewController(_: UIActivityViewController, context _: Context) {
      // nothing to do here
    }
  }

  struct ShareSheet_Previews: PreviewProvider {
    static var previews: some View {
      ShareSheet(activityItems: ["A string" as NSString])
    }
  }

#elseif os(macOS)
  struct PDFViewer: View {
    let pdfURL: URL
    let viewModel: PDFViewerViewModel

    var body: some View {
      Text(pdfURL.absoluteString)
    }
  }
#endif
