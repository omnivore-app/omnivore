package app.omnivore.omnivore.core.network

import app.omnivore.omnivore.graphql.generated.TypeaheadSearchQuery
import app.omnivore.omnivore.core.database.entities.TypeaheadCardData

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
