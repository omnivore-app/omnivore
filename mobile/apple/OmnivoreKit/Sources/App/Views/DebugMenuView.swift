import Models
import Services
import SwiftUI
import Views

struct DebugMenuView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @Binding var selectedEnvironment: AppEnvironment

  let appEnvironments: [AppEnvironment] = [.local, .demo, .prod]

  var body: some View {
    VStack {
      Text(LocalText.menuDebugTitle)
        .font(.appTitle)
      Form {
        Text(LocalText.menuDebugApiEnv)
        Picker(selection: $selectedEnvironment, label: Text(LocalText.menuDebugApiEnv)) {
          ForEach(appEnvironments, id: \.self) {
            Text($0.rawValue)
          }
        }
        .pickerStyle(SegmentedPickerStyle())
      }

      Button(
        action: {
          authenticator.logout(dataService: dataService)
          dataService.switchAppEnvironment(appEnvironment: selectedEnvironment)
        },
        label: { Text(LocalText.genericChangeApply) }
      )
      .buttonStyle(SolidCapsuleButtonStyle(width: 220))
    }
    .padding()
  }
}
