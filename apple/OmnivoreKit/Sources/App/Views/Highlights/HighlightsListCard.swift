import Models
import SwiftUI

struct HighlightsListCard: View {
  @State var isContextMenuOpen = false

  let highlight: Highlight

  var contextMenuView: some View {
    Group {
      Button(
        action: {},
        label: { Label("Stubby One", systemImage: "highlighter") }
      )
      Button(
        action: {},
        label: { Label("Stubby Two", systemImage: "textbox") }
      )
    }
  }

  var body: some View {
    VStack(alignment: .leading) {
      HStack {
        Image(systemName: "highlighter")

        Text(highlight.shortId ?? "no short Id")
          .font(.appHeadline)
          .foregroundColor(.appGrayTextContrast)
          .lineLimit(1)

        Spacer()

        Menu(
          content: { contextMenuView },
          label: {
            Image(systemName: "ellipsis")
              .foregroundColor(.appGrayTextContrast)
              .padding()
          }
        )
        .frame(width: 16, height: 16, alignment: .center)
        .onTapGesture { isContextMenuOpen = true }
      }
      .padding(.top, 8)

      HStack {
        Divider()
          .frame(width: 6)
          .overlay(Color.appYellow48)

        Text(highlight.quote ?? "")
      }
      .padding(.bottom, 8)
    }
  }
}
