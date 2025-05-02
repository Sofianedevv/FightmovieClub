import { ref } from 'vue';

// Utilisation de votre clé API OMDb
const API_KEY = 'ce7b5e0d';
const BASE_URL = 'https://www.omdbapi.com/';

export function useApi() {
  const isLoading = ref(false);
  const error = ref(null);

  const fetchData = async (params = {}) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const queryParams = new URLSearchParams({
        apikey: API_KEY,
        ...params
      });
      
      const response = await fetch(`${BASE_URL}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const data = await response.json();
      
      if (data.Response === 'False') {
        throw new Error(data.Error || 'Erreur lors de la récupération des données');
      }
      
      return data;
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Recherche par titre
  const searchMovies = (query) => fetchData({ s: query, type: 'movie' });
  
  // Recherche par titre pour les séries
  const searchTVShows = (query) => fetchData({ s: query, type: 'series' });
  
  // Obtenir les détails d'un film par son ID
  const getMovieDetails = (id) => fetchData({ i: id, plot: 'full' });
  
  // Recherche aléatoire (en utilisant des titres populaires)
  const getRandomMovies = async () => {
    // Liste de titres populaires pour obtenir des résultats aléatoires
    const popularTitles = ['star', 'war', 'love', 'game', 'dark', 'time', 'world', 'life', 'man', 'day'];
    const randomIndex = Math.floor(Math.random() * popularTitles.length);
    
    return searchMovies(popularTitles[randomIndex]);
  };
  
  const getRandomTVShows = async () => {
    const popularTitles = ['show', 'house', 'doctor', 'office', 'break', 'dead', 'family', 'friends', 'big', 'new'];
    const randomIndex = Math.floor(Math.random() * popularTitles.length);
    
    return searchTVShows(popularTitles[randomIndex]);
  };

  return {
    isLoading,
    error,
    fetchData,
    searchMovies,
    searchTVShows,
    getMovieDetails,
    getRandomMovies,
    getRandomTVShows
  };
} 