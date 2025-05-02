import { defineStore } from 'pinia';
import { useMediaStore } from './media';

export const useVersusStore = defineStore('versus', {
  state: () => ({
    versusHistory: [],
    currentVersus: {
      leftMedia: null,
      rightMedia: null
    }
  }),
  
  actions: {
    async setupNewVersus() {
      const mediaStore = useMediaStore();
      
      // S'assurer que nous avons des films et des séries
      if (mediaStore.movies.length < 5) {
        await mediaStore.fetchRandomMovies();
      }
      
      if (mediaStore.tvShows.length < 5) {
        await mediaStore.fetchRandomTVShows();
      }
      
      // Sélectionner aléatoirement deux médias différents
      const allMedia = [...mediaStore.movies, ...mediaStore.tvShows];
      const randomIndex1 = Math.floor(Math.random() * allMedia.length);
      let randomIndex2;
      
      do {
        randomIndex2 = Math.floor(Math.random() * allMedia.length);
      } while (randomIndex1 === randomIndex2);
      
      this.currentVersus = {
        leftMedia: allMedia[randomIndex1],
        rightMedia: allMedia[randomIndex2]
      };
    },
    
    selectWinner(winner, loser) {
      // Enregistrer le résultat dans l'historique
      this.versusHistory.push({
        winner,
        loser,
        timestamp: new Date().toISOString()
      });
      
      // Préparer un nouveau versus
      this.setupNewVersus();
    }
  },
  
  getters: {
    getHistory: (state) => state.versusHistory,
    getCurrentVersus: (state) => state.currentVersus
  }
}); 