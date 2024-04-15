import Foundation
import SwiftUI

struct CustomTabBar: View {
  let displayTabs: [String]
  @Binding var selectedTab: String

  var body: some View {
    HStack(spacing: 0) {
      if displayTabs.contains("following") {
        TabBarButton(key: "following",
                     image: Image.tabFollowing,
                     selectedTab: $selectedTab,
                     selectionColor: Color(hex: "EE8232"))
      }
      if displayTabs.contains("digest") {
        TabBarButton(key: "digest",
                     image: Image.tabDigest,
                     selectedTab: $selectedTab,
                     selectedImage: Image.tabDigestSelected)
      }
      if displayTabs.contains("inbox") {
        TabBarButton(key: "inbox",
                     image: Image.tabLibrary,
                     selectedTab: $selectedTab)
      }
      if displayTabs.contains("profile") {
        TabBarButton(key: "profile", image: Image.tabProfile, selectedTab: $selectedTab)
      }
    }
    .padding(.top, 10)
    .padding(.bottom, 10)
    .background(Color.themeTabBarColor)
  }
}

struct TabBarButton: View {
  let key: String
  let image: Image
  @Binding var selectedTab: String
  var selectedImage: Image?
  var selectionColor: Color?

  var body: some View {
    Button(action: {
      if selectedTab == key {
        NotificationCenter.default.post(Notification(name: Notification.Name("ScrollToTop")))
      }
      selectedTab = key
    }, label: {
     tabImage
        .frame(width: 28, height: 28)
        .frame(maxWidth: .infinity)
    }).buttonStyle(.plain)
  }
  
  var tabImage: some View {
    if let selectedImage = selectedImage, selectedTab == key {
      return AnyView(selectedImage
        .resizable()
        .aspectRatio(contentMode: .fit))
    } else {
      return AnyView(image
        .foregroundColor(selectedTab == key ? selectionColor ?? Color.blue  : Color.themeTabButtonColor))
    }
  }
}
