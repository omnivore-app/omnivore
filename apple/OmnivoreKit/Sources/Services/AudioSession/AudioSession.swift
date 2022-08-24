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

public enum PlayerScrubState {
  case reset
  case scrubStarted
  case scrubEnded(TimeInterval)
}

// Our observable object class
public class AudioSession: NSObject, ObservableObject, AVAudioPlayerDelegate {
  @Published public var state: AudioSessionState = .stopped
  @Published public var item: LinkedItem?

  @Published public var timeElapsed: TimeInterval = 0
  @Published public var duration: TimeInterval = 0
  @Published public var timeElapsedString: String?
  @Published public var durationString: String?

  let appEnvironment: AppEnvironment
  let networker: Networker

  var timer: Timer?
  var player: AVAudioPlayer?
  var downloadTask: Task<Void, Error>?

  public init(appEnvironment: AppEnvironment, networker: Networker) {
    self.appEnvironment = appEnvironment
    self.networker = networker
  }

  public func play(item: LinkedItem) {
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
    timeElapsed = 0
    duration = 1
    downloadTask?.cancel()
  }

  public var scrubState: PlayerScrubState = .reset {
    didSet {
      switch scrubState {
      case .reset:
        return
      case .scrubStarted:
        return
      case let .scrubEnded(seekTime):
        player?.currentTime = seekTime
      }
    }
  }

  public var currentVoice: String {
    "en-CA-ClaraNeural"
  }

  public func isLoadingItem(item: LinkedItem) -> Bool {
    state == .loading && self.item == item
  }

  public func isPlayingItem(item: LinkedItem) -> Bool {
    state == .playing && self.item == item
  }

  public func skipForward(seconds: Double) {
    if let current = player?.currentTime {
      player?.currentTime = min(duration, current + seconds)
    }
  }

  public func skipBackwards(seconds: Double) {
    if let current = player?.currentTime {
      player?.currentTime = max(0, current - seconds)
    }
  }

  public func startAudio() {
    state = .loading
    setupNotifications()

    let pageId = item!.unwrappedID

    downloadTask = Task {
      do {
        _ = try await downloadAudioFile(pageId: pageId)
        if Task.isCancelled { return }
        DispatchQueue.main.async {
          self.startDownloadedAudioFile(pageId: pageId)
        }
      } catch {
        // TODO: display a failure toast here
        DispatchQueue.main.async {
          self.stop()
        }
        print("FAILED TO DOWNLOAD AUDIO URL")
        print(error)
      }
    }
  }

  private func startDownloadedAudioFile(pageId: String) {
    // Make sure audio file is still correct for the current page
    guard item?.unwrappedID == pageId else {
      state = .stopped
      return
    }

    // TODO: Maybe check if app is active so it doesn't end up playing later?

    let audioUrl = FileManager.default
      .urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(pageId + ".mp3")

    if !FileManager.default.fileExists(atPath: audioUrl.path) {
      stop()
      return
    }

    do {
      try AVAudioSession.sharedInstance().setCategory(.playback)

      player = try AVAudioPlayer(contentsOf: audioUrl)
      player?.delegate = self
      if player?.play() ?? false {
        state = .playing
        startTimer()
        setupRemoteControl()
      }
    } catch {
      print("error playing MP3 file", error)
      state = .stopped
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

  func formatTimeInterval(_ time: TimeInterval) -> String? {
    let componentFormatter = DateComponentsFormatter()
    componentFormatter.unitsStyle = .positional
    componentFormatter.allowedUnits = time >= 3600 ? [.second, .minute, .hour] : [.second, .minute]
    componentFormatter.zeroFormattingBehavior = .pad
    return componentFormatter.string(from: time)
  }

  // Every second, get the current playing time of the player and refresh the status of the player progressslider
  @objc func update(_: Timer) {
    if let player = player, player.isPlaying {
      duration = player.duration
      durationString = formatTimeInterval(duration)

      switch scrubState {
      case .reset:
        timeElapsed = player.currentTime
        timeElapsedString = formatTimeInterval(timeElapsed)
        if var nowPlaying = MPNowPlayingInfoCenter.default().nowPlayingInfo {
          nowPlaying[MPMediaItemPropertyPlaybackDuration] = NSNumber(value: duration)
          nowPlaying[MPNowPlayingInfoPropertyElapsedPlaybackTime] = NSNumber(value: timeElapsed)
          MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlaying
        }
      case .scrubStarted:
        break
      case let .scrubEnded(seekTime):
        scrubState = .reset
        timeElapsed = seekTime
      }
    }
  }

  func clearNowPlayingInfo() {
    MPNowPlayingInfoCenter.default().nowPlayingInfo = [:]
  }

  func setupRemoteControl() {
    UIApplication.shared.beginReceivingRemoteControlEvents()

    if let item = item {
      MPNowPlayingInfoCenter.default().nowPlayingInfo = [
        MPMediaItemPropertyTitle: NSString(string: item.title!),
        MPMediaItemPropertyArtist: NSString(string: item.author!),
        MPMediaItemPropertyPlaybackDuration: NSNumber(value: duration),
        MPNowPlayingInfoPropertyElapsedPlaybackTime: NSNumber(value: timeElapsed)
      ]
    }

//    if let imageURL = item?.imageURL, let cachedImage = ImageCache.shared[imageURL] {
    ////      #if os(iOS)
    ////        status = .loaded(image: Image(uiImage: cachedImage))
    ////      #else
    ////        status = .loaded(image: Image(nsImage: cachedImage))
    ////      #endif
//      MPNowPlayingInfoCenter.default().nowPlayingInfo = [
//        //  MPMediaItemPropertyArtwork: cachedImage,
//        MPMediaItemPropertyArtist: item?.author ?? "Omnivore",
//        MPMediaItemPropertyTitle: item?.title ?? "Your Omnivore Article"
//      ]
//    }

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

    commandCenter.skipForwardCommand.isEnabled = true
    commandCenter.skipForwardCommand.preferredIntervals = [30, 60]
    commandCenter.skipForwardCommand.addTarget { event -> MPRemoteCommandHandlerStatus in
      if let event = event as? MPSkipIntervalCommandEvent {
        self.skipForward(seconds: event.interval)
        return .success
      }
      return .commandFailed
    }

    commandCenter.skipBackwardCommand.isEnabled = true
    commandCenter.skipBackwardCommand.preferredIntervals = [30, 60]
    commandCenter.skipBackwardCommand.addTarget { event -> MPRemoteCommandHandlerStatus in
      if let event = event as? MPSkipIntervalCommandEvent {
        self.skipBackwards(seconds: event.interval)
        return .success
      }
      return .commandFailed
    }

    commandCenter.changePlaybackPositionCommand.isEnabled = true
    commandCenter.changePlaybackPositionCommand.addTarget { event -> MPRemoteCommandHandlerStatus in
      if let event = event as? MPChangePlaybackPositionCommandEvent {
        self.player?.currentTime = event.positionTime
        return .success
      }
      return .commandFailed
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

    guard let url = URL(string: "/api/article/\(pageId)/mp3/\(currentVoice)", relativeTo: appEnvironment.serverBaseURL) else {
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
    if let httpResponse = result?.1 as? HTTPURLResponse, httpResponse.statusCode == 202 {
      print("Tell the user the download has been queued")
      DispatchQueue.main.async {
        NSNotification.operationSuccess(message: "Your audio is being created.")
      }
    }

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
      try? FileManager.default.removeItem(at: audioUrl)
      try FileManager.default.moveItem(at: tempPath, to: audioUrl)
    } catch {
      print("error writing file: ", error)
      let errorMessage = "audioFetch failed. could not write MP3 data to disk"
      throw BasicError.message(messageText: errorMessage)
    }

    return audioUrl
  }

  public func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully _: Bool) {
    if player == self.player {
      pause()
      player.currentTime = 0
    }
  }

  func setupNotifications() {
    NotificationCenter.default.removeObserver(self, name: AVAudioSession.interruptionNotification, object: AVAudioSession.sharedInstance())
    NotificationCenter.default.addObserver(self,
                                           selector: #selector(handleInterruption),
                                           name: AVAudioSession.interruptionNotification,
                                           object: AVAudioSession.sharedInstance())
  }

  @objc func handleInterruption(notification: Notification) {
    guard let userInfo = notification.userInfo,
          let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue)
    else {
      return
    }

    // Switch over the interruption type.
    switch type {
    case .began:
      // An interruption began. Update the UI as necessary.
      pause()
    case .ended:
      // An interruption ended. Resume playback, if appropriate.

      guard let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt else { return }
      let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
      if options.contains(.shouldResume) {
        unpause()
      } else {}
    default: ()
    }
  }
}
