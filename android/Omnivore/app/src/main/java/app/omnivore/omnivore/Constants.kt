package app.omnivore.omnivore

object Constants {
  const val apiURL = BuildConfig.OMNIVORE_API_URL
  const val dataStoreName = "omnivore-datastore"
}

object DatastoreKeys {
  const val omnivoreAuthToken =  "omnivoreAuthToken"
  const val omnivoreAuthCookieString =  "omnivoreAuthCookieString"
  const val omnivorePendingUserToken =  "omnivorePendingUserToken"
  const val libraryLastSyncTimestamp = "libraryLastSyncTimestamp"
  const val preferredWebFontSize = "preferredWebFontSize"
  const val preferredWebLineHeight = "preferredWebLineHeight"
  const val preferredWebMaxWidthPercentage = "preferredWebMaxWidthPercentage"
  const val preferredWebFontFamily = "preferredWebFontFamily"
  const val prefersWebHighContrastText = "prefersWebHighContrastText"
  const val prefersJustifyText = "prefersJustifyText"
  const val lastUsedSavedItemFilter = "lastUsedSavedItemFilter"
  const val lastUsedSavedItemSortFilter = "lastUsedSavedItemSortFilter"
  const val preferredTheme = "preferredTheme"
}

object AppleConstants {
  const val clientId = "app.omnivore"
  const val redirectURI = BuildConfig.OMNIVORE_API_URL + "/api/mobile-auth/android-apple-redirect"
  const val scope = "name%20email"
  const val authUrl = "https://appleid.apple.com/auth/authorize"
}
