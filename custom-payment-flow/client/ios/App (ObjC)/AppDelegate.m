//
//  AppDelegate.m
//  app
//
//  Created by Ben Guo on 9/29/19.
//  Copyright © 2019 stripe-samples. All rights reserved.
//

#import "AppDelegate.h"
#import "CheckoutViewController.h"
@import Stripe;

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
    [self initializeStripe];
    return YES;
}

- (void)initializeStripe {
    // Create a PaymentIntent by calling the sample server's /create-payment-intent endpoint.
    NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@config", @"http://127.0.0.1:4242/"]];
//    NSMutableURLRequest *request = [[NSURLRequest requestWithURL:url] mutableCopy];
//    [request setHTTPMethod:@"GET"];
//    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    NSLog([url absoluteString]);
    NSURLSessionTask *task = [[NSURLSession sharedSession] dataTaskWithURL:url completionHandler:^(NSData *data, NSURLResponse *response, NSError *requestError) {
        NSError *error = requestError;

        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
        NSDictionary *dataDict = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
        if (error != nil || httpResponse.statusCode != 200 || dataDict[@"publishableKey"] == nil) {
            NSLog(@"Failed to fetch publishableKey from /config. Check the AppDelegate.m and that your server is responding to /config");
        }
        else {
            NSLog(@"Fetched publishableKey");
            NSString *publishableKey = dataDict[@"publishableKey"];
            // Configure the SDK with your Stripe publishable key so that it can make requests to the Stripe API
            // For added security, our sample app gets the publishable key from the server
            [StripeAPI setDefaultPublishableKey:publishableKey];
        }
    }];
    [task resume];
}

@end
