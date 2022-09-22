import Models
import Services
import SwiftUI
import Views

@MainActor final class TextToSpeechViewModel: ObservableObject {
  @Published var enableAudioPrefetch: Bool = true
//  func cancelSubscription(dataService: DataService) async -> Bool {
//    guard let subscriptionName = subscriptionNameToCancel else { return false }
//
//    do {
//      try await dataService.deleteSubscription(subscriptionName: subscriptionName)
//      let index = subscriptions.firstIndex { $0.name == subscriptionName }
//      if let index = index {
//        subscriptions.remove(at: index)
//      }
//      return true
//    } catch {
//      appLogger.debug("failed to remove subscription")
//      return false
//    }
//  }
}

struct TextToSpeechView: View {
  @EnvironmentObject var audioController: AudioController
  @StateObject var viewModel = TextToSpeechViewModel()

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          Section("Audio Settings") {
            Toggle("Enable audio prefetch", isOn: $viewModel.enableAudioPrefetch)
          }
// Currently the backend doesn't allow overriding the language
//          NavigationLink(destination: TextToSpeechLanguageView()) {
//            Text("Default Language")
//          }
          innerBody
        }
      #elseif os(macOS)
        List {
          innerBody
        }
        .listStyle(InsetListStyle())
      #endif
    }
  }

  private var innerBody: some View {
    Section("Voices") {
      ForEach(VOICELANGUAGES, id: \.key) { language in
        NavigationLink(destination: TextToSpeechVoiceSelectionView(forLanguage: language)) {
          Text(language.name)
        }
      }
    }
//    ForEach(VoiceCategory.allCases, id: \.self) { category in
//      Section(category.rawValue) {
//        ForEach(audioController.voiceList?.filter { $0.category == category } ?? [], id: \.key.self) { voice in
//          Button(action: {
//            audioController.currentVoice = voice.key
//            // self.showVoiceSheet = false
//          }) {
//            HStack {
//              Text(voice.name)
//
//              Spacer()
//
//              if voice.selected {
//                Image(systemName: "checkmark")
//              }
//            }
//            .contentShape(Rectangle())
//          }
//          .buttonStyle(PlainButtonStyle())
//        }
//      }
//    }
  }
}
