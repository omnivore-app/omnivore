//
//  LabelsMasonaryView.swift
//
//
//  Created by Jackson Harper on 11/9/22.
//

import Foundation
import SwiftUI

import Models
import Views

@MainActor
struct LabelsMasonaryView: View {
  var onLabelTap: (LinkedItemLabel, TextChip) -> Void

  @State private var totalHeight = CGFloat.zero
  private var labelItems: [(label: LinkedItemLabel, selected: Bool)]

  init(
    labels allLabels: [LinkedItemLabel],
    selectedLabels: [LinkedItemLabel],
    onLabelTap: @escaping (LinkedItemLabel, TextChip) -> Void
  ) {
    self.onLabelTap = onLabelTap

    let selected = selectedLabels.map { (label: $0, selected: true) }
    let unselected = allLabels.filter { !selectedLabels.contains($0) }.map { (label: $0, selected: false) }
    labelItems = (selected + unselected).sorted(by: { left, right in
      let aTrimmed = left.label.unwrappedName.trimmingCharacters(in: .whitespaces)
      let bTrimmed = right.label.unwrappedName.trimmingCharacters(in: .whitespaces)
      return aTrimmed.caseInsensitiveCompare(bTrimmed) == .orderedAscending
    })
  }

  var body: some View {
    VStack {
      GeometryReader { geometry in
        self.generateContent(in: geometry)
      }
    }.padding(5)
      .frame(height: totalHeight)
  }

  private func generateContent(in geom: GeometryProxy) -> some View {
    var width = CGFloat.zero
    var height = CGFloat.zero

    return ZStack(alignment: .topLeading) {
      ForEach(self.labelItems, id: \.label.self) { label in
        self.item(for: label)
          .padding(.horizontal, 5)
          .padding(.vertical, 5)
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
    }
    .background(viewHeightReader($totalHeight))
  }

  private func item(for item: (label: LinkedItemLabel, selected: Bool)) -> some View {
    let chip = TextChip(feedItemLabel: item.label, negated: false, checked: item.selected, padded: true) { chip in
      onLabelTap(item.label, chip)
    }
    return chip
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
