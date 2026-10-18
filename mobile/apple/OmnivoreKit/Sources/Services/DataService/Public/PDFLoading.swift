import CoreData
import Foundation
import Models
import Utils

public extension DataService {
  func loadPDFData(slug: String, downloadURL: String) async throws -> URL? {
    guard let url = URL(string: downloadURL) else {
      throw BasicError.message(messageText: "No PDF URL found")
    }

    var result: (Data, URLResponse)?
    do {
      let request = URLRequest(url: url, timeoutInterval: 120)
      result = try await URLSession.shared.data(for: request)
    } catch {
      print("ERROR DOWNLOADING PDF DATA: ", error)
    }

    guard let httpResponse = result?.1 as? HTTPURLResponse, 200 ..< 300 ~= httpResponse.statusCode else {
      throw BasicError.message(messageText: "pdfFetch failed. no response or bad status code.")
    }

    guard let data = result?.0 else {
      throw BasicError.message(messageText: "pdfFetch failed. no data received.")
    }

    var localPdfURL: URL?

    let tempPath = URL.om_cachesDirectory
      .appendingPathComponent(UUID().uuidString + ".pdf")

    try await backgroundContext.perform { [weak self] in
      let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
      fetchRequest.predicate = NSPredicate(format: "%K == %@", #keyPath(LibraryItem.slug), slug)

      let linkedItem = try? self?.backgroundContext.fetch(fetchRequest).first
      guard let linkedItem = linkedItem else {
        let errorMessage = "pdfFetch failed. could not find LinkedItem from fetch request"
        throw BasicError.message(messageText: errorMessage)
      }

      do {
        try data.write(to: tempPath)
        let localPDF = try PDFUtils.moveToLocal(url: tempPath)
        localPdfURL = PDFUtils.localPdfURL(filename: localPDF)
        linkedItem.tempPDFURL = nil
        linkedItem.localPDF = localPDF
        try self?.backgroundContext.save()
      } catch {
        self?.backgroundContext.rollback()
        let errorMessage = "pdfFetch failed. core data save failed."
        throw BasicError.message(messageText: errorMessage)
      }
    }

    return localPdfURL
  }
}
