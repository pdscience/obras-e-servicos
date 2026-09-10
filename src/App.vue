<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import SidebarMenu from './components/SidebarMenu.vue'
import Toast from 'primevue/toast'

const auth = useAuthStore()
const route = useRoute()

const showHeaderFooter = computed(() => {
  const noLayoutRoutes = ['login', 'register', 'register-professional']
  return !noLayoutRoutes.includes(route.name as string)
})

const showSidebar = computed(() => showHeaderFooter.value && route.name !== 'home' && auth.isLoggedIn)

onMounted(() => {
  auth.ensureInitialized()
})
</script>

<template>
  <Toast appendTo="body" />
  <div class="palantir-platform">
    <template v-if="showHeaderFooter">
      <div class="app-shell">
        <SidebarMenu v-if="showSidebar" />
        <div class="app-shell-main">
          <Header />
          <main class="app-shell-content">
            <RouterView />
          </main>
          <Footer />
        </div>
      </div>
    </template>
    <RouterView v-else />
  </div>
</template>
