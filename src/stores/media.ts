import { defineStore } from 'pinia';
import { useApi } from '@/composables/useApi';

export const useMediaStore = defineStore('media', {
  state: () => ({
    movies: [],
    tvShows: [],
    currentMedia: null,
    isLoading: false
  }),
  
  actions: {
    async fetchRandomMovies() {
      const api = useApi();
      this.isLoading = true;
      
      try {
        const data = await api.getRandomMovies();
        if (data && data.Search) {
          this.movies = data.Search.map(movie => ({
            ...movie,
            id: movie.imdbID,
            type: 'movie',
            title: movie.Title,
            year: movie.Year,
            posterPath: movie.Poster !== 'N/A' ? movie.Poster : null
          }));
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchRandomTVShows() {
      const api = useApi();
      this.isLoading = true;
      
      try {
        const data = await api.getRandomTVShows();
        if (data && data.Search) {
          this.tvShows = data.Search.map(show => ({
            ...show,
            id: show.imdbID,
            type: 'tv',
            title: show.Title,
            year: show.Year,
            posterPath: show.Poster !== 'N/A' ? show.Poster : null
          }));
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchMediaDetails(id) {
      const api = useApi();
      this.isLoading = true;
      
      try {
        const data = await api.getMovieDetails(id);
          
        if (data) {
          this.currentMedia = {
            ...data,
            id: data.imdbID,
            type: data.Type === 'movie' ? 'movie' : 'tv',
            title: data.Title,
            year: data.Year,
            posterPath: data.Poster !== 'N/A' ? data.Poster : null,
            rating: data.imdbRating
          };
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 