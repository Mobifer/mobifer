// station.js //
// Ce script permet l'affichage des stations sur la page /stations.html
// depuis le fichier de données /data/stations.json

// Import du module personnalisé de création des icônes des lignes
import { genererLignesHTML } from "./genlineicons.js";

// Exécution du script au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
	// Prise en compte des arguments dans le lien
	// ?station=X
	const urlParams = new URLSearchParams(window.location.search);
	const stationID = urlParams.get("station");

	async function getStations() {
		const response = await fetch('/data/stations.json');
		return await response.json();
	};

	// Si aucun argument n'est dans le lien, affichage de la liste des stations
	if (!stationID) {
		getStations().then(data => {
			// Génération d'une liste des stations
			const stationListe = Object.values(data).map(station => ({
				// L'ID est le nom de la clef de JSON
				// Il sert à construire le lien
				id: '/stations.html?station=' + Object.keys(data).find(key => data[key] === station),
				nom: station.nom,
				lignes: station.lignes
			}));

			// Trie alphabétiquement les stations
			stationListe.sort((a, b) => a.nom.localeCompare(b.nom));

			// Génère le HTML
			const stationListeHTML = stationListe.map(station => {
				const lignesHTML = genererLignesHTML(station.lignes);
				return `<tr><td style="font-size: 1.4em;">${lignesHTML}</td>
				<td><a href="${station.id}" style="text-decoration: none; color: inherit; font-size: 1.2em;">${station.nom}</a></td></tr>`
			}).join("");

			const HTMLComplet = `<div class="box image-center" style="max-width: 800px !important;">
			<h2 class="centered">Liste des ${stationListe.length} stations disponibles</h2>
			<p class="centered">Cliquez sur le nom d’une station pour en savoir plus.</p>
			<table style="text-align: left;"><tr><td class="title" style="text-align: left; font-size: 1.4em;">Ligne(s)</td>
			<td class="title" style="text-align: left; font-size: 1.4em;">Station</td></tr>${stationListeHTML}</table></div>`;

			document.getElementById('station-content').innerHTML = HTMLComplet.replaceAll(" \u2013 ", "\u2013");
		})
		.catch(error => console.error('Erreur de chargement des stations :', error));

		return;
	}

	// Sinon, on charge la station
	getStations().then(data => {
		const station = data[stationID];

		// Si la station n'est pas trouvée, renvoi d'une erreur 404
		if (!station) {
			let html = `<div class="centered">
				<p class="centered"><strong>Erreur 404</strong><br>
				<span class="centered terminus-box">Haxo</span></p>
				<img src="https://raw.githubusercontent.com/Mobifer/mobifer-images/refs/heads/main/vincent/haxo-1.webp" alt="Photo de la station fantôme Haxo" style="width: auto; max-width: 800px; max-height: 40vh; border-radius: 10px;" class="image-center">
				<div class="license">CC-BY-SA Vincent</div>
				<div class="box image-center" style="max-width: 800px !important;">
				<h2 class="centered">Vous êtes dans un lieu bien étrange.</h2>
				<p class="justified">Il semblerait que vous vous soyez perdu. La station que vous recherchée n’a pas été trouvée, soit parce qu’elle n’a pas encore été ajoutée au site, soit parce qu’elle n’existe tout simplement pas.</p>
				<p class="justified">Revenez à l’accueil en cliquant sur le bouton ci-dessous ou cherchez une autre station à l’aide du bouton situé en-dessous de l’en-tête.
				<div class="buttons">
				<a href="/" class="button home"><span class="integrated"><img src="/assets/favicon.svg" alt="Logo MobiFer"></span> Revenir à l’accueil</a>
				<a href="/stations.html" class="button home">Voir la liste des stations</a>
				</div></p>
				</div>`
			document.getElementById("station-content").innerHTML = html;
			return;
		}

		document.title = `${station.nom} - MobiFer`;

		let lignesHTML = genererLignesHTML(station.lignes);

		// Génération de la liste des lignes (pour les stations suivantes)
		const lignesListe = [];
		const types = {
			metro: line => {
				if (line.endsWith("bis")) line = "0" + line.replace("bis", "b");
				return "m" + line.padStart(2, "0");
			},
			rer: line => "rer" + line,
			train: line => "train" + line,
			tram: line => {
				if (line.endsWith("a") || line.endsWith("b")) line = "0" + line;
				return "t" + line.padStart(2, "0");
			}
		};

		for (const [type, formatter] of Object.entries(types)) {
			const lignes = station.lignes[type];
			if (!Array.isArray(lignes)) continue;
			lignesListe.push(...lignes.map(formatter));
		};

		let html = `<div class="centered">
			<p class="centered"><strong>Station</strong><br>
			<span class="shadowed pictos">${lignesHTML}</span><br>
			<span class="centered terminus-box">${station.nom}</span>`;

		if (station.pti) {
			html += `<br><span class="ptinteret-station">${station.pti}</span>`;
		}

		if (station.rep) {
			html += `<br><span class="repere-station" style="border: 5px solid black !important; font-weight: bold; border-radius: 5px;">${station.rep}</span>`;
		}

		html += `</p>
		<div class="row">
		<div class="item">`;
		html += `<div style="break-inside: avoid;">`

		// Génération du slider d'images ou de l'image selon le cas
		if (Array.isArray(station.img) && station.img.length > 0) {
			html += `<div class="slideshow-container">`
			station.img.forEach((img, index) => {
				html += `<div class="slide fade">
					<img src="${img}" alt="Photo de la station">`
				if (station.imgsrc?.[index]) { // N'exécute que si station.imgsrc[index] existe
					html += `<div class="caption">© ${station.imga[index]} sur ${station.imgsrc[index]}</div>`
				} else {
					html += `<div class="caption">© ${station.imga[index]} sur <a href="${station.imgp}">Wikimedia Commons</a></div>`
				}
				html += `</div>`
			});
			html += '</div>'
		} else {
			html += `<img src="${station.img}" alt="Photo de la station" style="width: 100%; max-width: 800px; border-radius: 10px;" class="image-center">`
			if (station.imgsrc) {
				html += `<div class="license">© ${station.imga} sur ${station.imgsrc}</div>`
			} else {
				html += `<div class="license">© ${station.imga} sur <a href="${station.imgp}">Wikimedia Commons</a></div>`
			}
		}
		html += `</div></div>`

		// Génération des sorties
		html += `<div class="item">
			<div class="box image-center">
			<h2 class="centered">Accès</h2>
			<div class="centered"><span class="blue-box" style="padding: 10px !important; text-align: left;">`;
		
		let sortieNum = 0;

		// Fonction pour ajouter si besoin la présence d'accueil, ascenseur, escalator
		function genererAccessoires(sortie) {
			let html = ``;
			if (sortie.acc) {
				html += `<span class="integrated"><img src="/assets/icons/info.svg"></span><span class="integrated"><img src="/assets/icons/tickets.svg"></span>`;
			}
			if (sortie.asc) {
				html += `<span class="integrated"><img src="/assets/icons/ascenseur.svg"></span>`;
			}
			if (sortie.esc) {
				html += `<span class="integrated"><img src="/assets/icons/escalator.svg"></span>`;
			}
			return html;
		}

		station.sorties.forEach(sortie => {
			sortieNum += 1;
			html += `<div class="sortie-row">`;

			html += `<div class="sortie-left">
			<span class="num-sortie">${sortie.num}</span></div>`;

			html += `<div class="sortie-right">`;

			if (sortie.desc) {
				html += ` ${sortie.desc} `;
				html += `<span style="font-size: 1.25em">`
				html += genererAccessoires(sortie);
				html += `</span><br>`;
				var hasDescription = "style='margin-top: 5px !important;'";
			}
			else {
				var hasDescription = "";
			}
			if (sortie.rep) {
				// Si sortie.rep est une liste
				if (Array.isArray(sortie.rep)) {
					sortie.rep.forEach((repere, index) => {
						html += ` <span class="repere" ${hasDescription}>${repere}</span>`;
						// Si c'est le dernier, n'ajoute pas de saut de ligne
						if (index < sortie.rep.length - 1) {
							html += `<br>`;
						}
					})
				} else {
					html += ` <span class="repere" ${hasDescription}>${sortie.rep}</span>`;
				}
				if (!sortie.desc) {
					html += `<span style="font-size: 1.25em">`
					html += genererAccessoires(sortie);
					html += `</span>`
				}
				html += `<br>`;
			}
			if (sortie.pti) {
				// If sortie.pti is an array
				if (Array.isArray(sortie.pti)) {
					sortie.pti.forEach((pti, index) => {
						html += ` <span class="ptinteret" ${hasDescription}>${pti}</span>`;
						// Si c'est le dernier, n'ajoute pas de saut de ligne
						if (index < sortie.pti.length - 1) {
							html += `<br>`;
						}
					})
				} else {
					html += ` <span class="ptinteret" ${hasDescription}>${sortie.pti}</span>`;
				}
				
				if (!sortie.desc) {
					html += `<span style="font-size: 1.25em">`
					html += genererAccessoires(sortie);
					html += `</span>`
				}
				html += `<br>`;
			}
			html += `</div></div>`
		});
		html += `</span></div>`;
		// Ajoute la carte (sera complétée plus tard dans le code)
		html += `<div id="map"></div>`;
		html += `</div></div>`;

		// Génération des statistiques
		html += `<div class="item">
		<div class="box image-center">
		<h2 class="centered">Statistiques et données</h2>`;

		station.stats.forEach(stats => {
			// Génération des icônes des lignes
			let lignesTable = genererLignesHTML(stats.lignes);

			html += `<table style="text-align: left;">`;

			// Affichage des lignes si elles existent
			if (stats.lignes) {
				html += `<tr><td class="title" style= "width: 35%;">Ligne(s)</td><td style="font-size: 1.4em;">${lignesTable}</td></tr>`;
			}

			// Affichage des autres données de la station
			const donnees = [
				{ label: "Ouverture", valeur: stats.ouv },
				// Add line "Nom inaugural" if the value stats.inaugural != "undefined", otherwise do not add the line
				...(stats.inaug !== undefined ? [{ label: "Nom inaugural", valeur: stats.inaug }] : []),
				{ label: "Voies", valeur: stats.voies },
				{ label: "Quais", valeur: stats.quais },
				{ label: "Zone tarifaire", valeur: stats.zt },
				{ label: "Accessible", valeur: stats.ufr },
				{ label: "Communes desservies", valeur: stats.communes.join(", ") },
				{ label: "Fréquentation", valeur: stats.freq }
			];

			donnees.forEach(row => {
				// Vérifie que la valeur existe, sinon la ligne n'est pas ajoutée
				if (row.valeur) {
					html += `<tr><td class="title">${row.label}</td><td style="font-weight: normal;">${row.valeur}</td></tr>`;
				}
			});

			html += `</table>`;

			// Si ce n'est pas le dernier tableau de statistiques, alors saut de ligne
			if (station.stats.indexOf(stats) < station.stats.length - 1) {
				html += `<br>`;
			}
		});

		html += `</div></div>`;
		
		// Génération des SIV
		if (station.siv && station.siv.length > 0) {
			const transportTypes = {
				metro: { items: [], title: 'Prochains passages <span class="integrated"><img src="/assets/icons/symbole_metro_RVB.svg" alt="Métro" title="Métro"></span> <div class="btn-group" title="Modifiez le style des SIEL"><button onclick="switchToPANAM();"><img src="/assets/icons/panam.svg" alt="PANAM" style="height: 1.25em;" id="panam"></button><button onclick="switchToPIQ();"><img src="/assets/icons/piq.svg" alt="PIQ" style="height: 1.25em;" id="piq"></button><button onclick="switchToPIQDark();"><img src="/assets/icons/piq.svg" alt="PIQ" style="height: 1.25em;" id="piq"> (sombre)</button></div>' },
				train: { items: [], title: 'Prochains passages <span class="integrated"><img src="/assets/icons/symbole_RER_RVB.svg" alt="RER" title="RER"></span> et <span class="integrated"><img src="/assets/icons/symbole_train_RVB.svg" alt="Transilien" title="Transilien"></span>' },
				tram: { items: [], title: 'Prochains passages <span class="integrated"><img src="/assets/icons/symbole_tram_RVB.svg" alt="Tramway" title="Tramway"></span>' }
			};

			// Groupe par mode de transport
			station.siv.forEach(link => {
				if (link.metro) transportTypes.metro.items.push(link);
				if (link.train) transportTypes.train.items.push(link);
				if (link.tram) transportTypes.tram.items.push(link);
			});

			// Crée une boîte pour chaque mode qui contient au moins 1 SIV
			Object.entries(transportTypes).forEach(([type, data]) => {
				if (data.items.length > 0) {
					html += `<div class="item"><div class="box image-center">`;
					html += `<h2 class="centered">${data.title}</h2>`;
					if (type === 'metro') {
						html += `<div class="iframes-container"><div class="iframes">`;
					}
					
					data.items.forEach(link => {
						if (type === 'metro' && link.metro) {
							html += `<div class="item"><iframe src="${link.metro}+&rivoli=false" class="ratp" frameborder="0"></iframe></div>`;
						}
						if (type === 'train' && link.train) {
							html += `<iframe src="${link.train}" class="sncf" frameborder="0" scrolling="no"></iframe>`;
						}
						if (type === 'tram' && link.tram) {
							html += `<iframe src="/addons/sieltram.html?stop=${link.tram}&line=${link.line}" class="tram"></iframe>`;
						}
					});
					
					if (type === 'metro') {
						html += `</div></div>`;
					}

					html += `</div></div>`;
				}
			});

			// Ajout de la licence après toutes les boîtes
			html += `<div class="license">
			Reproductions des panneaux officiels proposées par <a href="https://enrail.org">enrail.org</a> (Métro), <a href="https://prochainstrains.arno.cl">Prochains Trains</a> (RER et Transilien) et MobiFer (Tramway)
			</div></div></div>`;
		}

		// Génération des arrêts suivants
		let prochainsArrets = {};
		let destinations = {};

		html += `<div class="box image-center" style="max-width: 1500px !important;">
		<h2 class="centered">Stations suivantes</h2>
		<div id="prochains-arrets" style="width: 100%; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;"></div>`;

		fetch('/data/metroliste.json')
			.then(response => response.json())
			.then(data => {
				const container = document.getElementById("prochains-arrets");
				let containerHTML = ``;

				lignesListe.forEach(ligne => {
					if (data[ligne]) {
						data[ligne].forEach(arret => {
							let stationAvantApres = [];
							let stationIndex = data[ligne].indexOf(arret);
							if (arret.constructor === Object) {
								if (arret.nom === station.nom) {
									// Si la station est un dictionnaire (dans une branche), on a directement le suivant et le prédécent
									stationAvantApres.push(arret.prec);
									stationAvantApres.push(arret.suiv);
									prochainsArrets[ligne] = stationAvantApres;
									destinations[ligne] = arret.terminus;
								}
							} else if (arret === station.nom) {
								// Si la station est "normale", on cherche le prédécent et le suivant
								// Attention aux stations précédant des stations en fourche !
								let avant = data[ligne][stationIndex - 1];
								let apres = data[ligne][stationIndex + 1];

								// Par exemple à Tolbiac, la station suivante sera Maison Blanche
								/* {
									"nom": "Maison Blanche",
									"prec": "Tolbiac",
									"suiv": ["Le Kremlin-Bicêtre", "Porte d’Italie"],
									"terminus": ["La Courneuve – 8 Mai 1945", ["Villejuif – Louis Aragon", "Mairie d’Ivry"]]
								} */ 
								
								if (avant.constructor === Object)
									avant = avant.nom;

								if (apres.constructor === Object)
									apres = apres.nom;
								
								stationAvantApres.push(avant);
								stationAvantApres.push(apres);
								prochainsArrets[ligne] = stationAvantApres;
							}
						});
					}
				})

				lignesListe.forEach(ligne => {
					if (prochainsArrets[ligne]?.length) {
						let precedent = prochainsArrets[ligne][0];
						let precedentId = "#";
						let suivant = prochainsArrets[ligne][1];
						let suivantId = "#";

						if (precedent != "Terminus" && !Array.isArray(precedent)) {
							precedentId = "/stations.html?station=" + precedent.replaceAll(" \u2013 ", "-").replaceAll("\u2019", "").replaceAll(".", "").normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "");
						}

						if (suivant != "Terminus" && !Array.isArray(suivant))
							suivantId = "/stations.html?station=" + suivant.replaceAll(" \u2013 ", "-").replaceAll("\u2019", "").replaceAll(".", "").normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "");

						let pictos = ""; 

						if (ligne.startsWith("m")) {
							pictos = genererLignesHTML({ metro: [ligne.replace(/^m0?/, "").replace("b", "bis")] });
						}

						let terminusAller;
						let terminusRetour;

						if (destinations[ligne] && destinations[ligne].length > 0) {
							terminusAller = destinations[ligne][0];
							terminusRetour = destinations[ligne][1];
						} else {
							terminusAller = data[ligne][1];
							terminusRetour = data[ligne][data[ligne].length - 2];
						}

						// Crée un tableau pour les prochains arrêts
						containerHTML += `<div style="flex: 1;">`;
						containerHTML += `<table style="text-align: left; min-width: 200px;">`;
						// Ligne de titre
						containerHTML += `<tr><td class="title" style="font-size: 1.2em; text-align: center !important; width: 50%;" colspan="2">${pictos}</td></tr>`;

						if (Array.isArray(precedent)) {
							precedent.forEach(prec => {
								containerHTML += `<tr><td class="title" style="width: 50%;">${terminusAller[precedent.indexOf(prec)]}</td><td><a href="${precedentId}">${prec}</a></td></tr>`;
							});
						} else {
							if (Array.isArray(terminusAller))
								terminusAller = terminusAller.join(" • ");
							containerHTML += `<tr><td class="title" style="width: 50%;">${terminusAller}</td><td><a href="${precedentId}">${precedent}</a></td></tr>`;
						}
						
						if (Array.isArray(suivant)) {
							suivant.forEach(suiv => {
								containerHTML += `<tr><td class="title">${terminusRetour[suivant.indexOf(suiv)]}</td><td><a href="${suivantId}">${suiv}</a></td></tr>`;
							});
						} else {
							if (Array.isArray(terminusRetour))
								terminusRetour = terminusRetour.join(" • ");
							containerHTML += `<tr><td class="title">${terminusRetour}</td><td><a href="${suivantId}">${suivant}</a></td></tr>`;
						}

						containerHTML += `</table></div>`;
					}
				});

				container.innerHTML = containerHTML.replaceAll(" \u2013 ", "\u2013");
			})
		.catch(err => console.error("Erreur de chargement du JSON des stations dans l'ordre :", err));

		html += `</div></div>`;

		// Ajoute le HTML modifié sur la page
		document.getElementById("station-content").innerHTML = html.replaceAll(" \u2013 ", "\u2013");

		// Génération de la carte

		const map = L.map('map').setView([48.857, 2.350], 18);
		// Calque de tuiles (fond de carte)
		L.tileLayer('https://igngp.geoapi.fr/tile.php/plan-ignv2/{z}/{x}/{y}.jpg', {
			attribution: '&copy; <a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a> &copy; <a href="https://prim.iledefrance-mobilites.fr">Île-de-France Mobilités</a>',
			subdomains: 'abcd',
			maxZoom: 18,
			minZoom: 13
		}).addTo(map);

		let stationsMarkers = new L.FeatureGroup();
		let allStationFeatures = [];

		fetch('/data/stationsPositions.geojson')
			.then(response => response.json())
			.then(data => {
				allStationFeatures = data.features;

				// La carte doit être centrée sur la station de la page
				// On compare le nom de la station de la page (station.nom), normalisé, sans accent, avec les noms des stations de la carte
				const stationName = station.nom.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").replaceAll(" – ", "-").toLowerCase();
				const stationPosition = data.features.find(feature => feature.properties.zdaname.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").replaceAll(" – ", "-").toLowerCase() === stationName);
				if (stationPosition) {
					map.setView([stationPosition.geometry.coordinates[1], stationPosition.geometry.coordinates[0]], 17);
				} else {
					// Si la station n'est pas trouvée, on centre la carte sur Paris centre
					map.setView([48.857, 2.350], 17);
				}
			})
		.catch(err => console.error("Erreur de chargement du GeoJSON :", err));

		let accesMarkers = new L.FeatureGroup();
		let allFeatures = [];

		fetch('/data/acces.geojson')
			.then(response => response.json())
			.then(data => {
				allFeatures = data.features;
				updateVisiblePoints(); // Affiche les premiers points visibles
				map.on('moveend', updateVisiblePoints);
			})
		.catch(err => console.error("Erreur de chargement du GeoJSON :", err));

		function updateVisiblePoints() {
			const bounds = map.getBounds();
			
			// Filtre les points visibles
			const visible = allFeatures.filter(f => {
				const [lon, lat] = f.geometry.coordinates;
				return bounds.contains(L.latLng([lat, lon]));
			});

			const visibleStation = allStationFeatures.filter(f => {
				const [lon, lat] = f.geometry.coordinates;
				return bounds.contains(L.latLng([lat, lon]));
			});

			accesMarkers.clearLayers();
			stationsMarkers.clearLayers();

			const markers = L.geoJSON({ type: 'FeatureCollection', features: visible }, {
				pointToLayer: function (feature, latlng) {
					return L.marker(latlng, {
						icon: L.icon({
							iconUrl: '/assets/icons/sortie.svg',
							iconSize: [30, 30],
							iconAnchor: [0, 0],
							popupAnchor: [15, 0]
						})
					});
				},
				onEachFeature: function (feature, layer) {
					const shortName = feature.properties.accshortname ?? '';
					const name = feature.properties.accname?.replace("'", "’") ?? '';
					let html = `
						<div class="sortie-row">
						<div class="sortie-left"><span class="num-sortie"><strong>${shortName}</strong></span></div>
						<div class="sortie-right">${name}</div>
						</div>`;
					layer.bindPopup(html);
				}
			});

			accesMarkers.addLayer(markers);
			accesMarkers.addTo(map);

			if (map.getZoom() < 16) {
				map.removeLayer(accesMarkers);
			} else {
				map.addLayer(accesMarkers);
			}

			const stationMarkers = L.geoJSON({ type: 'FeatureCollection', features: visibleStation }, {
				pointToLayer: function (feature, latlng) {
					// Icone par défaut au cas où on rencontre un type inattendu
					let iconUrl = '/assets/icons/train_S_couleur_RVB.svg';

					// Règle l'icône selon le mode de transport qui dessert la station
					if (feature.properties.zdatype === "metroStation") {
					iconUrl = '/assets/icons/symbole_metro_RVB.svg';
					} else if (feature.properties.zdatype === "railStation") {
					iconUrl = '/assets/icons/symbole_train_RER_RVB.svg';
					} else if (feature.properties.zdatype === "onstreetTram") {
					iconUrl = '/assets/icons/symbole_tram_RVB.svg';
					}

					return L.marker(latlng, {
						icon: L.icon({
							iconUrl: iconUrl,
							iconSize: [40, 40],
							iconAnchor: [0, 0],
							popupAnchor: [20, 0]
						})
					});
				},
				onEachFeature: function (feature, layer) {
					layer.bindPopup(feature.properties.zdaname);
				}
			});

			stationsMarkers.addLayer(stationMarkers);
			stationsMarkers.addTo(map);
		}

		// Initialise le slideshow après la mise à jour du DOM
		if (Array.isArray(station.img) && station.img.length > 0) {
			let slideIndex = 0;
			const slides = document.getElementsByClassName("slide");

			function showSlides(slide) {
				for (let i = 0; i < slides.length; i++) {
					slides[i].classList.remove("active");
				}

				slideIndex++;
				if (slideIndex > slides.length) { slideIndex = 1; }

				if (slides.length > 0) {
					slides[slideIndex - 1].classList.add("active");
				}

				setTimeout(showSlides, 3000); // or any interval you like
			}

			showSlides();
		}
	})
	.catch(error => console.error("Erreur de chargement des données :", error));
});
