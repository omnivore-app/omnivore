# Puppeteer parsing function handler

This workspace is used to provide the GCF for the app to handle requests for the article parsing via Puppeteer.
     
## Using locally

Copy .env.example file to .env file: `cp .env.example .env`

Run `yarn start` to start the Google Cloud Function locally (Works without hot reloading).

After this, you should be able to access the function on [http://localhost:8080/puppeteer](http://localhost:8080/puppeteer)

## Deployment

To deploy the function use the following command:

`gcloud functions deploy puppeteer --runtime nodejs12 --trigger-http --memory 1GB --set-env-vars REST_BACKEND_ENDPOINT=<backend-address>,JWT_SECRET=<jwt-secret>`


where:

`<backend-address>` - address of the backend server (e.g "http://localhost:4000")

`<jwt-secret>` - JWT secret that the backend server is using (e.g "some_secret")
