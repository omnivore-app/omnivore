import BackgroundTasks
import Foundation
import Models
import OSLog
import Services
import Utils

@MainActor
public final class Services {
  static let fetchTaskID = "app.omnivore.fetchLinkedItems"
  static let secondsToWaitBeforeNextBackgroundRefresh: TimeInterval = isDebug ? 0 : 3600 // 1 hour
  static let logger = Logger(subsystem: "app.omnivore", category: "services-class")

  public let authenticator: Authenticator
  public let dataService: DataService
  public let audioController: AudioController

  public init(appEnvironment: AppEnvironment = PublicValet.storedAppEnvironment ?? .initialAppEnvironment) {
    let networker = Networker(appEnvironment: appEnvironment)
    self.authenticator = Authenticator(networker: networker)
    self.dataService = DataService(appEnvironment: appEnvironment, networker: networker)
    #if os(iOS)
      self.audioController = AudioController(dataService: dataService)
    #else
      self.audioController = AudioController()
    #endif
  }
}

#if os(iOS)
  // Background fetching functions
  extension Services {
    public static func registerBackgroundFetch() {
      BGTaskScheduler.shared.register(forTaskWithIdentifier: fetchTaskID, using: nil) { task in
        if let task = task as? BGAppRefreshTask {
          EventTracker.trackForDebugging("executing app.omnivore.fetchLinkedItems bg task")
          logger.debug("in background task register closure")
          performBackgroundFetch(task: task)
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

    static func performBackgroundFetch(task: BGAppRefreshTask) {
      let startTime = Date()
      Services.logger.debug("starting background fetch")
      scheduleBackgroundFetch()
      let services = Services()

      task.expirationHandler = {
        EventTracker.track(
          .backgroundFetch(
            jobStatus: .timeExpired,
            itemCount: 0,
            secondsElapsed: Int(startTime.timeIntervalSinceNow)
          )
        )
        logger.debug("handling background fetch expiration")
      }

      guard services.authenticator.hasValidAuthToken else {
        EventTracker.track(
          .backgroundFetch(
            jobStatus: .authFailure,
            itemCount: 0,
            secondsElapsed: Int(startTime.timeIntervalSinceNow)
          )
        )
        task.setTaskCompleted(success: false)
        return
      }

      Task {
        do {
          let fetchedItemCount = try await services.dataService.fetchLinkedItemsBackgroundTask()
          BadgeCountHandler.updateBadgeCount(dataService: services.dataService)
          task.setTaskCompleted(success: true)
        } catch {
          EventTracker.track(
            .backgroundFetch(
              jobStatus: .failed,
              itemCount: 0,
              secondsElapsed: Int(startTime.timeIntervalSinceNow)
            )
          )
          task.setTaskCompleted(success: false)
        }
      }
    }
  }
#endif

// Command to simulate BG Task
// swiftlint:disable:next line_length
// e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"app.omnivore.fetchLinkedItems"]
