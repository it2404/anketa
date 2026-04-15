const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Zakladni nastaveni middleware a sablon.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Uvodni stranka s formularem ankety.
app.get("/", (req, res) => {
  res.render("index", { title: "Webová anketa" });
});

// Ulozi novou odpoved do JSON souboru.
app.post("/submit", (req, res) => {
  const newResponse = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    answers: req.body
  };

  fs.readFile("responses.json", "utf8", (err, data) => {
    if (err) {
      console.log("Chyba při čtení souboru");
      return res.sendStatus(500);
    }

    let json = [];

    if (data) {
      json = JSON.parse(data);
    }

    json.push(newResponse);

    // Prepise soubor o novy zaznam a presmeruje na vysledky.
    fs.writeFile("responses.json", JSON.stringify(json, null, 2), (err) => {
      if (err) {
        console.log("Chyba při zápisu");
        return res.sendStatus(500);
      }

      console.log("Odpověď uložena");
      res.redirect("/results");
    });
  });
});

// Nacte odpovedi a vykresli stranku s vysledky.
app.get("/results", (req, res) => {
  fs.readFile("responses.json", "utf8", (err, data) => {
    if (err) {
      console.log("Chyba při čtení výsledků");
      return res.sendStatus(500);
    }

    const responses = data ? JSON.parse(data) : [];

    res.render("results", {
      title: "Výsledky ankety",
      responses: responses
    });
  });
});

// Spusti HTTP server.
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});