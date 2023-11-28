import Network
import SwiftUI

public enum NetworkStatus: String {
  case connected
  case disconnected
}

@MainActor
public class NetworkMonitor: ObservableObject {
  private let monitor = NWPathMonitor()
  private let queue = DispatchQueue(label: "Monitor")

  @Published public var status: NetworkStatus = .connected

  public init() {
    monitor.pathUpdateHandler = { [weak self] path in
      guard let self = self else { return }

      DispatchQueue.main.async {
        if path.status == .satisfied {
          self.status = .connected

        } else {
          self.status = .disconnected
        }
      }
    }
    monitor.start(queue: queue)
  }
}
