//
//  CommunityModal.swift
//
//
//  Created by Jackson Harper on 12/7/22.
//

import Foundation
import StoreKit
import SwiftUI

let tweetUrl = "https://twitter.com/intent/tweet?text=I%20recently%20started%20using%20@OmnivoreApp%20as%20a%20free,%20open-source%20read-it-later%20app.%20Check%20it%20out:%20https://omnivore.app"

public struct CommunityModal: View {
  @Environment(\.dismiss) private var dismiss

  let message: String = """
  Thank you for being a member of the Omnivore Community. Omnivore relies on help from \
  our community to grow. Below are a few simple things you can do to help us build a better Omnivore.
  """

  public init() {}

  public var body: some View {
    VStack(spacing: 0) {
      VStack(alignment: .leading) {
        Text("Help build the Omnivore Community")
          .font(.textToSpeechRead)
          .foregroundColor(Color.appGrayTextContrast)
          .frame(maxWidth: .infinity, alignment: .leading)

        HStack {
          TextChip(text: "¡ Help Wanted !", color: Color.red)
            .frame(alignment: .leading)
          TextChip(text: "¡ Community !", color: Color.green)
            .frame(alignment: .leading)
        }
      }

      // ScrollView {
      Text((try? AttributedString(markdown: message,
                                  options: AttributedString.MarkdownParsingOptions(interpretedSyntax: .inlineOnlyPreservingWhitespace))) ?? "")
        .foregroundColor(Color.appGrayText)
        .accentColor(.blue)
        .padding(.top, 16)

      Group {
        Button(action: {
          if let scene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
          }
        }, label: { Text("Review on the AppStore") })

        if let url = URL(string: tweetUrl) {
          Link("Tweet about Omnivore", destination: url)
        }

        if let url = URL(string: "https://discord.gg/h2z5rppzz9") {
          Link("Join us on Discord", destination: url)
        }

        if let url = URL(string: "https://github.com/omnivore-app/omnivore") {
          Link("Star on GitHub", destination: url)
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.top, 16)

      Spacer()

      Button(action: {
        dismiss()
      }, label: { Text("Dismiss") })
        .buttonStyle(PlainButtonStyle())
    }.padding()
  }
}
