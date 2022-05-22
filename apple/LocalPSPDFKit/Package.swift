// swift-tools-version:5.5

import PackageDescription

let package = Package(
  name: "PSPDFKit",
  platforms: [
    .iOS(.v15),
    .macOS("99.0")
  ],
  products: [
    .library(
      name: "PSPDFKit",
      targets: ["PSPDFKit", "PSPDFKitUI"]
    )
  ],
  targets: [
    .binaryTarget(
      name: "PSPDFKit",
      url: "https://customers.pspdfkit.com/pspdfkit/xcframework/11.2.0.zip",
      checksum: "e70261d3938fb99955bd8a89bd20a691c9024d573e0fcf9fa53fd4a797cc10fb"
    ),
    .binaryTarget(
      name: "PSPDFKitUI",
      url: "https://customers.pspdfkit.com/pspdfkitui/xcframework/11.2.0.zip",
      checksum: "f4e757c4067921b469d910fc8babb6e9445b189c53aca378ef943960806f22dd"
    )
  ]
)
