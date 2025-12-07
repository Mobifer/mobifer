// Génération de la carte

const map = L.map('map').setView([48.857, 2.350], 18);
// Calque de tuiles (fond de carte)
L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://prim.iledefrance-mobilites.fr">Île-de-France Mobilités</a>',
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
        const stationName = station.nom.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").replaceAll(" – ", " ").replaceAll("-", " ").toLowerCase();
        const stationPosition = data.features.find(feature => feature.properties.zdaname.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").replaceAll(" – ", "-").replaceAll("-", " ").toLowerCase() === stationName);
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