//
//  ScrollingStackModifier.swift
//  ScrollView_Tests
//
//  Created by Jean-Marc Boullianne on 8/7/20.
//
import SwiftUI

struct ScrollingHStackModifier: ViewModifier {
    
    @State private var scrollOffset: CGFloat
    @State private var dragOffset: CGFloat
    
    var items: Int
    var itemWidth: CGFloat
    var itemSpacing: CGFloat
    
    init(items: Int, itemWidth: CGFloat, itemSpacing: CGFloat) {
        self.items = items
        self.itemWidth = itemWidth
        self.itemSpacing = itemSpacing
        
        // Calculate Total Content Width
        let contentWidth: CGFloat = CGFloat(items) * itemWidth + CGFloat(items - 1) * itemSpacing
        let screenWidth = UIScreen.main.bounds.width
        
        // Set Initial Offset to first Item
        let initialOffset = (contentWidth/2.0) - (screenWidth/2.0) + ((screenWidth - itemWidth) / 2.0)
        
        self._scrollOffset = State(initialValue: initialOffset)
        self._dragOffset = State(initialValue: 0)
    }
    
    func body(content: Content) -> some View {
        content
            .offset(x: scrollOffset + dragOffset, y: 0)
            .gesture(DragGesture()
                .onChanged({ event in
                    dragOffset = event.translation.width
                })
                .onEnded({ event in
                    // Scroll to where user dragged
                    scrollOffset += event.translation.width
                    dragOffset = 0
                    
                    // Now calculate which item to snap to
                    let contentWidth: CGFloat = CGFloat(items) * itemWidth + CGFloat(items - 1) * itemSpacing
                    let screenWidth = UIScreen.main.bounds.width
                    
                    // Center position of current offset
                    let center = scrollOffset + (screenWidth / 2.0) + (contentWidth / 2.0)
                    
                    // Calculate which item we are closest to using the defined size
                    var index = (center - (screenWidth / 2.0)) / (itemWidth + itemSpacing)
                    
                    // Should we stay at current index or are we closer to the next item...
                    if index.remainder(dividingBy: 1) > 0.5 {
                        index += 1
                    } else {
                        index = CGFloat(Int(index))
                    }
                    
                    // Protect from scrolling out of bounds
                    index = min(index, CGFloat(items) - 1)
                    index = max(index, 0)
                    
                    // Set final offset (snapping to item)
                    let newOffset = index * itemWidth + (index - 1) * itemSpacing - (contentWidth / 2.0) + (screenWidth / 2.0) - ((screenWidth - itemWidth) / 2.0) + itemSpacing
                    
                    // Animate snapping
                    withAnimation {
                        scrollOffset = newOffset
                    }
                    
                })
            )
    }
}
