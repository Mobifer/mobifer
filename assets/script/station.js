document.addEventListener("DOMContentLoaded", function () {
	const urlParams = new URLSearchParams(window.location.search);
	const stationId = urlParams.get("station");
	console.log(stationId);

	if (!stationId) {
		document.getElementById("station-content").innerHTML = "<h2>Station non trouvée.</h2>";
		return;
	}

	fetch("/data/stations.json")
		.then(response => response.json())
		.then(data => {
			const station = data[stationId];
			// Print station on browser console
			console.log(station);
			if (!station) {
				document.getElementById("station-content").innerHTML = "<h2>Station non trouvée.</h2>";
				return;
			}

			document.title = `${station.nom} - MobiFer`;

			// Génération des icônes des lignes générales
			function genererLignesHTML(lignes) {
				const ordreModes = ["metro", "RER", "train", "tram"]; // Ordre défini
				const iconesModes = {
					"metro": "/assets/icons/symbole_metro_RVB.svg",
					"RER": "/assets/icons/symbole_RER_RVB.svg",
					"train": "/assets/icons/symbole_train_RVB.svg",
					"tram": "/assets/icons/symbole_tram_RVB.svg"
				};
			
				function getLienLigne(type, numero) {
					switch (type) {
						case "metro":
							return `/lines/m${numero.padStart(2, "0")}.html`; // Métro 1 -> m01
						case "RER":
							return `/lines/rer${numero}.html`; // RER A -> rerA
						case "train":
							return `/lines/train${numero}.html`; // Transilien L -> trainL
						case "tram":
							return `/lines/t${(numero.replace("T", "")).padStart(2, "0")}.html`; // Tram 6 -> t06
						default:
							return "#"; // Sécurité si un type inconnu apparaît
					}
				}
			
				let result = [];
			
				// On parcourt les types de transport dans l'ordre défini
				ordreModes.forEach(mode => {
					let lignesFiltrees = lignes.filter(ligne => ligne.type === mode);
					if (lignesFiltrees.length > 0) {
						let iconeMode = `<span class="integrated"><img src="${iconesModes[mode]}" alt="${mode}"></span>`;
			
						let htmlLignes = lignesFiltrees.flatMap(ligne => 
							ligne.lines.map(numero => {
								let iconeLigne = `/assets/icons/${mode}_${numero}_couleur_RVB.svg`; // Génération automatique
								let lien = getLienLigne(mode, numero);
								return `<span class="integrated"><a href="${lien}"><img src="${iconeLigne}" alt="${numero}"></a></span>`;
							})
						).join("&thinsp;");
			
						result.push(`${iconeMode}&thinsp;${htmlLignes}`); // Ajout du mode et des lignes
					}
				});
			
				return result.join(" ");
			}

			let lignesHTML = genererLignesHTML(station.lignes);

			let html = `
				<p class="centered"><strong>Station</strong><br>
				<span style="font-size: 80px;" class="shadowed">${lignesHTML}</span><br>
				<span class="centered blue-box" style="font-size: 50px; padding: 5px; margin-top: 15px;"><strong>${station.nom}</strong></span>`;

			if (station.ptinteret) {
				html += `<br><span class="ptinteret" style="font-size: 30px;">${station.ptinteret}</span>`;
			}

			if (station.repere) {
				html += `<br><span class="repere" style="font-size: 30px; border: 5px solid black !important; font-weight: bold; border-radius: 5px;">${station.repere}</span>`;
			}

			html += `</p>
				<img src="${station.image}" alt="Photo de la station" style="width: 100%; max-width: 800px; border-radius: 10px;" class="image-center">
				<div class="license">© ${station.imageauthor} sur <a href="${station.imagepage}">Wikimedia Commons</a></div>`;
			
			html += `<div class="box image-center">
				<h2 class="centered">Statistiques</h2>`;
			
			// Génération des statistiques
			station.statistiques.forEach(stats => {
				let lignesTable = genererLignesHTML(stats.lignes); // Génération des icônes des lignes

				html += `<table>`;

				// Affichage des lignes si elles existent
				if (stats.lignes && stats.lignes.length > 0) {
					html += `<tr><td class="title">Ligne(s)</td><td style="font-size: 1.4em;">${lignesTable}</td></tr>`;
				}

				// Affichage des autres données de la station
				const donnees = [
					{ label: "Ouverture", valeur: stats.ouverture },
					// Add line "Nom inaugural" if the value stats.inaugural != "undefined", otherwise do not add the line
					...(stats.inaugural !== undefined ? [{ label: "Nom inaugural", valeur: stats.inaugural }] : []),
					{ label: "Voies", valeur: stats.voies },
					{ label: "Quais", valeur: stats.quais },
					{ label: "Zone tarifaire", valeur: stats.zone_tarifaire },
					{ label: "Accessible", valeur: stats.accessible },
					{ label: "Communes desservies", valeur: stats.communes.join(", ") },
					{ label: "Fréquentation", valeur: stats.frequentation }
				];

				donnees.forEach(row => {
					if (row.valeur) { // Vérifie que la valeur existe
						html += `<tr><td class="title">${row.label}</td><td>${row.valeur}</td></tr>`;
					}
				});

				html += `</table>`;
				// If it is NOT the last iteration, add <br>
				if (station.statistiques.indexOf(stats) < station.statistiques.length - 1) {
					html += `<br>`;
				}
			});

			html += `</div>`;

			// Génération des sorties
			html += `<div class="box image-center">
						<h2 class="centered">Sorties</h2>`;
			station.sorties.forEach(sortie => {
				html += `<span class="blue-box"><span class="num-sortie">${sortie.numero}</span>`;
				if (sortie.description) {
					html += ` ${sortie.description}`;
					html += `<br>`;
					var hasDescription = "style='margin-top: 5px !important;'";
				}
				else {
					var hasDescription = "";
				}
				if (sortie.repere) {
					html += ` <span class="repere" ${hasDescription}>${sortie.repere}</span>`;
				}
				if (sortie.ptinteret) {
					html += ` <span class="ptinteret" ${hasDescription}>${sortie.ptinteret}</span>`;
				}
				
				html += `</span>\n`;
			});
			html += `</div>`;

			// Ajout des liens Enrail uniquement pour le métro
			if (station.enrail_links && station.enrail_links.length > 0) {
				html += `<div class="box image-center">`;
				station.enrail_links.forEach(link => {
					html += `<iframe src="${link.link}" class="${link.style} frameborder="0"></iframe>`;
				});
				html += `</div>
					<div class="license" style="margin-top: 2px !important; margin-bottom: 8px;">
						Reproduction du visuel officiel, proposée par <a href="https://enrail.org">enrail.org</a>
					</div>`;
			}

			document.getElementById("station-content").innerHTML = html;
		})
		.catch(error => console.error("Erreur de chargement des données:", error));
});