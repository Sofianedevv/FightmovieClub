<template>
  <div class="home-view">
  

    <!-- Films Section -->
    <section class="media-section movies-section">
      <div class="section-header">
        <h2><i class="fas fa-film"></i> Films Populaires</h2>
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
            class="media-card movie-card"
            @click="navigateToDetail(movie.id, 'movie')"
          >
            <div class="card-image">
              <img :src="movie.posterPath" :alt="movie.title">
              <div class="media-type-badge">Film</div>
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

    <!-- Séries Section -->
    <section class="media-section tv-section">
      <div class="section-header">
        <h2><i class="fas fa-tv"></i> Séries Populaires</h2>
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
            class="media-card tv-card"
            @click="navigateToDetail(show.id, 'tv')"
          >
            <div class="card-image">
              <img :src="show.posterPath" :alt="show.title">
              <div class="media-type-badge tv">Série</div>
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

    <!-- Récents Duels Section -->
    <section class="recent-battles-section" v-if="recentBattles.length > 0">
      <div class="section-header">
        <h2><i class="fas fa-trophy"></i> Duels Récents</h2>
        <router-link to="/history" class="view-all">Voir l'historique <i class="fas fa-arrow-right"></i></router-link>
      </div>
      
      <div class="battles-grid">
        <div v-for="(battle, index) in recentBattles" :key="index" class="battle-card">
          <div class="battle-date">{{ formatDate(battle.timestamp) }}</div>
          <div class="battle-content">
            <div class="battle-winner" @click="navigateToDetail(battle.winner.id, battle.winner.type)">
              <div class="winner-badge">Gagnant</div>
              <img :src="battle.winner.posterPath" :alt="battle.winner.title">
              <div class="battle-media-info">
                <h4>{{ battle.winner.title }}</h4>
                <div class="battle-media-meta">
                  <span>{{ battle.winner.year }}</span>
                </div>
              </div>
            </div>
            
            <div class="battle-vs">VS</div>
            
            <div class="battle-loser" @click="navigateToDetail(battle.loser.id, battle.loser.type)">
              <img :src="battle.loser.posterPath" :alt="battle.loser.title">
              <div class="battle-media-info">
                <h4>{{ battle.loser.title }}</h4>
                <div class="battle-media-meta">
                  <span>{{ battle.loser.year }}</span>
                </div>
              </div>
            </div>
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
/* Styles existants */

/* Styles pour la séparation des films et séries */
.movies-section, .tv-section {
  margin-bottom: 60px;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(108, 117, 125, 0.3);
  padding-bottom: 10px;
}

.section-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header h2 i {
  color: #6C757D;
}

.movies-section .section-header h2 i {
  color: #EC66A4;
}

.tv-section .section-header h2 i {
  color: #6C757D;
}

.media-type-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(108, 117, 125, 0.8);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 2;
}

.media-type-badge.tv {
  background-color: rgba(108, 117, 125, 0.8);
}

.movie-card .card-actions .action-button {
  background: rgba(236, 102, 164, 0.9);
}

.movie-card .card-actions .action-button:hover {
  background: #EC66A4;
}

.tv-card .card-actions .action-button {
  background: rgba(108, 117, 125, 0.9);
}

.tv-card .card-actions .action-button:hover {
  background: #6C757D;
}

/* Styles pour les duels récents */
.recent-battles-section {
  margin-bottom: 60px;
  padding: 0 20px;
}

.battles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.battle-card {
  background-color: var(--dark-gray);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.battle-date {
  background-color: #6C757D;
  color: white;
  padding: 8px 15px;
  font-size: 0.9rem;
}

.battle-content {
  display: flex;
  padding: 15px;
  gap: 10px;
  align-items: center;
}

.battle-winner, .battle-loser {
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.battle-winner:hover, .battle-loser:hover {
  transform: scale(1.05);
}

.battle-winner img, .battle-loser img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.winner-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #EC66A4;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 2;
}

.battle-vs {
  font-weight: bold;
  font-size: 1.2rem;
  color: #6C757D;
}

.battle-media-info {
  margin-top: 10px;
}

.battle-media-info h4 {
  font-size: 1rem;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.battle-media-meta {
  font-size: 0.8rem;
  color: #ADB5BD;
}

/* Responsive */
@media (max-width: 768px) {
  .battles-grid {
    grid-template-columns: 1fr;
  }
  
  .battle-content {
    flex-direction: column;
  }
  
  .battle-vs {
    margin: 10px 0;
  }
}
</style> 