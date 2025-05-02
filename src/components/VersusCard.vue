<template>
  <div class="versus-container">
    <div class="media-cards">
      <transition
        name="swipe-left"
        @after-leave="handleLeftTransitionComplete"
      >
        <div 
          v-if="!leftSwiped"
          class="media-card netflix-card left" 
          @click="selectWinner('left')"
        >
          <div class="card-image">
            <img 
              v-if="leftMedia.posterPath" 
              :src="leftMedia.posterPath" 
              :alt="leftMedia.title" 
            />
            <div v-else class="no-poster">
              <span>{{ leftMedia.title }}</span>
            </div>
          </div>
          <div class="media-info">
            <h3>{{ leftMedia.title }}</h3>
            <div class="media-meta">
              <span class="media-year">{{ leftMedia.year }}</span>
              <span class="media-rating" v-if="leftMedia.rating">
                <i class="fas fa-star"></i> {{ leftMedia.rating }}
              </span>
            </div>
          </div>
          <div class="card-hover-overlay">
            <div class="select-text">SÉLECTIONNER</div>
          </div>
        </div>
      </transition>
      
      <div class="versus-divider">
        <span>VS</span>
      </div>
      
      <transition
        name="swipe-right"
        @after-leave="handleRightTransitionComplete"
      >
        <div 
          v-if="!rightSwiped"
          class="media-card netflix-card right" 
          @click="selectWinner('right')"
        >
          <div class="card-image">
            <img 
              v-if="rightMedia.posterPath" 
              :src="rightMedia.posterPath" 
              :alt="rightMedia.title" 
            />
            <div v-else class="no-poster">
              <span>{{ rightMedia.title }}</span>
            </div>
          </div>
          <div class="media-info">
            <h3>{{ rightMedia.title }}</h3>
            <div class="media-meta">
              <span class="media-year">{{ rightMedia.year }}</span>
              <span class="media-rating" v-if="rightMedia.rating">
                <i class="fas fa-star"></i> {{ rightMedia.rating }}
              </span>
            </div>
          </div>
          <div class="card-hover-overlay">
            <div class="select-text">SÉLECTIONNER</div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  leftMedia: {
    type: Object,
    required: true
  },
  rightMedia: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['winner-selected']);

const leftSwiped = ref(false);
const rightSwiped = ref(false);
const winner = ref(null);
const loser = ref(null);

const selectWinner = (side) => {
  if (leftSwiped.value || rightSwiped.value) return; // Éviter les clics multiples
  
  if (side === 'left') {
    leftSwiped.value = true;
    winner.value = props.leftMedia;
    loser.value = props.rightMedia;
  } else {
    rightSwiped.value = true;
    winner.value = props.rightMedia;
    loser.value = props.leftMedia;
  }
};

const handleLeftTransitionComplete = () => {
  if (winner.value && loser.value) {
    emit('winner-selected', winner.value, loser.value);
    resetState();
  }
};

const handleRightTransitionComplete = () => {
  if (winner.value && loser.value) {
    emit('winner-selected', winner.value, loser.value);
    resetState();
  }
};

const resetState = () => {
  leftSwiped.value = false;
  rightSwiped.value = false;
  winner.value = null;
  loser.value = null;
};
</script>

<style scoped>
.versus-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
}

.media-cards {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
  margin-bottom: 30px;
}

.media-card {
  flex: 1;
  max-width: 300px;
  background: rgba(30, 30, 30, 0.7);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  cursor: pointer;
}

.media-poster {
  width: 100%;
  height: 400px;
  object-fit: cover;
  transition: all 0.4s ease;
}

.media-card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.media-card.selected {
  box-shadow: 0 15px 30px rgba(108, 117, 125, 0.4);
  transform: translateY(-15px) scale(1.03);
  border: 2px solid #6C757D;
}

.card-image {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 150%;
  overflow: hidden;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.no-poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--medium-gray), var(--dark-gray));
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: #ddd;
  padding: 20px;
  text-align: center;
}

.card-overlay {
  display: none;
}

.media-info {
  padding: 15px;
}

.media-info h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.media-year {
  color: #aaa;
}

.media-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.media-rating i {
  color: #6C757D;
}

.versus-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: 900;
  color: #ADB5BD;
  text-shadow: none;
  position: relative;
  z-index: 10;
  text-transform: uppercase;
  margin: 0 -10px;
}

.versus-divider span {
  background-color: rgba(0, 0, 0, 0.7);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  border: 2px solid #6C757D;
}

.card-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(236, 102, 164, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(3px);
}

.media-card:hover .card-hover-overlay {
  opacity: 1;
}

.select-text {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.media-card:hover .select-text {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .media-cards {
    flex-direction: column;
    gap: 30px;
  }
  
  .versus-divider {
    margin: 10px 0;
  }
}

/* Transitions Vue.js */
.swipe-left-enter-active,
.swipe-left-leave-active,
.swipe-right-enter-active,
.swipe-right-leave-active {
  transition: all 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.swipe-left-enter-from {
  transform: translateX(-100%) rotate(-10deg);
  opacity: 0;
}

.swipe-left-leave-to {
  transform: translateX(-150%) rotate(-10deg) scale(0.8);
  opacity: 0;
}

.swipe-right-enter-from {
  transform: translateX(100%) rotate(10deg);
  opacity: 0;
}

.swipe-right-leave-to {
  transform: translateX(150%) rotate(10deg) scale(0.8);
  opacity: 0;
}

/* Ajustement pour le responsive */
@media (max-width: 768px) {
  .swipe-left-leave-to {
    transform: translateY(-150%) rotate(-10deg) scale(0.8);
  }
  
  .swipe-right-leave-to {
    transform: translateY(150%) rotate(10deg) scale(0.8);
  }
}
</style> 