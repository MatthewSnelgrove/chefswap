const pg = require("pg")
const express = require('express');
const { pool } = require("./dbConfig");



const PORT = process.env.PORT || 3001;

const app = express();


const connectionString = "pg://postgres:postgres@localhost:5432/chefswap";
const client = new pg.Client(connectionString);
client.connect();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.json({ message: "error: wrong path"});
  // res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});