import fs from "fs";
import ejs from "ejs";
import { genererLignesHTML } from "./genlineicons.js";

const stations = JSON.parse(fs.readFileSync("data/stations.json", "utf-8"));
const metroliste = JSON.parse(fs.readFileSync("data/metroliste.json", "utf-8"));

const template = fs.readFileSync("templates/station.ejs", "utf-8");
const listTemplate = fs.readFileSync("templates/stationList.ejs", "utf-8");

fs.mkdirSync("stations", { recursive: true });

for (const [id, s] of Object.entries(stations)) {
    let html = ejs.render(template, { 
        station: s, 
        id, 
        genererLignesHTML,
        lignesListe: [s.lignes] ?? [],
        data: stations,
        metroliste
    });

    html = html.replaceAll(" – ", "–");

    fs.writeFileSync(`stations/${id}.html`, html);
}

let list = ejs.render(listTemplate, { data: stations, genererLignesHTML });
list = list.replaceAll(" – ", "–");
fs.writeFileSync("stations/index.html", list);
