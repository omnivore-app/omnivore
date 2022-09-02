package app.omnivore.omnivore

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.DocumentsContract
import android.provider.MediaStore
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.net.toUri
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import java.io.File
import java.io.FileOutputStream
import java.net.URL


class FileDownloadWorker(
  private val context: Context,
  workerParameters: WorkerParameters
): CoroutineWorker(context, workerParameters) {

  override suspend fun doWork(): Result {
    val fileUrl = inputData.getString(FileParams.KEY_FILE_URL) ?: ""
    val fileName = inputData.getString(FileParams.KEY_FILE_NAME) ?: ""
    val fileType = inputData.getString(FileParams.KEY_FILE_TYPE) ?: ""

    Log.d("TAG", "doWork: $fileUrl | $fileName | $fileType")

    if (fileName.isEmpty() || fileType.isEmpty() || fileUrl.isEmpty()) {
      Result.failure()
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val name = NotificationConstants.CHANNEL_NAME
      val description = NotificationConstants.CHANNEL_DESCRIPTION
      val importance = NotificationManager.IMPORTANCE_HIGH
      val channel = NotificationChannel(NotificationConstants.CHANNEL_ID, name, importance)
      channel.description = description

      val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?

      notificationManager?.createNotificationChannel(channel)
    }

    val builder = NotificationCompat.Builder(context,NotificationConstants.CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_launcher_foreground)
      .setContentTitle("Downloading your file...")
      .setOngoing(true)
      .setProgress(0,0,true)

    NotificationManagerCompat.from(context).notify(NotificationConstants.NOTIFICATION_ID, builder.build())

    val uri = getSavedFileUri(
      fileName = fileName,
      fileType = fileType,
      fileUrl = fileUrl,
      context = context
    )

    NotificationManagerCompat.from(context).cancel(NotificationConstants.NOTIFICATION_ID)
    return if (uri != null) {

      val docId = DocumentsContract.getDocumentId(uri)
      val split = docId.split(":").toTypedArray()
      val type = split[0]

//      Log.d("loggo",)

      val path = Environment.getExternalStorageDirectory().toString() + "/" + split[1]


      Result.success(workDataOf(FileParams.KEY_FILE_URI to path))
    } else {
      Result.failure()
    }
  }

  private fun getSavedFileUri(
    fileName: String,
    fileType: String,
    fileUrl: String,
    context: Context
  ): Uri? {
    val mimeType = when(fileType){
      "PDF" -> "application/pdf"
      "PNG" -> "image/png"
      "MP4" -> "video/mp4"
      else -> ""
    }

    if (mimeType.isEmpty()) return null

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q){
      val contentValues = ContentValues().apply {
        put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
        put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
        put(MediaStore.MediaColumns.RELATIVE_PATH, "Download/DownloaderDemo")
      }

      val resolver = context.contentResolver

      val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)

      return if (uri != null) {
        URL(fileUrl).openStream().use { input ->
          resolver.openOutputStream(uri).use { output ->
            input.copyTo(output!!, DEFAULT_BUFFER_SIZE)
          }
        }
        uri
      } else {
        null
      }
    } else {
      val target = File(
        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
        fileName
      )
      URL(fileUrl).openStream().use { input->
        FileOutputStream(target).use { output ->
          input.copyTo(output)
        }
      }

      return target.toUri()
    }
  }

  object FileParams {
    const val KEY_FILE_URL = "key_file_url"
    const val KEY_FILE_TYPE = "key_file_type"
    const val KEY_FILE_NAME = "key_file_name"
    const val KEY_FILE_URI = "key_file_uri"
  }

  object NotificationConstants {
    const val CHANNEL_NAME = "download_file_worker_demo_channel"
    const val CHANNEL_DESCRIPTION = "download_file_worker_demo_description"
    const val CHANNEL_ID = "download_file_worker_demo_channel_123456"
    const val NOTIFICATION_ID = 1
  }
}

data class File(
  val id: String,
  val name: String,
  val type: String,
  val url: String,
  var downloadedUri: String? = null,
  var isDownloading:Boolean = false,
)
