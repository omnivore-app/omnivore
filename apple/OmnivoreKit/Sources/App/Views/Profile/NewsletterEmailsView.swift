import Combine
import Models
import Services
import SwiftUI

final class NewsletterEmailsViewModel: ObservableObject {
  private var hasLoadedInitialEmails = false
  @Published var isLoading = false
  @Published var emails = [NewsletterEmail]()

  var subscriptions = Set<AnyCancellable>()

  func loadEmails(dataService: DataService) {
    isLoading = true

    dataService.newsletterEmailsPublisher().sink(
      receiveCompletion: { _ in },
      receiveValue: { [weak self] result in
        self?.isLoading = false
        self?.emails = result
        self?.hasLoadedInitialEmails = true
      }
    )
    .store(in: &subscriptions)
  }

  func createEmail(dataService: DataService) {
    isLoading = true

    dataService.createNewsletterEmailPublisher().sink(
      receiveCompletion: { [weak self] _ in
        self?.isLoading = false
      },
      receiveValue: { [weak self] result in
        self?.isLoading = false
        self?.emails.insert(result, at: 0)
      }
    )
    .store(in: &subscriptions)
  }
}

struct NewsletterEmailsView: View {
  @EnvironmentObject var dataService: DataService
  @ObservedObject var viewModel = NewsletterEmailsViewModel()
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
    .onAppear { viewModel.loadEmails(dataService: dataService) }
  }

  private var innerBody: some View {
    Group {
      Section(footer: Text(footerText)) {
        Button(
          action: {
            viewModel.createEmail(dataService: dataService)
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
                  pasteBoard.writeObjects([newsletterEmail.email as NSString])
                #endif

                NSNotification.operationSuccess(message: "Email copied")
              },
              label: { Text(newsletterEmail.email) }
            )
          }
        }
      }
    }
    .navigationTitle("Emails")
  }
}
