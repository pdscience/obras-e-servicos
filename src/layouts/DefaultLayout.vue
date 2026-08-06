<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="palantir-platform">
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </div>
</template>
