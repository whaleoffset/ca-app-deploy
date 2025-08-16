// Moteur de recherche local 
// Utilise l'index JSON généré par le build Python

class LocalSearch {
    constructor() {
        this.index = null;
        this.searchInput = null;
        this.resultsContainer = null;
        this.init();
    }

    async init() {
        try {
            // Charger l'index de recherche
            const response = await fetch('/data/search-index.json');
            this.index = await response.json();
            
            this.setupSearchUI();
        } catch (error) {
            console.error('Erreur lors du chargement de l\'index de recherche:', error);
        }
    }

    setupSearchUI() {
        this.searchInput = document.getElementById('search-input');
        this.resultsContainer = document.getElementById('search-results');
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }
    }

    performSearch(query) {
        if (!query.trim() || !this.index) {
            this.clearResults();
            return;
        }

        const results = this.searchInIndex(query.toLowerCase());
        this.displayResults(results);
    }

    searchInIndex(query) {
        const results = [];
        
        // Recherche dans les profils
        if (this.index.profils) {
            for (const profil of this.index.profils) {
                if (this.matchesQuery(profil, query)) {
                    results.push({
                        type: 'profil',
                        ...profil
                    });
                }
            }
        }

        // Recherche dans les sujets
        if (this.index.sujets) {
            for (const sujet of this.index.sujets) {
                if (this.matchesQuery(sujet, query)) {
                    results.push({
                        type: 'sujet',
                        ...sujet
                    });
                }
            }
        }

        return results.slice(0, 10); // Limiter à 10 résultats
    }

    matchesQuery(item, query) {
        return item.title.toLowerCase().includes(query) ||
               (item.description && item.description.toLowerCase().includes(query)) ||
               (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)));
    }

    displayResults(results) {
        if (!this.resultsContainer) return;

        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<p>Aucun résultat trouvé</p>';
            return;
        }

        const html = results.map(result => `
            <div class="search-result">
                <h3><a href="${result.url}">${result.title}</a></h3>
                <p class="result-type">${result.type === 'profil' ? 'Profil' : 'Sujet'}</p>
                ${result.description ? `<p>${result.description}</p>` : ''}
            </div>
        `).join('');

        this.resultsContainer.innerHTML = html;
    }

    clearResults() {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '';
        }
    }


}

// Initialiser la recherche quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new LocalSearch();
}); 