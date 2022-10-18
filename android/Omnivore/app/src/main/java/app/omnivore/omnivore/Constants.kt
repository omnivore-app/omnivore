package app.omnivore.omnivore

import app.omnivore.omnivore.ui.reader.WebFont

object Constants {
  const val apiURL = BuildConfig.OMNIVORE_API_URL
  const val webURL = BuildConfig.OMNIVORE_WEB_URL
  const val dataStoreName = "omnivore-datastore"
}

object DatastoreKeys {
  const val omnivoreAuthToken =  "omnivoreAuthToken"
  const val omnivoreAuthCookieString =  "omnivoreAuthCookieString"
  const val omnivorePendingUserToken =  "omnivorePendingUserToken"
  const val preferredWebFontSize = "preferredWebFontSize"
  const val preferredWebLineHeight = "preferredWebLineHeight"
  const val preferredWebMaxWidthPercentage = "preferredWebMaxWidthPercentage"
  const val preferredWebFontFamily = "preferredWebFontFamily"
  const val prefersWebHighContrastText = "prefersWebHighContrastText"
}

object AppleConstants {
  const val clientId = "app.omnivore"
  const val redirectURI = BuildConfig.OMNIVORE_API_URL + "/api/mobile-auth/android-apple-redirect"
  const val scope = "name%20email"
  const val authUrl = "https://appleid.apple.com/auth/authorize"
}
