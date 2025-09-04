#import <Foundation/Foundation.h>

NSBundle* GoogleMapsTarget_SWIFTPM_MODULE_BUNDLE() {
    NSURL *bundleURL = [[[NSBundle mainBundle] bundleURL] URLByAppendingPathComponent:@"GoogleMaps_GoogleMapsTarget.bundle"];

    NSBundle *preferredBundle = [NSBundle bundleWithURL:bundleURL];
    if (preferredBundle == nil) {
      return [NSBundle bundleWithPath:@"/Users/sidewayz8/dev/Puper1/PuperNative/.build/x86_64-apple-macosx/debug/GoogleMaps_GoogleMapsTarget.bundle"];
    }

    return preferredBundle;
}