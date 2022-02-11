import SwiftUI

#if os(iOS)

  public struct FullScreenWebAppView: View {
    @State var showFontSizePopover = false
    let viewModel: WebAppWrapperViewModel
    let handleClose: () -> Void

    public init(
      viewModel: WebAppWrapperViewModel,
      handleClose: @escaping () -> Void
    ) {
      self.viewModel = viewModel
      self.handleClose = handleClose
    }

    public var body: some View {
      WebAppWrapperView(viewModel: viewModel)
        .toolbar {
          ToolbarItem(placement: .navigationBarLeading) {
            Button(
              action: handleClose,
              label: {
                Image(systemName: "xmark")
                  .foregroundColor(.appGrayTextContrast)
              }
            )
          }
        }
        .toolbar {
          ToolbarItem(placement: .automatic) {
            Button(
              action: { showFontSizePopover = true },
              label: {
                Image(systemName: "textformat.size")
                  .foregroundColor(.appGrayTextContrast)
              }
            )
            #if os(iOS)
              .fittedPopover(isPresented: $showFontSizePopover) {
                FontSizeAdjustmentPopoverView(
                  increaseFontAction: { viewModel.sendIncreaseFontSignal = true },
                  decreaseFontAction: { viewModel.sendDecreaseFontSignal = true }
                )
              }
            #else
              .popover(isPresented: $showFontSizePopover) {
                FontSizeAdjustmentPopoverView(
                  increaseFontAction: { viewModel.sendIncreaseFontSignal = true },
                  decreaseFontAction: { viewModel.sendDecreaseFontSignal = true }
                )
              }
            #endif
          }
        }
    }
  }

#endif
