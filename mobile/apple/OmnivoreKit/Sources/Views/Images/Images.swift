import SwiftUI

public extension Image {
  static var smallOmnivoreLogo: Image { Image("_smallOmnivoreLogo", bundle: .module) }
  static var coloredSmallOmnivoreLogo: Image { Image("app-icon", bundle: .module) }
  static var omnivoreTitleLogo: Image { Image("_omnivoreTitleLogo", bundle: .module) }
  static var googleIcon: Image { Image("_googleIcon", bundle: .module) }

  static var dotsThree: Image { Image("_dots-three", bundle: .module) }

  static var tabFollowing: Image { Image("_tab_following", bundle: .module).renderingMode(.template) }
  static var tabLibrary: Image { Image("_tab_library", bundle: .module).renderingMode(.template) }
  static var tabDigest: Image { Image("_tab_digest", bundle: .module).renderingMode(.template) }
  static var tabDigestSelected: Image { Image("_tab_digest_selected", bundle: .module) }

  static var tabSearch: Image { Image("_tab_search", bundle: .module).renderingMode(.template) }
  static var tabHighlights: Image { Image("_tab_highlights", bundle: .module).renderingMode(.template) }
  static var tabProfile: Image { Image("_tab_profile", bundle: .module).renderingMode(.template) }

  static var toolbarArchive: Image { Image("toolbar-archive", bundle: .module).renderingMode(.template) }
  static var toolbarUnarchive: Image { Image("toolbar-unarchive", bundle: .module).renderingMode(.template) }

  static var toolbarShare: Image { Image("toolbar-share", bundle: .module).renderingMode(.template) }
  static var toolbarTrash: Image { Image("toolbar-trash", bundle: .module).renderingMode(.template) }

  static var pinRotated: Image { Image("pin-rotated", bundle: .module) }

  static var chevronRight: Image { Image("chevron-right", bundle: .module) }
  static var notebook: Image { Image("notebook", bundle: .module) }
  static var headphones: Image { Image("headphones", bundle: .module) }

  static var audioPlay: Image { Image("header-play", bundle: .module) }
  static var audioPause: Image { Image("header-pause", bundle: .module) }
  static var readerSettings: Image { Image("reader-settings", bundle: .module) }
  static var utilityMenu: Image { Image("utility-menu", bundle: .module) }

  static var relaxedSlothLight: Image {
    Color.isDarkMode ? Image("relaxed-sloth-dark", bundle: .module) : Image("relaxed-sloth-light", bundle: .module)
  }

  static var addLink: Image { Image("add-link", bundle: .module) }
  static var selectMultiple: Image { Image("select-multiple", bundle: .module) }
  static var magnifyingGlass: Image { Image("magnifying-glass", bundle: .module) }

  static var archive: Image { Image("archive", bundle: .module) }
  static var unarchive: Image { Image("unarchive", bundle: .module) }
  static var remove: Image { Image("remove", bundle: .module) }
  static var label: Image { Image("label", bundle: .module) }

  static var flairFeed: Image { Image("flair-feed", bundle: .module) }
  static var flairFavorite: Image { Image("flair-favorite", bundle: .module) }

  static var flairNewsletter: Image { Image("flair-newsletter", bundle: .module) }
  static var flairPinned: Image { Image("flair-pinned", bundle: .module) }
  static var flairRecommended: Image { Image("flair-recommended", bundle: .module) }
  static var flairDigest: Image { Image("flair-digest", bundle: .module) }

  static var doubleChevronUp: Image { Image("double_chevron_up", bundle: .module) }

}
