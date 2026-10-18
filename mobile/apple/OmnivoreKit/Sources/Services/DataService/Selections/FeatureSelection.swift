import Models
import SwiftGraphQL

let featureSelection = Selection.Feature {
  FeatureInternal(name: try $0.name(), enabled: try $0.grantedAt() != nil)
}
