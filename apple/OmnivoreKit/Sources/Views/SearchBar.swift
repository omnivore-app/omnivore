import SwiftUI

public struct SearchBar: View {
  @Binding var searchTerm: String
  @FocusState private var isFocused: Bool

  public init(
    searchTerm: Binding<String>
  ) {
    self._searchTerm = searchTerm
  }

  public var body: some View {
    HStack(spacing: 0) {
      TextField("Search", text: $searchTerm)
        .padding(7)
        .padding(.horizontal, 25)
        .background(Color.systemGray6)
        .cornerRadius(8)
        .focused($isFocused)
        .overlay(
          HStack {
            Image(systemName: "magnifyingglass")
              .foregroundColor(.gray)
              .frame(minWidth: 0, maxWidth: .infinity, alignment: .leading)
              .padding(.leading, 10)

            if self.searchTerm != "" {
              Button(
                action: {
                  self.searchTerm = ""
                },
                label: {
                  Image(systemName: "multiply.circle.fill")
                    .foregroundColor(.gray)
                    .padding(.trailing, 8)
                }
              )
            }
          }
        )
        .padding(.horizontal, 10)

      if isFocused {
        Button(
          action: {
            self.searchTerm = ""
            self.isFocused = false
          },
          label: {
            Text("Cancel")
          }
        )
        .padding(.trailing, 10)
        .transition(.move(edge: .trailing))
      }
    }
  }
}
