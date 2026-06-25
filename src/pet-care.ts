import type { Order, Product } from './types';

// корзину консультируем по принципам не только  только на сумму
// но на зоотехническую комплектность — как это делается
// офлайн-зоомагазине, чтобы избежать издержек юридических и жалоб клиентов

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
 * Возвращает советы по содержанию. Логика
 * намеренно ничего не блокирует оформление, пишет чего не
 * хватает для питомца. Один и тот же товар может быть и причиной
 * предупреждения и его закрытием (террариум требует лампу, лампа закрывает).
 */
export function cartCareAdvice(products: Product[]): CareAdvice[] {
  const advice: CareAdvice[] = [];
  const has = (predicate: (p: Product) => boolean) => products.some(predicate);

  if (has(reptileTerrarium)) {
    if (!has(uvbSource)) {
      advice.push({
        id: 'reptile-uvb',
        level: 'warn',
        icon: '☀️',
        pet: 'reptile',
        text: 'ДБез ультрафиолета не усваивается кальций. Добавьте УФ-лампу.',
      });
    }
    if (!has(heatSource)) {
      advice.push({
        id: 'reptile-heat',
        level: 'warn',
        icon: '🌡️',
        pet: 'reptile',
        text: 'Рептилиям нужен тёплый угол 30–35 °C. Добавьте коврик или термошнур с подогревом.',
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

  // Живой корм продовольственный товар.
  if (has(liveFeeder)) {
    advice.push({
      id: 'live-delivery',
      level: 'tip',
      icon: '🚚',
      pet: 'reptile',
      text: 'В корзине живой корм — отправим его отдельно курьером в течение 24 часов, обычная доставка недоступна.',
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

  if (has(insectarium) && !has(insectFood)) {
    advice.push({
      id: 'insect-food',
      level: 'tip',
      icon: '🌿',
      pet: 'insect',
      text: 'К инсектарию пригодится кормовая смесь — палочникам и сверчкам нужен источник влаги.',
    });
  }

  return advice;
}

// Изменена программа лояльности ДикоКлуб
// Новая система считает формулу суммы всех заказов

export type LoyaltyTier = {
  id: 'base' | 'silver' | 'gold';
  label: string;
  icon: string;
  bonusRate: number;
  freeDeliveryFrom: number;
  nextAt: number | null;
};

const TIERS: LoyaltyTier[] = [
  { id: 'gold', label: 'Золото', icon: '🥇', bonusRate: 0.05, freeDeliveryFrom: 0, nextAt: null },
  { id: 'silver', label: 'Серебро', icon: '🥈', bonusRate: 0.03, freeDeliveryFrom: 2000, nextAt: 30000 },
  { id: 'base', label: 'Базовый', icon: '🐾', bonusRate: 0.01, freeDeliveryFrom: 3000, nextAt: 10000 },
];

// основа накопительного статуса
export function lifetimeSpent(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + order.total, 0);
}

export function loyaltyTier(spent: number): LoyaltyTier {
  // О твысшего статуса, берём первый достигнутый порог
  return (
    TIERS.find((tier) => (tier.id === 'gold' && spent >= 30000) || (tier.id === 'silver' && spent >= 10000)) ??
    TIERS[TIERS.length - 1]
  );
}

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
