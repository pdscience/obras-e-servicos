-- Assinaturas Asaas + idempotência de webhooks.
-- Aplica via painel InsForge / CLI. Idempotente (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT NOT NULL,
  perfil_id TEXT NOT NULL,
  tipo_perfil TEXT NOT NULL DEFAULT 'profissional',
  plano TEXT NOT NULL,
  asaas_customer_id TEXT,
  asaas_checkout_id TEXT,
  asaas_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_usuario ON assinaturas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_perfil ON assinaturas (perfil_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_checkout ON assinaturas (asaas_checkout_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_subscription ON assinaturas (asaas_subscription_id);

-- Eventos de webhook já processados (entrega at-least-once do Asaas).
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
