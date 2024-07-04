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

  for (index, speechFile) in (digest.speechFiles ?? []).enumerated() {
    let chapter = digest.chapters?[index]
    let duration = currentWordCount / SpeechDocument.averageWPM / speed * 60.0

    if let chapter = chapter {
      chapterData.append((chapter, DigestChapterData(
        time: formatTimeInterval(duration) ?? "00:00",
        start: Int(currentAudioIndex),
        end: currentAudioIndex + Int(speechFile.utterances.count)
      )))
      currentAudioIndex += Int(speechFile.utterances.count)
      currentWordCount += chapter.wordCount
    }
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
  @Published var hasError = false
  @Published var isRunning = false
  @Published var digest: DigestResult?
  @Published var chapterInfo: [(DigestChapter, DigestChapterData)]?
  @Published var presentedLibraryItem: String?
  @Published var presentWebContainer = false

  @AppStorage(UserDefaultKey.lastVisitedDigestId.rawValue) var lastVisitedDigestId = ""

  func load(dataService: DataService, audioController: AudioController) async {
    hasError = false
    isLoading = true
    isRunning = false

    if !dataService.digestNeedsRefresh() {
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
      self.isRunning = digest.jobState == "RUNNING" || digest.jobState == "PENDING"
      self.hasError = digest.jobState == "FAILED"

      if let playingDigest = audioController.itemAudioProperties as? DigestAudioItem, 
          playingDigest.digest.id == digest.id {
        // Don't think we need to do anything here
      } else {
        let chapterData = self.chapterInfo?.map { $0.1 }
        audioController.play(itemAudioProperties: DigestAudioItem(digest: digest, chapters: chapterData ?? []))
      }

      EventTracker.track(
       .digestOpened(digestID: digest.id)
      )
    } else {
      hasError = true
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


}

@available(iOS 17.0, *)
@MainActor
struct FullScreenDigestView: View {
  @StateObject var viewModel = FullScreenDigestViewModel()
  let dataService: DataService
  let audioController: AudioController

  @Environment(\.presentationCoordinator) var presentationCoordinator

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
        } else if viewModel.hasError {
          VStack {
            Spacer()
            Text("There was an error loading your digest.")
            Button(action: {
              Task {
                await viewModel.load(dataService: dataService, audioController: audioController)
              }
            }, label: { Text("Try again") })
            .buttonStyle(RoundedRectButtonStyle(color: Color.blue, textColor: Color.white))
            Spacer()
          }
        } else if viewModel.isRunning {
          jobRunningText
        } else {
          itemBody
        }
      }
      .edgesIgnoringSafeArea(.bottom)

     }.task {
       await viewModel.load(dataService: dataService, audioController: audioController)
     }
  }

  var jobRunningText: some View {
    VStack {
      Spacer()
      Text("""
         You've been added to the AI Digest demo. Your first issue should be ready soon.
         When a new digest is ready the icon in the library header will change color.
         You can close this window now.
         """)
      .padding(20)
      Spacer()
    }
  }

  var closeButton: some View {
    Button(action: {
      presentationCoordinator.dismiss()
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
            Text(digest.title ?? "")
              .font(Font.system(size: 17, weight: .semibold))
              .lineSpacing(5)
              .lineLimit(3)
            Text(createdString)
              .font(Font.system(size: 12))
              .foregroundColor(Color(hex: "#898989"))
              .lineLimit(1)
          } else {
            HStack {
              Spacer()
              ProgressView()
              Spacer()
            }
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
                chapter: chapter,
                isCurrentChapter: currentChapter
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
              .contentShape(Rectangle())
              .background(
                currentChapter ? Color.blue.opacity(0.2) : Color.clear
              )
              .cornerRadius(5)
            }
          }
          .padding(.top, 20)
        }

        if let digest = viewModel.digest, let content = digest.content {
          Text("Transcript")
            .font(Font.system(size: 17, weight: .semibold))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 20)

          VStack {
            Markdown(content)
              .foregroundColor(Color.appGrayTextContrast)
          }
          .padding(15)
          .background(Color.themeLabelBackground.opacity(0.6))
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
  let isCurrentChapter: Bool

  var body: some View {
    HStack {
      VStack(spacing: 5) {
        HStack {
          Text(startTime)
            .padding(4)
            .padding(.horizontal, 4)
            .foregroundColor(.blue)
            .font(Font.system(size: 13))
            .background(Color.themeLabelBackground.opacity(0.6))
            .cornerRadius(5)

          if let author = chapter.author {
            Text(author)
              .font(Font.system(size: 14))
              .foregroundColor(Color.themeLibraryItemSubtle)
              .lineLimit(1)
              .padding(.trailing, 10)
          }

          Spacer()
        }
        Text(chapter.title)
          .foregroundColor(isCurrentChapter ? .primary :Color.themeLibraryItemSubtle.opacity(0.60))
          .font(Font.system(size: 14))
          .lineLimit(4)
          .frame(maxWidth: .infinity, alignment: .topLeading)
      }
      .padding(.leading, 10)
      Spacer()
      if let thumbnail = chapter.thumbnail, let thumbnailURL = URL(string: thumbnail) {
        AsyncImage(url: thumbnailURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: 65, height: 65)
            .cornerRadius(5)
            .clipped()
            .padding(.trailing, 10)

        } placeholder: {
            Rectangle()
              .foregroundColor(.clear)
              .frame(width: 65, height: 65)
              .cornerRadius(5)
              .padding(.trailing, 10)
        }
      } else {
        ZStack {
          Rectangle()
            .foregroundColor(.thLibrarySeparator)
            .frame(width: 65, height: 65)
            .cornerRadius(5)
          Image(systemName: "photo")
            .foregroundColor(.thBorderColor)
            .frame(width: 65, height: 65)
            .cornerRadius(5)
        }
        .padding(.trailing, 10)
      }
    }
    .frame(maxWidth: .infinity, alignment: .topLeading)
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
