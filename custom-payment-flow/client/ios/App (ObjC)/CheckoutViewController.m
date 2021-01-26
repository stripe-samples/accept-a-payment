//
//  CheckoutViewController.m
//  app
//
//  Created by Ben Guo on 9/29/19.
//  Copyright © 2019 stripe-samples. All rights reserved.
//

#import "CheckoutViewController.h"
@import Stripe;

/**
 This example collects card payments, implementing the guide here: https://stripe.com/docs/payments/accept-a-payment#ios

 To run this app, follow the steps here https://github.com/stripe-samples/accept-a-card-payment#how-to-run-locally
*/
NSString *const BackendUrl = @"http://127.0.0.1:4242/";

@interface CheckoutViewController ()  <STPAuthenticationContext>

@property (weak) STPPaymentCardTextField *cardTextField;
@property (weak) UIButton *payButton;
@property (strong) NSString *paymentIntentClientSecret;

@end

@implementation CheckoutViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];

    // Set up the Stripe card text field
    STPPaymentCardTextField *cardTextField = [[STPPaymentCardTextField alloc] init];
    self.cardTextField = cardTextField;

    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    button.layer.cornerRadius = 5;
    button.backgroundColor = [UIColor systemBlueColor];
    button.titleLabel.font = [UIFont systemFontOfSize:22];
    [button setTitle:@"Pay" forState:UIControlStateNormal];
    [button addTarget:self action:@selector(pay) forControlEvents:UIControlEventTouchUpInside];
    self.payButton = button;

    UIStackView *stackView = [[UIStackView alloc] initWithArrangedSubviews:@[cardTextField, button]];
    stackView.axis = UILayoutConstraintAxisVertical;
    stackView.translatesAutoresizingMaskIntoConstraints = NO;
    stackView.spacing = 20;
    [self.view addSubview:stackView];

    [NSLayoutConstraint activateConstraints:@[
        [stackView.leftAnchor constraintEqualToSystemSpacingAfterAnchor:self.view.leftAnchor multiplier:2],
        [self.view.rightAnchor constraintEqualToSystemSpacingAfterAnchor:stackView.rightAnchor multiplier:2],
        [stackView.topAnchor constraintEqualToSystemSpacingBelowAnchor:self.view.topAnchor multiplier:2],
    ]];

    [self startCheckout];
}

- (void)displayAlertWithTitle:(NSString *)title message:(NSString *)message restartDemo:(BOOL)restartDemo {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:title message:message preferredStyle:UIAlertControllerStyleAlert];
        if (restartDemo) {
            [alert addAction:[UIAlertAction actionWithTitle:@"Restart demo" style:UIAlertActionStyleCancel handler:^(UIAlertAction *action) {
                [self.cardTextField clear];
                [self startCheckout];
            }]];
        }
        else {
            [alert addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleCancel handler:nil]];
        }
        [self presentViewController:alert animated:YES completion:nil];
    });
}

- (void)startCheckout {
    // Create a PaymentIntent by calling the sample server's /create-payment-intent endpoint.
    NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"%@create-payment-intent", BackendUrl]];
    NSDictionary *json = @{
        @"currency": @"usd",
        @"items": @[
                @{@"id": @"photo_subscription"}
        ]
    };
    NSData *body = [NSJSONSerialization dataWithJSONObject:json options:0 error:nil];
    NSMutableURLRequest *request = [[NSURLRequest requestWithURL:url] mutableCopy];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [request setHTTPBody:body];
    NSURLSessionTask *task = [[NSURLSession sharedSession] dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *requestError) {
        NSError *error = requestError;

        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
        NSDictionary *dataDict =[NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
        if (error != nil || httpResponse.statusCode != 200 || dataDict[@"publishableKey"] == nil) {
            [self displayAlertWithTitle:@"Error loading page" message:error.localizedDescription ?: @"" restartDemo:NO];
        }
        else {
            NSLog(@"Created PaymentIntent");
            self.paymentIntentClientSecret = dataDict[@"clientSecret"];
            NSString *publishableKey = dataDict[@"publishableKey"];
            // Configure the SDK with your Stripe publishable key so that it can make requests to the Stripe API
            // For added security, our sample app gets the publishable key from the server
            [StripeAPI setDefaultPublishableKey:publishableKey];
        }
    }];
    [task resume];
}

- (void)pay {
    if (!self.paymentIntentClientSecret) {
        NSLog(@"PaymentIntent hasn't been created");
        return;
    }

    // Collect card details
    STPPaymentMethodCardParams *cardParams = self.cardTextField.cardParams;
    STPPaymentMethodParams *paymentMethodParams = [STPPaymentMethodParams paramsWithCard:cardParams billingDetails:nil metadata:nil];
    STPPaymentIntentParams *paymentIntentParams = [[STPPaymentIntentParams alloc] initWithClientSecret:self.paymentIntentClientSecret];
    paymentIntentParams.paymentMethodParams = paymentMethodParams;

    // Submit the payment
    STPPaymentHandler *paymentHandler = [STPPaymentHandler sharedHandler];
    [paymentHandler confirmPayment:paymentIntentParams withAuthenticationContext:self completion:^(STPPaymentHandlerActionStatus status, STPPaymentIntent *paymentIntent, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            switch (status) {
                case STPPaymentHandlerActionStatusFailed: {
                    [self displayAlertWithTitle:@"Payment failed" message:error.localizedDescription ?: @"" restartDemo:NO];
                    break;
                }
                case STPPaymentHandlerActionStatusCanceled: {
                    [self displayAlertWithTitle:@"Payment canceled" message:error.localizedDescription ?: @"" restartDemo:NO];
                    break;
                }
                case STPPaymentHandlerActionStatusSucceeded: {
                    [self displayAlertWithTitle:@"Payment succeeded" message:paymentIntent.description ?: @"" restartDemo:YES];
                    break;
                }
                default:
                    break;
            }
        });
    }];
}

# pragma mark STPAuthenticationContext
- (UIViewController *)authenticationPresentingViewController {
    return self;
}

@end

// docs_window_spec {"setup-ui-objc": [[21, 25], [26, 57], [59, 60], ["// ..."], [148, 150]]}
