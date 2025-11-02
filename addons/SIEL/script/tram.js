// tram.js

import requestTime from "./request.js";

let params = new URLSearchParams(document.location.search);
let stoppoint = params.get("stop");

let intervalID;

const linenumber = params.get("line");
const lineColors = {
	"1": "rgb(0, 85, 200)",  
	"2": "rgb(160, 0, 110)",  
	"3a": "rgb(255, 90, 0)",  
	"3b": "rgb(0, 100, 60)",  
	"4": "rgb(220, 150, 0)",  
	"5": "rgb(100, 0, 130)",  
	"6": "rgb(255, 20, 0)",
	"7": "rgb(110, 73, 30)",
	"8": "rgb(110, 110, 0)",
	"9": "rgb(60, 145, 220)",
	"10": "rgb(110, 110, 0)",
	"11": "rgb(255, 90, 0)",
	"12": "rgb(165, 0, 52)",
	"13": "rgb(110, 73, 30)"
};

function updateHoraires() {
	if (document.visibilityState !== 'visible') return; // Ne fait rien si l'onglet est caché

	requestTime(stoppoint).then(passages => {
		const horairesDiv = document.getElementById('horaires');
		horairesDiv.style.borderBottomColor = lineColors[linenumber] || "white";
		horairesDiv.innerHTML = '';

		const titre = document.createElement('div');
		titre.classList.add('titre-horaires');
		titre.textContent = 'Prochains trams';
		horairesDiv.appendChild(titre);

		if (passages && passages.length > 0) {
			passages.slice(0, 2).forEach(passage => {
				const horaire = new Date(passage.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime);
				const now = new Date();
				const minutesRestantes = Math.max(0, Math.round((horaire - now) / 60000));

				if (minutesRestantes === 1) {
					const approcheRow = document.createElement('div');
					approcheRow.classList.add('approche');
					approcheRow.textContent = "Tram à l’approche";
					horairesDiv.appendChild(approcheRow);
				} else if (minutesRestantes === 0) {
					const arriveeRow = document.createElement('div');
					arriveeRow.classList.add('arrivee');
					arriveeRow.textContent = "Départ imminent";
					horairesDiv.appendChild(arriveeRow);
				} else {
					const row = document.createElement('div');
					row.classList.add('horaire-row');

					const destSpan = document.createElement('span');
					destSpan.classList.add('destination');
					destSpan.textContent = passage.MonitoredVehicleJourney.DestinationName[0].value
						.replace(' - Hôpital Européen G. Pompidou', '')
						.replace(' - Parc de la Villette', '')
						.replace(' - Avenue Foch', '')
						.replace('T1 -V2-', '')
						.replace("'", "\u2019");

					const timeSpan = document.createElement('span');
					timeSpan.classList.add('temps');
					timeSpan.textContent = `${minutesRestantes}`;

					row.appendChild(destSpan);
					row.appendChild(timeSpan);
					horairesDiv.appendChild(row);
				}
			});
		} else {
			horairesDiv.textContent = 'Aucun passage prochainement.';
		}
	})
	.catch(error => {
		console.error('Erreur lors de la récupération des données:', error);
	});
}

// Lancer l'actualisation immédiate
updateHoraires();

// Définir l'intervalle pour rafraîchir toutes les 30 secondes
intervalID = setInterval(updateHoraires, 30000);

// Éviter les requêtes si l'onglet est inactif
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === 'hidden') {
		clearInterval(intervalID);
	} else if (!stopRequests) {
		intervalID = setInterval(updateHoraires, 30000);
		updateHoraires(); // Rafraîchir immédiatement en revenant sur l'onglet
	}
});