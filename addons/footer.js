// footer.js

// Fonction pour charger le footer
function loadFooter() {
    fetch('/addons/footer.html') // Charge le fichier footer.html
        .then(response => response.text()) // Convertit la réponse en texte
        .then(data => {
            document.getElementById('footer-container').innerHTML = data; // Insère le footer
        })
        .catch(error => console.error('Erreur de chargement du footer:', error));
}

// Charger le footer après le chargement de la page
document.addEventListener('DOMContentLoaded', loadFooter);