import SwiftUI

struct EmailsView: View {
  let footerText = "Add PDFs to your library, or subscribe to emails using an Omnivore email address."

  @State var emails = [String]()

  var body: some View {
    #if os(iOS)
      Form {
        innerBody
      }
    #elseif os(macOS)
      List {
        innerBody
      }
      .listStyle(InsetListStyle())
    #endif
  }

  private var innerBody: some View {
    Group {
      Section(footer: Text(footerText)) {
        Button(
          action: {
            withAnimation {
              emails.insert("newemail@omnivore-relay.app\(emails.count)", at: 0)
            }
          },
          label: {
            HStack {
              Image(systemName: "plus.circle.fill").foregroundColor(.green)
              Text("Create a new email address")
              Spacer()
            }
          }
        )
      }

      if !emails.isEmpty {
        Section(header: Text("Existing Emails (Tap to copy)")) {
          ForEach(emails, id: \.self) { email in
            Button(
              action: {},
              label: { Text(email) }
            )
          }
        }
      }
    }
    .navigationTitle("Emails")
  }
}
