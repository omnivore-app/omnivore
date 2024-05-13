import SwiftUI
import Models
import Services
import Views
import MarkdownUI
import Utils
import Transmission

@MainActor
public class DigestConfigViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var digest: DigestResult?
  @Published var chapterInfo: [(DigestChapter, DigestChapterData)]?
  @Published var presentedLibraryItem: String?
  @Published var presentWebContainer = false

  @AppStorage(UserDefaultKey.lastVisitedDigestId.rawValue) var lastVisitedDigestId = ""

  func enableDigest(dataService: DataService) async {
    isLoading = true
    
    do {
      try await dataService.optInFeature(name: "ai-digest")
    } catch {
      if let err as? IneligibleError {
        
      }
    }

    isLoading = false
  }
}

@available(iOS 17.0, *)
@MainActor
struct DigestConfigView: View {
  @StateObject var viewModel = DigestConfigViewModel()
  let dataService: DataService

  @Environment(\.dismiss) private var dismiss

  public init(dataService: DataService) {
    self.dataService = dataService
  }

  var titleBlock: some View {
    HStack {
      Text("Omnivore Digest")
        .font(Font.system(size: 18, weight: .semibold))
      Image.tabDigestSelected
      Spacer()
      closeButton
    }
    .padding(.top, 20)
    .padding(.horizontal, 20)
  }

  var body: some View {
    VStack {
      titleBlock
        .padding(.top, 10)
      itemBody
        .padding(15)

      Spacer()
     }.task {
       await viewModel.load(dataService: dataService)
     }
  }

  var closeButton: some View {
    Button(action: {
      dismiss()
    }, label: {
      Text("Close")
        .foregroundColor(Color.blue)
    })
    .buttonStyle(.plain)
  }

  var logoBlock: some View {
    HStack {
      Image.coloredSmallOmnivoreLogo
        .resizable()
        .frame(width: 20, height: 20)
      Text("Omnivore.app")
        .font(Font.system(size: 14))
        .foregroundColor(Color.themeLibraryItemSubtle)
      Spacer()
    }
  }

  @available(iOS 17.0, *)
  var itemBody: some View {
    VStack(alignment: .leading, spacing: 20) {
      logoBlock

      let description1 =
      """
      Omnivore Digest is a free daily digest of your best recent library items. Omnivore
      filters and ranks all the items recently added to your library, uses AI to summarize them,
      and creates a short library item, email, or a daily podcast you can listen to in our iOS app.

      Note that if you sign up for Digest, your recent library items will be processed by an AI
      service (Anthropic, or OpenAI). Your highlights, notes, and labels will not be sent to the AI
      service.

      Digest is available to all users that have saved at least ten items and added two subscriptions.
      """
      Markdown(description1)
        .lineSpacing(10)
        .accentColor(.appGraySolid)
        .font(.appSubheadline)
        .padding(5)
        .frame(maxWidth: .infinity, alignment: .leading)

      HStack {
        Spacer()

        Button(action: {}, label: { Text("Hide digest") })
          .buttonStyle(RoundedRectButtonStyle())

        Button(action: {
          viewModel.en
        }, label: { Text("Enable digest") })
          .buttonStyle(RoundedRectButtonStyle(color: Color.blue, textColor: Color.white))
      }
    }
    .padding(15)
    .background(Color.themeLabelBackground.opacity(0.6))
    .cornerRadius(5)
  }
}
