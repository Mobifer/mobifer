// Génération des icônes des lignes générales

export function genererLignesHTML(lignes) {
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
				if (numero.endsWith("bis")) {
					return `/lines/m0${numero.replace("bis", "")}b.html`;
				} else if (numero === "orv") {
					return `/lines/orv.html`;
				} else if (numero === "cgv") {
					return `/lines/cgv.html`;
				} else if (numero === "fun") {
					return `lines/fun.html`
				} else {
					return `/lines/m${numero.padStart(2, "0")}.html`; // Métro 1 -> m01
				}
			case "RER":
				return `/lines/rer${numero}.html`; // RER A -> rerA
			case "train":
				return `/lines/train${numero}.html`; // Transilien L -> trainL
			case "tram":
				if (numero.endsWith("a") || numero.endsWith("b")) {
					return `/lines/t0${numero.replace("T", "")}.html`;
				}
				else {
					return `/lines/t${(numero.replace("T", "")).padStart(2, "0")}.html`; // Tram 6 -> t06
				}
			default:
				return "#"; // Sécurité si un type inconnu apparaît
		}
	}

	let result = [];

	// On parcourt les types de transport dans l'ordre défini
	ordreModes.forEach(mode => {
		let lignesFiltrees = lignes[mode.toLowerCase()] || [];
		if (lignesFiltrees.length > 0) {
			let iconeMode = `<span class="integrated"><img src="${iconesModes[mode]}" alt="${mode.charAt(0).toUpperCase() + mode.slice(1)}" style="margin-right: 0.2em;"></span>`;

			let htmlLignes = lignesFiltrees.map(numero => {
				let iconeLigne;
				if (numero === "cgv") {
					iconeLigne = `/assets/icons/LIG_IDFM_C00563.svg`;
				} else if (numero === "orv") {
					iconeLigne = `/assets/icons/LIG_IDFM_C01388.svg`;
				} else if (numero === "fun") {
					iconeLigne = `/assets/icons/funiculaire_montmartre_couleur_RVB.svg`;
				} else {
					iconeLigne = `/assets/icons/${mode}_${numero}_couleur_RVB.svg`; // Génération automatique
				}
				let lien = getLienLigne(mode, numero);
				return `<span class="integrated"><a href="${lien}"><img src="${iconeLigne}" alt="${numero}"  style="margin-right: 0.2em;"></a></span>`;
			}).join("");

			let first = htmlLignes.slice(0, htmlLignes.indexOf("</span>") + 7); // premier <span>…</span>
			let rest = htmlLignes.slice(htmlLignes.indexOf("</span>") + 7); // dernier span

			// Les 2 lignes ci-dessus servent à autoriser le saut de ligne entre pictos ligne mais interdire le saut de ligne entre le picto mode et le premier picto ligne

			result.push(
			`<span style="white-space:nowrap;">${iconeMode}${first}</span>${rest}`
			);
		}
	});

	return result.join(" ");
}