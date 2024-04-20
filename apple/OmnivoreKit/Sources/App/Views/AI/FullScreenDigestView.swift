import SwiftUI
import Models
import Services

public class FullScreenDigestViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var digest: DigestResult?

  func load(dataService: DataService) async {
    isLoading = true
    if digest == nil {
      do {
        digest = try await dataService.getLatestDigest(timeoutInterval: 10)
      } catch {
        print("ERROR WITH DIGEST: ", error)
      }
    }
    isLoading = false
  }
}

struct DigestAudioItem: AudioItemProperties {
  let audioItemType = Models.AudioItemType.digest
  
  var itemID = ""
  
  var title = "TITLE"
  
  var byline: String? = "byline"
  
  var imageURL: URL? = nil
  
  var language: String?
  
  var startIndex: Int = 0
  var startOffset: Double = 0.0
}

@available(iOS 17.0, *)
@MainActor
struct FullScreenDigestView: View {
  let viewModel: FullScreenDigestViewModel = FullScreenDigestViewModel()
  let dataService: DataService
  let audioController: AudioController

  @Environment(\.dismiss) private var dismiss

  let textBody = "In a significant political turn, the SOTU response faces unexpected collapse, " +
  "marking a stark contrast to Trump's latest downturn, alongside an unprecedented " +
  "surge in Biden's fundraising efforts as of 3/11/24, according to the TDPS Podcast. " +
  "The analysis provides insights into the shifting dynamics of political support and " +
  "the potential implications for future electoral strategies. Based on the information " +
  "you provided, the video seems to discuss a recent event where former President " +
  "Donald Trump made a controversial statement that shocked even his own audience. " +
  "The video likely covers Trump's response to the State of the Union (SOTU) address " +
  "and how it received negative feedback, possibly leading to a decline in his support " +
  "or approval ratings. Additionally, it appears that the video touches upon a surge " +
  "in fundraising for President Joe Biden's administration around March 11, 2024."

  public init(dataService: DataService, audioController: AudioController) {
    self.dataService = dataService
    self.audioController = audioController
  }

  var body: some View {
    // ZStack(alignment: Alignment(horizontal: .trailing, vertical: .top)) {
    Group {
      if viewModel.isLoading {
        ProgressView()
      } else {
        itemBody
          .task {
            await viewModel.load(dataService: dataService)
          }.onAppear {
            self.audioController.play(itemAudioProperties: DigestAudioItem())
          }
      }
    }            .navigationTitle("Omnivore digest")
      .navigationBarTitleDisplayMode(.inline)

//      HStack(alignment: .top) {
//        Spacer()
//        closeButton
//      }
//      .padding(20)
    // }
  }

  var closeButton: some View {
    Button(action: {
      dismiss()
    }, label: {
      ZStack {
        Circle()
          .foregroundColor(Color.appGrayText)
          .frame(width: 36, height: 36)
          .opacity(0.1)

        Image(systemName: "xmark")
          .font(.appCallout)
          .frame(width: 36, height: 36)
      }
    })
    .buttonStyle(.plain)
  }

  @available(iOS 17.0, *)
  var itemBody: some View {
    VStack {
      ScrollView(.vertical) {
        VStack(spacing: 20) {
          Text("SOTU response collapses, Trump hits new low, Biden fundraising explodes 3/11/24 TDPS Podcast")
            .font(.title)
          Text(textBody)
            .font(.body)
        }
      }
      // .scrollTargetBehavior(.paging)
      // .ignoresSafeArea()
      MiniPlayerViewer()
        .padding(.top, 10)
        .padding(.bottom, 40)
        .background(Color.themeTabBarColor)
        .onTapGesture {
          // showExpandedAudioPlayer = true
        }
    }
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
//    isLoading = true
//    let taskId = try? await dataService.createAITask(
//      extraText: extraText,
//      libraryItemId: item?.id ?? "",
//      promptName: "summarize-001"
//    )
//
//    if let taskId = taskId {
//      do {
//        let fetchedText = try await dataService.pollAITask(jobId: taskId, timeoutInterval: 30)
//        resultText = fetchedText
//      } catch {
//        print("ERROR WITH RESULT TEXT: ", error)
//      }
//    } else {
//      print("NO TASK ID: ", taskId)
//    }
//    isLoading = false
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

        Color(hex: "2A2A2A")
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
        .background(Color(hex: "313131"))
        .cornerRadius(8)
        // .shadow(radius: 3)
    }
}
