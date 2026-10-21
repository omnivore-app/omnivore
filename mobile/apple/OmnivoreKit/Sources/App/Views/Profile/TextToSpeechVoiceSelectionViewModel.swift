//
//  TextToSpeechVoiceSelectionViewModel.swift
//
//
//  Created by Jackson Harper on 11/10/22.
//

#if os(iOS)
  import CoreData
  import Foundation
  import Models
  import Services
  import SwiftUI
  import Views

  @MainActor final class TextToSpeechVoiceSelectionViewModel: ObservableObject {
    @Published var playbackSample: String?

    @Published var showSnackbar: Bool = false
    var snackbarMessage: String?
  }
#endif
