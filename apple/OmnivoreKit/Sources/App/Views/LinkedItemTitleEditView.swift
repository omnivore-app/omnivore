import Models
import Services
import SwiftUI

struct LinkedItemTitleEditView: View {
  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
//  @StateObject var viewModel = LabelsViewModel()

  let item: LinkedItem

  var body: some View {
    Text(item.title ?? "unknown item")
  }
}
