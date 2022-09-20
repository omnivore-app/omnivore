package app.omnivore.omnivore.ui.reader

import androidx.lifecycle.ViewModel
import app.omnivore.omnivore.DatastoreRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class WebReaderViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  val testVar = ""
}
