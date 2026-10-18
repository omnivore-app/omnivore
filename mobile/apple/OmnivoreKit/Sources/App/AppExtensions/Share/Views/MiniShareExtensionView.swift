//
//  MiniShareExtensionView.swift
//
//
//  Created by Jackson Harper on 11/6/23.
//

import Foundation
import SwiftUI

struct MiniShareExtensionView: View {
  @StateObject var viewModel: ShareExtensionViewModel
  @StateObject var labelsViewModel: LabelsViewModel
  let extensionContext: NSExtensionContext?

  @State var showToast = true

  var body: some View {
    ProgressView()
  }
}
