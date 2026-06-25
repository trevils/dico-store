import type { Badge, Filters, Product, SortKey } from './types';

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage может отключить настройка браузера по приватке
  }
}

export function fmt(value: number) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

export function badgeLabel(product: Product) {
  if (product.badge === 'hit') return 'ХИТ';
  if (product.badge === 'new') return 'НОВИНКА';
  if (product.badge === 'sale' && product.old) {
    return `−${Math.round((1 - product.price / product.old) * 100)}%`;
  }
  return '';
}

export function badgeMeta(badge: Badge) {
  return {
    bg: badge === 'sale' ? 'var(--green)' : badge === 'new' ? 'var(--purple)' : 'var(--yellow)',
    color: badge === 'new' ? '#fff' : '#241c00',
  };
}

export function sortedProducts(list: Product[], sort: SortKey) {
  const sorted = [...list];
  if (sort === 'cheap') sorted.sort((a, b) => a.price - b.price);
  else if (sort === 'exp') sorted.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
  else if (sort === 'new') sorted.sort((a, b) => b.id - a.id);
  else if (sort === 'discount') sorted.sort((a, b) => (b.old ? b.old - b.price : 0) - (a.old ? a.old - a.price : 0));
  else sorted.sort((a, b) => b.popularity - a.popularity);
  return sorted;
}

export function matchesProduct(product: Product, filters: Filters, query: string) {
  const q = query.trim().toLowerCase();
  if (
    q &&
    !(
      product.title.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.petName.toLowerCase().includes(q)
    )
  ) {
    return false;
  }
  if (filters.pets.length && !filters.pets.includes(product.pet)) return false;
  if (filters.cats.length && !filters.cats.includes(product.cat)) return false;
  if (filters.brands.length && !filters.brands.includes(product.brand)) return false;
  if (filters.purposes.length && !filters.purposes.some((purpose) => product.purposes.includes(purpose))) return false;
  if (product.price < filters.priceMin || product.price > filters.priceMax) return false;
  if (filters.weight === 'light' && !(product.weight > 0 && product.weight < 500)) return false;
  if (filters.weight === 'mid' && !(product.weight >= 500 && product.weight <= 2000)) return false;
  if (filters.weight === 'heavy' && !(product.weight > 2000)) return false;
  if (filters.age !== 'any' && product.age !== 'any' && product.age !== filters.age) return false;
  if (filters.rating && product.rating < filters.rating) return false;
  if (filters.inStock && !product.stock) return false;
  return true;
}
