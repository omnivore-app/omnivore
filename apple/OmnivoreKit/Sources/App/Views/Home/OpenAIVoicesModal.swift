// swiftlint:disable line_length

//
//  CommunityModal.swift
//
//
//  Created by Jackson Harper on 12/7/22.
//

#if os(iOS)
  import Foundation
  import Models
  import Services
  import SwiftUI
  import Views

  struct OpenAIVoiceItem {
    let name: String
    let key: String
  }

  public struct OpenAIVoicesModal: View {
    @Environment(\.dismiss) private var dismiss

    let audioController: AudioController

    let message: String = """
    We've added six new voices powered by OpenAI and enabled them for all users. If you are already using our Ultra Realistic voices, don't worry, trying these voices will not remove you from the ultra realistic beta.

    [Tell your friends about Omnivore](https://omnivore.app)
    """

    @State var playbackSample: String?

    let voices = [
      OpenAIVoiceItem(name: "Alloy", key: "openai-alloy"),
      OpenAIVoiceItem(name: "Echo", key: "openai-echo"),
      OpenAIVoiceItem(name: "Fable", key: "openai-fable"),
      OpenAIVoiceItem(name: "Onyx", key: "openai-onyx"),
      OpenAIVoiceItem(name: "Nova", key: "openai-nova"),
      OpenAIVoiceItem(name: "Shimmer", key: "openai-shimmer")
    ]

    var closeButton: some View {
      Button(action: {
        dismiss()
      }, label: {
        ZStack {
          Circle()
            .foregroundColor(Color.circleButtonBackground)
            .frame(width: 30, height: 30)

          Image(systemName: "xmark")
            .resizable(resizingMode: Image.ResizingMode.stretch)
            .foregroundColor(Color.circleButtonForeground)
            .aspectRatio(contentMode: .fit)
            .font(Font.title.weight(.bold))
            .frame(width: 12, height: 12)
        }
      })
    }

    public var body: some View {
      HStack {
        Text("New voices powered by OpenAI")
          .font(Font.system(size: 20, weight: .bold))
        Spacer()
        closeButton
      }
      .padding(.top, 16)
      .padding(.horizontal, 16)

      List {
        Section {
          let parsedMessage = try? AttributedString(markdown: message,
                                                    options: .init(interpretedSyntax: .inlineOnly))
          Text(parsedMessage ?? "")
            .multilineTextAlignment(.leading)
            .foregroundColor(Color.appGrayTextContrast)
            .accentColor(.blue)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 16)
        }

        Section {
          ForEach(voices, id: \.self.name) { voice in
            voiceRow(for: voice)
          }
        }
      }
      .environmentObject(audioController)
    }

    func voiceRow(for voice: OpenAIVoiceItem) -> some View {
      Button(action: {
        if audioController.isPlayingSample(voice: voice.key) {
          playbackSample = nil
          audioController.stopVoiceSample()
        }
        playbackSample = voice.key
        audioController.currentVoice = voice.key
        audioController.playVoiceSample(voice: voice.key)
        Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { timer in
          let playing = audioController.isPlayingSample(voice: voice.key)
          if playing {
            playbackSample = voice.key
          } else if !playing {
            // If the playback sample is something else, its taken ownership
            // of the value so we just ignore it and shut down our timer.
            if playbackSample == voice.key {
              playbackSample = nil
            }
            timer.invalidate()
          }
        }
      }, label: {
        HStack {
          if playbackSample == voice.key {
            Image(systemName: "stop.circle")
              .font(.appTitleTwo)
              .padding(.trailing, 16)
          } else {
            Image(systemName: "play.circle")
              .font(.appTitleTwo)
              .padding(.trailing, 16)
          }
          Text(voice.name)
          Spacer()

          if audioController.currentVoice == voice.key {
            if audioController.isPlaying, audioController.isLoading {
              ProgressView()
            } else {
              Image(systemName: "checkmark")
            }
          }
        }.contentShape(Rectangle())
      })
        .buttonStyle(PlainButtonStyle())
        .frame(maxWidth: .infinity)
    }
  }
#endif
