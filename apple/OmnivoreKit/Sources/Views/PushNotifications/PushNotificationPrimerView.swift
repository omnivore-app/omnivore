import SwiftUI

#if os(iOS)

  public struct PushNotificationPrimer: View {
    let acceptAction: () -> Void
    let denyAction: () -> Void

    public init(
      acceptAction: @escaping () -> Void,
      denyAction: @escaping () -> Void
    ) {
      self.acceptAction = acceptAction
      self.denyAction = denyAction
    }

    public var body: some View {
      VStack(alignment: .leading, spacing: 10) {
        HStack {
          Image
            .smallOmnivoreLogo
            .resizable()
            .frame(width: 30, height: 30)
          Text("Enable Push Notifications?")
            .font(.appHeadline)
        }

        // swiftlint:disable:next line_length
        Text("Get notified when newsletter links reach your inbox. Or receive reminders that you set from our share extension.")
          .font(.appBody)
          .multilineTextAlignment(.leading)
          .lineLimit(nil)
          .fixedSize(horizontal: false, vertical: true)
          .padding(.bottom, 16)

        HStack {
          Spacer()
          Button(action: denyAction, label: { Text("No Thanks") })
          Button(action: acceptAction, label: { Text("Yes Please") })
        }
        .buttonStyle(BorderedButtonStyle(color: .appTextDefault))
      }
      .padding()
      .background(Color.appBackground)
      .foregroundColor(Color.appTextDefault)
      .cornerRadius(8)
      .frame(maxWidth: min(UIScreen.main.bounds.width - 20, 320))
      .interactiveDismissDisabled()
    }
  }

  #if DEBUG
    struct PushNotificationPrimerPreview: PreviewProvider {
      public struct ContainerView: View {
        @State var showModal = false

        public var body: some View {
          Button("Show Primer") {
            showModal = true
          }
          .popover(isPresented: $showModal) {
            PushNotificationPrimer(acceptAction: {}, denyAction: {})
          }
        }
      }

      static var previews: some View {
        registerFonts()
        return ContainerView()
      }
    }
  #endif

#endif
