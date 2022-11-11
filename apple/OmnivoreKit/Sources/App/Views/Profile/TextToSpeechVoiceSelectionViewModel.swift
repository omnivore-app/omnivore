//
//  TextToSpeechVoiceSelectionViewModel.swift
//
//
//  Created by Jackson Harper on 11/10/22.
//

import CoreData
import Foundation
import Models
import Services
import SwiftUI
import Views

@MainActor final class TextToSpeechVoiceSelectionViewModel: ObservableObject {
  @Published var playbackSample: String?
  @Published var realisticVoicesToggle: Bool = false
  @Published var waitingForRealisticVoices: Bool = false

  func requestUltraRealisticFeatureAccess(
    dataService: DataService,
    audioController: AudioController
  ) async {
    do {
      let feature = try await dataService.optInFeature(name: "ultra-realistic-voice")
      DispatchQueue.main.async {
        if let feature = feature {
          audioController.useUltraRealisticVoices = true
          audioController.ultraRealisticFeatureRequested = true
          audioController.ultraRealisticFeatureKey = feature.granted ? feature.token : ""
          if feature.granted, !Voices.isUltraRealisticVoice(audioController.currentVoice) {
            // Attempt to set to an ultra voice
            if let voice = Voices.UltraPairs.first {
              audioController.currentVoice = voice.firstKey
            }
          }
          self.realisticVoicesToggle = true
        } else {
          audioController.useUltraRealisticVoices = false
          audioController.ultraRealisticFeatureKey = ""
          audioController.ultraRealisticFeatureRequested = false
          self.realisticVoicesToggle = false
        }
        self.waitingForRealisticVoices = false
      }
    } catch {
      print("ERROR OPTING INTO FEATURE", error)
      audioController.useUltraRealisticVoices = false
      realisticVoicesToggle = false
      waitingForRealisticVoices = false
      audioController.ultraRealisticFeatureRequested = false
      Snackbar.show(message: "Error signing up for beta. Please try again.")
    }
  }
}
