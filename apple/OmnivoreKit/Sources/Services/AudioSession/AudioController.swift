//
//  AudioController.swift
//
//
//  Created by Jackson Harper on 8/15/22.
//

import AVFoundation
import CryptoKit
import Foundation
import MediaPlayer
import Models
import SwiftUI
import Utils

public enum AudioControllerState {
  case stopped
  case paused
  case loading
  case playing
  case reachedEnd
}

public enum PlayerScrubState {
  case reset
  case scrubStarted
  case scrubEnded(TimeInterval)
}

enum DownloadPriority: String {
  case low
  case high
}

public struct VoiceLanguage {
  public let key: String
  public let name: String
  public let defaultVoice: String
  public let categories: [VoiceCategory]
}

public enum VoiceCategory: String, CaseIterable {
  case enUS = "English (US)"
  case enAU = "English (Australia)"
  case enCA = "English (Canada)"
  case enIE = "English (Ireland)"
  case enIN = "English (India)"
  case enSG = "English (Singapore)"
  case enUK = "English (UK)"
  case deDE = "German (Germany)"
  case esES = "Spanish (Spain)"
  case jaJP = "Japanese (Japan)"
  case zhCN = "Chinese (China Mainland)"
}

public struct VoicePair {
  let firstKey: String
  let secondKey: String

  let firstName: String
  let secondName: String

  let language: String
  let category: VoiceCategory
}

private let ENGLISH = VoiceLanguage(key: "en",
                                    name: "English",
                                    defaultVoice: "en-US-ChristopherNeural",
                                    categories: [.enUS, .enAU, .enCA, .enIE, .enIN, .enSG, .enUK])

public let VOICELANGUAGES = [
  ENGLISH,
  VoiceLanguage(key: "zh", name: "Chinese", defaultVoice: "zh-CN-XiaochenNeural", categories: [.zhCN]),
  VoiceLanguage(key: "ja", name: "Japanese", defaultVoice: "ja-JP-NanamiNeural", categories: [.jaJP]),
  VoiceLanguage(key: "ja", name: "Japanese", defaultVoice: "ja-JP-NanamiNeural", categories: [.jaJP]),
  VoiceLanguage(key: "de", name: "German", defaultVoice: "de-CH-JanNeural", categories: [.deDE]),
  VoiceLanguage(key: "es", name: "Spanish", defaultVoice: "es-ES-AlvaroNeural", categories: [.esES])
]

// swiftlint:disable all
public let VOICES = [
  // en
  VoicePair(firstKey: "en-US-JennyNeural", secondKey: "en-US-BrandonNeural", firstName: "Jenny", secondName: "Brandon", language: "en-US", category: .enUS),
  VoicePair(firstKey: "en-US-CoraNeural", secondKey: "en-US-ChristopherNeural", firstName: "Cora", secondName: "Christopher", language: "en-US", category: .enUS),
  VoicePair(firstKey: "en-US-ElizabethNeural", secondKey: "en-US-EricNeural", firstName: "Elizabeth", secondName: "Eric", language: "en-US", category: .enUS),
  VoicePair(firstKey: "en-CA-ClaraNeural", secondKey: "en-CA-LiamNeural", firstName: "Clara", secondName: "Liam", language: "en-CA", category: .enCA),
  VoicePair(firstKey: "en-GB-LibbyNeural", secondKey: "en-GB-EthanNeural", firstName: "Libby", secondName: "Ethan", language: "en-GB", category: .enUK),
  VoicePair(firstKey: "en-AU-NatashaNeural", secondKey: "en-AU-WilliamNeural", firstName: "Natasha", secondName: "William", language: "en-AU", category: .enAU),
  VoicePair(firstKey: "en-IE-ConnorNeural", secondKey: "en-IE-EmilyNeural", firstName: "Connor", secondName: "Emily", language: "en-IE", category: .enIE),
  VoicePair(firstKey: "en-IN-NeerjaNeural", secondKey: "en-IN-PrabhatNeural", firstName: "Neerja", secondName: "Prabhat", language: "en-IN", category: .enIN),
  VoicePair(firstKey: "en-SG-LunaNeural", secondKey: "en-SG-WayneNeural", firstName: "Luna", secondName: "Wayne", language: "en-SG", category: .enSG),

  VoicePair(firstKey: "es-ES-AlvaroNeural", secondKey: "es-ES-ElviraNeural", firstName: "Alvaro", secondName: "Elvira", language: "es-ES", category: .esES),
  VoicePair(firstKey: "de-CH-LeniNeural", secondKey: "de-DE-KatjaNeural", firstName: "Leni", secondName: "Katja", language: "de-DE", category: .deDE),
  VoicePair(firstKey: "de-DE-AmalaNeural", secondKey: "de-DE-BerndNeural", firstName: "Amala", secondName: "Bernd", language: "de-DE", category: .deDE),
  VoicePair(firstKey: "de-DE-ChristophNeural", secondKey: "de-DE-LouisaNeural", firstName: "Christoph", secondName: "Louisa", language: "de-DE", category: .deDE),

  // ja
  VoicePair(firstKey: "ja-JP-NanamiNeural", secondKey: "ja-JP-KeitaNeural", firstName: "Nanami", secondName: "Keita", language: "ja-JP", category: .jaJP),

  // zh
  VoicePair(firstKey: "zh-CN-XiaochenNeural", secondKey: "zh-CN-XiaohanNeural", firstName: "Xiaochen", secondName: "Xiaohan", language: "zh-CN", category: .zhCN),
  VoicePair(firstKey: "zh-CN-XiaoxiaoNeural", secondKey: "zh-CN-YunyangNeural", firstName: "Xiaoxiao", secondName: "Yunyang", language: "zh-CN", category: .zhCN)
]

let VOICE_REGIONS = ["English "]

// Somewhat based on: https://github.com/neekeetab/CachingPlayerItem/blob/master/CachingPlayerItem.swift
class SpeechPlayerItem: AVPlayerItem {
  let resourceLoaderDelegate = ResourceLoaderDelegate()
  let session: AudioController
  let speechItem: SpeechItem
  let completed: () -> Void

  var observer: Any?

  init(session: AudioController, speechItem: SpeechItem, completed: @escaping () -> Void) {
    self.speechItem = speechItem
    self.session = session
    self.completed = completed

    guard let fakeUrl = URL(string: "app.omnivore.speech://\(speechItem.localAudioURL.path).mp3") else {
      fatalError("internal inconsistency")
    }

    let asset = AVURLAsset(url: fakeUrl)
    asset.resourceLoader.setDelegate(resourceLoaderDelegate, queue: DispatchQueue.main)

    super.init(asset: asset, automaticallyLoadedAssetKeys: nil)

    resourceLoaderDelegate.owner = self

    self.observer = observe(\.status, options: [.new]) { item, _ in
      if item.status == .readyToPlay {
        let duration = CMTimeGetSeconds(item.duration)
        item.session.updateDuration(forItem: item.speechItem, newDuration: duration)
      }
    }

    NotificationCenter.default.addObserver(forName: NSNotification.Name.AVPlayerItemDidPlayToEndTime, object: self, queue: OperationQueue.main) { [weak self] _ in
      guard let self = self else { return }
      self.completed()
    }
  }

  deinit {
    observer = nil
    resourceLoaderDelegate.session?.invalidateAndCancel()
  }

  open func download() {
    if resourceLoaderDelegate.session == nil {
      resourceLoaderDelegate.startDataRequest(with: speechItem.urlRequest)
    }
  }

  @objc func playbackStalledHandler() {
    print("playback stalled...")
  }

  class ResourceLoaderDelegate: NSObject, AVAssetResourceLoaderDelegate {
    var session: URLSession?
    var mediaData: Data?
    var pendingRequests = Set<AVAssetResourceLoadingRequest>()
    weak var owner: SpeechPlayerItem?

    func resourceLoader(_: AVAssetResourceLoader, shouldWaitForLoadingOfRequestedResource loadingRequest: AVAssetResourceLoadingRequest) -> Bool {
      if owner == nil {
        return true
      }

      if session == nil {
        guard let initialUrl = owner?.speechItem.urlRequest else {
          fatalError("internal inconsistency")
        }

        startDataRequest(with: initialUrl)
      }

      pendingRequests.insert(loadingRequest)
      processPendingRequests()
      return true
    }

    func startDataRequest(with _: URLRequest) {
      let configuration = URLSessionConfiguration.default
      configuration.requestCachePolicy = .reloadIgnoringLocalAndRemoteCacheData
      session = URLSession(configuration: configuration)

      Task {
        guard let speechItem = self.owner?.speechItem else {
          // This probably can't happen, but if it does, just returning should
          // let AVPlayer try again.
          print("No speech item found: ", self.owner)
          return
        }

        // TODO: how do we want to propogate this and handle it in the player
        let audioData = try? await SpeechSynthesizer.download(speechItem: speechItem, session: self.session)
        DispatchQueue.main.async {
          if audioData == nil {
            self.session = nil
          }
          self.mediaData = audioData
          self.processPendingRequests()
        }
      }
    }

    func resourceLoader(_: AVAssetResourceLoader, didCancel loadingRequest: AVAssetResourceLoadingRequest) {
      pendingRequests.remove(loadingRequest)
    }

    func processPendingRequests() {
      let requestsFulfilled = Set<AVAssetResourceLoadingRequest>(pendingRequests.compactMap {
        self.fillInContentInformationRequest($0.contentInformationRequest)
        if self.haveEnoughDataToFulfillRequest($0.dataRequest!) {
          $0.finishLoading()
          return $0
        }
        return nil
      })

      // remove fulfilled requests from pending requests
      _ = requestsFulfilled.map { self.pendingRequests.remove($0) }
    }

    func fillInContentInformationRequest(_ contentInformationRequest: AVAssetResourceLoadingContentInformationRequest?) {
      contentInformationRequest?.contentType = UTType.mp3.identifier

      if let mediaData = mediaData {
        contentInformationRequest?.isByteRangeAccessSupported = true
        contentInformationRequest?.contentLength = Int64(mediaData.count)
      }
    }

    func haveEnoughDataToFulfillRequest(_ dataRequest: AVAssetResourceLoadingDataRequest) -> Bool {
      let requestedOffset = Int(dataRequest.requestedOffset)
      let requestedLength = dataRequest.requestedLength
      let currentOffset = Int(dataRequest.currentOffset)

      guard let songDataUnwrapped = mediaData,
            songDataUnwrapped.count > currentOffset
      else {
        // Don't have any data at all for this request.
        return false
      }

      let bytesToRespond = min(songDataUnwrapped.count - currentOffset, requestedLength)
      let dataToRespond = songDataUnwrapped.subdata(in: Range(uncheckedBounds: (currentOffset, currentOffset + bytesToRespond)))
      dataRequest.respond(with: dataToRespond)

      return songDataUnwrapped.count >= requestedLength + requestedOffset
    }

    deinit {
      session?.invalidateAndCancel()
    }
  }
}

public class AudioController: NSObject, ObservableObject, AVAudioPlayerDelegate {
  @Published public var state: AudioControllerState = .stopped
  @Published public var itemAudioProperties: LinkedItemAudioProperties?

  @Published public var timeElapsed: TimeInterval = 0
  @Published public var duration: TimeInterval = 0
  @Published public var timeElapsedString: String?
  @Published public var durationString: String?
  @Published public var voiceList: [(name: String, key: String, category: VoiceCategory, selected: Bool)]?

  let appEnvironment: AppEnvironment
  let networker: Networker

  var timer: Timer?
  var player: AVQueuePlayer?
  var document: SpeechDocument?
  var synthesizer: SpeechSynthesizer?
  var durations: [Double]?

  public init(appEnvironment: AppEnvironment, networker: Networker) {
    self.appEnvironment = appEnvironment
    self.networker = networker

    super.init()
    self.voiceList = generateVoiceList()
  }

  public func play(itemAudioProperties: LinkedItemAudioProperties) {
    stop()

    self.itemAudioProperties = itemAudioProperties
    startAudio()

    EventTracker.track(
      .audioSessionStart(linkID: itemAudioProperties.itemID)
    )
  }

  public func stop() {
    let stoppedId = itemAudioProperties?.itemID
    let stoppedTimeElapsed = timeElapsed

    player?.pause()
    timer?.invalidate()

    clearNowPlayingInfo()

    player?.replaceCurrentItem(with: nil)
    player?.removeAllItems()

    timer = nil
    player = nil
    synthesizer = nil

    itemAudioProperties = nil
    state = .stopped
    timeElapsed = 0
    duration = 1
    durations = nil

    if let stoppedId = stoppedId {
      EventTracker.track(
        .audioSessionEnd(linkID: stoppedId, timeElapsed: stoppedTimeElapsed)
      )
    }
  }

  public func generateVoiceList() -> [(name: String, key: String, category: VoiceCategory, selected: Bool)] {
    VOICES.flatMap { voicePair in
      [
        (name: voicePair.firstName, key: voicePair.firstKey, category: voicePair.category, selected: voicePair.firstKey == currentVoice),
        (name: voicePair.secondName, key: voicePair.secondKey, category: voicePair.category, selected: voicePair.secondKey == currentVoice)
      ]
    }.sorted { $0.name.lowercased() < $1.name.lowercased() }
  }

  public func preload(itemIDs: [String], retryCount _: Int = 0) async -> Bool {
    if !preloadEnabled {
      return true
    }

    for itemID in itemIDs {
      if let document = try? await downloadSpeechFile(itemID: itemID, priority: .low) {
        let synthesizer = SpeechSynthesizer(appEnvironment: appEnvironment, networker: networker, document: document)
        do {
          try await synthesizer.preload()
          return true
        } catch {
          print("error preloading audio file", error)
        }
      }
    }
    return false
  }

  public func downloadForOffline(itemID: String) async -> Bool {
    if let document = try? await downloadSpeechFile(itemID: itemID, priority: .low) {
      let synthesizer = SpeechSynthesizer(appEnvironment: appEnvironment, networker: networker, document: document)
      for item in synthesizer.createPlayerItems(from: 0) {
        do {
          _ = try await SpeechSynthesizer.download(speechItem: item, redownloadCached: true)
        } catch {
          print("error downloading audio segment: ", error)
          return false
        }
      }
      return true
    }
    return false
  }

  public var scrubState: PlayerScrubState = .reset {
    didSet {
      switch scrubState {
      case .reset:
        return
      case .scrubStarted:
        return
      case let .scrubEnded(seekTime):
        seek(to: seekTime)
      }
    }
  }

  func updateDuration(forItem item: SpeechItem, newDuration: TimeInterval) {
    if let durations = self.durations, item.audioIdx < durations.count {
      self.durations?[item.audioIdx] = (newDuration / playbackRate)
    }
  }

  public func seek(to: TimeInterval) {
    var hasOffset = false
    let position = max(0, to)

    // If we are in reachedEnd state, and seek back, we need to move to
    // paused state
    if to < duration, state == .reachedEnd {
      state = .paused
    }

    // First find the item that this interval is within
    // Not the most effecient, but these lists should be less than 500 items
    var sum = 0.0
    var foundIdx: Int?
    for (idx, duration) in (durations ?? []).enumerated() {
      if sum + duration > position {
        foundIdx = idx
        break
      }
      sum += duration
    }

    if let foundIdx = foundIdx {
      // Now figure out how far into this segment we need to seek to
      let before = durationBefore(playerIndex: foundIdx)
      let remainder = position - before

      if remainder > 0 {
        hasOffset = true
      }

      // if the foundIdx happens to be the current item, we just set the position
      if let playerItem = player?.currentItem as? SpeechPlayerItem {
        if playerItem.speechItem.audioIdx == foundIdx {
          playerItem.seek(to: CMTimeMakeWithSeconds(remainder, preferredTimescale: 600), completionHandler: nil)
          scrubState = .reset
          fireTimer()
          return
        }
      }

      // Move the playback to the found index, we also seek by the remainder amount
      // before moving we pause the player so playback doesnt jump to a previous spot
      player?.pause()
      player?.removeAllItems()
      synthesizeFrom(start: foundIdx, playWhenReady: state == .playing, atOffset: remainder)
    } else {
      // There was no foundIdx, so we are probably trying to seek past the end, so
      // just seek to the last possible duration.
      if let durations = self.durations, let last = durations.last {
        player?.removeAllItems()
        synthesizeFrom(start: durations.count - 1, playWhenReady: state == .playing, atOffset: last)
      }
    }

    scrubState = .reset
    fireTimer()
  }

  @AppStorage(UserDefaultKey.textToSpeechDefaultLanguage.rawValue) public var defaultLanguage = "en" {
    didSet {
      currentLanguage = defaultLanguage
    }
  }

  @AppStorage(UserDefaultKey.textToSpeechPlaybackRate.rawValue) public var playbackRate = 1.0 {
    didSet {
      updateDurations(oldPlayback: oldValue, newPlayback: playbackRate)
      unpause()
      fireTimer()
    }
  }

  @AppStorage(UserDefaultKey.textToSpeechPreloadEnabled.rawValue) public var preloadEnabled = true

  public var currentVoiceLanguage: VoiceLanguage {
    VOICELANGUAGES.first(where: { $0.key == currentLanguage }) ?? ENGLISH
  }

  private var _currentLanguage: String?
  public var currentLanguage: String {
    get {
      if let currentLanguage = _currentLanguage {
        return currentLanguage
      }
      if let itemLang = itemAudioProperties?.language, let lang = VOICELANGUAGES.first(where: { $0.name == itemLang || $0.key == itemLang }) {
        return lang.key
      }
      return defaultLanguage
    }
    set {
      _currentLanguage = newValue

      let newVoice = getPreferredVoice(forLanguage: newValue)
      currentVoice = newVoice
    }
  }

  private var _currentVoice: String?
  public var currentVoice: String {
    get {
      if let currentVoice = _currentVoice {
        return currentVoice
      }

      if let currentVoice = UserDefaults.standard.string(forKey: "\(currentLanguage)-\(UserDefaultKey.textToSpeechPreferredVoice.rawValue)") {
        return currentVoice
      }

      return currentVoiceLanguage.defaultVoice
    }
    set {
      _currentVoice = newValue
      voiceList = generateVoiceList()

      var currentIdx = 0
      var currentOffset = 0.0
      if let player = self.player, let item = self.player?.currentItem as? SpeechPlayerItem {
        currentIdx = item.speechItem.audioIdx
        currentOffset = CMTimeGetSeconds(player.currentTime())
      }
      player?.removeAllItems()

      downloadAndPlayFrom(currentIdx, currentOffset)
    }
  }

  public var currentVoicePair: VoicePair? {
    let voice = currentVoice
    return VOICES.first(where: { $0.firstKey == voice || $0.secondKey == voice })
  }

  public func getPreferredVoice(forLanguage language: String) -> String {
    UserDefaults.standard.string(forKey: "\(language)-\(UserDefaultKey.textToSpeechPreferredVoice.rawValue)") ?? currentVoiceLanguage.defaultVoice
  }

  public func setPreferredVoice(_ voice: String, forLanguage language: String) {
    UserDefaults.standard.set(voice, forKey: "\(language)-\(UserDefaultKey.textToSpeechPreferredVoice.rawValue)")
  }

  private func downloadAndPlayFrom(_ currentIdx: Int, _ currentOffset: Double) {
    let desiredState = state

    pause()
    document = nil
    synthesizer = nil

    if let itemID = itemAudioProperties?.itemID {
      Task {
        let document = try? await downloadSpeechFile(itemID: itemID, priority: .high)

        DispatchQueue.main.async {
          if let document = document {
            let synthesizer = SpeechSynthesizer(appEnvironment: self.appEnvironment, networker: self.networker, document: document)
            self.durations = synthesizer.estimatedDurations(forSpeed: self.playbackRate)
            self.synthesizer = synthesizer

            self.state = desiredState
            self.synthesizeFrom(start: currentIdx, playWhenReady: self.state == .playing, atOffset: currentOffset)
          } else {
            print("error loading audio")
            // TODO: post error to SnackBar?
          }
        }
      }
    }
  }

  public var secondaryVoice: String {
    let pair = VOICES.first { $0.firstKey == currentVoice || $0.secondKey == currentVoice }
    if let pair = pair {
      if pair.firstKey == currentVoice {
        return pair.secondKey
      }
      if pair.secondKey == currentVoice {
        return pair.firstKey
      }
    }
    return "en-US-CoraNeural"
  }

  public func playVoiceSample(voice: String) {
    do {
      if let url = Bundle.main.url(forResource: "tts-voice-sample-\(voice)", withExtension: "mp3") {
        let player = try AVAudioPlayer(contentsOf: url, fileTypeHint: AVFileType.mp3.rawValue)
        player.play()
      } else {
        NSNotification.operationFailed(message: "Error playing voice sample.")
      }
    } catch {
      print("ERROR", error)
      NSNotification.operationFailed(message: "Error playing voice sample.")
    }
  }

  private func updateDurations(oldPlayback: Double, newPlayback: Double) {
    if let oldDurations = durations {
      durations = oldDurations.map { $0 * oldPlayback / newPlayback }
    }
  }

  public func isLoadingItem(itemID: String) -> Bool {
    if state == .reachedEnd {
      return false
    }
    return itemAudioProperties?.itemID == itemID &&
      (state == .loading || player?.currentItem == nil || player?.currentItem?.status == .unknown)
  }

  public func isPlayingItem(itemID: String) -> Bool {
    state == .playing && itemAudioProperties?.itemID == itemID
  }

  public func skipForward(seconds: Double) {
    seek(to: timeElapsed + seconds)
  }

  public func skipBackwards(seconds: Double) {
    seek(to: timeElapsed - seconds)
  }

  public func fileNameForAudioFile(_ itemID: String) -> String {
    itemID + "-" + currentVoice + ".mp3"
  }

  public func pathForAudioDirectory(itemID: String) -> URL {
    FileManager.default
      .urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("audio-\(itemID)/")
  }

  public func pathForSpeechFile(itemID: String) -> URL {
    pathForAudioDirectory(itemID: itemID)
      .appendingPathComponent("speech-\(currentVoice).json")
  }

  public func startAudio() {
    state = .loading
    setupNotifications()

    if let itemID = itemAudioProperties?.itemID {
      Task {
        let document = try? await downloadSpeechFile(itemID: itemID, priority: .high)
        DispatchQueue.main.async {
          if let document = document {
            self.startStreamingAudio(itemID: itemID, document: document)
          } else {
            print("unable to load speech document")
            // TODO: Post error to SnackBar
          }
        }
      }
    }
  }

  // swiftlint:disable all
  private func startStreamingAudio(itemID _: String, document: SpeechDocument) {
    do {
      try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
    } catch {
      print("error playing MP3 file", error)
      // try? FileManager.default.removeItem(atPath: audioUrl.path)
      state = .stopped
    }

    player = AVQueuePlayer(items: [])
    let synthesizer = SpeechSynthesizer(appEnvironment: appEnvironment, networker: networker, document: document)
    durations = synthesizer.estimatedDurations(forSpeed: playbackRate)
    self.synthesizer = synthesizer

    synthesizeFrom(start: 0, playWhenReady: true)
  }

  func synthesizeFrom(start: Int, playWhenReady: Bool, atOffset: Double = 0.0) {
    if let synthesizer = self.synthesizer, let items = self.synthesizer?.createPlayerItems(from: start) {
      for speechItem in items {
        let isLast = speechItem.audioIdx == synthesizer.document.utterances.count - 1
        let playerItem = SpeechPlayerItem(session: self, speechItem: speechItem) {
          if isLast {
            self.player?.pause()
            self.state = .reachedEnd
          }
        }
        player?.insert(playerItem, after: nil)
        if player?.items().count == 1, atOffset > 0.0 {
          playerItem.seek(to: CMTimeMakeWithSeconds(atOffset, preferredTimescale: 600)) { success in
            print("success seeking to time: ", success)
            self.fireTimer()
          }
        }
        if playWhenReady, player?.items().count == 1 {
          startTimer()
          unpause()
          setupRemoteControl()
        }
      }
      if items.count < 1 {
        state = .reachedEnd
      }
    }
  }

  public func pause() {
    if let player = player {
      player.pause()
      state = .paused
    }
  }

  public func unpause() {
    if let player = player {
      player.rate = Float(playbackRate)
      state = .playing
    }
  }

  func formatTimeInterval(_ time: TimeInterval) -> String? {
    let componentFormatter = DateComponentsFormatter()
    componentFormatter.unitsStyle = .positional
    componentFormatter.allowedUnits = time >= 3600 ? [.second, .minute, .hour] : [.second, .minute]
    componentFormatter.zeroFormattingBehavior = .pad
    return componentFormatter.string(from: time)
  }

  // What we need is an array of all items in a document, either Utterances if unloaded or AVPlayerItems
  // if they have been loaded, then for each one we can calculate a duration
  func durationBefore(playerIndex: Int) -> TimeInterval {
    let result = durations?.prefix(playerIndex).reduce(0, +) ?? 0
    return result
  }

  func startTimer() {
    if timer == nil {
      timer = Timer.scheduledTimer(timeInterval: 0.1, target: self, selector: #selector(fireTimer), userInfo: nil, repeats: true)
      timer?.fire()
    }
  }

  // Every second, get the current playing time of the player and refresh the status of the player progressslider
  @objc func fireTimer() {
    if let player = player {
      if player.error != nil || player.currentItem?.error != nil {
        stop()
      }

      if let durations = durations {
        duration = durations.reduce(0, +)
        durationString = formatTimeInterval(duration)
      }
    }

    if let player = player {
      switch scrubState {
      case .reset:
        if let playerItem = player.currentItem as? SpeechPlayerItem {
          let itemElapsed = playerItem.status == .readyToPlay ? CMTimeGetSeconds(playerItem.currentTime()) : 0
          timeElapsed = durationBefore(playerIndex: playerItem.speechItem.audioIdx) + itemElapsed
          timeElapsedString = formatTimeInterval(timeElapsed)

          if var nowPlaying = MPNowPlayingInfoCenter.default().nowPlayingInfo {
            nowPlaying[MPMediaItemPropertyPlaybackDuration] = NSNumber(value: duration)
            nowPlaying[MPNowPlayingInfoPropertyElapsedPlaybackTime] = NSNumber(value: timeElapsed)
            MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlaying
          }
        }
      case .scrubStarted:
        break
      case let .scrubEnded(seekTime):
        timeElapsed = seekTime
        timeElapsedString = formatTimeInterval(timeElapsed)
        if var nowPlaying = MPNowPlayingInfoCenter.default().nowPlayingInfo {
          nowPlaying[MPMediaItemPropertyPlaybackDuration] = NSNumber(value: duration)
          nowPlaying[MPNowPlayingInfoPropertyElapsedPlaybackTime] = NSNumber(value: timeElapsed)
          MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlaying
        }
      }
    }

//    if let item = self.item, let speechItem = player?.currentItem as? SpeechPlayerItem {
//      NotificationCenter.default.post(
//        name: NSNotification.SpeakingReaderItem,
//        object: nil,
//        userInfo: [
//          "pageID": item.unwrappedID,
//          "anchorIdx": String(speechItem.speechItem.htmlIdx)
//        ]
//      )
//    }
  }

  func clearNowPlayingInfo() {
    MPNowPlayingInfoCenter.default().nowPlayingInfo = [:]
  }

  func downloadAndSetArtwork() async {
    if let pageId = itemAudioProperties?.itemID, let imageURL = itemAudioProperties?.imageURL {
      if let result = try? await URLSession.shared.data(from: imageURL) {
        if let downloadedImage = UIImage(data: result.0) {
          let artwork = MPMediaItemArtwork(boundsSize: downloadedImage.size, requestHandler: { _ -> UIImage in
            downloadedImage
          })
          DispatchQueue.main.async {
            if pageId == self.itemAudioProperties?.itemID {
              if var nowPlaying = MPNowPlayingInfoCenter.default().nowPlayingInfo {
                nowPlaying[MPMediaItemPropertyArtwork] = artwork
                MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlaying
              }
            }
          }
        }
      }
    }
  }

  func setupRemoteControl() {
    UIApplication.shared.beginReceivingRemoteControlEvents()

    if let itemAudioProperties = itemAudioProperties {
      MPNowPlayingInfoCenter.default().nowPlayingInfo = [
        MPMediaItemPropertyTitle: NSString(string: itemAudioProperties.title),
        MPMediaItemPropertyArtist: NSString(string: itemAudioProperties.byline ?? "Omnivore"),
        MPMediaItemPropertyPlaybackDuration: NSNumber(value: duration),
        MPNowPlayingInfoPropertyElapsedPlaybackTime: NSNumber(value: timeElapsed)
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
        self.seek(to: event.positionTime)
        return .success
      }
      return .commandFailed
    }

    Task {
      await downloadAndSetArtwork()
    }
  }

  func isoLangForCurrentVoice() -> String {
    // currentVoicePair should not ever be nil but if it is we return an empty string
    if let isoLang = currentVoicePair?.language {
      return "&language=\(isoLang)"
    }
    return ""
  }

  func downloadSpeechFile(itemID: String, priority: DownloadPriority) async throws -> SpeechDocument? {
    let decoder = JSONDecoder()
    let speechFileUrl = pathForSpeechFile(itemID: itemID)

    if FileManager.default.fileExists(atPath: speechFileUrl.path) {
      let data = try Data(contentsOf: speechFileUrl)
      document = try decoder.decode(SpeechDocument.self, from: data)
      // If we can't load it from disk we make the API call
      if let document = document {
        return document
      }
    }

    let path = "/api/article/\(itemID)/speech?voice=\(currentVoice)&secondaryVoice=\(secondaryVoice)&priority=\(priority)\(isoLangForCurrentVoice())"
    guard let url = URL(string: path, relativeTo: appEnvironment.serverBaseURL) else {
      throw BasicError.message(messageText: "Invalid audio URL")
    }

    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    for (header, value) in networker.defaultHeaders {
      request.setValue(value, forHTTPHeaderField: header)
    }

    let result: (Data, URLResponse)? = try? await URLSession.shared.data(for: request)
    guard let httpResponse = result?.1 as? HTTPURLResponse, 200 ..< 300 ~= httpResponse.statusCode else {
      throw BasicError.message(messageText: "audioFetch failed. no response or bad status code.")
    }

    guard let data = result?.0 else {
      throw BasicError.message(messageText: "audioFetch failed. no data received.")
    }

    let str = String(decoding: data, as: UTF8.self)
    print("result speech file: ", str)

    let document = try? JSONDecoder().decode(SpeechDocument.self, from: data)

    // Cache the file - if it exists
    if let document = document {
      do {
        try? FileManager.default.createDirectory(at: document.audioDirectory, withIntermediateDirectories: true)
        try data.write(to: speechFileUrl)
      } catch {
        print("error writing file", error)
      }
    }

    return document
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
