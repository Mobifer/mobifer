// panam.js
// Ce script permet la reproduction des écrans PANAM déployés sur le réseau
// de métro RATP depuis 2023.

import requestTime from "./request.js";

// Récupération du HTML
const panam = document.getElementById("panam");

// Ratio largeur/hauteur : 60/25
// Ratio en-tête/hauteur : 36/125

const COULEURS = {
	"1": "rgb(255, 190, 0)",
	"2": "rgb(0, 85, 200)",
	"3": "rgb(110, 110, 0)",
	"3b": "rgb(130, 200, 230)",
	"4": "rgb(160, 0, 110)",
	"5": "rgb(255, 90, 0)",
	"6": "rgb(130, 220, 115)",
	"7": "rgb(255, 130, 180)",
	"7b": "rgb(130, 220, 115)",
	"8": "rgb(210, 130, 190)",
	"9": "rgb(210, 210, 0)",
	"10": "rgb(220, 150, 0)",
	"11": "rgb(110, 73, 30)",
	"12": "rgb(0, 100, 60)",
	"13": "rgb(130, 200, 230)",
	"14": "rgb(100, 0, 130)",
	"15": "rgb(165, 0, 52)",
	"16": "rgb(255, 130, 180)",
	"17": "rgb(210, 210, 0)",
	"18": "rgb(0, 160, 146)"
};

const LIGNES_VALIDES = ["1", "2", "3", "3b", "4", "5", "6", "7", "7b", "8", "9",
	"10", "11", "12", "13", "14"];

const ALLER = {
	"1": "La Défense",
	"2": "Porte Dauphine",
	"3": "Pont de Levallois\u2013Bécon",
	"3b": "Gambetta",
	"4": "Bagneux",
	"5": "Place d\u2019Italie",
	"6": "Étoile",
	"7": "Villejuif \u2022 Ivry",
	"7b": "Louis Blanc",
	"8": "Créteil",
	"9": "Montreuil",
	"10": "Gare d\u2019Austerlitz",
	"11": "Châtelet",
	"12": "Aubervilliers",
	"13": "Saint-Denis<br>Asnières\u2013Gennevilliers",
	"14": "Aéroport d\u2019Orly"
}

const ALLER_VRAIS = {
	"1": "La Défense",
	"2": "Porte Dauphine",
	"3": "Pont de Levallois-Bécon",
	"3b": "Gambetta",
	"4": "Bagneux",
	"5": "Place d'Italie",
	"6": "Étoile",
	"7": "Villejuif \u2022 Ivry",
	"7b": "Louis Blanc",
	"8": "Créteil",
	"9": "Montreuil",
	"10": "Gare d'Austerlitz",
	"11": "Châtelet",
	"12": "Aubervilliers",
	"13": "Saint-Denis Asnières-Gennevilliers",
	"14": "Aéroport d'Orly"
}

const RETOUR = {
	"1": "Ch. de Vincennes",
	"2": "Nation",
	"3": "Gallieni",
	"3b": "Porte des Lilas",
	"4": "Porte de Clignancourt",
	"5": "Bobigny",
	"6": "Nation",
	"7": "La Courneuve",
	"7b": "Pré-Saint-Gervais",
	"8": "Balard",
	"9": "Pont de Sèvres",
	"10": "Boulogne<br>Pont de Saint-Cloud",
	"11": "Rosny-sous-Bois",
	"12": "Mairie d\u2019Issy",
	"13": "Châtillon",
	"14": "Saint-Denis"
}

let prochains = [-1, -1, -1, -1, -1]
// let previousProchains = [-1, -1, -1, -1, -1]

// Récupération des arguments dans le lien
let params; let isTranslating = false;
params = new URLSearchParams(document.location.search);

let ligne;
if (params.has("lig"))
	ligne = params.get("lig");

function updateClock() {
	const now = new Date();
	const hours = String(now.getHours());
	const minutes = String(now.getMinutes()).padStart(2, "0");

	document.getElementById("hours").textContent = hours;
	document.getElementById("minutes").textContent = minutes;

	const colon = document.getElementById("colon");
	const zeros = document.querySelectorAll(".zero-sync");

	// Top de la seconde: 100% visible
	colon.style.opacity = "1";
	zeros.forEach(z => z.style.opacity = "1");

	// Ensuite, clignote pendant la seconde
	setTimeout(() => {
		colon.style.opacity = "0.4";
		zeros.forEach(z => z.style.opacity = "0.4");
	}, 500); // milieu de la seconde

}

// Synchronisation au début de la seconde
function syncClock() {
	updateClock();
	setTimeout(() => {
		setInterval(updateClock, 1000);
	}, 1000 - new Date().getMilliseconds());
}

function handleLigne(ligne) {
	if (!LIGNES_VALIDES.includes(ligne)) return; // Ligne non valide

	const entete = document.getElementById("entete");

	// Ajout du pictogramme de ligne
	let picto = document.createElement("img");
	picto.classList.add("picto");
	picto.src = "assets/m" + ligne + ".svg";
	entete.appendChild(picto);

	// Changement de la couleur du pied
	let pied = document.getElementById("pied");
	pied.style.backgroundColor = COULEURS[ligne];
}

function handleDirection(ligne) {
	if (!params.has("sens")) return; // Direction non renseignée

	const sens = params.get("sens");

	const entete = document.getElementById("entete");

	const terminus = (sens === "a") ? ALLER[ligne] : RETOUR[ligne];

	let destination = document.createElement("div");
	destination.id = "panam-destination";

	if (terminus.includes("<br>")) {
		destination.classList.add("deux-lignes");
	}
	destination.innerHTML = (sens === "a") ? ALLER[ligne] : RETOUR[ligne];

	entete.appendChild(destination);
}

function handlePassages() {	
	if (!params.has("stop") || isTranslating) return; // Station non renseignée

	const stop = params.get("stop");

	requestTime(stop).then(passages => {
		console.log(passages);

		const ecran = document.getElementById("ecran");
		let hasPartiel = false;

		if (!passages || passages.length == 0) {
			const passageP = document.createElement("span");
			// const passageP = document.createElement("p");
			passageP.classList.add("indispo");
			passageP.innerHTML = "Temps d\u2019attente<br>indisponibles";
			// passageSpan.appendChild(passageP);
			ecran.appendChild(passageP);
			return;
		};

		const destination = document.getElementById("panam-destination");

		/* for (let i = 0; i < 2; i++) {
			if (passages[i].MonitoredVehicleJourney.MonitoredCall.DestinationDisplay[0]
					.value
					.normalize("NFD")
					.replaceAll("'", " ")
					.replaceAll(" - ", "")
					.replaceAll("-", "")
				!== destination.textContent
					.normalize("NFD")
					.replaceAll("'", " ")
					.replaceAll("\u2019", " ")
					.replaceAll("\u2013", "")
					.replaceAll("-", "")) {
				hasPartiel = true;
				break;
			}
		} */

		// Créer les éléments uniquement s'ils n'existent pas
		if (!document.querySelector('.premier-train') && !hasPartiel) {
			let premierTrain = document.createElement("span");
			premierTrain.classList.add("premier-train");
			premierTrain.innerHTML = `1<sup>er</sup> métro`;
			panam.appendChild(premierTrain);
		}

		if (!document.querySelector('.deuxieme-train') && !hasPartiel) {
			let deuxiemeTrain = document.createElement("span");
			deuxiemeTrain.classList.add("deuxieme-train");
			deuxiemeTrain.innerHTML = `2<sup>e</sup> métro`;
			panam.appendChild(deuxiemeTrain);
		}

		/* if (hasPartiel) {
			// Pour couvrir le trait de séparation
			// Il a été créé avec un pseudo-élément mais JS ne peut pas le modifier
			const couverture = document.createElement("div");
			couverture.classList.add("couverture");
			ecran.appendChild(couverture);

			for (let i = 0; i < 3; i++) {
				let passage = passages[i];
				let depart = passage.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime ? passage.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime : null;
				let minutes = depart ? Math.max(Math.ceil((Date.parse(depart) - Date.now())/1000/60), 0) : -1;
				if (i === 1 && minutes === 0) minutes = 1;
				prochains[i] = minutes;
				console.log(minutes);

				let rectangleDiv = document.querySelector(`.rectangle${i+1}`);
				let tempsDiv = document.querySelector(`.temps-partiel${i+1}`);

				if (!rectangleDiv) {
					rectangleDiv = document.createElement("div");
					rectangleDiv.classList.add(`rectangle${i+1}`);
					ecran.appendChild(rectangleDiv);

					const destinationSpan = document.createElement("span");
					destinationSpan.innerHTML = passages[i].MonitoredVehicleJourney.MonitoredCall.DestinationDisplay[0].value
						.replaceAll("'", "\u2019")
						.replaceAll(" - ", "\u2013");
					rectangleDiv.appendChild(destinationSpan);

					const tempsSpan = document.createElement("span");
					tempsSpan.classList.add(`temps-partiel${i+1}`);
					rectangleDiv.appendChild(tempsSpan);

					// Ajout des minutes dans temps
					const minutesSpan = document.createElement("span");
					minutesSpan.innerHTML = minutes;
					tempsSpan.appendChild(minutesSpan);

					if (minutes === 0) {
						minutesSpan.classList.add("zero-sync");
					} else {
						minutesSpan.classList.remove("zero-sync");
						minutesSpan.style.opacity = "1"; // Réinitialise l'opacité
					}
				} else {
					// Vérifier le départ d'un train
					const ancienneValeur = tempsDiv.querySelector("span").textContent;
					const nouvelleValeur = String(minutes);

					if (i === 0 && ancienneValeur === "0" && minutes > Number(ancienneValeur)) {
						isTranslating = true;

						// Prépare le 3e rectangle
						const rectangle3 = document.querySelector(".rectangle3");
						const temps3 = document.querySelector(".temps-partiel3");
						if (rectangle3 && temps3) {
							const dest3Span = rectangle3.querySelector("span:first-child");
							const temps3Span = temps3.querySelector("span");
							dest3Span.innerHTML = passages[2].MonitoredVehicleJourney.MonitoredCall.DestinationDisplay[0].value.replaceAll("'", "\u2019").replaceAll(" - ", "\u2013");
							temps3Span.innerHTML = prochains[2];
						}

						// Animation verticale
						[".rectangle1", ".rectangle2", ".rectangle3"].forEach(selector => {
							const rect = document.querySelector(selector);
							if (rect) {
								rect.classList.remove('translation');
								void rect.offsetWidth; // Force reflow
								rect.classList.add('translation');
							}
						});

						// Après l'animation, mettre à jour les temps
						setTimeout(() => {
							const rect1 = document.querySelector(".rectangle1");
							const rect2 = document.querySelector(".rectangle2");
							const temps1Span = document.querySelector(".temps-partiel1 span");
							const temps2Span = document.querySelector(".temps-partiel2 span");
							const dest1Span = rect1.querySelector("span:first-child");
							const dest2Span = rect2.querySelector("span:first-child");

							dest1Span.innerHTML = passages[1].MonitoredVehicleJourney.MonitoredCall.DestinationDisplay[0].value.replaceAll("'", "\u2019").replaceAll(" - ", "\u2013");
							dest2Span.innerHTML = passages[2].MonitoredVehicleJourney.MonitoredCall.DestinationDisplay[0].value.replaceAll("'", "\u2019").replaceAll(" - ", "\u2013");

							
						}, 2000);
					}
				}
			}
			return;
		} */

		const moitieGauche = document.getElementById("moitie-gauche");
		const moitieDroite = document.getElementById("moitie-droite");
		const moitieCachee = document.getElementById("moitie-cachee");

		for (let i = 0; i < 3; i++) {
			let passage = passages[i];
			let depart = passage.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime ? passage.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime : null;
			let minutes = depart ? Math.max(Math.ceil((Date.parse(depart) - Date.now())/1000/60), 0) : -1;
			if (i === 1 && minutes === 0) minutes = 1;
			prochains[i] = minutes;
			console.log(minutes);
			if (i === 0 || i === 1 || i === 2) {
				let passageDiv = document.querySelector(`.passage${i+1}`);
				let hasChanged = false;
				
				if (!passageDiv) {
					// Créer l'élément s'il n'existe pas
					passageDiv = document.createElement("div");
					passageDiv.classList.add(`passage${i+1}`);
					passageDiv.textContent = minutes >= 0 ? (minutes < 60 ? String(minutes) : `${Math.floor(minutes/60)}h${minutes%60}`) : "...";
					if (i === 0) moitieGauche.appendChild(passageDiv);
					else if (i === 1) moitieDroite.appendChild(passageDiv);
					else if (i === 2) moitieCachee.appendChild(passageDiv);
				} else {
					// Vérifier si la valeur a changé
					const ancienneValeur = passageDiv.textContent;
					const nouvelleValeur = minutes >= 0 ? (minutes < 60 ? String(minutes) : `${Math.floor(minutes/60)}h${minutes%60}`) : "...";

					if (ancienneValeur === "0" && minutes > Number(ancienneValeur)) {
						hasChanged = true;
						isTranslating = true;

						// Prépare la valeur du 3e train, qui va devenir 2e après transition
						document.querySelector('.passage3').textContent = prochains[2];

						// Lance l'animation de translation
						[moitieGauche, moitieDroite, moitieCachee].forEach(m => {
							m.classList.remove('translation');
							void m.offsetWidth; // Force reflow
							m.classList.add('translation');
						});
						
						// Réactive les updates après l'animation
						setTimeout(() => {
							// Mise à jour des valeurs avec l'animation pulse
							const passage1 = document.querySelector('.passage1');
							const passage2 = document.querySelector('.passage2');
							const passage3 = document.querySelector('.passage3');

							const valeurActuelle1 = passage2.textContent;
							const valeurActuelle2 = passage3.textContent;
							const nouvelleValeur1 = String(prochains[0]);
							const nouvelleValeur2 = String(prochains[1]);

							passage1.textContent = valeurActuelle1;
							passage1.style.opacity = "1";
							passage2.textContent = valeurActuelle2;

							let maxDelai = 0;

							// Animation pulse pour passage1 seulement si changement
							if (valeurActuelle1 !== nouvelleValeur1) {
								passage1.classList.remove('pulse');
								void passage1.offsetWidth;
								passage1.classList.add('pulse');
								passage1.style.opacity = "1";
								
								setTimeout(() => {
									passage1.textContent = nouvelleValeur1;
									if (prochains[0] === 0) {
										passage1.classList.add("zero-sync");
									}
								}, 3000);
								
								maxDelai = 3000;
							} else {
								// Pas de changement, mise à jour directe
								passage1.textContent = nouvelleValeur1;
								if (prochains[0] === 0) {
									passage1.classList.add("zero-sync");
								}
							}
							
							// Animation pulse pour passage2 seulement si changement
							if (valeurActuelle2 !== nouvelleValeur2) {
								passage2.classList.remove('pulse');
								void passage2.offsetWidth;
								passage2.classList.add('pulse');
								
								setTimeout(() => {
									passage2.textContent = nouvelleValeur2;
									if (prochains[1] === 0) {
										passage2.classList.add("zero-sync");
									}
								}, 3000);
								
								maxDelai = 3000;
							} else {
								// Pas de changement, mise à jour directe
								passage2.textContent = nouvelleValeur2;
								if (prochains[1] === 0) {
									passage2.classList.add("zero-sync");
								}
							}

							setTimeout(() => {
								isTranslating = false;
							}, maxDelai);

						}, 2000); // Durée de l'animation de translation
					}
					else if (ancienneValeur !== nouvelleValeur && !(ancienneValeur === "0" && minutes > 0) && !isTranslating) {
						hasChanged = true;
						// Lancer l'animation
						passageDiv.classList.remove('pulse');
						void passageDiv.offsetWidth; // Force reflow
						passageDiv.classList.add('pulse');
						
						// Change la valeur après l'animation
						setTimeout(() => {
							passageDiv.textContent = nouvelleValeur;
						}, 3000);
					}
				}
				if (minutes === 0) {
					if (hasChanged) {
						setTimeout(() => {
							passageDiv.classList.add("zero-sync");
						}, 3000);
					} else {
						passageDiv.classList.add("zero-sync");
					}
				} else {
					passageDiv.classList.remove("zero-sync");
					passageDiv.style.opacity = "1"; // Réinitialise l'opacité
				}
			}
		}
	})
}

syncClock();

handleLigne(ligne);

handleDirection(ligne);

setInterval(handlePassages, 30000);
handlePassages();