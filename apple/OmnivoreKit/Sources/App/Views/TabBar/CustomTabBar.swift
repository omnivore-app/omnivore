import Foundation
import SwiftUI

struct CustomTabBar: View {
  @Binding var selectedTab: String
  var body: some View {
    HStack(spacing: 0) {
      TabBarButton(key: "following", image: Image.tabFollowing, selectedTab: $selectedTab)
      TabBarButton(key: "inbox", image: Image.tabLibrary, selectedTab: $selectedTab)
      TabBarButton(key: "profile", image: Image.tabProfile, selectedTab: $selectedTab)
    }
    .padding(.top, 10)
    .padding(.bottom, 40)
    .background(Color.themeTabBarColor)
  }
}

struct TabBarButton: View {
  let key: String
  let image: Image
  @Binding var selectedTab: String

  var body: some View {
    Button(action: {
      selectedTab = key
    }, label: {
      image
        .resizable()
        .renderingMode(.template)
        .aspectRatio(contentMode: .fit)
        .frame(width: 28, height: 28)
        .foregroundColor(selectedTab == key ? Color.blue : Color.themeTabButtonColor)

        .frame(maxWidth: .infinity)
    })
  }
}
