package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.CreateLabelMutation
import app.omnivore.omnivore.graphql.generated.SetLabelsMutation
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import app.omnivore.omnivore.graphql.generated.type.SetLabelsInput

suspend fun Networker.updateLabelsForSavedItem(input: SetLabelsInput): Boolean {
  return try {
    val result = authenticatedApolloClient().mutation(SetLabelsMutation(input)).execute()
    return result.data?.setLabels?.onSetLabelsSuccess?.labels != null
  } catch (e: java.lang.Exception) {
    false
  }
}

suspend fun Networker.createNewLabel(input: CreateLabelInput): CreateLabelMutation.Label? {
  return try {
    val result = authenticatedApolloClient().mutation(CreateLabelMutation(input)).execute()
    return result.data?.createLabel?.onCreateLabelSuccess?.label
  } catch (e: java.lang.Exception) {
    null
  }
}
