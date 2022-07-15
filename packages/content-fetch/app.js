const express = require('express');

const app = express();
const fetchContent = require('./fetch-content');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.VERIFICATION_TOKEN) {
  throw new Error('VERIFICATION_TOKEN environment variable is not set');
}

app.get('/', (req, res) => {
  if (req.query.token !== process.env.VERIFICATION_TOKEN) {
    console.log('query does not include valid token')
    res.send(403)
    return
  }
  return fetchContent(req, res)
});

app.post('/', (req, res) => {
  if (req.query.token !== process.env.VERIFICATION_TOKEN) {
    console.log('query does not include valid token')
    res.send(403)
    return
  }
  return fetchContent(req, res)
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
