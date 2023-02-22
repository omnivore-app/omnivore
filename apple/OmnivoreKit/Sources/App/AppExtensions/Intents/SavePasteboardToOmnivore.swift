//
//  SavePasteboardToOmnivore.swift
//
//
//  Created by Jackson Harper on 2/6/23.
//

import AppIntents
import Services
import SwiftUI

@available(iOS 16.0, *)
struct SaveLinkToOmnivoreIntent: AppIntent {
  static var title: LocalizedStringResource = "Show Sport Progress"

  static var parameterSummary: some ParameterSummary {
    Summary("Save \(\.$link) to your Omnivore library.")
  }

  @Parameter(title: "link")
  var link: URL

  @MainActor
  func perform() async throws -> some IntentResult {
    do {
      let services = Services()
      let requestId = UUID().uuidString.lowercased()
      _ = try await services.dataService.saveURL(id: requestId, url: link.absoluteString)

      return .result(dialog: "Link saved to Omnivore")
    } catch {
      print("error saving URL: ", error)
    }
    return .result(dialog: "Error saving link")
  }
}

// @available(iOS 16.0, *)
// struct ReadInOmnivoreIntent: AppIntent {
//  static var title: LocalizedStringResource = "Read saved link"
//  static var description = IntentDescription("Reads a link you have already saved to your library")
//  static var openAppWhenRun: Bool = true
//
//  @Parameter(title: "requestID")
//  var link: String
//
//  func perform() async throws -> some IntentResult {
//    .result(dialog: "Opening in Omnivore")
//  }
// }
//
// @available(iOS 16.0, *)
// struct OmnivoreShortcuts: AppShortcutsProvider {
//  static var appShortcuts: [AppShortcut] {
//    AppShortcut(intent: SaveLinkToOmnivoreIntent(), phrases: ["Save to \(.applicationName)"])
//  }
// }
