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
  images: string[];
  image?: string;
  imageAlt?: string;
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

export type AccountTab = 'profile' | 'orders' | 'favorites' | 'bonuses' | 'reviews';

export type Route =
  | { name: 'home' }
  | { name: 'catalog' }
  | { name: 'product'; id: number }
  | { name: 'cart' }
  | { name: 'favorites' }
  | { name: 'compare' }
  | { name: 'auth' }
  | { name: 'account'; tab?: AccountTab }
  | { name: 'game' }
  | { name: 'checkout' };

export interface CartLine {
  id: number;
  qty: number;
}

export interface User {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
}

export interface StoredUser extends User {
  email: string;
  password: string;
}

export interface CheckoutFields {
  name: string;
  phone: string;
  address: string;
  pay: 'card' | 'cash' | 'split';
}

export interface Promo {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
}

export interface OrderItem {
  id: number;
  title: string;
  emoji: string;
  qty: number;
  price: number;
}

export interface Order {
  no: string;
  date: string;
  total: number;
  bonus: number;
  status: string;
  items: OrderItem[];
}

export interface GameToy {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: 'cricket' | 'cucumber' | 'caterpillar' | 'bomb';
  emoji: string;
  pts: number;
  size: string;
}

export interface GameResult {
  score: number;
  bonus: number;
  promo: Promo | null;
  title: string;
  text: string;
  emoji: string;
}

export interface GameState {
  phase: 'idle' | 'play' | 'over';
  score: number;
  time: number;
  toys: GameToy[];
  basket: number;
  result: GameResult | null;
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
