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
  @Binding var isContextMenuOpen: Bool
  let item: Models.LibraryItem
  let actionHandler: (GridCardAction) -> Void
  // let tapAction: () -> Void

  public init(
    item: Models.LibraryItem,
    isContextMenuOpen: Binding<Bool>,
    actionHandler: @escaping (GridCardAction) -> Void
  ) {
    self.item = item
    self._isContextMenuOpen = isContextMenuOpen
    self.actionHandler = actionHandler
  }

  // Menu doesn't provide an API to observe it's open state
  // so we have keep track of it's state manually
  func tapHandler() {
    if isContextMenuOpen {
      isContextMenuOpen = false
    }
  }

  func menuActionHandler(_ action: GridCardAction) {
    isContextMenuOpen = false
    actionHandler(action)
  }

  var contextMenuView: some View {
    Group {
      Button(
        action: { menuActionHandler(.viewHighlights) },
        label: { Label("Notebook", systemImage: "highlighter") }
      )
      Button(
        action: { menuActionHandler(.editTitle) },
        label: { Label("Edit Info", systemImage: "info.circle") }
      )
      Button(
        action: { menuActionHandler(.editLabels) },
        label: { Label(item.labels?.count == 0 ? "Add Labels" : "Edit Labels", systemImage: "tag") }
      )
      Button(
        action: { menuActionHandler(.toggleArchiveStatus) },
        label: {
          Label(
            item.isArchived ? "Unarchive" : "Archive",
            systemImage: item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
          )
        }
      )
      Button(
        action: { menuActionHandler(.delete) },
        label: { Label("Delete", systemImage: "trash") }
      )
    }
  }

  var imageBox: some View {
    GeometryReader { geo in

      ZStack(alignment: .bottomLeading) {
        if let imageURL = item.imageURL {
          CachedAsyncImage(url: imageURL) { phase in
            switch phase {
            case .empty:
              Color.systemBackground
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
              Color.systemBackground
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
        Text(item.unwrappedTitle)
          .font(fallbackFont)
          .frame(alignment: .center)
          .multilineTextAlignment(.leading)
          .lineLimit(2)
          .padding(10)
          .foregroundColor(Color.themeMiddleGray)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(Color.thLightWhiteGrey)
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

  public var body: some View {
    GeometryReader { geo in
      VStack(alignment: .leading, spacing: 0) {
        VStack {
          imageBox
            .frame(height: geo.size.height / 2.0)

          VStack(alignment: .leading, spacing: 4) {
            HStack {
              Text(item.unwrappedTitle)
                .font(.appHeadline)
                .foregroundColor(.appGrayTextContrast)
                .lineLimit(1)
            }

            byLine
          }
          .frame(height: 30)
          .padding(.horizontal, 10)
          .padding(.bottom, 10)
          .padding(.top, 10)

          // Link description and image
          HStack(alignment: .top) {
            Text(item.descriptionText ?? item.unwrappedTitle)
              .font(.appSubheadline)
              .foregroundColor(.appGrayTextContrast)
              .lineLimit(3)
              .multilineTextAlignment(.leading)

            Spacer()
          }
          .padding(.horizontal, 10)

          // Category Labels
          if item.hasLabels {
            ScrollView(.horizontal, showsIndicators: false) {
              HStack {
                ForEach(item.sortedLabels, id: \.self) {
                  TextChip(feedItemLabel: $0)
                }
                Spacer()
              }
              .padding(.horizontal, 10)
            }
          }
        }
        .padding(.horizontal, 0)
        .padding(.top, 0)
      }
      .contextMenu { contextMenuView }
    }
  }
}
