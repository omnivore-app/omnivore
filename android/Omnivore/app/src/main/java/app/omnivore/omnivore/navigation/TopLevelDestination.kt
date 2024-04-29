package app.omnivore.omnivore.navigation

import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.designsystem.icon.OmnivoreIcons

enum class TopLevelDestination(
    val selectedIcon: Int,
    val unselectedIcon: Int,
    val iconTextId: Int,
    val titleTextId: Int,
    val route: String,
) {
    FOLLOWING(
        selectedIcon = OmnivoreIcons.Following,
        unselectedIcon = OmnivoreIcons.FollowingEmpty,
        iconTextId = R.string.following,
        titleTextId = R.string.following,
        route = Routes.Following.route
    ),
    INBOX(
        selectedIcon = OmnivoreIcons.Inbox,
        unselectedIcon = OmnivoreIcons.InboxEmpty,
        iconTextId = R.string.inbox,
        titleTextId = R.string.inbox,
        route = Routes.Inbox.route
    ),
    PROFILE(
        selectedIcon = OmnivoreIcons.Profile,
        unselectedIcon = OmnivoreIcons.ProfileEmpty,
        iconTextId = R.string.profile,
        titleTextId = R.string.profile,
        route = Routes.Settings.route
    ),
}
