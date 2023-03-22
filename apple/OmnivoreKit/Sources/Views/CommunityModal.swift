//
//  CommunityModal.swift
//
//
//  Created by Jackson Harper on 12/7/22.
//

#if os(iOS)
  import Foundation
  import StoreKit
  import SwiftUI

  // swiftlint:disable:next line_length
  let tweetUrl = "https://twitter.com/intent/tweet?text=I%20recently%20started%20using%20@OmnivoreApp%20as%20a%20free,%20open-source%20read-it-later%20app.%20Check%20it%20out:%20https://omnivore.app"

  public struct CommunityModal: View {
    @Environment(\.dismiss) private var dismiss

    let message: String = """
    Thank you for being a member of the Omnivore Community.

    Omnivore is a free and open-source project and relies on \
    help from our community to grow. Below are a few simple \
    things you can do to help us build a better Omnivore.

    If you would like to financially assist Omnivore \
    please [contribute on Open Collective](https://opencollective.com/omnivore).
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
          Button {
            dismiss()
          } label: {
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
        Text(LocalText.communityHeadline)
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
      (title: LocalText.communityTweet, url: tweetUrl),
      (title: LocalText.communityFollowTwitter, url: "https://twitter.com/omnivoreapp"),
      (title: LocalText.communityJoinDiscord, url: "https://discord.gg/h2z5rppzz9"),
      (title: LocalText.communityStarGithub, url: "https://github.com/omnivore-app/omnivore")
    ]

    var buttonLinks: some View {
      VStack(spacing: 15) {
        Button(action: {
          // swiftlint:disable:next line_length
          if let scene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
          }
        }, label: { Text(LocalText.communityAppstoreReview) })
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

        let parsedMessage = try? AttributedString(markdown: message,
                                                  options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace))
        Text(parsedMessage ?? "")
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
        }, label: { Text(LocalText.dismissButton) })
          .buttonStyle(PlainButtonStyle())
          .padding(.bottom, 16)
          .frame(alignment: .bottom)
      }.padding()
    }
  }
#endif
