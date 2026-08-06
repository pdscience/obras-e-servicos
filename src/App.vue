<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { seedCategoriasProfissoes, migrarPlanos } from './services/api'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Toast from 'primevue/toast'

const auth = useAuthStore()
const route = useRoute()

const showHeaderFooter = computed(() => {
  const noLayoutRoutes = ['login', 'register', 'register-professional']
  return !noLayoutRoutes.includes(route.name as string)
})

onMounted(() => {
  auth.init()
  seedCategoriasProfissoes().catch(() => {})
  migrarPlanos().catch(() => {})
})
</script>

<template>
  <Toast appendTo="body" />
  <div class="palantir-platform">
    <Header v-if="showHeaderFooter" />
    <RouterView />
    <Footer v-if="showHeaderFooter" />
  </div>
</template>
