//
//  AudioSession.swift
//
//
//  Created by Jackson Harper on 8/15/22.
//

import AVFoundation
import CryptoKit
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

  let appEnvironment: AppEnvironment
  let networker: Networker

  var timer: Timer?
  var player: AVAudioPlayer?

  public init(appEnvironment: AppEnvironment, networker: Networker) {
    self.appEnvironment = appEnvironment
    self.networker = networker
  }

  public func play(item: LinkedItem) {
    // Stop any existing session
    stop()

    self.item = item
    startAudio()
  }

  public func stop() {
    player?.stop()
    clearNowPlayingInfo()
    timer = nil
    player = nil
    item = nil
    state = .stopped
  }

  public func isLoadingItem(item: LinkedItem) -> Bool {
    state == .loading && self.item == item
  }

  public func isPlayingItem(item: LinkedItem) -> Bool {
    state == .playing && self.item == item
  }

  public func startAudio() {
    state = .loading

    let pageId = item!.unwrappedID

    Task {
      do {
        try await downloadAudioFile(pageId: pageId)
      } catch {
        print("FAILED TO DOWNLOAD AUDIO URL")
        print(error.localizedDescription)
      }

      DispatchQueue.main.async {
        let audioUrl = FileManager.default
          .urls(for: .documentDirectory, in: .userDomainMask)[0]
          .appendingPathComponent(pageId + ".mp3")

        if !FileManager.default.fileExists(atPath: audioUrl.path) {
          self.stop()
          return
        }

        do {
          try AVAudioSession.sharedInstance().setCategory(.playback)

          self.player = try AVAudioPlayer(contentsOf: audioUrl)
          if self.player?.play() ?? false {
            self.state = .playing
            self.startTimer()
            self.setupRemoteControl()
          }
        } catch {
          print("error playing MP3 file", error)
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

  func clearNowPlayingInfo() {
    MPNowPlayingInfoCenter.default().nowPlayingInfo = [:]
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
        //  MPMediaItemPropertyArtwork: cachedImage,
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

  func downloadAudioFile(pageId: String) async throws -> URL? {
    let audioUrl = FileManager.default
      .urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(pageId + ".mp3")

//    if FileManager.default.fileExists(atPath: audioUrl.path) {
//      // Prevent re-download
//      // TODO: We aren't doing this very safely, we should be verifying a checksum
//      return audioUrl
//    }

    guard let url = URL(string: "/api/article/\(pageId)/mp3", relativeTo: appEnvironment.serverBaseURL) else {
      throw BasicError.message(messageText: "Invalid audio URL")
    }

    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.timeoutInterval = 600
    for (header, value) in networker.defaultHeaders {
      request.setValue(value, forHTTPHeaderField: header)
    }

    let result: (Data, URLResponse)? = try? await URLSession.shared.data(for: request)
    guard let httpResponse = result?.1 as? HTTPURLResponse, 200 ..< 300 ~= httpResponse.statusCode else {
      throw BasicError.message(messageText: "audioFetch failed. no response or bad status code.")
    }
    print("httpResponse: ", httpResponse)

    guard let data = result?.0 else {
      throw BasicError.message(messageText: "audioFetch failed. no data received.")
    }

    let tempPath = FileManager.default
      .urls(for: .cachesDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(UUID().uuidString + ".mp3")

    do {
      if let googleHash = httpResponse.value(forHTTPHeaderField: "x-goog-hash") {
        let hash = Data(Insecure.MD5.hash(data: data)).base64EncodedString()
        if !googleHash.contains("md5=\(hash)") {
          print("Downloaded mp3 file hashes do not match: returned: \(googleHash) v computed: \(hash)")
          throw BasicError.message(messageText: "Downloaded mp3 file hashes do not match: returned: \(googleHash) v computed: \(hash)")
        }
      }

      try data.write(to: tempPath)
      try FileManager.default.moveItem(at: tempPath, to: audioUrl)
    } catch {
      let errorMessage = "audioFetch failed. could not write MP3 data to disk"
      throw BasicError.message(messageText: errorMessage)
    }

    return audioUrl
  }
}
