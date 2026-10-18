import Foundation

public struct AppKeys: Decodable {
  public let pspdfKitKey: String?
  public let intercom: IntercomKeys?
  public let firebaseDemoKeys: FirebaseKeys?
  public let firebaseProdKeys: FirebaseKeys?
  public let iosClientGoogleId: String?
  public let posthogClientKey: String?
  public let posthogInstanceAddress: String?
  public static let sharedInstance = AppKeys.make()

  private init() {
    self.pspdfKitKey = nil
    self.intercom = nil
    self.firebaseDemoKeys = nil
    self.firebaseProdKeys = nil
    self.iosClientGoogleId = nil
    self.posthogClientKey = nil
    self.posthogInstanceAddress = nil
  }
}

public struct IntercomKeys: Decodable {
  public let apiKey: String
  public let appID: String
}

public struct FirebaseKeys: Decodable {
  public let googleAppID: String
  public let gcmSenderID: String
  public let apiKey: String
  public let clientID: String
  public let storageBucket: String
  public let projectID: String
  public let bundleID: String
}

private extension AppKeys {
  static func make() -> AppKeys? {
    guard let jsonData = jsonFileData else { return AppKeys() }

    do {
      let decodedData = try JSONDecoder().decode(AppKeys.self, from: jsonData)
      return decodedData
    } catch {
      return AppKeys()
    }
  }

  static var jsonFileData: Data? {
    guard let fileURL = Bundle.module.url(forResource: "Keys", withExtension: "json") else {
      return nil
    }

    do {
      let data = try Data(contentsOf: fileURL)
      return data
    } catch {
      return nil
    }
  }
}
