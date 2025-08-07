// Gestion des résultats de recherche
class SearchResults {
    constructor() {
        this.searchData = null;
        this.init();
    }

    async init() {
        try {
            // Charger l'index de recherche
            const response = await fetch('/data/search-index.json');
            this.searchData = await response.json();
            
            // Traiter la recherche si il y a un paramètre de requête
            this.handleSearchFromURL();
        } catch (error) {
            console.error('Erreur lors du chargement des données de recherche:', error);
        }
    }

    handleSearchFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (query) {
            this.performSearch(query);
        }
    }

    performSearch(query) {
        if (!this.searchData) return;

        const queryLower = query.toLowerCase();
        const results = {
            profils: [],
            sujets: []
        };

        // Recherche dans les profils
        if (this.searchData.profils) {
            results.profils = this.searchData.profils.filter(profil => {
                const textLower = profil.title.toLowerCase();
                return textLower.includes(queryLower) || 
                       textLower.split(/\s+/).some(word => word.includes(queryLower));
            });
        }

        // Recherche dans les sujets
        if (this.searchData.sujets) {
            results.sujets = this.searchData.sujets.filter(sujet => {
                const textLower = sujet.title.toLowerCase();
                return textLower.includes(queryLower) || 
                       textLower.split(/\s+/).some(word => word.includes(queryLower));
            });
        }

        this.displayResults(query, results);
    }

    displayResults(query, results) {
        // Mettre à jour le titre de la page
        document.title = `Résultats pour "${query}" - CasierPolitique.com`;
        
        // Mettre à jour la requête affichée
        const queryElement = document.querySelector('.search-query');
        if (queryElement) {
            queryElement.innerHTML = `Recherche pour : <strong>"${query}"</strong>`;
        }

        // Mettre à jour les résultats
        this.updateResultsSection('profils', results.profils);
        this.updateResultsSection('sujets', results.sujets);

        // Afficher le message "aucun résultat" si nécessaire
        if (results.profils.length === 0 && results.sujets.length === 0) {
            this.showNoResults(query);
        }
    }

    updateResultsSection(type, items) {
        const section = document.querySelector(`.results-section:has(h2:contains("${type === 'profils' ? 'Profils' : 'Sujets'}"))`);
        if (!section) return;

        const grid = section.querySelector('.results-grid');
        if (!grid) return;

        // Mettre à jour le titre avec le nombre de résultats
        const title = section.querySelector('h2');
        if (title) {
            title.textContent = `${type === 'profils' ? 'Profils' : 'Sujets'} (${items.length})`;
        }

        // Vider et remplir la grille
        grid.innerHTML = '';
        
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <h3><a href="${item.url}">${item.title}</a></h3>
                <p>${item.description}</p>
            `;
            grid.appendChild(card);
        });
    }

    showNoResults(query) {
        const container = document.querySelector('.results-container');
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <p>Aucun résultat trouvé pour "${query}".</p>
                    <div class="suggestions">
                        <h3>Suggestions :</h3>
                        <ul>
                            <li>Vérifiez l'orthographe des mots-clés</li>
                            <li>Essayez des mots-clés plus généraux</li>
                            <li>Essayez un nombre différent de mots-clés</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }
}

// Initialiser la recherche quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new SearchResults();
}); 