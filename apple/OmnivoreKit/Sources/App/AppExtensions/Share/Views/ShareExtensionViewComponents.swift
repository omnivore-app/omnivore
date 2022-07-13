import SwiftUI
import Views

// TODO: maybe move this into Views package?
struct IconButtonView: View {
  let title: String
  let systemIconName: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      VStack(alignment: .center, spacing: 8) {
        Image(systemName: systemIconName)
          .font(.appTitle)
          .foregroundColor(.appYellow48)
        Text(title)
          .font(.appBody)
          .foregroundColor(.appGrayText)
      }
      .frame(
        maxWidth: .infinity,
        maxHeight: .infinity
      )
      .background(Color.appButtonBackground)
      .cornerRadius(8)
    }
    .frame(height: 100)
  }
}

struct CheckmarkButtonView: View {
  let titleText: String
  let isSelected: Bool
  let action: () -> Void

  var body: some View {
    Button(
      action: action,
      label: {
        HStack {
          Text(titleText)
          Spacer()
          if isSelected {
            Image(systemName: "checkmark")
              .foregroundColor(.appYellow48)
          }
        }
        .padding(.vertical, 8)
      }
    )
    .buttonStyle(RectButtonStyle())
  }
}
