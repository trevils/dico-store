import shopData from './shop-data.json';
import type { Age, Badge, Category, CategoryId, Pet, PetId, Product } from './types';
import achetaDomesticusImage from './assets/images/product-cards/Acheta-domesticus-Nutritious-Meal.webp';
import driedMealwormsImage from './assets/images/product-cards/Dried-Mealworms-Nutritious-Treat.webp';
import heatedTerrariumMatImage from './assets/images/product-cards/Heated-Terrarium-mat-repti.webp';
import lampUvBImage from './assets/images/product-cards/Lamp-UVB-10.0-Repti.webp';
import hedgehogMealImage from './assets/images/product-cards/nutritious-meal-hedgehog.webp';
import stickXxlCoypuImage from './assets/images/product-cards/stick-XXL-coypu.webp';
import terrariumExoTerraImage from './assets/images/product-cards/terrarium-exo-tera-45.webp';
import verseleLagaNutribirdImage from './assets/images/product-cards/Versele-Laga-Nutribird.webp';

export type { Product } from './types';

// бренд -> страна. держb одним списком, иначе в карточках разводится
// по три написания "Версель-Лага" и это портит впечатления от нашего 
// магазина и поиска по сайту
const brandCountry = {
  'Exo Terra': 'Канада',
  'Versele-Laga': 'Бельгия',
  Padovan: 'Италия',
  JBL: 'Германия',
  Repti: 'США',
  ExoticPro: 'Россия',
  WildLife: 'Россия',
  ZooMir: 'Россия',
  Triol: 'Россия',
} as const;

type BrandName = keyof typeof brandCountry;

// как товар лежит в shop-data.json — до того как навесим картинки и тексты
type ProductRecord = {
  id: number;
  title: string;
  cat: CategoryId;
  pet: PetId;
  brand: string;
  price: number;
  old?: number;
  rating: number;
  reviews: number;
  weight: number;
  age: Age;
  purposes: string[];
  stock: boolean;
  badge: Badge | null;
  popularity: number;
};

export type PromoDicoTarget =
  | { name: 'catalog'; cat: CategoryId }
  | { name: 'game' }
  | { name: 'account'; tab: 'bonuses' };

export type DicoSlide = {
  tag: string;
  title: string;
  sub: string;
  emoji: string;
  image: string;
  imageAlt: string;
  cta: string;
  target: PromoDicoTarget;
  bg: string;
  text: string;
  tagBg: string;
  tagText: string;
  btnBg: string;
  btnText: string;
  photoBg: string;
};

type ShopDicoDataSchema = {
  categories: Category[];
  pets: Pet[];
  purposes: string[];
  products: ProductRecord[];
  promoSlides: DicoSlide[];
};

const data = shopData as ShopDicoDataSchema;

export const categories: Category[] = data.categories;
export const pets: Pet[] = data.pets;
export const purposes = data.purposes;
// держим в Map, чтобы не гонять find по массиву на каждый товар
const catMap = new Map(categories.map((c) => [c.id, c]));
const petMap = new Map(pets.map((p) => [p.id, p]));

const productImages: Record<number, { src: string; alt: string }> = {
  1: { src: terrariumExoTerraImage, alt: 'Террариум Exo Terra 45×45×45' },
  2: { src: hedgehogMealImage, alt: 'Корм для ёжиков ExoticPro' },
  3: { src: stickXxlCoypuImage, alt: 'Деревянная палка для нутрии' },
  4: { src: lampUvBImage, alt: 'УФ-лампа Repti UVB 10.0' },
  8: { src: achetaDomesticusImage, alt: 'Кормовые сверчки Acheta domesticus' },
  12: { src: verseleLagaNutribirdImage, alt: 'Корм Versele-Laga NutriBird' },
  14: { src: heatedTerrariumMatImage, alt: 'Террариумный коврик с подогревом' },
  18: { src: driedMealwormsImage, alt: 'Сушёные мучные черви' },
};

// фолбэк, если фотку для товара ещё не добавили — лучше пустая рамка битые картнки
const noImage = { src: '', alt: 'Изображение товара отсутствует' };

const countryByBrand = (brand: string) => brandCountry[brand as BrandName] ?? '—';

// возраст приводим для карточки описания
function ageRu(age: Age): string {
  if (age === 'baby') return 'Молодые особи';
  if (age === 'adult') return 'Взрослые особи';
  return 'Любой возраст';
}

// вес: до кило показываем в граммах, дальше в кг 1.5 кг смотрится 
// лучше чем 1500 г и обрабатывается клиентами-покупателями быстрее
function weightRow(grams: number): [string, string] {
  if (!grams) return ['Фасовка', 'поштучно'];
  if (grams < 1000) return ['Вес нетто', `${grams} г`];
  return ['Вес нетто', `${grams / 1000} кг`];
}

// скидка в процентах, считаем только если старая цена реально больше
function discountRow(price: number, old?: number): [string, string] | null {
  if (!old || old <= price) return null;
  return ['Скидка', `−${Math.round((1 - price / old) * 100)}%`];
}
// текст под карточкой. писали руками, поэтому где-то живее, где-то суше
function makeDesc(cat: CategoryId, petTitle: string): string {
  const who = petTitle.toLowerCase();
  switch (cat) {
    case 'food':
      return `Полнорационный корм для ${who}. Белок и кальций в нужной пропорции — можно давать каждый день.`;
    case 'treats':
      return `Это лакомство, а не основа рациона: берут для дрессировки и порадовать. ${petTitle} потом выпрашивают добавку.`;
    case 'terra':
      return `Держит тепло и влажность, материалы безопасные, собирается без инструмента.`;
    case 'care':
      return `Уход и здоровье — то, что советуют сами заводчики из сообщества ДИКО.`;
    case 'toys':
      return `Помогает стачивать зубы и когти и спасает ваши плинтуса и провода, если питомец живёт один.`;
    case 'beds':
      return `Мягкое место для сна: форму держит, стирается в машинке.`;
    case 'carriers':
      return `Переноска с вентиляцией — к ветеринару или в дорогу. Размер берите по меркам питомца.`;
    case 'litter':
      return `Впитывает влагу, запах не копится. Расход см. на упаковке.`;
    case 'clothes':
      return `Для прогулок с ${who}. Снимите мерку по обхвату корпуса, мы не отвечаем за правильный выбор.`;
    default:
      return `Товар для содержания ${who}.`;
  }
}

// прогоняем каталог на дубли и битые ссылки. в проде не падаем
function checkCatalog(records: ProductRecord[]) {
  const seen = new Set<number>();
  const problems: string[] = [];

  for (const item of records) {
    if (seen.has(item.id)) problems.push(`дублирующийся id ${item.id} (${item.title})`);
    seen.add(item.id);
    if (!petMap.has(item.pet)) problems.push(`товар #${item.id}: неизвестный вид «${item.pet}»`);
    if (!catMap.has(item.cat)) problems.push(`товар #${item.id}: неизвестная категория «${item.cat}»`);
    if (item.price <= 0) problems.push(`товар #${item.id}: некорректная цена ${item.price}`);
    if (item.old && item.old <= item.price) problems.push(`товар #${item.id}: старая цена не выше новой`);
  }

  if (problems.length) {
    const message = `Каталог ДИКО: проблематики в наших данных —\n - ${problems.join('\n - ')}`;
    if (import.meta.env.DEV) throw new Error(message);
    console.error(message);
  }
}
checkCatalog(data.products);

export const products: Product[] = data.products.map((item) => {
  const petInfo = petMap.get(item.pet); const catInfo = catMap.get(item.cat);
  const imageInfo = productImages[item.id] ?? noImage;
  const petTitle = petInfo?.name ?? item.pet; const catName = catInfo?.name ?? item.cat;

  return {
    id: item.id,
    title: item.title,
    cat: item.cat,
    pet: item.pet,
    brand: item.brand,
    price: item.price,
    old: item.old ?? 0,
    rating: item.rating,
    reviews: item.reviews,
    weight: item.weight,
    age: item.age,
    purposes: item.purposes,
    stock: item.stock,
    badge: item.badge ?? '',
    popularity: item.popularity,
    image: imageInfo.src,
    imageAlt: imageInfo.alt,
    images: imageInfo.src ? Array(4).fill(imageInfo.src) : [],
    emoji: petInfo?.emoji ?? '🐾',
    catEmoji: catInfo?.emoji ?? '📦',
    petName: petTitle,
    desc: makeDesc(item.cat, petTitle),
    specs: [
      ['Бренд', item.brand],
      ['Категория', catName],
      ['Для кого', petTitle],
      ['Возраст', ageRu(item.age)],
      weightRow(item.weight),
      ['Назначение', item.purposes.join(', ') || '—'],
      ['Страна', countryByBrand(item.brand)],
      ['Наличие', item.stock ? 'На складе' : 'Под заказ'],
      // строку со скидкой добавляем только когда она есть, иначе визуальный мусор
      ...(discountRow(item.price, item.old) ? [discountRow(item.price, item.old)!] : []),
    ],
  };
});

export const promoSlides: DicoSlide[] = data.promoSlides;
