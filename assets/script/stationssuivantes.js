// Génération des arrêts suivants
let prochainsArrets = {};
let destinations = {};

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
                let precedentId = [];
                let suivant = prochainsArrets[ligne][1];
                let suivantId = [];

                if (precedent != "Terminus" && !Array.isArray(precedent)) {
                    precedentId = ["/stations.html?station=" + precedent.replaceAll(" \u2013 ", "-").replaceAll("\u2019", "").replaceAll(".", "").normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "")];
                } else if (Array.isArray(precedent)) {
                    precedent.forEach(station => {
                        precedentId.push("/stations.html?station=" + station.replaceAll(" \u2013 ", "-").replaceAll("\u2019", "").replaceAll(".", "").normalize("NFD").replaceAll(/[\u0300-\u036f]/g, ""));
                    })
                }

                if (suivant != "Terminus" && !Array.isArray(suivant)) {
                    suivantId = ["/stations.html?station=" + suivant.replaceAll(" \u2013 ", "-").replaceAll("\u2019", "").replaceAll(".", "").normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "")];
                } else if (Array.isArray(suivant)) {
                    suivant.forEach(station => {
                        suivantId.push("/stations.html?station=" + station.replaceAll(" \u2013 ", "-").replaceAll("\u2019", "").replaceAll(".", "").normalize("NFD").replaceAll(/[\u0300-\u036f]/g, ""));
                    })
                }

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
                containerHTML += `<tr><td class="title" style="font-size: 1.2em; text-align: center !important; width: 50%;">Direction</td><td class="title" style="font-size: 1.2em; text-align: center !important; width: 50%;">${pictos}</td></tr>`;

                if (Array.isArray(precedent)) {
                    precedent.forEach((prec, i) => {
                        containerHTML += `<tr><td class="title" style="width: 50%;">${terminusAller[precedent.indexOf(prec)]}</td><td><a href="${precedentId[i]}">${prec}</a></td></tr>`;
                    });
                } else {
                    if (Array.isArray(terminusAller))
                        terminusAller = terminusAller.join(" • ");
                    containerHTML += `<tr><td class="title" style="width: 50%;">${terminusAller}</td><td><a href="${precedentId}">${precedent}</a></td></tr>`;
                }
                
                if (Array.isArray(suivant)) {
                    suivant.forEach((suiv, i) => {
                        containerHTML += `<tr><td class="title">${terminusRetour[suivant.indexOf(suiv)]}</td><td><a href="${suivantId[i]}">${suiv}</a></td></tr>`;
                    });
                } else {
                    if (Array.isArray(terminusRetour))
                        terminusRetour = terminusRetour.join(" • ");
                    containerHTML += `<tr><td class="title">${terminusRetour}</td><td><a href="${suivantId}">${suivant}</a></td></tr>`;
                }

                containerHTML += `</table></div>`;
            }
        });

        if (containerHTML !== ``) {
            container.innerHTML = containerHTML.replaceAll(" \u2013 ", "\u2013");
            document.getElementById("stations-suivantes").style.display = "block";
        }
    })
.catch(err => console.error("Erreur de chargement du JSON des stations dans l'ordre :", err));