import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Gamepad2,
  Grid3X3,
  Heart,
  List,
  Minus,
  Moon,
  PackageSearch,
  Plus,
  Repeat2,
  RotateCcw,
  Search,
  ShoppingCart,
  Star,
  Sun,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { categories, pets, products, promoSlides, purposes } from './data';
import type {
  Badge,
  CartLine,
  CategoryId,
  CheckoutFields,
  Filters,
  GameState,
  Order,
  PetId,
  Promo,
  Product,
  Review,
  Route,
  SortKey,
  StoredUser,
  Toast,
  User,
  ViewMode,
} from './types';

const defaultFilters: Filters = {
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

const sortDefs: Array<[SortKey, string]> = [
  ['popular', 'Популярные'],
  ['cheap', 'Сначала недорогие'],
  ['exp', 'Сначала дорогие'],
  ['rating', 'По рейтингу'],
  ['new', 'Новинки'],
  ['discount', 'По скидке'],
];

const brandChips = ['Exo Terra', 'ExoticPro', 'Versele-Laga', 'WildLife', 'Repti', 'Padovan'];
const demoUser: StoredUser = { name: 'Любовь Шейда', email: 'liubovsheyda@gmail.com', password: 'Teacher_2026' };
const emptyCheckout: CheckoutFields = { name: '', phone: '', address: '', pay: 'card' };
const emptyGame: GameState = { phase: 'idle', score: 0, time: 30, toys: [], basket: 50, result: null };
const promoCatalog: Record<string, Promo> = {
  DIKO10: { code: 'DIKO10', type: 'percent', value: 10 },
  EXOTIC15: { code: 'EXOTIC15', type: 'percent', value: 15 },
  WELCOME300: { code: 'WELCOME300', type: 'fixed', value: 300 },
};
const galleryTints = [
  'var(--surface-2)',
  'rgba(120,80,200,.10)',
  'rgba(0,170,90,.10)',
  'rgba(230,190,30,.14)',
];
const galleryLabels = ['Основное фото', 'Вид сбоку', 'Деталь', 'В интерьере'];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can be disabled in privacy modes.
  }
}

function fmt(value: number) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

function badgeLabel(product: Product) {
  if (product.badge === 'hit') return 'ХИТ';
  if (product.badge === 'new') return 'НОВИНКА';
  if (product.badge === 'sale' && product.old) {
    return `−${Math.round((1 - product.price / product.old) * 100)}%`;
  }
  return '';
}

function badgeMeta(badge: Badge) {
  return {
    bg: badge === 'sale' ? 'var(--green)' : badge === 'new' ? 'var(--purple)' : 'var(--yellow)',
    color: badge === 'new' ? '#fff' : '#241c00',
  };
}

function sortedProducts(list: Product[], sort: SortKey) {
  const sorted = [...list];
  if (sort === 'cheap') sorted.sort((a, b) => a.price - b.price);
  else if (sort === 'exp') sorted.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
  else if (sort === 'new') sorted.sort((a, b) => b.id - a.id);
  else if (sort === 'discount') sorted.sort((a, b) => (b.old ? b.old - b.price : 0) - (a.old ? a.old - a.price : 0));
  else sorted.sort((a, b) => b.popularity - a.popularity);
  return sorted;
}

function matchesProduct(product: Product, filters: Filters, query: string) {
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

interface ProductCardProps {
  product: Product;
  fav: boolean;
  compared: boolean;
  onOpen: (id: number) => void;
  onAdd: (id: number) => void;
  onFav: (id: number) => void;
  onCompare: (id: number) => void;
}

function ProductMedia({
  product,
  imageClassName,
  emojiClassName,
  loading = 'lazy',
}: {
  product: Product;
  imageClassName: string;
  emojiClassName: string;
  loading?: 'eager' | 'lazy';
}) {
  if (product.image) {
    return (
      <img
        className={imageClassName}
        src={product.image}
        alt={product.imageAlt ?? product.title}
        loading={loading}
        decoding="async"
      />
    );
  }

  return <span className={emojiClassName}>{product.emoji}</span>;
}

function ProductGalleryMedia({
  product,
  index,
  imageClassName,
  emojiClassName,
  loading = 'lazy',
}: {
  product: Product;
  index: number;
  imageClassName: string;
  emojiClassName: string;
  loading?: 'eager' | 'lazy';
}) {
  const image = index === 0 ? product.images[0] : undefined;

  if (image) {
    return (
      <img
        className={imageClassName}
        src={image}
        alt={product.imageAlt ?? product.title}
        loading={loading}
        decoding="async"
      />
    );
  }

  return <span className={emojiClassName}>{product.emoji}</span>;
}

function ProductCard({ product, fav, compared, onOpen, onAdd, onFav, onCompare }: ProductCardProps) {
  const badge = badgeMeta(product.badge);

  return (
    <article className="product-card" onClick={() => onOpen(product.id)}>
      <div className="product-card__visual">
        <ProductMedia product={product} imageClassName="product-card__image" emojiClassName="product-card__emoji" />
        {product.badge && (
          <span className="badge" style={{ background: badge.bg, color: badge.color }}>
            {badgeLabel(product)}
          </span>
        )}
        <button
          className={fav ? 'round-action product-card__fav active-purple' : 'round-action product-card__fav'}
          title="В избранное"
          onClick={(event) => {
            event.stopPropagation();
            onFav(product.id);
          }}
        >
          <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
        </button>
        <button
          className={compared ? 'round-action product-card__compare active-green' : 'round-action product-card__compare'}
          title="К сравнению"
          onClick={(event) => {
            event.stopPropagation();
            onCompare(product.id);
          }}
        >
          <Repeat2 size={17} />
        </button>
      </div>
      <div className="muted small">{product.brand}</div>
      <h3 className="product-card__title">{product.title}</h3>
      <div className="muted product-card__rating">
        <Star size={14} fill="currentColor" />
        {product.rating} · {product.reviews} отзывов
      </div>
      <div className="product-card__bottom">
        <div>
          {product.old > 0 && <div className="old-price">{fmt(product.old)}</div>}
          <div className="price">{fmt(product.price)}</div>
        </div>
        <button
          className="cart-plus"
          title="В корзину"
          onClick={(event) => {
            event.stopPropagation();
            onAdd(product.id);
          }}
        >
          <Plus size={24} />
        </button>
      </div>
      <span className={compared ? 'compare-state compare-state--on' : 'compare-state'} aria-hidden="true" />
    </article>
  );
}

export function App() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [slide, setSlide] = useState(0);
  const [cart, setCart] = useState<CartLine[]>(() => readStorage('diko_cart', []));
  const [favorites, setFavorites] = useState<number[]>(() => readStorage('diko_fav', []));
  const [compare, setCompare] = useState<number[]>(() => readStorage('diko_compare', []));
  const [recent, setRecent] = useState<number[]>(() => readStorage('diko_recent', []));
  const [user, setUser] = useState<User | null>(() => readStorage('diko_user', null));
  const [token, setToken] = useState<string | null>(() => readStorage('diko_token', null));
  const [bonuses, setBonuses] = useState<number>(() => readStorage('diko_bonuses', 0));
  const [promos, setPromos] = useState<Promo[]>(() => readStorage('diko_promos', []));
  const [orders, setOrders] = useState<Order[]>(() => readStorage('diko_orders', []));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readStorage('diko_theme', 'light'));
  const [a11y, setA11y] = useState<boolean>(() => readStorage('diko_a11y', false));
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('popular');
  const [view, setView] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [pqty, setPqty] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<number, Review[]>>(() => readStorage('diko_reviews', {}));
  const [checkout, setCheckout] = useState<CheckoutFields>(emptyCheckout);
  const [checkoutErrors, setCheckoutErrors] = useState<Partial<Record<keyof CheckoutFields, boolean>>>({});
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [orderDone, setOrderDone] = useState<{ no: string; bonus: number } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', password2: '' });
  const [authErrors, setAuthErrors] = useState<Partial<Record<'name' | 'email' | 'password' | 'password2', string>>>({});
  const [profileForm, setProfileForm] = useState<User | null>(() => readStorage('diko_user', null));
  const [game, setGame] = useState<GameState>(emptyGame);
  const [entered, setEntered] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const enterTimer = useRef<number | null>(null);
  const gameTimer = useRef<number | null>(null);
  const gameLastTick = useRef(0);
  const gameElapsed = useRef(0);
  const gameSpawn = useRef(0);

  useEffect(() => {
    if (!localStorage.getItem('diko_seeded')) {
      writeStorage('diko_users', [demoUser]);
      localStorage.setItem('diko_seeded', '1');
      return;
    }

    const users = readStorage<StoredUser[]>('diko_users', []);
    if (!users.some((item) => item.email === demoUser.email)) {
      writeStorage('diko_users', [demoUser, ...users]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((value) => (value + 1) % promoSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
      if (gameTimer.current) window.clearInterval(gameTimer.current);
    };
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const matched = useMemo(() => products.filter((product) => matchesProduct(product, filters, appliedSearch)), [filters, appliedSearch]);
  const catalogProducts = useMemo(() => sortedProducts(matched, sort), [matched, sort]);
  const shownProducts = catalogProducts.slice(0, page * 9);
  const currentProduct = route.name === 'product' ? products.find((product) => product.id === route.id) : undefined;
  const cartItems = useMemo(
    () =>
      cart
        .map((line) => ({ line, product: products.find((product) => product.id === line.id) }))
        .filter((item): item is { line: CartLine; product: Product } => Boolean(item.product)),
    [cart],
  );
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.line.qty, 0);
  const discount = appliedPromo
    ? Math.min(
        subtotal,
        appliedPromo.type === 'percent' ? Math.round((subtotal * appliedPromo.value) / 100) : appliedPromo.value,
      )
    : 0;
  const afterDiscount = subtotal - discount;
  const delivery = afterDiscount >= 3000 || afterDiscount === 0 ? 0 : 350;
  const orderTotal = afterDiscount + delivery;
  const earnBonus = Math.round(orderTotal / 100);

  const showToast = (msg: string, icon = '✓') => {
    const id = ++toastId.current;
    setToasts((items) => [...items, { id, msg, icon }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 2600);
  };

  const nav = (nextRoute: Route) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEntered(false);
    setRoute(nextRoute);
    if (enterTimer.current) window.clearTimeout(enterTimer.current);
    enterTimer.current = window.setTimeout(() => setEntered(true), 30);
  };

  const goCatalog = () => {
    setPage(1);
    nav({ name: 'catalog' });
  };

  const addToCart = (id: number, qty = 1) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === id);
      const next = existing
        ? items.map((item) => (item.id === id ? { ...item, qty: item.qty + qty } : item))
        : [...items, { id, qty }];
      writeStorage('diko_cart', next);
      return next;
    });
    showToast('Добавлено в корзину', '🛒');
  };

  const setQty = (id: number, qty: number) => {
    if (qty < 1) return;
    setCart((items) => {
      const next = items.map((item) => (item.id === id ? { ...item, qty } : item));
      writeStorage('diko_cart', next);
      return next;
    });
  };

  const removeFromCart = (id: number) => {
    setCart((items) => {
      const next = items.filter((item) => item.id !== id);
      writeStorage('diko_cart', next);
      return next;
    });
    showToast('Удалено из корзины', '🗑️');
  };

  const toggleFav = (id: number) => {
    const active = favorites.includes(id);
    const next = active ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    writeStorage('diko_fav', next);
    showToast(active ? 'Убрано из избранного' : 'В избранном', '♥');
  };

  const toggleCompare = (id: number) => {
    const active = compare.includes(id);
    if (active) {
      const next = compare.filter((item) => item !== id);
      setCompare(next);
      writeStorage('diko_compare', next);
      showToast('Убрано из сравнения', '⇄');
      return;
    }
    if (compare.length >= 4) {
      showToast('В сравнении максимум 4 товара', '⇄');
      return;
    }
    const next = [...compare, id];
    setCompare(next);
    writeStorage('diko_compare', next);
    showToast('Добавлено к сравнению', '⇄');
  };

  const openProduct = (id: number) => {
    setRecent((items) => {
      const next = [id, ...items.filter((item) => item !== id)].slice(0, 8);
      writeStorage('diko_recent', next);
      return next;
    });
    setPqty(1);
    setGalleryIndex(0);
    setReviewRating(5);
    setReviewText('');
    setEditReviewId(null);
    nav({ name: 'product', id });
  };

  const setFilterField = (patch: Partial<Filters>) => {
    setFilters((value) => ({ ...value, ...patch }));
    setPage(1);
  };

  const toggleFilterArray = <T extends 'pets' | 'cats' | 'brands' | 'purposes'>(key: T, value: Filters[T][number]) => {
    setFilters((current) => {
      const list = current[key] as Array<typeof value>;
      const nextList = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [key]: nextList };
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
    showToast('Фильтры сброшены', '↺');
  };

  const submitReview = () => {
    if (!currentProduct) return;
    const text = reviewText.trim();
    if (!text) {
      showToast('Напишите текст отзыва', '✍️');
      return;
    }
    const wasEdit = Boolean(editReviewId);
    setReviews((items) => {
      const list = [...(items[currentProduct.id] ?? [])];
      if (editReviewId) {
        const index = list.findIndex((review) => review.id === editReviewId);
        if (index >= 0) list[index] = { ...list[index], rating: reviewRating, text };
      } else {
        list.unshift({
          id: `r${Date.now()}`,
          author: user?.name ?? 'Гость',
          rating: reviewRating,
          text,
          date: new Date().toLocaleDateString('ru-RU'),
          mine: true,
          productId: currentProduct.id,
        });
      }
      const next = { ...items, [currentProduct.id]: list };
      writeStorage('diko_reviews', next);
      return next;
    });
    setReviewText('');
    setReviewRating(5);
    setEditReviewId(null);
    showToast(wasEdit ? 'Отзыв обновлён' : 'Спасибо за отзыв!', '★');
  };

  const deleteReview = (id: string) => {
    setReviews((items) => {
      const targetId = currentProduct?.id ?? Number(Object.keys(items).find((productId) => (items[Number(productId)] ?? []).some((review) => review.id === id)));
      if (!targetId) return items;
      const next = { ...items, [targetId]: (items[targetId] ?? []).filter((review) => review.id !== id) };
      writeStorage('diko_reviews', next);
      return next;
    });
    showToast('Отзыв удалён', '🗑️');
  };

  const goCheckout = () => {
    setOrderDone(null);
    nav({ name: 'checkout' });
  };

  const setCheckoutField = <K extends keyof CheckoutFields>(key: K, value: CheckoutFields[K]) => {
    setCheckout((current) => ({ ...current, [key]: value }));
    setCheckoutErrors((current) => ({ ...current, [key]: false }));
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const promo = promoCatalog[code] ?? promos.find((item) => item.code === code) ?? null;
    if (!promo) {
      showToast('Промокод не найден', '✕');
      return;
    }

    setAppliedPromo(promo);
    showToast(`Промокод применён: ${promo.type === 'percent' ? `−${promo.value}%` : `−${fmt(promo.value)}`}`, '🎟️');
  };

  const placeOrder = () => {
    if (!user) {
      showToast('Сначала войдите в аккаунт', '🔒');
      setAuthMode('login');
      nav({ name: 'auth' });
      return;
    }

    const errors: Partial<Record<keyof CheckoutFields, boolean>> = {};
    if (!checkout.name.trim()) errors.name = true;
    if (!/^[\d\s+\-()]{6,}$/.test(checkout.phone.trim())) errors.phone = true;
    if (checkout.address.trim().length < 6) errors.address = true;

    if (Object.keys(errors).length) {
      setCheckoutErrors(errors);
      showToast('Проверьте поля доставки', '⚠️');
      return;
    }

    const no = `#${Math.floor(100000 + Math.random() * 899999)}`;
    const bonus = earnBonus;
    const order: Order = {
      no,
      date: new Date().toLocaleDateString('ru-RU'),
      total: orderTotal,
      bonus,
      status: 'В обработке',
      items: cartItems.map(({ line, product }) => ({
        id: product.id,
        title: product.title,
        emoji: product.emoji,
        qty: line.qty,
        price: product.price,
      })),
    };

    const nextOrders = [order, ...orders];
    const nextBonuses = bonuses + bonus;
    const nextPromos = appliedPromo ? promos.filter((item) => item.code !== appliedPromo.code) : promos;

    setOrders(nextOrders);
    setBonuses(nextBonuses);
    setPromos(nextPromos);
    setCart([]);
    setAppliedPromo(null);
    setPromoInput('');
    setCheckout(emptyCheckout);
    setOrderDone({ no, bonus });
    writeStorage('diko_orders', nextOrders);
    writeStorage('diko_bonuses', nextBonuses);
    writeStorage('diko_promos', nextPromos);
    writeStorage('diko_cart', []);
    showToast('Заказ оформлен!', '🎉');
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthForm({ name: '', email: '', password: '', password2: '' });
    setAuthErrors({});
    nav({ name: 'auth' });
  };

  const setAuthField = (key: keyof typeof authForm, value: string) => {
    setAuthForm((current) => ({ ...current, [key]: value }));
    setAuthErrors((current) => ({ ...current, [key]: undefined }));
  };

  const loginUser = (storedUser: StoredUser) => {
    const publicUser: User = {
      name: storedUser.name,
      email: storedUser.email,
      phone: storedUser.phone ?? '',
      city: storedUser.city ?? '',
    };
    const nextToken = `diko.${btoa(unescape(encodeURIComponent(storedUser.email))).replace(/=/g, '')}.${Date.now().toString(36)}`;
    setUser(publicUser);
    setToken(nextToken);
    setProfileForm(publicUser);
    writeStorage('diko_user', publicUser);
    writeStorage('diko_token', nextToken);
    nav({ name: 'account', tab: 'profile' });
  };

  const submitAuth = () => {
    const register = authMode === 'register';
    const errors: Partial<Record<'name' | 'email' | 'password' | 'password2', string>> = {};
    const email = authForm.email.trim().toLowerCase();

    if (register && authForm.name.trim().length < 2) errors.name = 'Введите имя (мин. 2 символа)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Некорректный e-mail';
    if (authForm.password.length < 6) errors.password = 'Минимум 6 символов';
    if (register && authForm.password2 !== authForm.password) errors.password2 = 'Пароли не совпадают';

    const users = readStorage<StoredUser[]>('diko_users', []);
    if (register && !errors.email && users.some((item) => item.email.toLowerCase() === email)) {
      errors.email = 'Этот e-mail уже зарегистрирован';
    }

    if (Object.keys(errors).length) {
      setAuthErrors(errors);
      return;
    }

    if (register) {
      const nextUser: StoredUser = {
        name: authForm.name.trim(),
        email,
        password: authForm.password,
      };
      writeStorage('diko_users', [...users, nextUser]);
      loginUser(nextUser);
      showToast('Аккаунт создан. Добро пожаловать!', '🎉');
      return;
    }

    const found = users.find((item) => item.email.toLowerCase() === email && item.password === authForm.password);
    if (!found) {
      setAuthErrors({ password: 'Неверный e-mail или пароль' });
      return;
    }

    loginUser(found);
    showToast('Вы вошли. Рады видеть!', '👋');
  };

  const logout = () => {
    localStorage.removeItem('diko_user');
    localStorage.removeItem('diko_token');
    setUser(null);
    setToken(null);
    setProfileForm(null);
    showToast('Вы вышли из аккаунта', '↪');
    nav({ name: 'home' });
  };

  const setProfileField = (key: keyof User, value: string) => {
    setProfileForm((current) => ({ ...(current ?? user ?? { name: '' }), [key]: value }));
  };

  const saveProfile = () => {
    if (!profileForm || !user?.email) return;
    const nextUser = { ...user, ...profileForm };
    const users = readStorage<StoredUser[]>('diko_users', []);
    const nextUsers = users.map((item) => (item.email.toLowerCase() === user.email?.toLowerCase() ? { ...item, ...profileForm } : item));
    setUser(nextUser);
    setProfileForm(nextUser);
    writeStorage('diko_user', nextUser);
    writeStorage('diko_users', nextUsers);
    showToast('Профиль сохранён', '✓');
  };

  const stopGameLoop = () => {
    if (gameTimer.current) window.clearInterval(gameTimer.current);
    gameTimer.current = null;
  };

  const startGame = () => {
    stopGameLoop();
    setGame({ ...emptyGame, toys: [], result: null });
    nav({ name: 'game' });
  };

  const createGameResult = (score: number) => {
    let promo: Promo | null = null;
    let title = 'Игра окончена';
    let emoji = '🐾';

    if (score >= 45) {
      promo = { code: 'DIKOMEGA20', type: 'percent', value: 20 };
      title = 'Дикий рекорд!';
      emoji = '🏆';
    } else if (score >= 28) {
      promo = { code: 'DIKOGAME15', type: 'percent', value: 15 };
      title = 'Отличный улов!';
      emoji = '🎉';
    } else if (score >= 14) {
      promo = { code: 'DIKOPLAY10', type: 'percent', value: 10 };
      title = 'Неплохо!';
      emoji = '😺';
    }

    return {
      score,
      bonus: score,
      promo,
      title,
      emoji,
      text: promo
        ? `Вы набрали ${score} очков и заработали ${score} бонусов. Промокод уже в личном кабинете.`
        : `Вы набрали ${score} очков и заработали ${score} бонусов. Наберите 14+ очков, чтобы выиграть промокод.`,
    };
  };

  const finishRound = (score: number) => {
    stopGameLoop();
    const result = createGameResult(score);
    const nextBonuses = bonuses + result.bonus;
    const nextPromos = result.promo && !promos.some((item) => item.code === result.promo?.code) ? [...promos, result.promo] : promos;

    setBonuses(nextBonuses);
    setPromos(nextPromos);
    writeStorage('diko_bonuses', nextBonuses);
    writeStorage('diko_promos', nextPromos);
    if (result.bonus > 0) showToast(`+${result.bonus} бонусов начислено`, '🦴');
    return result;
  };

  const gameTick = () => {
    const now = performance.now();
    const dt = Math.min(50, now - gameLastTick.current) / 1000;
    gameLastTick.current = now;
    gameElapsed.current += dt;
    gameSpawn.current += dt;

    setGame((current) => {
      if (current.phase !== 'play') return current;

      let score = current.score;
      let toys = current.toys.map((toy) => ({ ...toy, y: toy.y + toy.vy * dt }));
      const kept = [];

      for (const toy of toys) {
        if (toy.y >= 86 && toy.y <= 99 && Math.abs(toy.x - current.basket) < 10) {
          score = toy.type === 'bomb' ? Math.max(0, score - 5) : score + toy.pts;
          continue;
        }
        if (toy.y <= 104) kept.push(toy);
      }

      toys = kept;
      if (gameSpawn.current > 0.62) {
        gameSpawn.current = 0;
        const roll = Math.random();
        const base =
          roll < 0.12
            ? { type: 'bomb' as const, emoji: '💣', pts: 0, size: '34px' }
            : roll < 0.42
              ? { type: 'ball' as const, emoji: '🎾', pts: 1, size: '32px' }
              : roll < 0.74
                ? { type: 'bone' as const, emoji: '🦴', pts: 2, size: '34px' }
                : { type: 'worm' as const, emoji: '🐛', pts: 3, size: '30px' };
        toys.push({
          id: Math.random(),
          x: 8 + Math.random() * 84,
          y: -4,
          vy: 26 + Math.random() * 16 + gameElapsed.current * 0.6,
          ...base,
        });
      }

      const time = Math.max(0, Math.ceil(30 - gameElapsed.current));
      if (gameElapsed.current >= 30) {
        return { ...current, toys: [], score, time: 0, phase: 'over', result: finishRound(score) };
      }

      return { ...current, toys, score, time };
    });
  };

  const startRound = () => {
    stopGameLoop();
    gameElapsed.current = 0;
    gameSpawn.current = 0;
    gameLastTick.current = performance.now();
    setGame({ phase: 'play', score: 0, time: 30, toys: [], basket: 50, result: null });
    gameTimer.current = window.setInterval(gameTick, 1000 / 60);
  };

  useEffect(() => {
    if (route.name !== 'game' || game.phase !== 'play') return undefined;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setGame((current) => ({ ...current, basket: Math.max(6, current.basket - 6) }));
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setGame((current) => ({ ...current, basket: Math.min(94, current.basket + 6) }));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [route.name, game.phase]);

  const favoriteProducts = products.filter((product) => favorites.includes(product.id));
  const comparedProducts = products.filter((product) => compare.includes(product.id));
  const recentProducts = recent.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];
  const myReviews = Object.entries(reviews).flatMap(([productId, list]) => {
    const product = products.find((item) => item.id === Number(productId));
    if (!product) return [];
    return list.filter((review) => review.mine).map((review) => ({ ...review, product }));
  });

  const appActions = {
    openProduct,
    addToCart,
    toggleFav,
    toggleCompare,
  };

  return (
    <div className="app" data-theme={theme} data-a11y={a11y ? 'true' : 'false'}>
      <Header
        theme={theme}
        a11y={a11y}
        search={search}
        user={user}
        cartCount={cartCount}
        favCount={favorites.length}
        compareCount={compare.length}
        onSearch={setSearch}
        onSearchSubmit={() => {
          setAppliedSearch(search);
          setPage(1);
          nav({ name: 'catalog' });
        }}
        onHome={() => nav({ name: 'home' })}
        onCatalog={goCatalog}
        onPopular={() => {
          setSort('popular');
          setPage(1);
          nav({ name: 'catalog' });
        }}
        onTheme={() => {
          const next = theme === 'light' ? 'dark' : 'light';
          setTheme(next);
          writeStorage('diko_theme', next);
        }}
        onA11y={() => {
          const next = !a11y;
          setA11y(next);
          writeStorage('diko_a11y', next);
          showToast(next ? 'Режим для слабовидящих включён' : 'Обычный режим', '👁️');
        }}
        onCart={() => nav({ name: 'cart' })}
        onFav={() => nav({ name: 'favorites' })}
        onCompare={() => nav({ name: 'compare' })}
        onAccount={() => (user ? nav({ name: 'account', tab: 'profile' }) : openAuth('login'))}
        onGame={startGame}
      />

      <main className={entered ? 'route route--entered' : 'route'}>
        {route.name === 'home' && (
          <HomeScreen
            slide={slide}
            recentProducts={recentProducts}
            favorites={favorites}
            compare={compare}
            onSlide={setSlide}
            onCatalog={goCatalog}
            onSetCategory={(cat) => {
              setFilters((value) => ({ ...value, cats: [cat] }));
              setPage(1);
              nav({ name: 'catalog' });
            }}
            onSetBrand={(brand) => {
              setFilters((value) => ({ ...value, brands: [brand] }));
              setPage(1);
              nav({ name: 'catalog' });
            }}
            onGame={startGame}
            actions={appActions}
          />
        )}
        {route.name === 'catalog' && (
          <CatalogScreen
            filters={filters}
            sort={sort}
            view={view}
            matchedCount={matched.length}
            shownProducts={shownProducts}
            hasMore={catalogProducts.length > page * 9}
            nextCount={Math.min(9, catalogProducts.length - page * 9)}
            favorites={favorites}
            compare={compare}
            appliedSearch={appliedSearch}
            onFilter={setFilterField}
            onToggleArray={toggleFilterArray}
            onClear={clearFilters}
            onSort={(value) => {
              setSort(value);
              setPage(1);
            }}
            onView={setView}
            onMore={() => setPage((value) => value + 1)}
            onHome={() => nav({ name: 'home' })}
            actions={appActions}
          />
        )}
        {route.name === 'product' && currentProduct && (
          <ProductScreen
            product={currentProduct}
            favorites={favorites}
            compare={compare}
            qty={pqty}
            galleryIndex={galleryIndex}
            reviews={reviews[currentProduct.id] ?? []}
            reviewRating={reviewRating}
            reviewText={reviewText}
            editReviewId={editReviewId}
            related={products.filter((product) => product.id !== currentProduct.id && (product.cat === currentProduct.cat || product.pet === currentProduct.pet)).slice(0, 4)}
            onQty={setPqty}
            onGallery={setGalleryIndex}
            onReviewRating={setReviewRating}
            onReviewText={setReviewText}
            onReviewEdit={(review) => {
              setEditReviewId(review.id);
              setReviewRating(review.rating);
              setReviewText(review.text);
            }}
            onReviewCancel={() => {
              setEditReviewId(null);
              setReviewText('');
              setReviewRating(5);
            }}
            onReviewSubmit={submitReview}
            onReviewDelete={deleteReview}
            onHome={() => nav({ name: 'home' })}
            onCatalog={goCatalog}
            actions={appActions}
          />
        )}
        {route.name === 'cart' && (
          <CartScreen
            items={cartItems}
            cartCount={cartCount}
            subtotal={subtotal}
            discount={discount}
            delivery={delivery}
            total={orderTotal}
            earnBonus={earnBonus}
            onQty={setQty}
            onRemove={removeFromCart}
            onCatalog={goCatalog}
            onCheckout={goCheckout}
            onOpen={openProduct}
          />
        )}
        {route.name === 'favorites' && (
          <ProductCollectionScreen
            title="Избранное"
            empty="В избранном пока нет товаров."
            products={favoriteProducts}
            favorites={favorites}
            compare={compare}
            onCatalog={goCatalog}
            onAddAll={() => favoriteProducts.forEach((product) => addToCart(product.id))}
            actions={appActions}
          />
        )}
        {route.name === 'compare' && (
          <CompareScreen products={comparedProducts} favorites={favorites} compare={compare} onCatalog={goCatalog} actions={appActions} />
        )}
        {route.name === 'auth' && (
          <AuthScreen
            mode={authMode}
            form={authForm}
            errors={authErrors}
            onMode={setAuthMode}
            onField={setAuthField}
            onSubmit={submitAuth}
          />
        )}
        {route.name === 'account' && user && (
          <AccountScreen
            user={user}
            tab={route.tab ?? 'profile'}
            bonuses={bonuses}
            promos={promos}
            orders={orders}
            reviews={myReviews}
            profileForm={profileForm ?? user}
            onTab={(tab) => nav({ name: 'account', tab })}
            onLogout={logout}
            onProfileField={setProfileField}
            onSaveProfile={saveProfile}
            onGame={startGame}
            onOpenProduct={openProduct}
            onDeleteReview={deleteReview}
          />
        )}
        {route.name === 'account' && !user && (
          <AuthScreen
            mode={authMode}
            form={authForm}
            errors={authErrors}
            onMode={setAuthMode}
            onField={setAuthField}
            onSubmit={submitAuth}
          />
        )}
        {route.name === 'game' && (
          <GameScreen
            game={game}
            bonuses={bonuses}
            promoCount={promos.length}
            onStart={startRound}
            onCatalog={goCatalog}
            onBasket={(basket) => setGame((current) => (current.phase === 'play' ? { ...current, basket } : current))}
          />
        )}
        {route.name === 'checkout' && (
          <CheckoutScreen
            cartEmpty={cartItems.length === 0}
            user={user}
            checkout={checkout}
            errors={checkoutErrors}
            subtotal={subtotal}
            discount={discount}
            delivery={delivery}
            total={orderTotal}
            promos={promos}
            promoInput={promoInput}
            appliedPromo={appliedPromo}
            orderDone={orderDone}
            onCart={() => nav({ name: 'cart' })}
            onCatalog={goCatalog}
            onAuth={() => openAuth('login')}
            onOrders={() => nav({ name: 'account', tab: 'orders' })}
            onField={setCheckoutField}
            onPromoInput={setPromoInput}
            onApplyPromo={applyPromo}
            onPlaceOrder={placeOrder}
          />
        )}
      </main>

      <Footer />
      <ToastStack toasts={toasts} />
    </div>
  );
}

function Header(props: {
  theme: 'light' | 'dark';
  a11y: boolean;
  search: string;
  user: User | null;
  cartCount: number;
  favCount: number;
  compareCount: number;
  onSearch: (value: string) => void;
  onSearchSubmit: () => void;
  onHome: () => void;
  onCatalog: () => void;
  onPopular: () => void;
  onTheme: () => void;
  onA11y: () => void;
  onCart: () => void;
  onFav: () => void;
  onCompare: () => void;
  onAccount: () => void;
  onGame: () => void;
}) {
  return (
    <header className="header">
      <div className="header__inner">
        <button className="logo" onClick={props.onHome}>
          ДИКО<span>.</span>
        </button>
        <nav className="top-nav">
          <button onClick={props.onCatalog}>Каталог</button>
          <button onClick={props.onPopular}>Популярное</button>
          <button onClick={props.onHome}>Акции</button>
          <button className="top-nav__accent" onClick={props.onGame}>
            Игра
          </button>
        </nav>
        <form
          className="search"
          onSubmit={(event) => {
            event.preventDefault();
            props.onSearchSubmit();
          }}
        >
          <Search size={18} />
          <input
            value={props.search}
            onChange={(event) => props.onSearch(event.target.value)}
            placeholder="Поиск: эублефар, корм, террариум..."
          />
        </form>
        <div className="header-actions">
          <button className="icon-button" title="Тема" onClick={props.onTheme}>
            {props.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="icon-button" title="Версия для слабовидящих" onClick={props.onA11y}>
            <Eye size={18} />
          </button>
          <BadgeButton count={props.compareCount} title="Сравнение" onClick={props.onCompare}>
            <Repeat2 size={18} />
          </BadgeButton>
          <BadgeButton count={props.favCount} title="Избранное" onClick={props.onFav}>
            <Heart size={18} fill="currentColor" />
          </BadgeButton>
          <BadgeButton count={props.cartCount} title="Корзина" dark onClick={props.onCart}>
            <ShoppingCart size={18} />
          </BadgeButton>
          <button className="profile-button" onClick={props.onAccount} title="Профиль">
            <span>{props.user ? props.user.name.trim().charAt(0).toUpperCase() : '☺'}</span>
            <strong>{props.user ? props.user.name.split(' ')[0] : 'Войти'}</strong>
          </button>
        </div>
      </div>
    </header>
  );
}

function BadgeButton(props: { count: number; title: string; dark?: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button className={props.dark ? 'icon-button icon-button--dark' : 'icon-button'} title={props.title} onClick={props.onClick}>
      {props.children}
      {props.count > 0 && <span className="count-badge">{props.count}</span>}
    </button>
  );
}

function HomeScreen(props: {
  slide: number;
  recentProducts: Product[];
  favorites: number[];
  compare: number[];
  onSlide: (value: number) => void;
  onCatalog: () => void;
  onSetCategory: (cat: CategoryId) => void;
  onSetBrand: (brand: string) => void;
  onGame: () => void;
  actions: ProductActions;
}) {
  const popular = sortedProducts(products, 'popular').slice(0, 8);
  const current = promoSlides[props.slide];

  return (
    <section className="page">
      <div className="hero">
        {promoSlides.map((promo, index) => (
          <div className="hero__slide" key={promo.tag} style={{ background: promo.bg, opacity: index === props.slide ? 1 : 0 }}>
            <div className="hero__copy">
              <span className="hero__tag" style={{ background: promo.tagBg, color: promo.tagText }}>
                {promo.tag}
              </span>
              <h1 style={{ color: promo.text }}>{promo.title}</h1>
              <p style={{ color: promo.text }}>{promo.sub}</p>
              <button
                className="pill-button"
                style={{ background: promo.btnBg, color: promo.btnText }}
                onClick={() => {
                  if (promo.target.name === 'game') props.onGame();
                  else if (promo.target.cat) props.onSetCategory(promo.target.cat);
                }}
              >
                {promo.cta}
              </button>
            </div>
            <div className="hero__visual">
              {promo.image ? (
                <img src={promo.image} alt={promo.imageAlt} draggable={false} />
              ) : (
                <span>{promo.emoji}</span>
              )}
            </div>
          </div>
        ))}
        <button className="hero-arrow hero-arrow--left" onClick={() => props.onSlide((props.slide - 1 + promoSlides.length) % promoSlides.length)}>
          <ChevronLeft size={24} />
        </button>
        <button className="hero-arrow hero-arrow--right" onClick={() => props.onSlide((props.slide + 1) % promoSlides.length)}>
          <ChevronRight size={24} />
        </button>
        <div className="hero-dots">
          {promoSlides.map((promo, index) => (
            <button
              key={promo.tag}
              className={index === props.slide ? 'hero-dot hero-dot--active' : 'hero-dot'}
              style={{ background: index === props.slide ? current.text : 'rgba(0,0,0,.25)' }}
              onClick={() => props.onSlide(index)}
            />
          ))}
        </div>
      </div>

      <SectionTitle title="Категории" />
      <div className="category-grid">
        {categories.slice(0, 6).map((category) => (
          <button className="category-tile" key={category.id} onClick={() => props.onSetCategory(category.id)}>
            <span>{category.emoji}</span>
            <strong>{category.name}</strong>
          </button>
        ))}
      </div>

      <SectionTitle title="Популярное" action="Весь каталог" onAction={props.onCatalog} />
      <ProductGrid products={popular} favorites={props.favorites} compare={props.compare} actions={props.actions} />

      {props.recentProducts.length > 0 && (
        <>
          <SectionTitle title="Вы недавно смотрели" />
          <ProductGrid products={props.recentProducts} favorites={props.favorites} compare={props.compare} actions={props.actions} />
        </>
      )}

      <SectionTitle title="Популярные бренды" />
      <div className="brand-row">
        {brandChips.map((brand) => (
          <button key={brand} onClick={() => props.onSetBrand(brand)}>
            {brand}
          </button>
        ))}
      </div>
    </section>
  );
}

type ProductActions = {
  openProduct: (id: number) => void;
  addToCart: (id: number, qty?: number) => void;
  toggleFav: (id: number) => void;
  toggleCompare: (id: number) => void;
};

function ProductGrid(props: { products: Product[]; favorites: number[]; compare: number[]; actions: ProductActions }) {
  return (
    <div className="product-grid">
      {props.products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          fav={props.favorites.includes(product.id)}
          compared={props.compare.includes(product.id)}
          onOpen={props.actions.openProduct}
          onAdd={props.actions.addToCart}
          onFav={props.actions.toggleFav}
          onCompare={props.actions.toggleCompare}
        />
      ))}
    </div>
  );
}

function SectionTitle(props: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-title">
      <h2>{props.title}</h2>
      {props.action && (
        <button onClick={props.onAction}>
          {props.action}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

function CatalogScreen(props: {
  filters: Filters;
  sort: SortKey;
  view: ViewMode;
  matchedCount: number;
  shownProducts: Product[];
  hasMore: boolean;
  nextCount: number;
  favorites: number[];
  compare: number[];
  appliedSearch: string;
  onFilter: (patch: Partial<Filters>) => void;
  onToggleArray: <T extends 'pets' | 'cats' | 'brands' | 'purposes'>(key: T, value: Filters[T][number]) => void;
  onClear: () => void;
  onSort: (value: SortKey) => void;
  onView: (value: ViewMode) => void;
  onMore: () => void;
  onHome: () => void;
  actions: ProductActions;
}) {
  const title = catalogTitle(props.filters, props.appliedSearch);
  const brands = [...new Set(products.map((product) => product.brand))].sort();
  const count = (fn: (product: Product) => boolean) => products.filter(fn).length;

  return (
    <section className="page">
      <Breadcrumb onHome={props.onHome} trail={['Каталог']} />
      <h1 className="page-title">{title}</h1>
      <p className="muted page-subtitle">Найдено товаров: {props.matchedCount}</p>
      <div className="catalog-layout">
        <aside className="filters-panel">
          <div className="filters-panel__head">
            <h2>Фильтры</h2>
            <button onClick={props.onClear}>
              <RotateCcw size={14} />
              Сбросить
            </button>
          </div>
          <FilterBlock title="Цена, ₽">
            <div className="range-row">
              <input type="number" value={props.filters.priceMin} onChange={(event) => props.onFilter({ priceMin: Number(event.target.value) || 0 })} />
              <span>—</span>
              <input type="number" value={props.filters.priceMax} onChange={(event) => props.onFilter({ priceMax: Number(event.target.value) || 0 })} />
            </div>
            <input type="range" min={0} max={8000} step={100} value={props.filters.priceMax} onChange={(event) => props.onFilter({ priceMax: Number(event.target.value) || 0 })} />
          </FilterBlock>
          <FilterBlock title="Вид животного">
            {pets.map((pet) => (
              <CheckLine
                key={pet.id}
                checked={props.filters.pets.includes(pet.id)}
                label={`${pet.emoji} ${pet.name}`}
                count={count((product) => product.pet === pet.id)}
                onChange={() => props.onToggleArray('pets', pet.id as PetId)}
              />
            ))}
          </FilterBlock>
          <FilterBlock title="Категория">
            {categories.map((category) => (
              <CheckLine
                key={category.id}
                checked={props.filters.cats.includes(category.id)}
                label={category.name}
                count={count((product) => product.cat === category.id)}
                onChange={() => props.onToggleArray('cats', category.id as CategoryId)}
              />
            ))}
          </FilterBlock>
          <FilterBlock title="Бренд">
            {brands.map((brand) => (
              <CheckLine key={brand} checked={props.filters.brands.includes(brand)} label={brand} onChange={() => props.onToggleArray('brands', brand)} />
            ))}
          </FilterBlock>
          <FilterBlock title="Назначение">
            {purposes.map((purpose) => (
              <CheckLine key={purpose} checked={props.filters.purposes.includes(purpose)} label={purpose} onChange={() => props.onToggleArray('purposes', purpose)} />
            ))}
          </FilterBlock>
          <FilterBlock title="Вес упаковки">
            <select value={props.filters.weight} onChange={(event) => props.onFilter({ weight: event.target.value as Filters['weight'] })}>
              <option value="any">Любой</option>
              <option value="light">до 500 г</option>
              <option value="mid">500 г – 2 кг</option>
              <option value="heavy">от 2 кг</option>
            </select>
          </FilterBlock>
          <FilterBlock title="Возраст животного">
            <select value={props.filters.age} onChange={(event) => props.onFilter({ age: event.target.value as Filters['age'] })}>
              <option value="any">Любой</option>
              <option value="baby">Молодые</option>
              <option value="adult">Взрослые</option>
            </select>
          </FilterBlock>
          <FilterBlock title="Рейтинг">
            {[
              [0, 'Любой'],
              [4, 'от 4★'],
              [4.5, 'от 4.5★'],
            ].map(([value, label]) => (
              <RadioLine key={String(value)} checked={props.filters.rating === value} label={String(label)} onChange={() => props.onFilter({ rating: Number(value) })} />
            ))}
          </FilterBlock>
          <label className="toggle-line">
            <span>Только в наличии</span>
            <input type="checkbox" checked={props.filters.inStock} onChange={(event) => props.onFilter({ inStock: event.target.checked })} />
          </label>
        </aside>

        <div className="catalog-main">
          <div className="sort-panel">
            <div className="sort-panel__chips">
              {sortDefs.map(([key, label]) => (
                <button key={key} className={props.sort === key ? 'chip chip--active' : 'chip'} onClick={() => props.onSort(key)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="view-switch">
              <button className={props.view === 'grid' ? 'view-switch__button active' : 'view-switch__button'} title="Сеткой" onClick={() => props.onView('grid')}>
                <Grid3X3 size={18} />
              </button>
              <button className={props.view === 'list' ? 'view-switch__button active' : 'view-switch__button'} title="Списком" onClick={() => props.onView('list')}>
                <List size={18} />
              </button>
            </div>
          </div>
          {props.matchedCount === 0 ? (
            <EmptyState icon={<PackageSearch size={48} />} title="Ничего не найдено" text="Попробуйте смягчить фильтры или сбросить их." action="Сбросить фильтры" onAction={props.onClear} />
          ) : props.view === 'grid' ? (
            <ProductGrid products={props.shownProducts} favorites={props.favorites} compare={props.compare} actions={props.actions} />
          ) : (
            <div className="product-list">
              {props.shownProducts.map((product) => (
                <article className="product-row" key={product.id} onClick={() => props.actions.openProduct(product.id)}>
                  <div className="product-row__visual">
                    <ProductMedia product={product} imageClassName="product-row__image" emojiClassName="product-row__emoji" />
                  </div>
                  <div className="product-row__body">
                    <div className="muted small">{product.brand}</div>
                    <h3>{product.title}</h3>
                    <p className="muted">★ {product.rating} · {product.reviews} отзывов · {product.petName}</p>
                    <p className="muted product-row__stock">{product.stock ? 'В наличии' : 'Под заказ'}</p>
                  </div>
                  <div className="product-row__aside">
                    <strong>{fmt(product.price)}</strong>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        props.actions.addToCart(product.id);
                      }}
                    >
                      В корзину
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {props.hasMore && (
            <div className="load-more">
              <button onClick={props.onMore}>Показать ещё {props.nextCount}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function catalogTitle(filters: Filters, appliedSearch: string) {
  if (filters.cats.length === 1) return categories.find((cat) => cat.id === filters.cats[0])?.name ?? 'Каталог товаров';
  if (filters.brands.length === 1) return filters.brands[0];
  if (filters.pets.length === 1) return `Всё для: ${pets.find((pet) => pet.id === filters.pets[0])?.name ?? ''}`;
  if (appliedSearch) return `Поиск: «${appliedSearch}»`;
  return 'Каталог товаров';
}

function ProductScreen(props: {
  product: Product;
  favorites: number[];
  compare: number[];
  qty: number;
  galleryIndex: number;
  reviews: Review[];
  reviewRating: number;
  reviewText: string;
  editReviewId: string | null;
  related: Product[];
  onQty: (value: number) => void;
  onGallery: (value: number) => void;
  onReviewRating: (value: number) => void;
  onReviewText: (value: string) => void;
  onReviewEdit: (review: Review) => void;
  onReviewCancel: () => void;
  onReviewSubmit: () => void;
  onReviewDelete: (id: string) => void;
  onHome: () => void;
  onCatalog: () => void;
  actions: ProductActions;
}) {
  const badge = badgeMeta(props.product.badge);
  const inFav = props.favorites.includes(props.product.id);
  const inCompare = props.compare.includes(props.product.id);

  return (
    <section className="page">
      <Breadcrumb onHome={props.onHome} catalog={{ label: 'Каталог', onClick: props.onCatalog }} trail={[props.product.title]} />
      <div className="product-detail">
        <div className="gallery">
          <div className="gallery__main" style={{ background: galleryTints[props.galleryIndex] }}>
            <ProductGalleryMedia product={props.product} index={props.galleryIndex} imageClassName="gallery__image" emojiClassName="gallery__emoji" loading="eager" />
          </div>
          <div className="gallery__thumbs">
            {galleryLabels.map((label, index) => (
              <button
                key={label}
                title={label}
                className={index === props.galleryIndex ? 'gallery__thumb gallery__thumb--active' : 'gallery__thumb'}
                style={{ background: galleryTints[index] }}
                onClick={() => props.onGallery(index)}
              >
                <ProductGalleryMedia product={props.product} index={index} imageClassName="gallery__thumb-image" emojiClassName="gallery__thumb-emoji" />
              </button>
            ))}
          </div>
        </div>
        <div className="product-info">
          <div className="product-info__meta">
            <span>{props.product.brand}</span>
            {props.product.badge && (
              <span className="badge" style={{ background: badge.bg, color: badge.color }}>
                {badgeLabel(props.product)}
              </span>
            )}
          </div>
          <h1>{props.product.title}</h1>
          <div className="rating-line">
            <span>★ {props.product.rating}</span>
            <span>{props.product.reviews} отзывов</span>
            <span>·</span>
            <span>{props.product.stock ? 'В наличии' : 'Под заказ'}</span>
          </div>
          <div className="detail-price">
            <strong>{fmt(props.product.price)}</strong>
            {props.product.old > 0 && <span>{fmt(props.product.old)}</span>}
          </div>
          <div className="buy-row">
            <div className="qty-stepper">
              <button onClick={() => props.onQty(Math.max(1, props.qty - 1))}>
                <Minus size={18} />
              </button>
              <strong>{props.qty}</strong>
              <button onClick={() => props.onQty(props.qty + 1)}>
                <Plus size={18} />
              </button>
            </div>
            <button className="buy-button" onClick={() => props.actions.addToCart(props.product.id, props.qty)}>
              В корзину · {fmt(props.product.price * props.qty)}
            </button>
            <button className={inFav ? 'large-round active-purple' : 'large-round'} title="В избранное" onClick={() => props.actions.toggleFav(props.product.id)}>
              <Heart size={22} fill={inFav ? 'currentColor' : 'none'} />
            </button>
            <button className={inCompare ? 'large-round active-green' : 'large-round'} title="К сравнению" onClick={() => props.actions.toggleCompare(props.product.id)}>
              <Repeat2 size={22} />
            </button>
          </div>
          <p className="product-desc">{props.product.desc}</p>
          <div className="spec-table">
            {props.product.specs.map(([key, value]) => (
              <div key={key}>
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle title="Отзывы" />
      <div className="reviews-layout">
        <div className="review-form">
          <h2>{props.editReviewId ? 'Редактировать отзыв' : 'Оставить отзыв'}</h2>
          <p className="muted small">Ваша оценка</p>
          <div className="star-input">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} className={value <= props.reviewRating ? 'star-input__active' : ''} onClick={() => props.onReviewRating(value)}>
                ★
              </button>
            ))}
          </div>
          <textarea value={props.reviewText} onChange={(event) => props.onReviewText(event.target.value)} placeholder="Поделитесь впечатлением о товаре..." />
          <div className="review-form__buttons">
            <button onClick={props.onReviewSubmit}>{props.editReviewId ? 'Сохранить' : 'Отправить отзыв'}</button>
            {props.editReviewId && <button onClick={props.onReviewCancel}>Отмена</button>}
          </div>
        </div>
        <div className="reviews-list">
          {props.reviews.length === 0 && <div className="empty-inline">Отзывов пока нет. Будьте первым!</div>}
          {props.reviews.map((review) => (
            <article className="review-item" key={review.id}>
              <div className="review-item__head">
                <div className="review-author">
                  <span>{review.author.charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{review.author}</strong>
                    <small>{review.date}</small>
                  </div>
                </div>
                <div className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              </div>
              <p>{review.text}</p>
              {review.mine && (
                <div className="review-actions">
                  <button onClick={() => props.onReviewEdit(review)}>Редактировать</button>
                  <button onClick={() => props.onReviewDelete(review.id)}>Удалить</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {props.related.length > 0 && (
        <>
          <SectionTitle title="Похожие товары" />
          <ProductGrid products={props.related} favorites={props.favorites} compare={props.compare} actions={props.actions} />
        </>
      )}
    </section>
  );
}

function CartScreen(props: {
  items: Array<{ line: CartLine; product: Product }>;
  cartCount: number;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  earnBonus: number;
  onQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onCatalog: () => void;
  onCheckout: () => void;
  onOpen: (id: number) => void;
}) {
  if (!props.items.length) {
    return <EmptyState icon={<ShoppingCart size={48} />} title="Корзина пуста" text="Добавьте товары из каталога." action="В каталог" onAction={props.onCatalog} />;
  }

  return (
    <section className="page">
      <h1 className="page-title">Корзина</h1>
      <div className="cart-layout">
        <div className="cart-lines">
          {props.items.map(({ line, product }) => (
            <article className="cart-line" key={line.id}>
              <button className="cart-line__visual" onClick={() => props.onOpen(product.id)}>
                <ProductMedia product={product} imageClassName="cart-line__image" emojiClassName="cart-line__emoji" />
              </button>
              <div>
                <p className="muted small">{product.brand}</p>
                <button className="cart-line__title" onClick={() => props.onOpen(product.id)}>{product.title}</button>
                <p className="muted small">{fmt(product.price)} / шт</p>
              </div>
              <div className="qty-stepper">
                <button onClick={() => props.onQty(line.id, line.qty - 1)}>
                  <Minus size={18} />
                </button>
                <strong>{line.qty}</strong>
                <button onClick={() => props.onQty(line.id, line.qty + 1)}>
                  <Plus size={18} />
                </button>
              </div>
              <strong className="cart-line__sum">{fmt(product.price * line.qty)}</strong>
              <button className="text-button" onClick={() => props.onRemove(line.id)}>Удалить</button>
            </article>
          ))}
        </div>
        <aside className="cart-summary">
          <h2>Итого</h2>
          <div className="summary-row"><span>Товары ({props.cartCount})</span><strong>{fmt(props.subtotal)}</strong></div>
          {props.discount > 0 && <div className="summary-row summary-row--green"><span>Скидка по промокоду</span><strong>−{fmt(props.discount)}</strong></div>}
          <div className="summary-row"><span>Доставка</span><strong>{props.delivery === 0 ? 'Бесплатно' : fmt(props.delivery)}</strong></div>
          <div className="summary-total"><span>К оплате</span><strong>{fmt(props.total)}</strong></div>
          <button onClick={props.onCheckout}>Оформить</button>
          <p className="summary-bonus">Бонусов начислим: +{props.earnBonus} 🦴</p>
        </aside>
      </div>
    </section>
  );
}

function ProductCollectionScreen(props: {
  title: string;
  empty: string;
  products: Product[];
  favorites: number[];
  compare: number[];
  onCatalog: () => void;
  onAddAll?: () => void;
  actions: ProductActions;
}) {
  if (!props.products.length) {
    return <EmptyState icon={<Heart size={48} />} title={props.title} text={props.empty} action="В каталог" onAction={props.onCatalog} />;
  }

  return (
    <section className="page">
      <div className="collection-head">
        <h1 className="page-title">{props.title}</h1>
        {props.onAddAll && <button onClick={props.onAddAll}>Всё в корзину</button>}
      </div>
      <ProductGrid products={props.products} favorites={props.favorites} compare={props.compare} actions={props.actions} />
    </section>
  );
}

function CompareScreen(props: { products: Product[]; favorites: number[]; compare: number[]; onCatalog: () => void; actions: ProductActions }) {
  if (!props.products.length) {
    return <EmptyState icon={<Repeat2 size={48} />} title="Сравнение" text="Добавьте до четырёх товаров к сравнению." action="В каталог" onAction={props.onCatalog} />;
  }

  return (
    <section className="page">
      <h1 className="page-title">Сравнение</h1>
      <ProductGrid products={props.products} favorites={props.favorites} compare={props.compare} actions={props.actions} />
      <div className="compare-table">
        {['Бренд', 'Для кого', 'Цена', 'Рейтинг', 'Наличие'].map((row) => (
          <div className="compare-table__row" key={row}>
            <strong>{row}</strong>
            {props.products.map((product) => (
              <span key={product.id}>
                {row === 'Бренд' && product.brand}
                {row === 'Для кого' && product.petName}
                {row === 'Цена' && fmt(product.price)}
                {row === 'Рейтинг' && product.rating}
                {row === 'Наличие' && (product.stock ? 'В наличии' : 'Под заказ')}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function CheckoutScreen(props: {
  cartEmpty: boolean;
  user: User | null;
  checkout: CheckoutFields;
  errors: Partial<Record<keyof CheckoutFields, boolean>>;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  promos: Promo[];
  promoInput: string;
  appliedPromo: Promo | null;
  orderDone: { no: string; bonus: number } | null;
  onCart: () => void;
  onCatalog: () => void;
  onAuth: () => void;
  onOrders: () => void;
  onField: <K extends keyof CheckoutFields>(key: K, value: CheckoutFields[K]) => void;
  onPromoInput: (value: string) => void;
  onApplyPromo: () => void;
  onPlaceOrder: () => void;
}) {
  if (props.orderDone) {
    return (
      <section className="page page--narrow">
        <div className="success-panel">
          <div className="success-panel__emoji">🎉</div>
          <h1>Заказ {props.orderDone.no} оформлен!</h1>
          <p>Мы свяжемся с вами для подтверждения. Начислено <strong>+{props.orderDone.bonus} бонусов 🦴</strong> на ваш счёт.</p>
          <div className="success-panel__actions">
            <button onClick={props.onOrders}>Мои заказы</button>
            <button onClick={props.onCatalog}>Продолжить покупки</button>
          </div>
        </div>
      </section>
    );
  }

  if (props.cartEmpty) {
    return <EmptyState icon={<ShoppingCart size={48} />} title="Корзина пуста" text="Оформление доступно после добавления товаров." action="В каталог" onAction={props.onCatalog} />;
  }

  const payOptions: Array<[CheckoutFields['pay'], string]> = [
    ['card', 'Картой'],
    ['cash', 'Наличными'],
    ['split', 'Частями'],
  ];

  return (
    <section className="page page--checkout">
      <div className="breadcrumb">
        <button onClick={props.onCart}>Корзина</button>
        <span>/ Оформление</span>
      </div>
      <h1 className="page-title">Оформление заказа</h1>

      {!props.user && (
        <div className="auth-notice">
          <strong>Войдите в аккаунт, чтобы оформить заказ и копить бонусы.</strong>
          <button onClick={props.onAuth}>Войти</button>
        </div>
      )}

      <div className="checkout-layout">
        <div className="checkout-form">
          <h2>Получатель и доставка</h2>
          <label>
            <span>Имя и фамилия</span>
            <input
              value={props.checkout.name}
              onChange={(event) => props.onField('name', event.target.value)}
              className={props.errors.name ? 'input-error' : ''}
            />
          </label>
          <label>
            <span>Телефон</span>
            <input
              value={props.checkout.phone}
              onChange={(event) => props.onField('phone', event.target.value)}
              placeholder="+7 ___ ___ __ __"
              className={props.errors.phone ? 'input-error' : ''}
            />
          </label>
          <label>
            <span>Адрес доставки</span>
            <input
              value={props.checkout.address}
              onChange={(event) => props.onField('address', event.target.value)}
              placeholder="Город, улица, дом, квартира"
              className={props.errors.address ? 'input-error' : ''}
            />
          </label>
          <div>
            <span className="field-label">Способ оплаты</span>
            <div className="pay-options">
              {payOptions.map(([value, label]) => (
                <button
                  key={value}
                  className={props.checkout.pay === value ? 'pay-option pay-option--active' : 'pay-option'}
                  onClick={() => props.onField('pay', value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="cart-summary">
          <h2>Ваш заказ</h2>
          <div className="summary-row"><span>Товары</span><strong>{fmt(props.subtotal)}</strong></div>
          <div className="promo-row">
            <input value={props.promoInput} onChange={(event) => props.onPromoInput(event.target.value.toUpperCase())} placeholder="Промокод" />
            <button onClick={props.onApplyPromo}>ОК</button>
          </div>
          {props.discount > 0 && props.appliedPromo && <p className="promo-applied">✓ Промокод {props.appliedPromo.code} (−{fmt(props.discount)})</p>}
          {props.promos.length > 0 && <p className="promo-hint">Ваши промокоды из игры: {props.promos.map((promo) => promo.code).join(', ')}</p>}
          <div className="summary-row"><span>Доставка</span><strong>{props.delivery === 0 ? 'Бесплатно' : fmt(props.delivery)}</strong></div>
          <div className="summary-total"><span>К оплате</span><strong>{fmt(props.total)}</strong></div>
          <button onClick={props.onPlaceOrder}>Подтвердить заказ</button>
        </aside>
      </div>
    </section>
  );
}

function AuthScreen(props: {
  mode: 'login' | 'register';
  form: { name: string; email: string; password: string; password2: string };
  errors: Partial<Record<'name' | 'email' | 'password' | 'password2', string>>;
  onMode: (mode: 'login' | 'register') => void;
  onField: (key: 'name' | 'email' | 'password' | 'password2', value: string) => void;
  onSubmit: () => void;
}) {
  const register = props.mode === 'register';

  return (
    <section className="page page--auth">
      <div className="auth-card">
        <div className="auth-tabs">
          <button className={!register ? 'active' : ''} onClick={() => props.onMode('login')}>Вход</button>
          <button className={register ? 'active' : ''} onClick={() => props.onMode('register')}>Регистрация</button>
        </div>
        <h1>{register ? 'Создать аккаунт' : 'С возвращением!'}</h1>
        <p>{register ? 'Регистрация займёт меньше минуты' : 'Войдите, чтобы видеть заказы и бонусы'}</p>
        <div className="auth-fields">
          {register && (
            <FieldError error={props.errors.name}>
              <input value={props.form.name} onChange={(event) => props.onField('name', event.target.value)} placeholder="Имя и фамилия" />
            </FieldError>
          )}
          <FieldError error={props.errors.email}>
            <input value={props.form.email} onChange={(event) => props.onField('email', event.target.value)} placeholder="E-mail" />
          </FieldError>
          <FieldError error={props.errors.password}>
            <input type="password" value={props.form.password} onChange={(event) => props.onField('password', event.target.value)} placeholder="Пароль" />
          </FieldError>
          {register && (
            <FieldError error={props.errors.password2}>
              <input type="password" value={props.form.password2} onChange={(event) => props.onField('password2', event.target.value)} placeholder="Повторите пароль" />
            </FieldError>
          )}
        </div>
        <button className="auth-submit" onClick={props.onSubmit}>{register ? 'Зарегистрироваться' : 'Войти'}</button>
        {!register && (
          <div className="demo-access">
            <strong>Демо-доступ:</strong>
            <span>liubovsheyda@gmail.com / Teacher_2026</span>
          </div>
        )}
      </div>
    </section>
  );
}

function FieldError(props: { error?: string; children: ReactNode }) {
  return (
    <label className={props.error ? 'field-error has-error' : 'field-error'}>
      {props.children}
      {props.error && <small>{props.error}</small>}
    </label>
  );
}

function AccountScreen(props: {
  user: User;
  tab: 'profile' | 'orders' | 'bonuses' | 'reviews';
  bonuses: number;
  promos: Promo[];
  orders: Order[];
  reviews: Array<Review & { product: Product }>;
  profileForm: User;
  onTab: (tab: 'profile' | 'orders' | 'bonuses' | 'reviews') => void;
  onLogout: () => void;
  onProfileField: (key: keyof User, value: string) => void;
  onSaveProfile: () => void;
  onGame: () => void;
  onOpenProduct: (id: number) => void;
  onDeleteReview: (id: string) => void;
}) {
  const tabs: Array<['profile' | 'orders' | 'bonuses' | 'reviews', string, string, number]> = [
    ['profile', 'Профиль', '👤', 0],
    ['orders', 'Заказы', '📦', props.orders.length],
    ['bonuses', 'Бонусы', '🎟️', props.promos.length],
    ['reviews', 'Отзывы', '★', props.reviews.length],
  ];

  return (
    <section className="page">
      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-user">
            <span>{props.user.name.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{props.user.name}</strong>
              <small>{props.user.email}</small>
            </div>
          </div>
          <div className="bonus-card">
            <span>Бонусный счёт</span>
            <strong>{props.bonuses} 🦴</strong>
          </div>
          <div className="account-tabs">
            {tabs.map(([id, label, icon, count]) => (
              <button key={id} className={props.tab === id ? 'active' : ''} onClick={() => props.onTab(id)}>
                <span>{icon}</span>
                <strong>{label}</strong>
                {count > 0 && <em>{count}</em>}
              </button>
            ))}
          </div>
          <button className="logout-button" onClick={props.onLogout}>↪ Выйти</button>
        </aside>

        <div className="account-content">
          {props.tab === 'profile' && (
            <div className="account-panel">
              <h1>Профиль</h1>
              <div className="profile-grid">
                <label><span>Имя и фамилия</span><input value={props.profileForm.name ?? ''} onChange={(event) => props.onProfileField('name', event.target.value)} /></label>
                <label><span>E-mail</span><input value={props.profileForm.email ?? ''} onChange={(event) => props.onProfileField('email', event.target.value)} /></label>
                <label><span>Телефон</span><input value={props.profileForm.phone ?? ''} onChange={(event) => props.onProfileField('phone', event.target.value)} placeholder="+7 ___ ___ __ __" /></label>
                <label><span>Город</span><input value={props.profileForm.city ?? ''} onChange={(event) => props.onProfileField('city', event.target.value)} placeholder="Город" /></label>
              </div>
              <button className="account-primary" onClick={props.onSaveProfile}>Сохранить</button>
            </div>
          )}

          {props.tab === 'orders' && (
            <div>
              <h1 className="account-title">Мои заказы</h1>
              {props.orders.length === 0 && <div className="empty-inline">Заказов пока нет.</div>}
              <div className="order-list">
                {props.orders.map((order) => (
                  <article className="order-card" key={order.no}>
                    <div className="order-card__head">
                      <strong>Заказ {order.no}</strong>
                      <span>{order.date}</span>
                      <em>{order.status}</em>
                    </div>
                    <div className="order-items">
                      {order.items.map((item) => (
                        <button key={`${order.no}-${item.id}`} onClick={() => props.onOpenProduct(item.id)}>
                          <span>{item.emoji}</span>
                          {item.title} · {item.qty} шт
                        </button>
                      ))}
                    </div>
                    <div className="order-card__total">
                      <span>+{order.bonus} бонусов 🦴</span>
                      <strong>{fmt(order.total)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {props.tab === 'bonuses' && (
            <div>
              <h1 className="account-title">Бонусы и промокоды</h1>
              <div className="bonus-hero">
                <div>
                  <span>Доступно бонусов</span>
                  <strong>{props.bonuses} 🦴</strong>
                  <small>1 бонус = 1 ₽ при оплате</small>
                </div>
                <button onClick={props.onGame}>🎮 Заработать в игре</button>
              </div>
              <h2 className="subhead">Мои промокоды</h2>
              {props.promos.length === 0 && <div className="empty-inline">Промокодов нет. Сыграйте в игру «Поймай игрушки» и выиграйте промокод!</div>}
              <div className="promo-grid">
                {props.promos.map((promo) => (
                  <div className="promo-ticket" key={promo.code}>
                    <div>
                      <strong>{promo.code}</strong>
                      <span>{promo.type === 'percent' ? `Скидка ${promo.value}% на заказ` : `Скидка ${fmt(promo.value)} на заказ`}</span>
                    </div>
                    <em>{promo.type === 'percent' ? `−${promo.value}%` : `−${fmt(promo.value)}`}</em>
                  </div>
                ))}
              </div>
            </div>
          )}

          {props.tab === 'reviews' && (
            <div>
              <h1 className="account-title">Мои отзывы</h1>
              {props.reviews.length === 0 && <div className="empty-inline">Вы ещё не оставляли отзывов. Откройте любой товар и поделитесь мнением.</div>}
              <div className="reviews-list">
                {props.reviews.map((review) => (
                  <article className="review-item" key={review.id}>
                    <div className="review-item__head">
                      <button className="review-product-link" onClick={() => props.onOpenProduct(review.product.id)}>
                        <span className="review-product-link__visual">
                          <ProductMedia product={review.product} imageClassName="review-product-link__image" emojiClassName="review-product-link__emoji" />
                        </span>
                        <div>
                          <strong>{review.product.title}</strong>
                          <small>{review.date}</small>
                        </div>
                      </button>
                      <div className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                    </div>
                    <p>{review.text}</p>
                    <div className="review-actions">
                      <button onClick={() => props.onOpenProduct(review.product.id)}>К товару</button>
                      <button onClick={() => props.onDeleteReview(review.id)}>Удалить</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GameScreen(props: {
  game: GameState;
  bonuses: number;
  promoCount: number;
  onStart: () => void;
  onCatalog: () => void;
  onBasket: (basket: number) => void;
}) {
  return (
    <section className="page page--game">
      <div className="game-heading">
        <h1>Поймай игрушки 🎮</h1>
        <p>Лови падающие игрушки в корзинку. Двигай корзину мышкой или стрелками ← →.</p>
      </div>
      <div
        className="game-field"
        onMouseMove={(event) => {
          if (props.game.phase !== 'play') return;
          const rect = event.currentTarget.getBoundingClientRect();
          props.onBasket(Math.max(6, Math.min(94, ((event.clientX - rect.left) / rect.width) * 100)));
        }}
      >
        <div className="game-hud">
          <span>Очки: {props.game.score}</span>
          <span>⏱ {props.game.time} c</span>
        </div>
        {props.game.phase === 'play' && props.game.toys.map((toy) => (
          <span className="game-toy" key={toy.id} style={{ left: `${toy.x}%`, top: `${toy.y}%`, fontSize: toy.size }}>
            {toy.emoji}
          </span>
        ))}
        {props.game.phase === 'play' && <span className="game-basket" style={{ left: `${props.game.basket}%` }}>🧺</span>}
        {props.game.phase === 'idle' && (
          <div className="game-overlay">
            <div className="game-overlay__emoji">🧺</div>
            <button onClick={props.onStart}>Начать игру</button>
            <p>🦴 кость +2 · 🎾 мяч +1 · 🐛 червяк +3 · 💣 не лови</p>
          </div>
        )}
        {props.game.phase === 'over' && props.game.result && (
          <div className="game-overlay">
            <div className="game-overlay__emoji">{props.game.result.emoji}</div>
            <h2>{props.game.result.title}</h2>
            <p>{props.game.result.text}</p>
            {props.game.result.promo && (
              <div className="won-promo">
                <span>Ваш промокод</span>
                <strong>{props.game.result.promo.code}</strong>
              </div>
            )}
            <div className="game-actions">
              <button onClick={props.onStart}>Ещё раз</button>
              <button onClick={props.onCatalog}>За покупками</button>
            </div>
          </div>
        )}
      </div>
      <div className="game-stats">
        <span>🦴 Поймано бонусов всего: <strong>{props.bonuses}</strong></span>
        <span>🎟️ Промокодов: <strong>{props.promoCount}</strong></span>
      </div>
    </section>
  );
}

function PlaceholderScreen(props: { icon: ReactNode; title: string; text: string }) {
  return (
    <section className="page">
      <div className="placeholder-panel">
        <div className="placeholder-panel__icon">{props.icon}</div>
        <h1>{props.title}</h1>
        <p>{props.text}</p>
      </div>
    </section>
  );
}

function FilterBlock(props: { title: string; children: ReactNode }) {
  return (
    <div className="filter-block">
      <h3>{props.title}</h3>
      {props.children}
    </div>
  );
}

function CheckLine(props: { checked: boolean; label: string; count?: number; onChange: () => void }) {
  return (
    <label className="check-line">
      <input type="checkbox" checked={props.checked} onChange={props.onChange} />
      <span>{props.label}</span>
      {props.count !== undefined && <small>{props.count}</small>}
    </label>
  );
}

function RadioLine(props: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="check-line">
      <input type="radio" name="rating" checked={props.checked} onChange={props.onChange} />
      <span>{props.label}</span>
    </label>
  );
}

function Breadcrumb(props: { onHome: () => void; catalog?: { label: string; onClick: () => void }; trail: string[] }) {
  return (
    <div className="breadcrumb">
      <button onClick={props.onHome}>Главная</button>
      {props.catalog && (
        <>
          <span>/</span>
          <button onClick={props.catalog.onClick}>{props.catalog.label}</button>
        </>
      )}
      {props.trail.map((item) => (
        <span key={item}>/ {item}</span>
      ))}
    </div>
  );
}

function EmptyState(props: { icon: ReactNode; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <section className="page">
      <div className="empty-state">
        <div>{props.icon}</div>
        <h1>{props.title}</h1>
        <p>{props.text}</p>
        {props.action && <button onClick={props.onAction}>{props.action}</button>}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="footer__logo">
          ДИКО<span>.</span>
        </div>
        <p>Магазин для необычных питомцев · 2026</p>
      </div>
      <p>Корма, террариумы, уход и игрушки для рептилий, ёжиков, нутрий, птиц, грызунов и насекомых.</p>
    </footer>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          <span>{toast.icon}</span>
          <span>{toast.msg}</span>
        </div>
      ))}
    </div>
  );
}
