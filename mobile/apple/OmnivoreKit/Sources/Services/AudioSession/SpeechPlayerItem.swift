//
//  SpeechPlayerItem.swift
//
//
//  Created by Jackson Harper on 11/9/22.
//

import AVFoundation
import Foundation

import Models

// Somewhat based on: https://github.com/neekeetab/CachingPlayerItem/blob/master/CachingPlayerItem.swift
class SpeechPlayerItem: AVPlayerItem {
  let resourceLoaderDelegate = ResourceLoaderDelegate() // swiftlint:disable:this weak_delegate
  let session: AudioController
  let speechItem: SpeechItem
  var speechMarks: [SpeechMark]?
  var prefetchOperation: PrefetchSpeechItemOperation?

  let completed: () -> Void

  var observer: Any?

  // swiftlint:disable:next line_length
  init(session: AudioController, prefetchQueue: OperationQueue, speechItem: SpeechItem, completed: @escaping () -> Void) {
    self.speechItem = speechItem
    self.session = session
    self.completed = completed

    guard let fakeUrl = URL(string: "app.omnivore.speech://\(speechItem.localAudioURL.path).mp3") else {
      fatalError("internal inconsistency")
    }

    let asset = AVURLAsset(url: fakeUrl)
    asset.resourceLoader.setDelegate(resourceLoaderDelegate, queue: DispatchQueue.main)

    super.init(asset: asset, automaticallyLoadedAssetKeys: nil)

    resourceLoaderDelegate.owner = self

    self.observer = observe(\.status, options: [.new]) { item, _ in
      DispatchQueue.main.async {
        if item.status == .readyToPlay {
          let duration = CMTimeGetSeconds(item.duration)
          item.session.updateDuration(forItem: item.speechItem, newDuration: duration)
        }
      }
    }

    NotificationCenter.default.addObserver(
      forName: NSNotification.Name.AVPlayerItemDidPlayToEndTime,
      object: self, queue: OperationQueue.main
    ) { [weak self] _ in
      guard let self = self else { return }
      self.completed()
      self.checkPrefetchQueue(prefetchQueue: prefetchQueue)
    }

    self.prefetchOperation = PrefetchSpeechItemOperation(speechItem: speechItem)
    if let prefetchOperation = self.prefetchOperation {
      prefetchQueue.addOperation(prefetchOperation)
      prefetchOperation.completionBlock = {
        self.checkPrefetchQueue(prefetchQueue: prefetchQueue)
      }
    }
  }

  func checkPrefetchQueue(prefetchQueue: OperationQueue) {
    DispatchQueue.main.async {
      if self.speechItem.audioIdx > self.session.currentAudioIndex + 5 {
        // prefetch has gotten too far ahead of the audio. Pause the prefetch queue
        prefetchQueue.isSuspended = true
      }
      if self.speechItem.audioIdx < self.session.currentAudioIndex + 5 {
        prefetchQueue.isSuspended = false
      }
    }
  }

  deinit {
    observer = nil
    prefetchOperation?.cancel()
    resourceLoaderDelegate.session?.invalidateAndCancel()
  }

  open func download() {
    if resourceLoaderDelegate.session == nil {
      resourceLoaderDelegate.startDataRequest(with: speechItem.urlRequest)
    }
  }

  @objc func playbackStalledHandler() {
    print("playback stalled...")
  }

  class ResourceLoaderDelegate: NSObject, AVAssetResourceLoaderDelegate {
    var session: URLSession?
    var mediaData: Data?
    var pendingRequests = Set<AVAssetResourceLoadingRequest>()
    weak var owner: SpeechPlayerItem?

    func resourceLoader(
      _: AVAssetResourceLoader,
      shouldWaitForLoadingOfRequestedResource loadingRequest: AVAssetResourceLoadingRequest
    ) -> Bool {
      if owner == nil {
        return true
      }

      if session == nil {
        guard let initialUrl = owner?.speechItem.urlRequest else {
          fatalError("internal inconsistency")
        }

        startDataRequest(with: initialUrl)
      }

      pendingRequests.insert(loadingRequest)
      processPendingRequests()
      return true
    }

    func startDataRequest(with _: URLRequest) {
      let configuration = URLSessionConfiguration.default
      configuration.requestCachePolicy = .reloadIgnoringLocalAndRemoteCacheData
      session = URLSession(configuration: configuration)

      Task {
        guard let speechItem = self.owner?.speechItem else {
          // This probably can't happen, but if it does, just returning should
          DispatchQueue.main.async {
            self.processPlaybackError(error: BasicError.message(messageText: "No speech item found."))
          }
          return
        }

        do {
          // swiftlint:disable:next line_length
          let speechData = try await SpeechSynthesizer.download(speechItem: speechItem, session: self.session ?? URLSession.shared)

          DispatchQueue.main.async {
            if speechData == nil {
              self.session = nil
              self.processPlaybackError(error: BasicError.message(messageText: "Unable to download speech data."))
              return
            }

            if let owner = self.owner, let speechData = speechData {
              owner.speechMarks = speechData.speechMarks
            }
            self.mediaData = speechData?.audioData

            self.processPendingRequests()
          }
        } catch URLError.cancelled {
          print("cancelled request error being ignored")
        } catch {
          DispatchQueue.main.async {
            self.processPlaybackError(error: error)
          }
        }
      }
    }

    func resourceLoader(_: AVAssetResourceLoader, didCancel loadingRequest: AVAssetResourceLoadingRequest) {
      pendingRequests.remove(loadingRequest)
    }

    func processPendingRequests() {
      let requestsFulfilled = Set<AVAssetResourceLoadingRequest>(pendingRequests.compactMap {
        self.fillInContentInformationRequest($0.contentInformationRequest)
        if self.haveEnoughDataToFulfillRequest($0.dataRequest!) {
          $0.finishLoading()
          return $0
        }
        return nil
      })

      // remove fulfilled requests from pending requests
      _ = requestsFulfilled.map { self.pendingRequests.remove($0) }
    }

    func processPlaybackError(error: Error?) {
      let requestsFulfilled = Set<AVAssetResourceLoadingRequest>(pendingRequests.compactMap {
        $0.finishLoading(with: error)
        return nil
      })

      _ = requestsFulfilled.map { self.pendingRequests.remove($0) }
    }

    // swiftlint:disable:next line_length
    func fillInContentInformationRequest(_ contentInformationRequest: AVAssetResourceLoadingContentInformationRequest?) {
      contentInformationRequest?.contentType = UTType.mp3.identifier

      if let mediaData = mediaData {
        contentInformationRequest?.isByteRangeAccessSupported = true
        contentInformationRequest?.contentLength = Int64(mediaData.count)
      }
    }

    func haveEnoughDataToFulfillRequest(_ dataRequest: AVAssetResourceLoadingDataRequest) -> Bool {
      let requestedOffset = Int(dataRequest.requestedOffset)
      let requestedLength = dataRequest.requestedLength
      let currentOffset = Int(dataRequest.currentOffset)

      guard let songDataUnwrapped = mediaData,
            songDataUnwrapped.count > currentOffset
      else {
        // Don't have any data at all for this request.
        return false
      }

      let bytesToRespond = min(songDataUnwrapped.count - currentOffset, requestedLength)
      let range = Range(uncheckedBounds: (currentOffset, currentOffset + bytesToRespond))
      let dataToRespond = songDataUnwrapped.subdata(in: range)
      dataRequest.respond(with: dataToRespond)

      return songDataUnwrapped.count >= requestedLength + requestedOffset
    }

    deinit {
      session?.invalidateAndCancel()
    }
  }
}
