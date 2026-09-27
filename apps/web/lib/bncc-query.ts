export type CatalogQuery = { levelId?: string; stageId?: string; year?: number; axis?: string; q?: string; page?: number; pageSize?: number };
export const serializeQuery = (query: CatalogQuery) => { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); }); return params.toString(); };
