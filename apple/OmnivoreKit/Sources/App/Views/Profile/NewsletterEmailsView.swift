import Models
import Services
import SwiftUI
import Transmission
import Views

@MainActor final class NewsletterEmailsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var emails = [NewsletterEmail]()

  @Published var showOperationToast = false
  @Published var operationStatus: OperationStatus = .none
  @Published var operationMessage: String?

  func loadEmails(dataService: DataService) async {
    isLoading = true

    do {
      let objectIDs = try await dataService.newsletterEmails()
      await dataService.viewContext.perform { [weak self] in
        self?.emails = objectIDs.compactMap { dataService.viewContext.object(with: $0) as? NewsletterEmail }
      }
    } catch {
      print("ERROR LOADING EMAILS: ", error)
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

  func updateEmail(dataService: DataService, email: NewsletterEmail, folder: String? = nil, description: String? = nil) async {
    operationMessage = "Updating email..."
    operationStatus = .isPerforming
    do {
      _ = try await dataService.updateNewsletterEmail(
        emailID: email.unwrappedEmailId,
        folder: folder,
        description: description
      )
      await loadEmails(dataService: dataService)
      operationMessage = "Email updated"
      operationStatus = .success
    } catch {
      operationMessage = "Failed to update email"
      operationStatus = .failure
    }
  }
}

struct NewsletterEmailsView: View {
  @EnvironmentObject var dataService: DataService
  @Environment(\.dismiss) private var dismiss

  @StateObject var viewModel = NewsletterEmailsViewModel()

  @State var snackbarOperation: SnackbarOperation?

  var body: some View {
    Group {
      WindowLink(level: .alert, transition: .move(edge: .bottom), isPresented: $viewModel.showOperationToast) {
        OperationToast(operationMessage: $viewModel.operationMessage, showOperationToast: $viewModel.showOperationToast, operationStatus: $viewModel.operationStatus)
      } label: {
        EmptyView()
      }.buttonStyle(.plain)

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
    .onReceive(NotificationCenter.default.publisher(for: Notification.Name("ScrollToTop"))) { _ in
      dismiss()
    }
    .task { await viewModel.loadEmails(dataService: dataService) }
    .refreshable {
      Task {
        await viewModel.loadEmails(dataService: dataService)
      }
    }
  }

  private var innerBody: some View {
    Group {
      if !viewModel.emails.isEmpty {
        ForEach(viewModel.emails) { email in
          Section {
            NewsletterEmailRow(viewModel: viewModel, email: email, folderSelection: email.folder ?? "inbox")
          }
        }
      }

      Section {
        Text(LocalText.newslettersDescription)
        Button(
          action: {
            Task { await viewModel.createEmail(dataService: dataService) }
          },
          label: {
            Label(title: {
              Text(LocalText.createNewEmailMessage)
            }, icon: {
              Image.addLink
            })
          }
        )
        .disabled(viewModel.isLoading)
      }
    }
    .navigationTitle(LocalText.emailsGeneric)
  }
}

struct NewsletterEmailRow: View {
  @StateObject var viewModel: NewsletterEmailsViewModel
  @EnvironmentObject var dataService: DataService

  @State var email: NewsletterEmail
  @State var folderSelection: String

  var body: some View {
    VStack {
      HStack {
        Text(email.unwrappedEmail).bold()
        Spacer()

        Button(
          action: {
            #if os(iOS)
              UIPasteboard.general.string = email.email
            #endif

            #if os(macOS)
              let pasteBoard = NSPasteboard.general
              pasteBoard.clearContents()
              pasteBoard.writeObjects([newsletterEmail.unwrappedEmail as NSString])
            #endif

            Snackbar.show(message: "Address copied", undoAction: nil, dismissAfter: 2000)
          },
          label: {
            Text("Copy")
          }
        )
      }
      Divider()
      Picker("Destination Folder", selection: $folderSelection) {
        Text("Inbox").tag("inbox")
        Text("Following").tag("following")
      }
      .pickerStyle(MenuPickerStyle())
      .onChange(of: folderSelection) { newValue in
        Task {
          viewModel.showOperationToast = true
          await viewModel.updateEmail(dataService: dataService, email: email, folder: newValue)
          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1500)) {
            viewModel.showOperationToast = false
          }
        }
      }
    }
  }
}

