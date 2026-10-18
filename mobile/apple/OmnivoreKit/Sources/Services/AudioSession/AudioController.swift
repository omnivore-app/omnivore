// swiftlint:disable file_length type_body_length
#if os(iOS)

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

public struct DigestAudioItem: AudioItemProperties {
  public let audioItemType = Models.AudioItemType.digest
  public let digest: DigestResult
  public let itemID: String
  public let title: String
  public let chapters: [DigestChapterData]

  public var byline: String?
  public var imageURL: URL?
  public var language: String?
  public var startIndex: Int = 0
  public var startOffset: Double = 0.0

  public init(digest: DigestResult, chapters: [DigestChapterData]) {
    self.digest = digest
    self.itemID = digest.id
    self.title = digest.title ?? "Omnivore digest"
    self.chapters = chapters
 
    self.startIndex = 0
    self.startOffset = 0

    self.imageURL = nil

    if let first = digest.speechFiles?.first {
      self.language = first.language
      self.byline  = digest.byline
    }
  }
}

  // swiftlint:disable all
  @MainActor
  public class AudioController: NSObject, ObservableObject, AVAudioPlayerDelegate {
    @Published public var state: AudioControllerState = .stopped
    @Published public var currentAudioIndex: Int = 0
    @Published public var readText: String = ""
    @Published public var unreadText: String = ""
    @Published public var itemAudioProperties: AudioItemProperties?
    
    @Published public var timeElapsed: TimeInterval = 0
    @Published public var duration: TimeInterval = 0
    @Published public var timeElapsedString: String?
    @Published public var durationString: String?
    @Published public var voiceList: [VoiceItem]?
    @Published public var realisticVoiceList: [VoiceItem]?
    
    @Published public var textItems: [String]?
    
    @Published public var playbackError: Bool = false
    
    let dataService: DataService
    
    var timer: Timer?
    var player: AVQueuePlayer?
    var observer: Any?
    var document: SpeechDocument?
    var synthesizer: SpeechSynthesizer?
    var durations: [Double]?
    var lastReadUpdate = 0.0
    
    var samplePlayer: AVPlayer?
    
    public init(dataService: DataService) {
      self.dataService = dataService
      
      super.init()
      self.voiceList = generateVoiceList()
      self.realisticVoiceList = generateRealisticVoiceList()
      self._currentLanguage = defaultLanguage
    }
    
    deinit {
      player = nil
      observer = nil
    }
    
    public func play(itemAudioProperties: AudioItemProperties) {
      stop()
      
      playbackError = false
      self.itemAudioProperties = itemAudioProperties
      startAudio(atIndex: itemAudioProperties.startIndex, andOffset: itemAudioProperties.startOffset)

      EventTracker.track(
        .audioSessionStart(
          linkID: itemAudioProperties.itemID,
          voice: currentVoice.lowercased(),
          voiceProvider: Voices.isUltraRealisticVoice(currentVoice) ? "ultra" :
            Voices.isOpenAIVoice(currentVoice) ? "openai" : "default"
        )
      )
    }
    
    public var offsets: [Double]? {
      if let durations = durations {
        var currentSum = 0.0
        return durations.map {
          currentSum += $0
          return currentSum
        }
      }
      return nil
    }
    
    public func stop() {
      let stoppedId = itemAudioProperties?.itemID
      let stoppedTimeElapsed = timeElapsed
      
      savePositionInfo(force: true)
      
      player?.pause()
      timer?.invalidate()
      
      clearNowPlayingInfo()
      
      player?.replaceCurrentItem(with: nil)
      player?.removeAllItems()
      
      document = nil
      textItems = nil
      
      timer = nil
      player = nil
      observer = nil
      synthesizer = nil
      lastReadUpdate = 0
      
      itemAudioProperties = nil
      state = .stopped
      timeElapsed = 0
      duration = 1
      durations = nil
      currentAudioIndex = 0
      
      if let stoppedId = stoppedId {
        EventTracker.track(
          .audioSessionEnd(linkID: stoppedId, timeElapsed: stoppedTimeElapsed)
        )
      }
    }
    
    public func stopWithError() {
      pause()
      playbackError = true
      
      timer?.invalidate()
      timer = nil
      if let player = player {
        player.removeAllItems()
      }
    }
    
    public func generateVoiceList() -> [VoiceItem] {
      Voices.Pairs.flatMap { voicePair in
        [
          VoiceItem(name: voicePair.firstName, key: voicePair.firstKey, category: voicePair.category, selected: voicePair.firstKey == currentVoice),
          VoiceItem(name: voicePair.secondName, key: voicePair.secondKey, category: voicePair.category, selected: voicePair.secondKey == currentVoice)
        ]
      }.sorted { $0.name.lowercased() < $1.name.lowercased() }
    }
    
    public func generateRealisticVoiceList() -> [VoiceItem] {
      Voices.UltraPairs.flatMap { voicePair in
        [
          VoiceItem(name: voicePair.firstName, key: voicePair.firstKey, category: voicePair.category, selected: voicePair.firstKey == currentVoice),
          VoiceItem(name: voicePair.secondName, key: voicePair.secondKey, category: voicePair.category, selected: voicePair.secondKey == currentVoice)
        ]
      }.sorted { $0.name.lowercased() < $1.name.lowercased() }
    }
    
    public func preload(itemIDs: [String], retryCount _: Int = 0) async -> Bool {
      for itemID in itemIDs {
        _ = try? await downloadSpeechFile(itemID: itemID, priority: .low)
      }
      return false
    }
    
    public func downloadForOffline(itemID: String) async -> Bool {
      if let document = try? await getSpeechFile(itemID: itemID, priority: .low) {
        let synthesizer = SpeechSynthesizer(appEnvironment: dataService.appEnvironment, networker: dataService.networker, document: document, speechAuthHeader: speechAuthHeader)
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
    
    public static func removeAudioFiles(itemID: String) {
      do {
        let audioDirectory = pathForAudioDirectory(itemID: itemID)
        try FileManager.default.removeItem(at: audioDirectory)
      } catch {
        // We don't need to throw here, as its likely the
        // directory just doesn't exist
        print("Error removing audio files", error)
      }
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
    
    public func seek(toUtterance: Int) {
      player?.pause()
      
      player?.removeAllItems()
      synthesizeFrom(start: toUtterance, playWhenReady: state == .playing, atOffset: 0.0)
      scrubState = .reset
      fireTimer()
    }
    
    public func seek(to: TimeInterval) {
      let position = max(0, to)
      
      // Always reset this state when seeking so we trigger a re-saving of positional info
      lastReadUpdate = 0
      
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
          lastReadUpdate = 0
          player?.removeAllItems()
          synthesizeFrom(start: durations.count - 1, playWhenReady: state == .playing, atOffset: last)
        }
      }
      
      scrubState = .reset
      fireTimer()
    }
    
    public func seek(toIdx: Int) {
      let before = durationBefore(playerIndex: toIdx)
      let remainder = 0.0

      // if the foundIdx happens to be the current item, we just set the position
      if let playerItem = player?.currentItem as? SpeechPlayerItem {
        if playerItem.speechItem.audioIdx == toIdx {
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
      synthesizeFrom(start: toIdx, playWhenReady: state == .playing, atOffset: remainder)
      
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
    
    @AppStorage(UserDefaultKey.textToSpeechPreloadEnabled.rawValue) public var preloadEnabled = false
    
    @AppStorage(UserDefaultKey.textToSpeechUseUltraRealisticVoices.rawValue) public var useUltraRealisticVoices = false
    
    @AppStorage(UserDefaultKey.textToSpeechUltraRealisticFeatureKey.rawValue) public var ultraRealisticFeatureKey: String = ""
    @AppStorage(UserDefaultKey.textToSpeechUltraRealisticFeatureRequested.rawValue) public var ultraRealisticFeatureRequested: Bool = false
    
    var speechAuthHeader: String? {
      if Voices.isUltraRealisticVoice(currentVoice), !ultraRealisticFeatureKey.isEmpty {
        return ultraRealisticFeatureKey
      }
      return nil
    }
    
    public var currentVoiceLanguage: VoiceLanguage {
      Voices.Languages.first(where: { $0.key == currentLanguage }) ?? Voices.English
    }
    
    private var _currentLanguage: String?
    public var currentLanguage: String {
      get {
        if let currentLanguage = _currentLanguage {
          return currentLanguage
        }
        if let itemLang = itemAudioProperties?.language, let lang = Voices.Languages.first(where: { $0.name == itemLang || $0.key == itemLang }) {
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
        realisticVoiceList = generateRealisticVoiceList()
        
        var currentIdx = 0
        var currentOffset = 0.0
        if let player = self.player, let item = self.player?.currentItem as? SpeechPlayerItem {
          currentIdx = item.speechItem.audioIdx
          currentOffset = CMTimeGetSeconds(player.currentTime())
        }
        player?.removeAllItems()
        playbackError = false
        
        downloadAndPlayFrom(currentIdx, currentOffset)
      }
    }
    
    public var currentVoicePair: VoicePair? {
      let voice = currentVoice
      if Voices.isUltraRealisticVoice(currentVoice) {
        let ultraPair = Voices.UltraPairs.first { $0.firstKey == currentVoice || $0.secondKey == currentVoice }
        if let ultraPair = ultraPair {
          return ultraPair
        }
      }
      return Voices.Pairs.first(where: { $0.firstKey == voice || $0.secondKey == voice })
    }
    
    struct TextNode: Codable {
      let to: String
      let from: String
      let heading: String
      let body: String
    }
    
    func setTextItems() {
      if let document = self.document {
        textItems = document.utterances.map { utterance in
          if let regex = try? NSRegularExpression(pattern: "<[^>]*>", options: .caseInsensitive) {
            let modString = regex.stringByReplacingMatches(in: utterance.text, options: [], range: NSRange(location: 0, length: utterance.text.count), withTemplate: "")
            return modString
          }
          return ""
        }
        currentAudioIndex = 0
      } else {
        textItems = nil
      }
    }
    
    func updateReadText() {
      if let item = player?.currentItem as? SpeechPlayerItem, let speechMarks = item.speechMarks {
        var currentItemOffset = 0
        for idx in 0 ..< speechMarks.count {
          if speechMarks[idx].time ?? 0 < 0 {
            continue
          }
          if (speechMarks[idx].time ?? 0.0) > CMTimeGetSeconds(item.currentTime()) * 1000 {
            currentItemOffset = speechMarks[idx].start ?? 0
            break
          }
        }
        // check to see if we are greater than all
        if let last = speechMarks.last, let lastTime = last.time {
          if CMTimeGetSeconds(item.currentTime()) * 1000 > lastTime {
            currentItemOffset = (last.start ?? 0) + (last.length ?? 0)
          }
        }
        
        // Sometimes we get negatives
        currentItemOffset = max(currentItemOffset, 0)
        
        let idx = currentAudioIndex // item.speechItem.audioIdx
        if idx < document?.utterances.count ?? 0 {
          let currentItem = document?.utterances[idx].text ?? ""
          let currentReadIndex = currentItem.index(currentItem.startIndex, offsetBy: min(currentItemOffset, currentItem.count))
          let lastItem = String(currentItem[..<currentReadIndex])
          let lastItemAfter = String(currentItem[currentReadIndex...])
          
          readText = lastItem
          unreadText = lastItemAfter
        }
      } else {
        readText = ""
      }
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
          let document = try? await self.getSpeechFile(itemID: itemID, priority: .high)
          
          DispatchQueue.main.async {
            if let document = document {
              let synthesizer = SpeechSynthesizer(appEnvironment: self.dataService.appEnvironment, networker: self.dataService.networker, document: document, speechAuthHeader: self.speechAuthHeader)
              
              self.setTextItems()
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
      if let pair = currentVoicePair {
        if pair.firstKey == currentVoice {
          return pair.secondKey
        }
        if pair.secondKey == currentVoice {
          return pair.firstKey
        }
      }
      return "en-US-CoraNeural"
    }
    
    func previewVoiceURL(_ voice: String) -> URL? {
      URL(string: "https://storage.googleapis.com/omnivore_preview_bucket/tts-voice-previews/\(voice).mp3")
    }
    
    public func playVoiceSample(voice: String) {
      pause()
      
      if let url = previewVoiceURL(voice) {
        samplePlayer = AVPlayer(playerItem: AVPlayerItem(url: url))
        if let samplePlayer = samplePlayer {
          samplePlayer.play()
        }
      } else {
        NSNotification.operationFailed(message: "Error playing voice sample.")
      }
    }
    
    public func isPlayingSample(voice: String) -> Bool {
      if let samplePlayer = self.samplePlayer, let url = previewVoiceURL(voice) {
        if let urlAsset = samplePlayer.currentItem?.asset as? AVURLAsset {
          return urlAsset.url == url && samplePlayer.timeControlStatus == .playing
        }
        return false
      }
      return false
    }
    
    public func stopVoiceSample() {
      if let samplePlayer = self.samplePlayer {
        samplePlayer.pause()
        self.samplePlayer = nil
      }
    }
    
    private func updateDurations(oldPlayback: Double, newPlayback: Double) {
      if let oldDurations = durations {
        durations = oldDurations.map { $0 * oldPlayback / newPlayback }
      }
    }
    
    public var isLoading: Bool {
      if state == .reachedEnd {
        return false
      }
      return (state == .loading || player?.currentItem == nil || player?.currentItem?.status == .unknown)
    }
    
    public var isPlaying: Bool {
      state == .playing
    }
    
    public func isLoadingItem(_ audioItem: AudioItemProperties?) -> Bool {
      if state == .reachedEnd {
        return false
      }
      if audioItem?.itemID == nil {
        return false
      }
      return itemAudioProperties?.itemID == audioItem?.itemID && isLoading
    }
    
    public func isPlayingItem(itemID: String) -> Bool {
      itemAudioProperties?.itemID == itemID && isPlaying
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
    
    public static func pathForAudioDirectory(itemID: String) -> URL {
      URL.om_documentsDirectory
        .appendingPathComponent("audio-\(itemID)/")
    }
    
    public func pathForSpeechFile(itemID: String) -> URL {
      Self.pathForAudioDirectory(itemID: itemID)
        .appendingPathComponent("speech-\(currentVoice).json")
    }
    
    public func startAudio(atIndex index: Int, andOffset offset: Double) {
      state = .loading
      setupNotifications()
      
      if let itemID = itemAudioProperties?.itemID {
        Task {
          let document = try? await getSpeechFile(itemID: itemID, priority: .high)
          
          DispatchQueue.main.async {
            self.setTextItems()
            if let document = document {
              // Don't attempt to seek past the end, restart from beginning if we are
              // past the max utterances in the document.
              let startIndex = index < document.utterances.count ? index : 0
              let startOffset = index < document.utterances.count ? offset : 0.0
              self.startStreamingAudio(itemID: itemID, document: document, atIndex: startIndex, andOffset: startOffset)
            } else {
              self.stopWithError()
            }
          }
        }
      }
    }
    
    // swiftlint:disable all
    private func startStreamingAudio(itemID _: String, document: SpeechDocument, atIndex index: Int, andOffset offset: Double) {
      do {
        try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
      } catch {
        print("error playing MP3 file", error)
        // try? FileManager.default.removeItem(atPath: audioUrl.path)
        state = .stopped
      }
      
      player = AVQueuePlayer(items: [])
      if let player = player {
        observer = player.observe(\.currentItem, options: [.new]) { _, _ in
          DispatchQueue.main.async {
            self.currentAudioIndex = (player.currentItem as? SpeechPlayerItem)?.speechItem.audioIdx ?? 0
            self.updateReadText()
          }
        }
      }
      
      let synthesizer = SpeechSynthesizer(appEnvironment: dataService.appEnvironment, networker: dataService.networker, document: document, speechAuthHeader: speechAuthHeader)
      durations = synthesizer.estimatedDurations(forSpeed: playbackRate)
      self.synthesizer = synthesizer
      
#if !targetEnvironment(simulator)
      synthesizeFrom(start: index, playWhenReady: true, atOffset: offset)
#endif
    }
    
    func synthesizeFrom(start: Int, playWhenReady: Bool, atOffset: Double = 0.0) {
      if let synthesizer = self.synthesizer, let items = self.synthesizer?.createPlayerItems(from: start) {
        let prefetchQueue = OperationQueue()
        prefetchQueue.maxConcurrentOperationCount = 1

        for speechItem in items {
          let isLast = speechItem.audioIdx == synthesizer.document.utterances.count - 1
          let playerItem = SpeechPlayerItem(session: self, prefetchQueue: prefetchQueue, speechItem: speechItem) {
            if isLast {
              self.player?.pause()
              self.state = .reachedEnd
            }
          }
          player?.insert(playerItem, after: nil)
          if player?.items().count == 1, atOffset > 0.0 {
            playerItem.seek(to: CMTimeMakeWithSeconds(atOffset, preferredTimescale: 600)) { success in
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
        savePositionInfo(force: true)
      }
    }
    
    public func unpause() {
      stopVoiceSample()
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
        lastReadUpdate = 0
        timer = Timer.scheduledTimer(timeInterval: 0.2, target: self, selector: #selector(fireTimer), userInfo: nil, repeats: true)
        timer?.fire()
      }
    }
    
    // Every second, get the current playing time of the player and refresh the status of the player progressslider
    @objc func fireTimer() {
      if let player = player {
        if player.error != nil || player.currentItem?.error != nil {
          stopWithError()
        }
        
        if let durations = durations {
          duration = durations.reduce(0, +)
          durationString = formatTimeInterval(duration)
        }
        
        updateReadText()
      }
      
      if let player = player {
        switch scrubState {
        case .reset:
          if let playerItem = player.currentItem as? SpeechPlayerItem {
            let itemElapsed = playerItem.status == .readyToPlay ? CMTimeGetSeconds(playerItem.currentTime()) : 0
            if itemElapsed >= CMTimeGetSeconds(playerItem.duration) + 0.5 {
              // Occasionally AV wont send an event for a new item starting for ~3s, if this
              // happens we can try to manually update the time
              if playerItem.speechItem.audioIdx + 1 < (document?.utterances.count ?? 0) {
                currentAudioIndex = playerItem.speechItem.audioIdx + 1
              }
            }
            
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
      
      savePositionInfo()
    }
    
    func savePositionInfo(force: Bool = false) {
      if force || (timeElapsed - 10 > lastReadUpdate) {
        let percentProgress = timeElapsed / duration
        let speechIndex = (player?.currentItem as? SpeechPlayerItem)?.speechItem.audioIdx ?? 0
        let anchorIndex = Int((player?.currentItem as? SpeechPlayerItem)?.speechItem.htmlIdx ?? "") ?? 0

        if let itemID = itemAudioProperties?.itemID {
          dataService.updateLinkReadingProgress(itemID: itemID, readingProgress: percentProgress, anchorIndex: anchorIndex, force: true)
        }

        if let itemID = itemAudioProperties?.itemID,
            let player = player,
            let currentItem = player.currentItem,
            itemAudioProperties?.audioItemType == .libraryItem {
          let currentOffset = CMTimeGetSeconds(currentItem.currentTime())
          dataService.updateLinkListeningProgress(itemID: itemID,
                                                  listenIndex: speechIndex,
                                                  listenOffset: currentOffset,
                                                  listenTime: timeElapsed)
        }
        
        lastReadUpdate = timeElapsed
      }
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
      commandCenter.skipForwardCommand.preferredIntervals = [15, 30, 60]
      commandCenter.skipForwardCommand.addTarget { event -> MPRemoteCommandHandlerStatus in
        if let event = event as? MPSkipIntervalCommandEvent {
          self.skipForward(seconds: event.interval)
          return .success
        }
        return .commandFailed
      }
      
      commandCenter.skipBackwardCommand.isEnabled = true
      commandCenter.skipBackwardCommand.preferredIntervals = [15, 30, 60]
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

      if let digest = self.itemAudioProperties as? DigestAudioItem {
        commandCenter.nextTrackCommand.isEnabled = true
        commandCenter.nextTrackCommand.addTarget { event -> MPRemoteCommandHandlerStatus in
          if let next = self.nextChapterIndex(chapters: digest.chapters, idx: self.currentAudioIndex) {
            self.seek(toIdx: next)
            return .success
          }
          return .commandFailed
        }

        commandCenter.previousTrackCommand.isEnabled = true
        commandCenter.previousTrackCommand.addTarget { event -> MPRemoteCommandHandlerStatus in
          if let next = self.prevChapterIndex(chapters: digest.chapters, idx: self.currentAudioIndex) {
            self.seek(toIdx: next)
            return .success
          }
          return .commandFailed
        }
      }

      Task {
        await downloadAndSetArtwork()
      }
    }

    func nextChapterIndex(chapters: [DigestChapterData], idx: Int) -> Int? {
      if let chapterIdx = currentChapterIndex(chapters: chapters, idx: idx) {
        if chapterIdx + 1 < chapters.count {
          return chapters[chapterIdx + 1].start
        }
      }
      return nil
    }

    func prevChapterIndex(chapters: [DigestChapterData], idx: Int) -> Int? {
      if let chapterIdx = currentChapterIndex(chapters: chapters, idx: idx) {
        if chapterIdx - 1 > 0 {
          return chapterIdx - 1
        }
      }
      return nil
    }

    func currentChapterIndex(chapters: [DigestChapterData], idx: Int) -> Int? {
      for (chapterIdx, chapter) in chapters.enumerated() {
        if idx >= chapter.start && idx < chapter.end {
          if chapterIdx + 1 < chapters.count {
            return chapterIdx
          }
        }
      }
      return nil
    }

    func isoLangForCurrentVoice() -> String {
      // currentVoicePair should not ever be nil but if it is we return an empty string
      if let isoLang = currentVoicePair?.language {
        return "&language=\(isoLang)"
      }
      return ""
    }
    
    func downloadSpeechFile(itemID: String, priority: DownloadPriority) async throws -> SpeechDocument? {
      switch(self.itemAudioProperties?.audioItemType) {
      case .digest:
        return try await downloadDigestItemSpeechFile(itemID: itemID, priority: priority)
      case .libraryItem:
        return try await downloadLibraryItemSpeechFile(itemID: itemID, priority: priority)
      case .none:
        return nil
      }
    }
    
    func downloadLibraryItemSpeechFile(itemID: String, priority: DownloadPriority) async throws -> SpeechDocument? {
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
      guard let url = URL(string: path, relativeTo: dataService.appEnvironment.serverBaseURL) else {
        throw BasicError.message(messageText: "Invalid audio URL")
      }
      
      var request = URLRequest(url: url)
      request.httpMethod = "GET"
      for (header, value) in dataService.networker.defaultHeaders {
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
      if let document = try? JSONDecoder().decode(SpeechDocument.self, from: data) {
        do {
          try? FileManager.default.createDirectory(at: document.audioDirectory, withIntermediateDirectories: true)
          try data.write(to: speechFileUrl)
          return document
        } catch {
          print("error writing file", error)
        }
      }
      
      return nil
    }
    
    func combineSpeechFiles(from digest: DigestResult) -> ([Utterance], Double) {
      let allUtterances = digest.speechFiles?.flatMap { $0.utterances } ?? []
      var updatedUtterances: [Utterance] = []
      var currentWordOffset = 0.0
      
      for (index, utterance) in allUtterances.enumerated() {
        let newUtterance = Utterance(
          idx: String(index + 1),
          text: utterance.text,
          voice: utterance.voice,
          wordOffset: currentWordOffset,
          wordCount: utterance.wordCount
        )
        updatedUtterances.append(newUtterance)
        currentWordOffset += utterance.wordCount
      }
      
      return (updatedUtterances, currentWordOffset)
    }
    
    func downloadDigestItemSpeechFile(itemID: String, priority: DownloadPriority) async throws -> SpeechDocument? {
      if let digestItem = itemAudioProperties as? DigestAudioItem, let firstFile = digestItem.digest.speechFiles?.first {
        let (utterances, wordCount) = combineSpeechFiles(from: digestItem.digest)
        
        let document = SpeechDocument(
          pageId: digestItem.itemID,
          wordCount: wordCount,
          language: firstFile.language,
          defaultVoice: firstFile.defaultVoice,
          utterances: utterances
        )
        try? FileManager.default.createDirectory(at: document.audioDirectory, withIntermediateDirectories: true)
        return document
      }
      
      return nil
    }
    
    func getSpeechFile(itemID: String, priority: DownloadPriority) async throws -> SpeechDocument? {
      document = try await downloadSpeechFile(itemID: itemID, priority: priority)
      return document
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

#endif
