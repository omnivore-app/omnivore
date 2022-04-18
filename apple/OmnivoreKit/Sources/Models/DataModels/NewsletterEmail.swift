import Foundation

public extension NewsletterEmail {
  var unwrappedEmailId: String {
    emailId ?? ""
  }

  var unwrappedEmail: String {
    email ?? ""
  }
}
