import Models
import SwiftUI
import Utils

public struct FeedCard: View {
  @ObservedObject var item: LinkedItem

  public init(item: LinkedItem) {
    self.item = item
  }

  public var body: some View {
    VStack {
      HStack(alignment: .top, spacing: 10) {
        VStack(alignment: .leading, spacing: 1) {
          Text(item.unwrappedTitle)
            .font(.appCallout)
            .lineSpacing(1.25)
            .foregroundColor(.appGrayTextContrast)
            .fixedSize(horizontal: false, vertical: true)

          if let author = item.author {
            Text("By \(author)")
              .font(.appCaption)
              .foregroundColor(.appGrayText)
              .lineLimit(1)
          }

          if let publisherDisplayName = item.publisherDisplayName {
            Text(publisherDisplayName)
              .font(.appCaption)
              .foregroundColor(.appGrayText)
              .underline()
              .lineLimit(1)
          }
        }
        .frame(
          minWidth: 0,
          maxWidth: .infinity,
          minHeight: 0,
          maxHeight: .infinity,
          alignment: .topLeading
        )
        .multilineTextAlignment(.leading)
        .padding(0)

        Group {
          if let imageURL = item.imageURL {
            AsyncLoadingImage(url: imageURL) { imageStatus in
              if case let AsyncImageStatus.loaded(image) = imageStatus {
                image
                  .resizable()
                  .aspectRatio(contentMode: .fill)
                  .frame(width: 80, height: 80)
                  .cornerRadius(6)
              } else if case AsyncImageStatus.loading = imageStatus {
                Color.appButtonBackground
                  .frame(width: 80, height: 80)
                  .cornerRadius(6)
              } else {
                EmptyView().frame(width: 80, height: 80, alignment: .top)
              }
            }
          }
        }
      }

      if item.sortedLabels.count > 0 {
        // Category Labels
        ScrollView(.horizontal, showsIndicators: false) {
          HStack {
            ForEach(item.sortedLabels, id: \.self) {
              TextChip(feedItemLabel: $0)
            }
            Spacer()
          }
        }.padding(.top, 8)
      }
    }
    .padding(.top, 10)
    .padding(.bottom, 8)
    .frame(
      minWidth: nil,
      idealWidth: nil,
      maxWidth: nil,
      minHeight: 70,
      idealHeight: nil,
      maxHeight: nil,
      alignment: .topLeading
    )
  }
}
