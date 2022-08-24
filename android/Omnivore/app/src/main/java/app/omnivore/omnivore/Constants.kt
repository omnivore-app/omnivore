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
  const val redirectURI = "MY_REDIRECT_URI"
  const val scope = "name%20email"
  const val authUrl = "https://appleid.apple.com/auth/authorize"
  const val tokenUrl = "https://appleid.apple.com/auth/token"
}

//clientId="app.omnivore"
//scope="name email"
//state="web:login"
//redirectURI={appleAuthRedirectURI}
//responseMode="form_post"
//responseType="code id_token"
//designProp={{
//    color: 'black',
//    width: 261,
//    height: 40,
//    type: 'continue',
//}}
