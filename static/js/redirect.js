// Script de redirection pour éviter les miroirs
if (location.host !== "www.casierpolitique.com") {
    location.href = "https://www.casierpolitique.com" + location.pathname;
} 