import { ref } from 'vue';

// Clé API TMDB et jeton d'accès
const TMDB_API_KEY = 'caf8de47022d888f6a61c6c13c5ff229';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjYWY4ZGU0NzAyMmQ4ODhmNmE2MWM2YzEzYzVmZjIyOSIsIm5iZiI6MTc0NjIxOTY3My4yMDgsInN1YiI6IjY4MTUzMjk5ZmY1NDUyNmJmMTAzMGNmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4y_5rDdIYF0-LR11QH63IpmjU_WQpGr6jqK7VwZIr9s';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export function useApi() {
  const isLoading = ref(false);
  const error = ref(null);

  // Fonction utilitaire pour gérer les requêtes API
  const fetchWithErrorHandling = async (url) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur API:', err);
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Récupérer les films populaires
  const fetchPopularMovies = async (page = 1) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/movie/popular?language=fr-FR&page=${page}`
    );
  };

  // Récupérer les séries populaires
  const fetchPopularTVShows = async (page = 1) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/tv/popular?language=fr-FR&page=${page}`
    );
  };

  // Récupérer les films tendance
  const fetchTrendingMovies = async (page = 1) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/trending/movie/week?language=fr-FR&page=${page}`
    );
  };

  // Récupérer les séries tendance
  const fetchTrendingTVShows = async (page = 1) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/trending/tv/week?language=fr-FR&page=${page}`
    );
  };

  // Recherche multi (films, séries, personnes)
  const searchMedia = async (query, page = 1) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/search/multi?language=fr-FR&query=${encodeURIComponent(query)}&page=${page}`
    );
  };

  // Récupérer les détails d'un film
  const fetchMovieDetails = async (movieId) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/movie/${movieId}?language=fr-FR`
    );
  };

  // Récupérer les détails d'une série
  const fetchTVDetails = async (tvId) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/tv/${tvId}?language=fr-FR`
    );
  };

  // Récupérer le casting d'un film
  const fetchMovieCredits = async (movieId) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?language=fr-FR`
    );
  };

  // Récupérer le casting d'une série
  const fetchTVCredits = async (tvId) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/tv/${tvId}/credits?language=fr-FR`
    );
  };

  // Récupérer les recommandations pour un film
  const fetchMovieRecommendations = async (movieId) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/movie/${movieId}/recommendations?language=fr-FR&page=1`
    );
  };

  // Récupérer les recommandations pour une série
  const fetchTVRecommendations = async (tvId) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/tv/${tvId}/recommendations?language=fr-FR&page=1`
    );
  };

  // Récupérer les genres de films
  const fetchMovieGenres = async () => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/genre/movie/list?language=fr-FR`
    );
  };

  // Récupérer les genres de séries
  const fetchTVGenres = async () => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/genre/tv/list?language=fr-FR`
    );
  };

  // Récupérer les films les mieux notés
  const fetchTopRatedMovies = async (page = 1) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/movie/top_rated?language=fr-FR&page=${page}`
    );
  };

  // Récupérer les séries les mieux notées
  const fetchTopRatedTVShows = async (page = 1) => {
    return fetchWithErrorHandling(
      `${TMDB_BASE_URL}/tv/top_rated?language=fr-FR&page=${page}`
    );
  };

  return {
    isLoading,
    error,
    fetchPopularMovies,
    fetchPopularTVShows,
    fetchTrendingMovies,
    fetchTrendingTVShows,
    searchMedia,
    fetchMovieDetails,
    fetchTVDetails,
    fetchMovieCredits,
    fetchTVCredits,
    fetchMovieRecommendations,
    fetchTVRecommendations,
    fetchMovieGenres,
    fetchTVGenres,
    fetchTopRatedMovies,
    fetchTopRatedTVShows
  };
} 