import SwiftUI
import Models
import Services
import Views

public class DigestViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var digest: DigestResult?

  func load(dataService: DataService) async {
    isLoading = true
    

//    if digest == nil {
//      do {
//        digest = try await dataService.getLatestDigest(timeoutInterval: 10)
//      } catch {
//        print("ERROR WITH DIGEST: ", error)
//      }
//    }
    isLoading = false
  }
}

@available(iOS 17.0, *)
@MainActor
struct DigestView: View {
  let viewModel: DigestViewModel = DigestViewModel()
  let dataService: DataService

    // @State private var currentIndex = 0
  @State private var items: [DigestItem]
    // @State private var preloadedItems: [Int: String] = [:]
  @Environment(\.dismiss) private var dismiss

  //  let itemCount = 10 // Number of items to initially load
  //  let prefetchCount = 2 // Number of items to prefetch

  public init(dataService: DataService) {
    self.dataService = dataService
    self.items = [
      DigestItem(
        id: "1468AFAA-88sdfsdfC-4546-BE02-EACF385288FC",
        site: "CNBC.com",
        siteIcon: URL(string: "https://www.cnbc.com/favicon.ico"),
        author: "Kif Leswing",
        title: "Apple shares just had their best day since last May",
        summaryText: "In a significant political turn, the SOTU response faces unexpected collapse, marking a stark contrast to Trump's latest" +
        " downturn, alongside an unprecedented surge in Biden's fundraising efforts as of 3/11/24, according to the TDPS Podcast. " +
        "The analysis provides insights into the shifting dynamics of political support and the potential implications for future " +
        "electoral strategies. ",
        keyPointsText: "Key points from the article:",
        highlightsText: "Highlights from the article:"
      ),
      DigestItem(
        id: "1468AFAA-8sdfsdffsdf-4546-BE02-EACF385288FC",
        site: "CNBC.com",
        siteIcon: URL(string: "https://www.cnbc.com/favicon.ico"),
        author: "Kif Leswing",
        title: "Apple shares just had their best day since last May",
        summaryText: "In a significant political turn, the SOTU response faces unexpected collapse, marking a stark contrast to Trump's latest" +
        " downturn, alongside an unprecedented surge in Biden's fundraising efforts as of 3/11/24, according to the TDPS Podcast. " +
        "The analysis provides insights into the shifting dynamics of political support and the potential implications for future " +
        "electoral strategies. ",
        keyPointsText: "Key points from the article:",
        highlightsText: "Highlights from the article:"
      ),
      DigestItem(
        id: "1468AFAA-882C-asdadfsa85288FC",
        site: "CNBC.com",
        siteIcon: URL(string: "https://www.cnbc.com/favicon.ico"),
        author: "Kif Leswing",
        title: "Apple shares just had their best day since last May",
        summaryText: "In a significant political turn, the SOTU response faces unexpected collapse, marking a stark contrast to Trump's latest" +
        " downturn, alongside an unprecedented surge in Biden's fundraising efforts as of 3/11/24, according to the TDPS Podcast. " +
        "The analysis provides insights into the shifting dynamics of political support and the potential implications for future " +
        "electoral strategies. ",
        keyPointsText: "Key points from the article:",
        highlightsText: "Highlights from the article:"
      )
    ]
    // currentIndex = 0
   // _preloadedItems = [Int:String]
  } 

  var body: some View {
    if viewModel.isLoading {
     ProgressView()
    } else {
      itemBody
        .task {
          await viewModel.load(dataService: dataService)
        }
    }
  }

  @available(iOS 17.0, *)
  var itemBody: some View {
      ScrollView(.vertical) {
        LazyVStack(spacing: 0) {
          ForEach(Array(self.items.enumerated()), id: \.1.id) { idx, item in
            PreviewItemView(
              viewModel: PreviewItemViewModel(dataService: dataService, item: item, showSwipeHint: idx == 0)
            )
            .containerRelativeFrame([.horizontal, .vertical])
          }
          RatingView()
            .containerRelativeFrame([.horizontal, .vertical])
        }
        .scrollTargetLayout()
      }
      .scrollTargetBehavior(.paging)
      .ignoresSafeArea()
    }
}

//@MainActor
//public class PreviewItemViewModel: ObservableObject {
//  let dataService: DataService
//  @Published var item: DigestItem
//  let showSwipeHint: Bool
//
//  @Published var isLoading = false
//  @Published var resultText: String?
//  @Published var promptDisplayText: String?
//
//  init(dataService: DataService, item: DigestItem, showSwipeHint: Bool) {
//    self.dataService = dataService
//    self.item = item
//    self.showSwipeHint = showSwipeHint
//  }
//
//  func loadResult() async {
////    isLoading = true
////    let taskId = try? await dataService.createAITask(
////      extraText: extraText,
////      libraryItemId: item?.id ?? "",
////      promptName: "summarize-001"
////    )
////
////    if let taskId = taskId {
////      do {
////        let fetchedText = try await dataService.pollAITask(jobId: taskId, timeoutInterval: 30)
////        resultText = fetchedText
////      } catch {
////        print("ERROR WITH RESULT TEXT: ", error)
////      }
////    } else {
////      print("NO TASK ID: ", taskId)
////    }
////    isLoading = false
//  }
//}
//
//@MainActor
//struct PreviewItemView: View {
//  @StateObject var viewModel: PreviewItemViewModel
//
//    var body: some View {
//      VStack(spacing: 10) {
//        HStack {
//          AsyncImage(url: viewModel.item.siteIcon) { phase in
//            if let image = phase.image {
//              image
//                .resizable()
//                .aspectRatio(contentMode: .fill)
//                .frame(width: 20, height: 20, alignment: .center)
//            } else {
//              Color.appButtonBackground
//                .frame(width: 20, height: 20, alignment: .center)
//            }
//          }
//          Text(viewModel.item.site)
//            .font(Font.system(size: 14))
//            .frame(maxWidth: .infinity, alignment: .topLeading)
//        }
//        .padding(.top, 10)
//        Text(viewModel.item.title)
//          // .font(.body)
//          // .fontWeight(.semibold)
//          .font(Font.system(size: 18, weight: .semibold))
//          .frame(maxWidth: .infinity, alignment: .topLeading)
//
//        Text(viewModel.item.author)
//          .font(Font.system(size: 14))
//          .foregroundColor(Color(hex: "898989"))
//          .frame(maxWidth: .infinity, alignment: .topLeading)
//
//        Color(hex: "2A2A2A")
//          .frame(height: 1)
//          .frame(maxWidth: .infinity, alignment: .center)
//          .padding(.vertical, 20)
//
//        if viewModel.isLoading {
//          ProgressView()
//            .task {
//              await viewModel.loadResult()
//            }
//            .frame(maxWidth: .infinity, maxHeight: .infinity)
//        } else {
//          Text(viewModel.item.summaryText)
//            .font(Font.system(size: 16))
//            // .font(.body)
//            .lineSpacing(12.0)
//            .frame(maxWidth: .infinity, alignment: .topLeading)
//          HStack {
//            Button(action: {}, label: {
//              HStack(alignment: .center) {
//                Text("Start listening")
//                  .font(Font.system(size: 14))
//                  .frame(height: 42, alignment: .center)
//                Image(systemName: "play.fill")
//                  .resizable()
//                  .frame(width: 10, height: 10)
//              }
//              .padding(.horizontal, 15)
//              .background(Color.blue)
//              .foregroundColor(.white)
//              .cornerRadius(18)
//            })
//            Spacer()
//          }
//          .padding(.top, 20)
//        }
//        Spacer()
//        if viewModel.showSwipeHint {
//          VStack {
//            Image.doubleChevronUp
//            Text("Swipe up for next article")
//              .foregroundColor(Color(hex: "898989"))
//          }
//          .padding(.bottom, 50)
//        }
//      }.frame(maxWidth: .infinity, maxHeight: .infinity)
//        .padding(.top, 100)
//        .padding(.horizontal, 15)
//
//    }
//}
//
//struct RatingView: View {
//    @State private var rating: Int = 0
//
//    var body: some View {
//      VStack(spacing: 30) {
//        Text("Rate today's digest")
//          .font(.title)
//          .padding(.vertical, 40)
//        Text("I liked the stories picked for today's digest")
//        RatingWidget()
//
//        Text("The stories were interesting")
//        RatingWidget()
//
//        Text("The voices sounded good")
//        RatingWidget()
//
//        Text("I liked the music")
//        RatingWidget()
//        Spacer()
//      }.padding(.top, 60)
//    }
//}
//
//
//struct StarView: View {
//    var isFilled: Bool
//    var body: some View {
//        Image(systemName: isFilled ? "star.fill" : "star")
//            .foregroundColor(isFilled ? Color.yellow : Color.gray)
//    }
//}
//
//struct RatingWidget: View {
//    @State private var rating: Int = 0
//    var body: some View {
//        HStack {
//            ForEach(1...5, id: \.self) { index in
//                StarView(isFilled: index <= rating)
//                    .onTapGesture {
//                        rating = index
//                    }
//            }
//        }
//        .padding()
//        .background(Color(hex: "313131"))
//        .cornerRadius(8)
//        // .shadow(radius: 3)
//    }
//}
