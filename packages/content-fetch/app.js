

const express = require('express');

const app = express();
const fetchContent = require('./fetch-content');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  fetchContent(req, res)
});

app.post('/', (req, res) => {
  fetchContent(req, res)
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;