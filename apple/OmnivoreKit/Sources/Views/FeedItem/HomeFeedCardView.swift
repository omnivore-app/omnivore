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
