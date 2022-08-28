package app.omnivore.omnivore

object Constants {
  const val apiURL = BuildConfig.OMNIVORE_API_URL
  const val dataStoreName = "omnivore-datastore"
}

object DatastoreKeys {
  const val omnivoreAuthToken =  "omnivoreAuthToken"
  const val omnivoreAuthCookieString =  "omnivoreAuthCookieString"
}

object AppleConstants {
  const val clientId = "app.omnivore"
  const val redirectURI = "https%3A%2F%2Fapi-demo.omnivore.app%2Fapi%2Fauth%2Fvercel%2Fapple-redirect"
  const val scope = "name%20email"
  const val authUrl = "https://appleid.apple.com/auth/authorize"
}
