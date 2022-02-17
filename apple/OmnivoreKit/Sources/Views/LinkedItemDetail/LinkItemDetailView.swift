import Combine
import Models
import SwiftUI
import Utils

public enum PDFProvider {
  public static var pdfViewerProvider: ((URL, FeedItem) -> AnyView)?
}

public final class LinkItemDetailViewModel: ObservableObject {
  @Published public var item: FeedItem
  @Published public var webAppWrapperViewModel: WebAppWrapperViewModel?

  public enum Action {
    case load
    case updateReadStatus(markAsRead: Bool)
  }

  public var subscriptions = Set<AnyCancellable>()
  public let performActionSubject = PassthroughSubject<Action, Never>()

  public init(item: FeedItem) {
    self.item = item
  }
}

public struct LinkItemDetailView: View {
  @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>

  static let navBarHeight = 50.0
  @ObservedObject private var viewModel: LinkItemDetailViewModel
  @State private var showFontSizePopover = false
  @State private var navBarVisibilityRatio = 1.0

  public init(viewModel: LinkItemDetailViewModel) {
    self.viewModel = viewModel
  }

  var toggleReadStatusToolbarItem: some View {
    Button(
      action: { viewModel.performActionSubject.send(.updateReadStatus(markAsRead: !viewModel.item.isRead)) },
      label: {
        Image(systemName: viewModel.item.isRead ? "line.horizontal.3.decrease.circle" : "checkmark.circle")
      }
    )
  }

  var removeLinkToolbarItem: some View {
    Button(
      action: { print("delete item action") },
      label: {
        Image(systemName: "trash")
      }
    )
  }

  var fontAdjustmentPopoverView: some View {
    FontSizeAdjustmentPopoverView(
      increaseFontAction: { viewModel.webAppWrapperViewModel?.sendIncreaseFontSignal = true },
      decreaseFontAction: { viewModel.webAppWrapperViewModel?.sendDecreaseFontSignal = true }
    )
  }

  public var body: some View {
    #if os(iOS)
      if UIDevice.isIPhone, !viewModel.item.isPDF {
        compactInnerBody
      } else {
        innerBody
      }
    #else
      innerBody
    #endif
  }

  @ViewBuilder private var compactInnerBody: some View {
    VStack(spacing: 0) {
      withAnimation {
        HStack(alignment: .center) {
          Button(
            action: { self.presentationMode.wrappedValue.dismiss() },
            label: {
              Image(systemName: "chevron.backward")
                .font(.appTitleTwo)
                .foregroundColor(.appGrayTextContrast)
                .padding(.horizontal)
            }
          )
          .scaleEffect(navBarVisibilityRatio)
          Spacer()
          Button(
            action: { showFontSizePopover.toggle() },
            label: {
              Image(systemName: "textformat.size")
                .font(.appTitleTwo)
            }
          )
          .padding(.horizontal)
          .scaleEffect(navBarVisibilityRatio)
        }
        .frame(height: LinkItemDetailView.navBarHeight * navBarVisibilityRatio)
        .opacity(navBarVisibilityRatio)
      }
      if let webAppWrapperViewModel = viewModel.webAppWrapperViewModel {
        ZStack {
          WebAppWrapperView(
            viewModel: webAppWrapperViewModel,
            navBarVisibilityRatioUpdater: {
              if $0 < 1 {
                showFontSizePopover = false
              }
              navBarVisibilityRatio = $0
            }
          )
          if showFontSizePopover {
            VStack {
              HStack {
                Spacer()
                fontAdjustmentPopoverView
                  .background(Color.appButtonBackground)
                  .cornerRadius(8)
                  .padding(.trailing, 5)
              }
              Spacer()
            }
            .background(
              Color.clear
                .contentShape(Rectangle())
                .onTapGesture {
                  showFontSizePopover = false
                }
            )
          }
        }
      } else {
        Spacer()
          .onAppear {
            viewModel.performActionSubject.send(.load)
          }
      }
    }
    .navigationBarHidden(true)
  }

  @ViewBuilder private var innerBody: some View {
    if let pdfURL = viewModel.item.pdfURL {
      #if os(iOS)
        PDFProvider.pdfViewerProvider?(pdfURL, viewModel.item)
      #elseif os(macOS)
        PDFWrapperView(pdfURL: pdfURL)
      #endif
    } else if let webAppWrapperViewModel = viewModel.webAppWrapperViewModel {
      WebAppWrapperView(viewModel: webAppWrapperViewModel)
        .toolbar {
          ToolbarItem(placement: .automatic) {
            Button(
              action: { showFontSizePopover = true },
              label: {
                Image(systemName: "textformat.size")
              }
            )
            #if os(iOS)
              .fittedPopover(isPresented: $showFontSizePopover) {
                fontAdjustmentPopoverView
              }
            #else
              .popover(isPresented: $showFontSizePopover) {
                fontAdjustmentPopoverView
              }
            #endif
          }
        }
    } else {
      HStack(alignment: .center) {
        Spacer()
        Text("Loading...")
        Spacer()
      }
      .onAppear {
        viewModel.performActionSubject.send(.load)
      }
    }
  }
}

// Enable swipe to go back behavior if nav bar is hidden
extension UINavigationController: UIGestureRecognizerDelegate {
  override open func viewDidLoad() {
    super.viewDidLoad()
    interactivePopGestureRecognizer?.delegate = self
  }

  public func gestureRecognizerShouldBegin(_: UIGestureRecognizer) -> Bool {
    viewControllers.count > 1
  }
}
