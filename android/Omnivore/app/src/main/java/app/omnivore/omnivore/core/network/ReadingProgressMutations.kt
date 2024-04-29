package app.omnivore.omnivore.core.network


import android.util.Log
import app.omnivore.omnivore.graphql.generated.SaveArticleReadingProgressMutation
import app.omnivore.omnivore.graphql.generated.type.SaveArticleReadingProgressInput
import com.apollographql.apollo3.api.Optional

data class ReadingProgressParams(
    val id: String?,
    val readingProgressPercent: Double?,
    val readingProgressAnchorIndex: Int?,
    val force: Boolean?
) {
    fun asSaveReadingProgressInput() = SaveArticleReadingProgressInput(
        id = id ?: "",
        force = Optional.presentIfNotNull(force),
        readingProgressPercent = readingProgressPercent ?: 0.0,
        readingProgressAnchorIndex = Optional.presentIfNotNull(readingProgressAnchorIndex ?: 0)
    )
}

suspend fun Networker.updateReadingProgress(params: ReadingProgressParams): Boolean {
    try {
        val input = params.asSaveReadingProgressInput()

        Log.d("Loggo", "created reading progress input: $input")

        val result = authenticatedApolloClient().mutation(SaveArticleReadingProgressMutation(input))
            .execute()

        val articleID =
            result.data?.saveArticleReadingProgress?.onSaveArticleReadingProgressSuccess?.updatedArticle?.id

        Log.d("Loggo", "updated article with id: $articleID")

        return articleID != null
    } catch (e: java.lang.Exception) {
        return false
    }
}
