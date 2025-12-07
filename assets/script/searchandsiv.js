export function hidesearch() {
    var input = document.getElementById("search");
    var results = document.getElementById("search-results");

    if (!input.classList.contains("active")) {
        input.classList.add("active");
        input.focus();
    } else {
        if (input) input.value = "";
        if (results) results.innerHTML = "";
        input.classList.remove("active");
    }
}

export function switchToPANAM() {
    document.querySelectorAll("iframe.ratp").forEach(iframe => {
        iframe.src = iframe.src.replace("?style=siel", "?style=panam");
        iframe.classList.remove("piq");
        iframe.classList.add("panam");
    });
}

export function switchToPIQ() {
    document.querySelectorAll("iframe.ratp").forEach(iframe => {
        iframe.src = iframe.src.replace("?style=panam", "?style=siel").replace("&rivoli=true", "&rivoli=false");
        iframe.classList.remove("panam");
        iframe.classList.add("piq");
    });
}

export function switchToPIQDark() {
    document.querySelectorAll("iframe.ratp").forEach(iframe => {
        iframe.src = iframe.src.replace("?style=panam", "?style=siel").replace("&rivoli=false", "&rivoli=true");
        iframe.classList.remove("panam");
        iframe.classList.add("piq");
    });
}

export function detecterStyleInitial() {
    document.querySelectorAll("iframe.ratp").forEach(iframe => {
        if (iframe.src.includes('style=panam')) {
            iframe.classList.add("panam");
        } else {
            iframe.classList.add("piq");
        }
    });
}
setTimeout(detecterStyleInitial, 1000);