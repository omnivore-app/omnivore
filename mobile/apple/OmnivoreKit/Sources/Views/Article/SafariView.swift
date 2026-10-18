import SafariServices
import SwiftUI
import WebKit

#if os(iOS)
  public struct SafariView: UIViewControllerRepresentable {
    let url: URL

    public init(url: URL) {
      self.url = url
    }

    public func makeUIViewController(
      context _: UIViewControllerRepresentableContext<SafariView>
    ) -> SFSafariViewController {
      SFSafariViewController(url: url)
    }

    // swiftlint:disable:next line_length
    public func updateUIViewController(_: SFSafariViewController, context _: UIViewControllerRepresentableContext<SafariView>) {}
  }

#elseif os(macOS)
  public struct SafariView: View {
    let url: URL

    public init(url: URL) {
      self.url = url
    }

    public var body: some View {
      Color.clear
    }
  }
#endif
