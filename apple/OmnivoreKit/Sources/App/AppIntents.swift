#if os(iOS)
  import AppIntents
  import Services
  import SwiftUI

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
    func perform() async throws -> some IntentResult & ReturnsValue {
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

#endif
