require("dotenv").config();
const dns = require("node:dns");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Acts as a database, every new URL will be added
// by incrementing by one the short_url field everytime
const urls = [];

app.get("/api/shorturl/:urlID", function(req, res) {
  const { urlID } = req.params;
  const url = urls.find((_url) => _url.short_url === urlID);
  if (url) return res.redirect(url.original_url);
  res.status(400).json({ error: "invalid url" });
});

app.post("/api/shorturl", function(req, res) {
  try {
    const { url } = req.body;
    const hostname = url
    .replace(/http[s]?\:\/\//, '')
    .replace(/\/(.+)?/, '');
    dns.lookup(hostname, (error, addresses) => {
      if(!addresses) return res.status(200).json({ error: 'Invalid URL' });
      const newObj = { original_url: url, short_url: `${urls.length}` };
      urls.push(newObj);
      res.json(newObj);
    });
  } catch (err) {
    return res.status(200).json({ error: 'Invalid URL' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
