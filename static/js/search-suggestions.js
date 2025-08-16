// Système de suggestions pour la barre de recherche
class SearchSuggestions {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.suggestionsContainer = document.getElementById('suggestions');
        this.suggestions = [];
        this.init();
    }

    async init() {
        try {
            // Charger l'index de recherche pour obtenir les suggestions
            const response = await fetch('/data/search-index.json');
            const data = await response.json();
            
            // Construire la liste des suggestions
            this.suggestions = [
                ...(data.profils || []).map(profil => ({
                    text: profil.title,
                    url: profil.url,
                    type: 'profil'
                })),
                ...(data.sujets || []).map(sujet => ({
                    text: sujet.title,
                    url: sujet.url,
                    type: 'sujet'
                }))
            ];
            
            this.setupEventListeners();
        } catch (error) {
            console.error('Erreur lors du chargement des suggestions:', error);
        }
    }

    setupEventListeners() {
        if (!this.searchInput) return;

        // Écouter les changements dans le champ de recherche
        this.searchInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        // Masquer les suggestions quand on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
                this.hideSuggestions();
            }
        });

        // Gérer la navigation au clavier
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
    }

    handleInput(query) {
        if (!query.trim()) {
            this.hideSuggestions();
            return;
        }

        const queryLower = query.toLowerCase();
        const filteredSuggestions = this.suggestions.filter(suggestion => {
            const textLower = suggestion.text.toLowerCase();
            
            // Recherche directe dans le texte complet
            if (textLower.includes(queryLower)) {
                return true;
            }
            
            // Recherche par mots individuels
            const queryWords = queryLower.split(/\s+/);
            const titleWords = textLower.split(/\s+/);
            return queryWords.every(queryWord => 
                titleWords.some(titleWord => titleWord.includes(queryWord))
            );
        }).slice(0, 8); // Limiter à 8 suggestions

        this.displaySuggestions(filteredSuggestions);
    }

    displaySuggestions(suggestions) {
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.suggestionsContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            
            // Construction DOM sécurisée pour éviter XSS
            const textSpan = document.createElement('span');
            textSpan.className = 'suggestion-text';
            textSpan.textContent = suggestion.text || ''; // textContent échappe automatiquement
            
            const typeSpan = document.createElement('span');
            typeSpan.className = 'suggestion-type';
            typeSpan.textContent = suggestion.type === 'profil' ? 'Profil' : 'Sujet';
            
            suggestionElement.appendChild(textSpan);
            suggestionElement.appendChild(typeSpan);
            
            // Rendre toute la ligne cliquable
            suggestionElement.style.cursor = 'pointer';
            
            suggestionElement.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });

            suggestionElement.addEventListener('mouseenter', () => {
                this.highlightSuggestion(suggestionElement);
            });

            this.suggestionsContainer.appendChild(suggestionElement);
        });

        this.suggestionsContainer.style.display = 'block';
    }

    selectSuggestion(suggestion) {
        this.searchInput.value = suggestion.text;
        this.hideSuggestions();
        
        // Rediriger vers la page de la suggestion
        if (suggestion.url) {
            window.location.href = suggestion.url;
        }
    }

    highlightSuggestion(element) {
        // Retirer la surbrillance de tous les éléments
        this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.classList.remove('highlighted');
        });
        
        // Ajouter la surbrillance à l'élément survolé
        element.classList.add('highlighted');
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
    }

    handleKeydown(e) {
        const visibleSuggestions = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateSuggestions(1, visibleSuggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateSuggestions(-1, visibleSuggestions);
        } else if (e.key === 'Enter') {
            const highlighted = this.suggestionsContainer.querySelector('.suggestion-item.highlighted');
            if (highlighted) {
                e.preventDefault();
                highlighted.click();
            }
        } else if (e.key === 'Escape') {
            this.hideSuggestions();
        }
    }

    navigateSuggestions(direction, suggestions) {
        const currentHighlighted = this.suggestionsContainer.querySelector('.suggestion-item.highlighted');
        let nextIndex = 0;

        if (currentHighlighted) {
            const currentIndex = Array.from(suggestions).indexOf(currentHighlighted);
            nextIndex = (currentIndex + direction + suggestions.length) % suggestions.length;
        }

        if (suggestions[nextIndex]) {
            this.highlightSuggestion(suggestions[nextIndex]);
        }
    }
}

// Initialiser les suggestions quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new SearchSuggestions();
}); 