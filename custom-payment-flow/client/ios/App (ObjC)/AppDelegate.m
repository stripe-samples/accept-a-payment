//
//  AppDelegate.m
//  app
//
//  Created by Ben Guo on 9/29/19.
//  Copyright © 2019 stripe-samples. All rights reserved.
//

#import "AppDelegate.h"
#import "CheckoutViewController.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    CGRect bounds = [[UIScreen mainScreen] bounds];
    UIWindow *window = [[UIWindow alloc] initWithFrame:bounds];
    CheckoutViewController *checkoutViewController = [[CheckoutViewController alloc] init];
    UINavigationController *rootViewController = [[UINavigationController alloc] initWithRootViewController:checkoutViewController];
    rootViewController.navigationBar.translucent = NO;
    window.rootViewController = rootViewController;
    [window makeKeyAndVisible];
    self.window = window;

    return YES;
}

@end
