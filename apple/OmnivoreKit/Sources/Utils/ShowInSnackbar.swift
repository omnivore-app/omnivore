//
//  ShowInSnackbar.swift
//
//
//  Created by Jackson Harper on 11/1/22.
//

import Foundation

public func showInLibrarySnackbar(_ message: String) {
  let nname = Notification.Name("LibrarySnackBar")
  NotificationCenter.default.post(name: nname, object: nil, userInfo: ["message": message])
}

public func showInReaderSnackbar(_ message: String) {
  let nname = Notification.Name("ReaderSnackBar")
  NotificationCenter.default.post(name: nname, object: nil, userInfo: ["message": message])
}
