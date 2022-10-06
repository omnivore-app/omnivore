import Models
import SwiftUI
import Views

struct HighlightsListCard: View {
  @State var isContextMenuOpen = false
  @State var annotation = String()
  @State var showAnnotationModal = false

  let highlightParams: HighlightListItemParams
  @Binding var hasHighlightMutations: Bool
  let onSaveAnnotation: (String) -> Void
  let onDeleteHighlight: () -> Void

  var contextMenuView: some View {
    Group {
      Button(
        action: {
          #if os(iOS)
            UIPasteboard.general.string = highlightParams.quote
          #endif

          #if os(macOS)
            let pasteBoard = NSPasteboard.general
            pasteBoard.clearContents()
            pasteBoard.writeObjects([highlightParams.quote as NSString])
          #endif

          Snackbar.show(message: "Highlight copied")
        },
        label: { Label("Copy", systemImage: "doc.on.doc") }
      )
      Button(
        action: onDeleteHighlight,
        label: { Label("Delete", systemImage: "trash") }
      )
    }
  }

  var noteSection: some View {
    Group {
      HStack {
        Image(systemName: "note.text")

        Text("Note")
          .font(.appSubheadline)
          .foregroundColor(.appGrayTextContrast)
          .lineLimit(1)

        Spacer()
      }

      Text(highlightParams.annotation)
    }
    .onTapGesture {
      annotation = highlightParams.annotation
      showAnnotationModal = true
    }
  }

  var addNoteSection: some View {
    HStack {
      Image(systemName: "note.text.badge.plus").foregroundColor(.appGrayTextContrast)

      Text("ADD NOTE")
        .font(.appFootnote)
        .foregroundColor(Color.appCtaYellow)
        .lineLimit(1)

      Spacer()
    }
    .onTapGesture {
      annotation = highlightParams.annotation
      showAnnotationModal = true
    }
  }

  var body: some View {
    VStack(alignment: .leading) {
      HStack {
        Spacer()

        Menu(
          content: { contextMenuView },
          label: {
            Image(systemName: "ellipsis")
              .foregroundColor(.appGrayTextContrast)
              .padding()
          }
        )
        .frame(width: 16, height: 16, alignment: .center)
        .onTapGesture { isContextMenuOpen = true }
      }
      .padding(.top, 16)

      HStack {
        Divider()
          .frame(width: 2)
          .overlay(Color.appYellow48)
          .opacity(0.8)
          .padding(.top, 2)
          .padding(.trailing, 6)

        VStack(alignment: .leading, spacing: 24) {
          Text(highlightParams.quote)

          if highlightParams.annotation.isEmpty {
            addNoteSection
          } else {
            noteSection
          }
        }
        .padding(.bottom, 8)
      }
    }
    .sheet(isPresented: $showAnnotationModal) {
      HighlightAnnotationSheet(
        annotation: $annotation,
        onSave: {
          onSaveAnnotation(annotation)
          showAnnotationModal = false
          hasHighlightMutations = true
        },
        onCancel: {
          showAnnotationModal = false
        }
      )
    }
  }
}
