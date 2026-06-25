import type { CheckoutFields, Filters, GameState, Promo, Review, SortKey, StoredUser } from './types';

export const defaultFilters: Filters = {
  pets: [],
  cats: [],
  brands: [],
  purposes: [],
  priceMin: 0,
  priceMax: 8000,
  weight: 'any',
  age: 'any',
  rating: 0,
  inStock: false,
};

export const sortDefs: Array<[SortKey, string]> = [
  ['popular', 'Популярные'],
  ['cheap', 'Сначала недорогие'],
  ['exp', 'Сначала дорогие'],
  ['rating', 'По рейтингу'],
  ['new', 'Новинки'],
  ['discount', 'По скидке'],
];

export const brandChips = ['Exo Terra', 'ExoticPro', 'Versele-Laga', 'WildLife', 'Repti', 'Padovan'];

export const demoUser: StoredUser = {
  name: 'Любовь Шейда',
  email: 'liubovsheyda@gmail.com',
  password: 'Teacher_2026',
};

export const emptyCheckout: CheckoutFields = { name: '', phone: '', address: '', pay: 'card' };

export const emptyGame: GameState = { phase: 'idle', score: 0, time: 30, toys: [], basket: 50, result: null };

export const promoCatalog: Record<string, Promo> = {
  DIKO10: { code: 'DIKO10', type: 'percent', value: 10 },
  EXOTIC15: { code: 'EXOTIC15', type: 'percent', value: 15 },
  WELCOME300: { code: 'WELCOME300', type: 'fixed', value: 300 },
};

export const galleryTints = [
  'var(--surface-2)',
  'rgba(120,80,200,.10)',
  'rgba(0,170,90,.10)',
  'rgba(230,190,30,.14)',
];

export const galleryLabels = ['Основное фото', 'Вид сбоку', 'Деталь', 'В интерьере'];

export const starterReviews: Record<number, Review[]> = {
  1: [
    {
      id: 'seed-1-1',
      author: 'Марина Орлова',
      rating: 5,
      text: 'Террариум приехал целым, стекло плотное, дверцы закрываются без люфта. Эублефар быстро освоился.',
      date: '12.05.2026',
      productId: 1,
    },
    {
      id: 'seed-1-2',
      author: 'Игорь Сафин',
      rating: 4,
      text: 'Хороший размер для молодого питомца. Хотелось бы больше вентиляционных отверстий сверху, но в целом покупкой доволен.',
      date: '27.04.2026',
      productId: 1,
    },
  ],
  2: [
    {
      id: 'seed-2-1',
      author: 'Алина К.',
      rating: 5,
      text: 'Ёж ест корм охотно, гранулы не крошатся. Упаковки хватает надолго.',
      date: '03.06.2026',
      productId: 2,
    },
  ],
  4: [
    {
      id: 'seed-4-1',
      author: 'Сергей Петров',
      rating: 5,
      text: 'Лампа яркая, установилась в стандартный держатель. После недели использования всё работает стабильно.',
      date: '18.05.2026',
      productId: 4,
    },
  ],
  8: [
    {
      id: 'seed-8-1',
      author: 'Виктория',
      rating: 4,
      text: 'Сверчки активные, упаковка аккуратная. Для кормления рептилии подошли отлично.',
      date: '21.05.2026',
      productId: 8,
    },
  ],
  12: [
    {
      id: 'seed-12-1',
      author: 'Олег Миронов',
      rating: 5,
      text: 'Попугай перешёл на этот корм без проблем. Видно много разных зёрен, запах свежий.',
      date: '09.06.2026',
      productId: 12,
    },
  ],
  18: [
    {
      id: 'seed-18-1',
      author: 'Наталья',
      rating: 5,
      text: 'Хорошее лакомство для дрессировки. Банка закрывается плотно, черви сухие и без лишней пыли.',
      date: '16.04.2026',
      productId: 18,
    },
  ],
};
