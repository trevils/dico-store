import type { Category, Pet, Product } from './types';
import achetaDomesticusImage from './assets/images/product-cards/Acheta-domesticus-Nutritious-Meal.webp';
import driedMealwormsImage from './assets/images/product-cards/Dried-Mealworms-Nutritious-Treat.webp';
import heatedTerrariumMatImage from './assets/images/product-cards/Heated-Terrarium-mat-repti.webp';
import lampUvBImage from './assets/images/product-cards/Lamp-UVB-10.0-Repti.webp';
import hedgehogMealImage from './assets/images/product-cards/nutritious-meal-hedgehog.webp';
import stickXxlCoypuImage from './assets/images/product-cards/stick-XXL-coypu.webp';
import terrariumExoTerraImage from './assets/images/product-cards/terrarium-exo-tera-45.webp';
import verseleLagaNutribirdImage from './assets/images/product-cards/Versele-Laga-Nutribird.webp';

export const categories: Category[] = [
  { id: 'food', name: 'Корма', emoji: '🥩' },
  { id: 'treats', name: 'Лакомства', emoji: '🍖' },
  { id: 'toys', name: 'Игрушки', emoji: '🎾' },
  { id: 'beds', name: 'Домики и лежанки', emoji: '🛏️' },
  { id: 'carriers', name: 'Переноски', emoji: '🧳' },
  { id: 'care', name: 'Средства ухода', emoji: '🧴' },
  { id: 'clothes', name: 'Одежда', emoji: '🧥' },
  { id: 'litter', name: 'Наполнители', emoji: '🌾' },
  { id: 'terra', name: 'Террариумы', emoji: '🪨' },
];

export const pets: Pet[] = [
  { id: 'reptile', name: 'Рептилии', emoji: '🦎' },
  { id: 'hedgehog', name: 'Ёжики', emoji: '🦔' },
  { id: 'bird', name: 'Птицы', emoji: '🦜' },
  { id: 'rodent', name: 'Грызуны', emoji: '🐹' },
  { id: 'nutria', name: 'Нутрии', emoji: '🦫' },
  { id: 'insect', name: 'Насекомые', emoji: '🕷️' },
];

export const purposes = [
  'Рост и развитие',
  'Иммунитет',
  'Зубы и когти',
  'Сон и отдых',
  'Гигиена',
  'Дрессировка',
  'Прогулка',
];

// без дублей руками
const catMap = new Map(categories.map((c) => [c.id, c]));
const petMap = new Map(pets.map((p) => [p.id, p]));

const productImages: Partial<Record<number, { src: string; alt: string }>> = {
  1: { src: terrariumExoTerraImage, alt: 'Террариум Exo Terra 45×45×45' },
  2: { src: hedgehogMealImage, alt: 'Корм для ёжиков ExoticPro' },
  3: { src: stickXxlCoypuImage, alt: 'Деревянная палка для нутрии' },
  4: { src: lampUvBImage, alt: 'УФ-лампа Repti UVB 10.0' },
  8: { src: achetaDomesticusImage, alt: 'Кормовые сверчки Acheta domesticus' },
  12: { src: verseleLagaNutribirdImage, alt: 'Корм Versele-Laga NutriBird' },
  14: { src: heatedTerrariumMatImage, alt: 'Террариумный коврик с подогревом' },
  18: { src: driedMealwormsImage, alt: 'Сушёные мучные черви' },
};

// вес
function packLabel(g: number): [string, string] {
  if (!g) return ['Упаковка', 'штучно'];
  return g >= 1000 ? ['Вес', `${g / 1000} кг`] : ['Вес', `${g} г`];
}

// TODO: должно ехать с бэка щас пока так
type Row = [
  number,
  string,
  Product['cat'],
  Product['pet'],
  string,
  number,
  number,
  number,
  number,
  number,
  Product['age'],
  string[],
  boolean,
  Product['badge'],
  number,
];

const rows: Row[] = [
  [1, 'Террариум Exo Terra 45×45×45', 'terra', 'reptile', 'Exo Terra', 6490, 7990, 4.8, 214, 0, 'any', ['Сон и отдых'], true, 'hit', 980],
  [2, 'Корм для ёжиков ExoticPro 2 кг', 'food', 'hedgehog', 'ExoticPro', 1290, 0, 4.6, 88, 2000, 'adult', ['Рост и развитие', 'Иммунитет'], true, '', 540],
  [3, 'Палка для нутрии XL, дерево', 'toys', 'nutria', 'WildLife', 2750, 3200, 4.9, 31, 0, 'any', ['Зубы и когти'], true, 'sale', 410],
  [4, 'УФ-лампа Repti UVB 10.0', 'care', 'reptile', 'Repti', 1890, 0, 4.7, 126, 0, 'any', ['Иммунитет'], true, 'hit', 760],
  [5, 'Лакомство для попугаев Padovan, фрукты 100 г', 'treats', 'bird', 'Padovan', 390, 0, 4.5, 64, 100, 'any', ['Дрессировка'], true, '', 300],
  [6, 'Домик-нора для ёжика, плюш', 'beds', 'hedgehog', 'ZooMir', 990, 1290, 4.8, 53, 0, 'any', ['Сон и отдых'], true, 'sale', 350],
  [7, 'Переноска для рептилий вентилируемая 30 см', 'carriers', 'reptile', 'Triol', 1450, 0, 4.4, 22, 0, 'any', ['Прогулка'], true, '', 180],
  [8, 'Сверчки кормовые живые, 50 шт', 'food', 'reptile', 'WildLife', 350, 0, 4.3, 140, 0, 'any', ['Рост и развитие'], true, '', 600],
  [9, 'Гигиенический песок для шиншилл 1 кг', 'litter', 'rodent', 'ZooMir', 290, 0, 4.6, 77, 1000, 'any', ['Гигиена'], true, '', 280],
  [10, 'Минеральный камень для грызунов', 'care', 'rodent', 'Triol', 150, 0, 4.5, 49, 0, 'any', ['Зубы и когти'], true, '', 220],
  [11, 'Утеплённый жилет-шлейка для нутрии', 'clothes', 'nutria', 'ZooMir', 690, 890, 4.2, 12, 0, 'any', ['Прогулка'], false, 'sale', 90],
  [12, 'Корм Versele-Laga для попугаев 1 кг', 'food', 'bird', 'Versele-Laga', 850, 0, 4.9, 205, 1000, 'any', ['Рост и развитие', 'Иммунитет'], true, 'hit', 870],
  [13, 'Игрушка-лабиринт для грызунов', 'toys', 'rodent', 'Triol', 540, 0, 4.6, 38, 0, 'any', ['Сон и отдых'], true, '', 240],
  [14, 'Террариумный коврик с подогревом', 'care', 'reptile', 'Repti', 1290, 0, 4.7, 95, 0, 'any', ['Иммунитет', 'Сон и отдых'], true, 'new', 520],
  [15, 'Лежанка-гамак для ёжика', 'beds', 'hedgehog', 'ZooMir', 790, 0, 4.8, 41, 0, 'any', ['Сон и отдых'], true, 'new', 330],
  [16, 'Витамины для рептилий ExoticPro 50 мл', 'care', 'reptile', 'ExoticPro', 620, 0, 4.6, 58, 50, 'any', ['Иммунитет'], true, '', 360],
  [17, 'Поилка автоматическая для птиц', 'care', 'bird', 'JBL', 480, 0, 4.4, 27, 0, 'any', ['Гигиена'], true, '', 160],
  [18, 'Мучные черви сушёные 200 г', 'treats', 'hedgehog', 'WildLife', 560, 0, 4.7, 112, 200, 'any', ['Дрессировка'], true, 'hit', 640],
  [19, 'Наполнитель древесный для грызунов 5 л', 'litter', 'rodent', 'ZooMir', 320, 0, 4.5, 83, 5000, 'any', ['Гигиена'], true, '', 290],
  [20, 'Корм для нутрий, гранулы 3 кг', 'food', 'nutria', 'ExoticPro', 740, 0, 4.6, 36, 3000, 'adult', ['Рост и развитие'], true, '', 200],
  [21, 'Инсектарий для палочников, акрил', 'terra', 'insect', 'Exo Terra', 1990, 2490, 4.8, 19, 0, 'any', ['Сон и отдых'], true, 'sale', 150],
  [22, 'Кормовая смесь для насекомых 250 г', 'food', 'insect', 'WildLife', 290, 0, 4.4, 24, 250, 'any', ['Рост и развитие'], true, '', 120],
  [23, 'Гнездовой домик для птиц, дерево', 'beds', 'bird', 'Padovan', 670, 0, 4.7, 45, 0, 'any', ['Сон и отдых'], true, '', 250],
  [24, 'Шлейка-поводок для рептилии', 'clothes', 'reptile', 'Triol', 430, 590, 4.3, 16, 0, 'baby', ['Прогулка'], true, 'sale', 110],
];

export const products: Product[] = rows.map((row) => {
  const [id, title, cat, pet, brand, price, old, rating, reviews, weight, age, productPurposes, stock, badge, popularity] = row;

  const petInfo = petMap.get(pet);
  const catInfo = catMap.get(cat);
  const imageInfo = productImages[id];
  // заглушки по еррорам id
  const petTitle = petInfo?.name ?? pet;

  return {
    id,
    title,
    cat,
    pet,
    brand,
    price,
    old: old || 0,
    rating,
    reviews,
    weight,
    age,
    purposes: productPurposes,
    stock,
    badge,
    popularity,
    images: imageInfo ? [imageInfo.src] : [],
    ...(imageInfo ? { image: imageInfo.src, imageAlt: imageInfo.alt } : {}),
    emoji: petInfo?.emoji ?? '🐾',
    catEmoji: catInfo?.emoji ?? '📦',
    petName: petTitle,
    desc: `Подходит для содержания экзотических питомцев (${petTitle.toLowerCase()}). Безопасные материалы, проверено заводчиками сообщества ДИКО.`,
    specs: [
      ['Бренд', brand],
      ['Категория', catInfo?.name ?? cat],
      ['Для кого', petTitle],
      packLabel(weight),
      ['Страна', 'Германия'],
    ],
  };
});

export const promoSlides = [
  {
    tag: '— 25% на террариумы',
    title: 'Дом мечты для\xa0рептилии',
    sub: 'Стеклянные террариумы Exo Terra и инсектарии с быстрой сборкой. Скидка до конца недели.',
    emoji: '🦎',
    image: '/images/eublepharis-transparent-backgroung.png',
    imageAlt: 'Эублефар',
    cta: 'К террариумам',
    target: { name: 'catalog', cat: 'terra' as const },
    bg: 'oklch(0.86 0.165 95)',
    text: 'oklch(0.18 0.02 280)',
    tagBg: 'oklch(0.18 0.02 280)',
    tagText: 'oklch(0.9 0.16 95)',
    btnBg: 'oklch(0.18 0.02 280)',
    btnText: '#fff',
    photoBg: 'rgba(0,0,0,.07)',
  },
  {
    tag: 'Новинка недели',
    title: 'Меню для\xa0ёжика и для\xa0нутрии',
    sub: 'Сбалансированные корма ExoticPro и WildLife - рост, иммунитет и блестящие иголки.',
    emoji: '🦔',
    image: '/images/hedgehog-transparent-background.png',
    imageAlt: 'Ёжик',
    cta: 'Выбрать корм',
    target: { name: 'catalog', cat: 'food' as const },
    bg: 'oklch(0.55 0.22 300)',
    text: '#fff',
    tagBg: 'oklch(0.86 0.165 95)',
    tagText: 'oklch(0.2 0.05 95)',
    btnBg: 'oklch(0.86 0.165 95)',
    btnText: 'oklch(0.2 0.02 280)',
    photoBg: 'rgba(255,255,255,.14)',
  },
  {
    tag: 'Играй и\xa0побеждай',
    title: 'Поймай игрушки\xa0- лови промокод',
    sub: 'Сыграй в мини-игру, набери очки и получи бонусы и промокод на следующий заказ.',
    emoji: '🎮',
    image: '/images/coypu-transparent-background.png',
    imageAlt: 'Нутрия',
    cta: 'Играть',
    target: { name: 'game' as const },
    bg: 'oklch(0.7 0.17 150)',
    text: 'oklch(0.16 0.04 160)',
    tagBg: 'oklch(0.18 0.04 160)',
    tagText: 'oklch(0.9 0.16 150)',
    btnBg: 'oklch(0.18 0.04 160)',
    btnText: '#fff',
    photoBg: 'rgba(0,0,0,.08)',
  },
];
