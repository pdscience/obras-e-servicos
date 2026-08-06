<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, HelpCircle } from '@lucide/vue'

const openIndex = ref<number | null>(0)

const faqs = [
  { question: 'Como funciona o pagamento seguro?', answer: 'O Obras & Serviços utiliza um sistema de escrow (custódia) onde o pagamento fica retido até a conclusão do serviço. Quando você aprova o trabalho realizado, o valor é liberado automaticamente para o profissional.' },
  { question: 'Os profissionais são verificados?', answer: 'Sim! Todos os profissionais passam por um processo de verificação que inclui validação de documentos (CPF/CNPJ), confirmação de telefone e e-mail, e análise de antecedentes quando aplicável.' },
  { question: 'Quanto custa para usar a plataforma?', answer: 'Para clientes, o uso é totalmente gratuito. Você pode solicitar quantos orçamentos quiser sem pagar nada. Para profissionais, oferecemos um plano gratuito com funcionalidades básicas e planos pagos.' },
  { question: 'E se eu não ficar satisfeito com o serviço?', answer: 'Temos um sistema de mediação de disputas. Se houver qualquer problema, você pode abrir uma solicitação e nossa equipe irá analisar o caso.' },
  { question: 'Posso agendar serviços para qualquer dia?', answer: 'A disponibilidade depende de cada profissional. Ao solicitar um orçamento, você pode indicar suas datas preferenciais e o profissional confirmará se está disponível.' },
  { question: 'Como são calculadas as avaliações?', answer: 'As avaliações são feitas pelos clientes após a conclusão de cada serviço. A nota final é uma média ponderada que considera qualidade do serviço, pontualidade, comunicação e custo-benefício.' }
]
</script>

<template>
  <section class="py-16 md:py-24" style="background:var(--bg-page)">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-[color-mix(in srgb,var(--accent-gold) 10%,transparent)] rounded-xl mb-4">
          <HelpCircle class="w-7 h-7 text-[var(--accent-gold)]" />
        </div>
        <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">Perguntas Frequentes</h2>
        <p class="text-[var(--text-muted)]">Tire suas dúvidas sobre o funcionamento da plataforma</p>
      </div>

      <div class="space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="bg-[var(--bg-raised)] border border-[var(--border-default)] rounded-xl overflow-hidden"
        >
          <button
            @click="openIndex = openIndex === index ? null : index"
            class="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <span class="font-medium text-[var(--text-secondary)] pr-4">{{ faq.question }}</span>
            <ChevronDown
              :class="['w-5 h-5 text-[var(--text-subtle)] flex-shrink-0 transition-transform', openIndex === index ? 'rotate-180' : '']"
            />
          </button>
          <div v-if="openIndex === index" class="px-6 pb-4">
            <p class="text-[var(--text-muted)] leading-relaxed">{{ faq.answer }}</p>
          </div>
        </div>
      </div>

      <div class="text-center mt-10">
        <p class="text-[var(--text-muted)] mb-4">Não encontrou o que procurava?</p>
        <button class="px-6 py-3 bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-medium rounded-xl hover:shadow-lg transition-colors">Fale com o Suporte</button>
      </div>
    </div>
  </section>
</template>
