import PDFKit
import SwiftUI

#if os(macOS)
  public struct PDFWrapperView: NSViewRepresentable {
    let pdfURL: URL

    public init(pdfURL: URL) {
      self.pdfURL = pdfURL
    }

    public func makeNSView(context _: Context) -> PDFView {
      let pdfView = PDFView()
      if let document = PDFDocument(url: pdfURL) {
        pdfView.document = document
      }
      return pdfView
    }

    public func updateNSView(_: PDFView, context _: Context) {}
  }
#endif

#if os(iOS)
  struct PDFWrapperView: UIViewRepresentable {
    let pdfURL: URL

    func makeUIView(context _: Context) -> PDFView {
      let pdfView = PDFView()
      if let document = PDFDocument(url: pdfURL) {
        pdfView.displayMode = .singlePageContinuous
        pdfView.autoScales = true
        pdfView.displayDirection = .vertical
        pdfView.document = document
      }
      return pdfView
    }

    func updateUIView(_: PDFView, context _: Context) {}
  }
#endif
