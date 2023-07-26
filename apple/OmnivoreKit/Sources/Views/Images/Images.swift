import SwiftUI

public extension Image {
  static var smallOmnivoreLogo: Image { Image("_smallOmnivoreLogo", bundle: .module) }
  static var omnivoreTitleLogo: Image { Image("_omnivoreTitleLogo", bundle: .module) }
  static var googleIcon: Image { Image("_googleIcon", bundle: .module) }

  static var homeTab: Image { Image("BookmarksSimple", bundle: .module) }
  static var homeTabSelected: Image { Image("_homeTabSelected", bundle: .module) }
  static var profileTab: Image { Image("_profileTab", bundle: .module) }
  static var profileTabSelected: Image { Image("_profileTabSelected", bundle: .module) }
  static var dotsThree: Image { Image("_dots-three", bundle: .module) }

  static var tabSubscriptions: Image { Image("_tab_subscriptions", bundle: .module).renderingMode(.template) }
  static var tabLibrary: Image { Image("_tab_library", bundle: .module).renderingMode(.template) }
  static var tabBriefing: Image { Image("_tab_briefing", bundle: .module).renderingMode(.template) }
  static var tabHighlights: Image { Image("_tab_highlights", bundle: .module).renderingMode(.template) }

  static var pinRotated: Image { Image("pin-rotated", bundle: .module) }

  static var chevronRight: Image { Image("chevron-right", bundle: .module) }
  static var notebook: Image { Image("notebook", bundle: .module) }
  static var headphones: Image { Image("headphones", bundle: .module) }
  static var readerSettings: Image { Image("reader-settings", bundle: .module) }
  static var utilityMenu: Image { Image("utility-menu", bundle: .module) }

  static var archive: Image { Image("archive", bundle: .module) }
  static var unarchive: Image { Image("unarchive", bundle: .module) }
  static var remove: Image { Image("remove", bundle: .module) }
  static var label: Image { Image("label", bundle: .module) }
}
