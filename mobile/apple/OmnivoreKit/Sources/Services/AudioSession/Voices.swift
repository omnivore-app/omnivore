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
  case frFR = "French (France)"
  case deDE = "German (Germany)"
  case hiIN = "Hindi (India)"
  case itIT = "Italian (Italy)"
  case esES = "Spanish (Spain)"
  case jaJP = "Japanese (Japan)"
  case nlNL = "Dutch (Netherlands)"
  case ptBR = "Portuguese (Brazil)"
  case taIN = "Tamil (India)"
  case taLK = "Tamil (Sri Lanka)"
  case taMY = "Tamil (Malaysia)"
  case taSG = "Tamil (Singapore)"
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

// swiftlint:disable line_length
public enum Voices {
  public static func isUltraRealisticVoice(_ voiceKey: String) -> Bool {
    UltraPairs.contains(where: { voice in
      voice.firstKey == voiceKey || voice.secondKey == voiceKey
    })
  }

  public static func isOpenAIVoice(_ voiceKey: String) -> Bool {
    voiceKey.starts(with: "openai-")
  }

  public static let English = VoiceLanguage(key: "en",
                                            name: "English",
                                            defaultVoice: "en-US-ChristopherNeural",
                                            categories: [.enUS, .enAU, .enCA, .enIE, .enIN, .enSG, .enUK])

  public static let Languages = [
    English,
    VoiceLanguage(key: "zh", name: "Chinese", defaultVoice: "zh-CN-XiaochenNeural", categories: [.zhCN]),
    VoiceLanguage(key: "de", name: "German", defaultVoice: "de-CH-JanNeural", categories: [.deDE]),
    VoiceLanguage(key: "fr", name: "French", defaultVoice: "fr-FR-HenriNeural", categories: [.frFR]),
    VoiceLanguage(key: "hi", name: "Hindi", defaultVoice: "hi-IN-MadhurNeural", categories: [.hiIN]),
    VoiceLanguage(key: "it", name: "Italian", defaultVoice: "it-IT-BenignoNeural", categories: [.itIT]),
    VoiceLanguage(key: "ja", name: "Japanese", defaultVoice: "ja-JP-NanamiNeural", categories: [.jaJP]),
    VoiceLanguage(key: "es", name: "Spanish", defaultVoice: "es-ES-AlvaroNeural", categories: [.esES]),
    VoiceLanguage(key: "nl", name: "Dutch", defaultVoice: "nl-NL-XiaochenNeural", categories: [.nlNL]),
    VoiceLanguage(key: "pt", name: "Portuguese", defaultVoice: "pt-BR-AntonioNeural", categories: [.ptBR]),
    VoiceLanguage(key: "ta", name: "Tamil", defaultVoice: "ta-IN-PallaviNeural", categories: [.taIN, .taLK, .taMY, .taSG])
  ]

  public static let Pairs = [
    VoicePair(firstKey: "openai-alloy", secondKey: "openai-echo", firstName: "Alloy", secondName: "Echo", language: "en-US", category: .enUS),
    VoicePair(firstKey: "openai-fable", secondKey: "openai-onyx", firstName: "Fable", secondName: "Onyx", language: "en-US", category: .enUS),
    VoicePair(firstKey: "openai-nova", secondKey: "openai-shimmer", firstName: "Nova", secondName: "Shimmer", language: "en-US", category: .enUS),

    VoicePair(firstKey: "en-US-JennyNeural", secondKey: "en-US-BrandonNeural", firstName: "Jenny", secondName: "Brandon", language: "en-US", category: .enUS),
    VoicePair(firstKey: "en-US-CoraNeural", secondKey: "en-US-ChristopherNeural", firstName: "Cora", secondName: "Christopher", language: "en-US", category: .enUS),
    VoicePair(firstKey: "en-US-ElizabethNeural", secondKey: "en-US-EricNeural", firstName: "Elizabeth", secondName: "Eric", language: "en-US", category: .enUS),
    VoicePair(firstKey: "en-CA-ClaraNeural", secondKey: "en-CA-LiamNeural", firstName: "Clara", secondName: "Liam", language: "en-CA", category: .enCA),
    VoicePair(firstKey: "en-GB-LibbyNeural", secondKey: "en-GB-EthanNeural", firstName: "Libby", secondName: "Ethan", language: "en-GB", category: .enUK),
    VoicePair(firstKey: "en-AU-NatashaNeural", secondKey: "en-AU-WilliamNeural", firstName: "Natasha", secondName: "William", language: "en-AU", category: .enAU),
    VoicePair(firstKey: "en-IE-ConnorNeural", secondKey: "en-IE-EmilyNeural", firstName: "Connor", secondName: "Emily", language: "en-IE", category: .enIE),
    VoicePair(firstKey: "en-IN-NeerjaNeural", secondKey: "en-IN-PrabhatNeural", firstName: "Neerja", secondName: "Prabhat", language: "en-IN", category: .enIN),
    VoicePair(firstKey: "en-SG-LunaNeural", secondKey: "en-SG-WayneNeural", firstName: "Luna", secondName: "Wayne", language: "en-SG", category: .enSG),
    VoicePair(firstKey: "fr-FR-HenriNeural", secondKey: "fr-FR-DeniseNeural", firstName: "Henri", secondName: "Denise", language: "en-FR", category: .frFR),
    VoicePair(firstKey: "zh-CN-XiaochenNeural", secondKey: "zh-CN-XiaohanNeural", firstName: "Xiaochen", secondName: "Xiaohan", language: "zh-CN", category: .zhCN),
    VoicePair(firstKey: "zh-CN-XiaoxiaoNeural", secondKey: "zh-CN-YunyangNeural", firstName: "Xiaoxiao", secondName: "Yunyang", language: "zh-CN", category: .zhCN),
    VoicePair(firstKey: "zh-CN-YunxiNeural", secondKey: "zh-CN-XiaoyiNeural", firstName: "Yunxi", secondName: "Xiaoyi", language: "zh-CN", category: .zhCN),
    VoicePair(firstKey: "es-ES-AlvaroNeural", secondKey: "es-ES-ElviraNeural", firstName: "Alvaro", secondName: "Elvira", language: "es-ES", category: .esES),
    VoicePair(firstKey: "de-CH-LeniNeural", secondKey: "de-DE-KatjaNeural", firstName: "Leni", secondName: "Katja", language: "de-DE", category: .deDE),
    VoicePair(firstKey: "de-DE-AmalaNeural", secondKey: "de-DE-BerndNeural", firstName: "Amala", secondName: "Bernd", language: "de-DE", category: .deDE),
    VoicePair(firstKey: "de-DE-ChristophNeural", secondKey: "de-DE-LouisaNeural", firstName: "Christoph", secondName: "Louisa", language: "de-DE", category: .deDE),
    VoicePair(firstKey: "ja-JP-NanamiNeural", secondKey: "ja-JP-KeitaNeural", firstName: "Nanami", secondName: "Keita", language: "ja-JP", category: .jaJP),
    VoicePair(firstKey: "hi-IN-MadhurNeural", secondKey: "hi-IN-SwaraNeural", firstName: "Madhur", secondName: "Swara", language: "hi-IN", category: .hiIN),
    VoicePair(firstKey: "pt-BR-AntonioNeural", secondKey: "pt-BR-BrendaNeural", firstName: "Antonio", secondName: "Brenda", language: "pt-BR", category: .ptBR),
    VoicePair(firstKey: "ta-IN-PallaviNeural", secondKey: "ta-IN-ValluvarNeural", firstName: "Pallavi", secondName: "Valluvar", language: "ta-IN", category: .taIN),
    VoicePair(firstKey: "ta-LK-KumarNeural", secondKey: "ta-LK-SaranyaNeural", firstName: "Kumar", secondName: "Saranya", language: "ta-LK", category: .taLK),
    VoicePair(firstKey: "ta-MY-KaniNeural", secondKey: "ta-MY-SuryaNeural", firstName: "Kani", secondName: "Surya", language: "ta-MY", category: .taMY),
    VoicePair(firstKey: "ta-SG-AnbuNeural", secondKey: "ta-SG-VenbaNeural", firstName: "Anbu", secondName: "Venba", language: "ta-SG", category: .taSG),
    VoicePair(firstKey: "it-IT-BenignoNeural", secondKey: "it-IT-IsabellaNeural", firstName: "Benigno", secondName: "Isabella", language: "it-IT", category: .itIT),
    VoicePair(firstKey: "nl-NL-MaartenNeural", secondKey: "nl-NL-FennaNeural", firstName: "Maarten", secondName: "Fenna", language: "nl-NL", category: .nlNL)
  ]

  public static let UltraPairs = [
    VoicePair(firstKey: "Antoni", secondKey: "Serena", firstName: "Antoni", secondName: "Serena", language: "en-US", category: .enUS),
    VoicePair(firstKey: "Daniel", secondKey: "Dorothy", firstName: "Daniel", secondName: "Dorothy", language: "en-GB", category: .enUK),
    VoicePair(firstKey: "Michael", secondKey: "Matilda", firstName: "Michael", secondName: "Matilda", language: "en-US", category: .enUS),
    VoicePair(firstKey: "Josh", secondKey: "Bella", firstName: "Josh", secondName: "Bella", language: "en-US", category: .enUS)
  ]
}
