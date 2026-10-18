// swiftlint:disable file_length

import Foundation
import SwiftUI

func consistentHash(string: String, maxNumber: Int) -> Int {
  abs(string.hashValue) % maxNumber
}

@available(iOS 13.0, *)
public extension Gradient {
  init?(fromStr: String) {
    let idx = consistentHash(string: fromStr, maxNumber: gradientColors.count)
    let key = Array(gradientColors.keys)[idx]
    if let gradientColors = gradientColors[key] {
      self.init(colors: gradientColors)
    } else {
      self.init(colors: gradientColors.randomElement()!.value)
    }
  }

  static func randomColor(str: String, offset: Int) -> Color {
    let idx = consistentHash(string: str, maxNumber: gradientColors.count)
    let key = Array(gradientColors.keys)[idx]
    if let gradientColors = gradientColors[key] {
      return gradientColors[offset]
    }
    return gradientColors.randomElement()!.value[offset]
  }
}

@available(iOS 13.0, *)
let gradientColors = [
  "Grade Grey": [
    Color(red: 0.74, green: 0.76, blue: 0.78),
    Color(red: 0.17, green: 0.24, blue: 0.31)
  ],
  "Piggy Pink": [
    Color(red: 0.93, green: 0.61, blue: 0.65),
    Color(red: 1.0, green: 0.87, blue: 0.88)
  ],
  "Cool Blues": [
    Color(red: 0.13, green: 0.58, blue: 0.69),
    Color(red: 0.43, green: 0.84, blue: 0.93)
  ],
  "Megatron": [
    Color(red: 0.78, green: 1.0, blue: 0.87),
    Color(red: 0.98, green: 0.84, blue: 0.53),
    Color(red: 0.97, green: 0.47, blue: 0.49)
  ],
  "Moonlit Asteroid": [
    Color(red: 0.06, green: 0.13, blue: 0.15),
    Color(red: 0.13, green: 0.23, blue: 0.26),
    Color(red: 0.17, green: 0.33, blue: 0.39)
  ],
  "Jshine": [
    Color(red: 0.07, green: 0.76, blue: 0.91),
    Color(red: 0.77, green: 0.44, blue: 0.93),
    Color(red: 0.96, green: 0.31, blue: 0.35)
  ],
  "Evening Sunshine": [
    Color(red: 0.73, green: 0.17, blue: 0.15),
    Color(red: 0.08, green: 0.4, blue: 0.75)
  ],
  "Dark Ocean": [
    Color(red: 0.22, green: 0.23, blue: 0.27),
    Color(red: 0.26, green: 0.53, blue: 0.96)
  ],
  "Cool Sky": [
    Color(red: 0.16, green: 0.5, blue: 0.73),
    Color(red: 0.43, green: 0.84, blue: 0.98),
    Color(red: 1.0, green: 1.0, blue: 1.0)
  ],
  "Yoda": [
    Color(red: 1.0, green: 0.0, blue: 0.6),
    Color(red: 0.29, green: 0.2, blue: 0.25)
  ],
  "Memariani": [
    Color(red: 0.67, green: 0.29, blue: 0.42),
    Color(red: 0.42, green: 0.42, blue: 0.51),
    Color(red: 0.23, green: 0.55, blue: 0.6)
  ],
  "Amin": [
    Color(red: 0.56, green: 0.18, blue: 0.89),
    Color(red: 0.29, green: 0.0, blue: 0.88)
  ],
  "Harvey": [
    Color(red: 0.12, green: 0.25, blue: 0.22),
    Color(red: 0.6, green: 0.95, blue: 0.78)
  ],
  "Neuromancer": [
    Color(red: 0.98, green: 0.33, blue: 0.78),
    Color(red: 0.73, green: 0.11, blue: 0.45)
  ],
  "Azur Lane": [
    Color(red: 0.5, green: 0.5, blue: 0.84),
    Color(red: 0.53, green: 0.66, blue: 0.91),
    Color(red: 0.57, green: 0.92, blue: 0.89)
  ],
  "Witching Hour": [
    Color(red: 0.76, green: 0.08, blue: 0.2),
    Color(red: 0.14, green: 0.04, blue: 0.21)
  ],
  "Flare": [
    Color(red: 0.95, green: 0.15, blue: 0.07),
    Color(red: 0.96, green: 0.69, blue: 0.1)
  ],
  "Metapolis": [
    Color(red: 0.4, green: 0.6, blue: 0.6),
    Color(red: 0.96, green: 0.47, blue: 0.12)
  ],
  "Kyoo Pal": [
    Color(red: 0.87, green: 0.24, blue: 0.33),
    Color(red: 0.42, green: 0.9, blue: 0.52)
  ],
  "Kye Meh": [
    Color(red: 0.51, green: 0.38, blue: 0.76),
    Color(red: 0.18, green: 0.75, blue: 0.57)
  ],
  "Kyoo Tah": [
    Color(red: 0.33, green: 0.29, blue: 0.49),
    Color(red: 1.0, green: 0.83, blue: 0.32)
  ],
  "By Design": [
    Color(red: 0.0, green: 0.62, blue: 1.0),
    Color(red: 0.93, green: 0.18, blue: 0.29)
  ],
  "Ultra Voilet": [
    Color(red: 0.4, green: 0.31, blue: 0.64),
    Color(red: 0.92, green: 0.69, blue: 0.78)
  ],
  "Burning Orange": [
    Color(red: 1.0, green: 0.25, blue: 0.42),
    Color(red: 1.0, green: 0.29, blue: 0.17)
  ],
  "Wiretap": [
    Color(red: 0.54, green: 0.14, blue: 0.53),
    Color(red: 0.91, green: 0.25, blue: 0.34),
    Color(red: 0.95, green: 0.44, blue: 0.13)
  ],
  "Summer Dog": [
    Color(red: 0.66, green: 1.0, blue: 0.47),
    Color(red: 0.47, green: 1.0, blue: 0.84)
  ],
  "Rastafari": [
    Color(red: 0.12, green: 0.59, blue: 0.0),
    Color(red: 1.0, green: 0.95, blue: 0.0),
    Color(red: 1.0, green: 0.0, blue: 0.0)
  ],
  "Sin City Red": [
    Color(red: 0.93, green: 0.13, blue: 0.23),
    Color(red: 0.58, green: 0.16, blue: 0.12)
  ],
  "Citrus Peel": [
    Color(red: 0.99, green: 0.78, blue: 0.19),
    Color(red: 0.95, green: 0.45, blue: 0.21)
  ],
  "Blue Raspberry": [
    Color(red: 0.0, green: 0.71, blue: 0.86),
    Color(red: 0.0, green: 0.51, blue: 0.69)
  ],
  "Margo": [
    Color(red: 1.0, green: 0.94, blue: 0.73),
    Color(red: 1.0, green: 1.0, blue: 1.0)
  ],
  "Magic": [
    Color(red: 0.35, green: 0.76, blue: 0.45),
    Color(red: 0.63, green: 0.5, blue: 0.88),
    Color(red: 0.36, green: 0.15, blue: 0.76)
  ],
  "Evening Night": [
    Color(red: 0.0, green: 0.35, blue: 0.65),
    Color(red: 1.0, green: 0.99, blue: 0.89)
  ],
  "Vanusa": [
    Color(red: 0.85, green: 0.27, blue: 0.33),
    Color(red: 0.54, green: 0.13, blue: 0.42)
  ],
  "Shifty": [
    Color(red: 0.39, green: 0.39, blue: 0.39),
    Color(red: 0.64, green: 0.67, blue: 0.35)
  ],
  "Expresso": [
    Color(red: 0.68, green: 0.33, blue: 0.54),
    Color(red: 0.24, green: 0.06, blue: 0.33)
  ],
  "Slight Ocean View": [
    Color(red: 0.66, green: 0.75, blue: 1.0),
    Color(red: 0.25, green: 0.17, blue: 0.59)
  ],
  "Pure Lust": [
    Color(red: 0.2, green: 0.2, blue: 0.2),
    Color(red: 0.87, green: 0.09, blue: 0.09)
  ],
  "Moon Purple": [
    Color(red: 0.31, green: 0.33, blue: 0.78),
    Color(red: 0.56, green: 0.58, blue: 0.98)
  ],
  "Red Sunset": [
    Color(red: 0.21, green: 0.36, blue: 0.49),
    Color(red: 0.42, green: 0.36, blue: 0.48),
    Color(red: 0.75, green: 0.42, blue: 0.52)
  ],
  "Shifter": [
    Color(red: 0.74, green: 0.31, blue: 0.61),
    Color(red: 0.97, green: 0.03, blue: 0.35)
  ],
  "Wedding Day Blues": [
    Color(red: 0.25, green: 0.88, blue: 0.82),
    Color(red: 1.0, green: 0.55, blue: 0.0),
    Color(red: 1.0, green: 0.0, blue: 0.5)
  ],
  "Sand To Blue": [
    Color(red: 0.24, green: 0.32, blue: 0.32),
    Color(red: 0.87, green: 0.8, blue: 0.64)
  ],
  "Quepal": [
    Color(red: 0.07, green: 0.6, blue: 0.56),
    Color(red: 0.22, green: 0.94, blue: 0.49)
  ],
  "Pun Yeta": [
    Color(red: 0.06, green: 0.55, blue: 0.78),
    Color(red: 0.94, green: 0.56, blue: 0.22)
  ],
  "Sublime Light": [
    Color(red: 0.99, green: 0.36, blue: 0.49),
    Color(red: 0.42, green: 0.51, blue: 0.98)
  ],
  "Sublime Vivid": [
    Color(red: 0.99, green: 0.27, blue: 0.42),
    Color(red: 0.25, green: 0.37, blue: 0.98)
  ],
  "Bighead": [
    Color(red: 0.79, green: 0.29, blue: 0.29),
    Color(red: 0.29, green: 0.07, blue: 0.31)
  ],
  "Taran Tado": [
    Color(red: 0.14, green: 0.03, blue: 0.3),
    Color(red: 0.8, green: 0.33, blue: 0.2)
  ],
  "Relaxing Red": [
    Color(red: 1.0, green: 0.98, blue: 0.84),
    Color(red: 0.7, green: 0.04, blue: 0.17)
  ],
  "Lawrencium": [
    Color(red: 0.06, green: 0.05, blue: 0.16),
    Color(red: 0.19, green: 0.17, blue: 0.39),
    Color(red: 0.14, green: 0.14, blue: 0.24)
  ],
  "Ohhappiness": [
    Color(red: 0.0, green: 0.69, blue: 0.61),
    Color(red: 0.59, green: 0.79, blue: 0.24)
  ],
  "Delicate": [
    Color(red: 0.83, green: 0.8, blue: 0.89),
    Color(red: 0.91, green: 0.89, blue: 0.94)
  ],
  "Selenium": [
    Color(red: 0.24, green: 0.23, blue: 0.25),
    Color(red: 0.38, green: 0.36, blue: 0.24)
  ],
  "Sulphur": [
    Color(red: 0.79, green: 0.77, blue: 0.19),
    Color(red: 0.95, green: 0.98, blue: 0.65)
  ],
  "Pink Flavour": [
    Color(red: 0.5, green: 0.0, blue: 0.5),
    Color(red: 1.0, green: 0.75, blue: 0.8)
  ],
  "Rainbow Blue": [
    Color(red: 0.0, green: 0.95, blue: 0.38),
    Color(red: 0.02, green: 0.46, blue: 0.9)
  ],
  "Orange Fun": [
    Color(red: 0.99, green: 0.29, blue: 0.1),
    Color(red: 0.97, green: 0.72, blue: 0.2)
  ],
  "Digital Water": [
    Color(red: 0.45, green: 0.92, blue: 0.84),
    Color(red: 0.67, green: 0.71, blue: 0.9)
  ],
  "Lithium": [
    Color(red: 0.43, green: 0.38, blue: 0.15),
    Color(red: 0.83, green: 0.8, blue: 0.72)
  ],
  "Argon": [
    Color(red: 0.01, green: 0.0, blue: 0.12),
    Color(red: 0.45, green: 0.01, blue: 0.75),
    Color(red: 0.93, green: 0.22, blue: 0.74),
    Color(red: 0.99, green: 0.94, blue: 0.98)
  ],
  "Hydrogen": [
    Color(red: 0.4, green: 0.49, blue: 0.71),
    Color(red: 0.0, green: 0.51, blue: 0.78),
    Color(red: 0.0, green: 0.51, blue: 0.78),
    Color(red: 0.4, green: 0.49, blue: 0.71)
  ],
  "Zinc": [
    Color(red: 0.68, green: 0.66, blue: 0.59),
    Color(red: 0.95, green: 0.95, blue: 0.95),
    Color(red: 0.86, green: 0.86, blue: 0.86),
    Color(red: 0.92, green: 0.92, blue: 0.92)
  ],
  "Velvet Sun": [
    Color(red: 0.88, green: 0.93, blue: 0.76),
    Color(red: 0.94, green: 0.31, blue: 0.33)
  ],
  "King Yna": [
    Color(red: 0.1, green: 0.16, blue: 0.42),
    Color(red: 0.7, green: 0.12, blue: 0.12),
    Color(red: 0.99, green: 0.73, blue: 0.18)
  ],
  "Summer": [
    Color(red: 0.13, green: 0.76, blue: 0.76),
    Color(red: 0.99, green: 0.73, blue: 0.18)
  ],
  "Orange Coral": [
    Color(red: 1.0, green: 0.6, blue: 0.4),
    Color(red: 1.0, green: 0.37, blue: 0.38)
  ],
  "Purpink": [
    Color(red: 0.5, green: 0.0, blue: 1.0),
    Color(red: 0.88, green: 0.0, blue: 1.0)
  ],
  "Dull": [
    Color(red: 0.79, green: 0.84, blue: 1.0),
    Color(red: 0.89, green: 0.89, blue: 0.89)
  ],
  "Kimoby Is The New Blue": [
    Color(red: 0.22, green: 0.42, blue: 0.99),
    Color(red: 0.16, green: 0.28, blue: 1.0)
  ],
  "Broken Hearts": [
    Color(red: 0.85, green: 0.65, blue: 0.78),
    Color(red: 1.0, green: 0.99, blue: 0.86)
  ],
  "Subu": [
    Color(red: 0.05, green: 0.92, blue: 0.92),
    Color(red: 0.13, green: 0.89, blue: 0.7),
    Color(red: 0.16, green: 1.0, blue: 0.78)
  ],
  "Socialive": [
    Color(red: 0.02, green: 0.75, blue: 0.71),
    Color(red: 0.28, green: 0.69, blue: 0.75)
  ],
  "Crimson Tide": [
    Color(red: 0.39, green: 0.17, blue: 0.45),
    Color(red: 0.78, green: 0.26, blue: 0.43)
  ],
  "Telegram": [
    Color(red: 0.11, green: 0.57, blue: 0.82),
    Color(red: 0.95, green: 0.99, blue: 1.0)
  ],
  "Terminal": [
    Color(red: 0.0, green: 0.0, blue: 0.0),
    Color(red: 0.06, green: 0.61, blue: 0.06)
  ],
  "Scooter": [
    Color(red: 0.21, green: 0.82, blue: 0.86),
    Color(red: 0.36, green: 0.53, blue: 0.9)
  ],
  "Alive": [
    Color(red: 0.8, green: 0.21, blue: 0.42),
    Color(red: 0.74, green: 0.25, blue: 0.2)
  ],
  "Relay": [
    Color(red: 0.23, green: 0.11, blue: 0.44),
    Color(red: 0.84, green: 0.43, blue: 0.47),
    Color(red: 1.0, green: 0.69, blue: 0.48)
  ],
  "Meridian": [
    Color(red: 0.16, green: 0.24, blue: 0.53),
    Color(red: 0.27, green: 0.64, blue: 0.28)
  ],
  "Compare Now": [
    Color(red: 0.94, green: 0.23, blue: 0.21),
    Color(red: 1.0, green: 1.0, blue: 1.0)
  ],
  "Mello": [
    Color(red: 0.75, green: 0.22, blue: 0.17),
    Color(red: 0.56, green: 0.27, blue: 0.68)
  ],
  "Crystal Clear": [
    Color(red: 0.08, green: 0.6, blue: 0.34),
    Color(red: 0.08, green: 0.34, blue: 0.6)
  ],
  "Visions Of Grandeur": [
    Color(red: 0.0, green: 0.0, blue: 0.27),
    Color(red: 0.11, green: 0.71, blue: 0.88)
  ],
  "Chitty Chitty Bang Bang": [
    Color(red: 0.0, green: 0.47, blue: 0.57),
    Color(red: 0.47, green: 1.0, blue: 0.84)
  ],
  "Blue Skies": [
    Color(red: 0.34, green: 0.8, blue: 0.95),
    Color(red: 0.18, green: 0.5, blue: 0.93)
  ],
  "Sunkist": [
    Color(red: 0.95, green: 0.6, blue: 0.29),
    Color(red: 0.95, green: 0.79, blue: 0.3)
  ],
  "Coal": [
    Color(red: 0.92, green: 0.34, blue: 0.34),
    Color(red: 0.0, green: 0.0, blue: 0.0)
  ],
  "Html": [
    Color(red: 0.89, green: 0.3, blue: 0.15),
    Color(red: 0.95, green: 0.4, blue: 0.16)
  ],
  "Cinnamint": [
    Color(red: 0.29, green: 0.76, blue: 0.6),
    Color(red: 0.74, green: 1.0, blue: 0.95)
  ],
  "Maldives": [
    Color(red: 0.7, green: 1.0, blue: 0.98),
    Color(red: 0.05, green: 0.82, blue: 0.97)
  ],
  "Mini": [
    Color(red: 0.19, green: 0.91, blue: 0.75),
    Color(red: 1.0, green: 0.51, blue: 0.21)
  ],
  "Sha La La": [
    Color(red: 0.84, green: 0.43, blue: 0.46),
    Color(red: 0.89, green: 0.58, blue: 0.53)
  ],
  "Purplepine": [
    Color(red: 0.13, green: 0.0, blue: 0.17),
    Color(red: 0.8, green: 0.71, blue: 0.83)
  ],
  "Celestial": [
    Color(red: 0.76, green: 0.22, blue: 0.39),
    Color(red: 0.11, green: 0.15, blue: 0.44)
  ],
  "Learning And Leading": [
    Color(red: 0.97, green: 0.59, blue: 0.12),
    Color(red: 1.0, green: 0.82, blue: 0.0)
  ],
  "Pacific Dream": [
    Color(red: 0.2, green: 0.91, blue: 0.62),
    Color(red: 0.06, green: 0.2, blue: 0.26)
  ],
  "Venice": [
    Color(red: 0.38, green: 0.56, blue: 0.91),
    Color(red: 0.65, green: 0.75, blue: 0.91)
  ],
  "Orca": [
    Color(red: 0.27, green: 0.63, blue: 0.55),
    Color(red: 0.04, green: 0.21, blue: 0.22)
  ],
  "Love And Liberty": [
    Color(red: 0.13, green: 0.0, blue: 0.13),
    Color(red: 0.44, green: 0.0, blue: 0.0)
  ],
  "Very Blue": [
    Color(red: 0.02, green: 0.46, blue: 0.9),
    Color(red: 0.01, green: 0.11, blue: 0.47)
  ],
  "Can You Feel The Love Tonight": [
    Color(red: 0.27, green: 0.41, blue: 0.86),
    Color(red: 0.69, green: 0.42, blue: 0.7)
  ],
  "The Blue Lagoon": [
    Color(red: 0.26, green: 0.78, blue: 0.67),
    Color(red: 0.1, green: 0.09, blue: 0.33)
  ],
  "Under The Lake": [
    Color(red: 0.04, green: 0.19, blue: 0.16),
    Color(red: 0.14, green: 0.48, blue: 0.34)
  ],
  "Honey Dew": [
    Color(red: 0.26, green: 0.78, blue: 0.67),
    Color(red: 0.97, green: 1.0, blue: 0.68)
  ],
  "Roseanna": [
    Color(red: 1.0, green: 0.69, blue: 0.74),
    Color(red: 1.0, green: 0.76, blue: 0.63)
  ],
  "What Lies Beyond": [
    Color(red: 0.94, green: 0.95, blue: 0.94),
    Color(red: 0.0, green: 0.05, blue: 0.25)
  ],
  "Rose Colored Lenses": [
    Color(red: 0.91, green: 0.8, blue: 0.75),
    Color(red: 0.39, green: 0.44, blue: 0.64)
  ],
  "Easymed": [
    Color(red: 0.86, green: 0.89, blue: 0.36),
    Color(red: 0.27, green: 0.71, blue: 0.29)
  ],
  "Cocoaa Ice": [
    Color(red: 0.75, green: 0.75, blue: 0.67),
    Color(red: 0.11, green: 0.94, blue: 1.0)
  ],
  "Jodhpur": [
    Color(red: 0.61, green: 0.93, blue: 0.98),
    Color(red: 0.4, green: 0.78, blue: 0.97),
    Color(red: 0.0, green: 0.32, blue: 0.83)
  ],
  "Jaipur": [
    Color(red: 0.86, green: 0.9, blue: 0.96),
    Color(red: 0.77, green: 0.47, blue: 0.43)
  ],
  "Vice City": [
    Color(red: 0.2, green: 0.58, blue: 0.9),
    Color(red: 0.93, green: 0.43, blue: 0.68)
  ],
  "Mild": [
    Color(red: 0.4, green: 0.7, blue: 0.44),
    Color(red: 0.3, green: 0.64, blue: 0.8)
  ],
  "Dawn": [
    Color(red: 0.95, green: 0.56, blue: 0.31),
    Color(red: 0.23, green: 0.26, blue: 0.44)
  ],
  "Ibiza Sunset": [
    Color(red: 0.93, green: 0.04, blue: 0.47),
    Color(red: 1.0, green: 0.42, blue: 0.0)
  ],
  "Radar": [
    Color(red: 0.65, green: 0.44, blue: 0.94),
    Color(red: 0.81, green: 0.55, blue: 0.95),
    Color(red: 0.99, green: 0.73, blue: 0.61)
  ],
  "80'S Purple": [
    Color(red: 0.25, green: 0.16, blue: 0.35),
    Color(red: 0.18, green: 0.03, blue: 0.26)
  ],
  "Black Rosé": [
    Color(red: 0.96, green: 0.77, blue: 0.95),
    Color(red: 0.99, green: 0.4, blue: 0.98)
  ],
  "Brady Brady Fun Fun": [
    Color(red: 0.0, green: 0.76, blue: 1.0),
    Color(red: 1.0, green: 1.0, blue: 0.11)
  ],
  "Ed'S Sunset Gradient": [
    Color(red: 1.0, green: 0.49, blue: 0.37),
    Color(red: 1.0, green: 0.71, blue: 0.48)
  ],
  "Snapchat": [
    Color(red: 1.0, green: 0.99, blue: 0.0),
    Color(red: 1.0, green: 1.0, blue: 1.0)
  ],
  "Cosmic Fusion": [
    Color(red: 1.0, green: 0.0, blue: 0.8),
    Color(red: 0.2, green: 0.2, blue: 0.6)
  ],
  "Nepal": [
    Color(red: 0.87, green: 0.38, blue: 0.38),
    Color(red: 0.15, green: 0.34, blue: 0.92)
  ],
  "Azure Pop": [
    Color(red: 0.94, green: 0.2, blue: 0.85),
    Color(red: 0.54, green: 1.0, blue: 0.99)
  ],
  "Love Couple": [
    Color(red: 0.23, green: 0.38, blue: 0.53),
    Color(red: 0.54, green: 0.15, blue: 0.24)
  ],
  "Disco": [
    Color(red: 0.31, green: 0.8, blue: 0.77),
    Color(red: 0.33, green: 0.38, blue: 0.44)
  ],
  "Limeade": [
    Color(red: 0.63, green: 1.0, blue: 0.81),
    Color(red: 0.98, green: 1.0, blue: 0.82)
  ],
  "Dania": [
    Color(red: 0.75, green: 0.58, blue: 0.77),
    Color(red: 0.48, green: 0.78, blue: 0.8)
  ],
  "50 Shades Of Grey": [
    Color(red: 0.74, green: 0.76, blue: 0.78),
    Color(red: 0.17, green: 0.24, blue: 0.31)
  ],
  "Jupiter": [
    Color(red: 1.0, green: 0.85, blue: 0.61),
    Color(red: 0.1, green: 0.33, blue: 0.48)
  ],
  "Iiit Delhi": [
    Color(red: 0.5, green: 0.5, blue: 0.5),
    Color(red: 0.25, green: 0.68, blue: 0.66)
  ],
  "Sun On The Horizon": [
    Color(red: 0.99, green: 0.92, blue: 0.73),
    Color(red: 0.97, green: 0.71, blue: 0.0)
  ],
  "Blood Red": [
    Color(red: 0.97, green: 0.31, blue: 0.2),
    Color(red: 0.91, green: 0.22, blue: 0.15)
  ],
  "Sherbert": [
    Color(red: 0.97, green: 0.62, blue: 0.0),
    Color(red: 0.39, green: 0.95, blue: 0.55)
  ],
  "Firewatch": [
    Color(red: 0.8, green: 0.18, blue: 0.24),
    Color(red: 0.94, green: 0.28, blue: 0.23)
  ],
  "Lush": [
    Color(red: 0.34, green: 0.67, blue: 0.18),
    Color(red: 0.66, green: 0.88, blue: 0.39)
  ],
  "Frost": [
    Color(red: 0.0, green: 0.02, blue: 0.16),
    Color(red: 0.0, green: 0.31, blue: 0.57)
  ],
  "Mauve": [
    Color(red: 0.26, green: 0.15, blue: 0.35),
    Color(red: 0.45, green: 0.29, blue: 0.43)
  ],
  "Royal": [
    Color(red: 0.08, green: 0.12, blue: 0.19),
    Color(red: 0.14, green: 0.23, blue: 0.33)
  ],
  "Minimal Red": [
    Color(red: 0.94, green: 0.0, blue: 0.0),
    Color(red: 0.86, green: 0.16, blue: 0.12)
  ],
  "Dusk": [
    Color(red: 0.17, green: 0.24, blue: 0.31),
    Color(red: 0.99, green: 0.45, blue: 0.42)
  ],
  "Deep Sea Space": [
    Color(red: 0.17, green: 0.24, blue: 0.31),
    Color(red: 0.3, green: 0.63, blue: 0.69)
  ],
  "Grapefruit Sunset": [
    Color(red: 0.91, green: 0.39, blue: 0.26),
    Color(red: 0.56, green: 0.31, blue: 0.58)
  ],
  "Sunset": [
    Color(red: 0.04, green: 0.28, blue: 0.42),
    Color(red: 0.96, green: 0.38, blue: 0.09)
  ],
  "Solid Vault": [
    Color(red: 0.23, green: 0.48, blue: 0.84),
    Color(red: 0.23, green: 0.38, blue: 0.45)
  ],
  "Bright Vault": [
    Color(red: 0.0, green: 0.82, blue: 1.0),
    Color(red: 0.57, green: 0.55, blue: 0.67)
  ],
  "Politics": [
    Color(red: 0.13, green: 0.59, blue: 0.95),
    Color(red: 0.96, green: 0.26, blue: 0.21)
  ],
  "Sweet Morning": [
    Color(red: 1.0, green: 0.37, blue: 0.43),
    Color(red: 1.0, green: 0.76, blue: 0.44)
  ],
  "Sylvia": [
    Color(red: 1.0, green: 0.29, blue: 0.12),
    Color(red: 1.0, green: 0.56, blue: 0.41)
  ],
  "Transfile": [
    Color(red: 0.09, green: 0.75, blue: 0.99),
    Color(red: 0.8, green: 0.19, blue: 0.4)
  ],
  "Tranquil": [
    Color(red: 0.93, green: 0.8, blue: 0.64),
    Color(red: 0.94, green: 0.38, blue: 0.62)
  ],
  "Red Ocean": [
    Color(red: 0.11, green: 0.26, blue: 0.31),
    Color(red: 0.64, green: 0.22, blue: 0.19)
  ],
  "Shahabi": [
    Color(red: 0.66, green: 0.0, blue: 0.47),
    Color(red: 0.4, green: 1.0, blue: 0.0)
  ],
  "Alihossein": [
    Color(red: 0.97, green: 1.0, blue: 0.0),
    Color(red: 0.86, green: 0.21, blue: 0.64)
  ],
  "Ali": [
    Color(red: 1.0, green: 0.29, blue: 0.12),
    Color(red: 0.12, green: 0.87, blue: 1.0)
  ],
  "Purple White": [
    Color(red: 0.73, green: 0.33, blue: 0.44),
    Color(red: 0.96, green: 0.89, blue: 0.85)
  ],
  "Colors Of Sky": [
    Color(red: 0.88, green: 0.92, blue: 0.99),
    Color(red: 0.81, green: 0.87, blue: 0.95)
  ],
  "Decent": [
    Color(red: 0.3, green: 0.63, blue: 0.69),
    Color(red: 0.77, green: 0.88, blue: 0.9)
  ],
  "Deep Space": [
    Color(red: 0.0, green: 0.0, blue: 0.0),
    Color(red: 0.26, green: 0.26, blue: 0.26)
  ],
  "Dark Skies": [
    Color(red: 0.29, green: 0.47, blue: 0.63),
    Color(red: 0.16, green: 0.24, blue: 0.32)
  ],
  "Suzy": [
    Color(red: 0.51, green: 0.3, blue: 0.61),
    Color(red: 0.82, green: 0.31, blue: 0.84)
  ],
  "Superman": [
    Color(red: 0.0, green: 0.6, blue: 0.97),
    Color(red: 0.95, green: 0.09, blue: 0.07)
  ],
  "Nighthawk": [
    Color(red: 0.16, green: 0.5, blue: 0.73),
    Color(red: 0.17, green: 0.24, blue: 0.31)
  ],
  "Forest": [
    Color(red: 0.35, green: 0.25, blue: 0.22),
    Color(red: 0.17, green: 0.47, blue: 0.27)
  ],
  "Miami Dolphins": [
    Color(red: 0.3, green: 0.63, blue: 0.69),
    Color(red: 0.83, green: 0.62, blue: 0.22)
  ],
  "Minnesota Vikings": [
    Color(red: 0.34, green: 0.08, blue: 0.69),
    Color(red: 0.86, green: 0.84, blue: 0.36)
  ],
  "Christmas": [
    Color(red: 0.18, green: 0.45, blue: 0.21),
    Color(red: 0.67, green: 0.23, blue: 0.22)
  ],
  "Joomla": [
    Color(red: 0.12, green: 0.24, blue: 0.45),
    Color(red: 0.16, green: 0.32, blue: 0.6)
  ],
  "Pizelex": [
    Color(red: 0.07, green: 0.26, blue: 0.34),
    Color(red: 0.95, green: 0.58, blue: 0.57)
  ],
  "Haikus": [
    Color(red: 0.99, green: 0.45, blue: 0.42),
    Color(red: 1.0, green: 0.56, blue: 0.41)
  ],
  "Pale Wood": [
    Color(red: 0.92, green: 0.8, blue: 0.64),
    Color(red: 0.84, green: 0.68, blue: 0.48)
  ],
  "Purplin": [
    Color(red: 0.42, green: 0.19, blue: 0.58),
    Color(red: 0.63, green: 0.27, blue: 1.0)
  ],
  "Inbox": [
    Color(red: 0.27, green: 0.5, blue: 0.79),
    Color(red: 0.34, green: 0.57, blue: 0.78)
  ],
  "Blush": [
    Color(red: 0.7, green: 0.27, blue: 0.57),
    Color(red: 0.95, green: 0.37, blue: 0.47)
  ],
  "Back To The Future": [
    Color(red: 0.75, green: 0.14, blue: 0.15),
    Color(red: 0.94, green: 0.8, blue: 0.21)
  ],
  "Poncho": [
    Color(red: 0.25, green: 0.23, blue: 0.24),
    Color(red: 0.75, green: 0.35, blue: 0.41)
  ],
  "Green And Blue": [
    Color(red: 0.76, green: 0.9, blue: 0.61),
    Color(red: 0.39, green: 0.7, blue: 0.96)
  ],
  "Light Orange": [
    Color(red: 1.0, green: 0.72, blue: 0.37),
    Color(red: 0.93, green: 0.56, blue: 0.01)
  ],
  "Netflix": [
    Color(red: 0.56, green: 0.05, blue: 0.0),
    Color(red: 0.12, green: 0.11, blue: 0.09)
  ],
  "Little Leaf": [
    Color(red: 0.46, green: 0.72, blue: 0.32),
    Color(red: 0.55, green: 0.76, blue: 0.44)
  ],
  "Deep Purple": [
    Color(red: 0.4, green: 0.23, blue: 0.72),
    Color(red: 0.32, green: 0.18, blue: 0.66)
  ],
  "Back To Earth": [
    Color(red: 0.0, green: 0.79, blue: 1.0),
    Color(red: 0.57, green: 1.0, blue: 0.62)
  ],
  "Master Card": [
    Color(red: 0.96, green: 0.42, blue: 0.27),
    Color(red: 0.93, green: 0.66, blue: 0.29)
  ],
  "Clear Sky": [
    Color(red: 0.0, green: 0.36, blue: 0.59),
    Color(red: 0.21, green: 0.22, blue: 0.58)
  ],
  "Passion": [
    Color(red: 0.9, green: 0.22, blue: 0.21),
    Color(red: 0.89, green: 0.36, blue: 0.36)
  ],
  "Timber": [
    Color(red: 0.99, green: 0.0, blue: 1.0),
    Color(red: 0.0, green: 0.86, blue: 0.87)
  ],
  "Between Night And Day": [
    Color(red: 0.17, green: 0.24, blue: 0.31),
    Color(red: 0.2, green: 0.6, blue: 0.86)
  ],
  "Sage Persuasion": [
    Color(red: 0.8, green: 0.8, blue: 0.7),
    Color(red: 0.46, green: 0.46, blue: 0.1)
  ],
  "Lizard": [
    Color(red: 0.19, green: 0.26, blue: 0.32),
    Color(red: 0.84, green: 0.82, blue: 0.8)
  ],
  "Piglet": [
    Color(red: 0.93, green: 0.61, blue: 0.65),
    Color(red: 1.0, green: 0.87, blue: 0.88)
  ],
  "Dark Knight": [
    Color(red: 0.73, green: 0.55, blue: 0.01),
    Color(red: 0.09, green: 0.09, blue: 0.09)
  ],
  "Curiosity Blue": [
    Color(red: 0.32, green: 0.32, blue: 0.32),
    Color(red: 0.24, green: 0.45, blue: 0.71)
  ],
  "Ukraine": [
    Color(red: 0.0, green: 0.31, blue: 0.98),
    Color(red: 1.0, green: 0.98, blue: 0.3)
  ],
  "Green To Dark": [
    Color(red: 0.42, green: 0.57, blue: 0.07),
    Color(red: 0.08, green: 0.08, blue: 0.09)
  ],
  "Fresh Turboscent": [
    Color(red: 0.95, green: 0.95, blue: 0.71),
    Color(red: 0.07, green: 0.31, blue: 0.35)
  ],
  "Koko Caramel": [
    Color(red: 0.82, green: 0.57, blue: 0.24),
    Color(red: 1.0, green: 0.82, blue: 0.58)
  ],
  "Virgin America": [
    Color(red: 0.48, green: 0.26, blue: 0.59),
    Color(red: 0.86, green: 0.14, blue: 0.19)
  ],
  "Portrait": [
    Color(red: 0.56, green: 0.62, blue: 0.67),
    Color(red: 0.93, green: 0.95, blue: 0.95)
  ],
  "Turquoise Flow": [
    Color(red: 0.07, green: 0.42, blue: 0.54),
    Color(red: 0.15, green: 0.47, blue: 0.44)
  ],
  "Vine": [
    Color(red: 0.0, green: 0.75, blue: 0.56),
    Color(red: 0.0, green: 0.08, blue: 0.06)
  ],
  "Flickr": [
    Color(red: 1.0, green: 0.0, blue: 0.52),
    Color(red: 0.2, green: 0.0, blue: 0.11)
  ],
  "Instagram": [
    Color(red: 0.51, green: 0.23, blue: 0.71),
    Color(red: 0.99, green: 0.11, blue: 0.11),
    Color(red: 0.99, green: 0.69, blue: 0.27)
  ],
  "Atlas": [
    Color(red: 1.0, green: 0.67, blue: 0.37),
    Color(red: 0.78, green: 0.47, blue: 0.82),
    Color(red: 0.29, green: 0.75, blue: 0.78)
  ],
  "Twitch": [
    Color(red: 0.39, green: 0.25, blue: 0.65),
    Color(red: 0.16, green: 0.03, blue: 0.27)
  ],
  "Pastel Orange At The Sun": [
    Color(red: 1.0, green: 0.7, blue: 0.28),
    Color(red: 1.0, green: 0.8, blue: 0.2)
  ],
  "Endless River": [
    Color(red: 0.26, green: 0.81, blue: 0.64),
    Color(red: 0.09, green: 0.35, blue: 0.62)
  ],
  "Predawn": [
    Color(red: 1.0, green: 0.63, blue: 0.5),
    Color(red: 0.0, green: 0.13, blue: 0.24)
  ],
  "Purple Bliss": [
    Color(red: 0.21, green: 0.0, blue: 0.2),
    Color(red: 0.04, green: 0.53, blue: 0.58)
  ],
  "Talking To Mice Elf": [
    Color(red: 0.58, green: 0.56, blue: 0.6),
    Color(red: 0.18, green: 0.08, blue: 0.22)
  ],
  "Hersheys": [
    Color(red: 0.12, green: 0.07, blue: 0.05),
    Color(red: 0.6, green: 0.52, blue: 0.47)
  ],
  "Crazy Orange I": [
    Color(red: 0.83, green: 0.51, blue: 0.07),
    Color(red: 0.66, green: 0.2, blue: 0.47)
  ],
  "Between The Clouds": [
    Color(red: 0.45, green: 0.78, blue: 0.66),
    Color(red: 0.22, green: 0.23, blue: 0.27)
  ],
  "Metallic Toad": [
    Color(red: 0.67, green: 0.73, blue: 0.67),
    Color(red: 1.0, green: 1.0, blue: 1.0)
  ],
  "Martini": [
    Color(red: 0.99, green: 0.99, blue: 0.28),
    Color(red: 0.14, green: 1.0, blue: 0.25)
  ],
  "Friday": [
    Color(red: 0.51, green: 0.64, blue: 0.83),
    Color(red: 0.71, green: 0.98, blue: 1.0)
  ],
  "Servquick": [
    Color(red: 0.28, green: 0.33, blue: 0.39),
    Color(red: 0.16, green: 0.2, blue: 0.24)
  ],
  "Behongo": [
    Color(red: 0.32, green: 0.76, blue: 0.2),
    Color(red: 0.02, green: 0.09, blue: 0.0)
  ],
  "Soundcloud": [
    Color(red: 1.0, green: 0.55, blue: 0.0),
    Color(red: 0.97, green: 0.21, blue: 0.0)
  ],
  "Facebook Messenger": [
    Color(red: 0.0, green: 0.78, blue: 1.0),
    Color(red: 0.0, green: 0.45, blue: 1.0)
  ],
  "Shore": [
    Color(red: 0.44, green: 0.88, blue: 0.96),
    Color(red: 1.0, green: 0.82, blue: 0.58)
  ],
  "Cheer Up Emo Kid": [
    Color(red: 0.33, green: 0.38, blue: 0.44),
    Color(red: 1.0, green: 0.42, blue: 0.42)
  ],
  "Amethyst": [
    Color(red: 0.62, green: 0.31, blue: 0.73),
    Color(red: 0.43, green: 0.28, blue: 0.67)
  ],
  "Man Of Steel": [
    Color(red: 0.47, green: 0.01, blue: 0.02),
    Color(red: 0.02, green: 0.07, blue: 0.38)
  ],
  "Neon Life": [
    Color(red: 0.7, green: 1.0, blue: 0.67),
    Color(red: 0.07, green: 1.0, blue: 0.97)
  ],
  "Teal Love": [
    Color(red: 0.67, green: 1.0, blue: 0.66),
    Color(red: 0.07, green: 1.0, blue: 0.74)
  ],
  "Red Mist": [
    Color(red: 0.0, green: 0.0, blue: 0.0),
    Color(red: 0.91, green: 0.3, blue: 0.24)
  ],
  "Starfall": [
    Color(red: 0.94, green: 0.76, blue: 0.48),
    Color(red: 0.29, green: 0.07, blue: 0.28)
  ],
  "Dance To Forget": [
    Color(red: 1.0, green: 0.31, blue: 0.31),
    Color(red: 0.98, green: 0.83, blue: 0.14)
  ],
  "Parklife": [
    Color(red: 0.68, green: 0.82, blue: 0.0),
    Color(red: 0.48, green: 0.57, blue: 0.04)
  ],
  "Cherryblossoms": [
    Color(red: 0.98, green: 0.83, blue: 0.91),
    Color(red: 0.73, green: 0.22, blue: 0.49)
  ],
  "Ash": [
    Color(red: 0.38, green: 0.42, blue: 0.53),
    Color(red: 0.25, green: 0.3, blue: 0.42)
  ],
  "Virgin": [
    Color(red: 0.79, green: 1.0, blue: 0.75),
    Color(red: 1.0, green: 0.69, blue: 0.74)
  ],
  "Earthly": [
    Color(red: 0.39, green: 0.57, blue: 0.45),
    Color(red: 0.86, green: 0.84, blue: 0.64)
  ],
  "Dirty Fog": [
    Color(red: 0.73, green: 0.58, blue: 0.84),
    Color(red: 0.55, green: 0.65, blue: 0.86)
  ],
  "The Strain": [
    Color(red: 0.53, green: 0.0, blue: 0.0),
    Color(red: 0.1, green: 0.04, blue: 0.02)
  ],
  "Reef": [
    Color(red: 0.0, green: 0.82, blue: 1.0),
    Color(red: 0.23, green: 0.48, blue: 0.84)
  ],
  "Candy": [
    Color(red: 0.83, green: 0.58, blue: 0.61),
    Color(red: 0.75, green: 0.9, blue: 0.73)
  ],
  "Autumn": [
    Color(red: 0.85, green: 0.82, blue: 0.6),
    Color(red: 0.69, green: 0.85, blue: 0.73)
  ],
  "Nelson": [
    Color(red: 0.95, green: 0.44, blue: 0.61),
    Color(red: 1.0, green: 0.58, blue: 0.45)
  ],
  "Winter": [
    Color(red: 0.9, green: 0.85, blue: 0.85),
    Color(red: 0.15, green: 0.25, blue: 0.27)
  ],
  "Forever Lost": [
    Color(red: 0.36, green: 0.25, blue: 0.34),
    Color(red: 0.66, green: 0.79, blue: 0.73)
  ],
  "Almost": [
    Color(red: 0.87, green: 0.84, blue: 0.95),
    Color(red: 0.98, green: 0.67, blue: 0.66)
  ],
  "Moor": [
    Color(red: 0.38, green: 0.38, blue: 0.38),
    Color(red: 0.61, green: 0.77, blue: 0.76)
  ],
  "Aqualicious": [
    Color(red: 0.31, green: 0.79, blue: 0.76),
    Color(red: 0.59, green: 0.87, blue: 0.85)
  ],
  "Misty Meadow": [
    Color(red: 0.13, green: 0.37, blue: 0.0),
    Color(red: 0.89, green: 0.89, blue: 0.85)
  ],
  "Kyoto": [
    Color(red: 0.76, green: 0.08, blue: 0.0),
    Color(red: 1.0, green: 0.77, blue: 0.0)
  ],
  "Sirius Tamed": [
    Color(red: 0.94, green: 0.94, blue: 0.73),
    Color(red: 0.83, green: 0.83, blue: 0.87)
  ],
  "Jonquil": [
    Color(red: 1.0, green: 0.93, blue: 0.93),
    Color(red: 0.87, green: 0.94, blue: 0.73)
  ],
  "Petrichor": [
    Color(red: 0.4, green: 0.4, blue: 0.0),
    Color(red: 0.6, green: 0.6, blue: 0.4)
  ],
  "A Lost Memory": [
    Color(red: 0.87, green: 0.38, blue: 0.38),
    Color(red: 1.0, green: 0.72, blue: 0.55)
  ],
  "Vasily": [
    Color(red: 0.91, green: 0.83, blue: 0.38),
    Color(red: 0.2, green: 0.2, blue: 0.2)
  ],
  "Blurry Beach": [
    Color(red: 0.84, green: 0.2, blue: 0.41),
    Color(red: 0.8, green: 0.68, blue: 0.43)
  ],
  "Namn": [
    Color(red: 0.65, green: 0.22, blue: 0.22),
    Color(red: 0.48, green: 0.16, blue: 0.16)
  ],
  "Day Tripper": [
    Color(red: 0.97, green: 0.34, blue: 0.65),
    Color(red: 1.0, green: 0.35, blue: 0.35)
  ],
  "Pinot Noir": [
    Color(red: 0.29, green: 0.42, blue: 0.72),
    Color(red: 0.09, green: 0.16, blue: 0.28)
  ],
  "Miaka": [
    Color(red: 0.99, green: 0.21, blue: 0.3),
    Color(red: 0.04, green: 0.75, blue: 0.74)
  ],
  "Army": [
    Color(red: 0.25, green: 0.3, blue: 0.04),
    Color(red: 0.45, green: 0.48, blue: 0.09)
  ],
  "Shrimpy": [
    Color(red: 0.89, green: 0.23, blue: 0.08),
    Color(red: 0.9, green: 0.32, blue: 0.27)
  ],
  "Influenza": [
    Color(red: 0.75, green: 0.28, blue: 0.28),
    Color(red: 0.28, green: 0.0, blue: 0.28)
  ],
  "Calm Darya": [
    Color(red: 0.37, green: 0.17, blue: 0.51),
    Color(red: 0.29, green: 0.63, blue: 0.62)
  ],
  "Bourbon": [
    Color(red: 0.93, green: 0.44, blue: 0.4),
    Color(red: 0.95, green: 0.63, blue: 0.51)
  ],
  "Stellar": [
    Color(red: 0.45, green: 0.45, blue: 0.75),
    Color(red: 0.2, green: 0.54, blue: 0.78)
  ],
  "Clouds": [
    Color(red: 0.93, green: 0.91, blue: 0.9),
    Color(red: 1.0, green: 1.0, blue: 1.0)
  ],
  "Moonrise": [
    Color(red: 0.85, green: 0.89, blue: 0.97),
    Color(red: 0.84, green: 0.64, blue: 0.64)
  ],
  "Peach": [
    Color(red: 0.93, green: 0.26, blue: 0.39),
    Color(red: 1.0, green: 0.93, blue: 0.74)
  ],
  "Dracula": [
    Color(red: 0.86, green: 0.14, blue: 0.14),
    Color(red: 0.29, green: 0.34, blue: 0.62)
  ],
  "Mantle": [
    Color(red: 0.14, green: 0.78, blue: 0.86),
    Color(red: 0.32, green: 0.29, blue: 0.62)
  ],
  "Titanium": [
    Color(red: 0.16, green: 0.19, blue: 0.28),
    Color(red: 0.52, green: 0.58, blue: 0.6)
  ],
  "Opa": [
    Color(red: 0.24, green: 0.49, blue: 0.67),
    Color(red: 1.0, green: 0.89, blue: 0.48)
  ],
  "Sea Blizz": [
    Color(red: 0.11, green: 0.85, blue: 0.82),
    Color(red: 0.58, green: 0.93, blue: 0.78)
  ],
  "Midnight City": [
    Color(red: 0.14, green: 0.15, blue: 0.15),
    Color(red: 0.25, green: 0.26, blue: 0.27)
  ],
  "Mystic": [
    Color(red: 0.46, green: 0.5, blue: 0.6),
    Color(red: 0.84, green: 0.87, blue: 0.91)
  ],
  "Shroom Haze": [
    Color(red: 0.36, green: 0.15, blue: 0.55),
    Color(red: 0.26, green: 0.54, blue: 0.64)
  ],
  "Moss": [
    Color(red: 0.07, green: 0.31, blue: 0.37),
    Color(red: 0.44, green: 0.7, blue: 0.5)
  ],
  "Bora Bora": [
    Color(red: 0.17, green: 0.75, blue: 0.89),
    Color(red: 0.92, green: 0.93, blue: 0.78)
  ],
  "Venice Blue": [
    Color(red: 0.03, green: 0.31, blue: 0.47),
    Color(red: 0.52, green: 0.85, blue: 0.81)
  ],
  "Electric Violet": [
    Color(red: 0.28, green: 0.46, blue: 0.9),
    Color(red: 0.56, green: 0.33, blue: 0.91)
  ],
  "Kashmir": [
    Color(red: 0.38, green: 0.26, blue: 0.52),
    Color(red: 0.32, green: 0.39, blue: 0.58)
  ],
  "Steel Gray": [
    Color(red: 0.12, green: 0.11, blue: 0.17),
    Color(red: 0.57, green: 0.55, blue: 0.67)
  ],
  "Mirage": [
    Color(red: 0.09, green: 0.13, blue: 0.16),
    Color(red: 0.23, green: 0.38, blue: 0.45)
  ],
  "Juicy Orange": [
    Color(red: 1.0, green: 0.5, blue: 0.03),
    Color(red: 1.0, green: 0.78, blue: 0.22)
  ],
  "Mojito": [
    Color(red: 0.11, green: 0.59, blue: 0.42),
    Color(red: 0.58, green: 0.98, blue: 0.73)
  ],
  "Cherry": [
    Color(red: 0.92, green: 0.2, blue: 0.29),
    Color(red: 0.96, green: 0.36, blue: 0.26)
  ],
  "Pinky": [
    Color(red: 0.87, green: 0.37, blue: 0.54),
    Color(red: 0.97, green: 0.73, blue: 0.59)
  ],
  "Sea Weed": [
    Color(red: 0.3, green: 0.72, blue: 0.77),
    Color(red: 0.24, green: 0.83, blue: 0.68)
  ],
  "Stripe": [
    Color(red: 0.12, green: 0.64, blue: 1.0),
    Color(red: 0.07, green: 0.85, blue: 0.98),
    Color(red: 0.65, green: 1.0, blue: 0.8)
  ],
  "Purple Paradise": [
    Color(red: 0.11, green: 0.17, blue: 0.39),
    Color(red: 0.97, green: 0.8, blue: 0.85)
  ],
  "Sunrise": [
    Color(red: 1.0, green: 0.32, blue: 0.18),
    Color(red: 0.94, green: 0.6, blue: 0.1)
  ],
  "Aqua Marine": [
    Color(red: 0.1, green: 0.16, blue: 0.5),
    Color(red: 0.15, green: 0.82, blue: 0.81)
  ],
  "Aubergine": [
    Color(red: 0.67, green: 0.03, blue: 0.42),
    Color(red: 0.38, green: 0.02, blue: 0.37)
  ],
  "Bloody Mary": [
    Color(red: 1.0, green: 0.32, blue: 0.18),
    Color(red: 0.87, green: 0.14, blue: 0.46)
  ],
  "Mango Pulp": [
    Color(red: 0.94, green: 0.6, blue: 0.1),
    Color(red: 0.93, green: 0.87, blue: 0.36)
  ],
  "Frozen": [
    Color(red: 0.25, green: 0.23, blue: 0.29),
    Color(red: 0.91, green: 0.91, blue: 0.73)
  ],
  "Rose Water": [
    Color(red: 0.9, green: 0.36, blue: 0.53),
    Color(red: 0.37, green: 0.76, blue: 0.89)
  ],
  "Horizon": [
    Color(red: 0.0, green: 0.22, blue: 0.45),
    Color(red: 0.9, green: 0.9, blue: 0.75)
  ],
  "Monte Carlo": [
    Color(red: 0.8, green: 0.58, blue: 0.75),
    Color(red: 0.86, green: 0.83, blue: 0.71),
    Color(red: 0.48, green: 0.63, blue: 0.82)
  ],
  "Lemon Twist": [
    Color(red: 0.24, green: 0.65, blue: 0.36),
    Color(red: 0.71, green: 0.67, blue: 0.29)
  ],
  "Emerald Water": [
    Color(red: 0.2, green: 0.56, blue: 0.31),
    Color(red: 0.34, green: 0.71, blue: 0.83)
  ],
  "Intuitive Purple": [
    Color(red: 0.85, green: 0.13, blue: 1.0),
    Color(red: 0.59, green: 0.2, blue: 0.93)
  ],
  "Green Beach": [
    Color(red: 0.01, green: 0.67, blue: 0.69),
    Color(red: 0.0, green: 0.8, blue: 0.67)
  ],
  "Sunny Days": [
    Color(red: 0.93, green: 0.9, blue: 0.45),
    Color(red: 0.88, green: 0.96, blue: 0.77)
  ],
  "Playing With Reds": [
    Color(red: 0.83, green: 0.06, blue: 0.15),
    Color(red: 0.92, green: 0.22, blue: 0.3)
  ],
  "Harmonic Energy": [
    Color(red: 0.09, green: 0.63, blue: 0.52),
    Color(red: 0.96, green: 0.82, blue: 0.25)
  ],
  "Cool Brown": [
    Color(red: 0.38, green: 0.22, blue: 0.07),
    Color(red: 0.7, green: 0.62, blue: 0.58)
  ],
  "Youtube": [
    Color(red: 0.9, green: 0.18, blue: 0.15),
    Color(red: 0.7, green: 0.07, blue: 0.09)
  ],
  "Noon To Dusk": [
    Color(red: 1.0, green: 0.43, blue: 0.5),
    Color(red: 0.75, green: 0.91, blue: 1.0)
  ],
  "Hazel": [
    Color(red: 0.47, green: 0.63, blue: 0.83),
    Color(red: 0.47, green: 0.8, blue: 0.79),
    Color(red: 0.9, green: 0.52, blue: 0.68)
  ],
  "Nimvelo": [
    Color(red: 0.19, green: 0.28, blue: 0.33),
    Color(red: 0.15, green: 0.63, blue: 0.85)
  ],
  "Sea Blue": [
    Color(red: 0.17, green: 0.35, blue: 0.46),
    Color(red: 0.31, green: 0.26, blue: 0.46)
  ],
  "Blooker20": [
    Color(red: 0.9, green: 0.36, blue: 0.0),
    Color(red: 0.98, green: 0.83, blue: 0.14)
  ],
  "Sexy Blue": [
    Color(red: 0.13, green: 0.58, blue: 0.69),
    Color(red: 0.43, green: 0.84, blue: 0.93)
  ],
  "Purple Love": [
    Color(red: 0.8, green: 0.17, blue: 0.37),
    Color(red: 0.46, green: 0.23, blue: 0.53)
  ],
  "Dimigo": [
    Color(red: 0.93, green: 0.0, blue: 0.55),
    Color(red: 0.99, green: 0.4, blue: 0.4)
  ],
  "Skyline": [
    Color(red: 0.08, green: 0.53, blue: 0.8),
    Color(red: 0.17, green: 0.2, blue: 0.7)
  ],
  "Sel": [
    Color(red: 0.0, green: 0.27, blue: 0.5),
    Color(red: 0.65, green: 0.8, blue: 0.51)
  ],
  "Sky": [
    Color(red: 0.03, green: 0.4, blue: 0.52),
    Color(red: 0.06, green: 0.06, blue: 0.06)
  ],
  "Petrol": [
    Color(red: 0.73, green: 0.82, blue: 0.77),
    Color(red: 0.33, green: 0.41, blue: 0.46)
  ],
  "Anamnisar": [
    Color(red: 0.59, green: 0.59, blue: 0.94),
    Color(red: 0.98, green: 0.78, blue: 0.83)
  ],
  "Copper": [
    Color(red: 0.72, green: 0.6, blue: 0.57),
    Color(red: 0.58, green: 0.44, blue: 0.42)
  ],
  "Royal Blue + Petrol": [
    Color(red: 0.73, green: 0.82, blue: 0.77),
    Color(red: 0.33, green: 0.41, blue: 0.46),
    Color(red: 0.16, green: 0.18, blue: 0.29)
  ],
  "Royal Blue": [
    Color(red: 0.33, green: 0.41, blue: 0.46),
    Color(red: 0.16, green: 0.18, blue: 0.29)
  ],
  "Windy": [
    Color(red: 0.67, green: 0.71, blue: 0.9),
    Color(red: 0.53, green: 0.99, blue: 0.91)
  ],
  "Rea": [
    Color(red: 1.0, green: 0.88, blue: 0.0),
    Color(red: 0.47, green: 0.62, blue: 0.05)
  ],
  "Bupe": [
    Color(red: 0.0, green: 0.25, blue: 0.42),
    Color(red: 0.89, green: 0.9, blue: 0.9)
  ],
  "Mango": [
    Color(red: 1.0, green: 0.89, blue: 0.35),
    Color(red: 1.0, green: 0.65, blue: 0.32)
  ],
  "Reaqua": [
    Color(red: 0.47, green: 0.62, blue: 0.05),
    Color(red: 0.67, green: 0.73, blue: 0.47)
  ],
  "Lunada": [
    Color(red: 0.33, green: 0.2, blue: 1.0),
    Color(red: 0.13, green: 0.74, blue: 1.0),
    Color(red: 0.65, green: 1.0, blue: 0.8)
  ],
  "Bluelagoo": [
    Color(red: 0.0, green: 0.32, blue: 0.83),
    Color(red: 0.26, green: 0.39, blue: 0.97),
    Color(red: 0.44, green: 0.69, blue: 0.99)
  ],
  "Anwar": [
    Color(red: 0.2, green: 0.3, blue: 0.31),
    Color(red: 0.8, green: 0.79, blue: 0.65)
  ],
  "Combi": [
    Color(red: 0.0, green: 0.25, blue: 0.42),
    Color(red: 0.47, green: 0.62, blue: 0.05),
    Color(red: 1.0, green: 0.88, blue: 0.0)
  ],
  "Ver Black": [
    Color(red: 0.97, green: 0.97, blue: 0.97),
    Color(red: 0.67, green: 0.73, blue: 0.47)
  ],
  "Ver": [
    Color(red: 1.0, green: 0.88, blue: 0.0),
    Color(red: 0.47, green: 0.62, blue: 0.05)
  ],
  "Blu": [
    Color(red: 0.0, green: 0.25, blue: 0.42),
    Color(red: 0.89, green: 0.9, blue: 0.9)
  ]
]
