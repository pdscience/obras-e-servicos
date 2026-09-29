<template>
  <!-- ==========================================
       FAQ
       ========================================== -->
  <section class="section section--white" id="faq">
    <div class="container">
      <div class="section__header" style="text-align: center;">
        <h2 class="section__title">Perguntas Frequentes (FAQ)</h2>
        <p class="section__subtitle">Tire suas dúvidas sobre o funcionamento da plataforma OS – Obras & Serviços</p>
      </div>

      <div class="faq-list" style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; padding-bottom: 40px;">
        <details>
          <summary>1. O que é a plataforma OS – Obras & Serviços?</summary>
          <p>É uma plataforma digital que conecta clientes que precisam de serviços ou materiais de construção a profissionais e lojistas (fornecedores) da região, facilitando negociações diretas e com total praticidade.</p>
        </details>

        <details>
          <summary>2. Como faço para me cadastrar (como cliente, profissional ou lojista)?</summary>
          <p>O processo varia conforme o seu perfil:<br><br>
          • <b>Para Clientes:</b> O cadastro é totalmente gratuito. Basta acessar a plataforma, criar sua conta em poucos cliques e começar a buscar profissionais ou lojistas imediatamente.<br>
          • <b>Para Profissionais e Lojistas (Anunciantes):</b> O cadastro inicial é simples e o acesso para expor seus serviços ou produtos funciona por meio de planos de assinatura. Você escolhe a opção que melhor se encaixa no seu momento (com diferentes benefícios, limites de portfólio, destaque ou catálogo) para garantir sua visibilidade na região.</p>
        </details>

        <details>
          <summary>3. Como faço para contratar um profissional?</summary>
          <p>Basta fazer um cadastro simples, buscar pelo serviço desejado informando sua localização, comparar os perfis, avaliações e portfólios disponíveis, e solicitar orçamentos ou entrar em contato para negociar e fechar o trabalho.</p>
        </details>

        <details>
          <summary>4. Como os clientes entram em contato com os profissionais?</summary>
          <p>Os clientes dispõem de duas formas para iniciar o contato:<br><br>
          1. <b>Contato Direto via WhatsApp:</b> O cliente acessa o perfil do profissional e utiliza o botão do WhatsApp integrado para conversar instantaneamente, garantindo agilidade e negociação sem intermediários.<br>
          2. <b>Solicitação de Orçamento:</b> O cliente elabora um pedido detalhado de orçamento e o dispara para os profissionais qualificados da região, ou escolhe um profissional específico e envia a solicitação diretamente pela plataforma.</p>
        </details>

        <details>
          <summary>5. O profissional ou lojista tem acesso imediato ao meu número de WhatsApp?</summary>
          <p>Não. O seu número de WhatsApp permanece totalmente privado e seguro. O profissional ou lojista recebe a solicitação de orçamento na plataforma, mas só terá acesso ao seu contato quando você decidir iniciar a conversa ou responder a um orçamento enviado por ele. Dessa forma, você evita mensagens indesejadas e tem total controle sobre a comunicação.</p>
        </details>

        <details>
          <summary>6. A plataforma cobra comissão dos profissionais sobre os serviços prestados?</summary>
          <p>Não. A conexão e a negociação de valores e formas de pagamento ocorrem de forma direta entre cliente e prestador, sem taxas intermediárias ou cobrança de comissão por serviço fechado.</p>
        </details>

        <details>
          <summary>7. Como funcionam os planos para profissionais?</summary>
          <p>O profissional escolhe o plano ideal para suas necessidades, podendo cadastrar suas profissões, fotos de portfólio e escritório virtual. Tudo isso de forma flexível, sem fidelidade e com a liberdade de cancelar quando quiser.</p>
        </details>

        <details>
          <summary>8. O que o lojista (fornecedor) pode fazer na plataforma?</summary>
          <p>O lojista conta com um perfil exclusivo de fornecedor para cadastrar seu catálogo de produtos, divulgar promoções com banners personalizados, cadastrar o WhatsApp dos vendedores para contato direto, receber pedidos digitais e atrair clientes locais.</p>
        </details>

        <details>
          <summary>9. Como os lojistas recebem oportunidades de vendas?</summary>
          <p>Através de geolocalização otimizada, a plataforma conecta o lojista a clientes e profissionais da mesma região que estão ativamente construindo ou reformando e precisam de insumos com urgência.</p>
        </details>

        <details>
          <summary>10. Quais são as vantagens para os Lojistas?</summary>
          <p>Participar da plataforma como lojista parceiro traz vantagens competitivas essenciais para acelerar o seu negócio na região:<br><br>
          • <b>Vitrine Digital de Alto Impacto:</b> Exponha seu catálogo completo de produtos e crie banners personalizados para destacar promoções e ofertas especiais diretamente para quem está comprando.<br>
          • <b>Geolocalização Estratégica:</b> Seja encontrado exatamente por quem está construindo ou reformando no seu raio de atendimento, otimizando a logística de entrega.<br>
          • <b>Leads Qualificados de Obras:</b> Conecte-se com profissionais da construção civil e clientes finais que já possuem demanda real e urgente por materiais.<br>
          • <b>Canais de Vendas Diretos:</b> Receba pedidos digitais de forma prática e facilite o atendimento comercial da sua equipe com links diretos de WhatsApp para fechamento rápido, sem taxas de comissão por venda.</p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: 16px 0;
}

.section__title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.section__subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

.faq-list details {
  background: #ffffff;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}
.faq-list details:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: var(--color-accent, #d4af37);
}
.faq-list details[open] {
  border-color: var(--color-accent, #d4af37);
  background: #fafafa;
}
.faq-list summary {
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text, #111827);
  outline: none;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.125rem;
}
.faq-list summary::-webkit-details-marker {
  display: none;
}
.faq-list summary::after {
  content: "+";
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--color-accent, #d4af37);
  transition: transform 0.3s ease;
}
.faq-list details[open] summary::after {
  content: "−";
  transform: rotate(180deg);
}
.faq-list p {
  margin-top: 16px;
  color: var(--color-text-secondary, #4b5563);
  line-height: 1.7;
  font-size: 1rem;
  animation: fadeIn 0.4s ease-in-out;
  padding-right: 20px;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
