require('dotenv').config();
const express = require('express');
const { contentFetchRequestHandler } = require('./request_handler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.VERIFICATION_TOKEN) {
  throw new Error('VERIFICATION_TOKEN environment variable is not set');
}


app.all('/', async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    console.error('request method is not GET or POST')
    return res.sendStatus(405)
  }

  if (req.query.token !== process.env.VERIFICATION_TOKEN) {
    console.error('query does not include valid token')
    return res.sendStatus(403)
  }

  return contentFetchRequestHandler(req, res);
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
