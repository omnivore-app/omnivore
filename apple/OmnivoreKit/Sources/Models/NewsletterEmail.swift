import Foundation

public struct NewsletterEmail: Identifiable {
  public let id = UUID()
  public let emailId: String
  public let email: String
  public let confirmationCode: String?

  public init(emailId: String, email: String, confirmationCode: String?) {
    self.emailId = emailId
    self.email = email
    self.confirmationCode = confirmationCode
  }
}
