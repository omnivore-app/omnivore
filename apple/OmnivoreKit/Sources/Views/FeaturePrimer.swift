//
//  File.swift
//
//
//  Created by Jackson Harper on 12/7/22.
//

import Foundation
import SwiftUI

public struct FeaturePrimer: View {
  let isBeta: Bool
  let title: String
  let message: String
  @Environment(\.dismiss) private var dismiss

  public var body: some View {
    VStack(spacing: 0) {
      VStack(alignment: .leading) {
        Text(title)
          .font(.textToSpeechRead)
          .foregroundColor(Color.appGrayTextContrast)
          .frame(maxWidth: .infinity, alignment: .leading)

        if isBeta {
          HStack {
            TextChip(text: "¡ Beta !", color: Color.red)
              .frame(alignment: .leading)
            TextChip(text: "¡ New Feature !", color: Color.green)
              .frame(alignment: .leading)
          }
        }
      }

      ScrollView {
        Text((try? AttributedString(markdown: message,
                                    options: AttributedString.MarkdownParsingOptions(interpretedSyntax: .inlineOnlyPreservingWhitespace))) ?? "")
          .foregroundColor(Color.appGrayText)
          .accentColor(.blue)
          .padding(.bottom, 16)
      }
      .padding(.top, 16)

      Spacer()

      Button(action: {
        dismiss()
      }, label: { Text("Dismiss") })
        .buttonStyle(PlainButtonStyle())
    }.padding()
  }

  public static var recommendationsPrimer: some View {
    FeaturePrimer(
      isBeta: true,
      title: "Introducing Recommendation Groups",
      message: """
      Recommendation groups make it easy to share great reads with friends and co-workers.

      To get started, create a Recommendation Group from the profile page and invite some friends.

      *During the beta you can create a max of three groups. Group sizes are limited to 12 people.*

      [Learn more about groups](https://blog.omnivore.app/p/dca38ba4-8a74-42cc-90ca-d5ffa5d075cc)

      """
    )
  }
}
