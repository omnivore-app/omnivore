require('dotenv').config();
const Sentry = require('@sentry/serverless');

const Readability = require("./Readability");
const isProbablyReaderable = require("./Readability-readerable");

Sentry.GCPFunction.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
});

async function parse(req, res) {
  try {
    const { document, options } = req.body;
    const readability = new Readability(document, options);
    const article = await readability.parse();

    res.status(200).send({ article });
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
}

module.exports = {
  readability: Sentry.GCPFunction.wrapHttpFunction(parse),
  Readability: Readability,
  isProbablyReaderable: isProbablyReaderable
};
