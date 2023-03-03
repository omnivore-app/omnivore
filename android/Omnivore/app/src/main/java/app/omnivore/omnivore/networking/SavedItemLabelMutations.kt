package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.SetLabelsMutation
import app.omnivore.omnivore.graphql.generated.type.SetLabelsInput

suspend fun Networker.updateLabelsForSavedItem(input: SetLabelsInput): Boolean {
  return try {
    val result = authenticatedApolloClient().mutation(SetLabelsMutation(input)).execute()
    return result.data?.setLabels?.onSetLabelsSuccess?.labels != null
  } catch (e: java.lang.Exception) {
    false
  }
}
