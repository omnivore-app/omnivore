// swiftlint:disable line_length

import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

let BRIEFING = """
## Inbox

- [ ] Who owns Real Madrid? How 'socios' remain in control of Los Blancos with president Florentino Perez at the helm | Sporting News Singapore | Kyle Bonn

## Subscriptions

- [ ] Astral Codex Ten
  - [ ] In Continued Defense Of Effective Altruism
  - [ ] God Help Us, Let's Try To Understand AI Monosemanticity
  - [ ] Open Thread 304
- [ ] The Pragmatic Engineer: Holiday Season Gift Ideas for Techies
- [ ] Golang Weekly: 🥶 Like me, Go 1.22 is now frozen
- [ ] Linus Ekenstam at Inside My Head: Enhance/upscale anything - Magnific AI
- [ ] Not Boring: Narrative Tug-of-War
- [ ] Colin Wright: One Sentence News / November 28, 2023
- [ ] Lenny's Newsletter
  - [ ] Lessons from going freemium: a decision that broke our business
  - [ ] Billion dollar failures, and billion dollar success | Tom Conrad (Quibi, Pandora, Pets.com, Snap, Zero)
- [ ] Aeon+Psyche Daily
  - [ ] When bereavement turns to activism
  - [ ] Why training won’t solve implicit bias
- [ ] Etgar Keret from Alphabet Soup: Alternative Fun Facts: Friendship Baby
- [ ] Huddle Up: How Populous Became The Top Sports Architecture Firm In The World
- [ ] Write With AI: How To (Productively) Edit Your Writing With ChatGPT

## Read

- [ ] Big brands keep dropping X over antisemitism; $75M loss, report estimates | Ars Technica
- [ ] My Hero [Comic]Geeks are Sexy Technology News
- [ ] 'Project DNA': How Japan's J1 League became a 'flair factory' for Europe's top clubs
- [ ] One Sentence News / November 27, 2023
- [ ] Only 1 day left to claim your 30% discount on annual membership!

## Highlights

- [ ] Big brands keep dropping X over antisemitism; $75M loss, report estimates | Ars Technica
  - [ ] Musk [responded](https://twitter.com/elonmusk/status/1728164110137725260) to an X user who [said](https://x.com/JohnnaCrider1/status/1728155588993970484?s=20) that some users were "mad" over lower ad revenue-sharing, saying there was "not much we can do if advertisers boycott or reduce spend on our platform."
- [ ] 'Project DNA': How Japan's J1 League became a 'flair factory' for Europe's top clubs
  - [ ] communities are being bound to clubs to create a nascent cultural heritage.
  - [ ] The FA and the J1 League brought prefectures, associations, clubs, coaches, universities and schools together to work for a common good. There is a Japanese concept – “ikigai” – which describes the sourcing of meaning or fulfilment from a purpose. The national team was the ikigai.
  - [ ] That aim is governed by regulation. It is now mandatory for every club to run their own academy with at least Under-15 and Under-18 teams. There are limits on the number of foreigners on each squad. The first team starting XI must contain at least two homegrown players and one Under-21 player.
  - [ ] Clubs are also rewarded for developing and playing academy graduates. The earlier the player moves, the more development they get in a different footballing culture and the more space it allows for another young player to replace them.
  - [ ] But in 2016, the Japanese FA created “Project DNA”, an initiative that aimed to adjust and amend existing training methods to produce more rounded footballers. They sent coaches to European clubs, including those in the Premier League. They studied and they cherry-picked and they vowed that insularity should never rule because Japan would never have enough alone.
  - [ ] Japan’s most successful recent exports (Mitoma at Brighton, Daichi Kamada at Eintracht Frankfurt, Takefusa Kubo at Real Sociedad) are fun, unpredictable, exciting attacking players.

## Archived

- [ ] Why Hunter Biden Asked to Testify Publicly in Impeachment Bid | TIME
"""

struct BriefingSection {
  let title: String
  var items = [String]()
}

@MainActor final class BriefingViewModel: ObservableObject {
  @Published var sections = [BriefingSection]()

  func load() async {
    var currentSection: BriefingSection?
    var sections = [BriefingSection]()
    let lines = BRIEFING.components(separatedBy: .newlines)

    lines.forEach { line in
      if line.starts(with: "## ") {
        if let currentSection = currentSection {
          sections.append(currentSection)
        }
        let title = line.replacingOccurrences(of: "## ", with: "")
        currentSection = BriefingSection(title: title)
      } else if line.isEmpty {
        return
      } else {
        currentSection?.items.append(line)
      }
    }
    if let currentSection = currentSection {
      sections.append(currentSection)
    }
    self.sections = sections
  }
}

@MainActor
struct BriefingView: View {
  @StateObject private var viewModel = BriefingViewModel()

  var body: some View {
    List {
      ForEach(viewModel.sections, id: \.title) { section in
        Section(section.title) {
          ForEach(section.items, id: \.self) { item in
            if item.starts(with: "- [ ] ") {
              let idx = item.index(item.startIndex, offsetBy: 6)
              HStack {
                Image(systemName: "square")
                Text(item.suffix(from: idx))
                  .lineLimit(2)
              }
            } else if item.starts(with: "  - [ ] ") {
              let idx = item.index(item.startIndex, offsetBy: 8)
              HStack {
                Text("  ")
                Image(systemName: "square")
                Text(item.suffix(from: idx))
                  .lineLimit(2)
              }
            }
          }
        }
      }
    }
    .listStyle(.plain)
    .task {
      await viewModel.load()
    }
  }
}
