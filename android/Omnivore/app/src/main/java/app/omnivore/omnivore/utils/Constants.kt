package app.omnivore.omnivore.utils

import app.omnivore.omnivore.BuildConfig

object Constants {
  const val apiURL = BuildConfig.OMNIVORE_API_URL
  const val dataStoreName = "omnivore-datastore"
}

object AppleConstants {
    const val clientId = "app.omnivore"
    const val redirectURI = BuildConfig.OMNIVORE_API_URL + "/api/mobile-auth/android-apple-redirect"
    const val scope = "name%20email"
    const val authUrl = "https://appleid.apple.com/auth/authorize"
}

const val FORGOT_PASSWORD_URL = "${BuildConfig.OMNIVORE_WEB_URL}/auth/forgot-password"
const val SELF_HOSTING_URL = "https://docs.omnivore.app/self-hosting/self-hosting.html"
