import Models
import SwiftUI
import Utils

enum FlairLabels: String {
  case pinned
  case favorite
  case recommended
  case newsletter
  case rss
  case feed

  var icon: Image {
    switch self {
    case .pinned: return Image.flairPinned
    case .favorite: return Image.flairFavorite
    case .recommended: return Image.flairRecommended
    case .newsletter: return Image.flairNewsletter
    case .feed, .rss: return Image.flairFeed
    }
  }

  var sortOrder: Int {
    switch self {
    case .feed, .rss: return 0
    case .favorite: return 1
    case .newsletter: return 2
    case .recommended: return 3
    case .pinned: return 4
    }
  }
}

public extension View {
  func draggableItem(item: Models.LibraryItem) -> some View {
    #if os(iOS)
      if #available(iOS 16.0, *), let url = item.deepLink {
        return AnyView(self.draggable(url) {
          Label(item.title ?? "", systemImage: "link")
        })
      }
    #endif
    return AnyView(self)
  }
}

public struct LibraryItemCard: View {
  let viewer: Viewer?
  @ObservedObject var item: Models.LibraryItem
  @State var noteLineLimit: Int? = 3

  public init(item: Models.LibraryItem, viewer: Viewer?) {
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

      if let note = item.noteText, !note.isEmpty {
        HStack(alignment: .top, spacing: 10) {
          avatarImage
            .frame(width: 20, height: 20)
            .padding(.vertical, 10)
            .padding(.leading, 10)

          Text(note)
            .font(Font.system(size: 12))
            .multilineTextAlignment(.leading)
            .lineLimit(noteLineLimit)
            .frame(minHeight: 20)
            .padding(.vertical, 10)
            .padding(.trailing, 10)

          Spacer()
        }
        .frame(maxWidth: .infinity)
        .frame(alignment: .topLeading)
        .background(Color.noteContainer)
        .cornerRadius(5)
        .allowsHitTesting(noteLineLimit != nil)
        .onTapGesture {
          noteLineLimit = nil
        }
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

  var avatarImage: some View {
    ZStack(alignment: .center) {
      Circle()
        .foregroundColor(Color.appCtaYellow)
      Text((viewer?.name ?? "O").prefix(1))
        .font(Font.system(size: 10))
        .foregroundColor(Color.black)
    }
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

  var flairLabels: [FlairLabels] {
    item.sortedLabels.compactMap { label in
      if let name = label.name {
        return FlairLabels(rawValue: name.lowercased())
      }
      return nil
    }.sorted { $0.sortOrder < $1.sortOrder }
  }

  var nonFlairLabels: [LinkedItemLabel] {
    item.sortedLabels.filter { label in
      if let name = label.name, FlairLabels(rawValue: name.lowercased()) != nil {
        return false
      }
      return true
    }
  }

  var readInfo: some View {
    HStack(alignment: .center, spacing: 5.0) {
      ForEach(flairLabels, id: \.self) {
        $0.icon
      }

      Text("\(estimatedReadingTime)")
        .font(.caption2).fontWeight(.medium)
        .foregroundColor(Color.themeLibraryItemSubtle)

        +
        Text("\(readingProgress)")
        .font(.caption2).fontWeight(.medium)
        .foregroundColor(isPartiallyRead ? Color.appGreenSuccess : Color.themeLibraryItemSubtle)

        +
        Text("\(highlightsText)")
        .font(.caption2).fontWeight(.medium)
        .foregroundColor(Color.themeLibraryItemSubtle)

        +
        Text("\(notesText)")
        .font(.caption2).fontWeight(.medium)
        .foregroundColor(Color.themeLibraryItemSubtle)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }

  var imageBox: some View {
    ZStack(alignment: .bottomLeading) {
      if let imageURL = item.imageURL {
        CachedAsyncImage(url: imageURL) { phase in
          if let image = phase.image {
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: 50, height: 75)
              .cornerRadius(5)
              .padding(.top, 2)
          } else {
            Color.clear
              .frame(width: 50, height: 75)
              .cornerRadius(5)
              .padding(.top, 2)
          }
        }
      } else {
        Color.clear
          .frame(width: 50, height: 75)
          .cornerRadius(5)
          .padding(.top, 2)
      }
    }
    .padding(.top, 10)
    .cornerRadius(5)
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
    if let origin = cardSiteName(item.pageURLString) {
      Text(bylineStr + " | " + origin)
        .font(.caption2)
        .foregroundColor(Color.themeLibraryItemSubtle)
        .frame(maxWidth: .infinity, alignment: .leading)
        .lineLimit(1)
    } else {
      Text(bylineStr)
        .font(.caption2)
        .foregroundColor(Color.themeLibraryItemSubtle)
        .frame(maxWidth: .infinity, alignment: .leading)
        .lineLimit(1)
    }
  }

  public var articleInfo: some View {
    VStack(alignment: .leading, spacing: 5) {
      readInfo
        .dynamicTypeSize(.xSmall ... .medium)

      Text(item.title ?? "")
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
    LabelsFlowLayout(labels: nonFlairLabels)
  }
}

struct CircleCheckboxToggleStyle: ToggleStyle {
  func makeBody(configuration: Configuration) -> some View {
    Button(action: {
      configuration.isOn.toggle()
    }, label: {
      HStack {
        Image(systemName: configuration.isOn ? "checkmark.circle" : "circle")
          .font(Font.system(size: 18))
          .foregroundColor(configuration.isOn ? Color.blue : Color.appGrayTextContrast)
      }
    })
      .buttonStyle(.plain)
  }
}
