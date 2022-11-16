require('dotenv').config();
const express = require('express');

const app = express();
const { fetchContent } = require("@omnivore/puppeteer-parse");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.VERIFICATION_TOKEN) {
  throw new Error('VERIFICATION_TOKEN environment variable is not set');
}

app.get('/', async (req, res) => {
  if (req.query.token !== process.env.VERIFICATION_TOKEN) {
    console.log('query does not include valid token')
    res.send(403)
    return
  }
  await fetchContent(req, res)
});

app.post('/', async (req, res) => {
  if (req.query.token !== process.env.VERIFICATION_TOKEN) {
    console.log('query does not include valid token')
    res.send(403)
    return
  }
  await fetchContent(req, res)
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
