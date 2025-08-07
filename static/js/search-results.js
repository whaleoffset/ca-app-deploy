// Gestion des résultats de recherche - Version simplifiée
document.addEventListener('DOMContentLoaded', function() {
    console.log('Search results script loaded');
    
    // Récupérer le paramètre de recherche depuis l'URL de manière compatible
    var query = getQueryParameter('q');
    console.log('Query parameter:', query);
    
    if (!query) {
        console.log('No query parameter found');
        return; // Pas de recherche, on ne fait rien
    }
    
    // Charger les données de recherche
    console.log('Fetching search data...');
    fetch('/data/search-index.json')
        .then(function(response) {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(function(data) {
            console.log('Search data loaded:', data);
            performSearch(query, data);
        })
        .catch(function(error) {
            console.error('Erreur lors du chargement des données:', error);
        });
});

// Fonction simple pour récupérer un paramètre d'URL
function getQueryParameter(name) {
    var url = window.location.search;
    console.log('Current URL search:', url);
    var regex = new RegExp('[?&]' + name + '=([^&#]*)');
    var results = regex.exec(url);
    var result = results ? decodeURIComponent(results[1]) : null;
    console.log('Extracted parameter:', result);
    return result;
}

function performSearch(query, searchData) {
    console.log('Performing search for:', query);
    var queryLower = query.toLowerCase();
    var results = {
        profils: [],
        sujets: []
    };
    
    // Recherche dans les profils
    if (searchData.profils) {
        console.log('Searching in', searchData.profils.length, 'profils');
        for (var i = 0; i < searchData.profils.length; i++) {
            var profil = searchData.profils[i];
            var titleLower = profil.title.toLowerCase();
            
            if (titleLower.indexOf(queryLower) !== -1) {
                console.log('Found profil match:', profil.title);
                results.profils.push(profil);
            }
        }
    }
    
    // Recherche dans les sujets
    if (searchData.sujets) {
        console.log('Searching in', searchData.sujets.length, 'sujets');
        for (var i = 0; i < searchData.sujets.length; i++) {
            var sujet = searchData.sujets[i];
            var titleLower = sujet.title.toLowerCase();
            
            if (titleLower.indexOf(queryLower) !== -1) {
                console.log('Found sujet match:', sujet.title);
                results.sujets.push(sujet);
            }
        }
    }
    
    console.log('Search results:', results);
    displayResults(query, results);
}

function displayResults(query, results) {
    console.log('Displaying results for:', query);
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
        console.log('No results found, showing no results message');
        showNoResults(query);
    }
}

function updateSection(type, items) {
    console.log('Updating section:', type, 'with', items.length, 'items');
    var sections = document.querySelectorAll('.results-section');
    var section;
    
    if (type === 'profils' && sections[0]) {
        section = sections[0];
    } else if (type === 'sujets' && sections[1]) {
        section = sections[1];
    }
    
    if (!section) {
        console.log('Section not found for:', type);
        return;
    }
    
    var grid = section.querySelector('.results-grid');
    if (!grid) {
        console.log('Grid not found in section:', type);
        return;
    }
    
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
    console.log('Showing no results for:', query);
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