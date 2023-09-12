import Models
import SwiftUI
import Utils

public extension View {
  func draggableItem(item: LinkedItem) -> some View {
    #if os(iOS)
      if #available(iOS 16.0, *), let url = item.deepLink {
        return AnyView(self.draggable(url) {
          Label(item.unwrappedTitle, systemImage: "link")
        })
      }
    #endif
    return AnyView(self)
  }
}

public struct LibraryItemCard: View {
  let viewer: Viewer?
  @ObservedObject var item: LinkedItem

  public init(item: LinkedItem, viewer: Viewer?) {
    self.item = item
    self.viewer = viewer
  }

  public var body: some View {
    VStack {
      HStack(alignment: .top, spacing: 10) {
        articleInfo
        imageBox
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)

      if item.hasLabels {
        labels
      }
    }
    .padding(5)
    .padding(.top, 10)
    .draggableItem(item: item)
    .dynamicTypeSize(.xSmall ... .accessibility1)
  }

  var isFullyRead: Bool {
    item.readingProgress > 95
  }

  var isPartiallyRead: Bool {
    Int(item.readingProgress) > 0
  }

  var readIndicator: some View {
    HStack {
      Circle()
        .foregroundColor( /* item.readingProgress > 0 ? .clear : */ .indicatorBlue)
        .frame(width: 9, height: 9, alignment: .topLeading)
        .padding(.top, 22)
        .padding(.leading, 0)
        .padding(.trailing, 8)
    }
    .padding(0)
    .frame(width: 20)
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
    if item.isPDF {
      // base estimated reading time on page count
      return "\(String(format: "%d", Int(item.readingProgress)))%"
    }
    return ""
  }

  var hasMultipleInfoItems: Bool {
    item.wordsCount > 0 || item.highlights?.first { ($0 as? Highlight)?.annotation != nil } != nil
  }

  var highlightsText: String {
    if let highlights = item.highlights, highlights.count > 0 {
      let fmted = LocalText.pluralizedText(key: "number_of_highlights", count: highlights.count)
      if item.wordsCount > 0 || item.isPDF {
        return " • \(fmted)"
      }
      return fmted
    }
    return ""
  }

  var notesText: String {
    let notes = item.highlights?.filter { item in
      if let highlight = item as? Highlight {
        return !(highlight.annotation ?? "").isEmpty
      }
      return false
    }

    if let notes = notes, notes.count > 0 {
      let fmted = LocalText.pluralizedText(key: "number_of_notes", count: notes.count)
      if hasMultipleInfoItems {
        return " • \(fmted)"
      }
      return fmted
    }
    return ""
  }

  var readInfo: some View {
    AnyView(HStack {
      let fgcolor = Color.isDarkMode ? Color.themeDarkWhiteGray : Color.themeMiddleGray
      Text("\(estimatedReadingTime)")
        .font(.caption2).fontWeight(.medium)
        .foregroundColor(fgcolor)

        +
        Text("\(readingProgress)")
        .font(.caption2).fontWeight(.medium)
        .foregroundColor(isPartiallyRead ? Color.appGreenSuccess : fgcolor)

        +
        Text("\(highlightsText)")
        .font(.caption2).fontWeight(.medium)
        .foregroundColor(fgcolor)

        +
        Text("\(notesText)")
        .font(.caption2).fontWeight(.medium)
        .foregroundColor(fgcolor)
    }
    .frame(maxWidth: .infinity, alignment: .leading))
  }

  var imageBox: some View {
    ZStack(alignment: .bottomLeading) {
      if let imageURL = item.imageURL {
        AsyncImage(url: imageURL) { phase in
          if let image = phase.image {
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: 50, height: 50)
              .cornerRadius(5)
              .padding(.top, 2)
          } else {
            Color.systemBackground
              .frame(width: 50, height: 50)
              .cornerRadius(5)
              .padding(.top, 2)
          }
        }
      } else {
        fallbackImage
      }
    }
    .padding(.top, 15)
    .cornerRadius(5)
  }

  var fallbackImage: some View {
    HStack {
      Text(item.unwrappedTitle.prefix(1))
        .font(Font.system(size: 32, weight: .bold))
        .frame(alignment: .bottomLeading)
        .foregroundColor(Gradient.randomColor(str: item.unwrappedTitle, offset: 1))
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Gradient.randomColor(str: item.unwrappedTitle, offset: 0))
    .background(LinearGradient(gradient: Gradient(fromStr: item.unwrappedTitle)!, startPoint: .top, endPoint: .bottom))
    .frame(width: 50, height: 50)
  }

  var bylineStr: String {
    // It seems like it could be cleaner just having author, instead of
    // concating, maybe we fall back
    if let author = item.author {
      return author
    } else if let publisherDisplayName = item.publisherDisplayName {
      return publisherDisplayName
    }

    return ""
  }

  var byLine: some View {
    Text(bylineStr)
      .font(.caption2)
      .foregroundColor(Color.isDarkMode ? Color.themeLightGray : Color.themeLightestGray)
      .frame(maxWidth: .infinity, alignment: .leading)
      .lineLimit(1)
  }

  public var articleInfo: some View {
    VStack(alignment: .leading, spacing: 5) {
      readInfo
        .dynamicTypeSize(.xSmall ... .medium)

      Text(item.unwrappedTitle)
        .font(.body).fontWeight(.semibold)
        .lineSpacing(1.25)
        .foregroundColor(.appGrayTextContrast)
        .fixedSize(horizontal: false, vertical: true)
        .lineLimit(2)

      byLine
    }
    .padding(0)
  }

  var labels: some View {
    LabelsFlowLayout(labels: item.sortedLabels)
  }
}
