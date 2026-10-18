import Foundation

public enum Either<A, B> {
  case left(A)
  case right(B)
}
