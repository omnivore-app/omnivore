
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class PushNotificationDevicesViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var devices = [InternalDeviceToken]()

  func loadDevices(dataService: DataService) {
    isLoading = true
    Task {
      self.devices = (try? await dataService.devices()) ?? []
      isLoading = false
    }
  }

  func removeToken(dataService: DataService, tokenID: String) {
    if let idx = devices.firstIndex(where: { $0.id == tokenID }) {
      Task {
        try await dataService.syncDeviceToken(deviceTokenOperation: .deleteToken(tokenID: tokenID))
        devices.remove(at: idx)
      }
    }
  }
}

struct PushNotificationDevicesView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = PushNotificationDevicesViewModel()

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          innerBody
        }
      #elseif os(macOS)
        List {
          innerBody
        }
        .listStyle(InsetListStyle())
      #endif
    }
    .task { viewModel.loadDevices(dataService: dataService) }
  }

  func createdStr(_ device: InternalDeviceToken) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateStyle = .short
    dateFormatter.timeStyle = .short

    if let createdAt = device.createdAt {
      return dateFormatter.string(from: createdAt)
    }
    return ""
  }

  private var innerBody: some View {
    List {
      Section(header: Text("Registered device tokens (swipe to remove)")) {
        ForEach(viewModel.devices) { device in
          Text("Created: \(createdStr(device))")
            .swipeActions(edge: .trailing) {
              Button(
                role: .destructive,
                action: {
                  viewModel.removeToken(dataService: dataService, tokenID: device.id)
                },
                label: {
                  Image(systemName: "trash")
                }
              )
            }
        }
      }
    }
    .navigationTitle("Devices")
  }
}
