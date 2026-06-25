import type { Order, Product } from './types';

// --- Уход за экзотическими питомцами -----------------------------------------
// Экзотика прощает ошибки хуже кошки или собаки: рептилия без UVB и обогрева
// заболевает метаболической болезнью костей, живой корм без витаминной обсыпки
// не покрывает потребность в кальции. Поэтому корзину имеет смысл проверять не
// только на сумму, но и на «зоотехническую» комплектность — как это делает
// консультант в офлайн-зоомагазине.

export type CareAdvice = {
  id: string;
  level: 'warn' | 'tip' | 'ok';
  icon: string;
  text: string;
  /** Какой питомец/сценарий вызвал совет — для группировки в интерфейсе. */
  pet: Product['pet'];
};

const reptileTerrarium = (p: Product) => p.pet === 'reptile' && p.cat === 'terra';
const uvbSource = (p: Product) => p.pet === 'reptile' && /uvb|уф/i.test(p.title);
const heatSource = (p: Product) => p.pet === 'reptile' && p.cat === 'care' && /подогрев|коврик|термо/i.test(p.title);
const reptileSupplement = (p: Product) => p.pet === 'reptile' && p.cat === 'care' && /витамин/i.test(p.title);
const liveFeeder = (p: Product) => p.cat === 'food' && /жив/i.test(p.title);
const insectarium = (p: Product) => p.pet === 'insect' && p.cat === 'terra';
const insectFood = (p: Product) => p.pet === 'insect' && p.cat === 'food';

/**
 * Разбирает товары в корзине и возвращает советы по содержанию. Логика
 * намеренно «мягкая»: ничего не блокирует оформление, но подсказывает, чего не
 * хватает для здоровья питомца. Один и тот же товар может быть и причиной
 * предупреждения, и его закрытием (террариум требует лампу, лампа закрывает).
 */
export function cartCareAdvice(products: Product[]): CareAdvice[] {
  const advice: CareAdvice[] = [];
  const has = (predicate: (p: Product) => boolean) => products.some(predicate);

  // 1. Рептилия в террариуме без ультрафиолета и без обогрева.
  if (has(reptileTerrarium)) {
    if (!has(uvbSource)) {
      advice.push({
        id: 'reptile-uvb',
        level: 'warn',
        icon: '☀️',
        pet: 'reptile',
        text: 'Для террариума с рептилией нужен источник UVB: без ультрафиолета не усваивается кальций. Добавьте УФ-лампу.',
      });
    }
    if (!has(heatSource)) {
      advice.push({
        id: 'reptile-heat',
        level: 'warn',
        icon: '🌡️',
        pet: 'reptile',
        text: 'Рептилиям нужен тёплый угол 30–35 °C. Добавьте коврик или термошнур с подогревом, чтобы создать перепад температур.',
      });
    }
    if (has(uvbSource) && has(heatSource)) {
      advice.push({
        id: 'reptile-ready',
        level: 'ok',
        icon: '✅',
        pet: 'reptile',
        text: 'Набор для рептилии укомплектован: террариум, ультрафиолет и обогрев на месте.',
      });
    }
  }

  // 2. Живой корм — скоропортящийся товар и повод напомнить про обсыпку.
  if (has(liveFeeder)) {
    advice.push({
      id: 'live-delivery',
      level: 'tip',
      icon: '🚚',
      pet: 'reptile',
      text: 'В корзине живой корм — отправим его отдельно курьером в течение 24 часов, обычная доставка для него недоступна.',
    });
    if (has((p) => p.pet === 'reptile') && !has(reptileSupplement)) {
      advice.push({
        id: 'live-dusting',
        level: 'tip',
        icon: '🦴',
        pet: 'reptile',
        text: 'Перед кормлением живой корм стоит обсыпать витаминами с кальцием — добавьте подкормку для рептилий.',
      });
    }
  }

  // 3. Инсектарий без кормовой смеси для его обитателей.
  if (has(insectarium) && !has(insectFood)) {
    advice.push({
      id: 'insect-food',
      level: 'tip',
      icon: '🌿',
      pet: 'insect',
      text: 'К инсектарию пригодится кормовая смесь — палочникам и сверчкам нужен постоянный корм и источник влаги.',
    });
  }

  return advice;
}

// --- Программа лояльности «ДИКОклуб» -----------------------------------------
// Накопительный статус считается по сумме оформленных заказов: чем выше статус,
// тем больше процент бонусов и ниже порог бесплатной доставки.

export type LoyaltyTier = {
  id: 'base' | 'silver' | 'gold';
  label: string;
  icon: string;
  /** Доля от суммы заказа, начисляемая бонусами. */
  bonusRate: number;
  /** Сумма заказа, с которой доставка бесплатна. */
  freeDeliveryFrom: number;
  /** Порог следующего статуса по обороту, либо null для максимального. */
  nextAt: number | null;
};

const TIERS: LoyaltyTier[] = [
  { id: 'gold', label: 'Золото', icon: '🥇', bonusRate: 0.05, freeDeliveryFrom: 0, nextAt: null },
  { id: 'silver', label: 'Серебро', icon: '🥈', bonusRate: 0.03, freeDeliveryFrom: 2000, nextAt: 30000 },
  { id: 'base', label: 'Базовый', icon: '🐾', bonusRate: 0.01, freeDeliveryFrom: 3000, nextAt: 10000 },
];

/** Сумма всех оформленных заказов — основа накопительного статуса. */
export function lifetimeSpent(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + order.total, 0);
}

export function loyaltyTier(spent: number): LoyaltyTier {
  // Идём от высшего статуса к низшему и берём первый достигнутый порог.
  return (
    TIERS.find((tier) => (tier.id === 'gold' && spent >= 30000) || (tier.id === 'silver' && spent >= 10000)) ??
    TIERS[TIERS.length - 1]
  );
}

/** Сколько ещё нужно потратить до следующего статуса (0 — если максимум). */
export function spentToNextTier(spent: number): number {
  const tier = loyaltyTier(spent);
  return tier.nextAt ? Math.max(0, tier.nextAt - spent) : 0;
}

export function deliveryCost(payable: number, tier: LoyaltyTier): number {
  if (payable === 0) return 0;
  return payable >= tier.freeDeliveryFrom ? 0 : 350;
}

export function bonusForOrder(orderTotal: number, tier: LoyaltyTier): number {
  return Math.round(orderTotal * tier.bonusRate);
}
