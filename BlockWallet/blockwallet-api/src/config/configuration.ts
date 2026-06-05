export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    accessToken: process.env.SUPABASE_ACCESS_TOKEN,
  },
  coingecko: {
    baseUrl: process.env.COINGECKO_BASE_URL ?? 'https://api.coingecko.com/api/v3',
    apiKey: process.env.COINGECKO_API_KEY ?? '',
    syncTopN: parseInt(process.env.COINGECKO_SYNC_TOP_N ?? '100', 10),
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '60', 10),
  },
});
