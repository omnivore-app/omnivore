//
//  PDFUtils.swift
//
//
//  Created by Jackson Harper on 6/3/22.
//

import CoreImage
import Foundation
import QuickLookThumbnailing
import UIKit

public enum PDFUtils {
  public static func copyToLocal(url: URL) throws -> String {
    let subPath = UUID().uuidString + ".pdf"
    let dest = FileManager.default
      .urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(subPath)

    try FileManager.default.copyItem(at: url, to: dest)
    return subPath
  }

  public static func moveToLocal(url: URL) throws -> String {
    let subPath = UUID().uuidString + ".pdf"
    let dest = FileManager.default
      .urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(subPath)

    try FileManager.default.moveItem(at: url, to: dest)
    return subPath
  }

  public static func localPdfURL(filename: String) -> URL? {
    let url = FileManager.default
      .urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(filename)
    return url
  }

  public static func exists(filename: String?) -> Bool {
    if let filename = filename, let localPdfURL = localPdfURL(filename: filename) {
      return FileManager.default.fileExists(atPath: localPdfURL.absoluteString)
    }
    return false
  }

  public static func titleFromPdfFile(_ urlStr: String) -> String {
    let url = URL(string: urlStr)
    if let url = url {
      return url.lastPathComponent
    }
    return urlStr
  }

  public static func titleFromUrl(_ urlStr: String) -> String {
    let url = URL(string: urlStr)
    if let url = url {
      return url.lastPathComponent
    }
    return urlStr
  }

  public static func thumbnailUrl(localUrl: URL) -> URL {
    var thumbnailUrl = localUrl
    thumbnailUrl.appendPathExtension(".jpg")
    return thumbnailUrl
  }

  public static func createThumbnailFor(inputUrl: URL) async throws -> URL? {
    let size = CGSize(width: 80, height: 80)
    let scale = await UIScreen.main.scale
    let outputUrl = thumbnailUrl(localUrl: inputUrl)

    // Create the thumbnail request.
    let request =
      QLThumbnailGenerator.Request(
        fileAt: inputUrl,
        size: size,
        scale: scale,
        representationTypes: .all
      )

    // Retrieve the singleton instance of the thumbnail generator and generate the thumbnails.
    let generator = QLThumbnailGenerator.shared
    return try await withCheckedThrowingContinuation { continuation in
      generator.saveBestRepresentation(for: request, to: outputUrl, contentType: UTType.jpeg.identifier) { error in
        if let error = error {
          continuation.resume(throwing: error)
          return
        }
        continuation.resume(returning: outputUrl)
      }
    }
  }
}
