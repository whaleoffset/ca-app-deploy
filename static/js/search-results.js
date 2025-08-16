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
    return results ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : null;
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
            
            // Recherche exacte dans le titre
            if (titleLower.indexOf(queryLower) !== -1) {
                results.profils.push(profil);
            }
            // Recherche par mots individuels
            else {
                var queryWords = queryLower.split(/\s+/);
                var titleWords = titleLower.split(/\s+/);
                var allWordsFound = queryWords.every(function(queryWord) {
                    return titleWords.some(function(titleWord) {
                        return titleWord.indexOf(queryWord) !== -1;
                    });
                });
                if (allWordsFound) {
                    results.profils.push(profil);
                }
            }
        }
    }
    
    // Recherche dans les sujets
    if (searchData.sujets) {
        for (var i = 0; i < searchData.sujets.length; i++) {
            var sujet = searchData.sujets[i];
            var titleLower = sujet.title.toLowerCase();
            
            // Recherche exacte dans le titre
            if (titleLower.indexOf(queryLower) !== -1) {
                results.sujets.push(sujet);
            }
            // Recherche par mots individuels
            else {
                var queryWords = queryLower.split(/\s+/);
                var titleWords = titleLower.split(/\s+/);
                var allWordsFound = queryWords.every(function(queryWord) {
                    return titleWords.some(function(titleWord) {
                        return titleWord.indexOf(queryWord) !== -1;
                    });
                });
                if (allWordsFound) {
                    results.sujets.push(sujet);
                }
            }
        }
    }
    
    displayResults(query, results);
}

function displayResults(query, results) {
    console.log('📊 [DEBUG] displayResults called:', {
        query: query,
        profils: results.profils.length,
        sujets: results.sujets.length,
        total: results.profils.length + results.sujets.length
    });
    
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
        console.log('🚫 [DEBUG] No results found, calling showNoResults');
        showNoResults(query);
    } else {
        console.log('✅ [DEBUG] Results found, no logging needed');
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
    console.log('🚫 [DEBUG] showNoResults called for query:', query);
    
    var container = document.querySelector('.results-container');
    if (container) {
        console.log('📋 [DEBUG] Container found, updating innerHTML');
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
    } else {
        console.error('❌ [DEBUG] Container not found!');
    }
    
    // Logger la recherche non trouvée
    console.log('📝 [DEBUG] Calling logNotFoundSearch...');
    logNotFoundSearch(query);
}

// Fonction pour logger les recherches non trouvées
function logNotFoundSearch(query) {
    console.log('🔍 [DEBUG] Starting logNotFoundSearch for query:', query);
    
    // Préparer les données
    var data = {
        query: query,
        date: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
    };
    
    console.log('📋 [DEBUG] Data prepared:', JSON.stringify(data, null, 2));
    console.log('🚀 [DEBUG] Sending request to:', 'https://regal-nasturtium-30b87d.netlify.app/.netlify/functions/logNotFound');
    
    // Envoyer vers la fonction Netlify
    fetch('https://regal-nasturtium-30b87d.netlify.app/.netlify/functions/logNotFound', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(function(response) {
        console.log('📋 [DEBUG] Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(function(responseData) {
        console.log('✅ [DEBUG] Search query logged successfully:', responseData);
    })
    .catch(function(error) {
        console.error('❌ [DEBUG] Error logging search query:', error);
        console.error('❌ [DEBUG] Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        // Ne pas afficher d'erreur à l'utilisateur, c'est juste du logging
    });
} 