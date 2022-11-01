//
//  ShowInSnackbar.swift
//
//
//  Created by Jackson Harper on 11/1/22.
//

import Foundation

public func showInSnackbar(_ message: String) {
  let nname = Notification.Name("OperationSuccess")
  NotificationCenter.default.post(name: nname, object: nil, userInfo: ["message": message])
}

public func showErrorInSnackbar(_ message: String) {
  let nname = Notification.Name("OperationFailure")
  NotificationCenter.default.post(name: nname, object: nil, userInfo: ["message": message])
}
