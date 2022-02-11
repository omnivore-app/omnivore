//
//  SafariWebExtensionHandler.swift
//  Shared (Extension)
//
//  Created by JacksonH on 10/8/21.
//

import Binders
import os.log
import SafariServices

let SFExtensionMessageKey = "message"

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
  let services = Services()

  func beginRequest(with context: NSExtensionContext) {
    let response = NSExtensionItem()
    let authToken = services.authenticator.authToken
    response.userInfo = [SFExtensionMessageKey: ["authToken": authToken]]
    context.completeRequest(returningItems: [response], completionHandler: nil)
  }
}
