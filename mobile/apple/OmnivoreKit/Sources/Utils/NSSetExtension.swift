import Foundation

public extension Optional where Wrapped == NSSet {
  func asArray<T: Hashable>(of _: T.Type) -> [T] {
    if let set = self as? Set<T> {
      return Array(set)
    }
    return [T]()
  }
}
