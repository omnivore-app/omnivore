import Models
import Services
import SwiftUI
import Views

let ZWSP = "\u{200B}"

@MainActor
protocol Entry {
  func item(parent: LabelsEntryView) -> AnyView
}

@MainActor
private struct LabelEntry: Entry {
  let label: LinkedItemLabel

  func item(parent _: LabelsEntryView) -> AnyView {
    if let name = label.name, let hex = label.color, let color = Color(hex: hex) {
      return AnyView(LibraryItemLabelView(text: name, color: color))
    }
    return AnyView(EmptyView())
  }
}

@MainActor
public struct LabelsEntryView: View {
  @Binding var searchTerm: String
  @Binding var isFocused: Bool
  @State var viewModel: LabelsViewModel
  @EnvironmentObject var dataService: DataService

  let entries: [Entry]

  @State private var totalHeight = CGFloat.zero
  @FocusState private var textFieldFocused: Bool

  public init(
    searchTerm: Binding<String>,
    isFocused: Binding<Bool>,
    viewModel: LabelsViewModel
  ) {
    self._searchTerm = searchTerm
    self._isFocused = isFocused

    self.viewModel = viewModel
    self.entries = Array(viewModel.selectedLabels.map { LabelEntry(label: $0) })
  }

  func onTextSubmit() {
    let index = searchTerm.index(searchTerm.startIndex, offsetBy: 1)
    let trimmed = searchTerm.suffix(from: index).lowercased()

    if trimmed.count < 1 {
      return
    }

    if let label = viewModel.labels.first(where: { $0.name?.lowercased() == trimmed }) {
      if !viewModel.selectedLabels.contains(label) {
        viewModel.selectedLabels.append(label)
      }

      searchTerm = ZWSP
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
        textFieldFocused = true
      }
    } else {
      viewModel.createLabel(
        dataService: dataService,
        name: trimmed,
        color: Gradient.randomColor(str: trimmed, offset: 1),
        description: nil
      )
      searchTerm = ZWSP
      DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
        textFieldFocused = true
      }
    }
  }

  var textFieldString: NSAttributedString {
    #if os(iOS)
      NSAttributedString(
        string: searchTerm,
        attributes: [
          NSAttributedString.Key.font: UIFont.systemFont(ofSize: 14)
        ]
      )
    #else
      NSAttributedString(
        string: searchTerm,
        attributes: [
          NSAttributedString.Key.font: NSFont.systemFont(ofSize: 14)
        ]
      )
    #endif
  }

  var deletableTextField: some View {
    // Round it up to avoid jitter when typing
    let textWidth = max(25.0, Double(Int(textFieldString.size().width + 1)))
    let result = TextField("", text: $searchTerm)
      .frame(alignment: .topLeading)
      .frame(height: 25)
      .frame(width: textWidth)
      .padding(5)
      .accentColor(.blue)
      .font(Font.system(size: 14))
      .multilineTextAlignment(.leading)
      .onChange(of: searchTerm, perform: { _ in
        if searchTerm.count >= 64 {
          searchTerm = String(searchTerm.prefix(64))
        }
        if searchTerm.isEmpty {
          if viewModel.selectedLabels.count > 0 {
            viewModel.selectedLabels.removeLast()
            searchTerm = ZWSP
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
              textFieldFocused = true
            }
          } else {
            searchTerm = ZWSP
          }
        }
      })
      .onSubmit {
        onTextSubmit()
      }
    #if os(macOS)
      .textFieldStyle(.plain)
      .background(Color.clear)
    #endif
    return result
  }

//  func onTextDelete() -> Bool { if searchTerm.isEmpty {
//    if lastSelected {
//      if viewModel.selectedLabels.count > 0 {
//        viewModel.selectedLabels.removeLast()
//        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(500)) {
//          textFieldFocused = true
//        }
//      }
//    } else {
//      lastSelected = true
//    }
//    return true
//  }
//  return false
//  }

  public var body: some View {
    // HStack(spacing: 0) {
    VStack {
      GeometryReader { geometry in
        self.generateLabelsContent(in: geometry)
      }
    }.padding(0)
      .frame(height: totalHeight)
      .background(Color.extensionPanelBackground)
      .cornerRadius(8)
      .onAppear {
        textFieldFocused = true
      }
      .onTapGesture {
        textFieldFocused = true
      }
      .transaction { $0.animation = nil }
      .onChange(of: textFieldFocused) { self.isFocused = $0 }
  }

  private func generateLabelsContent(in geom: GeometryProxy) -> some View {
    var width = CGFloat.zero
    var height = CGFloat.zero

    return ZStack(alignment: .topLeading) {
      ForEach(Array(self.entries.enumerated()), id: \.offset) { _, entry in
        entry.item(parent: self)
          .padding(5)
          .alignmentGuide(.leading, computeValue: { dim in
            if abs(width - dim.width) > geom.size.width {
              width = 0
              height -= dim.height
            }
            let result = width
            width -= dim.width
            return result
          })
          .alignmentGuide(.top, computeValue: { _ in
            let result = height
            return result
          })
      }

      deletableTextField
        .alignmentGuide(.leading, computeValue: { dim in
          if abs(width - dim.width) > geom.size.width {
            width = 0
            height -= dim.height
          }
          let result = width
          width = 0
          return result
        })
        .alignmentGuide(.top, computeValue: { _ in
          let result = height
          height = 0
          return result
        }).focused($textFieldFocused)
    }.background(viewHeightReader($totalHeight))
  }

  private func viewHeightReader(_ binding: Binding<CGFloat>) -> some View {
    GeometryReader { geometry -> Color in
      let rect = geometry.frame(in: .local)
      DispatchQueue.main.async {
        binding.wrappedValue = rect.size.height
      }
      return .clear
    }
  }
}
