# Accept a payment examples in React for Payment Element

## How to run locally

This is the React client for the sample and runs independently of the server.
To start the backend servers, choose from a list of several servers available
in the sibling `../server` directory. Running a backend server is a requirement
and a dependency for this React front-end to work. See the README in the root
of the project for more details.

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
