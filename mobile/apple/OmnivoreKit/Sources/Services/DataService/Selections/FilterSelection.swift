import Foundation
import Models
import SwiftGraphQL

let filterSelection = Selection.Filter {
  InternalFilter(
    id: try $0.id(),
    name: try $0.name(),
    folder: try $0.folder() ?? "inbox",
    filter: try $0.filter(),
    visible: try $0.visible() ?? true,
    position: try $0.position(),
    defaultFilter: try $0.defaultFilter() ?? false
  )
}
