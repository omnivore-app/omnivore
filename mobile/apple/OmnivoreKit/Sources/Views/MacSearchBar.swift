import SwiftUI

#if os(macOS)
  public struct MacSearchBar: NSViewRepresentable {
    @Binding var searchTerm: String

    public init(
      searchTerm: Binding<String>
    ) {
      self._searchTerm = searchTerm
    }

    public func makeNSView(context _: Context) -> NSSearchField {
      let searchField = NSSearchField(frame: .zero)
      searchField.translatesAutoresizingMaskIntoConstraints = false
      searchField.heightAnchor.constraint(greaterThanOrEqualToConstant: 28).isActive = true
      searchField.resignFirstResponder()

      return searchField
    }

    func changeSearchFieldItem(searchField: NSSearchField, sender: AnyObject) -> NSSearchField {
      // Based on the Menu item selection in the search field the placeholder string is set
      (searchField.cell as? NSSearchFieldCell)?.placeholderString = sender.title
      return searchField
    }

    public func updateNSView(_ searchField: NSSearchField, context: Context) {
      searchField.font = searchField.font?.withSize(14)
      searchField.stringValue = searchTerm
      searchField.delegate = context.coordinator
      searchField.resignFirstResponder()
    }

    public func makeCoordinator() -> Coordinator {
      let coordinator = Coordinator(searchTerm: $searchTerm)
      return coordinator
    }

    public class Coordinator: NSObject, NSSearchFieldDelegate {
      var searchTerm: Binding<String>

      init(searchTerm: Binding<String>) {
        self.searchTerm = searchTerm
        super.init()
      }

      public func controlTextDidChange(_ notification: Notification) {
        guard let searchField = notification.object as? NSSearchField else {
          // log.error("Unexpected control in update notification", source: .ui)
          return
        }
        searchTerm.wrappedValue = searchField.stringValue
      }
    }
  }
#endif
