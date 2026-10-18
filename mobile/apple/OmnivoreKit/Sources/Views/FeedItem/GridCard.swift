import Models
import SwiftUI
import Utils

public enum GridCardAction {
  case toggleArchiveStatus
  case delete
  case editLabels
  case editTitle
  case viewHighlights
}

public struct GridCard: View {
  @ObservedObject var item: Models.LibraryItem
  let savedAtStr: String

  public init(
    item: Models.LibraryItem
  ) {
    self.item = item
    self.savedAtStr = savedDateString(item.savedAt)
  }

  var imageBox: some View {
    GeometryReader { geo in

      ZStack(alignment: .bottomLeading) {
        if let imageURL = item.imageURL {
          CachedAsyncImage(url: imageURL) { phase in
            switch phase {
            case .empty:
              Color.clear
                .frame(maxWidth: .infinity, maxHeight: geo.size.height)
            case let .success(image):
              image.resizable()
                .resizable()
                .scaledToFill()
                .frame(maxWidth: .infinity, maxHeight: geo.size.height)
                .clipped()
            case .failure:
              fallbackImage

            @unknown default:
              // Since the AsyncImagePhase enum isn't frozen,
              // we need to add this currently unused fallback
              // to handle any new cases that might be added
              // in the future:
              Color.clear
                .frame(maxWidth: .infinity, maxHeight: geo.size.height)
            }
          }
        } else {
          fallbackImage
        }
        Color(hex: "#D9D9D9")?.opacity(0.65).frame(width: geo.size.width, height: 5)
        Color(hex: "#FFD234").frame(width: geo.size.width * (item.readingProgress / 100), height: 5)
      }
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
    GeometryReader { geo in
      HStack {
        Text(item.title ?? "")
          .font(fallbackFont)
          .frame(alignment: .center)
          .multilineTextAlignment(.leading)
          .lineLimit(2)
          .padding(10)
          .foregroundColor(Color.thFallbackImageForeground)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(Color.thFallbackImageBackground)
      .frame(width: geo.size.width, height: geo.size.height)
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

  var isPartiallyRead: Bool {
    Int(item.readingProgress) > 0
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

      Text(savedAtStr)
        .font(.footnote)
        .foregroundColor(Color.themeLibraryItemSubtle)
+
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

  public var body: some View {
    GeometryReader { geo in
      VStack(alignment: .leading, spacing: 0) {
        VStack {
          imageBox
            .frame(height: geo.size.height / 2.0)

          VStack(alignment: .leading, spacing: 4) {
            readInfo
              .dynamicTypeSize(.xSmall ... .medium)
              .padding(.horizontal, 15)

            Text(item.title ?? "")
              .lineLimit(2)
              .font(.appHeadline)
              .foregroundColor(.appGrayTextContrast)
              .padding(.horizontal, 15)

            byLine
              .padding(.horizontal, 15)
          }
          .padding(.bottom, 10)
          .padding(.top, 10)

          // Link description and image
          HStack(alignment: .top) {
            Text(item.descriptionText ?? item.title ?? "")
              .font(.appSubheadline)
              .foregroundColor(.appGrayTextContrast)
              .lineLimit(2)
              .multilineTextAlignment(.leading)

            Spacer()
          }
          .padding(.horizontal, 15)

          if !nonFlairLabels.isEmpty {
            LabelsFlowLayout(labels: nonFlairLabels)
              .padding(.horizontal, 15)
          }
        }
        .padding(.horizontal, 0)
        .padding(.top, 0)
      }
    }
  }
}
