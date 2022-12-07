import Models
import Services
import SwiftUI
import Views

@MainActor final class RecommendationsGroupViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var networkError = true
  @Published var recommendationGroup: InternalRecommendationGroup

  init(recommendationGroup: InternalRecommendationGroup) {
    self.recommendationGroup = recommendationGroup
  }

  var nonAdmins: [InternalUserProfile] {
    recommendationGroup.members.filter { member in
      !recommendationGroup.admins.contains(where: { member.id == $0.id })
    }
  }
}

private struct SmallUserCard: View {
  let data: ProfileCardData
  var size: CGFloat

  public init(data: ProfileCardData, size: CGFloat = 36) {
    self.data = data
    self.size = size
  }

  public var body: some View {
    HStack(alignment: .center, spacing: 16) {
      Group {
        AsyncImage(
          url: data.imageURL,
          content: { $0.resizable() },
          placeholder: {
            Image(systemName: "person.crop.circle")
              .resizable()
              .foregroundColor(.appGrayTextContrast)
          }
        )
      }
      .padding(.leading, 0)
      .aspectRatio(contentMode: .fill)
      .frame(width: size, height: size, alignment: .center)
      .clipShape(Circle())

      VStack(alignment: .leading, spacing: 4) {
        Text(data.name)
          .font(.appBody)
          .foregroundColor(.appGrayTextContrast)
          .lineLimit(1)
          .frame(maxWidth: .infinity, alignment: .leading)

        Text("@\(data.username)")
          .font(.appCaption)
          .foregroundColor(.appGrayText)
          .lineLimit(1)
          .frame(maxWidth: .infinity, alignment: .leading)
      }
      .frame(maxWidth: .infinity)
      .multilineTextAlignment(.leading)
      .padding(0)
    }
    .frame(maxWidth: .infinity)
  }
}

struct RecommendationGroupView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel: RecommendationsGroupViewModel

  @State var presentShareSheet = false

  var body: some View {
    Group {
      #if os(iOS)
        Form {
          innerBody
        }
      #elseif os(macOS)
        List {
          innerBody
        }
        .listStyle(InsetListStyle())
      #endif
    }
  }

  private var shareView: some View {
    if let shareLink = URL(string: viewModel.recommendationGroup.inviteUrl) {
      return AnyView(ShareSheet(activityItems: [shareLink]))
    } else {
      return AnyView(Text("Error copying invite URL"))
    }
  }

  private var adminsSection: some View {
    Section("Admins") {
      ForEach(viewModel.recommendationGroup.admins) { admin in
        SmallUserCard(data: ProfileCardData(
          name: admin.name,
          username: admin.username,
          imageURL: admin.profileImageURL != nil ? URL(string: admin.profileImageURL!) : nil
        ))
      }
    }
  }

  private var membersSection: some View {
    Section("Members") {
      ForEach(viewModel.nonAdmins) { member in
        SmallUserCard(data: ProfileCardData(
          name: member.name,
          username: member.username,
          imageURL: member.profileImageURL != nil ? URL(string: member.profileImageURL!) : nil
        ))
      }
    }
  }

  private var innerBody: some View {
    Group {
      Section("Name") {
        Text(viewModel.recommendationGroup.name)
      }

      Section("Invite Link") {
        Button(action: {
          presentShareSheet = true
        }, label: {
          Text("[\(viewModel.recommendationGroup.inviteUrl)](\(viewModel.recommendationGroup.inviteUrl))")
            .font(.appCaption)
        })
      }

      adminsSection
      membersSection
    }
    .formSheet(isPresented: $presentShareSheet) {
      shareView
    }
    .navigationTitle(viewModel.recommendationGroup.name)
  }
}
