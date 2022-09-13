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

struct VoicePair {
  let firstKey: String
  let secondKey: String

  let firstName: String
  let secondName: String
}

let VOICES = [
  VoicePair(firstKey: "en-US-JennyNeural", secondKey: "en-US-BrandonNeural", firstName: "Jenny (USA)", secondName: "Brandon (USA)"),
  VoicePair(firstKey: "en-US-CoraNeural", secondKey: "en-US-ChristopherNeural", firstName: "Cora (USA)", secondName: "Christopher (USA)"),
  VoicePair(firstKey: "en-US-ElizabethNeural", secondKey: "en-US-EricNeural", firstName: "Elizabeth (USA)", secondName: "Eric (USA)"),
  VoicePair(firstKey: "en-CA-ClaraNeural", secondKey: "en-CA-LiamNeural", firstName: "Clara (Canada)", secondName: "Liam (Canada)"),
  VoicePair(firstKey: "en-GB-LibbyNeural", secondKey: "en-GB-EthanNeural", firstName: "Libby (UK)", secondName: "Ethan (UK)"),
  VoicePair(firstKey: "en-AU-NatashaNeural", secondKey: "en-AU-WilliamNeural", firstName: "Natasha (Australia)", secondName: "William (Australia)"),
  VoicePair(firstKey: "en-IN-NeerjaNeural", secondKey: "en-IN-PrabhatNeural", firstName: "Neerja (India)", secondName: "Prabhat (India)"),
  VoicePair(firstKey: "en-SG-LunaNeural", secondKey: "en-SG-WayneNeural", firstName: "Luna (Singapore)", secondName: "Wayne (Singapore)")
]

class SpeechPlayerItem: AVPlayerItem {
  let session: AudioController
  let speechItem: SpeechItem
  let completed: () -> Void

  var observer: Any?

  init(session: AudioController, speechItem: SpeechItem, url: URL, completed: @escaping () -> Void) {
    self.session = session
    self.speechItem = speechItem
    self.completed = completed

    let asset = AVAsset(url: url)
    super.init(asset: asset, automaticallyLoadedAssetKeys: nil)
    session.updateDuration(forItem: speechItem, newDuration: CMTimeGetSeconds(asset.duration))

    self.observer = observe(\.status, options: [.new]) { item, _ in
      item.session.updateDuration(forItem: item.speechItem, newDuration: CMTimeGetSeconds(item.duration))
    }

    NotificationCenter.default.addObserver(forName: NSNotification.Name.AVPlayerItemDidPlayToEndTime, object: self, queue: OperationQueue.main) { _ in
      self.completed()
    }
  }
}

// swiftlint:disable all
public class AudioController: NSObject, ObservableObject, AVAudioPlayerDelegate {
  @Published public var state: AudioControllerState = .stopped
  @Published public var itemAudioProperties: LinkedItemAudioProperties?

  @Published public var timeElapsed: TimeInterval = 0
  @Published public var duration: TimeInterval = 0
  @Published public var timeElapsedString: String?
  @Published public var durationString: String?
  @Published public var voiceList: [(name: String, key: String, selected: Bool)]?

  let appEnvironment: AppEnvironment
  let networker: Networker

  var timer: Timer?
  var player: AVQueuePlayer?
  var document: SpeechDocument?
  var synthesizer: SpeechSynthesizer?
  var durations: [Double]?

  var playbackTask: Task<Void, Error>?

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
  }

  public func stop() {
    player?.pause()
    timer?.invalidate()

    playbackTask?.cancel()
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
  }

  public func generateVoiceList() -> [(name: String, key: String, selected: Bool)] {
    VOICES.flatMap { voicePair in
      [
        (name: voicePair.firstName, key: voicePair.firstKey, selected: voicePair.firstKey == currentVoice),
        (name: voicePair.secondName, key: voicePair.secondKey, selected: voicePair.secondKey == currentVoice)
      ]
    }.sorted { $0.name.lowercased() < $1.name.lowercased() }
  }

  public func preload(itemIDs: [String], retryCount _: Int = 0) async -> Bool {
    for itemID in itemIDs {
      print("preloading speech file: ", itemID)
      _ = try? await downloadSpeechFile(itemID: itemID, priority: .low)
    }
    return true
  }

  public func downloadForOffline(itemID: String) async -> Bool {
    if let document = try? await downloadSpeechFile(itemID: itemID, priority: .low) {
      let synthesizer = SpeechSynthesizer(appEnvironment: appEnvironment, networker: networker, document: document)
      for await _ in synthesizer.fetch(from: 0) {}
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
    let position = max(0, to)

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
          return
        }
      }

      // Move the playback to the found index, we should also seek a bit
      // within this index, but this is probably accurate enough for now.
      player?.removeAllItems()
      synthesizeFrom(start: foundIdx, playWhenReady: state == .playing, atOffset: remainder)
      return
    } else {
      // There was no foundIdx, so we are probably trying to seek past the end, so
      // just seek to the last possible duration.
      if let durations = self.durations, let last = durations.last {
        player?.removeAllItems()
        synthesizeFrom(start: durations.count - 1, playWhenReady: state == .playing, atOffset: last)
      }
    }
  }

  @AppStorage(UserDefaultKey.textToSpeechPlaybackRate.rawValue) public var playbackRate = 1.0 {
    didSet {
      updateDurations(oldPlayback: oldValue, newPlayback: playbackRate)
      unpause()
      fireTimer()
    }
  }

  @AppStorage(UserDefaultKey.textToSpeechCurrentVoice.rawValue) public var currentVoice = "en-US-JennyNeural" {
    didSet {
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

  private func downloadAndPlayFrom(_ currentIdx: Int, _ currentOffset: Double) {
    let desiredState = state

    pause()
    playbackTask?.cancel()
    document = nil
    synthesizer = nil

    if let itemID = itemAudioProperties?.itemID {
      Task {
        self.document = try? await downloadSpeechFile(itemID: itemID, priority: .high)
        DispatchQueue.main.async {
          let synthesizer = SpeechSynthesizer(appEnvironment: self.appEnvironment, networker: self.networker, document: self.document!)
          self.durations = synthesizer.estimatedDurations(forSpeed: self.playbackRate)
          self.synthesizer = synthesizer

          self.state = desiredState
          self.synthesizeFrom(start: currentIdx, playWhenReady: self.state == .playing, atOffset: currentOffset)
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
    return "en-US-EricNeural"
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
    return
      itemAudioProperties?.itemID == itemID &&
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
        self.document = try? await downloadSpeechFile(itemID: itemID, priority: .high)
        DispatchQueue.main.async {
          self.startStreamingAudio(itemID: itemID)
        }
      }
    }
  }

  // swiftlint:disable all
  private func startStreamingAudio(itemID _: String) {
    do {
      try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
    } catch {
      print("error playing MP3 file", error)
      // try? FileManager.default.removeItem(atPath: audioUrl.path)
      state = .stopped
    }

    player = AVQueuePlayer(items: [])
    let synthesizer = SpeechSynthesizer(appEnvironment: appEnvironment, networker: networker, document: document!)
    durations = synthesizer.estimatedDurations(forSpeed: playbackRate)
    self.synthesizer = synthesizer

    synthesizeFrom(start: 0, playWhenReady: true)
  }

  func synthesizeFrom(start: Int, playWhenReady: Bool, atOffset: Double = 0.0) {
    playbackTask = Task {
      if let synthesizer = synthesizer {
        for await speechItem in synthesizer.fetch(from: start) {
          DispatchQueue.main.async {
            let isLast = speechItem.audioIdx == synthesizer.document.utterances.count - 1
            let item = SpeechPlayerItem(session: self, speechItem: speechItem, url: speechItem.audioURL) {
              // Pause player when we complete the final item.
              if isLast {
                self.player?.pause()
                self.state = .reachedEnd
              }
            }
            self.player?.insert(item, after: nil)

            if playWhenReady, self.player?.items().count == 1 {
              if atOffset > 0.0 {
                item.seek(to: CMTimeMakeWithSeconds(atOffset, preferredTimescale: 600)) { success in
                  print("success seeking to time: ", success)
                  self.fireTimer()
                }
              }
              self.startTimer()
              self.unpause()
              self.setupRemoteControl()
            }
          }
        }
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
      // Update every 100ms
      timer = Timer.scheduledTimer(timeInterval: 0.1, target: self, selector: #selector(fireTimer), userInfo: nil, repeats: true)
      timer?.fire()
    }
  }

  // Every second, get the current playing time of the player and refresh the status of the player progressslider
  @objc func fireTimer() {
    if let player = player {
      if player.error != nil || player.currentItem?.error != nil {
        print("ERROR IN PLAYBACK")
        stop()
      }

      if player.items().count == 1, let currentTime = player.currentItem?.currentTime(), let duration = player.currentItem?.duration {
        if currentTime >= duration {
          pause()
          state = .reachedEnd
        }
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
        }
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

  func setupRemoteControl() {
    UIApplication.shared.beginReceivingRemoteControlEvents()

    if let itemAudioProperties = itemAudioProperties {
      MPNowPlayingInfoCenter.default().nowPlayingInfo = [
        MPMediaItemPropertyTitle: NSString(string: itemAudioProperties.title),
        MPMediaItemPropertyArtist: NSString(string: itemAudioProperties.author ?? "Omnivore"),
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
  }

  func downloadSpeechFile(itemID: String, priority: DownloadPriority) async throws -> SpeechDocument? {
    let decoder = JSONDecoder()
    let speechFileUrl = pathForSpeechFile(itemID: itemID)

    if FileManager.default.fileExists(atPath: speechFileUrl.path) {
      print("SPEECH FILE ALREADY EXISTS: ", speechFileUrl.path)
      let data = try Data(contentsOf: speechFileUrl)
      document = try decoder.decode(SpeechDocument.self, from: data)
      // If we can't load it from disk we make the API call
      if let document = document {
        return document
      }
    }

    let path = "/api/article/\(itemID)/speech?voice=\(currentVoice)&secondaryVoice=\(secondaryVoice)&priority=\(priority)"
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
      print("error", result)
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
//
//  var document: SpeechDocument {
//    let utterances = [
  ////      Utterance(text: " Published Date: 29 August 2022 "),
  ////      Utterance(text: "Watch the full video of the Green Shoots Seminar here ."),
  ////      Utterance(text: "Good morning. Thank you for joining us today."),
  ////      Utterance(text: " Let me start with the elephant in the room."),
  ////      Utterance(text: " MAS seems to be sending mixed signals when it comes to crypto and digital assets."),
  ////      Utterance(text: " On the one hand, MAS is promoting Singapore as a FinTech hub, partnering industry to explore distributed ledger technology (DLT), and supporting innovation in digital asset use cases.  MAS has said it wants to attract leading crypto players to Singapore. On the other hand, MAS has a stringent and lengthy licensing process for those who want to carry out crypto-related services.  MAS has also been issuing strong warnings against retail investments in cryptocurrencies and has been taking increasingly stronger measures to restrict retail access to cryptocurrencies. "),
  ////      Utterance(text: "There have been expressions of confusion and concern by some observers."),
  ////      Utterance(text: " They point to apparent contradictions in MAS’ stance – that although MAS has said that it is “excited about the potential to build a crypto or tokenised economy”, it “imposes a stringent regime”. Some others have lamented that MAS has made a “u-turn” in its digital asset policies.  They say that MAS was once “making pro-crypto decisions” but was now being “overly cautious and losing its appeal as a global crypto hub”. Yet others see MAS as having struck the right balance, that “the crypto winter is proving MAS’ policies to be right”. "),
  ////      Utterance(text: "What does MAS really want?  Well, we know what we want but I think we need to do a better job of explaining it."),
  ////      Utterance(text: " Before I get to that, it is important to be clear what we are talking about."),
  ////      Utterance(text: " Public and media attention has tended to focus on cryptocurrencies.  But cryptocurrencies are just one part of the entire digital asset ecosystem. To understand the issues more sharply and what the benefits and risks are, we need to be clear what the different components of this ecosystem are. I can understand why there is confusion about cryptocurrencies, blockchains, and digital assets.  The inherent complexity of this ecosystem has made it difficult even for MAS to get its messages across. So, today, we will try to do a better job of explaining the ecosystem and its different components – and what MAS is actively promoting; what MAS is discouraging; and what are the risks MAS is seeking to manage.  My apologies if the next couple of minutes sound like a tutorial but it is important that we are clear about the concepts we are dealing with. "),
  ////      Utterance(text: "A good place to start is with digital assets."),
  ////      Utterance(text: " A digital asset is anything of value whose ownership is represented in a digital or computerised form. This is done through a process called tokenisation – which involves using a software programme to convert ownership rights over an asset into a digital token. Many items can potentially be tokenised: financial assets like cash and bonds,  real assets like artwork and property,  even intangible items like carbon credits and computing resources.  In other words, anything that has value, when tokenised, becomes a digital asset.   Digital assets are typically deployed on distributed ledgers that record the ownership and transfer of ownership of these assets.   A blockchain is a type of distributed ledger that organises transaction records into blocks of data which are cryptographically linked together.  When deployed on distributed ledgers, digital assets are referred to as crypto assets. "),
  ////      Utterance(text: "It is this innovative combination of tokenisation and distributed ledgers that offers transformative economic potential."),
  ////      Utterance(text: " It basically allows anything of value to be represented in digital form, and to be stored and exchanged on a ledger that keeps an immutable record of all transactions.   It is this crypto or digital asset ecosystem that supports use cases which can potentially facilitate more efficient transactions, enhance financial inclusion, and unlock economic value. "),
  ////      Utterance(text: "This digital asset ecosystem is where MAS sees strong potential and is actively promoting."),
  ////      Utterance(text: "I have not said anything yet about cryptocurrencies.  Let me come to that now."),
  ////      Utterance(text: "A cryptocurrency is the digital asset issued directly by the distributed ledger protocol. "),
  ////      Utterance(text: " It is often referred to as the distributed ledger’s native currency, used as a medium of exchange and store of value within the network, for example to pay transaction fees or incentivise users to keep the network secure. "),
  ////      Utterance(text: "But cryptocurrencies have taken a life of their own outside of the distributed ledger – and this is the source of the crypto world’s problems."),
  ////      Utterance(text: " Cryptocurrencies are actively traded and heavily speculated upon, with prices that have nothing to do with any underlying economic value related to their use on the distributed ledger. The extreme price volatility of cryptocurrencies rules them out as a viable form of money or investment asset. "),
  ////      Utterance(text: "This speculation in cryptocurrencies is what MAS strongly discourages and seeks to restrict."),
  ////      Utterance(text: "Let me now elaborate on Singapore’s strategy to develop a digital asset ecosystem as well as our regulatory approach to manage the risks of digital assets. "),
  ////      Utterance(text: "SINGAPORE’S STRATEGY TO DEVELOP A DIGITAL ASSET ECOSYSTEM "),
  ////      Utterance(text: "Our vision is to build an innovative and responsible digital asset ecosystem in Singapore. "),
  ////      Utterance(text: " This is a core part of MAS’ overall FinTech agenda. As with everything else we do in FinTech, innovation through industry collaboration is key to growing the digital asset ecosystem. Crypto technologies are promising and there is great potential to improve financial services – this is a common goal shared by MAS, the financial industry, and the FinTech community.  But the only way to find out what works is through experimentation and exploration – “learning by doing”.  "),
  ////      Utterance(text: "We are taking a four-pronged approach to building the digital asset ecosystem."),
  ////      Utterance(text: " first, explore the potential of distributed ledger technology in promising use cases; second, support the tokenisation of financial and real economy assets; third, enable digital currency connectivity; and fourth, anchor players with strong value propositions and risk management. "),
  ////      Utterance(text: "EXPLORE POTENTIAL OF DISTRIBUTED LEDGER TECHNOLOGY IN PROMISING USE CASES"),
  ////      Utterance(text: "The most promising use cases of digital assets in financial services are in cross-border payment and settlement, trade finance, and pre- and post-trade capital market activities. There are several promising developments, including in Singapore."),
  ////      Utterance(text: " In cross-border payments and settlements, wholesale settlement networks using distributed ledger technologies such as Partior – a joint venture among DBS, JP Morgan and Temasek – are achieving reductions in settlement time from days to mere minutes.   In trade finance, networks like Contour – formed by a group of trade banks – are establishing common ledgers with traceability to automate document verification, enabling faster financing decisions and lower processing cost. In capital markets, Marketnode – a joint venture between SGX and Temasek – is leveraging distributed ledger technology to tokenise assets, which reduces the time needed to clear and settle securities transactions, from days to just minutes. "),
  ////      Utterance(text: "SUPPORT TOKENISATION OF FINANCIAL AND REAL ECONOMY ASSETS "),
  ////      Utterance(text: "The concept of asset tokenisation has transformative potential, not unlike securitisation 50 years ago. "),
  ////      Utterance(text: " Tokenisation enables the monetisation of any tangible or intangible asset.   It makes it easier to fractionalise an asset or split up its ownership.  Tokenisation allows the assets to be traded securely and seamlessly without the need for intermediaries. "),
  ////      Utterance(text: "There are already interesting applications in Singapore of tokenisation of both financial and real assets."),
  ////      Utterance(text: " UOB Bank has piloted the issuance of a S$600 million digital bond on Marketnode’s servicing platform that facilitates a seamless workflow. OCBC Bank has partnered with MetaVerse Green Exchange to develop green financing products using tokenised carbon credits to help companies offset their carbon emissions. "),
  ////      Utterance(text: "MAS itself has launched an initiative – called Project Guardian – to explore the potential of tokenised real economy and financial assets."),
  ////      Utterance(text: " The first industry pilot, led by DBS Bank, JP Morgan, SBI Group and Marketnode, will explore the institutional trading of tokenised bonds and deposits to improve efficiency and liquidity in wholesale funding markets. "),
  ////      Utterance(text: "ENABLE DIGITAL CURRENCY CONNECTIVITY"),
  ////      Utterance(text: "A digital asset ecosystem needs a medium of exchange to facilitate transactions – three popular candidates are cryptocurrencies, stablecoins, and central bank digital currencies (CBDCs).  How does MAS view each of them?"),
  ////      Utterance(text: "MAS regards cryptocurrencies as unsuitable for use as money and as highly hazardous for retail investors."),
  ////      Utterance(text: " Cryptocurrencies lack the three fundamental qualities of money: medium of exchange, store of value, and unit of account.  As I mentioned earlier, cryptocurrencies serve a useful function within a blockchain network – to reward the participants who help to validate and maintain the record of transactions on the distributed ledger. But outside a blockchain network, cryptocurrencies serve no useful function except as a vehicle for speculation. Since 2017, MAS has been issuing warnings about the substantial risks of investing in cryptocurrencies. "),
  ////      Utterance(text: "MAS sees good potential in stablecoins provided they are securely backed by high quality reserves and well regulated."),
  ////      Utterance(text: " Stablecoins are tokens whose value is tied to another asset, usually fiat currencies such as the US dollar.  They seek to combine the credibility that comes from their supposed stability, with the benefits of tokenisation, that allow them to be used as payment instruments on distributed ledgers. Stablecoins are beginning to find acceptance outside of the crypto ecosystem.  Some firms like Mastercard have integrated popular stablecoins into their payment services.  This can be a positive development if stablecoins can make payments cheaper, faster, and safer. But to reap the benefits of stablecoins, regulators must ensure that they are indeed stable.  I will talk more about this later. "),
  ////      Utterance(text: "MAS sees good potential for wholesale CBDCs, especially for cross-border payments and settlements."),
  ////      Utterance(text: " CBDCs are the direct liability of, and payment instrument, of a central bank. This means that holders of CBDCs will have a direct claim on the central bank that has issued them, similar to how physical currency works today. Wholesale CBDCs are restricted to use by financial institutions. They are akin to the balances which commercial banks place with a central bank today.  Wholesale CBDCs on a distributed ledger have the potential to achieve atomic settlement, or the exchange of two linked assets in real-time.  They have the potential to radically transform cross-border payments, which today are slow, expensive, and opaque. "),
  ////      Utterance(text: "MAS does not see a compelling case for retail CBDCs in Singapore."),
  ////      Utterance(text: " Retail CBDCs are issued to the general public.  They are like the cash we carry with us, except in digital form. The case for a retail CBDC in Singapore is not compelling for now, given well-functioning payment systems and broad financial inclusion.   Retail electronic payment systems are fast, efficient, and at zero cost, while a residual amount of cash remains in circulation and is unlikely to disappear.  Nevertheless, MAS is building the technology infrastructure that would permit issuance of retail CBDCs should conditions change. "),
  ////      Utterance(text: "MAS has been actively experimenting with digital currency connectivity since 2016. "),
  ////      Utterance(text: " On the international front, MAS is participating in Project Dunbar, which the Bank for International Settlements Innovation Hub is working on in its Singapore Centre. The project is exploring a common multi-CBDC platform to enable cheaper, faster and safer cross-border payments.    Domestically, MAS is working with the industry on Project Orchid to develop the infrastructure and technical competencies necessary to issue a digital Singapore dollar should there be a need to do so in future. "),
  ////      Utterance(text: "ANCHOR PLAYERS WITH STRONG VALUE PROPOSITIONS AND RISK MANAGEMENT"),
  ////      Utterance(text: "MAS seeks to anchor in Singapore crypto players who can value add to our digital asset ecosystem and have strong risk management capabilities."),
  ////      Utterance(text: "A vibrant digital asset ecosystem will encompass a wide range of value-adding activities.  Let me cite three examples. "),
  ////      Utterance(text: " JP Morgan has established its digital asset capabilities in Singapore via its Onyx division, which has pioneered several DLT-based products and initiatives.  Offerings include round-the-clock real-time fund transfers with shorter settlement times and no intermediaries. Contour, a global trade finance network of banks, corporates and trade partners, has established its Future of Finance Lab in Singapore.  It will conduct research to develop novel, digitally native trade finance solutions. Nansen is a Singapore-based company that analyses more than 100 million blockchain wallet addresses across the world.  It provides insights on blockchain network activities and visibility on transacting parties, thereby helping to improve transparency in the digital asset ecosystem globally. "),
  ////      Utterance(text: "Digital asset activities involving payment services must be licensed under the Payment Services Act.  We recognise there is some frustration about MAS’ licensing process. "),
  ////      Utterance(text: " Some industry players have described it as “a slow and tedious ordeal”; others as a “bugbear for the fast-moving space”. "),
  ////      Utterance(text: "Given how new the digital asset industry is, it has not been easy for industry players or for MAS."),
  ////      Utterance(text: " On MAS’ side, we closely scrutinise licence applicants’ business models and technologies, so that we can better understand the risks. On the part of applicants, many are not familiar with managing the risks of facilitating illicit finance.   MAS engages the applicants closely to assess their understanding of our rules and their ability to meet our standards.  This takes a considerable amount of time – but it is necessary. "),
  ////      Utterance(text: "MAS cannot compromise its due diligence process just to make it easy for digital asset players to get a licence.  "),
  ////      Utterance(text: " Given the large number of applicants for licences, we have been prioritising those who demonstrate strong risk management capabilities and the ability to contribute to the growth of Singapore’s FinTech and digital asset ecosystem.   "),
  ////      Utterance(text: "SINGAPORE’S REGULATORY APPROACH TO MANAGE DIGITAL ASSET RISKS"),
  ////      Utterance(text: "Like all innovations, digital asset activities pose risks as well as benefits.  "),
  ////      Utterance(text: " When digital asset activities took off more than five years ago, regulators around the world, including MAS, assessed money laundering and terrorist financing risks as the key areas of concern. "),
  ////      Utterance(text: "With the rapid growth in scale and complexity of digital asset activities, other risks have surfaced. "),
  ////      Utterance(text: " Regulators around the world including MAS are therefore stepping up their responses to these new risks.  "),
  ////      Utterance(text: "There are five areas of risk in digital assets that MAS’ regulatory approach is focused on."),
  ////      Utterance(text: " first, combat money laundering and terrorist financing risks; second, manage technology and cyber related risks; third, safeguard against harm to retail investors; fourth, uphold the promise of stability in stablecoins; and fifth, mitigate potential financial stability risks "),
  ////      Utterance(text: "COMBAT MONEY LAUNDERING AND TERRORIST FINANCING RISKS"),
  ////      Utterance(text: "The key risk that MAS regulation currently addresses is money laundering and terrorist financing. "),
  ////      Utterance(text: " As users of cryptocurrencies operate through wallet addresses and pseudonyms, cryptocurrencies have made it easier to conduct illicit transactions.  The online nature of transactions adds to the risk. In 2020, MAS imposed on providers of digital asset services the same anti-money laundering requirements that apply to other financial institutions. Earlier this year, these rules were expanded to Singapore-incorporated entities providing digital asset services overseas. Singapore’s requirements are consistent with international standards, namely those of the Financial Action Task Force (FATF). "),
  ////      Utterance(text: "MANAGE TECHNOLOGY AND CYBER RISKS"),
  ////      Utterance(text: "Another risk that MAS has sought to address early on is technology and cyber related risk."),
  ////      Utterance(text: " MAS is one of the earliest regulators to impose on digital asset players the same cyber hygiene standards and technology risk management principles that is expected of other financial institutions. But technology and cyber risks are continually evolving, for example, coding bugs in smart contracts and compromise of digital token wallets or their encryption keys. MAS is reviewing measures to manage these and other technology and cyber risks, including further requirements to protect customers’ digital assets and uplift system availability. These steps are in line with what other jurisdictions are considering, including in the EU and Japan. "),
  ////      Utterance(text: "SAFEGUARD AGAINST HARM TO RETAIL INVESTORS"),
  ////      Utterance(text: "MAS has since 2017 been reiterating the risks of trading in cryptocurrencies. "),
  ////      Utterance(text: " Prices of cryptocurrencies are highly volatile, driven largely by speculation rather than any underlying economic fundamentals. It is very risky for the public to put their monies in such cryptocurrencies, as the perceived valuation of these cryptocurrencies could plummet rapidly when sentiments shift.  We have seen this happen repeatedly.  MAS has issued numerous advisories warning consumers that they could potentially lose all the monies they put into cryptocurrencies. Just take for example Luna, the sister token of the so-called stablecoin TerraUSD.  Luna was, at one point, worth over US$100 but tumbled to zero. "),
  ////      Utterance(text: "MAS has taken early decisive steps to mitigate consumer harm."),
  ////      Utterance(text: " Since January this year, MAS has restricted digital asset players from promoting cryptocurrency services at public spaces.  This has led to the dismantling of Bitcoin ATMs and the removal of advertisements in MRT stations. "),
  ////      Utterance(text: "But despite these warnings and measures, surveys show that consumers are increasingly trading in cryptocurrencies."),
  ////      Utterance(text: " This appears to be a global phenomenon, not just in Singapore.  Many consumers are still enticed by the prospect of sharp price increases in cryptocurrencies. They seem to be irrationally oblivious about the risks of cryptocurrency trading.  Consumer-related risks have gained the attention of regulators around the world.  "),
  ////      Utterance(text: "MAS is therefore considering further measures to reduce consumer harm.  "),
  ////      Utterance(text: " Adding frictions on retail access to cryptocurrencies is an area we are contemplating.  These may include customer suitability tests and restricting the use of leverage and credit facilities for cryptocurrency trading. But banning retail access to cryptocurrencies is not likely to work.  The cryptocurrency world is borderless. With just a mobile phone, Singaporeans have access to any number of crypto exchanges in the world and can buy or sell any number of cryptocurrencies. "),
  ////      Utterance(text: "The cryptocurrency market is also fraught with risks of market manipulation. "),
  ////      Utterance(text: " These risks include cornering and wash trades – actions that mislead and deceive market participants about prices or trading volumes. They compound the inherent volatility and speculative nature of cryptocurrencies and can severely harm consumers. There is greater impetus now among global regulators to enhance regulations in this space.  MAS will also do so. "),
  ////      Utterance(text: "Safeguarding consumers from harm requires a multi-pronged approach, not just MAS regulation."),
  ////      Utterance(text: " First, global cooperation is vital to minimise regulatory arbitrage.  Cryptocurrency transactions can be conducted from anywhere around the world.  MAS is actively involved in international regulatory reviews to enhance market integrity and customer protection in the digital asset space.  Second, the industry has an important role in co-creating sensible measures to protect consumer interests.  MAS has been sharing its concerns with the industry and inviting views on possible measures to minimise harm to consumers.  We will publicly consult on the proposals by October this year. Third, consumers must take responsibility and exercise judgement and caution.  No amount of MAS regulation, global co-operation, or industry safeguards will protect consumers from losses if their cryptocurrency holdings lose value.  "),
  ////      Utterance(text: "UPHOLD THE PROMISE OF STABILITY IN STABLECOINS"),
  ////      Utterance(text: "Stablecoins can realise their potential only if there is confidence in their ability to maintain a stable value. "),
  ////      Utterance(text: " Many stablecoins lack the ability to uphold the promise of stability in their value.  Some of the assets backing these stablecoins – such as commercial papers – are exposed to credit, market, and liquidity risks  There are currently no international standards on the quality of reserve assets backing stablecoins.   Globally, regulators are looking to impose requirements such as secure reserve backing and timely redemption at par. MAS will propose for consultation a regulatory approach for stablecoins, also by October. "),
  ////      Utterance(text: "MITIGATE POTENTIAL FINANCIAL STABILITY RISKS"),
  ////      Utterance(text: "Financial stability risks from digital asset activities are currently low but bear close monitoring."),
  ////      Utterance(text: " As the digital asset ecosystem grows, it will be natural for linkages between the traditional banking system and digital assets to grow.  There is risk of contagion to financial markets through exposures of financial institutions to digital assets. MAS is working closely with other regulators to design a prudential framework for banks’ exposures to digital assets.  This framework will provide banks with clarity on how to measure the risks of their digital asset exposures, and maintain adequate capital to address these risks.  This will reduce risks of spillovers into the traditional banking system.  "),
  ////      Utterance(text: "INNOVATION AND REGULATION HAND-IN-HAND "),
  ////      Utterance(text: "Singapore wants to be a hub for innovative and responsible digital asset activities that enhance efficiency and create economic value.  The development strategy and regulatory approach for digital assets that I have described go hand-in-hand towards achieving this.  "),
  ////      Utterance(text: "Innovation and regulation are not incapable of co-existing. We do not split the difference by being less stringent in our regulation or being less facilitative of innovation.  "),
  ////      Utterance(text: " MAS’ development strategy makes Singapore one of the most conducive and facilitative jurisdictions for digital assets.   At the same time, MAS’ evolving regulatory approach makes Singapore one of the most comprehensive in managing the risks of digital assets, and among the strictest in areas like discouraging retail investments in cryptocurrencies. "),
  ////      Utterance(text: "I hope this presentation has made clear that MAS’ facilitative posture on digital asset activities and restrictive stance on cryptocurrency speculation are not contradictory.  It is in fact a synergistic and holistic approach to develop Singapore as an innovative and responsible global digital asset hub. ")
//    ]
//    // (pageId: item!.unwrappedID, wordCount: 10, utterances: utterances, )
//
//    let result = SpeechDocument(averageWPM: 150.0, wordCount: 100, language: "en-US", defaultVoice: currentVoice, utterances: utterances)
//    return result
//  }
}
