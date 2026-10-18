import CoreData
import Foundation
import Models
import Utils

struct AITaskRequest: Decodable {
  public let requestId: String
}

public struct DigestResult: Codable {
  public let id: String
  public let title: String?
  public let byline: String?
  public let content: String?
  public let description: String?
  public let urlsToAudio: [String]?
  public let chapters: [DigestChapter]?
  public let speechFiles: [SpeechDocument]?

  public let jobState: String?
  public let createdAt: String?
}

public struct DigestChapter: Codable {
  public let title: String
  public let id: String
  public let url: String
  public let wordCount: Double
  public let author: String?
  public let thumbnail: String?
  public init(title: String, id: String, url: String, wordCount: Double, author: String?, thumbnail: String?) {
    self.title = title
    self.id = id
    self.url = url
    self.author = author
    self.wordCount = wordCount
    self.thumbnail = thumbnail
  }
}

public struct DigestChapterData {
  public let time: String
  public let start: Int
  public let end: Int

  public init(time: String, start: Int, end: Int) {
    self.time = time
    self.start = start
    self.end = end
  }
}

public struct RefreshDigestResult: Codable {
  public let jobId: String
}

public struct DigestItem: Codable {
  public let id: String
  public let site: String
  public let siteIcon: URL?
  public let author: String
  public let title: String
  public let summaryText: String
  public let keyPointsText: String
  public let highlightsText: String
  public init(id: String, site: String, siteIcon: URL?,
              author: String, title: String, summaryText: String,
              keyPointsText: String, highlightsText: String) {
    self.id = id
    self.site = site
    self.siteIcon = siteIcon
    self.author = author
    self.title = title
    self.summaryText = summaryText
    self.keyPointsText = keyPointsText
    self.highlightsText = highlightsText
  }
}

public struct DigestRequest: Codable {
  public let schedule: String
  public let voices: [String]
  public init(schedule: String, voices: [String]) {
    self.schedule = schedule
    self.voices = voices
  }
}

public struct ExplainRequest: Codable {
  public let text: String
  public let libraryItemId: String
  public init(text: String, libraryItemId: String) {
    self.text = text
    self.libraryItemId = libraryItemId
  }
}

public struct ExplainResult: Codable {
  public let text: String
}

extension DataService {
  public func digestNeedsRefresh() -> Bool {
    let fileManager = FileManager.default
    let localURL = URL.om_cachesDirectory.appendingPathComponent("digest.json")
    do {
      let attributes = try fileManager.attributesOfItem(atPath: localURL.path)
      if let modificationDate = attributes[.modificationDate] as? Date {
        // Two hours ago
        let twoHoursAgo = Date().addingTimeInterval(-2 * 60 * 60)
        return modificationDate < twoHoursAgo
      }
    } catch {
        print("Error: \(error)")
    }
    return true
  }
  public func refreshDigest() async throws {
    let encoder = JSONEncoder()
    let digestRequest = DigestRequest(schedule: "daily", voices: ["openai-nova"])
    let data = (try? encoder.encode(digestRequest)) ?? Data()

    let urlRequest = URLRequest.create(
      baseURL: appEnvironment.serverBaseURL,
      urlPath: "/api/digest/v1/",
      requestMethod: .post(params: data),
      includeAuthToken: true
    )

    let resource = ServerResource<DigestResult>(
      urlRequest: urlRequest,
      decode: RefreshDigestResult.decode
    )

    do {
      let digest = try await networker.urlSession.performRequest(resource: resource)
      print("GOT RESPONSE: ", digest)
    } catch {
      print("ERROR FETCHING TASK: ", error)
    }
  }

  // Function to poll the status of the AI task with timeout
  public func getLatestDigest(timeoutInterval: TimeInterval) async throws -> DigestResult? {
    var count = 0
      let startTime = Date()
      while true {
        count += 1
        if count > 3 {
          return nil
        }
        do {
          // Check if timeout has occurred
          if -startTime.timeIntervalSinceNow >= timeoutInterval {
              throw NSError(domain: "Timeout Error", code: -1, userInfo: nil)
          }

          let urlRequest = URLRequest.create(
            baseURL: appEnvironment.serverBaseURL,
            urlPath: "/api/digest/v1/",
            requestMethod: .get,
            includeAuthToken: true
          )

          let resource = ServerResource<DigestResult>(
            urlRequest: urlRequest,
            decode: DigestResult.decode
          )

          do {
            let digest = try await networker.urlSession.performRequest(resource: resource)

            if digest.jobState == "SUCCEEDED" {
              saveDigest(digest)
            }

            return digest
          } catch {
            print("ERROR FETCHING TASK: ", error)
          }
          // Wait for some time before polling again
          try? await Task.sleep(nanoseconds: 3_000_000_000)
        } catch let error {
            throw error
        }
      }
  }

  public func loadStoredDigest() -> DigestResult? {
    let decoder = JSONDecoder()
    let localPath = URL.om_cachesDirectory.appendingPathComponent("digest.json")
    if let data = try? Data(contentsOf: localPath),
       let digest = try? decoder.decode(DigestResult.self, from: data) {
      return digest
    }
    return nil
  }

  func saveDigest(_ digest: DigestResult) {
    let localPath = URL.om_cachesDirectory.appendingPathComponent("digest.json")
    if let data = try? JSONEncoder().encode(digest) {
      try? data.write(to: localPath)
    }
  }

  public func explain(text: String, libraryItemId: String) async throws -> String {
    let encoder = JSONEncoder()
    let explainRequest = ExplainRequest(text: text, libraryItemId: libraryItemId)
    let data = (try? encoder.encode(explainRequest)) ?? Data()

    do {
      let urlRequest = URLRequest.create(
        baseURL: appEnvironment.serverBaseURL,
        urlPath: "/api/explain/",
        requestMethod: .post(params: data),
        includeAuthToken: true
      )

      let resource = ServerResource<ExplainResult>(
        urlRequest: urlRequest,
        decode: ExplainResult.decode
      )

      let response = try await networker.urlSession.performRequest(resource: resource)
      return response.text
    } catch let error {
        throw error
    }
  }
}
