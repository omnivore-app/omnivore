import BackgroundTasks
import Foundation
import Models
import OSLog
import Services
import Utils

public final class Services {
  static let fetchTaskID = "app.omnivore.fetchLinkedItems"
  static let secondsToWaitBeforeNextBackgroundRefresh: TimeInterval = isDebug ? 0 : 3600 // 1 hour
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
        EventTracker.trackForDebugging("executing app.omnivore.fetchLinkedItems bg task")
        logger.debug("in background task register closure")
        startBackgroundFetch(task: task)
      }
    }
  }

  static func scheduleBackgroundFetch() {
    BGTaskScheduler.shared.cancelAllTaskRequests()
    let taskRequest = BGAppRefreshTaskRequest(identifier: fetchTaskID)
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
      EventTracker.trackForDebugging("background fetch expiration handler called")
      logger.debug("handling background fetch expiration")
    }

    services.peformBackgroundFetch()
    EventTracker.trackForDebugging("background fetch task completed successfully")
    task.setTaskCompleted(success: true)
  }

  func peformBackgroundFetch() {
    Services.logger.debug("starting background fetch")

    guard authenticator.hasValidAuthToken else {
      EventTracker.trackForDebugging("background fetch failed: user does not habe a valid auth token")
      Services.logger.debug("background fetch failed: user does not habe a valid auth token")
      return
    }

    Services.logger.debug("ayo this is a background task!")
    // TODO: perform tasks using data service
  }
}

// e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"app.omnivore.fetchLinkedItems"]
