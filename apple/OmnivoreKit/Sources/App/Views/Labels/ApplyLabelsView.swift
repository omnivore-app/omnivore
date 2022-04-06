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
            if viewModel.selectedLabelsForItemInContext.isEmpty {
              Text("No labels are currently assigned.")
            }
            ForEach(viewModel.selectedLabelsForItemInContext, id: \.self) { label in
              HStack {
                TextChip(feedItemLabel: label)
                Spacer()
                Button(
                  action: {
                    withAnimation {
                      viewModel.removeLabelFromItem(label)
                    }
                  },
                  label: { Image(systemName: "trash").foregroundColor(.appGrayTextContrast) }
                )
              }
            }
          }
          Section(header: Text("Available Labels")) {
            ForEach(viewModel.unselectedLabelsForItemInContext, id: \.self) { label in
              HStack {
                TextChip(feedItemLabel: label)
                Spacer()
                Button(
                  action: {
                    withAnimation {
                      viewModel.addLabelToItem(label)
                    }
                  },
                  label: { Image(systemName: "plus").foregroundColor(.appGrayTextContrast) }
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
                  Text("Create a new Label").foregroundColor(.appGrayTextContrast)
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
              label: { Text("Cancel").foregroundColor(.appGrayTextContrast) }
            )
          }
          ToolbarItem(placement: .navigationBarTrailing) {
            Button(
              action: {
                viewModel.saveItemLabelChanges(itemID: item.id, dataService: dataService) { labels in
                  commitLabelChanges(labels)
                  presentationMode.wrappedValue.dismiss()
                }
              },
              label: { Text("Save").foregroundColor(.appGrayTextContrast) }
            )
          }
        }
        .sheet(isPresented: $viewModel.showCreateEmailModal) {
          CreateLabelView(viewModel: viewModel)
        }
      }
    }
    .onAppear {
      viewModel.loadLabels(dataService: dataService, item: item)
    }
  }
}
