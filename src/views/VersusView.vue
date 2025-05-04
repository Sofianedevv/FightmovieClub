<template>
  <div class="versus-view">
    <!-- Arrière-plan dynamique avec particules -->
    <div class="versus-particles" id="particles-js"></div>
    
    <div class="versus-content">
      <div class="versus-header">
        <h1 class="glitch-text" data-text="VERSUS MODE">VERSUS MODE</h1>
        <p class="subtitle">Choisissez votre champion</p>
      </div>
      
      <div v-if="isLoading" class="loading-container">
        <div class="loading-ring">
          <div></div><div></div><div></div><div></div>
        </div>
        <p>Préparation du ring...</p>
      </div>
      
      <div v-else-if="currentVersus.leftMedia && currentVersus.rightMedia" class="versus-arena">
        <div class="arena-background"></div>
        
        <div class="versus-cards-container">
          <VersusCard
            :leftMedia="currentVersus.leftMedia"
            :rightMedia="currentVersus.rightMedia"
            @winner-selected="handleWinnerSelected"
          />
        </div>
        
        <!-- Compteur de rounds -->
        <div class="round-counter">
          <span class="round-label">ROUND</span>
          <span class="round-number">{{ versusHistory.length + 1 }}</span>
        </div>
      </div>
      
      <div v-else class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Combat annulé</h3>
        <p>{{ error }}</p>
        <button @click="setupNewVersus" class="retry-button">
          <span class="button-text">Nouveau combat</span>
          <span class="button-icon"><i class="fas fa-sync-alt"></i></span>
        </button>
      </div>
      
      <!-- Statistiques de combat avec visualisation -->
      <div v-if="versusHistory.length > 0" class="stats-container">
        <h2 class="stats-title">VOS STATISTIQUES DE COMBAT</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ versusHistory.length }}</div>
            <div class="stat-label">Combats terminés</div>
            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ movieWins }}</div>
            <div class="stat-label">Films vainqueurs</div>
            <div class="stat-icon"><i class="fas fa-film"></i></div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ tvWins }}</div>
            <div class="stat-label">Séries victorieuses</div>
            <div class="stat-icon"><i class="fas fa-tv"></i></div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ favoriteGenre }}</div>
            <div class="stat-label">Genre favori</div>
            <div class="stat-icon"><i class="fas fa-theater-masks"></i></div>
          </div>
        </div>
        
        <!-- Graphique de répartition des victoires -->
        <div class="victory-chart">
          <h3>Répartition des victoires</h3>
          <div class="chart-container">
            <div class="chart-bar movies" :style="{ width: `${moviePercentage}%` }">
              <span class="chart-label">Films</span>
              <span class="chart-value">{{ moviePercentage }}%</span>
            </div>
            <div class="chart-bar series" :style="{ width: `${tvPercentage}%` }">
              <span class="chart-label">Séries</span>
              <span class="chart-value">{{ tvPercentage }}%</span>
            </div>
          </div>
        </div>
        
        <!-- Historique des combats récents -->
        <div class="recent-battles">
          <h3>Combats récents</h3>
          <div class="battles-timeline">
            <div v-for="(battle, index) in recentBattles" :key="index" class="battle-card">
              <div class="battle-date">{{ formatDate(battle.date) }}</div>
              <div class="battle-contenders">
                <div class="battle-winner">
                  <img :src="battle.winner.posterPath" :alt="battle.winner.title">
                  <div class="winner-badge"><i class="fas fa-crown"></i></div>
                </div>
                <div class="battle-vs">VS</div>
                <div class="battle-loser">
                  <img :src="battle.loser.posterPath" :alt="battle.loser.title">
                </div>
              </div>
              <div class="battle-titles">
                <div class="winner-title">{{ battle.winner.title }}</div>
                <div class="loser-title">{{ battle.loser.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.versus-view {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
}

/* Arrière-plan avec particules */
.versus-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.versus-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* En-tête avec effet glitch */
.versus-header {
  text-align: center;
  margin-bottom: 50px;
}

.glitch-text {
  font-size: 4rem;
  font-weight: 900;
  text-transform: uppercase;
  position: relative;
  color: white;
  letter-spacing: 5px;
  animation: glitch 2s infinite;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 #EC66A4;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 5s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -2px 0 #6C757D;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim2 5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% {
    clip: rect(31px, 9999px, 94px, 0);
  }
  5% {
    clip: rect(70px, 9999px, 71px, 0);
  }
  10% {
    clip: rect(29px, 9999px, 83px, 0);
  }
  15% {
    clip: rect(16px, 9999px, 91px, 0);
  }
  20% {
    clip: rect(2px, 9999px, 23px, 0);
  }
  25% {
    clip: rect(46px, 9999px, 33px, 0);
  }
  30% {
    clip: rect(94px, 9999px, 30px, 0);
  }
  35% {
    clip: rect(69px, 9999px, 65px, 0);
  }
  40% {
    clip: rect(41px, 9999px, 27px, 0);
  }
  45% {
    clip: rect(88px, 9999px, 85px, 0);
  }
  50% {
    clip: rect(53px, 9999px, 40px, 0);
  }
  55% {
    clip: rect(4px, 9999px, 52px, 0);
  }
  60% {
    clip: rect(65px, 9999px, 33px, 0);
  }
  65% {
    clip: rect(96px, 9999px, 58px, 0);
  }
  70% {
    clip: rect(23px, 9999px, 66px, 0);
  }
  75% {
    clip: rect(40px, 9999px, 51px, 0);
  }
  80% {
    clip: rect(80px, 9999px, 3px, 0);
  }
  85% {
    clip: rect(27px, 9999px, 99px, 0);
  }
  90% {
    clip: rect(42px, 9999px, 65px, 0);
  }
  95% {
    clip: rect(38px, 9999px, 1px, 0);
  }
  100% {
    clip: rect(99px, 9999px, 70px, 0);
  }
}

@keyframes glitch-anim2 {
  0% {
    clip: rect(65px, 9999px, 100px, 0);
  }
  5% {
    clip: rect(52px, 9999px, 74px, 0);
  }
  10% {
    clip: rect(79px, 9999px, 85px, 0);
  }
  15% {
    clip: rect(75px, 9999px, 5px, 0);
  }
  20% {
    clip: rect(67px, 9999px, 61px, 0);
  }
  25% {
    clip: rect(14px, 9999px, 79px, 0);
  }
  30% {
    clip: rect(1px, 9999px, 66px, 0);
  }
  35% {
    clip: rect(86px, 9999px, 30px, 0);
  }
  40% {
    clip: rect(23px, 9999px, 98px, 0);
  }
  45% {
    clip: rect(85px, 9999px, 72px, 0);
  }
  50% {
    clip: rect(71px, 9999px, 75px, 0);
  }
  55% {
    clip: rect(2px, 9999px, 48px, 0);
  }
  60% {
    clip: rect(30px, 9999px, 16px, 0);
  }
  65% {
    clip: rect(59px, 9999px, 50px, 0);
  }
  70% {
    clip: rect(41px, 9999px, 62px, 0);
  }
  75% {
    clip: rect(2px, 9999px, 82px, 0);
  }
  80% {
    clip: rect(47px, 9999px, 73px, 0);
  }
  85% {
    clip: rect(3px, 9999px, 27px, 0);
  }
  90% {
    clip: rect(26px, 9999px, 55px, 0);
  }
  95% {
    clip: rect(42px, 9999px, 97px, 0);
  }
  100% {
    clip: rect(38px, 9999px, 49px, 0);
  }
}

.subtitle {
  font-size: 1.5rem;
  color: #e5e5e5;
  margin-top: 10px;
  font-weight: 300;
  letter-spacing: 2px;
}

/* Loader innovant */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
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
  border: 8px solid #fff;
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

/* Arène de combat */
.versus-arena {
  position: relative;
  margin-bottom: 60px;
  perspective: 1000px;
}

.arena-background {
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  background: radial-gradient(circle at center, rgba(236, 102, 164, 0.2) 0%, rgba(0, 0, 0, 0) 70%);
  filter: blur(20px);
  z-index: -1;
}

.versus-cards-container {
  transform-style: preserve-3d;
  transition: all 0.8s ease;
}

/* Compteur de rounds */
.round-counter {
  position: absolute;
  top: -30px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #EC66A4;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  box-shadow: 0 0 15px rgba(236, 102, 164, 0.5);
}

.round-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.round-number {
  font-size: 1.8rem;
  font-weight: 900;
  color: #EC66A4;
}

/* Message d'erreur */
.error-container {
  text-align: center;
  padding: 50px 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  margin-bottom: 60px;
}

.error-icon {
  font-size: 3rem;
  color: #EC66A4;
  margin-bottom: 20px;
}

.retry-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: white;
  border: 2px solid #6C757D;
  padding: 0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.button-text {
  padding: 12px 20px;
  transition: all 0.3s ease;
}

.button-icon {
  background: #6C757D;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.retry-button:hover {
  border-color: #EC66A4;
  box-shadow: 0 0 15px rgba(236, 102, 164, 0.5);
}

.retry-button:hover .button-icon {
  background: #EC66A4;
}

/* Statistiques avec design moderne */
.stats-container {
  background: rgba(24, 24, 24, 0.8);
  border-radius: 10px;
  padding: 40px;
  margin-top: 60px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stats-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 40px;
  letter-spacing: 2px;
  position: relative;
  display: inline-block;
  padding-bottom: 15px;
}

.stats-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, #6C757D, #EC66A4, #6C757D);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  position: relative;
  overflow: hidden;
  max-width: 200px;
  margin: 0 auto;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 900;
  margin-bottom: 5px;
  background: linear-gradient(to right, #EC66A4, #6C757D);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.9rem;
  color: #e5e5e5;
  margin-bottom: 10px;
}

.stat-icon {
  font-size: 1.8rem;
  color: #6C757D;
  margin-bottom: 10px;
}

/* Graphique de répartition */
.victory-chart {
  margin-top: 20px;
  margin-bottom: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.victory-chart h3 {
  font-size: 1.3rem;
  margin-bottom: 20px;
  color: #e5e5e5;
}

.chart-container {
  height: 35px;
  background: rgba(40, 40, 40, 0.5);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.chart-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  transition: width 1s ease-in-out;
}

.chart-bar.movies {
  background: linear-gradient(to right, #6C757D, #8C8C8C);
  border-radius: 20px 0 0 20px;
}

.chart-bar.series {
  background: linear-gradient(to right, #EC66A4, #D14B89);
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 0 20px 20px 0;
}

.chart-label {
  font-weight: 600;
  margin-right: 10px;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.chart-value {
  font-weight: 900;
}

/* Historique des combats récents */
.recent-battles {
  margin-top: 40px;
}

.recent-battles h3 {
  font-size: 1.3rem;
  margin-bottom: 20px;
  color: #e5e5e5;
}

.battles-timeline {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  max-width: 1000px;
  margin: 0 auto;
}

.battle-card {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 10px;
  padding: 12px;
  transition: all 0.3s ease;
}

.battle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.battle-date {
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 10px;
}

.battle-contenders {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.battle-winner, .battle-loser {
  width: 80px;
  height: 120px;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
}

.battle-winner img, .battle-loser img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.battle-vs {
  font-weight: 900;
  color: #6C757D;
}

.winner-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  background: #EC66A4;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
}

.battle-titles {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 10px;
}

.winner-title, .loser-title {
  max-width: 80px;
}

.winner-title {
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loser-title {
  color: #aaa;
  text-align: right;
}

@media (max-width: 1200px) {
  .battles-timeline {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .glitch-text {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .stats-container {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .stat-card {
    max-width: none;
  }
  
  .battles-timeline {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import VersusCard from '@/components/VersusCard.vue';
import { useApi } from '@/composables/useApi';

const { fetchPopularMovies, fetchPopularTVShows } = useApi();

const isLoading = ref(false);
const currentVersus = ref({
  leftMedia: null,
  rightMedia: null
});
const versusHistory = ref([]);
const popularMovies = ref([]);
const popularTVShows = ref([]);
const error = ref(null);

// Calcul des statistiques
const movieWins = computed(() => {
  return versusHistory.value.filter(v => v.winner.type === 'movie').length;
});

const tvWins = computed(() => {
  return versusHistory.value.filter(v => v.winner.type === 'tv').length;
});

const favoriteGenre = computed(() => {
  // Logique pour déterminer le genre favori
  return "Action";
});

const moviePercentage = computed(() => {
  if (versusHistory.value.length === 0) return 50;
  return Math.round((movieWins.value / versusHistory.value.length) * 100);
});

const tvPercentage = computed(() => {
  if (versusHistory.value.length === 0) return 50;
  return Math.round((tvWins.value / versusHistory.value.length) * 100);
});

const recentBattles = computed(() => {
  // Retourne les 4 derniers combats
  return versusHistory.value.slice(0, 4).map(battle => {
    return {
      date: battle.date,
      winner: battle.winner,
      loser: battle.loser
    };
  });
});

// Fonction pour obtenir un élément aléatoire d'un tableau
const getRandomItem = (array) => {
  if (!array || array.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// Fonction pour obtenir un film aléatoire qui n'est pas déjà utilisé
const getRandomMedia = (mediaArray, excludeId = null) => {
  if (!mediaArray || mediaArray.length === 0) return null;
  
  // Filtrer les médias déjà utilisés récemment
  const recentMediaIds = versusHistory.value.slice(0, 5).flatMap(battle => 
    battle.winner && battle.loser ? [battle.winner.id, battle.loser.id] : []
  );
  
  let availableMedia = mediaArray.filter(media => 
    !recentMediaIds.includes(media.id) && media.id !== excludeId
  );
  
  // Si pas assez de médias disponibles, utiliser tous les médias sauf celui exclu
  if (availableMedia.length < 2) {
    availableMedia = mediaArray.filter(media => media.id !== excludeId);
  }
  
  return getRandomItem(availableMedia);
};

// Méthodes
const setupNewVersus = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Utiliser des données de secours si l'API échoue
    const fallbackMovies = [
      {
        id: 1,
        title: "Fight Club",
        year: "1999",
        rating: "8.8",
        type: "movie",
        posterPath: "https://image.tmdb.org/t/p/w500/qVdrYN8qu7xUtsdEFeGiIVIaYd.jpg"
      },
      {
        id: 2,
        title: "Pulp Fiction",
        year: "1994",
        rating: "8.9",
        type: "movie",
        posterPath: "https://image.tmdb.org/t/p/w500/8kSerJrhrJWKLk1LViesGcnrUPE.jpg"
      },
      {
        id: 3,
        title: "The Godfather",
        year: "1972",
        rating: "9.2",
        type: "movie",
        posterPath: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"
      }
    ];
    
    const fallbackTVShows = [
      {
        id: 101,
        title: "Breaking Bad",
        year: "2008",
        rating: "9.5",
        type: "tv",
        posterPath: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg"
      },
      {
        id: 102,
        title: "Game of Thrones",
        year: "2011",
        rating: "9.3",
        type: "tv",
        posterPath: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg"
      },
      {
        id: 103,
        title: "Stranger Things",
        year: "2016",
        rating: "8.7",
        type: "tv",
        posterPath: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg"
      }
    ];
    
    // Si nous n'avons pas encore de films/séries populaires, les charger
    if (popularMovies.value.length === 0) {
      try {
        const moviesResponse = await fetchPopularMovies();
        if (moviesResponse && moviesResponse.results && moviesResponse.results.length > 0) {
          popularMovies.value = moviesResponse.results.map(movie => ({
            id: movie.id,
            title: movie.title || "Film sans titre",
            year: movie.release_date ? movie.release_date.substring(0, 4) : '',
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : '?',
            type: 'movie',
            posterPath: movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null
          }));
        } else {
          console.warn("Aucun film reçu de l'API, utilisation des données de secours");
          popularMovies.value = fallbackMovies;
        }
      } catch (err) {
        console.error("Erreur lors du chargement des films", err);
        popularMovies.value = fallbackMovies;
      }
    }
    
    if (popularTVShows.value.length === 0) {
      try {
        const tvResponse = await fetchPopularTVShows();
        if (tvResponse && tvResponse.results && tvResponse.results.length > 0) {
          popularTVShows.value = tvResponse.results.map(show => ({
            id: show.id,
            title: show.name || "Série sans titre",
            year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
            rating: show.vote_average ? show.vote_average.toFixed(1) : '?',
            type: 'tv',
            posterPath: show.poster_path 
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : null
          }));
        } else {
          console.warn("Aucune série reçue de l'API, utilisation des données de secours");
          popularTVShows.value = fallbackTVShows;
        }
      } catch (err) {
        console.error("Erreur lors du chargement des séries", err);
        popularTVShows.value = fallbackTVShows;
      }
    }
    
    // Vérifier que nous avons bien des médias à afficher
    if (popularMovies.value.length === 0 && popularTVShows.value.length === 0) {
      throw new Error("Aucun média disponible pour le duel");
    }
    
    // Sélectionner aléatoirement un film et une série
    const randomChoice = Math.random();
    let leftMedia, rightMedia;
    
    if (randomChoice < 0.33 && popularMovies.value.length >= 2) {
      // Film vs Film
      leftMedia = getRandomMedia(popularMovies.value);
      rightMedia = getRandomMedia(popularMovies.value, leftMedia?.id);
    } else if (randomChoice < 0.66 && popularTVShows.value.length >= 2) {
      // Série vs Série
      leftMedia = getRandomMedia(popularTVShows.value);
      rightMedia = getRandomMedia(popularTVShows.value, leftMedia?.id);
    } else {
      // Film vs Série
      if (popularMovies.value.length > 0 && popularTVShows.value.length > 0) {
        leftMedia = getRandomMedia(popularMovies.value);
        rightMedia = getRandomMedia(popularTVShows.value);
      } else if (popularMovies.value.length >= 2) {
        leftMedia = getRandomMedia(popularMovies.value);
        rightMedia = getRandomMedia(popularMovies.value, leftMedia?.id);
      } else if (popularTVShows.value.length >= 2) {
        leftMedia = getRandomMedia(popularTVShows.value);
        rightMedia = getRandomMedia(popularTVShows.value, leftMedia?.id);
      } else {
        throw new Error("Pas assez de médias pour créer un duel");
      }
    }
    
    // Vérifier que nous avons bien deux médias différents
    if (!leftMedia || !rightMedia) {
      throw new Error("Impossible de sélectionner deux médias différents");
    }
    
    currentVersus.value = {
      leftMedia,
      rightMedia
    };
    
  } catch (err) {
    console.error("Erreur lors du chargement des médias", err);
    error.value = err.message || "Une erreur est survenue";
    currentVersus.value = { leftMedia: null, rightMedia: null };
  } finally {
    isLoading.value = false;
  }
};

const handleWinnerSelected = (winner) => {
  // Déterminer le perdant
  const loser = winner === 'left' 
    ? currentVersus.value.rightMedia 
    : currentVersus.value.leftMedia;
  
  // Ajouter à l'historique
  versusHistory.value.unshift({
    date: new Date(),
    winner: winner === 'left' ? currentVersus.value.leftMedia : currentVersus.value.rightMedia,
    loser: loser
  });
  
  // Charger un nouveau duel
  setupNewVersus();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

// Initialisation
onMounted(() => {
  setupNewVersus();
  
  // Initialiser les particules (nécessite particles.js)
  if (window.particlesJS) {
    window.particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
          resize: true
        }
      },
      retina_detect: true
    });
  }
});
</script> 