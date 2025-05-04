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
      
      <div v-else class="search-results">
        <!-- Système de filtres amélioré -->
        <div class="filters-container glass">
          <div class="filters-toggle" @click="showFilters = !showFilters">
            <i class="fas fa-sliders-h"></i>
            <span>Filtres</span>
            <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </div>
          
          <transition name="slide-fade">
            <div v-if="showFilters" class="filters-panel">
              <div class="filters-header">
                <h3>Affiner les résultats</h3>
                <button @click="resetFilters" class="reset-filters-btn">
                  <i class="fas fa-undo-alt"></i> Réinitialiser
                </button>
              </div>
              
              <div class="filters-grid">
                <!-- Filtre par type -->
                <div class="filter-group">
                  <label>Type</label>
                  <div class="filter-pills">
                    <button 
                      @click="activeTypeFilter = 'all'" 
                      :class="{ active: activeTypeFilter === 'all' }"
                      class="filter-pill"
                    >
                      <i class="fas fa-film-alt"></i> Tous
                    </button>
                    <button 
                      @click="activeTypeFilter = 'movie'" 
                      :class="{ active: activeTypeFilter === 'movie' }"
                      class="filter-pill"
                    >
                      <i class="fas fa-film"></i> Films
                    </button>
                    <button 
                      @click="activeTypeFilter = 'tv'" 
                      :class="{ active: activeTypeFilter === 'tv' }"
                      class="filter-pill"
                    >
                      <i class="fas fa-tv"></i> Séries
                    </button>
                  </div>
                </div>
                
                <!-- Filtre par genre -->
                <div class="filter-group">
                  <label>Genre</label>
                  <div class="custom-select">
                    <select v-model="activeGenreFilter" class="filter-select">
                      <option value="all">Tous les genres</option>
                      <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                        {{ genre.name }}
                      </option>
                    </select>
                    <i class="fas fa-chevron-down select-arrow"></i>
                  </div>
                </div>
                
                <!-- Filtre par année -->
                <div class="filter-group">
                  <label>Année</label>
                  <div class="year-range">
                    <div class="custom-input">
                      <input 
                        type="number" 
                        v-model="yearRange.min" 
                        min="1900" 
                        :max="currentYear" 
                        placeholder="Min"
                        class="year-input"
                      />
                    </div>
                    <span class="range-separator">-</span>
                    <div class="custom-input">
                      <input 
                        type="number" 
                        v-model="yearRange.max" 
                        :min="yearRange.min || 1900" 
                        :max="currentYear" 
                        placeholder="Max"
                        class="year-input"
                      />
                    </div>
                  </div>
                </div>
                
                <!-- Filtre par note -->
                <div class="filter-group">
                  <label>Note minimale: <span class="rating-value">{{ minRating }}</span></label>
                  <div class="rating-slider">
                    <div class="rating-track">
                      <input 
                        type="range" 
                        v-model="minRating" 
                        min="0" 
                        max="10" 
                        step="0.5" 
                        class="rating-input"
                      />
                      <div class="rating-fill" :style="{ width: `${(minRating / 10) * 100}%` }"></div>
                    </div>
                    <div class="rating-stars">
                      <i v-for="n in 5" :key="n" 
                         :class="[
                           'fas', 
                           n <= Math.round(minRating/2) ? 'fa-star' : 'fa-star-o',
                           n <= Math.round(minRating/2) ? 'filled' : ''
                         ]"
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="active-filters" v-if="hasActiveFilters">
                <h4>Filtres actifs:</h4>
                <div class="filter-tags">
                  <div v-if="activeTypeFilter !== 'all'" class="filter-tag">
                    <span>{{ activeTypeFilter === 'movie' ? 'Films' : 'Séries' }}</span>
                    <button @click="activeTypeFilter = 'all'">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div v-if="activeGenreFilter !== 'all'" class="filter-tag">
                    <span>{{ getGenreName(activeGenreFilter) }}</span>
                    <button @click="activeGenreFilter = 'all'">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div v-if="yearRange.min || yearRange.max" class="filter-tag">
                    <span>
                      {{ yearRange.min || '1900' }} - {{ yearRange.max || 'Présent' }}
                    </span>
                    <button @click="yearRange = { min: null, max: null }">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div v-if="minRating > 0" class="filter-tag">
                    <span>{{ minRating }}+ <i class="fas fa-star"></i></span>
                    <button @click="minRating = 0">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="filters-results-info">
                <span class="results-count">{{ filteredResults.length }} résultats trouvés</span>
              </div>
            </div>
          </transition>
        </div>
        
        <!-- Si c'est une recherche, afficher tous les résultats ensemble -->
        <div v-if="hasSearched">
          <h2 class="section-title">
            <i class="fas fa-search"></i> Résultats pour "{{ searchQuery }}"
            <span class="results-count">({{ filteredResults.length }} résultats)</span>
          </h2>
          
          <div class="results-slider">
            <div 
              v-for="item in filteredResults" 
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
                <div class="media-type-badge" :class="item.type === 'movie' ? 'movie' : 'tv'">
                  {{ item.type === 'movie' ? 'Film' : 'Série' }}
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
                </div>
              </div>
            </div>
          </div>
          
          <!-- Message si aucun résultat après filtrage -->
          <div v-if="filteredResults.length === 0" class="no-filtered-results">
            <i class="fas fa-filter"></i>
            <p>Aucun résultat ne correspond à vos filtres</p>
            <button @click="resetFilters" class="reset-filters-btn">Réinitialiser les filtres</button>
          </div>
        </div>
        
        <!-- Si ce n'est pas une recherche, séparer films et séries -->
        <div v-else>
          <!-- Section Films (si le filtre le permet) -->
          <div v-if="activeTypeFilter === 'all' || activeTypeFilter === 'movie'" class="media-section movies-section">
            <h2 class="section-title">
              <i class="fas fa-film"></i> Films Populaires
              <span class="results-count">({{ filteredMovieResults.length }} résultats)</span>
            </h2>
            
            <div v-if="filteredMovieResults.length > 0" class="results-slider">
              <div 
                v-for="movie in filteredMovieResults" 
                :key="movie.id" 
                class="media-card netflix-card"
                @click="showDetails(movie)"
              >
                <div class="card-image">
                  <img 
                    v-if="movie.posterPath" 
                    :src="movie.posterPath" 
                    :alt="movie.title" 
                  />
                  <div v-else class="no-poster">
                    <span>{{ movie.title }}</span>
                  </div>
                  <div class="media-type-badge movie">Film</div>
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
                      <button class="card-btn versus-btn" @click.stop="createVersus(movie)">
                        <i class="fas fa-bolt"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="media-info">
                  <h3>{{ movie.title }}</h3>
                  <div class="media-meta">
                    <span class="media-year">{{ movie.year }}</span>
                    <span class="media-rating" v-if="movie.rating">
                      <i class="fas fa-star"></i> {{ movie.rating }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-filtered-results">
              <i class="fas fa-filter"></i>
              <p>Aucun film ne correspond à vos filtres</p>
            </div>
          </div>
          
          <!-- Section Séries (si le filtre le permet) -->
          <div v-if="activeTypeFilter === 'all' || activeTypeFilter === 'tv'" class="media-section tv-section">
            <h2 class="section-title">
              <i class="fas fa-tv"></i> Séries Populaires
              <span class="results-count">({{ filteredTVResults.length }} résultats)</span>
            </h2>
            
            <div v-if="filteredTVResults.length > 0" class="results-slider">
              <div 
                v-for="show in filteredTVResults" 
                :key="show.id" 
                class="media-card netflix-card"
                @click="showDetails(show)"
              >
                <div class="card-image">
                  <img 
                    v-if="show.posterPath" 
                    :src="show.posterPath" 
                    :alt="show.title" 
                  />
                  <div v-else class="no-poster">
                    <span>{{ show.title }}</span>
                  </div>
                  <div class="media-type-badge tv">Série</div>
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
                      <button class="card-btn versus-btn" @click.stop="createVersus(show)">
                        <i class="fas fa-bolt"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="media-info">
                  <h3>{{ show.title }}</h3>
                  <div class="media-meta">
                    <span class="media-year">{{ show.year }}</span>
                    <span class="media-rating" v-if="show.rating">
                      <i class="fas fa-star"></i> {{ show.rating }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-filtered-results">
              <i class="fas fa-filter"></i>
              <p>Aucune série ne correspond à vos filtres</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';

const router = useRouter();
const api = useApi();

// État
const searchQuery = ref('');
const searchResults = ref([]);
const isLoading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const hasSearched = ref(false);
const showFilters = ref(false);
const genres = ref([]);

// État des filtres
const activeTypeFilter = ref('all');
const activeGenreFilter = ref('all');
const yearRange = ref({ min: null, max: null });
const minRating = ref(0);
const currentYear = new Date().getFullYear();

// Charger les genres
const loadGenres = async () => {
  try {
    const [movieGenres, tvGenres] = await Promise.all([
      api.fetchMovieGenres(),
      api.fetchTVGenres()
    ]);
    
    // Fusionner et dédupliquer les genres
    const allGenres = [...movieGenres.genres, ...tvGenres.genres];
    const uniqueGenres = [];
    const genreIds = new Set();
    
    allGenres.forEach(genre => {
      if (!genreIds.has(genre.id)) {
        genreIds.add(genre.id);
        uniqueGenres.push(genre);
      }
    });
    
    genres.value = uniqueGenres.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Erreur lors du chargement des genres:', err);
  }
};

// Propriétés calculées pour les résultats filtrés
const filteredResults = computed(() => {
  return searchResults.value.filter(item => {
    // Filtre par type
    if (activeTypeFilter.value !== 'all' && item.type !== activeTypeFilter.value) {
      return false;
    }
    
    // Filtre par genre
    if (activeGenreFilter.value !== 'all' && 
        (!item.genreIds || !item.genreIds.includes(parseInt(activeGenreFilter.value)))) {
      return false;
    }
    
    // Filtre par année
    if (yearRange.value.min && item.year && parseInt(item.year) < yearRange.value.min) {
      return false;
    }
    if (yearRange.value.max && item.year && parseInt(item.year) > yearRange.value.max) {
      return false;
    }
    
    // Filtre par note
    if (minRating.value > 0 && (!item.rating || parseFloat(item.rating) < minRating.value)) {
      return false;
    }
    
    return true;
  });
});

const filteredMovieResults = computed(() => {
  return filteredResults.value.filter(item => item.type === 'movie');
});

const filteredTVResults = computed(() => {
  return filteredResults.value.filter(item => item.type === 'tv');
});

// Méthodes
const searchMedia = async () => {
  if (!searchQuery.value.trim()) return;
  
  isLoading.value = true;
  error.value = null;
  hasSearched.value = true;
  
  try {
    const data = await api.searchMedia(searchQuery.value, currentPage.value);
    
    // Filtrer et formater les résultats
    const formattedResults = data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => ({
        id: item.id,
        title: item.media_type === 'movie' ? item.title : item.name,
        year: item.media_type === 'movie' 
          ? (item.release_date ? item.release_date.substring(0, 4) : '') 
          : (item.first_air_date ? item.first_air_date.substring(0, 4) : ''),
        rating: item.vote_average ? item.vote_average.toFixed(1) : null,
        posterPath: item.poster_path 
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
          : null,
        type: item.media_type,
        genreIds: item.genre_ids || []
      }));
    
    searchResults.value = formattedResults;
    totalPages.value = data.total_pages > 500 ? 500 : data.total_pages;
  } catch (err) {
    console.error('Erreur de recherche:', err);
    error.value = err.message || 'Erreur lors de la recherche';
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
};

const loadDefaultResults = async () => {
  isLoading.value = true;
  error.value = null;
  hasSearched.value = false;
  
  try {
    // Charger les films populaires
    const moviesData = await api.fetchPopularMovies();
    
    // Charger les séries populaires
    const tvData = await api.fetchPopularTVShows();
    
    // Charger les genres
    const movieGenres = await api.fetchMovieGenres();
    const tvGenres = await api.fetchTVGenres();
    
    // Fusionner les genres
    const uniqueGenres = new Map();
    movieGenres.genres.forEach(genre => uniqueGenres.set(genre.id, genre));
    tvGenres.genres.forEach(genre => uniqueGenres.set(genre.id, genre));
    genres.value = Array.from(uniqueGenres.values());
    
    // Formater les résultats
    const movies = moviesData.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? movie.release_date.substring(0, 4) : '',
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
      posterPath: movie.poster_path ? 
                 `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      type: 'movie',
      genreIds: movie.genre_ids
    }));
    
    const tvShows = tvData.results.map(show => ({
      id: show.id,
      title: show.name,
      year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
      rating: show.vote_average ? show.vote_average.toFixed(1) : null,
      posterPath: show.poster_path ? 
                 `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
      type: 'tv',
      genreIds: show.genre_ids
    }));
    
    searchResults.value = [...movies, ...tvShows];
    totalPages.value = 1;
  } catch (err) {
    console.error('Erreur de chargement:', err);
    error.value = err.message || 'Erreur lors du chargement des résultats';
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
};

const resetFilters = () => {
  activeTypeFilter.value = 'all';
  activeGenreFilter.value = 'all';
  yearRange.value = { min: null, max: null };
  minRating.value = 0;
};

const showDetails = (item) => {
  router.push(`/detail/${item.type}/${item.id}`);
};

const createVersus = (item) => {
  localStorage.setItem('versusCandidate', JSON.stringify(item));
  router.push('/versus');
};

const getGenreName = (genreId) => {
  const genre = genres.value.find(g => g.id === Number(genreId));
  return genre ? genre.name : 'Genre inconnu';
};

// Initialisation
onMounted(() => {
  loadDefaultResults();
  loadGenres();
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

/* Styles pour les sections de médias séparées */
.media-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #6C757D;
}

.movies-section .section-title i {
  color: #EC66A4;
}

.tv-section .section-title i {
  color: #6C757D;
}

.media-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(236, 102, 164, 0.8);
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

/* Ajustements pour les cartes */
.results-slider {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .results-slider {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}

/* Styles pour le système de filtres */
.filters-container {
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.filters-toggle {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: rgba(30, 30, 30, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 10px;
}

.filters-toggle:hover {
  background-color: rgba(40, 40, 40, 0.8);
}

.filters-toggle i:first-child {
  color: #EC66A4;
  font-size: 1.2rem;
}

.filters-toggle span {
  flex: 1;
  font-weight: 600;
  font-size: 1.1rem;
}

.filters-panel {
  padding: 20px;
  background-color: rgba(24, 24, 24, 0.9);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filters-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #f5f5f5;
}

.reset-filters-btn {
  background: none;
  border: none;
  color: #EC66A4;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.reset-filters-btn:hover {
  background-color: rgba(236, 102, 164, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-group label {
  font-size: 0.95rem;
  color: #ADB5BD;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-pill {
  background-color: rgba(47, 47, 47, 0.8);
  border: 1px solid rgba(63, 63, 63, 0.8);
  color: #f5f5f5;
  padding: 8px 15px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-pill.active {
  background-color: #EC66A4;
  border-color: #EC66A4;
  box-shadow: 0 0 10px rgba(236, 102, 164, 0.4);
}

.filter-pill:hover:not(.active) {
  background-color: rgba(63, 63, 63, 0.8);
  transform: translateY(-2px);
}

.custom-select {
  position: relative;
}

.filter-select {
  appearance: none;
  background-color: rgba(47, 47, 47, 0.8);
  border: 1px solid rgba(63, 63, 63, 0.8);
  color: #f5f5f5;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #EC66A4;
  box-shadow: 0 0 0 2px rgba(236, 102, 164, 0.2);
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6C757D;
  pointer-events: none;
}

.year-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-input {
  position: relative;
  flex: 1;
}

.year-input {
  background-color: rgba(47, 47, 47, 0.8);
  border: 1px solid rgba(63, 63, 63, 0.8);
  color: #f5f5f5;
  padding: 10px 15px;
  border-radius: 8px;
  width: 100%;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.year-input:focus {
  outline: none;
  border-color: #EC66A4;
  box-shadow: 0 0 0 2px rgba(236, 102, 164, 0.2);
}

.range-separator {
  color: #6C757D;
  font-weight: bold;
}

.rating-slider {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-track {
  position: relative;
  height: 8px;
  background: rgba(47, 47, 47, 0.8);
  border-radius: 4px;
}

.rating-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(to right, #EC66A4, #D14B89);
  border-radius: 4px;
  pointer-events: none;
}

.rating-input {
  position: relative;
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  background: transparent;
  outline: none;
  margin: 0;
  z-index: 2;
}

.rating-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #EC66A4;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.rating-stars {
  display: flex;
  justify-content: space-between;
}

.rating-stars i {
  color: #6C757D;
}

.rating-stars i.filled {
  color: #EC66A4;
}

.rating-value {
  font-weight: bold;
  color: #EC66A4;
}

.active-filters {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.active-filters h4 {
  margin: 0 0 10px;
  font-size: 1rem;
  color: #ADB5BD;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(236, 102, 164, 0.2);
  border: 1px solid rgba(236, 102, 164, 0.3);
  padding: 5px 10px;
  border-radius: 30px;
  font-size: 0.9rem;
}

.filter-tag button {
  background: none;
  border: none;
  color: #EC66A4;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.filter-tag button:hover {
  background-color: rgba(236, 102, 164, 0.3);
}

.filters-results-info {
  margin-top: 20px;
  text-align: right;
  font-size: 0.9rem;
  color: #ADB5BD;
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .filter-pills {
    justify-content: space-between;
  }
  
  .filter-pill {
    flex: 1;
    justify-content: center;
    padding: 8px 10px;
    font-size: 0.9rem;
  }
}
</style> 