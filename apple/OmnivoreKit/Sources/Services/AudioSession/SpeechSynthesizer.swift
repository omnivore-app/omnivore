//
//  SpeechSynthesizer.swift
//
//
//  Created by Jackson Harper on 9/5/22.
//

import AVFoundation
import Foundation

import Models
import Utils

struct UtteranceRequest: Codable {
  let text: String
  let voice: String
  let language: String
  let rate: String
  let isUltraRealisticVoice: Bool
}

struct Utterance: Decodable {
  public let idx: String
  public let text: String
  public let voice: String?
  public let wordOffset: Double
  public let wordCount: Double

  func toSSML(document: SpeechDocument) throws -> Data? {
    let usedVoice = voice ?? document.defaultVoice
    let request = UtteranceRequest(text: text,
                                   voice: usedVoice,
                                   language: document.language,
                                   rate: "1.1",
                                   isUltraRealisticVoice: Voices.isUltraRealisticVoice(usedVoice))
    return try JSONEncoder().encode(request)
  }
}

struct SpeechDocument: Decodable {
  static let averageWPM: Double = 195

  public let pageId: String
  public let wordCount: Double
  public let language: String
  public let defaultVoice: String

  public let utterances: [Utterance]

  public func estimatedDuration(utterance: Utterance, speed: Double) -> Double {
    utterance.wordCount / SpeechDocument.averageWPM / speed * 60.0
  }

  var audioDirectory: URL {
    FileManager.default
      .urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("audio-\(pageId)")
  }
}

struct SpeechItem {
  let htmlIdx: String
  let audioIdx: Int
  let urlRequest: URLRequest
  let localAudioURL: URL
  let localSpeechURL: URL
  let text: String
}

struct SpeechMark: Decodable, Encodable {
  let word: String?
  let time: Double?
  let start: Int?
  let length: Int?
}

struct SpeechData {}

struct SpeechSynthesizer {
  typealias Element = SpeechItem
  let document: SpeechDocument
  let appEnvironment: AppEnvironment
  let networker: Networker
  let speechAuthHeader: String?

  init(appEnvironment: AppEnvironment, networker: Networker, document: SpeechDocument, speechAuthHeader: String?) {
    self.appEnvironment = appEnvironment
    self.networker = networker
    self.document = document
    self.speechAuthHeader = speechAuthHeader
  }

  func estimatedDurations(forSpeed speed: Double) -> [Double] {
    document.utterances.map { document.estimatedDuration(utterance: $0, speed: speed) }
  }

  func preload() async throws {
    if document.utterances.count > 0 {
      if let item = speechItemForIdx(idx: 0) {
        _ = try await Self.download(speechItem: item)
      }
    }
  }

  func speechItemForIdx(idx: Int) -> SpeechItem? {
    let utterance = document.utterances[idx]
    let voiceStr = utterance.voice ?? document.defaultVoice
    let segmentStr = String(format: "%04d", arguments: [idx])
    let localAudioURL = document.audioDirectory.appendingPathComponent("\(segmentStr)-\(voiceStr).mp3")
    let localSpeechURL = document.audioDirectory.appendingPathComponent("\(segmentStr)-\(voiceStr).speechMarks")

    if let request = urlRequestFor(utterance: utterance) {
      let item = SpeechItem(htmlIdx: utterance.idx,
                            audioIdx: idx,
                            urlRequest: request,
                            localAudioURL: localAudioURL,
                            localSpeechURL: localSpeechURL,
                            text: utterance.text)
      return item
    }

    return nil
  }

  func createPlayerItems(from: Int) -> [SpeechItem] {
    var result: [SpeechItem] = []

    for idx in from ..< document.utterances.count {
      let utterance = document.utterances[idx]
      let voiceStr = utterance.voice ?? document.defaultVoice
      let segmentStr = String(format: "%04d", arguments: [idx])
      let localAudioURL = document.audioDirectory.appendingPathComponent("\(segmentStr)-\(voiceStr).mp3")
      let localSpeechURL = document.audioDirectory.appendingPathComponent("\(segmentStr)-\(voiceStr).speechMarks")

      if let request = urlRequestFor(utterance: utterance) {
        let item = SpeechItem(htmlIdx: utterance.idx,
                              audioIdx: idx,
                              urlRequest: request,
                              localAudioURL: localAudioURL,
                              localSpeechURL: localSpeechURL,
                              text: utterance.text)
        result.append(item)
      } else {
        // TODO: How do we want to handle completely skipped paragraphs?
      }
    }

    return result
  }

  func urlRequestFor(utterance: Utterance) -> URLRequest? {
    var request = URLRequest(url: appEnvironment.ttsBaseURL)
    request.httpMethod = "POST"
    request.timeoutInterval = 600

    if let ssml = try? utterance.toSSML(document: document) {
      request.httpBody = ssml
    }

    for (header, value) in networker.defaultHeaders {
      request.setValue(value, forHTTPHeaderField: header)
    }

    if let speechAuthHeader = speechAuthHeader {
      request.setValue(speechAuthHeader, forHTTPHeaderField: "Authorization")
    }

    return request
  }

  static func downloadData(session: URLSession, request: URLRequest) async throws -> Data {
    do {
      let result: (Data, URLResponse)? = try await session.data(for: request)
      guard let httpResponse = result?.1 as? HTTPURLResponse, 200 ..< 300 ~= httpResponse.statusCode else {
        print("error: ", result?.1)
        throw BasicError.message(messageText: "audioFetch failed. no response or bad status code.")
      }

      guard let data = result?.0 else {
        throw BasicError.message(messageText: "audioFetch failed. no data received.")
      }

      return data
    } catch URLError.cancelled {
      print("cancled request error being ignored")
      return Data()
    } catch {
      print("ERROR DOWNLOADING AUDIO DATA", error)
      throw error
    }
  }

  static func download(speechItem: SpeechItem,
                       redownloadCached: Bool = false,
                       session: URLSession = URLSession.shared) async throws -> SynthesizeData?
  {
    let decoder = JSONDecoder()

    if !redownloadCached {
      if let localData = try? Data(contentsOf: speechItem.localAudioURL) {
        var speechMarks: [SpeechMark]?
        if let speechMarksData = try? Data(contentsOf: speechItem.localSpeechURL) {
          speechMarks = try? decoder.decode([SpeechMark].self, from: speechMarksData)
        }
        return SynthesizeData(audioData: localData, speechMarks: speechMarks)
      }
    }

    let data = try await downloadData(session: session, request: speechItem.urlRequest)

    let tempPath = FileManager.default
      .urls(for: .cachesDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(UUID().uuidString + ".mp3")

    let tempSMPath = FileManager.default
      .urls(for: .cachesDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(UUID().uuidString + ".speechMarks")

    do {
      let jsonData = try decoder.decode(SynthesizeResult.self, from: data) as SynthesizeResult
      let audioData = Data(fromHexEncodedString: jsonData.audioData)!
      if audioData.count < 1 {
        throw BasicError.message(messageText: "Audio data is empty")
      }

      try audioData.write(to: tempPath)
      try? FileManager.default.removeItem(at: speechItem.localAudioURL)
      try FileManager.default.moveItem(at: tempPath, to: speechItem.localAudioURL)

      let encoder = JSONEncoder()
      let speechMarksData = try encoder.encode(jsonData.speechMarks)
      try speechMarksData.write(to: tempSMPath)
      try? FileManager.default.removeItem(at: speechItem.localSpeechURL)
      try FileManager.default.moveItem(at: tempSMPath, to: speechItem.localSpeechURL)

      return SynthesizeData(audioData: audioData, speechMarks: jsonData.speechMarks)
    } catch {
      print("ERROR DOWNLOADING SPEECH DATA:", error)
      let errorMessage = "audioFetch failed. could not write MP3 data to disk"
      throw BasicError.message(messageText: errorMessage)
    }
  }
}

struct SynthesizeResult: Decodable {
  let audioData: String
  let speechMarks: [SpeechMark]?
}

struct SynthesizeData: Decodable {
  let audioData: Data
  let speechMarks: [SpeechMark]?
}

extension Data {
  init?(fromHexEncodedString string: String) {
    // Convert 0 ... 9, a ... f, A ...F to their decimal value,
    // return nil for all other input characters
    func decodeNibble(nibble: UInt8) -> UInt8? {
      switch nibble {
      case 0x30 ... 0x39:
        return nibble - 0x30
      case 0x41 ... 0x46:
        return nibble - 0x41 + 10
      case 0x61 ... 0x66:
        return nibble - 0x61 + 10
      default:
        return nil
      }
    }

    self.init(capacity: string.utf8.count / 2)

    var iter = string.utf8.makeIterator()
    while let char1 = iter.next() {
      guard
        let val1 = decodeNibble(nibble: char1),
        let char2 = iter.next(),
        let val2 = decodeNibble(nibble: char2)
      else { return nil }
      append(val1 << 4 + val2)
    }
  }
}
