<script setup lang="ts">
import { Mail, Phone, MapPin } from '@lucide/vue'
import logo from '@/assets/logo.png'
</script>

<template>
  <footer class="bg-[var(--bg-surface)] border-t border-[var(--border-default)]">
    <div class="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="rounded-2xl bg-[var(--bg-raised)] border border-[var(--border-default)] px-6 py-8 md:px-10 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div class="flex items-center gap-3">
            <img :src="logo" alt="Obras & Serviços" class="h-16 w-auto" />
            <span class="text-2xl font-extrabold tracking-tight">Obras &amp; <span class="text-[var(--accent-gold)]">Serviços</span></span>
          </div>

          <div class="flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram"
              class="w-11 h-11 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743] hover:border-transparent transition-all duration-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.95c-3.13 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.61-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.61.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.61.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.61-.07-4.74-.07zm0 3.32a4.57 4.57 0 1 1 0 9.14 4.57 4.57 0 0 1 0-9.14zm0 7.54a2.97 2.97 0 1 0 0-5.94 2.97 2.97 0 0 0 0 5.94zm5.82-7.76a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0z"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook"
              class="w-11 h-11 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-[#1877F2] hover:border-transparent transition-all duration-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
            </a>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="mailto:contato@obraseservicos.com.br"
            class="group flex items-center gap-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] px-4 py-3 text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors">
            <span class="p-2 rounded-lg bg-[var(--bg-raised)] group-hover:bg-[var(--accent-gold)] group-hover:text-[var(--text-on-accent)] transition-colors">
              <Mail class="w-4 h-4" />
            </span>
            <span class="text-sm">contato@obraseservicos.com.br</span>
          </a>
          <a href="tel:+551140028922"
            class="group flex items-center gap-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] px-4 py-3 text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors">
            <span class="p-2 rounded-lg bg-[var(--bg-raised)] group-hover:bg-[var(--accent-gold)] group-hover:text-[var(--text-on-accent)] transition-colors">
              <Phone class="w-4 h-4" />
            </span>
            <span class="text-sm">(67) 99999-9999</span>
          </a>
          <div class="flex items-center gap-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] px-4 py-3 text-[var(--text-muted)]">
            <span class="p-2 rounded-lg bg-[var(--bg-raised)]">
              <MapPin class="w-4 h-4" />
            </span>
            <span class="text-sm">Maracaju, MS - Brasil</span>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <p class="text-center text-[var(--text-subtle)] text-sm">© 2026 Obras &amp; Serviços. Todos os direitos reservados.</p>
      </div>

      <div class="mt-6 pt-5 border-t border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-xs text-[var(--text-subtle)]">
        <span class="flex items-center gap-4">
          <a href="#" class="hover:text-[var(--accent-gold)] transition-colors">Termos de Uso</a>
          <a href="#" class="hover:text-[var(--accent-gold)] transition-colors">Política de Privacidade</a>
          <a href="#" class="hover:text-[var(--accent-gold)] transition-colors">Cookies</a>
        </span>
        <span>Feito no Brasil</span>
      </div>
    </div>
  </footer>
</template>
