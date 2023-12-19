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
}

struct NewsletterEmailsView: View {
  @EnvironmentObject var dataService: DataService
  @StateObject var viewModel = NewsletterEmailsViewModel()

  @State var showAddressCopied = false
  @State var snackbarOperation: SnackbarOperation?

  var body: some View {
    Group {
      WindowLink(level: .alert, transition: .move(edge: .bottom), isPresented: $showAddressCopied) {
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
          ForEach(viewModel.emails) { email in
            NewsletterEmailRow(viewModel: viewModel, email: email, folderSelection: email.folder)
          }
        }
      }
    }
    .navigationTitle(LocalText.emailsGeneric)
  }
}

struct NewsletterEmailRow: View {
  @StateObject var viewModel: NewsletterEmailsViewModel
  @State var email: NewsletterEmail
  @State var folderSelection: String?

  var body: some View {
    VStack {
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
        label: { Text(email.unwrappedEmail).font(Font.appFootnote) }
      )
      Divider()
      Picker("Destination Folder", selection: $folderSelection) {
        Text("Inbox").tag("inbox")
        Text("Following").tag("following")
      }
      .pickerStyle(MenuPickerStyle())
      .onChange(of: folderSelection) { _ in
//        Task {
//          viewModel.showOperationToast = true
//          await viewModel.updateSubscription(dataService: dataService, subscription: subscription, folder: newValue)
//          DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1500)) {
//            viewModel.showOperationToast = false
//          }
//        }
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
