import SwiftUI
import Models
import Services
import Views
import MarkdownUI
import Utils
import Transmission

func getChapterData(digest: DigestResult) -> [(DigestChapter, DigestChapterData)] {
  let speed = 1.0
  var chapterData: [(DigestChapter, DigestChapterData)] = []
  var currentAudioIndex = 0
  var currentWordCount = 0.0

  for (index, speechFile) in digest.speechFiles.enumerated() {
    let chapter = digest.chapters[index]
    let duration = currentWordCount / SpeechDocument.averageWPM / speed * 60.0

    chapterData.append((chapter, DigestChapterData(
      time: formatTimeInterval(duration) ?? "00:00",
      start: Int(currentAudioIndex),
      end: currentAudioIndex + Int(speechFile.utterances.count)
    )))
    currentAudioIndex += Int(speechFile.utterances.count)
    currentWordCount += chapter.wordCount
  }
  return chapterData
}

func formatTimeInterval(_ time: TimeInterval) -> String? {
  let componentFormatter = DateComponentsFormatter()
  componentFormatter.unitsStyle = .positional
  componentFormatter.allowedUnits = time >= 3600 ? [.second, .minute, .hour] : [.second, .minute]
  componentFormatter.zeroFormattingBehavior = .pad
  return componentFormatter.string(from: time)
}

@MainActor
public class FullScreenDigestViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var digest: DigestResult?
  @Published var chapterInfo: [(DigestChapter, DigestChapterData)]?
  @Published var presentedLibraryItem: String?
  @Published var presentWebContainer = false

  @AppStorage(UserDefaultKey.lastVisitedDigestId.rawValue) var lastVisitedDigestId = ""

  func load(dataService: DataService, audioController: AudioController) async {
    if !digestNeedsRefresh() {
      if let digest = dataService.loadStoredDigest() {
        self.digest = digest
      }
    } else {
      do {
        if let digest = try await dataService.getLatestDigest(timeoutInterval: 10) {
          self.digest = digest
        }
      } catch {
        print("ERROR WITH DIGEST: ", error)
        self.digest = nil
      }
    }

    if let digest = self.digest {
      self.digest = digest
      self.chapterInfo = getChapterData(digest: digest)
      self.lastVisitedDigestId = digest.id

      if let playingDigest = audioController.itemAudioProperties as? DigestAudioItem, playingDigest.digest.id == digest.id {
        // Don't think we need to do anything here
      } else {
        let chapterData = self.chapterInfo?.map { $0.1 }
        audioController.play(itemAudioProperties: DigestAudioItem(digest: digest, chapters: chapterData ?? []))
      }
    }

    isLoading = false
  }

  func refreshDigest(dataService: DataService) async {
    do {
      try await dataService.refreshDigest()
    } catch {
      print("ERROR WITH DIGEST: ", error)
    }
  }

  func digestNeedsRefresh() -> Bool {
    let fileManager = FileManager.default
    let localURL = URL.om_cachesDirectory.appendingPathComponent("digest.json")
    do {
      let attributes = try fileManager.attributesOfItem(atPath: localURL.path)
      if let modificationDate = attributes[.modificationDate] as? Date {
        // Two hours ago
        let twoHoursAgo = Date().addingTimeInterval(-2 * 60 * 60)
        return modificationDate < twoHoursAgo
      }
    } catch {
        print("Error: \(error)")
    }
    return true
  }
}

@available(iOS 17.0, *)
@MainActor
struct FullScreenDigestView: View {
  @StateObject var viewModel = FullScreenDigestViewModel()
  let dataService: DataService
  let audioController: AudioController

  @Environment(\.dismiss) private var dismiss

  public init(dataService: DataService, audioController: AudioController) {
    self.dataService = dataService
    self.audioController = audioController
  }

  var titleBlock: some View {
    HStack {
      Text("Omnivore Digest")
        .font(Font.system(size: 18, weight: .semibold))
      Image.tabDigestSelected
      Spacer()
      closeButton
    }
    .padding(.top, 20)
    .padding(.horizontal, 20)
  }

  var createdString: String {
    if let createdAt = viewModel.digest?.createdAt, 
        let date = DateFormatter.formatterISO8601.date(from: createdAt) {
      let dateFormatter = DateFormatter()
      dateFormatter.dateStyle = .medium
      dateFormatter.timeStyle = .medium
      dateFormatter.locale = Locale(identifier: "en_US")

      return "Created " + dateFormatter.string(from: date)
    }
    return ""
  }

  var slideTransition: PresentationLinkTransition {
    PresentationLinkTransition.slide(
      options: PresentationLinkTransition.SlideTransitionOptions(
        edge: .trailing,
        options: PresentationLinkTransition.Options(
          modalPresentationCapturesStatusBarAppearance: true
        )
      ))
  }

  var body: some View {
    VStack {
      titleBlock

      if let presentedLibraryItem = self.viewModel.presentedLibraryItem {
        PresentationLink(
          transition: slideTransition,
          isPresented: $viewModel.presentWebContainer,
          destination: {
            WebReaderLoadingContainer(requestID: presentedLibraryItem)
              .background(ThemeManager.currentBgColor)
              .onDisappear {
                self.viewModel.presentedLibraryItem = nil
              }
          }, label: {
            EmptyView()
          }
        )
      }

      Group {
        if viewModel.isLoading {
          VStack {
            Spacer()
            ProgressView()
            Spacer()
          }
        } else {
          itemBody
        }
      }
      .edgesIgnoringSafeArea(.bottom)

     }.task {
       await viewModel.load(dataService: dataService, audioController: audioController)
     }
  }

  var closeButton: some View {
    Button(action: {
      dismiss()
    }, label: {
      Text("Close")
        .foregroundColor(Color.blue)
    })
    .buttonStyle(.plain)
  }

  @available(iOS 17.0, *)
  var itemBody: some View {
    VStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 20) {
          HStack {
            Image.coloredSmallOmnivoreLogo
              .resizable()
              .frame(width: 20, height: 20)
            Text("Omnivore.app")
              .font(Font.system(size: 14))
              .foregroundColor(Color.themeLibraryItemSubtle)
            Spacer()
          }
          if let digest = viewModel.digest {
            Text(digest.title)
              .font(Font.system(size: 17, weight: .semibold))
              .lineSpacing(5)
              .lineLimit(3)
            Text(createdString)
              .font(Font.system(size: 12))
              .foregroundColor(Color(hex: "#898989"))
              .lineLimit(1)
          } else {
            Text("We're building you a new digest")
              .font(Font.system(size: 17, weight: .semibold))
              .lineLimit(3)
            ProgressView()
          }
        }
        .padding(15)
        .background(Color.themeLabelBackground.opacity(0.6))
        .cornerRadius(5)

        if let chapters = viewModel.chapterInfo {
          VStack(alignment: .leading, spacing: 10) {
            Text("Chapters")
              .font(Font.system(size: 17, weight: .semibold))
              .frame(maxWidth: .infinity, alignment: .leading)
              .padding(0)
            ForEach(chapters, id: \.0.id) { chaps in
              let (chapter, chapterData) = chaps
              let currentChapter = (audioController.currentAudioIndex >= chapterData.start && audioController.currentAudioIndex < chapterData.end)

              ChapterView(
                startTime: chapterData.time,
                skipIndex: chapterData.start,
                chapter: chapter
              )
              .onTapGesture {
                audioController.seek(toIdx: chapterData.start)
                if audioController.state != .loading && !audioController.isPlaying {
                  audioController.unpause()
                }
              }
              .onLongPressGesture {
                viewModel.presentedLibraryItem = chapter.id
                viewModel.presentWebContainer = true
              }
              .background(
                currentChapter ? Color.themeLabelBackground.opacity(0.6) : Color.clear
              )
              .cornerRadius(5)
            }
          }
          .padding(.top, 20)
        }

        if let digest = viewModel.digest {
          Text("Transcript")
            .font(Font.system(size: 17, weight: .semibold))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 20)

          VStack {
            Markdown(digest.content)
              .foregroundColor(Color.appGrayTextContrast)
          }
          .padding(15)
          .background(Color.themeLabelBackground.opacity(0.6))
          .cornerRadius(5)
        }

        Spacer(minLength: 60)

        if viewModel.digest != nil {
          Text("Rate today's digest")
            .font(Font.system(size: 17, weight: .semibold))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.bottom, 15)
            .padding(.horizontal, 15)

          RatingWidget()
          Spacer(minLength: 60)
        }
//        
//        VStack(alignment: .leading, spacing: 20) {
//          Text("If you didn't like today's digest or would like another one you can create another one. The process takes a few minutes")
//          Button(action: {
//            Task {
//              await viewModel.refreshDigest(dataService: dataService)
//            }
//          }, label: {
//            Text("Create new digest")
//              .font(Font.system(size: 13, weight: .medium))
//              .padding(.horizontal, 8)
//              .padding(.vertical, 5)
//              .tint(Color.blue)
//              .background(Color.themeLabelBackground)
//              .cornerRadius(5)
//          })
//        }
//        .padding(15)
//        .background(Color.themeLabelBackground.opacity(0.6))
//        .cornerRadius(5)
//
      }.contentMargins(10, for: .scrollContent)

      Spacer()

      MiniPlayerViewer(showStopButton: false)
        .padding(.top, 10)
        .padding(.bottom, 40)
        .background(Color.themeTabBarColor)
        .onTapGesture {
          // showExpandedAudioPlayer = true
        }
    }
  }
}

struct ChapterView: View {
  let startTime: String
  let skipIndex: Int
  let chapter: DigestChapter

  var body: some View {
    HStack(spacing: 15) {
      if let thumbnail = chapter.thumbnail, let thumbnailURL = URL(string: thumbnail) {
        AsyncImage(url: thumbnailURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: 90, height: 50)
            .clipped()
        } placeholder: {
          Rectangle()
            .foregroundColor(.gray)
            .frame(width: 90, height: 50)
        }
        .cornerRadius(8)
      } else {
        Rectangle()
          .foregroundColor(.gray)
          .frame(width: 90, height: 50)
          .cornerRadius(8)
      }
      VStack(alignment: .leading) {
        (Text(startTime)
          .foregroundColor(.blue)
          .font(.caption)

                +
        Text(" - " + chapter.title)
          .foregroundColor(.primary)
          .font(.caption))
        .lineLimit(2)
      }
      Spacer()
    }
    .padding(.leading, 4)
    .padding(.vertical, 15)
  }
}

@MainActor
public class PreviewItemViewModel: ObservableObject {
  let dataService: DataService
  @Published var item: DigestItem
  let showSwipeHint: Bool

  @Published var isLoading = false
  @Published var resultText: String?
  @Published var promptDisplayText: String?

  init(dataService: DataService, item: DigestItem, showSwipeHint: Bool) {
    self.dataService = dataService
    self.item = item
    self.showSwipeHint = showSwipeHint
  }

  func loadResult() async {
  }
}

@MainActor
struct PreviewItemView: View {
  @StateObject var viewModel: PreviewItemViewModel

    var body: some View {
      VStack(spacing: 10) {
        HStack {
          AsyncImage(url: viewModel.item.siteIcon) { phase in
            if let image = phase.image {
              image
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 20, height: 20, alignment: .center)
            } else {
              Color.appButtonBackground
                .frame(width: 20, height: 20, alignment: .center)
            }
          }
          Text(viewModel.item.site)
            .font(Font.system(size: 14))
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .padding(.top, 10)
        Text(viewModel.item.title)
          // .font(.body)
          // .fontWeight(.semibold)
          .font(Font.system(size: 18, weight: .semibold))
          .frame(maxWidth: .infinity, alignment: .topLeading)

        Text(viewModel.item.author)
          .font(Font.system(size: 14))
          .foregroundColor(Color(hex: "898989"))
          .frame(maxWidth: .infinity, alignment: .topLeading)

        Color.themeLabelBackground
          .frame(height: 1)
          .frame(maxWidth: .infinity, alignment: .center)
          .padding(.vertical, 20)

        if viewModel.isLoading {
          ProgressView()
            .task {
              await viewModel.loadResult()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
          Text(viewModel.item.summaryText)
            .font(Font.system(size: 16))
            // .font(.body)
            .lineSpacing(12.0)
            .frame(maxWidth: .infinity, alignment: .topLeading)
          HStack {
            Button(action: {}, label: {
              HStack(alignment: .center) {
                Text("Start listening")
                  .font(Font.system(size: 14))
                  .frame(height: 42, alignment: .center)
                Image(systemName: "play.fill")
                  .resizable()
                  .frame(width: 10, height: 10)
              }
              .padding(.horizontal, 15)
              .background(Color.blue)
              .foregroundColor(.white)
              .cornerRadius(18)
            })
            Spacer()
          }
          .padding(.top, 20)
        }
        Spacer()
        if viewModel.showSwipeHint {
          VStack {
            Image.doubleChevronUp
            Text("Swipe up for next article")
              .foregroundColor(Color(hex: "898989"))
          }
          .padding(.bottom, 50)
        }
      }.frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.top, 100)
        .padding(.horizontal, 15)

    }
}

struct RatingView: View {
    @State private var rating: Int = 0

    var body: some View {
      VStack(spacing: 30) {
        Text("Rate today's digest")
          .font(.title)
          .padding(.vertical, 40)
        Text("I liked the stories picked for today's digest")
        RatingWidget()

        Text("The stories were interesting")
        RatingWidget()

        Text("The voices sounded good")
        RatingWidget()

        Text("I liked the music")
        RatingWidget()
        Spacer()
      }.padding(.top, 60)
    }
}

struct StarView: View {
    var isFilled: Bool
    var body: some View {
        Image(systemName: isFilled ? "star.fill" : "star")
            .foregroundColor(isFilled ? Color.yellow : Color.gray)
    }
}

struct RatingWidget: View {
    @State private var rating: Int = 0
    var body: some View {
        HStack {
            ForEach(1...5, id: \.self) { index in
                StarView(isFilled: index <= rating)
                    .onTapGesture {
                        rating = index
                    }
            }
        }
        .padding()
        .background(Color.themeLabelBackground.opacity(0.6))
        .cornerRadius(8)
        // .shadow(radius: 3)
    }
}
