//
//  Voices.swift
//
//
//  Created by Jackson Harper on 9/26/22.
//

import Foundation

public struct VoiceLanguage {
  public let key: String
  public let name: String
  public let defaultVoice: String
  public let categories: [VoiceCategory]
}

public struct VoiceItem {
  public let name: String
  public let key: String
  public let category: VoiceCategory
  public let selected: Bool
}

public enum VoiceCategory: String, CaseIterable {
  case enUS = "English (US)"
  case enAU = "English (Australia)"
  case enCA = "English (Canada)"
  case enIE = "English (Ireland)"
  case enIN = "English (India)"
  case enSG = "English (Singapore)"
  case enUK = "English (UK)"
  case deDE = "German (Germany)"
  case esES = "Spanish (Spain)"
  case jaJP = "Japanese (Japan)"
  case zhCN = "Chinese (China Mainland)"
}

public struct VoicePair {
  public let firstKey: String
  let secondKey: String

  public let firstName: String
  let secondName: String

  let language: String
  let category: VoiceCategory
}

public enum Voices {
  public static func isUltraRealisticVoice(_ voiceKey: String) -> Bool {
    UltraPairs.contains(where: { voice in
      voice.firstKey == voiceKey || voice.secondKey == voiceKey
    })
  }

  public static let English = VoiceLanguage(key: "en",
                                            name: "English",
                                            defaultVoice: "en-US-ChristopherNeural",
                                            categories: [.enUS, .enAU, .enCA, .enIE, .enIN, .enSG, .enUK])

  public static let Languages = [
    English,
    VoiceLanguage(key: "zh", name: "Chinese", defaultVoice: "zh-CN-XiaochenNeural", categories: [.zhCN]),
    VoiceLanguage(key: "de", name: "German", defaultVoice: "de-CH-JanNeural", categories: [.deDE]),
    VoiceLanguage(key: "ja", name: "Japanese", defaultVoice: "ja-JP-NanamiNeural", categories: [.jaJP]),
    VoiceLanguage(key: "es", name: "Spanish", defaultVoice: "es-ES-AlvaroNeural", categories: [.esES])
  ]

  // swiftlint:disable all
  public static let Pairs = [
    VoicePair(firstKey: "en-US-JennyNeural", secondKey: "en-US-BrandonNeural", firstName: "Jenny", secondName: "Brandon", language: "en-US", category: .enUS),
    VoicePair(firstKey: "en-US-CoraNeural", secondKey: "en-US-ChristopherNeural", firstName: "Cora", secondName: "Christopher", language: "en-US", category: .enUS),
    VoicePair(firstKey: "en-US-ElizabethNeural", secondKey: "en-US-EricNeural", firstName: "Elizabeth", secondName: "Eric", language: "en-US", category: .enUS),
    VoicePair(firstKey: "en-CA-ClaraNeural", secondKey: "en-CA-LiamNeural", firstName: "Clara", secondName: "Liam", language: "en-CA", category: .enCA),
    VoicePair(firstKey: "en-GB-LibbyNeural", secondKey: "en-GB-EthanNeural", firstName: "Libby", secondName: "Ethan", language: "en-GB", category: .enUK),
    VoicePair(firstKey: "en-AU-NatashaNeural", secondKey: "en-AU-WilliamNeural", firstName: "Natasha", secondName: "William", language: "en-AU", category: .enAU),
    VoicePair(firstKey: "en-IE-ConnorNeural", secondKey: "en-IE-EmilyNeural", firstName: "Connor", secondName: "Emily", language: "en-IE", category: .enIE),
    VoicePair(firstKey: "en-IN-NeerjaNeural", secondKey: "en-IN-PrabhatNeural", firstName: "Neerja", secondName: "Prabhat", language: "en-IN", category: .enIN),
    VoicePair(firstKey: "en-SG-LunaNeural", secondKey: "en-SG-WayneNeural", firstName: "Luna", secondName: "Wayne", language: "en-SG", category: .enSG),
    VoicePair(firstKey: "zh-CN-XiaochenNeural", secondKey: "zh-CN-XiaohanNeural", firstName: "Xiaochen", secondName: "Xiaohan", language: "zh-CN", category: .zhCN),
    VoicePair(firstKey: "zh-CN-XiaoxiaoNeural", secondKey: "zh-CN-YunyangNeural", firstName: "Xiaoxiao", secondName: "Yunyang", language: "zh-CN", category: .zhCN),
    VoicePair(firstKey: "es-ES-AlvaroNeural", secondKey: "es-ES-ElviraNeural", firstName: "Alvaro", secondName: "Elvira", language: "es-ES", category: .esES),
    VoicePair(firstKey: "de-CH-LeniNeural", secondKey: "de-DE-KatjaNeural", firstName: "Leni", secondName: "Katja", language: "de-DE", category: .deDE),
    VoicePair(firstKey: "de-DE-AmalaNeural", secondKey: "de-DE-BerndNeural", firstName: "Amala", secondName: "Bernd", language: "de-DE", category: .deDE),
    VoicePair(firstKey: "de-DE-ChristophNeural", secondKey: "de-DE-LouisaNeural", firstName: "Christoph", secondName: "Louisa", language: "de-DE", category: .deDE),
    VoicePair(firstKey: "ja-JP-NanamiNeural", secondKey: "ja-JP-KeitaNeural", firstName: "Nanami", secondName: "Keita", language: "ja-JP", category: .jaJP)
  ]

  public static let UltraPairs = [
    VoicePair(firstKey: "Larry", secondKey: "Susan", firstName: "Larry", secondName: "Susan", language: "en-US", category: .enUS),
    VoicePair(firstKey: "Jordan", secondKey: "William", firstName: "Jordan", secondName: "William", language: "en-US", category: .enUS),
    VoicePair(firstKey: "Evelyn", secondKey: "Axel", firstName: "Evelyn", secondName: "Axel", language: "en-US", category: .enUS),
    VoicePair(firstKey: "Nova", secondKey: "Owen", firstName: "Nova", secondName: "Owen", language: "en-US", category: .enUS),
    VoicePair(firstKey: "Frankie", secondKey: "Natalie", firstName: "Frankie", secondName: "Natalie", language: "en-US", category: .enUS),

    VoicePair(firstKey: "Daniel", secondKey: "Charlotte", firstName: "Daniel", secondName: "Charlotte", language: "en-CA", category: .enCA),
    VoicePair(firstKey: "Lillian", secondKey: "Aurora", firstName: "Lillian", secondName: "Aurora", language: "en-UK", category: .enUK),

    VoicePair(firstKey: "Oliver", secondKey: "Arthur", firstName: "Oliver", secondName: "Arthur", language: "en-UK", category: .enUK),
    VoicePair(firstKey: "Frederick", secondKey: "Hunter", firstName: "Frederick", secondName: "Hunter", language: "en-UK", category: .enUK),
    VoicePair(firstKey: "Nolan", secondKey: "Phoebe", firstName: "Nolan", secondName: "Phoebe", language: "en-UK", category: .enUK),
    VoicePair(firstKey: "Daisy", secondKey: "Stella", firstName: "Daisy", secondName: "Stella", language: "en-UK", category: .enUK)
  ]
}
