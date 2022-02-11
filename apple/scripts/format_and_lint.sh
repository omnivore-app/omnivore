cd BuildTools
SDKROOT=macosx
# swift package update #Uncomment this line temporarily to update the version used to the latest matching your BuildTools/Package.swift file
swift run -c release swiftformat "$SRCROOT"
swift run swiftlint --path "$SRCROOT"