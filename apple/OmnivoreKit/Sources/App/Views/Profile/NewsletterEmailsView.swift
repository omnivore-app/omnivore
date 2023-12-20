import Models
import PopupView
import Services
import SwiftUI
import Transmission
import Views

@MainActor final class NewsletterEmailsViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var showAddressCopied = false
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
  @StateObject var viewModel = NewsletterEmailsViewModel()

  @State var snackbarOperation: SnackbarOperation?

  var body: some View {
    Group {
      WindowLink(level: .alert, transition: .move(edge: .bottom), isPresented: $viewModel.showOperationToast) {
        NewsletterOperationToast(viewModel: viewModel)
      } label: {
        EmptyView()
      }
      WindowLink(level: .alert, transition: .move(edge: .bottom), isPresented: $viewModel.showAddressCopied) {
        MessageToast()
      } label: {
        EmptyView()
      }

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

            viewModel.showAddressCopied = true
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(2000)) {
              viewModel.showAddressCopied = false
            }
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

struct MessageToast: View {
  var body: some View {
    VStack {
      HStack {
        Text("Address copied")
        Spacer()
      }
      .padding(10)
      .frame(minHeight: 50)
      .frame(maxWidth: .infinity)
      .background(Color(hex: "2A2A2A"))
      .cornerRadius(4.0)
      .tint(Color.green)
    }
    .padding(.bottom, 70)
    .padding(.horizontal, 10)
    .ignoresSafeArea(.all, edges: .bottom)
  }
}

struct NewsletterOperationToast: View {
  @ObservedObject var viewModel: NewsletterEmailsViewModel

  var body: some View {
    VStack {
      HStack {
        if viewModel.operationStatus == .isPerforming {
          Text(viewModel.operationMessage ?? "Performing...")
          Spacer()
          ProgressView()
        } else if viewModel.operationStatus == .success {
          Text(viewModel.operationMessage ?? "Success")
          Spacer()
        } else if viewModel.operationStatus == .failure {
          Text(viewModel.operationMessage ?? "Failure")
          Spacer()
          Button(action: { viewModel.showOperationToast = false }, label: {
            Text("Done").bold()
          })
        }
      }
      .padding(10)
      .frame(minHeight: 50)
      .frame(maxWidth: .infinity)
      .background(Color(hex: "2A2A2A"))
      .cornerRadius(4.0)
      .tint(Color.green)
    }
    .padding(.bottom, 70)
    .padding(.horizontal, 10)
    .ignoresSafeArea(.all, edges: .bottom)
  }
}
