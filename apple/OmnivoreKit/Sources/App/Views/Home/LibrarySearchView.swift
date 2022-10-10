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
    Task { await viewModel.search(dataService: self.dataService, searchTerm: searchTerm) }
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

//      Image(systemName: "arrow.up.backward")
//        .onTapGesture {
//          viewModel.searchTerm += (viewModel.searchTerm.count > 0 ? " " : "") + term
//          searchBar?.becomeFirstResponder()
//        }
//        .searchCompletion(term)
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
        .navigationBarItems(trailing: Button(action: { dismiss() }) {
          Text("Close")
        })
        .navigationBarTitleDisplayMode(NavigationBarItem.TitleDisplayMode.inline)
        .searchable(text: $viewModel.searchTerm, placement: .navigationBarDrawer(displayMode: .always)) {
          ForEach(viewModel.items) { item in
            HStack {
              Text(item.title)
              Spacer()
              Image(systemName: "chevron.right")
            }.onTapGesture {
              viewModel.linkRequest = LinkRequest(id: UUID(), serverID: item.id)
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
          Section("Recent Searches") {
            ForEach(recents, id: \.self) { term in
              recentSearchRow(term)
            }
          }
          Section("Narrow with advanced search") {
            (Text("**site:** ") + Text("site or domain (eg omnivore.app)"))
              .foregroundColor(.appGrayText)
              .onTapGesture { viewModel.searchTerm = "site:" }

            (Text("**author:** ") + Text("author name"))
              .foregroundColor(.appGrayText)
              .onTapGesture { viewModel.searchTerm = "author:" }

            (Text("**is:** ") + Text("read or unread"))
              .foregroundColor(.appGrayText)
              .onTapGesture { viewModel.searchTerm = "is:" }

            Button(action: {}, label: {
              Text("[More on Advanced Search](https://omnivore.app/help/search)")
                .underline()
                .padding(.top, 25)
            })
          }
        }
      }.listStyle(PlainListStyle())
    }
  }
}

extension AnyTransition {
  static var moveAndFade: AnyTransition {
    .asymmetric(
      insertion: .move(edge: .trailing).combined(with: .opacity),
      removal: .scale.combined(with: .opacity)
    )
  }
}
