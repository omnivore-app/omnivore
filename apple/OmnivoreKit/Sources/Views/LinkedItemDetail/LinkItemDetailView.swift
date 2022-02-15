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
  @ObservedObject private var viewModel: LinkItemDetailViewModel
  @State private var showFontSizePopover = false

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

  public var body: some View {
    innerBody
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
      .introspectNavigationController {
        navigationController = $0
        navigationController?.hidesBarsOnSwipe = UIDevice.isIPhone
      }
      .introspectTabBarController {
        tabBarController = $0
        tabBarController?.tabBar.isHidden = UIDevice.isIPhone
      }
      .onDisappear {
        navigationController?.hidesBarsOnSwipe = true
        tabBarController?.tabBar.isHidden = false
      }
      .onAppear {
        navigationController?.hidesBarsOnSwipe = UIDevice.isIPhone
        tabBarController?.tabBar.isHidden = UIDevice.isIPhone
      }
      //      .ignoresSafeArea(, edges: <#T##Edge.Set#>)
      .ignoresSafeArea(., edges: .vertical)
    #endif
  }

  @State var navigationController: UINavigationController?
  @State var tabBarController: UITabBarController?

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
                FontSizeAdjustmentPopoverView(
                  increaseFontAction: { viewModel.webAppWrapperViewModel?.sendIncreaseFontSignal = true },
                  decreaseFontAction: { viewModel.webAppWrapperViewModel?.sendDecreaseFontSignal = true }
                )
              }
            #else
              .popover(isPresented: $showFontSizePopover) {
                FontSizeAdjustmentPopoverView(
                  increaseFontAction: { viewModel.webAppWrapperViewModel?.sendIncreaseFontSignal = true },
                  decreaseFontAction: { viewModel.webAppWrapperViewModel?.sendDecreaseFontSignal = true }
                )
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
