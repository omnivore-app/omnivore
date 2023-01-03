package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.ViewerQuery
import app.omnivore.omnivore.persistence.entities.Viewer

suspend fun Networker.viewer(): Viewer? {
  try {
    val result = authenticatedApolloClient().query(ViewerQuery()).execute()
    val me = result.data?.me

    return if (me != null) {
      Viewer(
        id = me.id,
        name = me.name,
        username = me.profile.username,
        pictureUrl = me.profile.pictureUrl
      )
    } else {
      null
    }
  } catch (e: java.lang.Exception) {
    return null
  }
}
