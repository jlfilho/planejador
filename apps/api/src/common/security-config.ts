import { InternalServerErrorException } from '@nestjs/common';

const N8N_WEBHOOK_ENDPOINT = 'https://jlfilho.app.n8n.cloud/webhook/agente-planejador-bncc';

export function accessTokenSecret(): string {
  const value = process.env.JWT_ACCESS_SECRET;
  if (!value || value.length < 32) {
    throw new InternalServerErrorException('Secure JWT configuration is required');
  }
  return value;
}

export function webOrigin(): string {
  const value = process.env.WEB_ORIGIN;
  try {
    const parsed = value ? new URL(value) : undefined;
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== value) {
      throw new Error('Invalid WEB_ORIGIN');
    }
    return value;
  } catch {
    throw new InternalServerErrorException('Secure CORS configuration is required');
  }
}

export function assertSameSiteRefreshTopology(): void {
  const apiValue = process.env.API_PUBLIC_ORIGIN ?? (isProduction() ? undefined : `http://localhost:${process.env.PORT ?? 3001}`);
  try {
    const web = new URL(webOrigin());
    const api = apiValue ? new URL(apiValue) : undefined;
    if (!api || api.origin !== apiValue || web.hostname !== api.hostname || web.protocol !== api.protocol) {
      throw new Error('Cross-site refresh cookie');
    }
  } catch {
    throw new InternalServerErrorException('Same-site refresh cookie configuration is required');
  }
}

export function isProduction(): boolean { return process.env.NODE_ENV === 'production'; }

export function n8nWebhookUrl(): string {
  const value = process.env.N8N_WEBHOOK_URL;
  if (value !== N8N_WEBHOOK_ENDPOINT) {
    throw new InternalServerErrorException('Secure n8n integration configuration is required');
  }
  return value;
}

export function n8nIntegrationSecret(): string {
  const value = process.env.N8N_INTEGRATION_SECRET;
  if (!value || value.length < 32) {
    throw new InternalServerErrorException('Secure n8n integration configuration is required');
  }
  return value;
}

export function n8nAuthHeaderName(): string {
  const value = process.env.N8N_AUTH_HEADER_NAME;
  if (!value || !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(value)) {
    throw new InternalServerErrorException('Secure n8n integration configuration is required');
  }
  return value;
}

export function n8nTimeoutMs(): number {
  const value = Number(process.env.N8N_TIMEOUT_MS ?? 15000);
  if (!Number.isInteger(value) || value < 1 || value > 30000) {
    throw new InternalServerErrorException('Secure n8n integration configuration is required');
  }
  return value;
}
