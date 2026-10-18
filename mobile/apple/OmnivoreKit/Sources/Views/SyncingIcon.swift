//
//  File.swift
//
//
//  Created by Jackson Harper on 6/5/22.
//

import Foundation
import Models
import SwiftUI
import Utils

public struct SyncStatusIcon: View {
  let status: ServerSyncStatus

  public init(status: ServerSyncStatus) {
    self.status = status
  }

  private var cloudIconName: String {
    switch status {
    case .isNSync:
      return "exclamationmark.icloud"
    case .isSyncing, .needsCreation, .needsDeletion, .needsUpdate:
      return "icloud"
    }
  }

  private var cloudIconColor: Color {
    switch status {
    case .isNSync:
      return .red
    case .isSyncing, .needsCreation, .needsDeletion, .needsUpdate:
      return .appGrayText
    }
  }

  public var body: some View {
    Image(systemName: cloudIconName)
      .resizable()
      .aspectRatio(contentMode: .fill)
      .frame(width: 12, height: 12, alignment: .trailing)
      .foregroundColor(cloudIconColor)
      .padding(EdgeInsets(top: 0, leading: 0, bottom: 8, trailing: 8))
  }
}
