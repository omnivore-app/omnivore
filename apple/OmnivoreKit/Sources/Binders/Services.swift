import Foundation
import Models
import Services

public final class Services {
  public let authenticator: Authenticator
  public let dataService: DataService

  public init(appEnvironment: AppEnvironment = PublicValet.storedAppEnvironment ?? .initialAppEnvironment) {
    let networker = Networker(appEnvironment: appEnvironment)
    self.authenticator = Authenticator(networker: networker)
    self.dataService = DataService(appEnvironment: appEnvironment, networker: networker)
  }

  public func switchAppEnvironment(to appEnvironment: AppEnvironment) {
    authenticator.logout()
    dataService.switchAppEnvironment(appEnvironment: appEnvironment)
  }
}
