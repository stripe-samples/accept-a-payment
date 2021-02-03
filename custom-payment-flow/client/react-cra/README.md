# Accept a payment examples in React

## How to run locally

This is the React client for the sample and runs independent of the server. To
start the backend servers, choose from a list of several servers available in
the sibling `../server` directory. Running a backend server is a requirement
and a dependency for this React front-end to work.

To run the React client locally:

1. Install dependencies

From this directory run:

```sh
npm install
```

2. Start the react app

```sh
npm start
```

This will start the react server running on localhost:3000. Note that the
backend servers run on localhost:4242, but the React UI will be available at
localhost:3000. API requests to your backend are proxied by the
create-react-app server using the `proxy` setting in `./package.json`.

## FAQ

Q: Why did you pick these frameworks?

A: We chose the most minimal framework to convey the key Stripe calls and
concepts you need to understand. These demos are meant as an educational tool
that helps you roadmap how to integrate Stripe within your own system
independent of the framework.

## Get support

If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](../../../../../issues).

If you have questions, comments, or need help with code, we're here to help:
- on [IRC via freenode](https://webchat.freenode.net/?channel=#stripe)
- on Twitter at [@StripeDev](https://twitter.com/StripeDev)
- on Stack Overflow at the [stripe-payments](https://stackoverflow.com/tags/stripe-payments/info) tag
- by [email](mailto:support+github@stripe.com)

## Author(s)

[@cjav_dev](https://twitter.com/cjav_dev)
[@thorwebdev](https://twitter.com/thorwebdev)
