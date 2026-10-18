// swift-tools-version:5.6

import PackageDescription

let package = Package(
  name: "OmnivoreKit",
  defaultLocalization: "en",
  platforms: [
    .iOS(.v15),
    .macOS(.v12)
  ],
  products: [
    .library(name: "App", targets: ["App"]),
    .library(name: "Views", targets: ["Views"]),
    .library(name: "Services", targets: ["Services"]),
    .library(name: "Models", targets: ["Models"]),
    .library(name: "Utils", targets: ["Utils"])

  ],
  dependencies: dependencies,
  targets: [
    .target(name: "App", dependencies: appPackageDependencies),
    .testTarget(name: "AppTests", dependencies: ["App"]),
    .target(
      name: "Views",
      dependencies: [
        "Models",
        .product(name: "Introspect", package: "SwiftUI-Introspect"),
        .product(name: "MarkdownUI", package: "swift-markdown-ui"),
        .product(name: "Transmission", package: "Transmission")
      ],
      resources: [.process("Resources")]
    ),
    .testTarget(name: "ViewsTests", dependencies: ["Views"]),
    .target(
      name: "Services",
      dependencies: [
        .product(name: "GoogleSignIn", package: "GoogleSignIn-iOS"),
        "Valet",
        .product(name: "SwiftGraphQL", package: "swift-graphql"),
        "Models",
        "Utils"
      ]
    ),
    .testTarget(name: "ServicesTests", dependencies: ["Services"]),
    .target(name: "Models", dependencies: ["Utils"]),
    .testTarget(name: "ModelsTests", dependencies: ["Models"]),
    .target(
      name: "Utils",
      dependencies: [
        .product(name: "PostHog", package: "posthog-ios", condition: .when(platforms: [.iOS]))
      ],
      resources: [.process("Resources")]
    ),
    .testTarget(name: "UtilsTests", dependencies: ["Utils"])
  ]
)

var appPackageDependencies: [Target.Dependency] {
  var deps: [Target.Dependency] = ["Views", "Services", "Models", "Utils"]
  // Comment out following line for macOS build
  deps.append(.product(name: "PSPDFKit", package: "PSPDFKit-SP", condition: .when(platforms: [.iOS])))
  return deps
}

var dependencies: [Package.Dependency] {
  var deps: [Package.Dependency] = [
    .package(url: "https://github.com/Square/Valet", from: "4.1.2"),
    .package(url: "https://github.com/maticzav/swift-graphql", from: "2.3.1"),
    .package(url: "https://github.com/siteline/SwiftUI-Introspect.git", from: "0.1.4"),
    .package(url: "https://github.com/google/GoogleSignIn-iOS", from: "6.2.2"),
    .package(url: "https://github.com/gonzalezreal/swift-markdown-ui", from: "2.0.0"),
    .package(url: "https://github.com/PostHog/posthog-ios.git", from: "2.0.0"),
    .package(url: "https://github.com/nathantannar4/Transmission", exact: "1.3.2")
  ]
  // Comment out following line for macOS build
  deps.append(.package(url: "https://github.com/PSPDFKit/PSPDFKit-SP", from: "13.7.0"))
  return deps
}
