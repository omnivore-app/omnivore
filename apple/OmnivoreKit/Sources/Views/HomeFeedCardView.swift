import Models
import SwiftUI

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

public struct GridCard: View {
  let item: FeedItem

  public init(item: FeedItem) {
    self.item = item
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      // Progress Bar
      ProgressView(value: Double.random(in: 0 ... 1))
        .foregroundColor(.appYellow48)
        .frame(maxWidth: .infinity, alignment: .leading)

      // Title, Subtitle, Menu Button
      VStack(alignment: .leading, spacing: 6) {
        HStack {
          Text(item.title)
            .font(.appSubheadline)
            .foregroundColor(.appGrayTextContrast)
            .lineLimit(1)
          Spacer()
          Button(
            action: { print("grid button tapped") },
            label: { Image.profile }
          )
        }

        HStack {
          if let author = item.author {
            Text("by \(author)")
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

          Spacer()
        }
      }
      .frame(height: 40)

      // Description, Image
      HStack {
        Text(item.description ?? "No description")
          .font(.appSubheadline)
          .foregroundColor(.appGrayTextContrast)
          .lineLimit(nil)

        Spacer()

        if let imageURL = item.imageURL {
          AsyncImage(url: imageURL, isResizable: true)
            .aspectRatio(1, contentMode: .fill)
            .frame(width: 135, height: 90)
            .cornerRadius(6)
        }
      }
      .frame(height: 140)

      // Labels
      HStack {
        Text("Label 1")
        Text("Label 2")
        Spacer()
      }
    }
  }
}
