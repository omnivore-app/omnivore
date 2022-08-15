//
//  TextToSpeechViewModel.swift
//
//
//  Created by Jackson Harper on 8/15/22.
//

import AVFoundation

public enum TextToSpeechState {
  case stopped
  case paused
  case loading
  case playing
}

public class AudioSession: ObservableObject {
  @Published public var state: TextToSpeechState = .stopped
  @Published public var audioUrl: URL?
  @Published public var title: String?

  var timer: Timer?
  var player: AVAudioPlayer?

  deinit {
    print("CLOSING DOWN THE SPEECH VIEW MODEL")
    self.player?.stop()
  }

  func startAudio() {
    // Just simulating some loading delay here
    DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(250)) {
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
        }
      }
    }
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

  func pause() -> Bool {
    if let player = player {
      player.pause()
      state = .paused
      return true
    }
    return false
  }

  func playAudio() -> Bool {
    if let player = player {
      player.play()
      state = .playing
      return true
    }
    return false
  }
}
