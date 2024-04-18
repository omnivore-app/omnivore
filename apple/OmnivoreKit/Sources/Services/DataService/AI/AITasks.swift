import CoreData
import Foundation
import Models
import Utils

struct AITaskRequest: Decodable {
  public let requestId: String
}

public struct DigestResult: Decodable {
  public let id: String
  public let title: String
  public let content: String
  public let urlsToAudio: [String]
  public let speechFile: SpeechDocument

  public let jobState: String
}

public struct DigestItem: Decodable {
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

extension DataService {
//  public func createAITask(extraText: String?, libraryItemId: String, promptName: String) async throws -> String? {
//    let jsonData = try JSONSerialization.data(withJSONObject: [
//      "libraryItemId": libraryItemId,
//      "promptName": promptName,
//      "extraText": extraText
//    ])
//
//    let urlRequest = URLRequest.create(
//      baseURL: appEnvironment.serverBaseURL,
//      urlPath: "/api/ai-task",
//      requestMethod: .post(params: jsonData),
//      includeAuthToken: true
//    )
//    let resource = ServerResource<AITaskRequest>(
//      urlRequest: urlRequest,
//      decode: AITaskRequest.decode
//    )
//
//    do {
//      let taskRequest = try await networker.urlSession.performRequest(resource: resource)
//      return taskRequest.requestId
//    } catch {
//      return nil
//    }
//  }

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
              print("GOT RESPONSE: ", digest)
              return digest
            } catch {
              print("ERROR FETCHING TASK: ", error)
//              if let response = error as? ServerError {
//                if response != .stillProcessing {
//                  return nil
//                }
//              }
            }
              // Wait for some time before polling again
              try? await Task.sleep(nanoseconds: 3_000_000_000)
          } catch let error {
              throw error
          }
      }
  }
}


