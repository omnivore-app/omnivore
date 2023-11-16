import Foundation
import SwiftUI

struct CustomTabBar: View {
  @Binding var selectedTab: String
  @Namespace var animation
  var body: some View {
    HStack(spacing: 0) {
      TabBarButton(key: "following", image: Image.tabFollowing, selectedTab: $selectedTab, animation: animation)
      TabBarButton(key: "inbox", image: Image.tabLibrary, selectedTab: $selectedTab, animation: animation)
      TabBarButton(key: "profile", image: Image.tabHighlights, selectedTab: $selectedTab, animation: animation)
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
  var animation: Namespace.ID

  var body: some View {
    Button(action: {
      withAnimation(.spring()) {
        selectedTab = key
      }
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
