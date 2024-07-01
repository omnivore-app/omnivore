import Combine
import Models
import SwiftUI
import Utils

// swiftlint:disable file_length type_body_length
#if os(iOS)
  import PSPDFKit
  import PSPDFKitUI
  import Services
  import Views

  @MainActor
  struct PDFViewer: View {
    enum SettingsKeys: String {
      case pageTransitionKey = "PDFViewer.pageTransition"
      case pageModeKey = "PDFViewer.pageModeKey"
      case scrollDirectionKey = "PDFViewer.scrollDirectionKey"
      case spreadFittingKey = "PDFViewer.spreadFittingKey"

      func storedValue() -> UInt {
        UInt(UserDefaults.standard.integer(forKey: rawValue))
      }
    }

    final class PDFStateObject: ObservableObject {
      @Published var document: Document?
      @Published var coordinator: PDFViewCoordinator?
      @Published var controllerNeedsConfig = true
    }

    @EnvironmentObject var dataService: DataService

    struct ShareLink: Identifiable {
      let id: UUID
      let url: URL
    }

    let viewModel: PDFViewerViewModel

    @StateObject var pdfStateObject = PDFStateObject()
    @State var readerView: Bool = false
    @State private var shareLink: ShareLink?

    @State private var errorMessage: String?
    @State private var showNotebookView = false
    @State private var showLabelsModal = false
    @State private var hasPerformedHighlightMutations = false
    @State private var errorAlertMessage: String?
    @State private var showErrorAlertMessage = false

    @State private var annotation = ""
    @State private var addNoteHighlight: Highlight?
    @State private var showAnnotationModal = false
    @State private var showSettingsModal = false

    @Environment(\.presentationCoordinator) var presentationCoordinator

    init(viewModel: PDFViewerViewModel) {
      self.viewModel = viewModel
    }

    func saveSettings(configuration: PDFConfiguration) {
      let defaults = UserDefaults.standard
      defaults.set(configuration.pageTransition.rawValue, forKey: SettingsKeys.pageTransitionKey.rawValue)
      defaults.set(configuration.pageMode.rawValue, forKey: SettingsKeys.pageModeKey.rawValue)
      defaults.set(configuration.scrollDirection.rawValue, forKey: SettingsKeys.scrollDirectionKey.rawValue)
      defaults.set(configuration.spreadFitting.rawValue, forKey: SettingsKeys.spreadFittingKey.rawValue)
    }

    func restoreSettings(builder: PDFConfigurationBuilder) {
      if let pageTransition = PageTransition(rawValue: SettingsKeys.pageTransitionKey.storedValue()) {
        builder.pageTransition = pageTransition
      }

      if let pageMode = PageMode(rawValue: SettingsKeys.pageModeKey.storedValue()) {
        builder.pageMode = pageMode
      }

      if let scrollDirection = ScrollDirection(rawValue: SettingsKeys.scrollDirectionKey.storedValue()) {
        builder.scrollDirection = scrollDirection
      }

      if let spreadFitting = PDFConfiguration.SpreadFitting(
        rawValue: Int(SettingsKeys.spreadFittingKey.storedValue())
      ) {
        builder.spreadFitting = spreadFitting
      }
    }

    var body: some View {
      if let document = pdfStateObject.document, let coordinator = pdfStateObject.coordinator {
        PDFView(document: document)
          .useParentNavigationBar(true)
          .updateConfiguration { builder in
            builder.settingsOptions = [.pageTransition, .pageMode, .scrollDirection, .spreadFitting, .appearance]

            restoreSettings(builder: builder)

            builder.textSelectionShouldSnapToWord = true
            builder.shouldAskForAnnotationUsername = false
          }
          .updateControllerConfiguration { controller in
            saveSettings(configuration: controller.configuration)

            // Store config state so we only run this update closure once
            guard pdfStateObject.controllerNeedsConfig else { return }
            coordinator.setController(controller: controller, dataService: dataService)

            let barButtonItems = [
              UIBarButtonItem(
                image: UIImage(systemName: "textformat"),
                style: .plain,
                target: coordinator,
                action: #selector(PDFViewCoordinator.displaySettingsSheet)

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
              ),
              UIBarButtonItem(
                image: UIImage(named: "notebook", in: Bundle(url: ViewsPackage.bundleURL), with: nil),
                style: .plain,
                target: coordinator,
                action: #selector(PDFViewCoordinator.toggleNotebookView)
              ),
              UIBarButtonItem(
                image: UIImage(named: "label", in: Bundle(url: ViewsPackage.bundleURL), with: nil),
                style: .plain,
                target: coordinator,
                action: #selector(PDFViewCoordinator.toggleLabelsView)
              )
            ]

            let leftButtonItems = [
              UIBarButtonItem(
                image: UIImage(named: "chevron-right", in: Bundle(url: ViewsPackage.bundleURL), with: nil),
                style: .plain,
                target: coordinator,
                action: #selector(PDFViewCoordinator.pop)
              )
            ]

            document.areAnnotationsEnabled = true

            coordinator.viewer = self

            if viewModel.pdfItem.readingProgressAnchor > 0 {
              let pageIndex = UInt(viewModel.pdfItem.readingProgressAnchor)
              controller.setPageIndex(pageIndex, animated: false)
            }

            controller.navigationItem.setLeftBarButtonItems(leftButtonItems, for: .document, animated: false)
            controller.navigationItem.setRightBarButtonItems(barButtonItems, for: .document, animated: false)
            pdfStateObject.controllerNeedsConfig = false
          }
          .onShouldShowMenuItemsForSelectedText(perform: { pageView, menuItems, selectedText in
            let copy = menuItems.first(where: { $0.identifier == "Copy" })
            let define = menuItems.first(where: { $0.identifier == "Define" })
            let highlight = MenuItem(title: LocalText.genericHighlight, block: {
              _ = coordinator.highlightSelection(
                pageView: pageView,
                selectedText: selectedText,
                dataService: dataService
              )
            })
            define?.title = "Lookup"
            return [copy, highlight, define].compactMap { $0 }
          })
          .onShouldShowMenuItemsForSelectedAnnotations(perform: { _, menuItems, annotations in
            var result = [MenuItem]()
            if let copy = menuItems.first(where: { $0.identifier == "Copy" }) {
              result.append(copy)
            }
            let note = MenuItem(title: "Note", block: {
              if let highlight = annotations?.compactMap({ $0 as? HighlightAnnotation }).first,
                 let customHighlight = highlight.customData?["omnivoreHighlight"] as? [String: String],
                 let highlightID = customHighlight["id"]?.lowercased(),
                 let selectedHighlight = viewModel.findHighlight(dataService: dataService, highlightID: highlightID)
              {
                addNoteHighlight = selectedHighlight
                annotation = selectedHighlight.annotation ?? ""
                showAnnotationModal = true
              } else {
                errorMessage = "Unable to find highlight"
                showErrorAlertMessage = true
              }
            })
            result.append(note)
            let remove = MenuItem(title: "Remove", block: {
              coordinator.remove(dataService: dataService, annotations: annotations)
            })
            result.append(remove)

            return result
          })
          .sheet(isPresented: $showAnnotationModal) {
            NavigationView {
              HighlightAnnotationSheet(
                annotation: $annotation,
                onSave: {
                  // annotationSaveTransactionID = UUID()
                  if let highlightID = addNoteHighlight?.id {
                    viewModel.updateAnnotation(
                      highlightID: highlightID,
                      annotation: annotation,
                      dataService: dataService
                    )
                    showAnnotationModal = false
                  }
                },
                onCancel: {
                  annotation = ""
                  addNoteHighlight = nil
                  showAnnotationModal = false
                },
                errorAlertMessage: $errorAlertMessage,
                showErrorAlertMessage: $showErrorAlertMessage
              )
            }
            .navigationViewStyle(StackNavigationViewStyle())
          }
          .formSheet(isPresented: $showSettingsModal, modalSize: CGSize(width: 400, height: 475)) {
            NavigationView {
              PDFSettingsView(pdfViewController: coordinator.controller)
            }
            .navigationViewStyle(StackNavigationViewStyle())
          }
          .sheet(isPresented: $readerView, content: {
            PDFReaderViewController(document: document)
          })
          .accentColor(Color(red: 255 / 255.0, green: 234 / 255.0, blue: 159 / 255.0))
          .sheet(item: $shareLink) {
            ShareSheet(activityItems: [$0.url])
          }
          .sheet(isPresented: $showNotebookView, onDismiss: onNotebookViewDismissal) {
            NotebookView(
              viewModel: NotebookViewModel(item: viewModel.pdfItem.item),
              hasHighlightMutations: $hasPerformedHighlightMutations,
              onDeleteHighlight: { highlightId in
                coordinator.removeHighlightFromPDF(highlightId: highlightId)
              }
            )
          }
          .sheet(isPresented: $showLabelsModal) {
            ApplyLabelsView(mode: .item(viewModel.pdfItem.item), onSave: { _ in
              showLabelsModal = false
            })
          }.task {
            viewModel.updateItemReadProgress(
              dataService: dataService,
              percent: viewModel.pdfItem.item.readingProgress,
              anchorIndex: Int(viewModel.pdfItem.item.readingProgressAnchor)
            )
          }
      } else if let errorMessage = errorMessage {
        Text(errorMessage)
      } else {
        ProgressView()
          .task {
            // NOTE: the issue here is the PDF is downloaded, but saved to a URL we don't know about
            // because it is changed.
            let pdfURL = await viewModel.downloadPDF(dataService: dataService)
            if let pdfURL = pdfURL {
              let document = HighlightedDocument(url: pdfURL, viewModel: viewModel)
              pdfStateObject.document = document
              pdfStateObject.coordinator = PDFViewCoordinator(document: document, viewModel: viewModel)
            } else {
              errorMessage = "Unable to download PDF: \(pdfURL?.description ?? "")"
            }
          }
      }
    }

    func onNotebookViewDismissal() {
      guard hasPerformedHighlightMutations else { return }

      hasPerformedHighlightMutations.toggle()
    }

    @MainActor
    class PDFViewCoordinator: NSObject, PDFDocumentViewControllerDelegate, PDFViewControllerDelegate {
      let document: Document
      let viewModel: PDFViewerViewModel
      var subscriptions = Set<AnyCancellable>()

      public var viewer: PDFViewer?
      public var controller: PDFViewController?

      init(document: Document, viewModel: PDFViewerViewModel) {
        self.document = document
        self.viewModel = viewModel
      }

      func setController(controller: PDFViewController, dataService: DataService) {
        self.controller = controller

        controller.pageIndexPublisher.sink { event in
          DispatchQueue.main.async {
            let pageIndex = Int(event.pageIndex)
            if let totalPageCount = controller.document?.pageCount {
              let percent = min(100, max(0, ((Double(pageIndex) + 1.0) / Double(totalPageCount)) * 100.0))
              self.viewModel.updateItemReadProgress(
                dataService: dataService,
                percent: percent,
                anchorIndex: pageIndex,
                force: true
              )
            }
          }
        }.store(in: &subscriptions)

        controller.documentPublisher.sink { document in
          print("document published", document.isValid)
        }.store(in: &subscriptions)
      }

      func removeHighlightFromPDF(highlightId: String) {
        for pageIndex in 0 ..< document.pageCount {
          let pageHighlights = document.annotations(at: pageIndex, type: HighlightAnnotation.self)

          for annotation in pageHighlights {
            if let customHighlight = annotation.customData?["omnivoreHighlight"] as? [String: String] {
              if customHighlight["id"]?.lowercased() == highlightId {
                if !document.remove(annotations: [annotation]) {
                  Snackbar.show(message: "Error removing highlight", dismissAfter: 2000)
                }
              }
            }
          }
        }
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

      func heightBefore(pageIndex: PageIndex) -> Double {
        var totalHeight = 0.0
        for idx in 0 ..< pageIndex {
          if let page = document.pageInfoForPage(at: idx) {
            totalHeight += page.size.height
          }
        }
        return totalHeight
      }

      func documentTotalHeight() -> Double {
        var totalHeight = 0.0
        for idx in 0 ..< document.pageCount {
          if let page = document.pageInfoForPage(at: idx) {
            totalHeight += page.size.height
          }
        }
        return totalHeight
      }

      func highlightTop(pageView: PDFPageView, highlight: HighlightAnnotation) -> Double {
        if let pageInfo = pageView.pageInfo {
          return pageInfo.size.height - highlight.boundingBox.minY
        }

        return 0.0
      }

      // swiftlint:disable:next function_body_length
      func highlightSelection(pageView: PDFPageView, selectedText: String, dataService: DataService) -> String {
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
            "articleId": viewModel.pdfItem.itemID
          ]
        ]
        document.add(annotations: [highlight])

        let overlapping = overlappingHighlights(pageView: pageView, highlight: highlight)

        if let patchData = try? highlight.generateInstantJSON(), let patch = String(data: patchData, encoding: .utf8) {
          let top = highlightTop(pageView: pageView, highlight: highlight)
          let positionPercent = (heightBefore(pageIndex: pageView.pageIndex) + top) / documentTotalHeight()

          if overlapping.isEmpty {
            viewModel.createHighlight(
              dataService: dataService,
              shortId: shortId,
              highlightID: highlightID,
              quote: quote,
              patch: patch,
              positionPercent: positionPercent,
              positionAnchorIndex: Int(pageView.pageIndex)
            )
          } else {
            let overlappingRects = overlapping.map(\.rects).compactMap { $0 }.flatMap { $0 }
            let rects = overlappingRects + (highlight.rects ?? [])
            let boundingBox = rects.reduce(CGRect.null) { $0.union($1) }
            if let mergedHighlight = HighlightAnnotation.textOverlayAnnotation(
              withRects: rects,
              boundingBox: boundingBox,
              pageIndex: Int(pageView.pageIndex)
            ) {
              let top = boundingBox.minY
              let positionPercent = (heightBefore(pageIndex: pageView.pageIndex) + top) / documentTotalHeight()

              mergedHighlight.customData = highlight.customData
              document.add(annotations: [mergedHighlight])
              document.remove(annotations: overlapping + [highlight])

              viewModel.mergeHighlight(
                dataService: dataService,
                shortId: shortId,
                highlightID: highlightID,
                quote: quote,
                patch: patch,
                positionPercent: positionPercent,
                positionAnchorIndex: Int(pageView.pageIndex),
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

      public func remove(dataService: DataService, annotations: [Annotation]?) {
        if let annotations = annotations {
          document.remove(annotations: annotations)
          viewModel.removeHighlights(
            dataService: dataService,
            highlightIds: highlightIds(annotations.compactMap { $0 as? HighlightAnnotation })
          )
        }
      }

      @objc public func pop() {
        if let viewer = self.viewer {
          viewer.presentationCoordinator.dismiss()
        }
      }

      @objc public func toggleReaderView() {
        if let viewer = self.viewer {
          viewer.readerView = !viewer.readerView
        }
      }

      @objc public func displaySettingsSheet() {
        if let viewer = self.viewer {
          viewer.showSettingsModal = true
        }
      }

      @objc public func toggleNotebookView() {
        if let viewer = self.viewer {
          viewer.showNotebookView = !viewer.showNotebookView
        }
      }

      @objc public func toggleLabelsView() {
        if let viewer = self.viewer {
          viewer.showLabelsModal = !viewer.showLabelsModal
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
      if !highlightsApplied {
        DispatchQueue.main.async { [self] in
          self.applyHighlights(documentProvider: documentProvider)
        }
      }

      return documentProvider
    }

    private func applyHighlights(documentProvider: PDFDocumentProvider) {
      viewModel.loadHighlightPatches { [weak self] highlightPatches in
        var annnotations: [Annotation] = []
        for patch in highlightPatches {
          guard let data = patch.data(using: String.Encoding.utf8) else { continue }
          let annotation = try? Annotation(fromInstantJSON: data, documentProvider: documentProvider)
          guard let annotation = annotation else { continue }
          annnotations.append(annotation)
        }
        self?.add(annotations: annnotations)

        self?.highlightsApplied = true
      }
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
    let remoteURL: URL
    let viewModel: PDFViewerViewModel

    var body: some View {
      Text(remoteURL.absoluteString)
    }
  }
#endif
