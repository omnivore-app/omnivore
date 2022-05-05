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
      HStack(alignment: .top, spacing: 6) {
        VStack(alignment: .leading, spacing: 2) {
          Text(item.unwrappedTitle)
            .font(.appCallout)
            .foregroundColor(.appGrayTextContrast)
            .fixedSize(horizontal: false, vertical: true)

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
                  .aspectRatio(1, contentMode: .fill)
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

      // Category Labels
      ScrollView(.horizontal, showsIndicators: false) {
        HStack {
          ForEach(item.labels.asArray(of: LinkedItemLabel.self), id: \.self) {
            TextChip(feedItemLabel: $0)
          }
          Spacer()
        }
      }
      .padding(.top, 2)
      .padding(.bottom, 2)
    }
    .padding(.top, 16)
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
