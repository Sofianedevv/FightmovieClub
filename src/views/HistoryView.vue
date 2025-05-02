<template>
  <div class="history-container">
    <h1>Historique des duels</h1>
    <p>Votre historique de versus apparaîtra ici.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useVersusStore } from '@/stores/versus';

const versusStore = useVersusStore();
const versusHistory = computed(() => versusStore.getHistory.slice().reverse());

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
</script>

<style scoped>
.history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.empty-history {
  text-align: center;
  padding: 40px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.start-btn {
  display: inline-block;
  background-color: #42b883;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 15px;
  font-weight: bold;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-item {
  background-color: #f8f8f8;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.history-date {
  background-color: #2c3e50;
  color: white;
  padding: 10px 15px;
  font-size: 0.9rem;
}

.history-content {
  display: flex;
  padding: 15px;
  gap: 15px;
  align-items: center;
}

.winner, .loser {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
}

.winner img, .loser img {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.media-info {
  flex: 1;
}

.media-info h3 {
  margin: 0 0 10px;
  font-size: 1.1rem;
}

.winner-badge {
  display: inline-block;
  background-color: #42b883;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.versus-divider {
  font-weight: bold;
  color: #e74c3c;
  font-size: 1.2rem;
}
</style> 