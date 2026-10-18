cd BuildTools

SDKROOT=macosx

swift run swift-graphql \
  http://localhost:4000/api/graphql \
  --config "$SRCROOT/../swiftgraphql.yml" \
  --output "$SRCROOT/../OmnivoreKit/Sources/Services/DataService/GQLSchema.swift"

  sed -i '' '1s/^/\/\/ swiftlint:disable all\n/' './../OmnivoreKit/Sources/Services/DataService/GQLSchema.swift'
