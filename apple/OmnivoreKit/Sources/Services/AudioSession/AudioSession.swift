//
//  AudioSession.swift
//
//
//  Created by Jackson Harper on 8/15/22.
//

import AVFoundation
import Foundation

import Models
import Utils

public enum AudioSessionState {
  case stopped
  case paused
  case loading
  case playing
}

// Our observable object class
public class AudioSession: ObservableObject {
  @Published public var state: AudioSessionState = .stopped
  @Published public var item: LinkedItem?

  @Published public var audioUrl: URL?

  var timer: Timer?
  var player: AVAudioPlayer?

  public init() {}

  public func play(item: LinkedItem) {
    // Stop any existing session
    stop()

    self.item = item
    startAudio()
  }

  public func stop() {
    player?.stop()
    timer = nil
    player = nil
    item = nil
  }

  public func isPlayingItem(item: LinkedItem) -> Bool {
    state == .playing && self.item == item
  }

  public func startAudio() {
    state = .loading

    // Just simulating some loading delay here
    DispatchQueue.main.asyncAfter(deadline: .now()) {
      self.audioUrl = Bundle.main.url(forResource: "speech-sample", withExtension: "mp3")!
      if let url = self.audioUrl {
        do {
          self.player = try AVAudioPlayer(contentsOf: url)
          if self.player?.play() ?? false {
            self.state = .playing
            self.startTimer()
          }
        } catch {
          print(error.localizedDescription)
          self.state = .stopped
        }
      }
    }
  }

  public func pause() -> Bool {
    if let player = player {
      player.pause()
      state = .paused
      return true
    }
    return false
  }

  public func unpause() -> Bool {
    playAudio()
  }

  public func playAudio() -> Bool {
    if let player = player {
      player.play()
      state = .playing
      return true
    }
    return false
  }

  func startTimer() {
    if timer == nil {
      // Update every 100ms
      timer = Timer.scheduledTimer(timeInterval: 0.1, target: self, selector: #selector(update(_:)), userInfo: nil, repeats: true)
      timer?.fire()
    }
  }

  func stopTimer() {
    timer = nil
  }

  // Every second, get the current playing time of the player and refresh the status of the player progressslider
  @objc func update(_: Timer) {
    if let player = player, player.isPlaying {
      print("play time in ms: ", Int(player.currentTime * 1000))
    }
  }
}
