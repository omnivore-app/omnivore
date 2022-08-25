package app.omnivore.omnivore

object Constants {
  const val demoProdURL = "https://api-demo.omnivore.app"
  const val dataStoreName = "omnivore-datastore"
}

object DatastoreKeys {
  const val omnivoreAuthToken =  "omnivoreAuthToken"
  const val omnivoreAuthCookieString =  "omnivoreAuthCookieString"
}

object AppleConstants {
  const val clientId = "app.omnivore"
  const val redirectURI = "https://api-demo.omnivore.app/api/auth/vercel/apple-redirect"
  const val scope = "name%20email"
  const val authUrl = "https://appleid.apple.com/auth/authorize"
  const val tokenUrl = "https://appleid.apple.com/auth/token"
}
