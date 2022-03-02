import Models
import SwiftUI
import Utils

public struct FeedCard: View {
  let item: FeedItem

  public init(item: FeedItem) {
    self.item = item
  }

  public var body: some View {
    HStack(alignment: .top, spacing: 6) {
      VStack(alignment: .leading, spacing: 6) {
        Text(item.title)
          .font(.appSubheadline)
          .foregroundColor(.appGrayTextContrast)
          .lineLimit(2)
          .frame(maxWidth: .infinity, alignment: .leading)

        if let author = item.author {
          Text("By \(author)")
            .font(.appCaption)
            .foregroundColor(.appGrayText)
            .lineLimit(1)
        }

        if let publisherURL = item.publisherHostname {
          Text(publisherURL)
            .font(.appCaption)
            .foregroundColor(.appGrayText)
            .underline()
            .lineLimit(1)
        }
      }
      .frame(maxWidth: .infinity)
      .multilineTextAlignment(.leading)
      .padding(0)

      Group {
        if let imageURL = item.imageURL {
          AsyncImage(url: imageURL, isResizable: true)
            .aspectRatio(1, contentMode: .fill)
            .frame(width: 80, height: 80)
            .cornerRadius(6)
        }
      }
    }
    .frame(maxWidth: .infinity, minHeight: 100, idealHeight: 100, maxHeight: 100)
  }
}

public enum GridCardAction {
  case toggleArchiveStatus
  case delete
}

public struct GridCard: View {
  let item: FeedItem
  let actionHandler: (GridCardAction) -> Void
  let tapAction: () -> Void

  public init(
    item: FeedItem,
    actionHandler: @escaping (GridCardAction) -> Void,
    tapAction: @escaping () -> Void
  ) {
    self.item = item
    self.actionHandler = actionHandler
    self.tapAction = tapAction
  }

  var contextMenuView: some View {
    Group {
      Button(
        action: { actionHandler(.toggleArchiveStatus) },
        label: {
          Label(
            item.isArchived ? "Unarchive" : "Archive",
            systemImage: item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
          )
        }
      )
      Button(
        action: { actionHandler(.delete) },
        label: { Label("Delete Link", systemImage: "trash") }
      )
    }
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      // Progress Bar
      Group {
        if #available(iOS 15.0, *) {
          ProgressView(value: min(abs(item.readingProgress) / 100, 1))
            .tint(.appYellow48)
            .frame(maxWidth: .infinity, alignment: .leading)
        } else {
          ProgressView(value: max(abs(item.readingProgress) / 100, 1))
            .frame(maxWidth: .infinity, alignment: .leading)
        }
      }
      .onTapGesture { tapAction() }

      // Title, Subtitle, Menu Button
      VStack(alignment: .leading, spacing: 4) {
        HStack {
          Text(item.title)
            .font(.appHeadline)
            .foregroundColor(.appGrayTextContrast)
            .lineLimit(1)
            .onTapGesture { tapAction() }
          Spacer()
          Menu(content: { contextMenuView }, label: { Image.profile })
        }

        HStack {
          if let author = item.author {
            Text("by \(author)")
              .font(.appCaptionTwo)
              .foregroundColor(.appGrayText)
              .lineLimit(1)
          }

          if let publisherURL = item.publisherHostname {
            Text(publisherURL)
              .font(.appCaptionTwo)
              .foregroundColor(.appGrayText)
              .underline()
              .lineLimit(1)
          }

          Spacer()
        }
        .onTapGesture { tapAction() }
      }
      .frame(height: 30)
      .padding(.horizontal)

      // Link description and image
      HStack(alignment: .top) {
        Text(item.description ?? item.title)
          .font(.appFootnote)
          .foregroundColor(.appGrayTextContrast)
          .lineLimit(nil)
          .multilineTextAlignment(.leading)

        Spacer()

        if let imageURL = item.imageURL {
          AsyncImage(url: imageURL, isResizable: true)
            .aspectRatio(1, contentMode: .fill)
            .frame(width: 135, height: 90)
            .cornerRadius(3)
        }
      }
      .frame(height: 95)
      .padding(.horizontal)
      .onTapGesture { tapAction() }

      // Category Labels
      if FeatureFlag.showFeedItemTags {
        ScrollView(.horizontal, showsIndicators: false) {
          HStack {
            TextChip(text: "label", color: .red)
            TextChip(text: "longer label", color: .blue)
            Spacer()
          }
          .frame(height: 30)
          .padding(.horizontal)
          .padding(.bottom, 8)
        }
      } else {
        Spacer(minLength: 8)
      }
    }
    .background(
      Color(.secondarySystemGroupedBackground)
        .onTapGesture { tapAction() }
    )
    .cornerRadius(6)
    .contextMenu { contextMenuView }
  }
}

struct TextChip: View {
  let text: String
  let color: Color
  let cornerRadius = 20.0

  var body: some View {
    Text(text)
      .padding(.horizontal, 10)
      .padding(.vertical, 5)
      .font(.appFootnote)
      .foregroundColor(color)
      .lineLimit(1)
      .background(color.opacity(0.1))
      .cornerRadius(cornerRadius)
      .overlay(
        RoundedRectangle(cornerRadius: cornerRadius)
          .stroke(color.opacity(0.3), lineWidth: 1)
      )
  }
}
