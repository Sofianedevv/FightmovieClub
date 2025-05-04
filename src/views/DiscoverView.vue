<template>
  <div class="tinder-view">
    <div class="tinder-header">
      <h1>Découvrez & Swipez</h1>
      <p class="subtitle">Faites glisser à droite pour "Vu", à gauche pour "Pas vu"</p>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <div class="loading-ring">
        <div></div><div></div><div></div><div></div>
      </div>
      <p>Chargement des films...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>Erreur</h3>
      <p>{{ error }}</p>
      <button @click="loadMoreMedia" class="retry-button">
        <span class="button-text">Réessayer</span>
        <span class="button-icon"><i class="fas fa-sync-alt"></i></span>
      </button>
    </div>
    
    <div v-else class="tinder-container">
      <transition-group name="tinder-card" tag="div" class="tinder-cards">
        <div 
          v-for="(item, index) in visibleMedia" 
          :key="item.id"
          class="tinder-card"
          :style="{ zIndex: visibleMedia.length - index }"
          :class="{ 'is-top': index === 0 }"
          @touchstart="touchStart"
          @touchmove="touchMove"
          @touchend="touchEnd"
        >
          <div class="card-image" :style="{ backgroundImage: `url(${item.posterPath})` }">
            <div class="card-gradient"></div>
            <div class="media-type-badge" :class="item.type">
              {{ item.type === 'movie' ? 'Film' : 'Série' }}
            </div>
            
            <div class="card-actions">
              <button class="action-btn not-seen" @click="markAsNotSeen(item)">
                <i class="fas fa-times"></i>
              </button>
              <button class="action-btn seen" @click="markAsSeen(item)">
                <i class="fas fa-check"></i>
              </button>
            </div>
            
            <div class="card-overlay">
              <div class="card-status seen">
                <span>VU</span>
              </div>
              <div class="card-status not-seen">
                <span>PAS VU</span>
              </div>
            </div>
          </div>
          
          <div class="card-content">
            <h2 class="card-title">{{ item.title }}</h2>
            <div class="card-meta">
              <span class="year">{{ item.year }}</span>
              <span class="rating" v-if="item.rating">
                <i class="fas fa-star"></i> {{ item.rating }}
              </span>
            </div>
            <p class="card-overview">{{ item.overview || 'Aucune description disponible.' }}</p>
            
            <div class="card-genres" v-if="item.genres && item.genres.length">
              <span v-for="genre in item.genres.slice(0, 3)" :key="genre.id" class="genre-tag">
                {{ genre.name }}
              </span>
            </div>
          </div>
        </div>
      </transition-group>
      
      <div v-if="visibleMedia.length === 0 && !isLoading" class="no-more-cards">
        <div class="empty-state">
          <i class="fas fa-film"></i>
          <h3>Plus de films à découvrir</h3>
          <p>Nous avons épuisé notre sélection pour le moment.</p>
          <button @click="loadMoreMedia" class="load-more-btn">
            <i class="fas fa-sync-alt"></i> Charger plus de films
          </button>
        </div>
      </div>
    </div>
    
    <div class="tinder-stats">
      <div class="stat-card">
        <div class="stat-value">{{ seenCount }}</div>
        <div class="stat-label">Films vus</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ notSeenCount }}</div>
        <div class="stat-label">Films à voir</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { useMediaStore } from '@/stores/media';

const api = useApi();
const mediaStore = useMediaStore();

// État
const mediaList = ref([]);
const visibleMedia = ref([]);
const isLoading = ref(false);
const error = ref(null);
const seenMedia = ref([]);
const notSeenMedia = ref([]);
const currentMoviePage = ref(1);
const currentTVPage = ref(1);
const maxPages = ref(5); // Charger jusqu'à 5 pages de chaque catégorie
const touchStartX = ref(0);
const touchEndX = ref(0);
const cardRotation = ref(0);
const cardTranslateX = ref(0);

// Statistiques
const seenCount = computed(() => seenMedia.value.length);
const notSeenCount = computed(() => notSeenMedia.value.length);

// Charger des médias
const loadMoreMedia = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    const newMedia = [];
    
    // Charger plusieurs catégories de films
    const categories = [
      { type: 'movie', method: 'fetchPopularMovies', page: currentMoviePage.value },
      { type: 'movie', method: 'fetchTrendingMovies', page: currentMoviePage.value },
      { type: 'movie', method: 'fetchTopRatedMovies', page: currentMoviePage.value },
      { type: 'tv', method: 'fetchPopularTVShows', page: currentTVPage.value },
      { type: 'tv', method: 'fetchTrendingTVShows', page: currentTVPage.value },
      { type: 'tv', method: 'fetchTopRatedTVShows', page: currentTVPage.value }
    ];
    
    // Traiter chaque catégorie
    for (const category of categories) {
      try {
        // Appeler la méthode API correspondante avec le numéro de page
        const data = await api[category.method](category.page);
        
        if (data && data.results) {
          // Traiter les résultats selon le type
          if (category.type === 'movie') {
            const processedMovies = await Promise.all(
              data.results.map(async movie => {
                try {
                  // Récupérer les détails complets pour avoir les genres
                  const details = await api.fetchMovieDetails(movie.id);
                  
                  return {
                    id: movie.id,
                    title: movie.title,
                    year: movie.release_date ? movie.release_date.substring(0, 4) : '',
                    rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
                    posterPath: movie.poster_path ? 
                              `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                    backdropPath: movie.backdrop_path ? 
                              `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
                    overview: movie.overview,
                    type: 'movie',
                    genres: details.genres || []
                  };
                } catch (err) {
                  console.error(`Erreur lors de la récupération des détails du film ${movie.id}:`, err);
                  // Retourner une version simplifiée sans les détails complets
                  return {
                    id: movie.id,
                    title: movie.title,
                    year: movie.release_date ? movie.release_date.substring(0, 4) : '',
                    rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
                    posterPath: movie.poster_path ? 
                              `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                    overview: movie.overview,
                    type: 'movie',
                    genres: []
                  };
                }
              })
            );
            
            newMedia.push(...processedMovies);
          } else {
            // Traitement des séries TV
            const processedShows = await Promise.all(
              data.results.map(async show => {
                try {
                  // Récupérer les détails complets pour avoir les genres
                  const details = await api.fetchTVDetails(show.id);
                  
                  return {
                    id: show.id,
                    title: show.name,
                    year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
                    rating: show.vote_average ? show.vote_average.toFixed(1) : null,
                    posterPath: show.poster_path ? 
                              `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
                    backdropPath: show.backdrop_path ? 
                              `https://image.tmdb.org/t/p/original${show.backdrop_path}` : null,
                    overview: show.overview,
                    type: 'tv',
                    genres: details.genres || []
                  };
                } catch (err) {
                  console.error(`Erreur lors de la récupération des détails de la série ${show.id}:`, err);
                  // Retourner une version simplifiée sans les détails complets
                  return {
                    id: show.id,
                    title: show.name,
                    year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
                    rating: show.vote_average ? show.vote_average.toFixed(1) : null,
                    posterPath: show.poster_path ? 
                              `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
                    overview: show.overview,
                    type: 'tv',
                    genres: []
                  };
                }
              })
            );
            
            newMedia.push(...processedShows);
          }
        }
      } catch (err) {
        console.error(`Erreur lors du chargement de ${category.method}:`, err);
        // Continuer avec les autres catégories même si une échoue
      }
    }
    
    // Filtrer les doublons par ID et type
    const existingIds = new Set(mediaList.value.map(item => `${item.type}-${item.id}`));
    const uniqueNewMedia = newMedia.filter(item => {
      const key = `${item.type}-${item.id}`;
      if (existingIds.has(key)) {
        return false;
      }
      existingIds.add(key);
      return true;
    });
    
    // Mélanger les résultats pour plus de variété
    const shuffled = uniqueNewMedia.sort(() => 0.5 - Math.random());
    
    // Ajouter à la liste existante
    mediaList.value = [...mediaList.value, ...shuffled];
    
    // Mettre à jour les cartes visibles
    updateVisibleCards();
    
    // Incrémenter les compteurs de page
    currentMoviePage.value++;
    currentTVPage.value++;
    
    console.log(`Chargé ${uniqueNewMedia.length} nouveaux médias. Total: ${mediaList.value.length}`);
    
  } catch (err) {
    console.error('Erreur de chargement:', err);
    error.value = err.message || 'Erreur lors du chargement des médias';
  } finally {
    isLoading.value = false;
  }
};

// Mettre à jour les cartes visibles (max 3 à la fois pour les performances)
const updateVisibleCards = () => {
  // Filtrer les médias qui n'ont pas encore été traités
  const unprocessedMedia = mediaList.value.filter(
    item => !seenMedia.value.includes(item.id) && !notSeenMedia.value.includes(item.id)
  );
  
  // Prendre les 3 premiers
  visibleMedia.value = unprocessedMedia.slice(0, 3);
};

// Marquer comme vu
const markAsSeen = (item) => {
  seenMedia.value.push(item.id);
  
  // Sauvegarder dans le localStorage
  localStorage.setItem('seenMedia', JSON.stringify(seenMedia.value));
  
  // Animation de swipe à droite
  animateSwipe('right');
  
  // Mettre à jour les cartes visibles
  setTimeout(() => {
    updateVisibleCards();
    
    // Si plus assez de cartes, charger plus de médias
    if (visibleMedia.value.length < 2) {
      loadMoreMedia();
    }
  }, 300);
};

// Marquer comme pas vu
const markAsNotSeen = (item) => {
  notSeenMedia.value.push(item.id);
  
  // Sauvegarder dans le localStorage
  localStorage.setItem('notSeenMedia', JSON.stringify(notSeenMedia.value));
  
  // Animation de swipe à gauche
  animateSwipe('left');
  
  // Mettre à jour les cartes visibles
  setTimeout(() => {
    updateVisibleCards();
    
    // Si plus assez de cartes, charger plus de médias
    if (visibleMedia.value.length < 2) {
      loadMoreMedia();
    }
  }, 300);
};

// Gestion du toucher pour le swipe
const touchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

const touchMove = (e) => {
  if (!touchStartX.value) return;
  
  const currentX = e.touches[0].clientX;
  const diffX = currentX - touchStartX.value;
  
  // Limiter le déplacement
  if (Math.abs(diffX) > 150) return;
  
  // Appliquer la transformation
  const topCard = document.querySelector('.tinder-card.is-top');
  if (topCard) {
    const rotation = diffX / 10;
    topCard.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
    
    // Afficher l'overlay approprié
    if (diffX > 50) {
      topCard.classList.add('swiping-right');
      topCard.classList.remove('swiping-left');
    } else if (diffX < -50) {
      topCard.classList.add('swiping-left');
      topCard.classList.remove('swiping-right');
    } else {
      topCard.classList.remove('swiping-right', 'swiping-left');
    }
  }
};

const touchEnd = (e) => {
  const topCard = document.querySelector('.tinder-card.is-top');
  if (!topCard) return;
  
  touchEndX.value = e.changedTouches[0].clientX;
  const diffX = touchEndX.value - touchStartX.value;
  
  // Réinitialiser la position si le swipe n'est pas assez fort
  if (Math.abs(diffX) < 100) {
    topCard.style.transform = '';
    topCard.classList.remove('swiping-right', 'swiping-left');
  } else {
    // Swipe complet
    if (diffX > 0) {
      // Swipe à droite = vu
      markAsSeen(visibleMedia.value[0]);
    } else {
      // Swipe à gauche = pas vu
      markAsNotSeen(visibleMedia.value[0]);
    }
  }
  
  // Réinitialiser
  touchStartX.value = 0;
  touchEndX.value = 0;
};

// Animation de swipe
const animateSwipe = (direction) => {
  const topCard = document.querySelector('.tinder-card.is-top');
  if (!topCard) return;
  
  if (direction === 'right') {
    topCard.style.transform = 'translateX(1000px) rotate(30deg)';
    topCard.classList.add('swiping-right');
  } else {
    topCard.style.transform = 'translateX(-1000px) rotate(-30deg)';
    topCard.classList.add('swiping-left');
  }
};

// Charger les données sauvegardées
const loadSavedData = () => {
  const savedSeen = localStorage.getItem('seenMedia');
  const savedNotSeen = localStorage.getItem('notSeenMedia');
  
  if (savedSeen) {
    seenMedia.value = JSON.parse(savedSeen);
  }
  
  if (savedNotSeen) {
    notSeenMedia.value = JSON.parse(savedNotSeen);
  }
};

// Initialisation
onMounted(() => {
  loadSavedData();
  loadMoreMedia();
});
</script>

<style scoped>
.tinder-view {
  padding: 80px 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.tinder-header {
  text-align: center;
  margin-bottom: 40px;
}

.tinder-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(to right, #EC66A4, #6C757D);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #ADB5BD;
  font-size: 1.1rem;
}

.tinder-container {
  position: relative;
  height: 600px;
  max-width: 400px;
  margin: 0 auto;
}

.tinder-cards {
  position: relative;
  width: 100%;
  height: 100%;
}

.tinder-card {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  background-color: #2F2F2F;
  transition: transform 0.3s ease;
  cursor: grab;
}

.card-image {
  position: relative;
  height: 70%;
  background-size: cover;
  background-position: center;
}

.card-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.8));
}

.card-content {
  padding: 20px;
  height: 30%;
  overflow-y: auto;
}

.card-title {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.card-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  color: #ADB5BD;
}

.card-meta .rating {
  color: #EC66A4;
}

.card-overview {
  font-size: 0.9rem;
  color: #f5f5f5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-tag {
  background-color: rgba(108, 117, 125, 0.3);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.card-actions {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 30px;
  z-index: 10;
}

.action-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.action-btn.seen {
  background-color: #4CAF50;
  color: white;
}

.action-btn.not-seen {
  background-color: #F44336;
  color: white;
}

.action-btn:hover {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.card-status {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  padding: 20px;
  border: 5px solid;
  border-radius: 10px;
  transform: rotate(-30deg);
  opacity: 0;
  transition: all 0.3s ease;
}

.card-status.seen {
  color: #4CAF50;
  border-color: #4CAF50;
}

.card-status.not-seen {
  color: #F44336;
  border-color: #F44336;
}

.tinder-card.swiping-right .card-overlay {
  opacity: 1;
}

.tinder-card.swiping-right .card-status.seen {
  opacity: 1;
  transform: rotate(-15deg);
}

.tinder-card.swiping-left .card-overlay {
  opacity: 1;
}

.tinder-card.swiping-left .card-status.not-seen {
  opacity: 1;
  transform: rotate(-15deg);
}

.media-type-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 5;
}

.media-type-badge.movie {
  background-color: #EC66A4;
  color: white;
}

.media-type-badge.tv {
  background-color: #6C757D;
  color: white;
}

.tinder-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
}

.stat-card {
  background-color: rgba(47, 47, 47, 0.7);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  min-width: 120px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  color: #ADB5BD;
  font-size: 0.9rem;
}

.no-more-cards {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background-color: rgba(47, 47, 47, 0.7);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.empty-state i {
  font-size: 3rem;
  color: #6C757D;
  margin-bottom: 20px;
}

.load-more-btn {
  margin-top: 20px;
  background-color: #EC66A4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.load-more-btn:hover {
  background-color: #D14B89;
  transform: translateY(-3px);
}

/* Animations */
.tinder-card-enter-active,
.tinder-card-leave-active {
  transition: all 0.3s ease;
}

.tinder-card-enter-from {
  opacity: 0;
  transform: translateY(50px);
}

.tinder-card-leave-to {
  opacity: 0;
}

/* Loading et erreur */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.loading-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.loading-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #EC66A4;
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

.error-icon {
  font-size: 3rem;
  color: #F44336;
  margin-bottom: 20px;
}

.retry-button {
  margin-top: 20px;
  background-color: #EC66A4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.retry-button:hover {
  background-color: #D14B89;
  transform: translateY(-3px);
}

/* Responsive */
@media (max-width: 768px) {
  .tinder-view {
    padding: 60px 15px 30px;
  }
  
  .tinder-header h1 {
    font-size: 2rem;
  }
  
  .tinder-container {
    height: 500px;
  }
  
  .action-btn {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}
</style> 