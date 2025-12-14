currentURL = window.location.href;
currentLine = currentURL.substring(currentURL.lastIndexOf('/') + 1).replace(".html", "");

fetch(`https://mobifer-tempsreel.alwaysdata.net/infotrafic.php?line=${currentLine}`)
.then(response => response.json())
.then(data => {
	const infoDiv = document.getElementById('infotrafic');
	if (data.rpi_last_updated) {
		lastUpdateDate = getRelativeDateIntl(data.rpi_last_updated);
		lastUpdateTime = new Date(data.rpi_last_updated).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
	}
	infoDiv.innerHTML = `<p style="text-align: right; margin-top: 5px;"><em>Dernière mise à jour : ${lastUpdateDate} à ${lastUpdateTime}</em></p>`;
	const results = data.disruptions;
	let resultCount = 0;
	if (results && results.length > 0) {
		const newResults = [];
		results.forEach(element => {
			if (element.tags) {
				if (element.status === "active" && element.tags.includes('Actualité')) {
					newResults.unshift(element);
				}
				else if (element.status === "future" && element.tags.includes('Actualité')) {
					newResults.push(element);
				}
			}
			else {
				if (element.status === "active") {
					newResults.unshift(element);
				}
				else if (element.status === "future") {
					newResults.push(element);
				}
			}
		})
		newResults.forEach((element, index) => {
			resultCount++;
			let messages = element.messages;
			let titre = "";
			let contenu = "";
			messages.forEach(message => {
				if (message.channel.name === "titre") {
					titre = message.text.replace(/'/g, "’");
				}
				if (message.channel.name === "moteur") {
					contenu = message.text.replace(/'/g, "’");
				}
			});
			if (titre && contenu) {
				if (element.cause === "travaux") {
					if (element.status === "active") {
						infoDiv.innerHTML += `<h3 style='margin-bottom: 0;'><span class="integrated perturbation"><img src="/assets/icons/Perturbation_travaux_couleur_RVB.svg" alt="Travaux"></span> ${titre}</h3><br>${contenu}`;
					}
					else {
						infoDiv.innerHTML += `<h3 style='margin-bottom: 0;'><span class="integrated"><img src="/assets/icons/Perturbation_travaux_NB_RVB.svg" alt="Travaux"></span> ${titre}</h3><br>${contenu}`;
					}
				}
				else if (element.cause === "perturbation") {
					if (element.status === "active") {
						infoDiv.innerHTML += `<h3 style='margin-bottom: 0;'><span class="integrated perturbation"><img src="/assets/icons/Perturbation_trafic_couleur_RVB.svg" alt="Perturbation"></span> ${titre}</h3><br>${contenu}`;
					}
					else {
						infoDiv.innerHTML += `<h3 style='margin-bottom: 0;'><span class="integrated"><img src="/assets/icons/Perturbation_trafic_NB_RVB.svg" alt="Perturbation"></span> ${titre}</h3><br>${contenu}`;
					}
				}
				else if (element.cause === "information") {
					infoDiv.innerHTML += `<h3 style='margin-bottom: 0;'><span class="integrated"><img src="/assets/icons/Ecran_info_trafic_RVB.svg" alt="Information"></span> ${titre}</h3><br>${contenu}`;
				}
				if (!(index === newResults.length - 1)) {
					infoDiv.innerHTML += '<hr>';
				}
			}
		});
	}
	if (resultCount === 0) {
		infoDiv.innerHTML += '<p class="centered"><span class="integrated"><img src="/assets/icons/Trafic_normal_RVB.svg" alt="Trafic normal"></span> Aucune perturbation sur la ligne.</p>';
	}
})

function getRelativeDateIntl(isoString) {
	const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
	const date = new Date(isoString);
	const now = new Date();

	const diffInMs = now - date;
	const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

	return rtf.format(-diffInDays, 'day');
}
