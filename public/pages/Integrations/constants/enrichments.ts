export const ALLOWED_ENRICHMENTS = [
  'geo',
  'hash_sha256',
  'hash_sha1',
  'hash_md5',
  'url_domain',
  'url_full',
  'connection',
] as const;

export type EnrichmentType = typeof ALLOWED_ENRICHMENTS[number];

export const ENRICHMENT_LABELS: Record<EnrichmentType, string> = {
  geo: 'Geolocation',
  connection: 'Connection',
  url_full: 'URL full',
  url_domain: 'URL domain',
  hash_md5: 'Hash MD5',
  hash_sha1: 'Hash SHA1',
  hash_sha256: 'Hash SHA256',
};
