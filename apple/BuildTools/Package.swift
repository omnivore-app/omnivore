// swift-tools-version:5.5
import PackageDescription

let package = Package(
  name: "BuildTools",
  platforms: [.macOS(.v10_11)],
  dependencies: [
    .package(url: "https://github.com/nicklockwood/SwiftFormat", from: "0.48.11"),
    .package(url: "https://github.com/realm/SwiftLint", from: "0.44.0"),
    .package(url: "https://github.com/maticzav/swift-graphql", from: "2.2.1")
  ],
  targets: [.target(name: "BuildTools", path: "")]
)
