import { genererLignesHTML } from "./genlineicons.js";

function normalizeString(str) {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace("–", "-").replace(" - ", "-").replace("-", " ").replace("'", "’");
}

const searchInput = document.getElementById("search");
const resultsList = document.getElementById("search-results");
let allStations = [];

fetch("/data/stations.json")
	.then(res => res.json())
	.then(data => {
		if (typeof data !== "object" || data === null) {
			console.error("Le JSON est invalide :", data);
			return;
		}

		allStations = Object.entries(data).map(([id, station]) => ({
		id,
		nom: station.nom,
		lignes: station.lignes
		}));
	})
	.catch(error => {
		console.error("Erreur de chargement des données :", error);
	});

searchInput.addEventListener("input", () => {
	const query = normalizeString(searchInput.value);
	resultsList.innerHTML = "";

	if (query.length < 2) return;

	const h2 = document.createElement("h2");
	h2.textContent = `Résultats pour ${searchInput.value}`;
	h2.style.textAlign = "center";
	h2.style.paddingBottom = "10px";
	resultsList.appendChild(h2);

	const matches = allStations.filter(station => normalizeString(station.nom).includes(query));
	matches.sort((a, b) => a.id.localeCompare(b.id));
	if (matches.length === 0) {
		const p = document.createElement("p");
		p.textContent = "Aucun résultat.";
		resultsList.appendChild(p);
		return;
	}
	matches.slice(0, 10).forEach(station => {
		const p = document.createElement("p");
		p.innerHTML = `<a href="/stations.html?station=${station.id}" style="color: inherit;"><strong>${station.nom}</strong></a> ${genererLignesHTML(station.lignes)}`;
		resultsList.appendChild(p);
	});
});