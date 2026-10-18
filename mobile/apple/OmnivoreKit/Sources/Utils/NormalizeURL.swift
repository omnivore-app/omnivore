//
//  NormalizeURL.swift
//
//
//  Created by Jackson Harper on 6/2/22.
//

import Foundation

// based losesly on the normalize-url npm package which we use on the backend
public func normalizeURL(_ dirtyURL: String) -> String {
  var urlString = dirtyURL

  urlString = urlString.trimmingCharacters(in: .whitespacesAndNewlines)

  if var urlObject = URLComponents(string: urlString) {
    // Remove auth
    if /* options.stripAuthentication */ true {
      urlObject.user = nil
      urlObject.password = nil
    }

    // Remove hash
    if /* options.stripHash */ true {
      urlObject.fragment = nil
    }

    urlObject.queryItems = urlObject.queryItems?.filter { item in
      !item.name.starts(with: "utm_")
    }

    urlObject.queryItems = urlObject.queryItems?.sorted(by: { first, second in
      first.name <= second.name
    })

    if /* options.removeTrailingSlash */ true {
      urlObject.path = urlObject.path.replacingRegex(pattern: "/$", replaceWith: "")
    }

    if let finalUrl = urlObject.url {
      return finalUrl.absoluteString
    }
  }

  return dirtyURL
}

private extension String {
  func replacingRegex(pattern: String, replaceWith: String = "") -> String {
    do {
      let regex = try NSRegularExpression(pattern: pattern, options: [.caseInsensitive, .anchorsMatchLines])
      let range = NSRange(location: 0, length: utf16.count)
      return regex.stringByReplacingMatches(in: self, options: [], range: range, withTemplate: replaceWith)
    } catch { return self }
  }
}
