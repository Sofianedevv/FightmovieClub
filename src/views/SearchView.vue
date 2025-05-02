<template>
  <div class="search-container">
    <div class="hero-banner">
      <div class="hero-content">
        <h1 class="hero-title">Explorez et comparez<br>vos films préférés</h1>
        <p class="hero-subtitle">La première règle du Fight Club est : il est interdit de parler du Fight Club</p>
        
        <div class="hero-actions">
          <div class="search-bar">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Rechercher un film ou une série..." 
              @keyup.enter="searchMedia"
            />
          </div>
          <button @click="searchMedia" :disabled="isLoading" class="search-button">
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            <span v-else>
              Rechercher
            </span>
          </button>
        </div>
      </div>
      <div class="hero-overlay"></div>
      <div class="hero-vignette"></div>
    </div>
    
    <!-- Nouvelle section de promotion des versus -->
    <div class="versus-promo-section">
      <div class="container">
        <div class="versus-promo-content">
          <div class="versus-promo-text">
            <h2 class="versus-promo-title">CRÉEZ DES DUELS ÉPIQUES</h2>
            <p class="versus-promo-description">
              Comparez vos films et séries préférés dans des face-à-face passionnants. 
              Votez pour vos favoris et découvrez les champions du public.
            </p>
            <router-link to="/versus" class="netflix-btn primary versus-cta">
              <i class="fas fa-bolt"></i> Commencer un duel
            </router-link>
          </div>
          <div class="versus-promo-visual">
            <div class="versus-card-preview left">
              <img src="https://image.tmdb.org/t/p/w500/qVdrYN8qu7xUtsdEFeGiIVIaYd.jpg" alt="Fight Club" />
            </div>
            <div class="versus-divider-preview">
              <span>VS</span>
            </div>
            <div class="versus-card-preview right">
              <img src="https://image.tmdb.org/t/p/w500/8kSerJrhrJWKLk1LViesGcnrUPE.jpg" alt="Pulp Fiction" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="content-section">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Chargement des résultats...</p>
      </div>
      
      <div v-else-if="error" class="error glass">
        <i class="fas fa-exclamation-triangle error-icon"></i>
        <p>{{ error }}</p>
        <button @click="loadDefaultResults" class="retry-btn">Réessayer</button>
      </div>
      
      <div v-else-if="searchResults.length === 0 && hasSearched" class="no-results glass">
        <i class="fas fa-search no-results-icon"></i>
        <p>Aucun résultat trouvé pour "{{ searchQuery }}"</p>
        <button @click="loadDefaultResults" class="retry-btn">Voir les films populaires</button>
      </div>
      
      <div v-else-if="searchResults.length > 0" class="search-results">
        <h2 v-if="hasSearched" class="section-title">
          <i class="fas fa-film"></i> Résultats pour "{{ searchQuery }}"
        </h2>
        <h2 v-else class="section-title">
          <i class="fas fa-fire"></i> Films et séries populaires
        </h2>
        
        <div class="slider-container">
          <div class="results-slider">
            <div 
              v-for="item in searchResults" 
              :key="item.id" 
              class="media-card netflix-card"
              @click="showDetails(item)"
            >
              <div class="card-image">
                <img 
                  v-if="item.posterPath" 
                  :src="item.posterPath" 
                  :alt="item.title" 
                />
                <div v-else class="no-poster">
                  <span>{{ item.title }}</span>
                </div>
                <div class="card-overlay">
                  <div class="card-actions">
                    <button class="card-btn play-btn">
                      <i class="fas fa-play"></i>
                    </button>
                    <button class="card-btn add-btn">
                      <i class="fas fa-plus"></i>
                    </button>
                    <button class="card-btn like-btn">
                      <i class="fas fa-thumbs-up"></i>
                    </button>
                    <button class="card-btn versus-btn" @click.stop="createVersus(item)">
                      <i class="fas fa-bolt"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="media-info">
                <h3>{{ item.title }}</h3>
                <div class="media-meta">
                  <span class="media-year">{{ item.year }}</span>
                  <span class="media-rating" v-if="item.rating">
                    <i class="fas fa-star"></i> {{ item.rating }}
                  </span>
                  <span class="media-type" :class="item.type">
                    {{ item.type === 'movie' ? 'Film' : 'Série' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="pagination" v-if="totalPages > 1">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in displayedPages" 
              :key="page"
              @click="changePage(page)"
              class="page-number"
              :class="{ 'active': page === currentPage }"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useMediaStore } from '@/stores/media';

const router = useRouter();
const api = useApi();
const mediaStore = useMediaStore();

// État de recherche
const searchQuery = ref('');
const mediaType = ref('all');
const currentPage = ref(1);
const totalResults = ref(0);
const totalPages = ref(0);
const searchResults = ref([]);
const hasSearched = ref(false);
const isLoading = computed(() => api.isLoading.value);
const error = computed(() => api.error.value);

// État du modal
const showModal = ref(false);
const selectedMedia = ref(null);

// Liste de termes populaires pour charger des résultats par défaut
const popularTerms = [
  'star', 'war', 'love', 'game', 'dark', 'time', 'world', 'life', 'man', 'day',
  'show', 'house', 'doctor', 'office', 'break', 'dead', 'family', 'friends', 'big', 'new'
];

// Pagination
const displayedPages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    // Afficher toutes les pages si leur nombre est inférieur à maxVisiblePages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Toujours afficher la première page
    pages.push(1);
    
    let startPage = Math.max(2, currentPage.value - 1);
    let endPage = Math.min(totalPages.value - 1, startPage + 2);
    
    // Ajuster si on est proche de la fin
    if (endPage === totalPages.value - 1) {
      startPage = Math.max(2, endPage - 2);
    }
    
    // Ajouter un ellipsis si nécessaire
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Ajouter les pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Ajouter un ellipsis si nécessaire
    if (endPage < totalPages.value - 1) {
      pages.push('...');
    }
    
    // Toujours afficher la dernière page
    pages.push(totalPages.value);
  }
  
  return pages;
});

// Méthodes
const searchMedia = async () => {
  if (!searchQuery.value.trim()) {
    loadDefaultResults();
    return;
  }
  
  currentPage.value = 1;
  await fetchResults();
  hasSearched.value = true;
};

const fetchResults = async () => {
  const type = mediaType.value === 'all' ? '' : mediaType.value;
  
  let params = { 
    s: searchQuery.value || getRandomTerm(),
    page: currentPage.value
  };
  
  if (type) {
    params.type = type;
  }
  
  const data = await api.fetchData(params);
  
  if (data && data.Search) {
    searchResults.value = data.Search.map(item => ({
      id: item.imdbID,
      title: item.Title,
      year: item.Year,
      type: item.Type === 'movie' ? 'movie' : 'series',
      posterPath: item.Poster !== 'N/A' ? item.Poster : null
    }));
    
    totalResults.value = parseInt(data.totalResults);
    totalPages.value = Math.ceil(totalResults.value / 10); // OMDb renvoie 10 résultats par page
  } else {
    searchResults.value = [];
    totalResults.value = 0;
    totalPages.value = 0;
  }
};

const getRandomTerm = () => {
  const randomIndex = Math.floor(Math.random() * popularTerms.length);
  return popularTerms[randomIndex];
};

const loadDefaultResults = async () => {
  hasSearched.value = false;
  searchQuery.value = '';
  currentPage.value = 1;
  await fetchResults();
};

const changePage = (page) => {
  if (typeof page === 'number' && page !== currentPage.value) {
    currentPage.value = page;
    fetchResults();
    // Remonter en haut de la page
    window.scrollTo(0, 0);
  }
};

const showDetails = async (media) => {
  isLoading.value = true;
  
  try {
    const details = await api.getMovieDetails(media.id);
    
    if (details) {
      selectedMedia.value = {
        ...details,
        id: details.imdbID,
        title: details.Title,
        year: details.Year,
        type: details.Type === 'movie' ? 'movie' : 'series',
        posterPath: details.Poster !== 'N/A' ? details.Poster : null,
        rating: details.imdbRating,
        plot: details.Plot,
        director: details.Director,
        actors: details.Actors,
        genre: details.Genre
      };
      
      showModal.value = true;
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des détails:', err);
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedMedia.value = null;
};

const addToVersus = () => {
  // Stocker le média sélectionné pour l'utiliser dans un versus
  // Vous pourriez implémenter cette fonctionnalité plus tard
  alert('Fonctionnalité à venir: Ajouter au Versus');
  closeModal();
};

// Réinitialiser la page quand le type de média change
watch(mediaType, () => {
  loadDefaultResults();
});

// Charger des résultats par défaut au chargement de la page
onMounted(() => {
  loadDefaultResults();
});
</script>

<style scoped>
.search-container {
  padding-top: 0;
}

.hero-banner {
  position: relative;
  height: 80vh;
  min-height: 600px;
  background: url('https://res.cloudinary.com/ct-cloudinary/image/upload/c_fill,dpr_3.0,f_auto,g_center,h_440,q_80,w_779/v1627892903/Fight-Club_xkhd5d') center/cover no-repeat;
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, var(--black) 0%, transparent 60%, rgba(0, 0, 0, 0.8) 100%);
  z-index: 1;
}

.hero-vignette {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: inset 0 0 150px rgba(0, 0, 0, 0.9);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 800px;
  margin-left: 4%;
  padding: 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 20px;
  line-height: 1.1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 30px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 10px;
  max-width: 600px;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0 15px;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  border-color: #ADB5BD;
  box-shadow: 0 0 0 2px rgba(173, 181, 189, 0.3);
}

.search-icon {
  color: #aaa;
  margin-right: 10px;
}

.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 12px 0;
  font-size: 1rem;
  outline: none;
}

.search-bar input::placeholder {
  color: #aaa;
}

.search-button {
  background-color: transparent;
  color: white;
  border: 2px solid #6C757D;
  padding: 0 25px;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 0 10px rgba(108, 117, 125, 0.5),
              0 0 20px rgba(108, 117, 125, 0.3),
              0 0 30px rgba(108, 117, 125, 0.1);
}

.search-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(236, 102, 164, 0.1), rgba(236, 102, 164, 0.4));
  z-index: -1;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s ease;
}

.search-button:hover:not(:disabled) {
  background-color: transparent;
  color: white;
  border-color: #EC66A4;
  box-shadow: 0 0 15px rgba(236, 102, 164, 0.7),
              0 0 30px rgba(236, 102, 164, 0.5),
              0 0 45px rgba(236, 102, 164, 0.3);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8),
               0 0 10px rgba(236, 102, 164, 0.5);
  transform: scale(1.05);
}

.search-button:hover:not(:disabled)::before {
  transform: scaleX(1);
  transform-origin: left;
}

.search-button i {
  margin-right: 8px;
}

.search-button:hover:not(:disabled) i {
  animation: pulse-pink-neon 1.5s infinite;
}

.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: rgba(108, 117, 125, 0.3);
  border-color: rgba(108, 117, 125, 0.3);
  box-shadow: none;
}

.content-section {
  padding: 0 4%;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: var(--primary-pink);
}

.slider-container {
  position: relative;
  margin-bottom: 40px;
}

.results-slider {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.media-card {
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.media-card:hover {
  transform: scale(1.05);
  z-index: 10;
}

.card-image {
  position: relative;
  overflow: hidden;
}

.media-card img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 15px;
}

.media-card:hover .card-overlay {
  opacity: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.card-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(42, 42, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: white;
  transition: all 0.2s ease;
}

.card-btn:hover {
  transform: scale(1.1);
  background-color: rgba(255, 255, 255, 0.1);
}

.play-btn {
  background-color: white;
  color: black;
}

.versus-btn {
  background-color: #6C757D;
  border-color: #6C757D;
}

.media-info {
  padding: 10px;
  background-color: var(--dark-gray);
}

.media-info h3 {
  margin: 0 0 5px;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  color: #aaa;
}

.media-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.media-rating i {
  color: #E50914;
}

.media-type {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
}

.media-type.movie {
  background-color: #6C757D;
  color: white;
}

.media-type.series {
  background-color: var(--accent-yellow);
  color: black;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  margin-bottom: 60px;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(42, 42, 42, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #6C757D;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  margin: 0 10px;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 4px;
  border: none;
  background-color: rgba(42, 42, 42, 0.7);
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.page-number:hover:not(.active) {
  background-color: rgba(108, 117, 125, 0.3);
}

.page-number.active {
  background-color: #6C757D;
  color: white;
}

.loading, .error, .no-results {
  text-align: center;
  padding: 60px 20px;
  margin: 40px 0;
  border-radius: 4px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6C757D;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon, .no-results-icon {
  font-size: 3rem;
  color: #6C757D;
  margin-bottom: 20px;
}

.retry-btn {
  background-color: #6C757D;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  background-color: #5A6268;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .hero-banner {
    height: 60vh;
    min-height: 500px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .results-slider {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

/* Styles pour la section de promotion des versus */
.versus-promo-section {
  background-color: var(--dark-gray);
  padding: 60px 0;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.versus-promo-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%);
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.versus-promo-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.versus-promo-text {
  flex: 1;
}

.versus-promo-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 900;
  letter-spacing: 2px;
  color: white;
  position: relative;
  display: inline-block;
}

.versus-promo-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 80px;
  height: 4px;
  background-color: #6C757D;
}

.versus-promo-description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 30px;
  color: #e5e5e5;
}

.versus-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  background-color: transparent;
  color: white;
  border: 2px solid #6C757D;
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: all 0.5s ease;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(108, 117, 125, 0.5),
              0 0 20px rgba(108, 117, 125, 0.3),
              0 0 30px rgba(108, 117, 125, 0.1);
}

.versus-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(236, 102, 164, 0.1), rgba(236, 102, 164, 0.4));
  z-index: -1;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s ease;
}

.versus-cta:hover {
  color: white;
  border-color: #EC66A4;
  box-shadow: 0 0 15px rgba(236, 102, 164, 0.7),
              0 0 30px rgba(236, 102, 164, 0.5),
              0 0 45px rgba(236, 102, 164, 0.3);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8),
               0 0 10px rgba(236, 102, 164, 0.5);
  transform: scale(1.05);
}

.versus-cta:hover::before {
  transform: scaleX(1);
  transform-origin: left;
}

.versus-cta i {
  font-size: 1.2rem;
}

.versus-cta:hover i {
  animation: pulse-pink-neon 1.5s infinite;
}

@keyframes pulse-pink-neon {
  0% {
    opacity: 1;
    text-shadow: 0 0 10px rgba(236, 102, 164, 0.7),
                 0 0 20px rgba(236, 102, 164, 0.5);
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 15px rgba(236, 102, 164, 0.9),
                 0 0 30px rgba(236, 102, 164, 0.7),
                 0 0 45px rgba(236, 102, 164, 0.5);
  }
  100% {
    opacity: 1;
    text-shadow: 0 0 10px rgba(236, 102, 164, 0.7),
                 0 0 20px rgba(236, 102, 164, 0.5);
  }
}

.versus-promo-visual {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.versus-card-preview {
  width: 200px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  position: relative;
}

.versus-card-preview.left {
  transform: rotate(-5deg) translateX(20px);
  z-index: 2;
}

.versus-card-preview.right {
  transform: rotate(5deg) translateX(-20px);
  z-index: 2;
}

.versus-card-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.versus-divider-preview {
  position: absolute;
  z-index: 3;
  width: 60px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: #6C757D;
  border: 2px solid #6C757D;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .versus-promo-content {
    flex-direction: column;
  }
  
  .versus-promo-title {
    font-size: 2rem;
  }
  
  .versus-promo-description {
    font-size: 1rem;
  }
  
  .versus-card-preview {
    width: 150px;
    height: 225px;
  }
}
</style> 