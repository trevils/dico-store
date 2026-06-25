import shopData from './shop-data.json';
import type { Category, CategoryId, Pet, Product } from './types';
import achetaDomesticusImage from './assets/images/product-cards/Acheta-domesticus-Nutritious-Meal.webp';
import driedMealwormsImage from './assets/images/product-cards/Dried-Mealworms-Nutritious-Treat.webp';
import heatedTerrariumMatImage from './assets/images/product-cards/Heated-Terrarium-mat-repti.webp';
import lampUvBImage from './assets/images/product-cards/Lamp-UVB-10.0-Repti.webp';
import hedgehogMealImage from './assets/images/product-cards/nutritious-meal-hedgehog.webp';
import stickXxlCoypuImage from './assets/images/product-cards/stick-XXL-coypu.webp';
import terrariumExoTerraImage from './assets/images/product-cards/terrarium-exo-tera-45.webp';
import verseleLagaNutribirdImage from './assets/images/product-cards/Versele-Laga-Nutribird.webp';

type ProductRecord = {
  id: number;
  title: string;
  cat: Product['cat'];
  pet: Product['pet'];
  brand: string;
  price: number;
  old: number;
  rating: number;
  reviews: number;
  weight: number;
  age: Product['age'];
  purposes: string[];
  stock: boolean;
  badge: Product['badge'];
  popularity: number;
};

type PromoSlide = {
  tag: string;
  title: string;
  sub: string;
  emoji: string;
  image: string;
  imageAlt: string;
  cta: string;
  target: { name: 'catalog'; cat: CategoryId } | { name: 'game' };
  bg: string;
  text: string;
  tagBg: string;
  tagText: string;
  btnBg: string;
  btnText: string;
  photoBg: string;
};

type ShopData = {
  categories: Category[];
  pets: Pet[];
  purposes: string[];
  products: ProductRecord[];
  promoSlides: PromoSlide[];
};

const data = shopData as ShopData;

export const categories: Category[] = data.categories;
export const pets: Pet[] = data.pets;
export const purposes = data.purposes;

// оптимизация многократного поиска по категориям и питомцам по формуле (x) => [x.id, x])
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

// фуормула расчета для обработки разных типов продукта
function packLabel(g: number): [string, string] {
  if (!g) return ['Упаковка', 'штучно'];
  return g >= 1000 ? ['Вес', `${g / 1000} кг`] : ['Вес', `${g} г`];
}

export const products: Product[] = data.products.map((item) => {
  const petInfo = petMap.get(item.pet);
  const catInfo = catMap.get(item.cat);
  const imageInfo = productImages[item.id];
  // заглушки по еррорам id
  const petTitle = petInfo?.name ?? item.pet;

  return {
    id: item.id,
    title: item.title,
    cat: item.cat,
    pet: item.pet,
    brand: item.brand,
    price: item.price,
    old: item.old || 0,
    rating: item.rating,
    reviews: item.reviews,
    weight: item.weight,
    age: item.age,
    purposes: item.purposes,
    stock: item.stock,
    badge: item.badge,
    popularity: item.popularity,
    images: imageInfo ? Array.from({ length: 4 }, () => imageInfo.src) : [],
    ...(imageInfo ? { image: imageInfo.src, imageAlt: imageInfo.alt } : {}),
    emoji: petInfo?.emoji ?? '🐾',
    catEmoji: catInfo?.emoji ?? '📦',
    petName: petTitle,
    desc: `Подходит для содержания экзотических питомцев (${petTitle.toLowerCase()}). Безопасные материалы, проверено заводчиками сообщества ДИКО.`,
    specs: [
      ['Бренд', item.brand],
      ['Категория', catInfo?.name ?? item.cat],
      ['Для кого', petTitle],
      packLabel(item.weight),
      ['Страна', 'Германия'],
    ],
  };
});

export const promoSlides: PromoSlide[] = data.promoSlides;
