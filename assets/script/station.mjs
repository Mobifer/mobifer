import fs from "fs";
import ejs from "ejs";
import { genererLignesHTML } from "./genlineicons.js";

const stations = JSON.parse(fs.readFileSync("data/stations.json", "utf-8"));

const template = fs.readFileSync("templates/station.ejs", "utf-8");

fs.mkdirSync("stations", { recursive: true });

// console.log("Nombre de stations :", Object.keys(stations).length);

for (const [id, s] of Object.entries(stations)) {
    const html = ejs.render(template, { station: s, id, genererLignesHTML, data: stations });
    fs.writeFileSync('stations/' + id + '.html', html);
}