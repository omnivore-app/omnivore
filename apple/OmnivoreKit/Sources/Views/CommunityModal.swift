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
  Thank you for being a member of the Omnivore Community.

  Omnivore is a free and open-source project and relies on \
  help from our community to grow. Below are a few simple \
  things you can do to help us build a better Omnivore.
  """

  public init() {}

//  var body: some View {
//          ZStack {
//              Image("Biz-card_2020")
//                  .resizable()
//                  .edgesIgnoringSafeArea(.all)
//              closeButton
//          }
//      }

  var closeButton: some View {
    VStack {
      HStack {
        Spacer()
        Button(action: {
          dismiss()
        }) {
          Image(systemName: "xmark.circle")
            .padding(10)
        }
      }
      .padding(.top, 5)
      Spacer()
    }
  }

  public var header: some View {
    VStack(spacing: 0) {
      Text("Help build the Omnivore Community")
        .font(.textToSpeechRead)
        .foregroundColor(Color.appGrayTextContrast)
        .frame(maxWidth: .infinity, alignment: .leading)

      HStack {
        TextChip(text: "Help Wanted", color: Color.appBackground)
          .frame(alignment: .leading)
        TextChip(text: "Community", color: Color.green)
          .frame(alignment: .leading)
      }
      .padding(.top, 10)
      .frame(maxWidth: .infinity, alignment: .leading)
    }
  }

  let links = [
    (title: "Tweet about Omnivore", url: tweetUrl),
    (title: "Follow us on Twitter", url: "https://twitter.com/omnivoreapp"),
    (title: "Join us on Discord", url: "https://discord.gg/h2z5rppzz9"),
    (title: "Star on GitHub", url: "https://github.com/omnivore-app/omnivore")
  ]

  var buttonLinks: some View {
    VStack(spacing: 15) {
      Button(action: {
        if let scene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
          SKStoreReviewController.requestReview(in: scene)
        }
      }, label: { Text("Review on the AppStore") })
        .frame(maxWidth: .infinity, alignment: .leading)

      ForEach(links, id: \.url) { link in
        if let url = URL(string: link.url) {
          Link(link.title, destination: url)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
      }
    }.frame(maxWidth: .infinity, alignment: .leading)
  }

  public var body: some View {
    VStack(spacing: 0) {
      header

      Text((try? AttributedString(markdown: message,
                                  options: AttributedString.MarkdownParsingOptions(interpretedSyntax: .inlineOnlyPreservingWhitespace))) ?? "")
        .multilineTextAlignment(.leading)
        .foregroundColor(Color.appGrayTextContrast)
        .accentColor(.blue)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 16)

      Spacer()

      buttonLinks

      Spacer()

      Button(action: {
        dismiss()
      }, label: { Text("Dismiss") })
        .buttonStyle(PlainButtonStyle())
        .padding(.bottom, 16)
        .frame(alignment: .bottom)
    }.padding()
  }
}
