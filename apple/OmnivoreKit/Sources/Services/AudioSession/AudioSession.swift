//
//  AudioSession.swift
//
//
//  Created by Jackson Harper on 8/15/22.
//

import Foundation

public enum AudioSessionState {
  case stopped
  case paused
  case loading
  case playing
}

// Our observable object class
public class AudioSession: ObservableObject {
  @Published var state: AudioSessionState = .stopped
  @Published var title = "This is the title of my session"
}
