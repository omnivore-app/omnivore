import Foundation
import SwiftUI

struct AudioToolbarButton: View {
  @State private var drawingHeight = true

  var animation: Animation {
    .linear(duration: 0.5).repeatForever()
  }

  var body: some View {
    ZStack {
      Circle()
        .stroke(Color.black)
        .frame(width: 21, height: 21)

//        HStack(spacing: 1) {
//          bar(low: 0.4)
//            .animation(animation.speed(1.5), value: drawingHeight)
//          bar(low: 0.3)
//            .animation(animation.speed(1.2), value: drawingHeight)
//          bar(low: 0.5)
//            .animation(animation.speed(1.0), value: drawingHeight)
//          bar(low: 0.3)
//            .animation(animation.speed(1.7), value: drawingHeight)
//          //      bar(low: 0.5)
//          //        .animation(animation.speed(1.0), value: drawingHeight)
//        }
//        .frame(width: 20)
//        .onAppear {
//          drawingHeight.toggle()
//        }
    }
  }

  func bar(low: CGFloat = 0.0, high: CGFloat = 1.0) -> some View {
    RoundedRectangle(cornerRadius: 3)
      .fill(Color.black)
      .frame(width: 1)
      .frame(height: (drawingHeight ? high : low) * 15)
      .frame(height: 15, alignment: .bottom)
  }
}
