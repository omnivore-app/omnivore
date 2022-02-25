import Foundation

public class NewsletterEmails {
  public let newsletterEmails: [NewsletterEmail]

  public init(newsletterEmails: [NewsletterEmail]) {
    self.newsletterEmails = newsletterEmails
  }
}

public struct NewsletterEmail {
  public let id: String
  public let email: String
  public let confirmationCode: String?

  public init(id: String, email: String, confirmationCode: String?) {
    self.id = id
    self.email = email
    self.confirmationCode = confirmationCode
  }
}
