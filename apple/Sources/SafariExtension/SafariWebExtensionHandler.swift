import App
import SafariServices
import Services

let SFExtensionMessageKey = "message"

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
  func beginRequest(with context: NSExtensionContext) {
    let response = NSExtensionItem()
    let authToken = PublicValet.authToken
    response.userInfo = [SFExtensionMessageKey: ["authToken": authToken]]
    context.completeRequest(returningItems: [response], completionHandler: nil)
  }
}
