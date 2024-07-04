package app.omnivore.omnivore.core.network

import android.os.Environment
import android.widget.Toast
import androidx.core.app.ActivityCompat
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.database.entities.Highlight
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.graphql.generated.SearchQuery
import com.apollographql.apollo3.api.Optional
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import android.Manifest
import android.content.Context
import android.content.Context.MODE_PRIVATE
import android.net.Uri
import android.util.Log
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.FileProvider
import androidx.core.net.toUri
import app.omnivore.omnivore.graphql.generated.type.ContentReader
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.net.URL
import java.nio.file.Files
import java.nio.file.StandardCopyOption

data class LibrarySearchQueryResponse(
    val cursor: String?, val items: List<LibrarySearchItem>
)

data class LibrarySearchItem(
    val item: SavedItem, val labels: List<SavedItemLabel>, val highlights: List<Highlight>
)

suspend fun Networker.search(
    context: Context,
    cursor: String? = null, limit: Int = 15, query: String
): LibrarySearchQueryResponse {
    try {
        val result = authenticatedApolloClient().query(
            SearchQuery(
                after = Optional.presentIfNotNull(cursor),
                first = Optional.presentIfNotNull(limit),
                query = Optional.presentIfNotNull(query)
            )
        ).execute()

        val newCursor = result.data?.search?.onSearchSuccess?.pageInfo?.endCursor
        val itemList = result.data?.search?.onSearchSuccess?.edges ?: listOf()

        val searchItems = itemList.map {
            saveLibraryItemContentToFile(context, it.node.id, it.node.contentReader, it.node.content, it.node.url)
            LibrarySearchItem(item = SavedItem(
                savedItemId = it.node.id,
                title = it.node.title,
                folder = it.node.folder,
                createdAt = it.node.createdAt as String,
                savedAt = it.node.savedAt as String,
                readAt = it.node.readAt as String?,
                updatedAt = it.node.updatedAt as String?,
                readingProgress = it.node.readingProgressPercent,
                readingProgressAnchor = it.node.readingProgressAnchorIndex,
                imageURLString = it.node.image,
                pageURLString = it.node.url,
                descriptionText = it.node.description,
                publisherURLString = it.node.originalArticleUrl,
                siteName = it.node.siteName,
                author = it.node.author,
                publishDate = it.node.publishedAt as String?,
                slug = it.node.slug,
                isArchived = it.node.isArchived,
                contentReader = it.node.contentReader.rawValue,
                wordsCount = it.node.wordsCount
            ), labels = (it.node.labels ?: listOf()).map { label ->
                SavedItemLabel(
                    savedItemLabelId = label.labelFields.id,
                    name = label.labelFields.name,
                    color = label.labelFields.color,
                    createdAt = label.labelFields.createdAt as String?,
                    labelDescription = null
                )
            }, highlights = (it.node.highlights ?: listOf()).map { highlight ->
                Highlight(
                    highlightId = highlight.highlightFields.id,
                    type = highlight.highlightFields.type.toString(),
                    annotation = highlight.highlightFields.annotation,
                    createdByMe = highlight.highlightFields.createdByMe,
                    patch = highlight.highlightFields.patch,
                    prefix = highlight.highlightFields.prefix,
                    quote = highlight.highlightFields.quote,
                    serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue,
                    shortId = highlight.highlightFields.shortId,
                    suffix = highlight.highlightFields.suffix,
                    updatedAt = highlight.highlightFields.updatedAt as String?,
                    createdAt = highlight.highlightFields.createdAt as String?,
                    color = highlight.highlightFields.color,
                    highlightPositionPercent = highlight.highlightFields.highlightPositionPercent,
                    highlightPositionAnchorIndex = highlight.highlightFields.highlightPositionAnchorIndex
                )
            })
        }

        return LibrarySearchQueryResponse(
            cursor = newCursor, items = searchItems
        )
    } catch (e: java.lang.Exception) {
        return LibrarySearchQueryResponse(null, listOf())
    }
}

//
private fun writeToInternalStorage(context: Context, content: String, fileName: String) {
    try {
        context.openFileOutput(fileName, MODE_PRIVATE).use { outputStream ->
            outputStream.write(content.toByteArray())
            outputStream.flush()
            Log.d("FileWrite", "File written successfully to internal storage.")
        }
    } catch (e: Exception) {
        Log.e("FileWrite", "Error writing file", e)
        throw e
    }
}

private fun readFromInternalStorage(context: Context, fileName: String): String? {
    return try {
        context.openFileInput(fileName).bufferedReader().useLines { lines ->
            lines.fold("") { some, text ->
                "$some\n$text"
            }
        }
    } catch (e: Exception) {
        Log.e("FileRead", "Error reading file", e)
        null
    }
}

fun getUriForInternalFile(context: Context, fileName: String): Uri {
    val file = File(context.filesDir, fileName)
    return file.toUri()
}


suspend fun saveLibraryItemContentToFile(context: Context, libraryItemId: String, contentReader: ContentReader, content: String?, contentUrl: String?): Boolean {
    return try {
        var localPDFPath: String? = null
        if (contentReader == ContentReader.PDF) {
            val localPDFPath = "${libraryItemId}.pdf"
            val file = File(context.filesDir, localPDFPath)
            if (file.exists()) {
                // TODO: there should really be a checksum check here
                Log.d("PDF", "SKIPPING DOWNLOAD FOR LOCAL PDF PATH: ${localPDFPath}")
                return true
            }
            withContext(Dispatchers.IO) {
                val urlStream: InputStream = URL(contentUrl).openStream()
                context.openFileOutput(localPDFPath, Context.MODE_PRIVATE).use { outputStream ->
                    urlStream.use { inputStream ->
                        inputStream.copyTo(outputStream)
                    }
                }
                Log.d("PDF", "File written successfully to internal storage.")
            }
            Log.d("PDF", "DOWNLOADING PDF TO LOCAL PDF PATH: ${localPDFPath}")
            true
        } else {
            content?.let { content ->
                writeToInternalStorage(context, content = content, fileName = "${libraryItemId}.html", )
                return true
            }
            false
        }
    } catch (e: Exception) {
        e.printStackTrace()
        false
    }
}

fun loadLibraryItemContent(context: Context, libraryItemId: String): String? {
    return try {
        return readFromInternalStorage(context = context, fileName = "${libraryItemId}.html")
    } catch (e: Exception) {
        null
    }
}
