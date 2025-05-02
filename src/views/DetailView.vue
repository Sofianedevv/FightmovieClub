<template>
  <div class="detail-view">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-ring">
        <div></div><div></div><div></div><div></div>
      </div>
      <p>Chargement des détails...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>Erreur</h3>
      <p>{{ error }}</p>
      <button @click="goBack" class="retry-button">
        <span class="button-text">Retour</span>
        <span class="button-icon"><i class="fas fa-arrow-left"></i></span>
      </button>
    </div>
    
    <div v-else-if="mediaDetails" class="detail-content">
      <!-- Backdrop avec overlay -->
      <div class="detail-backdrop" :style="backdropStyle">
        <div class="backdrop-overlay"></div>
      </div>
      
      <!-- Contenu principal -->
      <div class="detail-main">
        <div class="detail-poster">
          <img :src="posterUrl" :alt="mediaDetails.title">
          <button class="favorite-button" @click="toggleFavorite">
            <i class="fas" :class="isFavorite ? 'fa-heart' : 'fa-heart-o'"></i>
          </button>
        </div>
        
        <div class="detail-info">
          <div class="detail-header">
            <h1>{{ mediaDetails.title }} <span class="year">({{ mediaDetails.year }})</span></h1>
            <div class="detail-meta">
              <span class="rating">
                <i class="fas fa-star"></i> {{ mediaDetails.vote_average.toFixed(1) }}
              </span>
              <span class="runtime" v-if="mediaDetails.runtime || mediaDetails.episode_run_time">
                <i class="fas fa-clock"></i> {{ formatRuntime }}
              </span>
              <span class="genres">
                {{ mediaDetails.genres.map(g => g.name).join(', ') }}
              </span>
            </div>
          </div>
          
          <div class="detail-tagline" v-if="mediaDetails.tagline">
            "{{ mediaDetails.tagline }}"
          </div>
          
          <div class="detail-overview">
            <h3>Synopsis</h3>
            <p>{{ mediaDetails.overview || 'Aucun synopsis disponible.' }}</p>
          </div>
          
          <div class="detail-cast" v-if="cast.length > 0">
            <h3>Casting principal</h3>
            <div class="cast-list">
              <div v-for="actor in cast.slice(0, 6)" :key="actor.id" class="cast-item">
                <div class="cast-photo">
                  <img 
                    :src="actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/200x300?text=No+Image'" 
                    :alt="actor.name"
                  >
                </div>
                <div class="cast-name">{{ actor.name }}</div>
                <div class="cast-character">{{ actor.character }}</div>
              </div>
            </div>
          </div>
          
          <div class="detail-actions">
            <button class="action-button versus-button" @click="startVersus">
              <i class="fas fa-bolt"></i> Créer un duel
            </button>
            <button class="action-button back-button" @click="goBack">
              <i class="fas fa-arrow-left"></i> Retour
            </button>
          </div>
        </div>
      </div>
      
      <!-- Recommandations -->
      <div class="recommendations" v-if="recommendations.length > 0">
        <h3>Vous pourriez aussi aimer</h3>
        <div class="recommendations-grid">
          <div 
            v-for="item in recommendations.slice(0, 6)" 
            :key="item.id" 
            class="recommendation-card"
            @click="navigateToDetail(item.id)"
          >
            <div class="recommendation-poster">
              <img 
                :src="item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'" 
                :alt="item.title || item.name"
              >
            </div>
            <div class="recommendation-title">
              {{ item.title || item.name }}
            </div>
            <div class="recommendation-rating">
              <i class="fas fa-star"></i> {{ item.vote_average.toFixed(1) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';

const route = useRoute();
const router = useRouter();
const { fetchMovieDetails, fetchTVDetails, fetchMovieCredits, fetchTVCredits, fetchMovieRecommendations, fetchTVRecommendations } = useApi();

// État
const mediaDetails = ref(null);
const cast = ref([]);
const recommendations = ref([]);
const isLoading = ref(true);
const error = ref(null);
const favorites = ref([]);

// Paramètres de l'URL
const mediaType = computed(() => route.params.type);
const mediaId = computed(() => route.params.id);

// Computed properties
const backdropStyle = computed(() => {
  if (!mediaDetails.value || !mediaDetails.value.backdrop_path) return {};
  return {
    backgroundImage: `url(https://image.tmdb.org/t/p/original${mediaDetails.value.backdrop_path})`
  };
});

const posterUrl = computed(() => {
  if (!mediaDetails.value) return '';
  return mediaDetails.value.poster_path 
    ? `https://image.tmdb.org/t/p/w500${mediaDetails.value.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';
});

const formatRuntime = computed(() => {
  if (!mediaDetails.value) return '';
  
  let runtime = 0;
  if (mediaType.value === 'movie') {
    runtime = mediaDetails.value.runtime;
  } else if (mediaDetails.value.episode_run_time && mediaDetails.value.episode_run_time.length > 0) {
    runtime = mediaDetails.value.episode_run_time[0];
  }
  
  if (!runtime) return '';
  
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
});

const isFavorite = computed(() => {
  if (!mediaDetails.value) return false;
  return favorites.value.some(fav => 
    fav.id === mediaDetails.value.id && 
    fav.type === mediaType.value
  );
});

// Méthodes
const fetchDetails = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Récupérer les détails du média
    if (mediaType.value === 'movie') {
      const details = await fetchMovieDetails(mediaId.value);
      mediaDetails.value = {
        ...details,
        title: details.title,
        year: details.release_date ? details.release_date.substring(0, 4) : '',
        type: 'movie'
      };
      
      // Récupérer le casting
      const credits = await fetchMovieCredits(mediaId.value);
      cast.value = credits.cast || [];
      
      // Récupérer les recommandations
      const recs = await fetchMovieRecommendations(mediaId.value);
      recommendations.value = recs.results || [];
      
    } else if (mediaType.value === 'tv') {
      const details = await fetchTVDetails(mediaId.value);
      mediaDetails.value = {
        ...details,
        title: details.name,
        year: details.first_air_date ? details.first_air_date.substring(0, 4) : '',
        type: 'tv'
      };
      
      // Récupérer le casting
      const credits = await fetchTVCredits(mediaId.value);
      cast.value = credits.cast || [];
      
      // Récupérer les recommandations
      const recs = await fetchTVRecommendations(mediaId.value);
      recommendations.value = recs.results || [];
    } else {
      throw new Error('Type de média non reconnu');
    }
  } catch (err) {
    console.error('Erreur lors du chargement des détails', err);
    error.value = 'Impossible de charger les détails. Veuillez réessayer.';
  } finally {
    isLoading.value = false;
  }
};

// Charger les favoris depuis le localStorage
const loadFavorites = () => {
  const storedFavorites = localStorage.getItem('favorites');
  if (storedFavorites) {
    favorites.value = JSON.parse(storedFavorites);
  }
};

// Ajouter/supprimer des favoris
const toggleFavorite = () => {
  if (!mediaDetails.value) return;
  
  const favoriteMedia = {
    id: mediaDetails.value.id,
    title: mediaDetails.value.title,
    year: mediaDetails.value.year,
    rating: mediaDetails.value.vote_average.toFixed(1),
    posterPath: mediaDetails.value.poster_path 
      ? `https://image.tmdb.org/t/p/w500${mediaDetails.value.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image',
    type: mediaType.value
  };
  
  const index = favorites.value.findIndex(fav => 
    fav.id === favoriteMedia.id && fav.type === favoriteMedia.type
  );
  
  if (index === -1) {
    // Ajouter aux favoris
    favorites.value.push(favoriteMedia);
  } else {
    // Supprimer des favoris
    favorites.value.splice(index, 1);
  }
  
  // Sauvegarder dans localStorage
  localStorage.setItem('favorites', JSON.stringify(favorites.value));
};

const goBack = () => {
  router.back();
};

const navigateToDetail = (id) => {
  router.push(`/detail/${mediaType.value}/${id}`);
};

const startVersus = () => {
  // Stocker le média actuel pour le versus
  localStorage.setItem('versusMedia', JSON.stringify({
    id: mediaDetails.value.id,
    title: mediaDetails.value.title,
    year: mediaDetails.value.year,
    rating: mediaDetails.value.vote_average.toFixed(1),
    posterPath: mediaDetails.value.poster_path 
      ? `https://image.tmdb.org/t/p/w500${mediaDetails.value.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image',
    type: mediaType.value
  }));
  
  // Rediriger vers la page versus
  router.push('/versus');
};

// Surveiller les changements de route pour recharger les détails
watch([mediaType, mediaId], () => {
  fetchDetails();
}, { immediate: false });

// Initialisation
onMounted(() => {
  loadFavorites();
  fetchDetails();
});
</script>

<style scoped>
.detail-view {
  min-height: 100vh;
  position: relative;
  padding-top: 60px;
  color: white;
}

.detail-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.backdrop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(20, 20, 20, 0.7) 0%, rgba(20, 20, 20, 0.9) 50%, rgba(20, 20, 20, 1) 100%);
}

.detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.detail-main {
  display: flex;
  gap: 40px;
  margin-bottom: 60px;
}

.detail-poster {
  flex: 0 0 300px;
  position: relative;
}

.detail-poster img {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.favorite-button {
  position: absolute;
  top: 10px;
  right: 10px;
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

.favorite-button:hover {
  transform: scale(1.1);
  background: #EC66A4;
}

.detail-info {
  flex: 1;
}

.detail-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.year {
  font-weight: normal;
  opacity: 0.8;
}

.detail-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 1rem;
}

.rating, .runtime {
  display: flex;
  align-items: center;
  gap: 5px;
}

.rating i {
  color: #EC66A4;
}

.detail-tagline {
  font-style: italic;
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.8;
}

.detail-overview h3, .detail-cast h3, .recommendations h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #EC66A4;
}

.detail-overview p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.cast-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.cast-item {
  text-align: center;
}

.cast-photo {
  width: 100%;
  height: 0;
  padding-bottom: 150%;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 10px;
}

.cast-photo img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cast-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.cast-character {
  font-size: 0.9rem;
  opacity: 0.8;
}

.detail-actions {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.action-button {
  padding: 12px 24px;
  border-radius: 30px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.versus-button {
  background: #EC66A4;
  color: white;
}

.versus-button:hover {
  background: #d44b8a;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(236, 102, 164, 0.4);
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.recommendations {
  margin-top: 60px;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.recommendation-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.recommendation-card:hover {
  transform: translateY(-10px);
}

.recommendation-poster {
  height: 0;
  padding-bottom: 150%;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 10px;
}

.recommendation-poster img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommendation-title {
  font-weight: bold;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommendation-rating {
  font-size: 0.9rem;
}

.recommendation-rating i {
  color: #EC66A4;
}

/* Styles pour le loader */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
}

.loading-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.loading-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 6px solid #EC66A4;
  border-radius: 50%;
  animation: loading-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #EC66A4 transparent transparent transparent;
}

.loading-ring div:nth-child(1) {
  animation-delay: -0.45s;
}

.loading-ring div:nth-child(2) {
  animation-delay: -0.3s;
}

.loading-ring div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes loading-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Styles pour les erreurs */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
  padding: 0 20px;
}

.error-icon {
  font-size: 3rem;
  color: #EC66A4;
  margin-bottom: 20px;
}

.retry-button {
  margin-top: 20px;
  padding: 12px 24px;
  border-radius: 30px;
  background: #EC66A4;
  color: white;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #d44b8a;
  transform: translateY(-3px);
}

/* Responsive */
@media (max-width: 768px) {
  .detail-main {
    flex-direction: column;
  }
  
  .detail-poster {
    flex: 0 0 auto;
    max-width: 300px;
    margin: 0 auto 30px;
  }
  
  .detail-header h1 {
    font-size: 2rem;
  }
  
  .detail-meta {
    flex-wrap: wrap;
  }
  
  .cast-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .recommendations-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style> 