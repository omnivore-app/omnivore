#if os(iOS)
  import Models
  import Services
  import SwiftUI
  import Views

  @MainActor final class RecommendationsGroupViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var isLeaving = false
    @Published var networkError = false
    @Published var showLeaveGroup = false
    @Published var recommendationGroup: InternalRecommendationGroup

    init(recommendationGroup: InternalRecommendationGroup) {
      self.recommendationGroup = recommendationGroup
    }

    var nonAdmins: [InternalUserProfile] {
      recommendationGroup.members.filter { member in
        !recommendationGroup.admins.contains(where: { member.id == $0.id })
      }
    }

    func leaveGroup(dataService: DataService) async -> Bool {
      isLeaving = true
      defer {
        isLeaving = false
      }

      do {
        try await dataService.leaveGroup(groupID: recommendationGroup.id)
        Snackbar.show(message: "You have left the club.", dismissAfter: 2000)
      } catch {
        return false
      }
      return true
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
    @Environment(\.dismiss) private var dismiss

    @EnvironmentObject var dataService: DataService
    @StateObject var viewModel: RecommendationsGroupViewModel

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
        return AnyView(Text(LocalText.clubsErrorCopying))
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
        if !viewModel.recommendationGroup.canSeeMembers {
          Text("""
          \(LocalText.clubsAdminDenyViewing)

          [Learn more about clubs](https://blog.omnivore.app/p/dca38ba4-8a74-42cc-90ca-d5ffa5d075cc)
          """)
            .accentColor(.blue)
        } else if viewModel.nonAdmins.count > 0 {
          ForEach(viewModel.nonAdmins) { member in
            SmallUserCard(data: ProfileCardData(
              name: member.name,
              username: member.username,
              imageURL: member.profileImageURL != nil ? URL(string: member.profileImageURL!) : nil
            ))
          }
        } else {
          Text("""
          \(LocalText.clubsNoMembers)

          [Learn more about clubs](https://blog.omnivore.app/p/dca38ba4-8a74-42cc-90ca-d5ffa5d075cc)
          """)
            .accentColor(.blue)
        }
      }
    }

    private var leaveSection: some View {
      if viewModel.isLeaving {
        return AnyView(ProgressView())
      }
      return AnyView(Button(action: {
        viewModel.showLeaveGroup = true
      }, label: { Text(LocalText.clubsLeave) })
        .accentColor(.red))
    }

    private var innerBody: some View {
      Group {
        Section(LocalText.genericName) {
          Text(viewModel.recommendationGroup.name)
        }

        Section("Invite Link") {
          Button(action: {
            #if os(iOS)
              UIPasteboard.general.string = viewModel.recommendationGroup.inviteUrl
            #endif

            #if os(macOS)
              let pasteBoard = NSPasteboard.general
              pasteBoard.clearContents()
              pasteBoard.writeObjects([highlightParams.quote as NSString])
            #endif

            Snackbar.show(message: "Invite link copied", dismissAfter: 2000)
          }, label: {
            Text("[\(viewModel.recommendationGroup.inviteUrl)](\(viewModel.recommendationGroup.inviteUrl))")
              .font(.appCaption)
          })
        }

        adminsSection
        membersSection

        leaveSection
      }
      .alert(isPresented: $viewModel.showLeaveGroup) {
        Alert(
          title: Text(LocalText.clubsLeaveConfirm),
          primaryButton: .destructive(Text(LocalText.clubsLeave)) {
            Task {
              let success = await viewModel.leaveGroup(dataService: dataService)
              if success {
                dismiss()
              }
            }
          },
          secondaryButton: .cancel()
        )
      }
      .navigationTitle(viewModel.recommendationGroup.name)
    }
  }
#endif
