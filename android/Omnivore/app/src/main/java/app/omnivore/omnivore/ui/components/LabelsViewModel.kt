package app.omnivore.omnivore.ui.components


import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat.startActivity
import androidx.lifecycle.*
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.dataService.*
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import app.omnivore.omnivore.graphql.generated.type.SetLabelsInput
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.persistence.entities.SavedItemAndSavedItemLabelCrossRef
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.components.LabelSwatchHelper
import app.omnivore.omnivore.ui.library.SavedItemAction
import com.apollographql.apollo3.api.Optional.Companion.presentIfNotNull
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.distinctUntilChanged
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.*
import javax.inject.Inject


@HiltViewModel
class LabelsViewModel @Inject constructor(
    private val datastoreRepo: DatastoreRepository,
    private val dataService: DataService,
    private val networker: Networker
): ViewModel() {

    fun createNewSavedItemLabelWithTemp(labelName: String, hexColorValue: String): SavedItemLabel {
        val tempId = UUID.randomUUID().toString()
        val res = SavedItemLabel(
            savedItemLabelId = tempId,
            name = labelName,
            labelDescription = "",
            color = hexColorValue,
            createdAt = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC).format(
                DateTimeFormatter.ISO_DATE_TIME
            ),
            serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue
        )

        viewModelScope.launch {
            withContext(Dispatchers.IO) {
                dataService.db.savedItemLabelDao().insertAll(listOf(res))

                val newLabel = networker.createNewLabel(CreateLabelInput(color = presentIfNotNull(res.color), name = res.name))
                if (newLabel != null) {
                    try {
                        dataService.db.savedItemLabelDao().updateTempLabel(tempId, newLabel.id)
                    } catch (e: Exception) {
                        Log.d("EXCEPTION: ", e.toString())
                    }
                }
            }
        }

        return res
    }
}
