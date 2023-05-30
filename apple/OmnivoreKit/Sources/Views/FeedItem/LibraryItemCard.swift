import Models
import SwiftUI
import Utils

public extension View {
  func draggableItem(item: LinkedItem) -> some View {
    if #available(iOS 16.0, *), let url = item.deepLink {
      return AnyView(self.draggable(url) {
        Label(item.unwrappedTitle, systemImage: "link")
      })
    }
    return AnyView(self)
  }
}

public struct LibraryItemCard: View {
  let viewer: Viewer?
  let tapHandler: () -> Void
  @ObservedObject var item: LinkedItem

  public init(item: LinkedItem, viewer: Viewer?, tapHandler: @escaping () -> Void = {}) {
    self.item = item
    self.viewer = viewer
    self.tapHandler = tapHandler
  }

  public var body: some View {
    VStack {
      HStack(alignment: .top, spacing: 0) {
        articleInfo
        imageBox
      }
      .padding(5)
      .frame(maxWidth: .infinity, maxHeight: .infinity)

      if item.hasLabels {
        labels
      }
    }
    .padding(.bottom, 8)
    .draggableItem(item: item)
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
    return ""
  }

  var highlightsText: String {
    if let highlights = item.highlights, highlights.count > 0 {
      let fmted = LocalText.pluralizedText(key: "number_of_highlights", count: highlights.count)
      if item.wordsCount > 0 {
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
      if item.wordsCount > 0 {
        return " • \(fmted)"
      }
      return fmted
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

        +
        Text("\(highlightsText)")
        .font(Font.system(size: 11, weight: .medium))
        .foregroundColor(Color.themeMediumGray)

        +
        Text("\(notesText)")
        .font(Font.system(size: 11, weight: .medium))
        .foregroundColor(Color.themeMediumGray)
    }
    .frame(maxWidth: .infinity, alignment: .leading))
  }

  var imageBox: some View {
    Group {
      if let imageURL = item.imageURL {
        AsyncImage(url: imageURL) { phase in
          if let image = phase.image {
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: 55, height: 73)
              .cornerRadius(4)
              .padding(.top, 2)
          } else {
            Color.systemBackground
              .frame(width: 55, height: 73)
              .cornerRadius(4)
              .padding(.top, 2)
          }
        }
      }
    }
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

//    var str = ""
//    if let author = item.author {
//      str += author
//    }
//
//    if item.author != nil, item.publisherDisplayName != nil {
//      str += ", "
//    }
//
//    if let publisherDisplayName = item.publisherDisplayName {
//      str += publisherDisplayName
//    }
//
//    return str
  }

  var byLine: some View {
    Text(bylineStr)
      .font(Font.system(size: 15, weight: .regular))
      .foregroundColor(Color.themeMediumGray)
      .frame(maxWidth: .infinity, alignment: .leading)
      .lineLimit(1)
  }

  public var articleInfo: some View {
    VStack(alignment: .leading, spacing: 5) {
      readInfo

      Text(item.unwrappedTitle)
        .font(Font.system(size: 18, weight: .semibold))
        .lineSpacing(1.25)
        .foregroundColor(.appGrayTextContrast)
        .fixedSize(horizontal: false, vertical: true)
        .lineLimit(2)

      byLine
    }
    .padding(0)
    .padding(.trailing, 8)
  }

  var labels: some View {
    LabelsFlowLayout(labels: item.sortedLabels)
      .padding(.top, 0)
    #if os(macOS)
      .onTapGesture {
        tapHandler()
      }
    #endif
  }
}
