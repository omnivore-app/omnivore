//
//  File.swift
//
//
//  Created by Jackson Harper on 12/8/23.
//

import Foundation
import NaturalLanguage

public func extractFirstFewWords(_ title: String) -> String {
  let languageRecognizer = NLLanguageRecognizer()

  languageRecognizer.processString(title)
  let language = languageRecognizer.dominantLanguage ?? NLLanguage.english

  let tokenizer = NLTokenizer(unit: .word)
  tokenizer.setLanguage(language)
  tokenizer.string = title

  var words: [String] = []
  tokenizer.enumerateTokens(in: title.startIndex ..< title.endIndex) { range, _ in
    let word = String(title[range])
    words.append(word)
    return true
  }

  print("WORDS: ", words)
  let truncatedTitle = words.prefix(2).joined(separator: " ")
  return truncatedTitle
}
