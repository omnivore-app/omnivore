import Foundation

func cardShouldHideUrl(_ url: String?) -> Bool {
  if let url = url, let origin = URL(string: url)?.host {
    let hideHosts = ["storage.googleapis.com", "omnivore.app"]
    if hideHosts.contains(origin) {
      return true
    }
  }

  return false
}

func cardSiteName(_ originalArticleUrl: String?) -> String? {
  if cardShouldHideUrl(originalArticleUrl) {
    return nil
  }

  if let url = originalArticleUrl,
     let originalHost = URL(string: url)?.host?.replacingOccurrences(of: "^www\\.", with: "", options: .regularExpression)
  {
    return originalHost
  }

  return nil
}
