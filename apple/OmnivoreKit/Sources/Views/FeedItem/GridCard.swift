import Models
import SwiftUI
import Utils

public enum GridCardAction {
  case toggleArchiveStatus
  case delete
  case editLabels
  case editTitle
}

public struct GridCard: View {
  @Binding var isContextMenuOpen: Bool
  let item: LinkedItem
  let actionHandler: (GridCardAction) -> Void
  let tapAction: () -> Void

  public init(
    item: LinkedItem,
    isContextMenuOpen: Binding<Bool>,
    actionHandler: @escaping (GridCardAction) -> Void,
    tapAction: @escaping () -> Void
  ) {
    self.item = item
    self._isContextMenuOpen = isContextMenuOpen
    self.actionHandler = actionHandler
    self.tapAction = tapAction
  }

  // Menu doesn't provide an API to observe it's open state
  // so we have keep track of it's state manually
  func tapHandler() {
    if isContextMenuOpen {
      isContextMenuOpen = false
    } else {
      tapAction()
    }
  }

  func menuActionHandler(_ action: GridCardAction) {
    isContextMenuOpen = false
    actionHandler(action)
  }

  var contextMenuView: some View {
    Group {
      Button(
        action: { menuActionHandler(.editTitle) },
        label: { Label("Edit Title/Description", systemImage: "textbox") }
      )
      Button(
        action: { menuActionHandler(.editLabels) },
        label: { Label("Edit Labels", systemImage: "tag") }
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

  public var body: some View {
    GeometryReader { geo in
      VStack(alignment: .leading, spacing: 0) {
        // Progress Bar
        Group {
          ProgressView(value: min(abs(item.readingProgress) / 100, 1))
            .tint(.appYellow48)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.bottom, 16)
        }
        .onTapGesture { tapHandler() }

        VStack {
          // Title, Subtitle, Menu Button
          VStack(alignment: .leading, spacing: 4) {
            HStack {
              Text(item.unwrappedTitle)
                .font(.appHeadline)
                .foregroundColor(.appGrayTextContrast)
                .lineLimit(1)
                .onTapGesture { tapHandler() }
              Spacer()

              Menu(
                content: { contextMenuView },
                label: { Image(systemName: "ellipsis").padding() }
              )
              .frame(width: 16, height: 16, alignment: .center)
              .onTapGesture { isContextMenuOpen = true }
            }

            HStack {
              if let author = item.author {
                Text("by \(author)")
                  .font(.appCaptionTwo)
                  .foregroundColor(.appGrayText)
                  .lineLimit(1)
              }

              if let publisherDisplayName = item.publisherDisplayName {
                Text(publisherDisplayName)
                  .font(.appCaptionTwo)
                  .foregroundColor(.appGrayText)
                  .lineLimit(1)
              }

              Spacer()
            }
            .onTapGesture { tapHandler() }
          }
          .frame(height: 30)
          .padding(.horizontal)
          .padding(.bottom, 16)

          // Link description and image
          HStack(alignment: .top) {
            Text(item.descriptionText ?? item.unwrappedTitle)
              .font(.appSubheadline)
              .foregroundColor(.appGrayTextContrast)
              .lineLimit(nil)
              .multilineTextAlignment(.leading)

            Spacer()

            if let imageURL = item.imageURL {
              AsyncLoadingImage(url: imageURL) { imageStatus in
                if case let AsyncImageStatus.loaded(image) = imageStatus {
                  image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: geo.size.width / 3, height: (geo.size.width * 2) / 9)
                    .cornerRadius(3)
                } else if case AsyncImageStatus.loading = imageStatus {
                  Color.appButtonBackground
                    .frame(width: geo.size.width / 3, height: (geo.size.width * 2) / 9)
                    .cornerRadius(3)
                } else {
                  EmptyView()
                }
              }
            }
          }
          .padding(.horizontal)
          .onTapGesture { tapHandler() }

          // Category Labels
          if item.hasLabels {
            ScrollView(.horizontal, showsIndicators: false) {
              HStack {
                ForEach(item.sortedLabels, id: \.self) {
                  TextChip(feedItemLabel: $0)
                }
                Spacer()
              }
              .padding(.horizontal)
            }
            .onTapGesture { tapHandler() }
          }

          if let status = item.serverSyncStatus, status != ServerSyncStatus.isNSync.rawValue {
            SyncStatusIcon(status: ServerSyncStatus(rawValue: Int(status)) ?? ServerSyncStatus.isNSync)
          }
        }
        .padding(.horizontal, 0)
        .padding(.top, 0)
        .padding(.bottom, 8)
      }
      .contextMenu { contextMenuView }
    }
  }
}
