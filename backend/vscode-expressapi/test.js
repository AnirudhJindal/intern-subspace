// This is a test file created via API

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello from test.js!' });
});

app.listen(4000, () => {
  console.log('Test server running on port 4000');
});