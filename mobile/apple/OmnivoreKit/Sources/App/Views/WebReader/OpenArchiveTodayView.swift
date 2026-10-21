// swiftlint:disable line_length
import Foundation
import Models
import SwiftUI
import Views
import WebKit

struct OpenArchiveTodayView: View {
  let item: Models.LibraryItem

  @State private var date = Date()
  @State private var showSafariBrowser = false
  @AppStorage("OpenArchiveTodayView::useInAppBrowser") var useInAppBrowser = false

  let message = """
   [Archive.today](https://archive.today) is a time capsule for web pages! It takes a 'snapshot' of a webpage that will always be online even if the original page disappears.
  """

  init(item: Models.LibraryItem) {
    self.item = item
    self.date = item.savedAt ?? Date()
  }

  var archiveURL: URL? {
    if let pageURL = item.pageURLString, let savedAt = item.savedAt {
      let dateFormatter = DateFormatter()
      dateFormatter.dateFormat = "yyyy-MM-dd"
      let formattedDate = dateFormatter.string(from: savedAt)

      let str = "https://archive.today/\(formattedDate)/\(pageURL)"
      return URL(string: str)
    }
    return nil
  }

  var innerBody: some View {
    VStack {
      let parsedMessage = try? AttributedString(markdown: message.trimmingCharacters(in: .whitespacesAndNewlines),
                                                options: .init(interpretedSyntax: .inlineOnly))

      Rectangle()
        .fill(Color.secondarySystemGroupedBackground)
        .cornerRadius(10)
        .overlay(
          Text(parsedMessage ?? "")
            .multilineTextAlignment(.leading)
            .foregroundColor(Color.appGrayTextContrast)
            .accentColor(.blue)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(10)
        )

      Spacer()

      DatePicker(
        "Archived Date",
        selection: $date,
        displayedComponents: [.date, .hourAndMinute]
      ).padding(.top, 20)

      Toggle("Use in-app Browser", isOn: $useInAppBrowser)

      Divider().padding(.vertical, 20)

      Button(
        action: {
          if useInAppBrowser {
            showSafariBrowser = true
          } else {
            if let archiveURL = archiveURL {
              UIApplication.shared.open(archiveURL)
            }
          }
        },
        label: { Text("Open on Archive.today").padding(5) }
      )
      .buttonStyle(RoundedRectButtonStyle(color: Color.blue, textColor: Color.white))
      .frame(maxWidth: .infinity)
    }.padding(20)
  }

  var body: some View {
    NavigationView {
      innerBody
        .navigationTitle("Open on Archive.today")
        .navigationBarTitleDisplayMode(.inline)
    }.sheet(isPresented: $showSafariBrowser) {
      if let archiveURL = archiveURL {
        SafariView(url: archiveURL)
          .ignoresSafeArea(.all, edges: .bottom)
      }
    }
  }
}
