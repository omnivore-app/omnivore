import Combine
import Models
import SwiftUI

public final class DebugMenuViewModel {
  public enum Action {
    case applyChanges(environment: DebugMenuEnvOption)
  }

  let initialEnvironment: AppEnvironment
  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init(initialEnvironment: AppEnvironment) {
    self.initialEnvironment = initialEnvironment
  }

  var initialDebugMenuEnvOption: DebugMenuEnvOption {
    DebugMenuEnvOption.make(from: initialEnvironment)
  }
}

public enum DebugMenuEnvOption: String, CaseIterable {
  case dev = "Dev"
  case prod = "Prod"
  case demo = "Demo"
  case local = "Local"

  static func make(from appEnvironment: AppEnvironment) -> DebugMenuEnvOption {
    switch appEnvironment {
    case .local:
      return .local
    case .dev:
      return .dev
    case .prod:
      return .prod
    case .demo:
      return .demo
    case .test:
      return .local
    }
  }
}

public struct DebugMenuView: View {
  @State private var selectedEnvironment: DebugMenuEnvOption

  private var viewModel: DebugMenuViewModel

  public init(viewModel: DebugMenuViewModel) {
    self.viewModel = viewModel
    self._selectedEnvironment = State(initialValue: viewModel.initialDebugMenuEnvOption)
  }

  public var body: some View {
    VStack {
      Text("Debug Menu")
        .font(.appTitle)
      Form {
        Text("API Environment:")
        Picker(selection: $selectedEnvironment, label: Text("API Environment:")) {
          ForEach(DebugMenuEnvOption.allCases, id: \.self) {
            Text($0.rawValue)
          }
        }
        .pickerStyle(SegmentedPickerStyle())
      }

      Button(
        action: { viewModel.performActionSubject.send(.applyChanges(environment: selectedEnvironment)) },
        label: { Text("Apply Changes") }
      )
      .buttonStyle(SolidCapsuleButtonStyle(width: 220))
    }
    .padding()
  }
}
