package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.SearchQuery
import app.omnivore.omnivore.graphql.generated.TypeaheadSearchQuery
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.persistence.entities.TypeaheadCardData
import com.apollographql.apollo3.api.Optional

data class SearchQueryResponse(
    val cursor: String?,
    val cardsData: List<TypeaheadCardData>
)

suspend fun Networker.typeaheadSearch(
    query: String
): SearchQueryResponse {
    try {
        val result = authenticatedApolloClient().query(
            TypeaheadSearchQuery(query)
        ).execute()

        val itemList = result.data?.typeaheadSearch?.onTypeaheadSearchSuccess?.items ?: listOf()

        val cardsData = itemList.map {
            TypeaheadCardData(
                savedItemId = it.id,
                slug = it.slug,
                title = it.title,
                isArchived = false,
            )
        }

        return SearchQueryResponse(null, cardsData)
    } catch (e: java.lang.Exception) {
        return SearchQueryResponse(null, listOf())
    }
}
