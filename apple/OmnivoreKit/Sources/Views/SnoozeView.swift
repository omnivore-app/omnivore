import Models
import SwiftUI

struct SnoozeView: View {
  @Binding var snoozePresented: Bool
  @Binding var itemToSnooze: FeedItem?
  let snoozeAction: (String, Date, String?) -> Void

  var body: some View {
    VStack {
      Spacer()

      HStack {
        SnoozeIconButtonView(snooze: Snooze.snoozeValues[0], action: { snoozeItem($0) })
        SnoozeIconButtonView(snooze: Snooze.snoozeValues[1], action: { snoozeItem($0) })
      }

      Spacer(minLength: 32)

      HStack {
        SnoozeIconButtonView(snooze: Snooze.snoozeValues[2], action: { snoozeItem($0) })
        SnoozeIconButtonView(snooze: Snooze.snoozeValues[3], action: { snoozeItem($0) })
      }
      Spacer()
    }.padding(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
  }

  private func snoozeItem(_ snooze: Snooze) {
    if let item = itemToSnooze {
      withAnimation(.linear(duration: 0.4)) {
        snoozeAction(item.id, snooze.until, "Snoozed until \(snooze.untilStr)")
      }
    }
    itemToSnooze = nil
    snoozePresented = false
  }
}

private struct SnoozeIconButtonView: View {
  let snooze: Snooze
  let action: (_ snooze: Snooze) -> Void

  var body: some View {
    Button(action: {
      action(snooze)
    }) {
      VStack(alignment: .center, spacing: 8) {
        snooze.icon
          .font(.appTitle)
          .foregroundColor(.appYellow48)
        Text(snooze.title)
          .font(.appBody)
          .foregroundColor(.appGrayText)
        Text(snooze.untilStr)
          .font(.appCaption)
          .foregroundColor(.appGrayText)
      }
      .frame(
        maxWidth: .infinity,
        maxHeight: .infinity
      )
    }
    .frame(height: 100)
  }
}

private struct Snooze {
  let until: Date
  let icon: Image
  let title: String
  let untilStr: String

  init(until: Date, icon: Image, title: String, needsDay: Bool) {
    self.until = until
    self.icon = icon
    self.title = title
    let formatter = DateFormatter()
    formatter.dateFormat = needsDay ? "EEE h:mm a" : "h:mm a"
    self.untilStr = formatter.string(from: until)
  }

  static var snoozeValues: [Snooze] {
    let now = Date()
    return snoozeValuesForDate(now: now)
  }

  static func snoozeValuesForDate(now: Date) -> [Snooze] {
    var res: [Snooze] = []
    let calendar = Calendar.current
    let components = calendar.dateComponents([.year, .month, .day, .hour, .timeZone, .weekday], from: now)

    var tonightComponent = components
    tonightComponent.hour = 20

    var thisMorningComponent = components
    thisMorningComponent.hour = 8

    let tonight = calendar.date(from: tonightComponent)!
    let thisMorning = calendar.date(from: thisMorningComponent)!

    let tomorrowMorning = Calendar.current.date(byAdding: DateComponents(day: 1), to: thisMorning)

    // Add either tonight or tomorrow night
    if now < tonight {
      res.append(Snooze(until: tonight, icon: .moonStars, title: "Tonight", needsDay: false))
    } else {
      let tomorrowNight = Calendar.current.date(byAdding: DateComponents(day: 1), to: tonight)!
      res.append(Snooze(until: tomorrowNight, icon: .moonStars, title: "Tomorrow night", needsDay: false))
    }

    if let tomorrowMorning = tomorrowMorning {
      res.append(Snooze(until: tomorrowMorning, icon: .sunHorizon, title: "Tomorrow morning", needsDay: false))
    }

    if let weekday = components.weekday {
      // Add this or next weekend
      if weekday < 5 {
        let thisWeekend = Calendar.current.date(byAdding: DateComponents(day: 7 - weekday), to: thisMorning)
        res.append(Snooze(until: thisWeekend!, icon: .mountains, title: "This weekend", needsDay: true))
      } else {
        let nextWeekend = Calendar.current.date(byAdding: DateComponents(day: 7 - (weekday - 5)), to: thisMorning)!
        res.append(Snooze(until: nextWeekend, icon: .mountains, title: "Next weekend", needsDay: true))
      }
      let nextWeek = Calendar.current.date(byAdding: DateComponents(day: weekday + 5), to: thisMorning)!
      res.append(Snooze(until: nextWeek, icon: .chartLineUp, title: "Next week", needsDay: true))
    }

    return Array(res.sorted(by: { $0.until > $1.until }).reversed())
  }
}
