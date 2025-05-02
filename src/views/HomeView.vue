<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">FIGHT<span>CLUB</span></h1>
        <p class="hero-subtitle">Qui mérite votre vote ?</p>
        <router-link to="/versus" class="cta-button">
          <span>COMMENCER UN DUEL</span>
          <i class="fas fa-angle-right"></i>
        </router-link>
      </div>
    </section>

    <!-- Trending Movies Section -->
    <section class="media-section">
      <div class="section-header">
        <h2>Films Populaires</h2>
        <router-link to="/search?type=movie" class="view-all">Voir tout <i class="fas fa-arrow-right"></i></router-link>
      </div>
      
      <div class="media-slider">
        <div v-if="isLoadingMovies" class="loading-indicator">
          <div class="spinner"></div>
          <span>Chargement des films...</span>
        </div>
        <div v-else-if="trendingMovies.length === 0" class="empty-state">
          Aucun film disponible pour le moment.
        </div>
        <div v-else class="media-cards">
          <div 
            v-for="movie in trendingMovies" 
            :key="movie.id" 
            class="media-card"
            @click="navigateToDetail(movie.id, 'movie')"
          >
            <div class="card-image">
              <img :src="movie.posterPath" :alt="movie.title">
              <div class="card-overlay">
                <div class="card-actions">
                  <button class="action-button view-details">
                    <i class="fas fa-info-circle"></i>
                  </button>
                  <button class="action-button add-favorite" @click.stop="toggleFavorite(movie)">
                    <i class="fas" :class="isFavorite(movie) ? 'fa-heart' : 'fa-heart-o'"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ movie.title }}</h3>
              <div class="card-meta">
                <span class="year">{{ movie.year }}</span>
                <span class="rating"><i class="fas fa-star"></i> {{ movie.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trending TV Shows Section -->
    <section class="media-section">
      <div class="section-header">
        <h2>Séries Populaires</h2>
        <router-link to="/search?type=tv" class="view-all">Voir tout <i class="fas fa-arrow-right"></i></router-link>
      </div>
      
      <div class="media-slider">
        <div v-if="isLoadingTVShows" class="loading-indicator">
          <div class="spinner"></div>
          <span>Chargement des séries...</span>
        </div>
        <div v-else-if="trendingTVShows.length === 0" class="empty-state">
          Aucune série disponible pour le moment.
        </div>
        <div v-else class="media-cards">
          <div 
            v-for="show in trendingTVShows" 
            :key="show.id" 
            class="media-card"
            @click="navigateToDetail(show.id, 'tv')"
          >
            <div class="card-image">
              <img :src="show.posterPath" :alt="show.title">
              <div class="card-overlay">
                <div class="card-actions">
                  <button class="action-button view-details">
                    <i class="fas fa-info-circle"></i>
                  </button>
                  <button class="action-button add-favorite" @click.stop="toggleFavorite(show)">
                    <i class="fas" :class="isFavorite(show) ? 'fa-heart' : 'fa-heart-o'"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ show.title }}</h3>
              <div class="card-meta">
                <span class="year">{{ show.year }}</span>
                <span class="rating"><i class="fas fa-star"></i> {{ show.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Battles Section -->
    <section class="battles-section" v-if="recentBattles.length > 0">
      <div class="section-header">
        <h2>Duels Récents</h2>
        <router-link to="/history" class="view-all">Historique <i class="fas fa-arrow-right"></i></router-link>
      </div>
      
      <div class="battles-grid">
        <div v-for="(battle, index) in recentBattles" :key="index" class="battle-card">
          <div class="battle-date">{{ formatDate(battle.date) }}</div>
          <div class="battle-contenders">
            <div class="battle-winner" @click="navigateToDetail(battle.winner.id, battle.winner.type)">
              <img :src="battle.winner.posterPath" :alt="battle.winner.title">
              <div class="winner-badge"><i class="fas fa-crown"></i></div>
            </div>
            <div class="battle-vs">VS</div>
            <div class="battle-loser" @click="navigateToDetail(battle.loser.id, battle.loser.type)">
              <img :src="battle.loser.posterPath" :alt="battle.loser.title">
            </div>
          </div>
          <div class="battle-titles">
            <div class="winner-title">{{ battle.winner.title }}</div>
            <div class="loser-title">{{ battle.loser.title }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';

const router = useRouter();
const { fetchTrendingMovies, fetchTrendingTVShows } = useApi();

// État
const trendingMovies = ref([]);
const trendingTVShows = ref([]);
const isLoadingMovies = ref(true);
const isLoadingTVShows = ref(true);
const favorites = ref([]);
const recentBattles = ref([]);

// Récupérer les données
const fetchData = async () => {
  try {
    isLoadingMovies.value = true;
    const moviesData = await fetchTrendingMovies();
    trendingMovies.value = moviesData.results.slice(0, 10).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? movie.release_date.substring(0, 4) : '',
      rating: movie.vote_average.toFixed(1),
      posterPath: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image',
      type: 'movie'
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des films', error);
  } finally {
    isLoadingMovies.value = false;
  }

  try {
    isLoadingTVShows.value = true;
    const tvData = await fetchTrendingTVShows();
    trendingTVShows.value = tvData.results.slice(0, 10).map(show => ({
      id: show.id,
      title: show.name,
      year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
      rating: show.vote_average.toFixed(1),
      posterPath: show.poster_path 
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image',
      type: 'tv'
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des séries', error);
  } finally {
    isLoadingTVShows.value = false;
  }
};

// Charger les favoris depuis le localStorage
const loadFavorites = () => {
  const storedFavorites = localStorage.getItem('favorites');
  if (storedFavorites) {
    favorites.value = JSON.parse(storedFavorites);
  }
};

// Charger les duels récents depuis le localStorage
const loadRecentBattles = () => {
  const storedBattles = localStorage.getItem('versusHistory');
  if (storedBattles) {
    recentBattles.value = JSON.parse(storedBattles).slice(0, 3);
  }
};

// Vérifier si un média est dans les favoris
const isFavorite = (media) => {
  return favorites.value.some(fav => fav.id === media.id && fav.type === media.type);
};

// Ajouter/supprimer des favoris
const toggleFavorite = (media) => {
  const index = favorites.value.findIndex(fav => fav.id === media.id && fav.type === media.type);
  
  if (index === -1) {
    // Ajouter aux favoris
    favorites.value.push(media);
  } else {
    // Supprimer des favoris
    favorites.value.splice(index, 1);
  }
  
  // Sauvegarder dans localStorage
  localStorage.setItem('favorites', JSON.stringify(favorites.value));
};

// Formater la date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Navigation vers la page de détail
const navigateToDetail = (id, type) => {
  router.push(`/detail/${type}/${id}`);
};

// Initialisation
onMounted(() => {
  fetchData();
  loadFavorites();
  loadRecentBattles();
});
</script>

<style scoped>
/* Styles existants inchangés */

/* Ajout de styles pour les cartes cliquables */
.media-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.media-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

.media-card:hover .card-overlay {
  opacity: 1;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.action-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(236, 102, 164, 0.9);
  border: none;
  color: white;
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  transform: scale(1.1);
  background: #EC66A4;
}

.battle-winner, .battle-loser {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.battle-winner:hover, .battle-loser:hover {
  transform: scale(1.05);
}
</style> 