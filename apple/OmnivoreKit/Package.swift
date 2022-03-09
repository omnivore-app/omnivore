// swift-tools-version:5.5

import PackageDescription

let package = Package(
  name: "OmnivoreKit",
  defaultLocalization: "en",
  platforms: [
    .iOS(.v14),
    .macOS(.v11)
  ],
  products: [
    .library(name: "App", targets: ["App"]),
    .library(name: "Views", targets: ["Views"]),
    .library(name: "Services", targets: ["Services"]),
    .library(name: "Models", targets: ["Models"]),
    .library(name: "Utils", targets: ["Utils"])
  ],
  dependencies: [
    .package(name: "AppAuth", url: "https://github.com/openid/AppAuth-iOS.git", .upToNextMajor(from: "1.4.0")),
    .package(url: "https://github.com/Square/Valet", from: "4.1.2"),
    .package(url: "https://github.com/maticzav/swift-graphql", from: "2.3.1"),
    .package(url: "https://github.com/siteline/SwiftUI-Introspect.git", from: "0.1.4")
  ],
  targets: [
    .target(name: "App", dependencies: ["Views", "Services", "Models", "Utils"]),
    .testTarget(name: "AppTests", dependencies: ["App"]),
    .target(
      name: "Views",
      dependencies: [
        "Models",
        .product(name: "Introspect", package: "SwiftUI-Introspect")
      ],
      resources: [.process("Resources")]
    ),
    .testTarget(name: "ViewsTests", dependencies: ["Views"]),
    .target(
      name: "Services",
      dependencies: [
        "AppAuth",
        "Valet",
        .product(name: "SwiftGraphQL", package: "swift-graphql"),
        "Models",
        "Utils"
      ]
    ),
    .testTarget(name: "ServicesTests", dependencies: ["Services"]),
    .target(name: "Models", dependencies: ["Utils"]),
    .testTarget(name: "ModelsTests", dependencies: ["Models"]),
    .target(name: "Utils", dependencies: [], resources: [.process("Resources")]),
    .testTarget(name: "UtilsTests", dependencies: ["Utils"])
  ]
)
