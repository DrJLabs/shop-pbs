const LOCAL_PREVIEW_FALLBACK = 'http://127.0.0.1:9292';

export type EnvKey =
  | 'SHOP_URL'
  | 'BASE_URL'
  | 'SHOP_PASSWORD'
  | 'STOREFRONT_PASSWORD'
  | 'THEME_ID'
  | 'SHOPIFY_SHOP'
  | 'SHOPIFY_DEV_THEME_ID';

export type ShopContext = {
  baseUrl: string;
  previewUrl: string;
  shopOrigin: string;
  themeId?: string;
};

export function optionalEnv(primary: EnvKey, fallback: EnvKey[] = []): string | undefined {
  const keys: EnvKey[] = [primary, ...fallback];
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

export function resolveShopContext(): ShopContext {
  const baseCandidate = optionalEnv('BASE_URL', ['SHOP_URL']);

  if (!baseCandidate) {
    return fallbackContext();
  }

  try {
    const url = new URL(baseCandidate);
    const shopOrigin = url.origin;
    const urlThemeId = url.searchParams.get('preview_theme_id') ?? undefined;
    const themeId =
      urlThemeId ?? optionalEnv('THEME_ID', ['SHOPIFY_DEV_THEME_ID']) ?? undefined;

    const baseUrl = (() => {
      if (themeId) {
        url.searchParams.set('preview_theme_id', themeId);
        return url.toString();
      }
      return baseCandidate.replace(/\/+$/, '');
    })();

    const previewUrl = themeId ? `${shopOrigin}/?preview_theme_id=${themeId}` : shopOrigin;

    return {
      baseUrl,
      previewUrl,
      shopOrigin,
      themeId,
    };
  } catch (error) {
    console.warn('[shop-config] Unable to parse BASE_URL/SHOP_URL:', error);
    return fallbackContext();
  }
}

function fallbackContext(): ShopContext {
  const origin = new URL(LOCAL_PREVIEW_FALLBACK).origin;
  return {
    baseUrl: LOCAL_PREVIEW_FALLBACK,
    previewUrl: LOCAL_PREVIEW_FALLBACK,
    shopOrigin: origin,
    themeId: undefined,
  };
}
