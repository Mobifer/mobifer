// request.js
// Ce script permet de télécharger les données en temps réel
// des prochains passages afin de les afficher sur un panneau.

async function requestTime(station) {
	const URL = `https://mobifer-tempsreel.alwaysdata.net/passages.php?station=${encodeURIComponent(station)}`;

	return fetch(URL)
		.then(response => response.json())
		.then(data => {
			return data?.Siri?.ServiceDelivery?.StopMonitoringDelivery[0]?.MonitoredStopVisit;
		})
}

export default requestTime;