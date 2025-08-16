// Gestion des résultats de recherche - Version simplifiée

// Fonction d'échappement HTML globale pour sécuriser toutes les entrées
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fonction de nettoyage et validation des queries
function sanitizeQuery(query) {
    if (!query) return '';
    // Supprimer les caractères potentiellement dangereux
    return query.replace(/[<>'"&]/g, function(match) {
        switch(match) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#x27;';
            case '&': return '&amp;';
            default: return match;
        }
    });
}

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
    // Mettre à jour le titre de la page de façon sécurisée
    var safeQuery = sanitizeQuery(query);
    document.title = 'Résultats pour "' + safeQuery + '" - CasierPolitique.com';
    
    // Mettre à jour la requête affichée de façon sécurisée
    var queryElement = document.querySelector('.search-query');
    if (queryElement) {
        queryElement.innerHTML = ''; // Vider d'abord
        
        var text1 = document.createTextNode('Recherche pour : ');
        var strong = document.createElement('strong');
        strong.textContent = '"' + sanitizeQuery(query) + '"'; // Double protection
        
        queryElement.appendChild(text1);
        queryElement.appendChild(strong);
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
        
        // Construction DOM sécurisée pour éviter XSS
        var h3 = document.createElement('h3');
        var link = document.createElement('a');
        
        // Validation et échappement de l'URL
        var safeUrl = item.url || '#';
        // Bloquer les URLs javascript: et data: potentiellement dangereuses
        if (safeUrl.toLowerCase().indexOf('javascript:') === 0 || 
            safeUrl.toLowerCase().indexOf('data:') === 0 || 
            safeUrl.toLowerCase().indexOf('vbscript:') === 0) {
            safeUrl = '#';
        }
        
        link.href = safeUrl;
        link.textContent = item.title || 'Sans titre'; // textContent échappe automatiquement
        h3.appendChild(link);
        
        var p = document.createElement('p');
        p.textContent = item.description || ''; // textContent échappe automatiquement
        
        card.appendChild(h3);
        card.appendChild(p);
        grid.appendChild(card);
    }
}

function showNoResults(query) {
    var container = document.querySelector('.results-container');
    if (container) {
        // Construction DOM sécurisée pour éviter XSS
        container.innerHTML = ''; // Vider d'abord
        
        var noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        
        var p = document.createElement('p');
        p.textContent = 'Aucun résultat trouvé pour "' + sanitizeQuery(query) + '".';
        
        var suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestions';
        
        var h3 = document.createElement('h3');
        h3.textContent = 'Suggestions :';
        
        var ul = document.createElement('ul');
        
        var suggestions = [
            'Vérifiez l\'orthographe des mots-clés',
            'Essayez des mots-clés plus généraux',
            'Essayez un nombre différent de mots-clés'
        ];
        
        for (var i = 0; i < suggestions.length; i++) {
            var li = document.createElement('li');
            li.textContent = suggestions[i];
            ul.appendChild(li);
        }
        
        suggestionsDiv.appendChild(h3);
        suggestionsDiv.appendChild(ul);
        
        noResultsDiv.appendChild(p);
        noResultsDiv.appendChild(suggestionsDiv);
        
        container.appendChild(noResultsDiv);
    }
    
    // Logger la recherche non trouvée
    logNotFoundSearch(query);
}

// Fonction pour logger les recherches non trouvées
function logNotFoundSearch(query) {
    // Préparer les données avec nettoyage
    var data = {
        query: sanitizeQuery(query), // Nettoyer avant envoi au serveur
        date: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
    };
    
    // Envoyer vers la fonction Netlify
    fetch('https://regal-nasturtium-30b87d.netlify.app/.netlify/functions/logNotFound', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function(data) {
        console.log('Search query logged successfully:', data);
    })
    .catch(function(error) {
        console.error('Error logging search query:', error);
        // Ne pas afficher d'erreur à l'utilisateur, c'est juste du logging
    });
} 