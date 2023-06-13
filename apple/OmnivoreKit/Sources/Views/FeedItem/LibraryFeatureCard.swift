import Models
import SwiftUI
import Utils

public struct LibraryFeatureCard: View {
  let viewer: Viewer?
  let tapHandler: () -> Void
  @ObservedObject var item: LinkedItem

  public init(item: LinkedItem, viewer: Viewer?, tapHandler: @escaping () -> Void = {}) {
    self.item = item
    self.viewer = viewer
    self.tapHandler = tapHandler
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: 5) {
      imageBox
      title
      readInfo
      Spacer()
    }
    .padding(0)
    .frame(maxWidth: 150)
  }

  var isFullyRead: Bool {
    item.readingProgress > 95
  }

  var isPartiallyRead: Bool {
    Int(item.readingProgress) > 0
  }

  var readingSpeed: Int64 {
    var result = UserDefaults.standard.integer(forKey: UserDefaultKey.userWordsPerMinute.rawValue)
    if result <= 0 {
      result = 235
    }
    return Int64(result)
  }

  var estimatedReadingTime: String {
    if item.wordsCount > 0 {
      let readLen = max(1, item.wordsCount / readingSpeed)
      return "\(readLen) MIN READ • "
    }
    return ""
  }

  var readingProgress: String {
    // If there is no wordsCount don't show progress because it will make no sense
    if item.wordsCount > 0 {
      return "\(String(format: "%d", Int(item.readingProgress)))%"
    }
    return ""
  }

  var readInfo: some View {
    AnyView(HStack {
      Text("\(estimatedReadingTime)")
        .font(Font.system(size: 11, weight: .medium))
        .foregroundColor(Color.themeMediumGray)
        +
        Text("\(readingProgress)")
        .font(Font.system(size: 11, weight: .medium))
        .foregroundColor(isPartiallyRead ? Color.appGreenSuccess : Color.themeMediumGray)
    }
    .frame(maxWidth: 150, alignment: .leading))
  }

  var imageBox: some View {
    Group {
      if let imageURL = item.imageURL {
        AsyncImage(url: imageURL) { phase in
          switch phase {
          case .empty:
            Color.systemBackground
              .frame(width: 146, height: 82)
              .cornerRadius(5)
          case let .success(image):
            image.resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: 146, height: 82)
              .cornerRadius(5)
          case .failure:
            Image(systemName: "photo")
              .frame(width: 146, height: 82)
              .foregroundColor(Color(hex: "#6A6968"))
              .background(Color(hex: "#EBEBEB"))
              .cornerRadius(5)
          @unknown default:
            // Since the AsyncImagePhase enum isn't frozen,
            // we need to add this currently unused fallback
            // to handle any new cases that might be added
            // in the future:
            EmptyView()
          }
        }
      } else {
        Image(systemName: "photo")
          .frame(width: 146, height: 82)
          .foregroundColor(Color(hex: "#6A6968"))
          .background(Color(hex: "#EBEBEB"))
          .cornerRadius(5)
      }
    }
  }

  var title: some View {
    Text(item.unwrappedTitle.trimmingCharacters(in: .whitespacesAndNewlines))
      .multilineTextAlignment(.leading)
      .font(Font.system(size: 13, weight: .semibold))
      .lineSpacing(1.25)
      .foregroundColor(.appGrayTextContrast)
      .fixedSize(horizontal: false, vertical: true)
      .lineLimit(2)
      .frame(maxWidth: .infinity, minHeight: 33, alignment: .topLeading)
  }
}
