#if os(iOS)
  import Introspect
  import Models
  import Services
  import SwiftUI
  import UIKit
  import Views

  struct LibrarySearchView: View {
    @State private var searchBar: UISearchBar?
    @State private var recents: [String] = []
    @StateObject var viewModel = LibrarySearchViewModel()

    @EnvironmentObject var dataService: DataService
    @Environment(\.isSearching) var isSearching
    @Environment(\.dismiss) private var dismiss

    let homeFeedViewModel: HomeFeedViewModel

    init(homeFeedViewModel: HomeFeedViewModel) {
      self.homeFeedViewModel = homeFeedViewModel
    }

    func performTypeahead(_ searchTerm: String) {
      Task {
        await viewModel.search(dataService: self.dataService, searchTerm: searchTerm)
      }
    }

    func setSearchTerm(_ searchTerm: String) {
      viewModel.searchTerm = searchTerm
      searchBar?.becomeFirstResponder()
      performTypeahead(searchTerm)
    }

    func performSearch(_ searchTerm: String) {
      let term = searchTerm.trimmingCharacters(in: Foundation.CharacterSet.whitespacesAndNewlines)
      viewModel.saveRecentSearch(dataService: dataService, searchTerm: term)
      recents = viewModel.recentSearches(dataService: dataService)
      homeFeedViewModel.searchTerm = term

      dismiss()
    }

    func recentSearchRow(_ term: String) -> some View {
      HStack {
        HStack {
          Image(systemName: "clock.arrow.circlepath")
          Text(term).foregroundColor(.appGrayText)
        }.onTapGesture {
          performSearch(term)
        }

        Spacer()

        Image(systemName: "arrow.up.backward")
          .onTapGesture {
            setSearchTerm(viewModel.searchTerm + (viewModel.searchTerm.count > 0 ? " " : "") + term)
          }
          .searchCompletion(term)
      }.swipeActions(edge: .trailing, allowsFullSwipe: true) {
        Button {
          withAnimation(.linear(duration: 0.4)) {
            viewModel.removeRecentSearch(dataService: dataService, searchTerm: term)
            self.recents = viewModel.recentSearches(dataService: dataService)
          }
        } label: {
          Label("Remove", systemImage: "trash")
        }.tint(.red)
      }
    }

    var body: some View {
      NavigationView {
        innerBody
      }.introspectViewController { controller in
        searchBar = Introspect.findChild(ofType: UISearchBar.self, in: controller.view)
        searchBar?.smartQuotesType = .no
      }
    }

    var innerBody: some View {
      ZStack {
        if let linkRequest = viewModel.linkRequest {
          NavigationLink(
            destination: WebReaderLoadingContainer(requestID: linkRequest.serverID),
            tag: linkRequest,
            selection: $viewModel.linkRequest
          ) {
            EmptyView()
          }
        }
        listBody
          .navigationTitle("Search")
          .navigationBarItems(trailing: Button(action: { dismiss() }, label: { Text(LocalText.genericClose) }))
          .navigationBarTitleDisplayMode(NavigationBarItem.TitleDisplayMode.inline)
          .searchable(text: $viewModel.searchTerm, placement: .navigationBarDrawer(displayMode: .always)) {
            ForEach(viewModel.items) { item in
              HStack {
                Text(item.title)
                Spacer()
                Image(systemName: "chevron.right")
              }.onTapGesture {
                homeFeedViewModel.pushLinkedRequest(request: LinkRequest(id: UUID(), serverID: item.id))
                dismiss()
              }
            }
          }
          .onAppear {
            self.recents = viewModel.recentSearches(dataService: dataService)
          }
          .onSubmit(of: .search) {
            performSearch(viewModel.searchTerm)
          }
          .onChange(of: viewModel.searchTerm) { term in
            performTypeahead(term)
          }
      }
    }

    var listBody: some View {
      VStack {
        List {
          if viewModel.searchTerm.count == 0 {
            if recents.count > 0 {
              Section("Recent Searches") {
                ForEach(recents, id: \.self) { term in
                  recentSearchRow(term)
                }
              }
            }

            Section("Narrow with advanced search") {
              (Text("**in:**  ") + Text("filter to inbox, archive, or all"))
                .foregroundColor(.appGrayText)
                .onTapGesture { setSearchTerm("is:") }

              (Text("**title:**  ") + Text("search for a specific title"))
                .foregroundColor(.appGrayText)
                .onTapGesture { setSearchTerm("site:") }

              (Text("**has:highlights**  ") + Text("any saved read with highlights"))
                .foregroundColor(.appGrayText)
                .onTapGesture { setSearchTerm("has:highlights") }

              Button(action: {}, label: {
                Text("[More on Advanced Search](https://docs.omnivore.app/using/search.html)")
                  .underline()
                  .padding(.top, 25)
              })
            }
          }
        }.listStyle(PlainListStyle())
      }
    }
  }
#endif
