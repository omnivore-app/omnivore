//
//  based on: LabelsMasonaryView.swift we should try to combine the two

import Foundation
import Models
import SwiftUI

struct LabelsFlowLayout: View {
  @State private var totalHeight = CGFloat.zero
  private var labelItems: [LinkedItemLabel]

  init(
    labels: [LinkedItemLabel]
  ) {
    self.labelItems = labels
  }

  var body: some View {
    VStack {
      GeometryReader { geometry in
        self.generateContent(in: geometry)
      }
    }.padding(0)
      .frame(height: totalHeight)
  }

  private func generateContent(in geom: GeometryProxy) -> some View {
    var width = CGFloat.zero
    var height = CGFloat.zero

    return ZStack(alignment: .topLeading) {
      ForEach(Array(self.labelItems.enumerated()), id: \.offset) { _, label in
        self.item(for: label)
          .padding(.trailing, 5)
          .padding(.bottom, 5)
          .alignmentGuide(.leading, computeValue: { dim in
            if abs(width - dim.width) > geom.size.width {
              width = 0
              height -= dim.height
            }
            let result = width
            if label == self.labelItems.last! {
              width = 0 // last item
            } else {
              width -= dim.width
            }
            return result
          })
          .alignmentGuide(.top, computeValue: { _ in
            let result = height
            if label == self.labelItems.last! {
              height = 0 // last item
            }
            return result
          })
      }
    }.background(viewHeightReader($totalHeight))
  }

  private func item(for item: LinkedItemLabel) -> some View {
    LibraryItemLabelView(text: item.name!, color: Color(hex: item.color!)!)
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
