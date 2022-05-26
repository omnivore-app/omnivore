import Models
import Services
import SwiftUI
import Views

@MainActor final class SubscriptionsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var emails = [NewsletterEmail]()

  func loadSubscriptions(dataService _: DataService) async {
    isLoading = true

//    if let subscriptions = try? await dataService.subscriptions() {
//      await dataService.viewContext.perform { [weak self] in
//        self?.emails = objectIDs.compactMap { dataService.viewContext.object(with: $0) as? NewsletterEmail }
//      }
//    }

    isLoading = false
  }

  func loadEmails(dataService: DataService) async {
    isLoading = true

    if let objectIDs = try? await dataService.newsletterEmails() {
      await dataService.viewContext.perform { [weak self] in
        self?.emails = objectIDs.compactMap { dataService.viewContext.object(with: $0) as? NewsletterEmail }
      }
    }

    isLoading = false
  }

  func createEmail(dataService: DataService) async {
    isLoading = true

    if let objectID = try? await dataService.createNewsletter() {
      await dataService.viewContext.perform { [weak self] in
        if let item = dataService.viewContext.object(with: objectID) as? NewsletterEmail {
          self?.emails.insert(item, at: 0)
        }
      }
    }

    isLoading = false
  }
}

struct SubscriptionsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = SubscriptionsViewModel()
  let footerText = "Add PDFs to your library, or subscribe to emails using an Omnivore email address."

  var body: some View {
    Group {
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
    .task { await viewModel.loadEmails(dataService: dataService) }
  }

  private var innerBody: some View {
    Group {
      Section(footer: Text(footerText)) {
        Button(
          action: {
            Task { await viewModel.createEmail(dataService: dataService) }
          },
          label: {
            HStack {
              Image(systemName: "plus.circle.fill").foregroundColor(.green)
              Text("Create a new email address")
              Spacer()
            }
          }
        )
        .disabled(viewModel.isLoading)
      }

      if !viewModel.emails.isEmpty {
        Section(header: Text("Existing Emails (Tap to copy)")) {
          ForEach(viewModel.emails) { newsletterEmail in
            Button(
              action: {
                #if os(iOS)
                  UIPasteboard.general.string = newsletterEmail.email
                #endif

                #if os(macOS)
                  let pasteBoard = NSPasteboard.general
                  pasteBoard.clearContents()
                  pasteBoard.writeObjects([newsletterEmail.unwrappedEmail as NSString])
                #endif

                Snackbar.show(message: "Email copied")
              },
              label: { Text(newsletterEmail.unwrappedEmail) }
            )
          }
        }
      }
    }
    .navigationTitle("Emails")
  }
}
