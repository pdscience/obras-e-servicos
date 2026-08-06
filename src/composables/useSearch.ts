import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { Professional, Filters } from '../types'
import { calcularDistancia } from '../utils/distance'

export function useSearch(professionals: Ref<Professional[]>) {
  const searchTerm = ref('')
  const location = ref('')
  const sortBy = ref('rating')
  const filters = ref<Filters>({
    minRating: 0, maxPrice: 200, minExperience: 0,
    verified: false, available: false, radius: 0,
  })
  const currentPage = ref(1)
  const pageSize = ref(12)

  const filteredProfessionals = computed(() => {
    let result = [...professionals.value]

    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      result = result.filter(p =>
        p.category.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term) ||
        p.specialties.some(s => s.toLowerCase().includes(term)) ||
        p.description.toLowerCase().includes(term) ||
        p.certifications.some(c => c.toLowerCase().includes(term))
      )
    }

    if (filters.value.category) {
      result = result.filter(p => p.category === filters.value.category)
    }

    if (filters.value.subcategory) {
      result = result.filter(p => p.subcategory === filters.value.subcategory)
    }

    if (location.value) {
      result = result.filter(p => p.uf === location.value)
    }

    if (filters.value.lat != null && filters.value.lng != null && filters.value.radius && filters.value.radius > 0) {
      result = result.map(p => ({
        ...p,
        distance: calcularDistancia(
          filters.value.lat!, filters.value.lng!,
          p.lat, p.lng
        ),
      })).filter(p => p.distance! <= filters.value.radius!)
    }

    if (filters.value.minRating && filters.value.minRating > 0) {
      result = result.filter(p => p.rating >= filters.value.minRating!)
    }
    if (filters.value.maxPrice) {
      result = result.filter(p => p.pricePerHour <= filters.value.maxPrice!)
    }
    if (filters.value.minExperience && filters.value.minExperience > 0) {
      result = result.filter(p => p.yearsExperience >= filters.value.minExperience!)
    }
    if (filters.value.verified) result = result.filter(p => p.verified)
    if (filters.value.available) result = result.filter(p => p.available)

    switch (sortBy.value) {
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      case 'price-low': result.sort((a, b) => a.pricePerHour - b.pricePerHour); break
      case 'price-high': result.sort((a, b) => b.pricePerHour - a.pricePerHour); break
      case 'experience': result.sort((a, b) => b.yearsExperience - a.yearsExperience); break
      case 'reviews': result.sort((a, b) => b.reviewCount - a.reviewCount); break
      case 'distance':
        result.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999))
        break
    }

    return result
  })

  const paginatedResults = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredProfessionals.value.slice(start, start + pageSize.value)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredProfessionals.value.length / pageSize.value)
  )

  function clearFilters() {
    filters.value = {
      minRating: 0, maxPrice: 200, minExperience: 0,
      verified: false, available: false, radius: 0,
    }
    location.value = ''
    searchTerm.value = ''
    currentPage.value = 1
  }

  return {
    searchTerm, location, sortBy, filters,
    currentPage, pageSize,
    filteredProfessionals, paginatedResults, totalPages,
    clearFilters,
  }
}
