import SwiftUI

public struct SearchBar: View {
  @Binding var searchTerm: String
  @FocusState private var isFocused: Bool
  @State private var initialFocus: Bool

  public init(
    searchTerm: Binding<String>,
    initialFocus: Bool
  ) {
    self._searchTerm = searchTerm
    self.initialFocus = initialFocus
  }

  public var body: some View {
    HStack(spacing: 0) {
      TextField("Search", text: $searchTerm)
        .frame(height: 36)
        .frame(maxWidth: .infinity)
        .background(Color.appButtonBackground)
        .cornerRadius(8)
        .focused($isFocused)
        .padding(.leading, 24)
        .overlay(
          HStack {
            Image(systemName: "magnifyingglass")
              .resizable()
              .frame(width: 15, height: 15)
              .foregroundColor(.appGrayText)
              .padding(.leading, 2)

            Spacer()
          }
        )

      if isFocused {
        Button(
          action: {
            self.searchTerm = ""
            self.isFocused = false
          },
          label: {
            Image(systemName: "multiply.circle.fill")
              .foregroundColor(.gray)
          }
        )
        .padding(.trailing, 0)
        .transition(.move(edge: .trailing))
      }
    }.onAppear {
      self.isFocused = initialFocus
    }
  }
}
