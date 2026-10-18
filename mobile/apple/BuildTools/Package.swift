// swift-tools-version:5.6
import PackageDescription

let package = Package(
  name: "BuildTools",
  platforms: [.macOS(.v10_11)],
  dependencies: [
    .package(url: "https://github.com/realm/SwiftLint", from: "0.44.0"),
    .package(url: "https://github.com/maticzav/swift-graphql", from: "2.2.1")
  ],
  targets: [.target(name: "BuildTools", path: "")]
)
