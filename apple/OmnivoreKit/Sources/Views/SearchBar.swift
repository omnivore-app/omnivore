import SwiftUI

public struct SearchBar: View {
  @Binding var searchTerm: String
  @Binding var isSearching: Bool

  public init(
    searchTerm: Binding<String>,
    isSearching: Binding<Bool>
  ) {
    self._searchTerm = searchTerm
    self._isSearching = isSearching
  }

  public var body: some View {
    HStack(spacing: 0) {
      TextField("Search", text: $searchTerm)
        .padding(.vertical, 8)
        .padding(.horizontal, 8)
        .background(Color(.systemGray6))
        .cornerRadius(8)
        .padding(.horizontal, 10)
        .onTapGesture {
          self.isSearching = true
        }

      if isSearching {
        Button(
          action: {
            self.isSearching = false
            self.searchTerm = ""
            self.hideKeyboard()
          },
          label: { Image(systemName: "xmark.circle").foregroundColor(.appGrayTextContrast) }
        )
        .padding(.trailing)
        .transition(.opacity)
      }
    }
  }
}
