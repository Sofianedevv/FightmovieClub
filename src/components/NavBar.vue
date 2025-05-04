<template>
  <nav class="navbar">
    <div class="navbar-content">
      <div class="logo">
        <router-link to="/">
          <span class="logo-text">FIGHT<span class="logo-highlight">CLUB</span></span>
        </router-link>
      </div>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link" active-class="active">
          <span>Accueil</span>
        </router-link>
        <router-link to="/versus" class="nav-link" active-class="active">
          <span>Versus</span>
        </router-link>
        <router-link to="/tinder" class="nav-link" active-class="active">
          <span>Découvrir</span>
        </router-link>
        <router-link to="/history" class="nav-link" active-class="active">
          <span>Historique</span>
        </router-link>
        <router-link to="/favorites" class="nav-link" active-class="active">
          <span>Favoris</span>
        </router-link>
      </div>
      
      <div class="nav-right">
        <div class="search-icon" @click="goToHome">
          <i class="fas fa-search"></i>
        </div>
        <div class="user-profile">
          <img src="https://i.pravatar.cc/150?img=12" alt="Profil" class="profile-img">
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0;
  transition: background-color 0.3s ease;
}

.navbar.scrolled {
  background-color: var(--black);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 4%;
  max-width: 1920px;
  margin: 0 auto;
}

.logo a {
  text-decoration: none;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: white;
  transition: all 0.3s ease;
}

.logo-text {
  position: relative;
}

.logo-highlight {
  color: #ADB5BD;
  text-shadow: none;
  transition: all 0.5s ease;
}

.logo:hover .logo-highlight {
  color: #EC66A4;
  text-shadow: 0 0 10px rgba(236, 102, 164, 0.7),
               0 0 20px rgba(236, 102, 164, 0.5),
               0 0 30px rgba(236, 102, 164, 0.3);
  animation: logo-pulse 1.5s infinite;
}

@keyframes logo-pulse {
  0% {
    text-shadow: 0 0 10px rgba(236, 102, 164, 0.7),
                 0 0 20px rgba(236, 102, 164, 0.5);
  }
  50% {
    text-shadow: 0 0 15px rgba(236, 102, 164, 0.9),
                 0 0 30px rgba(236, 102, 164, 0.7),
                 0 0 45px rgba(236, 102, 164, 0.5);
  }
  100% {
    text-shadow: 0 0 10px rgba(236, 102, 164, 0.7),
                 0 0 20px rgba(236, 102, 164, 0.5);
  }
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #e5e5e5;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.5s ease;
  font-weight: 500;
  padding: 8px 15px;
  position: relative;
  z-index: 1;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, rgba(236, 102, 164, 0.4), rgba(236, 102, 164, 0.8));
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s ease;
}

.nav-link:hover, .nav-link.active {
  color: #fff;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5),
               0 0 10px rgba(236, 102, 164, 0.3);
}

.nav-link:hover::before, .nav-link.active::before {
  transform: scaleX(1);
  transform-origin: left;
}

.nav-link.active {
  border-bottom: none;
}

@keyframes nav-neon-pulse {
  0% {
    text-shadow: 0 0 5px rgba(236, 102, 164, 0.5),
                 0 0 10px rgba(236, 102, 164, 0.3);
  }
  50% {
    text-shadow: 0 0 10px rgba(236, 102, 164, 0.7),
                 0 0 20px rgba(236, 102, 164, 0.5),
                 0 0 30px rgba(236, 102, 164, 0.3);
  }
  100% {
    text-shadow: 0 0 5px rgba(236, 102, 164, 0.5),
                 0 0 10px rgba(236, 102, 164, 0.3);
  }
}

.nav-link.active {
  animation: nav-neon-pulse 2s infinite;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-icon {
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
}

.user-profile {
  cursor: pointer;
}

.profile-img {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .navbar-content {
    padding: 12px 4%;
  }
  
  .logo a {
    font-size: 1.5rem;
  }
}
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const goToHome = () => {
  router.push('/');
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script> 