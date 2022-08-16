//
//  AudioSession.swift
//
//
//  Created by Jackson Harper on 8/15/22.
//

import AVFoundation
import Foundation
import MediaPlayer

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
          try? AVAudioSession.sharedInstance().setCategory(.playback)
          self.player = try AVAudioPlayer(contentsOf: url)
          if self.player?.play() ?? false {
            self.state = .playing
            self.startTimer()
            self.setupRemoteControl()
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

  func setupRemoteControl() {
    UIApplication.shared.beginReceivingRemoteControlEvents()

    MPNowPlayingInfoCenter.default().nowPlayingInfo = [
      //  MPMediaItemArtwork: ""m
      MPMediaItemPropertyArtist: item?.author ?? "Omnivore",
      MPMediaItemPropertyTitle: item?.title ?? "Your Omnivore Article"
    ]

    if let imageURL = item?.imageURL, let cachedImage = ImageCache.shared[imageURL] {
//      #if os(iOS)
//        status = .loaded(image: Image(uiImage: cachedImage))
//      #else
//        status = .loaded(image: Image(nsImage: cachedImage))
//      #endif
      MPNowPlayingInfoCenter.default().nowPlayingInfo = [
        MPMediaItemPropertyArtwork: cachedImage,
        MPMediaItemPropertyArtist: item?.author ?? "Omnivore",
        MPMediaItemPropertyTitle: item?.title ?? "Your Omnivore Article"
      ]
    }

    let commandCenter = MPRemoteCommandCenter.shared()

    commandCenter.playCommand.isEnabled = true
    commandCenter.playCommand.addTarget { _ -> MPRemoteCommandHandlerStatus in
      self.unpause()
      return .success
    }

    commandCenter.pauseCommand.isEnabled = true
    commandCenter.pauseCommand.addTarget { _ -> MPRemoteCommandHandlerStatus in
      self.pause()
      return .success
    }
  }
}
