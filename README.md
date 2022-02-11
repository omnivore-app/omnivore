# Omnivore

[Omnivore](https://omnivore.app) is a complete, open source read-it-later solution for people who like text.

We built Omnivore because we love reading and we want it to be more social. Join us!

- Highlighting, notes, search, and sharing
- Full keyboard navigation
- Automatically saves your place in long articles
- Add articles via email (with substack support!)
- PDF support
- [Web app](https://omnivore.app/) written in node and typescript
- [Native iOS app](https://discord.gg/nyqRrjujNe)
- Progressive web app for Android users
- [Browser extensions](https://omnivore.app/install/chrome) for Chrome, Safari, Firefox, and Edge
- Tagging (coming soon!)
- Offline support (coming soon!)

Every single part is fully open source! Fork it, extend it, or deploy it to your own server.

We also have a free hosted version of Omnivore at [omnivore.app](https://omnivore.app/) -- try it now!

## Join us on Discord!

We're building our community on Discord. [Join us!](https://discord.gg/nyqRrjujNe)

## How to setup local development

The easiest way to get started with local development is to run our docker-compose file which will run
postgres, our web frontend and an API server.. Along with docker-compose you will need to run our `pupeteer-parse` service. This service is used to fetch web page content.

###  Running the web and API services
1. In the root directory run

`docker-compose up`

This will start postgres, initialize the database, and start the web and api services.

2. Open a browser and go to `http://localhost:3000`

3. To create a test account and login visit `http://localhost:3000/email-registration` and sign up.

### Running the pupeteer-parse service

1. Install and configure Chromium

```
brew install chromium
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=`which chromium`
```

1. Navigate to the service directory

```
cd packages/puppeteer-parse
```

2. Run `yarn` to install dependencies

```
yarn
```

3. Start the service

```
yarn start
```

This will start the puppeteer-parse service on port 9090.


In your browser navigate to http://localhost:3000/home click the `Add Link` button and enter a URL
such as https://blog.omnivore.app/p/getting-started-with-omnivore

You should see a Chromium window open and navigate to your link. When the service is done fetching
your content you will see it in your library.


## How to deploy to your own server

FIXME: Jackson to fill this in

## License

Omnivore and our extensions to Readability.js are under the AGPL-3.0 license.
