import Models
import SwiftUI
import Views

struct HighlightsListCard: View {
  @State var isContextMenuOpen = false
  @State var annotation = String()
  @State var showAnnotationModal = false

  let highlightParams: HighlightListItemParams
  let onSaveAnnotation: (String) -> Void

  var contextMenuView: some View {
    Group {
      Button(
        action: {},
        label: { Label("Stubby One", systemImage: "highlighter") }
      )
      Button(
        action: {},
        label: { Label("Stubby Two", systemImage: "textbox") }
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

      Text("Add a Note")
        .font(.appSubheadline)
        .foregroundColor(.appGrayTextContrast)
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
        Image(systemName: "highlighter")

        Text(highlightParams.title)
          .font(.appHeadline)
          .foregroundColor(.appGrayTextContrast)
          .lineLimit(1)

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
      .padding(.top, 8)

      HStack {
        Divider()
          .frame(width: 6)
          .overlay(Color.appYellow48)

        VStack(alignment: .leading, spacing: 8) {
          Text(highlightParams.quote)

          Divider()

          if highlightParams.annotation.isEmpty {
            addNoteSection
          } else {
            noteSection
          }
        }
      }
      .padding(.bottom, 8)
    }
    .sheet(isPresented: $showAnnotationModal) {
      HighlightAnnotationSheet(
        annotation: $annotation,
        onSave: {
          onSaveAnnotation(annotation)
          showAnnotationModal = false
        },
        onCancel: {
          showAnnotationModal = false
        }
      )
    }
  }
}
