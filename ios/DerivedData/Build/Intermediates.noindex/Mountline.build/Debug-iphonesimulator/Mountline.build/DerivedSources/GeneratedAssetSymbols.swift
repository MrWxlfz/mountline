import Foundation
#if canImport(DeveloperToolsSupport)
import DeveloperToolsSupport
#endif

#if SWIFT_PACKAGE
private let resourceBundle = Foundation.Bundle.module
#else
private class ResourceBundleClass {}
private let resourceBundle = Foundation.Bundle(for: ResourceBundleClass.self)
#endif

// MARK: - Color Symbols -

@available(iOS 17.0, macOS 14.0, tvOS 17.0, watchOS 10.0, *)
extension DeveloperToolsSupport.ColorResource {

    /// The "LaunchBackground" asset catalog color resource.
    static let launchBackground = DeveloperToolsSupport.ColorResource(name: "LaunchBackground", bundle: resourceBundle)

}

// MARK: - Image Symbols -

@available(iOS 17.0, macOS 14.0, tvOS 17.0, watchOS 10.0, *)
extension DeveloperToolsSupport.ImageResource {

    /// The "MountlineMark" asset catalog image resource.
    static let mountlineMark = DeveloperToolsSupport.ImageResource(name: "MountlineMark", bundle: resourceBundle)

    /// The "MountlineWordmark" asset catalog image resource.
    static let mountlineWordmark = DeveloperToolsSupport.ImageResource(name: "MountlineWordmark", bundle: resourceBundle)

}

