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
    return saveReadingProgress(params) != null
}

data class SavedReadingProgress(val percent: Double?, val anchorIndex: Int?)

suspend fun Networker.saveReadingProgress(params: ReadingProgressParams): SavedReadingProgress? {
    try {
        val input = params.asSaveReadingProgressInput()

        Log.d("Loggo", "created reading progress input: $input")

        val result = authenticatedApolloClient().mutation(SaveArticleReadingProgressMutation(input))
            .execute()

        val article =
            result.data?.saveArticleReadingProgress?.onSaveArticleReadingProgressSuccess?.updatedArticle

        Log.d("Loggo", "updated article with id: ${article?.id}")

        return article?.let {
            SavedReadingProgress(it.readingProgressPercent, it.readingProgressAnchorIndex)
        }
    } catch (e: java.lang.Exception) {
        return null
    }
}
