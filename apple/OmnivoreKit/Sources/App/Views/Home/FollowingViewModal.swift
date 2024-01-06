// swiftlint:disable line_length

import Foundation
import Models
import Services
import SwiftUI
import Views

public struct FollowingViewModal: View {
  @Environment(\.dismiss) private var dismiss

  let message: String = """
  We've created a new place for all your newsletters and feeds called Following. You can control the destination of
  new items by changing the destination for your subscriptions in the Subscriptions view of your settings. By default
  your existing newsletters will go into your library and your existing feeds will go into Following.

  From the library you can swipe items left to right to move them into your library. In the reader view you can tap the
  bookmark icon on the toolbar to move items into your library.

  If you don't need the following tab you can disable it from the filters view in your settings.

  - [Learn more about the following](https://docs.omnivore.app/using/following.html)

  - [Tell your friends about Omnivore](https://omnivore.app/about)

  """

  var closeButton: some View {
    Button(action: {
      dismiss()
    }, label: {
      ZStack {
        Circle()
          .foregroundColor(Color.circleButtonBackground)
          .frame(width: 30, height: 30)

        Image(systemName: "xmark")
          .resizable(resizingMode: Image.ResizingMode.stretch)
          .foregroundColor(Color.circleButtonForeground)
          .aspectRatio(contentMode: .fit)
          .font(Font.title.weight(.bold))
          .frame(width: 12, height: 12)
      }
    })
  }

  public var body: some View {
    HStack {
      Text("Your new Following tab")
        .font(Font.system(size: 20, weight: .bold))
      Spacer()
      closeButton
    }
    .padding(.top, 16)
    .padding(.horizontal, 16)

    List {
      Section {
        let parsedMessage = try? AttributedString(markdown: message,
                                                  options: .init(interpretedSyntax: .inlineOnly))
        Text(parsedMessage ?? "")
          .multilineTextAlignment(.leading)
          .foregroundColor(Color.appGrayTextContrast)
          .accentColor(.blue)
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.top, 16)
      }
    }
  }
}
