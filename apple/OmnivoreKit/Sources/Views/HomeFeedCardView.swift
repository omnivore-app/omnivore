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
      if #available(iOS 15.0, *) {
        ProgressView(value: Double.random(in: 0 ... 1))
          .tint(.appYellow48)
          .frame(maxWidth: .infinity, alignment: .leading)
      } else {
        ProgressView(value: Double.random(in: 0 ... 1))
          .frame(maxWidth: .infinity, alignment: .leading)
      }

      // Title, Subtitle, Menu Button
      VStack(alignment: .leading, spacing: 4) {
        HStack {
          Text(item.title)
            .font(.appHeadline)
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
      }
      .frame(height: 30)
      .padding(.horizontal)

      // Description, Image
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

      // Labels
      HStack {
        if Bool.random() {
          TextChip(text: "label", color: .red)
          TextChip(text: "longer label", color: .blue)
        }
        Spacer()
      }
      .frame(height: 30)
      .padding(.horizontal)
      .padding(.bottom, 8)
    }
    .background(Color(.secondarySystemGroupedBackground))
    .cornerRadius(6)
  }
}

struct TextChipdep: View {
  let text: String
  let color: Color

  var body: some View {
    Capsule()
      .fill(color.opacity(0.3))
      .border(color.opacity(0.7), width: 3)
      .overlay(
        Text(text)
          .font(.appFootnote)
          .foregroundColor(color)
          .padding()
      )
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
