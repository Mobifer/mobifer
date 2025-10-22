import { genererLignesHTML } from "./genlineicons.js";

const textArea = document.getElementById("code");

textArea.addEventListener("input", function () {
    try {
        const stationInput = JSON.parse(this.value);
        const station = Object.values(stationInput)[0];
        
        let lignesHTML = genererLignesHTML(station.lignes);

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
            <div class="item">`
        
        html += `<div style="break-inside: avoid;">`
        if (Array.isArray(station.img) && station.img.length > 0) {
            html += `<div class="slideshow-container">`
            station.img.forEach((img, index) => {
                html += `<div class="slide fade">
                    <img src="${img}" alt="Photo de la station">`
                if (station.imgsrc?.[index]) { // Only run if station.imgsrc[index] exists
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
        
        var sortieNum = 0;
        station.sorties.forEach(sortie => {
            sortieNum += 1;
            html += `<div class="sortie-row">`;

            html += `<div class="sortie-left"><span class="num-sortie">${sortie.num}</span></div>`;

            html += `<div class="sortie-right">`;

            if (sortie.desc) {
                html += ` ${sortie.desc} `;
                html += `<span style="font-size: 1.25em">`
                if (sortie.acc) {
                    html += `<span class="integrated"><img src="/assets/icons/info.svg"></span><span class="integrated"><img src="/assets/icons/tickets.svg"></span>`;
                }
                if (sortie.asc) {
                    html += `<span class="integrated"><img src="/assets/icons/ascenseur.svg"></span>`;
                }
                if (sortie.esc) {
                    html += `<span class="integrated"><img src="/assets/icons/escalator.svg"></span>`;
                }
                html += `</span><br>`;
                var hasDescription = "style='margin-top: 5px !important;'";
            }
            else {
                var hasDescription = "";
            }
            if (sortie.rep) {
                // If sortie.rep is an array
                if (Array.isArray(sortie.rep)) {
                    sortie.rep.forEach((repere, index) => {
                        html += ` <span class="repere" ${hasDescription}>${repere}</span>`;
                        // If last pti, do not add a line break
                        if (index < sortie.rep.length - 1) {
                            html += `<br>`;
                        }
                    })
                } else {
                    html += ` <span class="repere" ${hasDescription}>${sortie.rep}</span>`;
                }
                if (!sortie.desc) {
                    html += `<span style="font-size: 1.25em">`
                    if (sortie.acc) {
                        html += ` <span class="integrated"><img src="/assets/icons/info.svg"></span> <span class="integrated"><img src="/assets/icons/tickets.svg"></span>`;
                    }
                    if (sortie.asc) {
                        html += ` <span class="integrated"><img src="/assets/icons/ascenseur.svg"></span>`;
                    }
                    if (sortie.esc) {
                        html += ` <span class="integrated"><img src="/assets/icons/escalator.svg"></span>`;
                    }
                    html += `</span>`
                }
                html += `<br>`;
            }
            if (sortie.pti) {
                // If sortie.pti is an array
                if (Array.isArray(sortie.pti)) {
                    sortie.pti.forEach((pti, index) => {
                        html += ` <span class="ptinteret" ${hasDescription}>${pti}</span>`;
                        // If last pti, do not add a line break
                        if (index < sortie.pti.length - 1) {
                            html += `<br>`;
                        }
                    })
                } else {
                    html += ` <span class="ptinteret" ${hasDescription}>${sortie.pti}</span>`;
                }
                
                if (!sortie.desc) {
                    html += `<span style="font-size: 1.25em">`
                    if (sortie.acc) {
                        html += ` <span class="integrated"><img src="/assets/icons/info.svg"></span> <span class="integrated"><img src="/assets/icons/tickets.svg"></span>`;
                    }
                    if (sortie.serv) {
                        html += ` <span class="integrated"><img src="/assets/icons/info.svg"></span>`;
                    }
                    if (sortie.asc) {
                        html += ` <span class="integrated"><img src="/assets/icons/ascenseur.svg"></span>`;
                    }
                    if (sortie.esc) {
                        html += ` <span class="integrated"><img src="/assets/icons/escalator.svg"></span>`;
                    }
                    html += `</span>`
                }
                html += `<br>`;
            }
            html += `</div></div>`
        });
        html += `</span></div>`;
        html += `<div id="map"></div>`;
        html += `</div></div>`;

        html += `<div class="item">
            <div class="box image-center">
            <h2 class="centered">Statistiques et données</h2>`;
        
        // Génération des statistiques
        station.stats.forEach(stats => {
            let lignesTable = genererLignesHTML(stats.lignes); // Génération des icônes des lignes

            html += `<table style="text-align: left;">`;

            // Affichage des lignes si elles existent
            if (stats.lignes) {
                html += `<tr><td class="title">Ligne(s)</td><td style="font-size: 1.4em;">${lignesTable}</td></tr>`;
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
                if (row.valeur) { // Vérifie que la valeur existe
                    html += `<tr><td class="title">${row.label}</td><td style="font-weight: normal;">${row.valeur}</td></tr>`;
                }
            });

            html += `</table>`;
            // If it is NOT the last iteration, add <br>
            if (station.stats.indexOf(stats) < station.stats.length - 1) {
                html += `<br>`;
            }
        });

        html += `</div></div>`;

        // Add SIV panels
        if (station.siv && station.siv.length > 0) {
        const transportTypes = {
            metro: { items: [], title: 'Prochains passages <span class="integrated"><img src="/assets/icons/symbole_metro_RVB.svg" alt="Métro" title="Métro"></span> <div class="btn-group" title="Modifiez le style des SIEL"><button onclick="switchToPANAM();"><img src="/assets/icons/panam.svg" alt="PANAM" style="height: 1.25em;" id="panam"></button><button onclick="switchToPIQ();"><img src="/assets/icons/piq.svg" alt="PIQ" style="height: 1.25em;" id="piq"></button><button onclick="switchToPIQDark();"><img src="/assets/icons/piq.svg" alt="PIQ" style="height: 1.25em;" id="piq"> (sombre)</button></div>' },
            train: { items: [], title: 'Prochains passages <span class="integrated"><img src="/assets/icons/symbole_RER_RVB.svg" alt="RER" title="RER"></span> et <span class="integrated"><img src="/assets/icons/symbole_train_RVB.svg" alt="Transilien" title="Transilien"></span>' },
            tram: { items: [], title: 'Prochains passages <span class="integrated"><img src="/assets/icons/symbole_tram_RVB.svg" alt="Tramway" title="Tramway"></span>' }
        };
        
        // Group by transport type
        station.siv.forEach(link => {
            if (link.metro) transportTypes.metro.items.push(link);
            if (link.train) transportTypes.train.items.push(link);
            if (link.tram) transportTypes.tram.items.push(link);
        });
        
        // Create a box for each type that has items
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

        // Add license at the end, after all boxes
        html += `<div class="license" style="padding-bottom: 10px;">
                        Reproductions des panneaux officiels proposées par <a href="https://enrail.org">enrail.org</a> (Métro), <a href="https://prochainstrains.arno.cl">Prochains Trains</a> (RER et Transilien) et MobiFer (Tramway)
                </div></div></div></div>`;
        }

        document.getElementById("station-content").innerHTML = html;

        const map = L.map('map').setView([48.857, 2.350], 18);

        // Calque de tuiles (fond de carte)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMaps</a> contributors &copy; <a href="https://prim.iledefrance-mobilites.fr">Île-de-France Mobilités</a>',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 14
        }).addTo(map);

        let stationsMarkers = new L.FeatureGroup();
        let allStationFeatures = [];

        fetch('/data/stationsPositions.geojson')
            .then(response => response.json())
            .then(data => {
                allStationFeatures = data.features;

                // La carte doit être centrée sur la station de la page
                // On compare le nom de la station de la page (station.nom), normalisé, sans accent, avec les noms des stations de la carte
                const stationName = station.nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" – ", "-").toLowerCase();
                const stationPosition = data.features.find(feature => feature.properties.zdaname.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" – ", "-").toLowerCase() === stationName);
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

        // Initialize slideshow after DOM update
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
    } catch (error) {
        document.getElementById("station-content").innerHTML = `<div class="error">Un problème est survenu dans l’interprétation du JSON.</div>`;
        console.error("Erreur de chargement des données :", error);
    }
});