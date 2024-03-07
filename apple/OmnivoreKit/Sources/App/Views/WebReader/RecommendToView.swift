#if os(iOS)
  import CoreData
  import Models
  import Services
  import SwiftUI
  import Views

  @MainActor final class RecommendToViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var networkError = false
    @Published var recommendationGroups = [InternalRecommendationGroup]()
    @Published var selectedGroups = [InternalRecommendationGroup]()
    @Published var isRunning = false
    @Published var showError = false
    @Published var showNoteView = false
    @Published var note: String = ""
    @Published var withHighlights: Bool = true

    let pageID: String
    let highlightCount: Int

    init(pageID: String, highlightCount: Int) {
      self.pageID = pageID
      self.highlightCount = highlightCount
    }

    func loadGroups(dataService: DataService) async {
      isLoading = true

      do {
        dataService.viewContext.performAndWait {
          let fetchRequest: NSFetchRequest<Models.RecommendationGroup> = RecommendationGroup.fetchRequest()
          let sort = NSSortDescriptor(key: #keyPath(RecommendationGroup.name), ascending: true)
          fetchRequest.predicate = NSPredicate(format: "canPost == %@", NSNumber(value: true))
          fetchRequest.sortDescriptors = [sort]

          // If this fails we will fallback to making the API call
          let groups = try? dataService.viewContext.fetch(fetchRequest).compactMap { object in
            InternalRecommendationGroup.make(from: object)
          }
          if let groups = groups {
            self.recommendationGroups = groups
          }
        }
        recommendationGroups = try await dataService.recommendationGroups()
          .filter(\.canPost)
          .sorted(by: { $0.name < $1.name })

      } catch {
        print("ERROR fetching recommendationGroups: ", error)
        networkError = true
      }

      isLoading = false
    }

    func recommend(dataService: DataService) async -> Bool {
      isRunning = true
      defer { isRunning = false }

      do {
        try await dataService.recommendPage(pageID: pageID,
                                            groupIDs: selectedGroups.map(\.id),
                                            note: note.isEmpty ? nil : note,
                                            withHighlights: withHighlights)
      } catch {
        showError = true
        return false
      }

      isRunning = false
      return true
    }
  }

  struct RecommendToView: View {
    var dataService: DataService
    @StateObject var viewModel: RecommendToViewModel
    @Environment(\.dismiss) private var dismiss

    var nextButton: some View {
      Button(action: {
        self.viewModel.showNoteView = true
      }, label: {
        Text(LocalText.genericNext)
          .bold()
      })
        .disabled(viewModel.selectedGroups.isEmpty)
    }

    var sendButton: some View {
      if viewModel.isRunning {
        return AnyView(ProgressView())
      } else {
        return AnyView(Button(action: {
          Task {
            if await viewModel.recommend(dataService: dataService) {
              Snackbar.show(message: "Recommendation sent", dismissAfter: 2000)
              dismiss()
            }
          }
        }, label: {
          Text(LocalText.genericSend)
            .bold()
        })
          .disabled(viewModel.selectedGroups.isEmpty)
        )
      }
    }

    var noteView: some View {
      VStack {
        HStack {
          Text(LocalText.recommendationToPrefix)
            .font(.appCaption)
            .foregroundColor(.appGrayText)
          Text(InternalRecommendationGroup.readable(list: viewModel.selectedGroups))
            .font(.appCaption)
            .foregroundColor(.appGrayTextContrast)
          Spacer()
        }
        TextEditor(text: $viewModel.note)
          .lineSpacing(6)
          .accentColor(.appGraySolid)
          .foregroundColor(.appGrayTextContrast)
          .font(.appBody)
          .padding(12)
          .frame(height: 200)
          .background(
            RoundedRectangle(cornerRadius: 8)
              .strokeBorder(Color.appGrayBorder, lineWidth: 1)
              .background(RoundedRectangle(cornerRadius: 8).fill(Color.systemBackground))
          )
          .overlay(
            Text(LocalText.recommendationAddNote)
              .allowsHitTesting(false)
              .opacity(viewModel.note.isEmpty ? 0.4 : 0.0)
              .font(.appBody)
              .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
              .padding(.top, 24)
              .padding(.leading, 16)
          )
        if viewModel.highlightCount > 0 {
          Toggle(isOn: $viewModel.withHighlights, label: {
            HStack(alignment: .firstTextBaseline) {
              Text("Include your \(viewModel.highlightCount) highlight\(viewModel.highlightCount > 1 ? "s" : "")")
            }
          })
        }
        Spacer()
      }
      .padding(16)
      .navigationBarTitleDisplayMode(.inline)
      .navigationViewStyle(.stack)
      .navigationBarItems(trailing: sendButton)
    }

    var body: some View {
      VStack {
        NavigationLink(destination: noteView,
                       isActive: $viewModel.showNoteView) {
          EmptyView()
        }
        List {
          if !viewModel.isLoading, viewModel.recommendationGroups.count < 1 {
            Text("""
            \(LocalText.clubsNoneJoined)

            [Learn more about clubs](https://blog.omnivore.app/p/dca38ba4-8a74-42cc-90ca-d5ffa5d075cc)
            """)
              .accentColor(.blue)
          } else {
            Section("Select clubs to recommend to") {
              ForEach(viewModel.recommendationGroups) { group in
                HStack {
                  Text(group.name)

                  Spacer()

                  if viewModel.selectedGroups.contains(where: { $0.id == group.id }) {
                    Image(systemName: "checkmark")
                  }
                }
                .contentShape(Rectangle())
                .onTapGesture {
                  let idx = viewModel.selectedGroups.firstIndex(where: { $0.id == group.id })
                  if let idx = idx {
                    viewModel.selectedGroups.remove(at: idx)
                  } else {
                    viewModel.selectedGroups.append(group)
                  }
                }
              }
            }
          }
        }
        .listStyle(.grouped)

        Spacer()
      }
      .alert(isPresented: $viewModel.showError) {
        Alert(
          title: Text(LocalText.recommendationError),
          dismissButton: .cancel(Text(LocalText.genericOk)) {
            viewModel.showError = false
          }
        )
      }
      .navigationBarTitleDisplayMode(.inline)
      .navigationViewStyle(.stack)
      .navigationBarItems(leading: Button(action: {
        dismiss()
      }, label: { Text(LocalText.cancelGeneric) }),
      trailing: nextButton)
      .task {
        await viewModel.loadGroups(dataService: dataService)
      }
    }
  }
#endif
