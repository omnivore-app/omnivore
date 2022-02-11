import Foundation

/// A NanoID value type for generating IDs.
public struct NanoID {
  /// A set of predefined ID alphabets.
  public enum Alphabet: String {
    /// An alphabet of hexadecimal characters.
    case hexadecimal = "0123456789abcdef"
    /// An alphabet of lowercase English characters.
    case lowercase = "abcdefghijklmnopqrstuvwxyz"
    /// An alphabet of number characters.
    case numbers = "0123456789"
    /// An alphabet of numbers, lowercase and uppercase English characters
    /// with ambiguous 1, l, I, 0, O, o, u, v characters excluded.
    case unambiguous = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstwxyz"
    /// An alphabet of uppercase English characters.
    case uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    /// An alphabet of lowercase and uppercase English characters including the
    /// underscore and hyphen characters.
    case urlSafe = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-"
  }

  /// Character space to use for ID generation.
  private var alphabet: String
  /// ID character length.
  private var size: Int

  /// Creates a new instance with a specified ID alphabet and size.
  ///
  /// - Parameter alphabet: A string representation of the character space to use for ID
  ///   generation. Empty string is mapped to default alphabet.  The `default`
  ///   is NanoID.Alphabet.urlSafe.
  /// - Parameter size: An int value stating the output ID size. The `default` is 21.
  init(alphabet: String = Alphabet.urlSafe.rawValue, size: Int = 21) {
    self.alphabet = alphabet.isEmpty ? Alphabet.urlSafe.rawValue : alphabet
    self.size = size
  }

  /// Creates a new random ID using type's `Alphabet` and `Size`.
  ///
  /// - Returns: A new random ID.
  public func new() -> String {
    NanoID.generate(alphabet: alphabet, size: size)
  }

  /// Statically creates a new random ID with default alphabet `NanoID.Alphabet.urlSafe`
  /// and size `21`.
  ///
  /// - Returns: A new random ID.
  public static func new() -> String {
    NanoID.generate(alphabet: Alphabet.urlSafe.rawValue, size: 21)
  }

  /// Statically creates a new random ID with a specified ID alphabet and size.
  ///
  /// - Parameter alphabet: A string representation of the character space to use for ID
  ///   generation. Empty string is mapped to default alphabet.  The `default`
  ///   is NanoID.Alphabet.urlSafe.
  /// - Parameter size: An int value stating the output ID size. The `default` is 21.
  /// - Returns: A new random ID.
  public static func generate(alphabet: String = Alphabet.urlSafe.rawValue, size: Int = 21) -> String {
    let characters = alphabet.isEmpty ? Alphabet.urlSafe.rawValue : alphabet
    var result = ""
    for _ in 0 ..< size {
      let character = NanoID.randomCharacter(from: characters)
      result.append(character)
    }
    return result
  }

  /// Returns a random character from a specified alphabet.
  ///
  /// - Parameter alphabet: A string representation of the character space to select a random
  ///   character from.
  /// - Returns: A random Character.
  private static func randomCharacter(from alphabet: String) -> Character {
    let offset = Int.random(in: 0 ..< alphabet.count)
    let index = alphabet.index(alphabet.startIndex, offsetBy: offset)
    return alphabet[index]
  }
}
