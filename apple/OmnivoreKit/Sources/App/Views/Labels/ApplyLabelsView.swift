import Models
import Services
import SwiftUI
import Views

struct ApplyLabelsView: View {
  let item: FeedItem
  let commitLabelChanges: ([FeedItemLabel]) -> Void

  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
  @StateObject var viewModel = LabelsViewModel()

  var body: some View {
    NavigationView {
      if viewModel.isLoading {
        EmptyView()
      } else {
        List {
          Section(header: Text("Assigned Labels")) {
            if viewModel.selectedLabels.isEmpty {
              Text("No labels are currently assigned.")
            }
            ForEach(viewModel.selectedLabels, id: \.self) { label in
              HStack {
                TextChip(feedItemLabel: label)
                Spacer()
                Button(
                  action: {
                    withAnimation {
                      viewModel.removeLabel(label)
                    }
                  },
                  label: { Image(systemName: "trash") }
                )
              }
            }
          }
          Section(header: Text("Available Labels")) {
            ForEach(viewModel.unselectedLabels, id: \.self) { label in
              HStack {
                TextChip(feedItemLabel: label)
                Spacer()
                Button(
                  action: {
                    withAnimation {
                      viewModel.addLabel(label)
                    }
                  },
                  label: { Image(systemName: "plus") }
                )
              }
            }
          }
          Section {
            Button(
              action: { viewModel.showCreateEmailModal = true },
              label: {
                HStack {
                  Image(systemName: "plus.circle.fill").foregroundColor(.green)
                  Text("Create a new Label")
                  Spacer()
                }
              }
            )
            .disabled(viewModel.isLoading)
          }
        }
        .navigationTitle("Assign Labels")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .navigationBarLeading) {
            Button(
              action: { presentationMode.wrappedValue.dismiss() },
              label: { Text("Cancel") }
            )
          }
          ToolbarItem(placement: .navigationBarTrailing) {
            Button(
              action: {
                viewModel.saveChanges(itemID: item.id, dataService: dataService) { labels in
                  commitLabelChanges(labels)
                  presentationMode.wrappedValue.dismiss()
                }
              },
              label: { Text("Save") }
            )
          }
        }
        .sheet(isPresented: $viewModel.showCreateEmailModal) {
          CreateLabelView(viewModel: viewModel)
        }
      }
    }
    .onAppear {
      viewModel.load(item: item, dataService: dataService)
    }
  }
}
