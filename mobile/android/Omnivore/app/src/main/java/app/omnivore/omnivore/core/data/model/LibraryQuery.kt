package app.omnivore.omnivore.core.data.model

data class LibraryQuery(
    val folders: List<String>,
    val allowedArchiveStates: List<Int>,
    val sortKey: String,
    val requiredLabels: List<String>,
    val excludedLabels: List<String>,
    val allowedContentReaders: List<String>
)
