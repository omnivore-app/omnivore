import Models
import Services
import SwiftUI
import Views

struct DebugMenuView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @State private var selectedEnvironment: AppEnvironment

  let appEnvironments: [AppEnvironment] = [.local, .demo, .dev, .prod]

  init(initialEnvironment: AppEnvironment) {
    self._selectedEnvironment = State(initialValue: initialEnvironment)
  }

  var body: some View {
    VStack {
      Text("Debug Menu")
        .font(.appTitle)
      Form {
        Text("API Environment:")
        Picker(selection: $selectedEnvironment, label: Text("API Environment:")) {
          ForEach(appEnvironments, id: \.self) {
            Text($0.rawValue)
          }
        }
        .pickerStyle(SegmentedPickerStyle())
      }

      Button(
        action: {
          authenticator.logout()
          dataService.switchAppEnvironment(appEnvironment: selectedEnvironment)
        },
        label: { Text("Apply Changes") }
      )
      .buttonStyle(SolidCapsuleButtonStyle(width: 220))
    }
    .padding()
  }
}
