import { onMounted, onUnmounted, type Ref } from 'vue'

export function useScrollReveal(root: Ref<HTMLElement | null | undefined>) {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const el = root.value
    if (!el) return
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node) => observer?.observe(node))
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}