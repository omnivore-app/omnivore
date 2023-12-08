import SwiftUI
import Views

enum PrimaryContentCategory: Identifiable, Hashable, Equatable {
  case feed
  case profile

  static func == (lhs: PrimaryContentCategory, rhs: PrimaryContentCategory) -> Bool {
    lhs.id == rhs.id
  }

  var id: String {
    title
  }

  var title: String {
    switch self {
    case .feed:
      return "Library"
    case .profile:
      return LocalText.genericProfile
    }
  }

  var image: Image {
    switch self {
    case .feed:
      return Image(systemName: "book")
    case .profile:
      return Image(systemName: "person.circle")
    }
  }

  var listLabel: some View {
    Label { Text(title) } icon: { image.renderingMode(.template) }
  }

  func hash(into hasher: inout Hasher) {
    hasher.combine(id)
  }
}
