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
      TextField("Add Labels", text: $searchTerm)
        .frame(height: 36)
        .frame(maxWidth: .infinity)
        .padding(.leading, 28)
        .padding(.trailing, 28)
        .focused($isFocused)
        .overlay(
          HStack {
            Image(systemName: "magnifyingglass")
              .resizable()
              .frame(width: 14, height: 14)
              .foregroundColor(.appGrayText)
              .padding(.leading, 8)

            Spacer()
          }
        )

      if isFocused {
        Button(
          action: {
            self.isFocused = false
          },
          label: {
            Image(systemName: "multiply.circle.fill")
              .foregroundColor(.gray)
          }
        )
        .padding(.trailing, 8)
        .transition(.move(edge: .trailing))
      }
    }
    .background(Color.appButtonBackground)
    .cornerRadius(8)
    .frame(height: 36)
    .onChange(of: isFocused) { isFocused in
      if !isFocused {
        searchTerm = ""
      }
    }
    .onTapGesture {
      isFocused = true
    }
  }
}
