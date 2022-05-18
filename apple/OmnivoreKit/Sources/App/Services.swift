import BackgroundTasks
import Foundation
import Models
import OSLog
import Services

public final class Services {
  static let fetchTaskID = "app.omnivore.fetchLinkedItems"
  static let secondsToWaitBeforeNextBackgroundRefresh: TimeInterval = 3 // 1 hour
  static let logger = Logger(subsystem: "app.omnivore", category: "services-class")

  public let authenticator: Authenticator
  public let dataService: DataService

  public init(appEnvironment: AppEnvironment = PublicValet.storedAppEnvironment ?? .initialAppEnvironment) {
    let networker = Networker(appEnvironment: appEnvironment)
    self.authenticator = Authenticator(networker: networker)
    self.dataService = DataService(appEnvironment: appEnvironment, networker: networker)
  }
}

// Background fetching functions
extension Services {
  public static func registerBackgroundFetch() {
    BGTaskScheduler.shared.register(forTaskWithIdentifier: fetchTaskID, using: nil) { task in
      if let task = task as? BGAppRefreshTask {
        startBackgroundFetch(task: task)
      }
    }
  }

  static func scheduleBackgroundFetch() {
    let taskRequest = BGProcessingTaskRequest(identifier: fetchTaskID)
    taskRequest.requiresNetworkConnectivity = true
    taskRequest.earliestBeginDate = Date(timeIntervalSinceNow: secondsToWaitBeforeNextBackgroundRefresh)

    do {
      try BGTaskScheduler.shared.submit(taskRequest)
      logger.debug("\(fetchTaskID) task scheduled")
    } catch {
      logger.debug("task scheduling failed: \(fetchTaskID)")
    }
  }

  static func startBackgroundFetch(task: BGAppRefreshTask) {
    scheduleBackgroundFetch()
    let services = Services()

    task.expirationHandler = {
      logger.debug("handling background fetch expiration")
      // cancel tasks if still running
      // maybe save/cancel pending changes to coredata context?
    }

    services.peformBackgroundFetch()
  }
  
  func peformBackgroundFetch() {
    Services.logger.debug("starting background fetch")

    guard authenticator.hasValidAuthToken else {
      Services.logger.debug("background fetch failed: user does not habe a valid auth token")
      authenticator.logout()
      return
    }

    // TODO: perform tasks using data service
  }
}
