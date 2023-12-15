import Models
import SwiftUI
import Utils

public struct LibraryFeatureCard: View {
  let viewer: Viewer?
  let tapHandler: () -> Void
  @ObservedObject var item: Models.LibraryItem

  public init(item: Models.LibraryItem, viewer: Viewer?, tapHandler: @escaping () -> Void = {}) {
    self.item = item
    self.viewer = viewer
    self.tapHandler = tapHandler
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: 5) {
      imageBox
      title
      Spacer()

    }.padding(0)
      .frame(maxWidth: 150)
  }

  var isFullyRead: Bool {
    item.readingProgress > 95
  }

  var isPartiallyRead: Bool {
    Int(item.readingProgress) > 0
  }

  var imageBox: some View {
    ZStack(alignment: .bottomLeading) {
      if let imageURL = item.imageURL {
        CachedAsyncImage(url: imageURL) { phase in
          switch phase {
          case .empty:
            Color.clear
              .frame(width: 146, height: 90)
          case let .success(image):
            image.resizable()
              .resizable()
              .scaledToFill()
              .frame(width: 146, height: 90)
              .clipped()
          case .failure:
            fallbackImage

          @unknown default:
            // Since the AsyncImagePhase enum isn't frozen,
            // we need to add this currently unused fallback
            // to handle any new cases that might be added
            // in the future:
            Color.systemBackground
              .frame(width: 146, height: 90)
          }
        }
      } else {
        fallbackImage
      }
      Color(hex: "#D9D9D9")?.opacity(0.65).frame(width: 146, height: 5)
      Color(hex: "#FFD234").frame(width: 146 * (item.readingProgress / 100), height: 5)
    }
    .cornerRadius(5)
  }

  var fallbackFont: Font {
    if let uifont = UIFont(name: "Futura Bold", size: 16) {
      return Font(uifont)
    }
    return Font.system(size: 16)
  }

  var fallbackImage: some View {
    HStack {
      Text(item.unwrappedTitle)
        .font(fallbackFont)
        .frame(alignment: .center)
        .multilineTextAlignment(.leading)
        .lineLimit(2)
        .padding(10)
        .foregroundColor(Color.thFallbackImageForeground)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.thFallbackImageBackground)
    .frame(width: 146, height: 90)
  }

  var title: some View {
    Text(item.unwrappedTitle.trimmingCharacters(in: .whitespacesAndNewlines))
      .multilineTextAlignment(.leading)
      .font(Font.system(size: 11, weight: .medium))
      .lineSpacing(1.25)
      .foregroundColor(.appGrayTextContrast)
      .fixedSize(horizontal: false, vertical: true)
      .lineLimit(2)
      .frame(maxWidth: .infinity, minHeight: 33, alignment: .topLeading)
  }
}
