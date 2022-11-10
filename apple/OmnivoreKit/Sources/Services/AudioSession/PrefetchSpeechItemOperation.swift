//
//  PrefetchSpeechItemOperation.swift
//
//
//  Created by Jackson Harper on 11/9/22.
//

import Foundation
import Models
import Utils

final class PrefetchSpeechItemOperation: Operation, URLSessionDelegate {
  let speechItem: SpeechItem
  let session: URLSession

  enum State: Int {
    case created
    case started
    case finished
  }

  init(speechItem: SpeechItem) {
    self.speechItem = speechItem
    self.state = .created

    let configuration = URLSessionConfiguration.default
    configuration.requestCachePolicy = .reloadIgnoringLocalAndRemoteCacheData
    self.session = URLSession(configuration: configuration)
  }

  public var state: State = .created {
    willSet {
      willChangeValue(forKey: "isReady")
      willChangeValue(forKey: "isExecuting")
      willChangeValue(forKey: "isFinished")
      willChangeValue(forKey: "isCancelled")
    }
    didSet {
      didChangeValue(forKey: "isCancelled")
      didChangeValue(forKey: "isFinished")
      didChangeValue(forKey: "isExecuting")
      didChangeValue(forKey: "isReady")
    }
  }

  override var isAsynchronous: Bool {
    true
  }

  override var isReady: Bool {
    true
  }

  override var isExecuting: Bool {
    self.state == .started
  }

  override var isFinished: Bool {
    self.state == .finished
  }

  override func start() {
    guard !isCancelled else { return }
    state = .started

    Task {
      _ = try await SpeechSynthesizer.download(speechItem: speechItem, session: session)
      state = .finished
    }
  }

  override func cancel() {
    session.invalidateAndCancel()
    super.cancel()
  }
}
