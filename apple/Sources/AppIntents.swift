#if os(iOS)
  import App
  import AppIntents
  import Firebase
  import FirebaseMessaging
  import Foundation
  import Models
  import Services
  import UIKit
  import Utils

  @available(iOS 16.0, *)
  public struct OmnivoreAppShorcuts: AppShortcutsProvider {
    @AppShortcutsBuilder public static var appShortcuts: [AppShortcut] {
      AppShortcut(intent: SaveToOmnivoreIntent(), phrases: ["Save URL to \(.applicationName)"])
    }
  }

//
//  @available(iOS 16.0, *)
//  struct ExportAllTransactionsIntent: AppIntent {
//      static var title: LocalizedStringResource = "Export all transactions"
//
//      static var description =
//          IntentDescription("Exports your transaction history as CSV data.")
//  }

  @available(iOS 16.0, *)
  struct SaveToOmnivoreIntent: AppIntent {
    static var title: LocalizedStringResource = "Save to Omnivore"
    static var description: LocalizedStringResource = "Save a URL to your Omnivore library"

    static var parameterSummary: some ParameterSummary {
      Summary("Save \(\.$link) to your Omnivore library.")
    }

    @Parameter(title: "link")
    var link: URL

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
      do {
        let requestId = UUID().uuidString.lowercased()
        _ = try? await Services().dataService.saveURL(id: requestId, url: link.absoluteString)
        return .result(dialog: "Link saved to Omnivore")
      } catch {
        print("error saving URL: ", error)
      }
      return .result(dialog: "Error saving link")
    }
  }

  @available(iOS 16.4, *)
  struct ReadInOmnivoreIntent: ForegroundContinuableIntent {
    static var title: LocalizedStringResource = "Save and read a URL in Omnivore"
    static var openAppWhenRun: Bool = false

    @Parameter(title: "link")
    var link: URL

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
      let requestId = UUID().uuidString.lowercased()
      _ = try? await Services().dataService.saveURL(id: requestId, url: link.absoluteString)

      throw needsToContinueInForegroundError("Please continue to open the app.") {
        UIApplication.shared.open(URL(string: "omnivore://read/\(requestId)")!)
      }

      return .result(dialog: "I opened the app.")
    }
  }

#endif
