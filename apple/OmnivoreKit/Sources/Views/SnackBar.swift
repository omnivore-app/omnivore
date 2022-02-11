import SwiftUI

struct Snackbar: View {
  @Binding var isShowing: Bool
  private let presenting: AnyView
  private let text: Text
  private let actionText: Text?
  private let action: (() -> Void)?

  private var isBeingDismissedByAction: Bool {
    actionText != nil && action != nil
  }

  @Environment(\.colorScheme) private var colorScheme: ColorScheme

  init<Presenting>(isShowing: Binding<Bool>,
                   presenting: Presenting,
                   text: Text,
                   actionText: Text? = nil,
                   action: (() -> Void)? = nil) where Presenting: View
  {
    self._isShowing = isShowing
    self.presenting = AnyView(presenting)
    self.text = text
    self.actionText = actionText
    self.action = action
  }

  var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .center) {
        self.presenting
        VStack {
          Spacer()
          if self.isShowing {
            HStack {
              self.text
                .font(.appCallout)
                .foregroundColor(self.colorScheme == .light ? .appGrayText : .appTextDefault)
              Spacer()
              if self.actionText != nil, self.action != nil {
                self.actionText!
                  .bold()
                  .foregroundColor(self.colorScheme == .light ? .appGrayText : .appTextDefault)
                  .onTapGesture {
                    self.action?()
                    withAnimation {
                      self.isShowing = false
                    }
                  }
              }
            }
            .padding()
            .frame(width: min(380, geometry.size.width * 0.96), height: 44)
            .background(self.colorScheme == .light ? Color.black : Color.white)
            .cornerRadius(5)
            .offset(x: 0, y: -54)
            .shadow(color: .gray, radius: 2)
            .animation(Animation.spring())
            .onAppear {
              guard !self.isBeingDismissedByAction else { return }
              DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                withAnimation {
                  self.isShowing = false
                }
              }
            }
          }
        }
      }
    }
  }
}

public extension View {
  func snackBar(isShowing: Binding<Bool>,
                text: Text,
                actionText: Text? = nil,
                action: (() -> Void)? = nil) -> some View
  {
    Snackbar(isShowing: isShowing,
             presenting: self,
             text: text,
             actionText: actionText,
             action: action)
  }
}
