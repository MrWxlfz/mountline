#import <Foundation/Foundation.h>

#if __has_attribute(swift_private)
#define AC_SWIFT_PRIVATE __attribute__((swift_private))
#else
#define AC_SWIFT_PRIVATE
#endif

/// The resource bundle ID.
static NSString * const ACBundleID AC_SWIFT_PRIVATE = @"dev.mountline.ios";

/// The "LaunchBackground" asset catalog color resource.
static NSString * const ACColorNameLaunchBackground AC_SWIFT_PRIVATE = @"LaunchBackground";

/// The "MountlineMark" asset catalog image resource.
static NSString * const ACImageNameMountlineMark AC_SWIFT_PRIVATE = @"MountlineMark";

/// The "MountlineWordmark" asset catalog image resource.
static NSString * const ACImageNameMountlineWordmark AC_SWIFT_PRIVATE = @"MountlineWordmark";

#undef AC_SWIFT_PRIVATE
