import Models
import SwiftUI
import Views

struct DebugMenuView: View {
  @State private var selectedEnvironment: AppEnvironment

  let appEnvironments: [AppEnvironment] = [.local, .demo, .dev, .prod]
  let services: Services

  init(services: Services) {
    self._selectedEnvironment = State(initialValue: services.dataService.appEnvironment)
    self.services = services
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
        action: { services.switchAppEnvironment(to: selectedEnvironment) },
        label: { Text("Apply Changes") }
      )
      .buttonStyle(SolidCapsuleButtonStyle(width: 220))
    }
    .padding()
  }
}
