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
  Filters,
  PetId,
  Product,
  Review,
  Route,
  SortKey,
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

function ProductCard({ product, fav, compared, onOpen, onAdd, onFav, onCompare }: ProductCardProps) {
  const badge = badgeMeta(product.badge);

  return (
    <article className="product-card" onClick={() => onOpen(product.id)}>
      <div className="product-card__visual">
        <span className="product-card__emoji">{product.emoji}</span>
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
  const [user] = useState<User | null>(() => readStorage('diko_user', null));
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
  const [entered, setEntered] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const enterTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('diko_seeded')) {
      writeStorage('diko_users', [{ name: 'Любовь Шейда', email: 'liubovsheyda@gmail.com', password: 'Teacher_2026' }]);
      localStorage.setItem('diko_seeded', '1');
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
    };
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const matched = useMemo(() => products.filter((product) => matchesProduct(product, filters, appliedSearch)), [filters, appliedSearch]);
  const catalogProducts = useMemo(() => sortedProducts(matched, sort), [matched, sort]);
  const shownProducts = catalogProducts.slice(0, page * 9);
  const currentProduct = route.name === 'product' ? products.find((product) => product.id === route.id) : undefined;

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
    setFavorites((items) => {
      const active = items.includes(id);
      const next = active ? items.filter((item) => item !== id) : [...items, id];
      writeStorage('diko_fav', next);
      showToast(active ? 'Убрано из избранного' : 'В избранном', '♥');
      return next;
    });
  };

  const toggleCompare = (id: number) => {
    setCompare((items) => {
      const active = items.includes(id);
      if (active) {
        const next = items.filter((item) => item !== id);
        writeStorage('diko_compare', next);
        showToast('Убрано из сравнения', '⇄');
        return next;
      }
      if (items.length >= 4) {
        showToast('В сравнении максимум 4 товара', '⇄');
        return items;
      }
      const next = [...items, id];
      writeStorage('diko_compare', next);
      showToast('Добавлено к сравнению', '⇄');
      return next;
    });
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
    if (!currentProduct) return;
    setReviews((items) => {
      const next = { ...items, [currentProduct.id]: (items[currentProduct.id] ?? []).filter((review) => review.id !== id) };
      writeStorage('diko_reviews', next);
      return next;
    });
    showToast('Отзыв удалён', '🗑️');
  };

  const favoriteProducts = products.filter((product) => favorites.includes(product.id));
  const comparedProducts = products.filter((product) => compare.includes(product.id));
  const recentProducts = recent.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];

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
        onAccount={() => nav(user ? { name: 'account' } : { name: 'auth' })}
        onGame={() => nav({ name: 'game' })}
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
            onGame={() => nav({ name: 'game' })}
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
          <CartScreen cart={cart} onQty={setQty} onRemove={removeFromCart} onCatalog={goCatalog} onCheckout={() => nav({ name: 'checkout' })} />
        )}
        {route.name === 'favorites' && (
          <ProductCollectionScreen title="Избранное" empty="В избранном пока нет товаров." products={favoriteProducts} favorites={favorites} compare={compare} onCatalog={goCatalog} actions={appActions} />
        )}
        {route.name === 'compare' && (
          <CompareScreen products={comparedProducts} favorites={favorites} compare={compare} onCatalog={goCatalog} actions={appActions} />
        )}
        {route.name === 'auth' && <PlaceholderScreen icon={<UserRound size={42} />} title="Вход" text="Аккаунт преподавателя подготовлен в localStorage." />}
        {route.name === 'account' && <PlaceholderScreen icon={<UserRound size={42} />} title="Профиль" text="Личный кабинет подключится к сохранённым заказам, бонусам и промокодам." />}
        {route.name === 'game' && <PlaceholderScreen icon={<Gamepad2 size={42} />} title="Игра" text="Тут будет акционная игра" />}
        {route.name === 'checkout' && <PlaceholderScreen icon={<ShoppingCart size={42} />} title="Оформление" text="Корзина сохраняется локально, форма заказа собрана отдельным экраном." />}
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
            <div className="hero__visual" style={{ background: promo.photoBg }}>
              {promo.emoji}
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
                  <div className="product-row__visual">{product.emoji}</div>
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
            {props.product.emoji}
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
                {props.product.emoji}
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

function CartScreen(props: { cart: CartLine[]; onQty: (id: number, qty: number) => void; onRemove: (id: number) => void; onCatalog: () => void; onCheckout: () => void }) {
  const lines = props.cart.map((line) => ({ line, product: products.find((product) => product.id === line.id) })).filter((item): item is { line: CartLine; product: Product } => Boolean(item.product));
  const total = lines.reduce((sum, item) => sum + item.product.price * item.line.qty, 0);

  if (!lines.length) {
    return <EmptyState icon={<ShoppingCart size={48} />} title="Корзина пуста" text="Добавьте товары из каталога." action="В каталог" onAction={props.onCatalog} />;
  }

  return (
    <section className="page">
      <h1 className="page-title">Корзина</h1>
      <div className="cart-layout">
        <div className="cart-lines">
          {lines.map(({ line, product }) => (
            <article className="cart-line" key={line.id}>
              <div className="cart-line__visual">{product.emoji}</div>
              <div>
                <p className="muted small">{product.brand}</p>
                <h2>{product.title}</h2>
                <strong>{fmt(product.price)}</strong>
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
              <button className="text-button" onClick={() => props.onRemove(line.id)}>Удалить</button>
            </article>
          ))}
        </div>
        <aside className="cart-summary">
          <p>Итого</p>
          <strong>{fmt(total)}</strong>
          <button onClick={props.onCheckout}>Оформить</button>
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
  actions: ProductActions;
}) {
  if (!props.products.length) {
    return <EmptyState icon={<Heart size={48} />} title={props.title} text={props.empty} action="В каталог" onAction={props.onCatalog} />;
  }

  return (
    <section className="page">
      <h1 className="page-title">{props.title}</h1>
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
