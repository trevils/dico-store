export type CategoryId =
  | 'food'
  | 'treats'
  | 'toys'
  | 'beds'
  | 'carriers'
  | 'care'
  | 'clothes'
  | 'litter'
  | 'terra';

export type PetId =
  | 'reptile'
  | 'hedgehog'
  | 'bird'
  | 'rodent'
  | 'nutria'
  | 'insect';

export type Badge = '' | 'hit' | 'new' | 'sale';
export type Age = 'any' | 'baby' | 'adult';

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
}

export interface Pet {
  id: PetId;
  name: string;
  emoji: string;
}

export interface Product {
  id: number;
  title: string;
  cat: CategoryId;
  pet: PetId;
  brand: string;
  price: number;
  old: number;
  rating: number;
  reviews: number;
  weight: number;
  age: Age;
  purposes: string[];
  stock: boolean;
  badge: Badge;
  popularity: number;
  emoji: string;
  catEmoji: string;
  petName: string;
  desc: string;
  specs: Array<[string, string]>;
}

export interface Filters {
  pets: PetId[];
  cats: CategoryId[];
  brands: string[];
  purposes: string[];
  priceMin: number;
  priceMax: number;
  weight: 'any' | 'light' | 'mid' | 'heavy';
  age: Age;
  rating: number;
  inStock: boolean;
}

export type SortKey =
  | 'popular'
  | 'cheap'
  | 'exp'
  | 'rating'
  | 'new'
  | 'discount';

export type ViewMode = 'grid' | 'list';

export type Route =
  | { name: 'home' }
  | { name: 'catalog' }
  | { name: 'product'; id: number }
  | { name: 'cart' }
  | { name: 'favorites' }
  | { name: 'compare' }
  | { name: 'auth' }
  | { name: 'account' }
  | { name: 'game' }
  | { name: 'checkout' };

export interface CartLine {
  id: number;
  qty: number;
}

export interface User {
  name: string;
  email?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  mine?: boolean;
  productId: number;
}

export interface Toast {
  id: number;
  msg: string;
  icon: string;
}
