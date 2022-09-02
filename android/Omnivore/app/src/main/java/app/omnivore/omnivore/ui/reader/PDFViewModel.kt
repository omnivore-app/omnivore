package app.omnivore.omnivore.ui.reader

import android.content.Context
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModel
import androidx.work.*
import app.omnivore.omnivore.File
import app.omnivore.omnivore.FileDownloadWorker

// TODO: look into using a state holder here: https://developer.android.com/jetpack/compose/state#managing-state
class PDFViewModel(): ViewModel() {
  fun downloadFile(
    file: File,
    success: (String) -> Unit,
    failed: (String) -> Unit,
    running:() -> Unit,
    context: Context,
    lifecycleOwner: LifecycleOwner
  ) {
    val workManager = WorkManager.getInstance(context)
    val data = Data.Builder()

    data.apply {
      putString(FileDownloadWorker.FileParams.KEY_FILE_NAME, file.name)
      putString(FileDownloadWorker.FileParams.KEY_FILE_URL, file.url)
      putString(FileDownloadWorker.FileParams.KEY_FILE_TYPE, file.type)
    }

    val constraints = Constraints.Builder()
      .setRequiredNetworkType(NetworkType.CONNECTED)
      .setRequiresStorageNotLow(true)
      .setRequiresBatteryNotLow(true)
      .build()

    val fileDownloadWorker = OneTimeWorkRequestBuilder<FileDownloadWorker>()
      .setConstraints(constraints)
      .setInputData(data.build())
      .build()

    workManager.enqueueUniqueWork(
      "oneFileDownloadWork_${System.currentTimeMillis()}",
      ExistingWorkPolicy.KEEP,
      fileDownloadWorker
    )

    workManager.getWorkInfoByIdLiveData(fileDownloadWorker.id)
      .observe(lifecycleOwner) { info->
        info?.let {
          when (it.state) {
            WorkInfo.State.SUCCEEDED -> {
              success(it.outputData.getString(FileDownloadWorker.FileParams.KEY_FILE_URI) ?: "")
            }
            WorkInfo.State.FAILED -> {
              failed("Downloading failed!")
            }
            WorkInfo.State.RUNNING -> {
              running()
            }
            else -> {
              failed("Something went wrong")
            }
          }
        }
      }
  }
}
