#if os(iOS)
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

#endif
