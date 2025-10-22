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

	if (query.length === 1) {
		const h3 = document.createElement("h3");
		h3.textContent = "Veuillez entrer au moins deux caractères.";
		h3.style.textAlign = "center";
		h3.style.paddingBottom = "10px";
		resultsList.appendChild(h3);
		return;
	}

	if (query.length < 2) return;

	const matches = allStations.filter(station => normalizeString(station.nom).includes(query));
	
	const h2 = document.createElement("h2");

	if (matches.length === 0) {
		h2.textContent = `Aucun résultat pour ${searchInput.value}`;
		h2.style.textAlign = "center";
		h2.style.paddingBottom = "10px";
		resultsList.appendChild(h2);
		return;
	}

	h2.textContent = `${matches.length} résultat${matches.length === 1 ? "" : "s"} pour ${searchInput.value}`;
	h2.style.textAlign = "center";
	h2.style.paddingBottom = "10px";
	resultsList.appendChild(h2);


	matches.sort((a, b) => a.id.localeCompare(b.id));

	matches.slice(0, 15).forEach(station => {
		const p = document.createElement("p");
		p.innerHTML = `<a href="/stations.html?station=${station.id}" style="color: inherit;">${station.nom.replace(" \u2013 ", "\u2013")}</a> ${genererLignesHTML(station.lignes)}`;
		resultsList.appendChild(p);
	});
	if (matches.length > 15) {
		const p = document.createElement("p");
		p.innerHTML = `<em>15 résultats sur ${matches.length} affichés.</em>`;
		resultsList.appendChild(p);
	}
});