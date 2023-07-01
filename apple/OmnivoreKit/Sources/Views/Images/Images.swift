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
  static var tabHighlights: Image { Image("_tab_highlights", bundle: .module).renderingMode(.template) }
}
