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

  #if os(macOS)
    @State var popoverIndex = -1
    @State var presentPopover = false
  #endif

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

  func getSearchTermText() -> String {
    if searchTerm.starts(with: ZWSP) {
      let index = searchTerm.index(searchTerm.startIndex, offsetBy: 1)
      let trimmed = searchTerm.suffix(from: index)
      return String(trimmed)
    }
    return searchTerm
  }

  func onTextSubmit() {
    let trimmed = getSearchTermText()
    if trimmed.count < 1 {
      return
    }

    let lowercased = trimmed.lowercased()
    if let label = viewModel.labels.first(where: { $0.name?.lowercased() == lowercased }) {
      if !viewModel.selectedLabels.contains(label) {
        viewModel.selectedLabels.append(label)
      }

      reset()
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
      reset()
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

  func reset() {
    searchTerm = ZWSP
    #if os(macOS)
      popoverIndex = -1
      presentPopover = false
    #endif
  }

  var deletableTextField: some View {
    // Round it up to avoid jitter when typing
    let textWidth = max(25.0, Double(Int(textFieldString.size().width + 28)))
    var result = AnyView(TextField("", text: $searchTerm)
      .id("deletableTextField")
      .frame(alignment: .topLeading)
      .frame(height: 25)
      .frame(width: textWidth)
      .padding(.trailing, 5)
      .padding(.vertical, 5)
      .padding(EdgeInsets(top: 0, leading: 6, bottom: 0, trailing: 6))
      .cornerRadius(5)
      .accentColor(.blue)
      .font(Font.system(size: 14))
      .multilineTextAlignment(.leading)
      #if os(macOS)
        .textFieldStyle(.plain)
        .background(Color.clear)
      #endif
      .onChange(of: searchTerm, perform: { _ in
        if searchTerm.count >= 64 {
          searchTerm = String(searchTerm.prefix(64))
        }
        if searchTerm.isEmpty {
          if viewModel.selectedLabels.count > 0 {
            viewModel.selectedLabels.removeLast()
            reset()
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
              textFieldFocused = true
            }
          } else {
            reset()
          }
        }
      })
        .onSubmit {
          #if os(iOS)
            onTextSubmit()
          #else
            if popoverIndex == -1 || popoverIndex >= partialMatches.count {
              onTextSubmit()
            } else if popoverIndex >= 0, popoverIndex < partialMatches.count {
              let matched = partialMatches[popoverIndex]
              viewModel.selectedLabels.append(matched)
              reset()
            }
          #endif
        }
        .submitScope())

    #if os(macOS)
      if #available(macOS 14.0, *) {
        result = AnyView(result
          .onKeyPress(.downArrow) {
            popoverIndex = ((popoverIndex + 1) % (partialMatches.count + 1))
            return .handled
          }
          .onKeyPress(.upArrow) {
            popoverIndex -= 1
            return .handled
          }
          .onKeyPress(.tab) {
            popoverIndex = ((popoverIndex + 1) % (partialMatches.count + 1))
            return .handled
          })
      }
    #endif

    return AnyView(result)
  }

  public var body: some View {
    VStack {
      GeometryReader { geometry in
        self.generateLabelsContent(in: geometry)
      }
    }.padding(0)
      .frame(height: totalHeight)
      .frame(maxWidth: .infinity)
      .background(Color.extensionPanelBackground)
    #if os(macOS)
      .onHover { isHovered in
        DispatchQueue.main.async {
          if isHovered {
            NSCursor.iBeam.push()
          } else {
            NSCursor.pop()
          }
        }
      }
    #endif
    .cornerRadius(8)
      .onAppear {
        textFieldFocused = true
      }
      .onTapGesture {
        textFieldFocused = true
      }
      .onChange(of: textFieldFocused) { self.isFocused = $0 }
  }

  var partialMatches: [LinkedItemLabel] {
    viewModel.labels.applySearchFilter(searchTerm)
  }

  #if os(macOS)
    private var createLabelButton: some View {
      let count = partialMatches.count
      return Button {
        viewModel.createLabel(
          dataService: dataService,
          name: searchTerm,
          color: Gradient.randomColor(str: searchTerm, offset: 1),
          description: nil
        )
        reset()
      } label: {
        Text("Create new label")
          .padding(6)
      }
      .background(popoverIndex == count ? Color.blue : Color.clear)
      .frame(maxWidth: .infinity, alignment: .leading)
      .cornerRadius(4)
      .buttonStyle(.borderless)
      .cornerRadius(4)
    }
  #endif

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
      #if os(macOS)
        .onChange(of: searchTerm) { _ in
          presentPopover = !searchTerm.isEmpty && searchTerm != ZWSP && partialMatches.count < 14
          if popoverIndex >= partialMatches.count + 1 {
            popoverIndex = partialMatches.count + 1
          }
        }
        .popover(isPresented: $presentPopover, arrowEdge: .top) {
          VStack(alignment: .leading, spacing: 4) {
            ForEach(Array(partialMatches.enumerated()), id: \.offset) { idx, label in
              if let name = label.name {
                Button {
                  reset()
                  viewModel.selectedLabels.append(label)
                } label: {
                  Text(name)
                    .padding(6)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .background(idx == popoverIndex ? Color.blue : Color.clear)
                .frame(maxWidth: .infinity, alignment: .leading)
                .cornerRadius(4)
                .buttonStyle(.borderless)
                .cornerRadius(4)
              }
            }
            createLabelButton
          }.padding(4)
        }

      #endif
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
