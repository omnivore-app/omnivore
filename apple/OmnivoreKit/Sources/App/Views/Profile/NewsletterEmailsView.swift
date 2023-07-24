import Models
import PopupView
import Services
import SwiftUI
import Views

@MainActor final class NewsletterEmailsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var emails = [NewsletterEmail]()

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

struct NewsletterEmailsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = NewsletterEmailsViewModel()

  @State var showSnackbar = false
  @State var snackbarOperation: SnackbarOperation?

  func snackbar(message: String) {
    snackbarOperation = SnackbarOperation(message: message, undoAction: nil)
    showSnackbar = true
  }

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
    .popup(isPresented: $showSnackbar) {
      if let operation = snackbarOperation {
        Snackbar(isShowing: $showSnackbar, operation: operation)
      } else {
        EmptyView()
      }
    } customize: {
      $0
        .type(.toast)
        .autohideIn(2)
        .position(.bottom)
        .animation(.spring())
        .closeOnTapOutside(true)
    }
  }

  private var innerBody: some View {
    Group {
      Section(footer: Text(LocalText.newslettersDescription)) {
        Button(
          action: {
            Task { await viewModel.createEmail(dataService: dataService) }
          },
          label: {
            HStack {
              Image(systemName: "plus.circle.fill").foregroundColor(.green)
              Text(LocalText.createNewEmailMessage)
              Spacer()
            }
          }
        )
        .disabled(viewModel.isLoading)
      }

      if !viewModel.emails.isEmpty {
        Section(header: Text(LocalText.newsletterEmailsExisting)) {
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

                snackbar(message: "Email copied")
              },
              label: { Text(newsletterEmail.unwrappedEmail) }
            )
          }
        }
      }
    }

    .navigationTitle(LocalText.emailsGeneric)
  }
}
