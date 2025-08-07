// Gestion des résultats de recherche - Version simplifiée
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer le paramètre de recherche depuis l'URL de manière compatible
    var query = getQueryParameter('q');
    
    if (!query) return; // Pas de recherche, on ne fait rien
    
    // Charger les données de recherche
    fetch('/data/search-index.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            performSearch(query, data);
        })
        .catch(function(error) {
            console.error('Erreur lors du chargement des données:', error);
        });
});

// Fonction simple pour récupérer un paramètre d'URL
function getQueryParameter(name) {
    var url = window.location.search;
    var regex = new RegExp('[?&]' + name + '=([^&#]*)');
    var results = regex.exec(url);
    return results ? decodeURIComponent(results[1]) : null;
}

function performSearch(query, searchData) {
    var queryLower = query.toLowerCase();
    var results = {
        profils: [],
        sujets: []
    };
    
    // Recherche dans les profils
    if (searchData.profils) {
        for (var i = 0; i < searchData.profils.length; i++) {
            var profil = searchData.profils[i];
            var titleLower = profil.title.toLowerCase();
            
            if (titleLower.indexOf(queryLower) !== -1) {
                results.profils.push(profil);
            }
        }
    }
    
    // Recherche dans les sujets
    if (searchData.sujets) {
        for (var i = 0; i < searchData.sujets.length; i++) {
            var sujet = searchData.sujets[i];
            var titleLower = sujet.title.toLowerCase();
            
            if (titleLower.indexOf(queryLower) !== -1) {
                results.sujets.push(sujet);
            }
        }
    }
    
    displayResults(query, results);
}

function displayResults(query, results) {
    // Mettre à jour le titre de la page
    document.title = 'Résultats pour "' + query + '" - CasierPolitique.com';
    
    // Mettre à jour la requête affichée
    var queryElement = document.querySelector('.search-query');
    if (queryElement) {
        queryElement.innerHTML = 'Recherche pour : <strong>"' + query + '"</strong>';
    }
    
    // Mettre à jour les sections de résultats
    updateSection('profils', results.profils);
    updateSection('sujets', results.sujets);
    
    // Afficher "aucun résultat" si nécessaire
    if (results.profils.length === 0 && results.sujets.length === 0) {
        showNoResults(query);
    }
}

function updateSection(type, items) {
    var sections = document.querySelectorAll('.results-section');
    var section;
    
    if (type === 'profils' && sections[0]) {
        section = sections[0];
    } else if (type === 'sujets' && sections[1]) {
        section = sections[1];
    }
    
    if (!section) return;
    
    var grid = section.querySelector('.results-grid');
    if (!grid) return;
    
    // Mettre à jour le titre
    var title = section.querySelector('h2');
    if (title) {
        title.textContent = (type === 'profils' ? 'Profils' : 'Sujets') + ' (' + items.length + ')';
    }
    
    // Vider et remplir la grille
    grid.innerHTML = '';
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = '<h3><a href="' + item.url + '">' + item.title + '</a></h3><p>' + item.description + '</p>';
        grid.appendChild(card);
    }
}

function showNoResults(query) {
    var container = document.querySelector('.results-container');
    if (container) {
        container.innerHTML = 
            '<div class="no-results">' +
            '<p>Aucun résultat trouvé pour "' + query + '".</p>' +
            '<div class="suggestions">' +
            '<h3>Suggestions :</h3>' +
            '<ul>' +
            '<li>Vérifiez l\'orthographe des mots-clés</li>' +
            '<li>Essayez des mots-clés plus généraux</li>' +
            '<li>Essayez un nombre différent de mots-clés</li>' +
            '</ul>' +
            '</div>' +
            '</div>';
    }
} 