import Models
import SwiftUI
import Utils

public struct FeedCard: View {
  let tapHandler: () -> Void
  @ObservedObject var item: LinkedItem

  public init(item: LinkedItem, tapHandler: @escaping () -> Void = {}) {
    self.item = item
    self.tapHandler = tapHandler
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
            .padding(EdgeInsets(top: 0, leading: 0, bottom: 2, trailing: 0))

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
            AsyncImage(url: imageURL) { phase in
              if let image = phase.image {
                image
                  .resizable()
                  .aspectRatio(contentMode: .fill)
                  .frame(width: 80, height: 80)
                  .cornerRadius(6)
              } else if phase.error != nil {
                EmptyView().frame(width: 80, height: 80, alignment: .top)
              } else {
                Color.appButtonBackground
                  .frame(width: 80, height: 80)
                  .cornerRadius(6)
              }
            }
          }
        }
      }

      if item.hasLabels {
        // Category Labels
        ScrollView(.horizontal, showsIndicators: false) {
          HStack {
            ForEach(item.sortedLabels, id: \.self) {
              TextChip(feedItemLabel: $0)
            }
            Spacer()
          }
        }
        .padding(.top, 0)
        #if os(macOS)
          .onTapGesture {
            tapHandler()
          }
        #endif
      }
    }
    .padding(.top, 0)
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
