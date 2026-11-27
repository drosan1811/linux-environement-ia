/* ==========================================================
   Atelier Kinetix – Logique JavaScript (ES6+, sans dépendance)
   Sommaire :
   1. Données (produits, constantes) et état de l'application
   2. Utilitaires (formatage, normalisation, échappement HTML)
   3. Rendu du catalogue (filtres, tri, recherche)
   4. Modale « Voir détails »
   5. Panier (logique, persistance localStorage, rendu)
   6. Commande simulée
   7. Panneaux (ouverture/fermeture, accessibilité clavier)
   8. Formulaires (newsletter, contact) avec validation
   9. Initialisation
   ========================================================== */
'use strict';

/* ---------- 1. Données et état ---------- */

const FREE_SHIPPING_THRESHOLD = 60;   // livraison offerte à partir de 60 €
const SHIPPING_COST = 4.9;            // frais de livraison standard
const MAX_QTY = 10;                   // quantité maximale par produit
const STORAGE_KEY = 'atelier-kinetix-panier';

/*
  Liste des produits. Chaque produit possède :
  - id (unique), name, category, price (en €), description courte
  - details : liste de caractéristiques (affichées dans la modale)
  - icon : clé de l'illustration SVG (voir ICONS)
  - color : couleur de fond de la vignette
  - badge : mention facultative ("Nouveau", "Best-seller"…)
*/
const PRODUCTS = [
  {
    id: 1, name: 'Sac à dos modulable Flux 24 L', category: 'Mobilité', price: 89.90,
    description: 'Un sac urbain aux poches amovibles, qui s\'adapte à votre journée.',
    details: ['Capacité 24 L, extensible à 30 L', 'Tissu déperlant recyclé', 'Compartiment ordinateur 16 pouces', 'Poches modulables à fixation rapide'],
    icon: 'bag', color: '#fde7da', badge: 'Best-seller'
  },
  {
    id: 2, name: 'Lampe frontale rechargeable Lumen S', category: 'Mobilité', price: 34.90,
    description: 'Compacte et puissante, idéale pour les trajets à vélo ou à pied le soir.',
    details: ['350 lumens, 3 modes d\'éclairage', 'Recharge USB-C en 2 h', 'Autonomie jusqu\'à 20 h', 'Étanche IPX4'],
    icon: 'headlamp', color: '#fef3c7', badge: 'Nouveau'
  },
  {
    id: 3, name: 'Support téléphone magnétique Magnet Dock', category: 'Mobilité', price: 19.90,
    description: 'Fixez votre téléphone au guidon ou au tableau de bord en un geste.',
    details: ['Aimants puissants compatibles MagSafe', 'Rotation à 360°', 'Fixation guidon 22–32 mm', 'Silicone antidérapant'],
    icon: 'phone', color: '#dbeafe', badge: ''
  },
  {
    id: 4, name: 'Gourde isotherme Thermo 500 ml', category: 'Quotidien', price: 24.90,
    description: 'Garde vos boissons chaudes 12 h et froides 24 h, sans goût métallique.',
    details: ['Acier inoxydable double paroi', 'Contenance 500 ml', 'Bouchon étanche anti-fuite', 'Sans BPA, passe dans un porte-gobelet'],
    icon: 'bottle', color: '#d1fae5', badge: ''
  },
  {
    id: 5, name: 'Pochette tech Organizer', category: 'Bureau & Tech', price: 29.90,
    description: 'Câbles, chargeurs et clés USB enfin rangés au même endroit.',
    details: ['Intérieur élastique à compartiments', 'Poche zippée pour petits accessoires', 'Matière résistante à l\'eau', 'Format 24 × 14 cm'],
    icon: 'pouch', color: '#e9d5ff', badge: ''
  },
  {
    id: 6, name: 'Station de charge 3-en-1 Volt', category: 'Bureau & Tech', price: 49.90,
    description: 'Rechargez téléphone, écouteurs et montre sur un seul socle élégant.',
    details: ['Charge sans fil jusqu\'à 15 W', 'Compatible téléphone, écouteurs et montre', 'Câble USB-C inclus', 'Protection surchauffe'],
    icon: 'charger', color: '#fee2e2', badge: 'Nouveau'
  },
  {
    id: 7, name: 'Lampe de bureau pliable Foldo', category: 'Bureau & Tech', price: 39.90,
    description: 'Une lampe LED fine qui se replie et se glisse dans un sac.',
    details: ['3 températures de couleur', 'Variateur tactile', 'Batterie intégrée, 6 h d\'autonomie', 'Bras articulé repliable'],
    icon: 'desklamp', color: '#ffedd5', badge: ''
  },
  {
    id: 8, name: 'Porte-clés multi-outils Pocket', category: 'Quotidien', price: 14.90,
    description: 'Tournevis, ouvre-bouteille et règle dans un porte-clés de 20 g.',
    details: ['Acier inoxydable brossé', '6 fonctions en 1', 'Poids 20 g', 'Livré avec mousqueton'],
    icon: 'tool', color: '#e0e7ff', badge: ''
  },
  {
    id: 9, name: 'Antivol en U compact Secure', category: 'Mobilité', price: 44.90,
    description: 'Un antivol robuste et léger pour sécuriser vélo ou trottinette.',
    details: ['Acier trempé 13 mm', 'Support de cadre fourni', '2 clés incluses', 'Revêtement anti-rayures'],
    icon: 'lock', color: '#cffafe', badge: ''
  },
  {
    id: 10, name: 'Carnet réutilisable Loop A5', category: 'Quotidien', price: 22.90,
    description: 'Écrivez, scannez, effacez : un carnet qui se réutilise à l\'infini.',
    details: ['Format A5, 32 pages synthétiques', 'Compatible stylo effaçable', 'Reliure à anneaux', 'Application de scan gratuite'],
    icon: 'notebook', color: '#fce7f3', badge: ''
  }
];

/* Illustrations SVG (traits simples, viewBox 120×120) – une par type de produit */
const ICONS = {
  bag: '<rect x="32" y="38" width="56" height="62" rx="14"/><path d="M45 38v-6a15 15 0 0 1 30 0v6"/><rect x="44" y="62" width="32" height="22" rx="6"/><path d="M44 72h32"/>',
  headlamp: '<circle cx="60" cy="60" r="22"/><circle cx="60" cy="60" r="9"/><path d="M18 60h12M90 60h12M60 18v12M60 90v12M30 30l8 8M90 30l-8 8"/>',
  phone: '<rect x="40" y="24" width="40" height="72" rx="9"/><path d="M54 34h12"/><circle cx="60" cy="84" r="3"/><path d="M26 48q-8 12 0 24M94 48q8 12 0 24"/>',
  bottle: '<path d="M50 20h20v12H50z"/><path d="M46 32h28l4 12v50a8 8 0 0 1-8 8H50a8 8 0 0 1-8-8V44z"/><path d="M42 62h36"/>',
  pouch: '<rect x="24" y="40" width="72" height="44" rx="12"/><path d="M24 56h72"/><path d="M52 56v8h16v-8"/>',
  charger: '<circle cx="60" cy="60" r="36"/><path d="M65 34L47 64h13l-5 22 20-32H62z"/>',
  desklamp: '<path d="M36 98h44"/><path d="M58 98V66l20-30"/><path d="M68 26l24 14-14 22z"/>',
  tool: '<circle cx="44" cy="44" r="16"/><circle cx="44" cy="44" r="5"/><path d="M56 56l36 36M80 80l8-8M70 70l8-8"/>',
  lock: '<rect x="34" y="52" width="52" height="42" rx="10"/><path d="M44 52V40a16 16 0 0 1 32 0v12"/><circle cx="60" cy="72" r="5"/>',
  notebook: '<rect x="36" y="26" width="50" height="68" rx="8"/><path d="M48 26v68M58 44h18M58 58h18"/>'
};

/* État de l'application (une seule source de vérité) */
const state = {
  category: 'Tous',   // filtre actif
  sort: 'default',    // 'default' | 'asc' | 'desc'
  query: '',          // texte de recherche
  cart: [],           // tableau de lignes { id, qty }
  modalProductId: null
};

/* Références vers les éléments du DOM */
const $ = (selector) => document.querySelector(selector);
const els = {
  grid: $('#product-grid'),
  count: $('#result-count'),
  empty: $('#empty-state'),
  search: $('#search-input'),
  searchForm: $('#search-form'),
  sort: $('#sort-select'),
  filters: document.querySelectorAll('.chip'),
  cartBtn: $('#cart-toggle'),
  cartCount: $('#cart-count'),
  drawer: $('#cart-drawer'),
  overlay: $('#overlay'),
  cartList: $('#cart-list'),
  cartEmpty: $('#cart-empty'),
  shippingText: $('#shipping-text'),
  shippingBar: $('#shipping-bar'),
  subtotal: $('#cart-subtotal'),
  shipping: $('#cart-shipping'),
  total: $('#cart-total'),
  modal: $('#product-modal'),
  toast: $('#toast'),
  navToggle: $('#nav-toggle'),
  nav: $('#main-nav')
};

/* ---------- 2. Utilitaires ---------- */

/* Formate un nombre en euros (ex. 89.9 → « 89,90 € ») */
const formatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const formatPrice = (value) => formatter.format(value);

/* Met en minuscules et retire les accents pour une recherche tolérante */
const normalize = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

/* Échappe les caractères spéciaux avant insertion dans du HTML (sécurité) */
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

/* Construit le code SVG d'une illustration de produit */
const iconSvg = (key) =>
  `<svg class="icon-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${ICONS[key] || ''}</svg>`;

/* Affiche une courte notification (toast) pendant 2,4 s */
let toastTimer = null;
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 2400);
}

/* ---------- 3. Rendu du catalogue ---------- */

/* Retourne la liste filtrée (catégorie + recherche) puis triée */
function getVisibleProducts() {
  const query = normalize(state.query);

  let list = PRODUCTS.filter((p) => {
    const matchCategory = state.category === 'Tous' || p.category === state.category;
    const haystack = normalize(`${p.name} ${p.category} ${p.description} ${p.details.join(' ')}`);
    const matchQuery = !query || haystack.includes(query);
    return matchCategory && matchQuery;
  });

  if (state.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
  if (state.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
  return list;
}

/* Génère le HTML d'une carte produit */
function productCardHtml(p, index) {
  return `
    <article class="product-card" style="animation-delay:${Math.min(index * 40, 320)}ms">
      <div class="product-visual" style="background:${p.color}">
        ${p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : ''}
        ${iconSvg(p.icon)}
      </div>
      <div class="product-body">
        <p class="product-cat">${escapeHtml(p.category)}</p>
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        <p class="product-desc">${escapeHtml(p.description)}</p>
        <div class="product-foot">
          <span class="product-price">${formatPrice(p.price)}</span>
        </div>
        <div class="product-actions">
          <button type="button" class="btn btn-ghost btn-small" data-action="details" data-id="${p.id}">Voir détails</button>
          <button type="button" class="btn btn-primary btn-small" data-action="add" data-id="${p.id}">Ajouter au panier</button>
        </div>
      </div>
    </article>`;
}

/* Met à jour la grille du catalogue */
function renderProducts() {
  const list = getVisibleProducts();
  els.grid.innerHTML = list.map(productCardHtml).join('');
  els.empty.hidden = list.length > 0;
  els.count.textContent = list.length === 0
    ? ''
    : `${list.length} produit${list.length > 1 ? 's' : ''} affiché${list.length > 1 ? 's' : ''}`;
}

/* Met à jour l'état visuel des boutons de catégorie */
function renderFilters() {
  els.filters.forEach((btn) => {
    const active = btn.dataset.category === state.category;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

/* ---------- 4. Modale « Voir détails » ---------- */

function openModal(id) {
  const p = getProduct(id);
  if (!p) return;
  state.modalProductId = id;

  const visual = $('#modal-visual');
  visual.style.background = p.color;
  visual.innerHTML = iconSvg(p.icon);

  $('#modal-category').textContent = p.category;
  $('#modal-title').textContent = p.name;
  $('#modal-price').textContent = formatPrice(p.price);
  $('#modal-description').textContent = p.description;
  $('#modal-specs').innerHTML = p.details.map((d) => `<li>${escapeHtml(d)}</li>`).join('');

  openPanel(els.modal, $('#modal-close'));
}

function closeModal() {
  closePanel(els.modal);
  state.modalProductId = null;
}

/* ---------- 5. Panier ---------- */

/* Charge le panier depuis le localStorage (avec vérification des données) */
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((l) => l && getProduct(l.id) && Number.isInteger(l.qty) && l.qty > 0)
      .map((l) => ({ id: l.id, qty: Math.min(l.qty, MAX_QTY) }));
  } catch (error) {
    return []; // JSON invalide ou localStorage indisponible
  }
}

/* Sauvegarde le panier dans le localStorage */
function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  } catch (error) {
    /* Stockage indisponible (navigation privée…) : le panier reste en mémoire */
  }
}

/* Ajoute un produit (ou augmente sa quantité) */
function addToCart(id) {
  const p = getProduct(id);
  if (!p) return;
  const line = state.cart.find((l) => l.id === id);

  if (line) {
    if (line.qty >= MAX_QTY) {
      showToast(`Quantité maximale atteinte (${MAX_QTY}) pour ce produit.`);
      return;
    }
    line.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }
  saveCart();
  renderCart();
  bumpCartCount();
  showToast(`« ${p.name} » ajouté au panier`);
}

/* Modifie la quantité d'une ligne (delta = +1 ou -1) ; supprime si la quantité tombe à 0 */
function changeQty(id, delta) {
  const line = state.cart.find((l) => l.id === id);
  if (!line) return;
  line.qty = Math.min(MAX_QTY, line.qty + delta);
  if (line.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((l) => l.id !== id);
  saveCart();
  renderCart();
}

function clearCart() {
  state.cart = [];
  saveCart();
  renderCart();
}

/* Calcule sous-total, livraison, total et nombre d'articles */
function getTotals() {
  const subtotal = state.cart.reduce((sum, l) => sum + getProduct(l.id).price * l.qty, 0);
  const count = state.cart.reduce((sum, l) => sum + l.qty, 0);
  const shipping = count === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  return { subtotal, count, shipping, total: subtotal + shipping };
}

/* Petite animation du compteur du panier */
function bumpCartCount() {
  els.cartCount.classList.remove('bump');
  void els.cartCount.offsetWidth; // force le recalcul pour relancer l'animation
  els.cartCount.classList.add('bump');
}

/* Génère le HTML d'une ligne du panier */
function cartItemHtml(line) {
  const p = getProduct(line.id);
  return `
    <li class="cart-item">
      <div class="cart-thumb" style="background:${p.color}">${iconSvg(p.icon)}</div>
      <div>
        <div class="cart-item-name">${escapeHtml(p.name)}</div>
        <div class="cart-item-price">${formatPrice(p.price)} l'unité</div>
        <div class="qty">
          <button type="button" data-action="decrease" data-id="${p.id}" aria-label="Diminuer la quantité de ${escapeHtml(p.name)}">−</button>
          <span aria-live="polite">${line.qty}</span>
          <button type="button" data-action="increase" data-id="${p.id}" aria-label="Augmenter la quantité de ${escapeHtml(p.name)}" ${line.qty >= MAX_QTY ? 'disabled' : ''}>+</button>
        </div>
      </div>
      <div class="cart-item-side">
        <div class="cart-line-total">${formatPrice(p.price * line.qty)}</div>
        <button type="button" class="remove-btn" data-action="remove" data-id="${p.id}" aria-label="Supprimer ${escapeHtml(p.name)} du panier">Supprimer</button>
      </div>
    </li>`;
}

/* Met à jour tout l'affichage du panier (compteur, liste, totaux, livraison) */
function renderCart() {
  const { subtotal, count, shipping, total } = getTotals();
  const isEmpty = count === 0;

  els.cartCount.textContent = count;
  els.cartBtn.setAttribute('aria-label', `Ouvrir le panier (${count} article${count > 1 ? 's' : ''})`);

  els.cartList.innerHTML = state.cart.map(cartItemHtml).join('');
  els.cartEmpty.hidden = !isEmpty;
  els.drawer.classList.toggle('is-empty', isEmpty);

  els.subtotal.textContent = formatPrice(subtotal);
  els.shipping.textContent = isEmpty ? '—' : (shipping === 0 ? 'Offerte' : formatPrice(shipping));
  els.total.textContent = formatPrice(total);

  /* Indication de livraison offerte au-delà de 60 € */
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  if (remaining > 0) {
    els.shippingText.textContent = `Plus que ${formatPrice(remaining)} pour profiter de la livraison offerte !`;
  } else {
    els.shippingText.textContent = 'Bravo, la livraison standard est offerte 🎉';
  }
  const percent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  els.shippingBar.style.width = `${percent}%`;
  els.shippingBar.classList.toggle('is-complete', remaining <= 0);
}

/* ---------- 6. Commande simulée ---------- */

function checkout() {
  const { count, total } = getTotals();
  if (count === 0) return;

  /* Numéro de commande fictif */
  const orderNumber = 'KX-' + Math.floor(100000 + Math.random() * 900000);
  $('#confirm-text').textContent =
    `Commande ${orderNumber} validée : ${count} article${count > 1 ? 's' : ''} pour un total de ${formatPrice(total)}.`;

  clearCart();
  els.drawer.classList.add('is-confirmed');
  $('#cart-confirmation').hidden = false;
  $('#confirm-close').focus();
}

/* Revient à l'affichage normal du panier après la confirmation */
function resetConfirmation() {
  els.drawer.classList.remove('is-confirmed');
  $('#cart-confirmation').hidden = true;
}

/* ---------- 7. Panneaux : ouverture / fermeture / accessibilité ---------- */

let lastFocused = null; // élément qui avait le focus avant l'ouverture

function openPanel(panel, focusTarget) {
  lastFocused = document.activeElement;
  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  els.overlay.hidden = false;
  requestAnimationFrame(() => els.overlay.classList.add('is-visible'));
  document.body.classList.add('no-scroll');
  if (focusTarget) focusTarget.focus();
}

function closePanel(panel) {
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  /* On retire l'overlay seulement si plus aucun panneau n'est ouvert */
  const stillOpen = els.drawer.classList.contains('is-open') || els.modal.classList.contains('is-open');
  if (!stillOpen) {
    els.overlay.classList.remove('is-visible');
    setTimeout(() => { if (!els.overlay.classList.contains('is-visible')) els.overlay.hidden = true; }, 300);
    document.body.classList.remove('no-scroll');
  }
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

function openCart() {
  openPanel(els.drawer, $('#cart-close'));
}

function closeCart() {
  closePanel(els.drawer);
  resetConfirmation();
}

/* Piège le focus clavier à l'intérieur du panneau ouvert (touche Tab) */
function trapFocus(event, container) {
  const focusable = container.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const visible = [...focusable].filter((el) => el.offsetParent !== null);
  if (visible.length === 0) return;
  const first = visible[0];
  const last = visible[visible.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
}

/* ---------- 8. Formulaires ---------- */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Affiche un message de retour sous un formulaire */
function setMessage(el, text, type) {
  el.textContent = text;
  el.classList.toggle('is-error', type === 'error');
  el.classList.toggle('is-success', type === 'success');
}

function setInvalid(input, invalid) {
  input.setAttribute('aria-invalid', String(invalid));
}

/* Newsletter : validation de l'adresse e-mail */
function handleNewsletter(event) {
  event.preventDefault();
  const input = $('#newsletter-email');
  const msg = $('#newsletter-msg');
  const value = input.value.trim();

  if (!value) {
    setInvalid(input, true);
    setMessage(msg, 'Veuillez saisir votre adresse e-mail.', 'error');
    input.focus();
  } else if (!EMAIL_REGEX.test(value)) {
    setInvalid(input, true);
    setMessage(msg, 'Cette adresse e-mail ne semble pas valide.', 'error');
    input.focus();
  } else {
    setInvalid(input, false);
    setMessage(msg, 'Merci ! Vous êtes inscrit(e) à la newsletter (simulation).', 'success');
    input.value = '';
  }
}

/* Formulaire de contact : validation des trois champs */
function handleContact(event) {
  event.preventDefault();
  const name = $('#contact-name');
  const email = $('#contact-email');
  const message = $('#contact-message');
  const msg = $('#contact-msg');

  const errors = [];
  const checks = [
    [name, name.value.trim().length >= 2, 'Votre nom doit contenir au moins 2 caractères.'],
    [email, EMAIL_REGEX.test(email.value.trim()), 'Votre adresse e-mail n\'est pas valide.'],
    [message, message.value.trim().length >= 10, 'Votre message doit contenir au moins 10 caractères.']
  ];
  checks.forEach(([field, ok, text]) => {
    setInvalid(field, !ok);
    if (!ok) errors.push({ field, text });
  });

  if (errors.length > 0) {
    setMessage(msg, errors[0].text, 'error');
    errors[0].field.focus();
    return;
  }
  setMessage(msg, 'Message envoyé (simulation). Merci, nous vous répondrons vite !', 'success');
  event.target.reset();
}

/* ---------- 9. Initialisation & écouteurs d'événements ---------- */

function init() {
  state.cart = loadCart();
  renderFilters();
  renderProducts();
  renderCart();

  /* Filtres par catégorie */
  els.filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.category = btn.dataset.category;
      renderFilters();
      renderProducts();
    });
  });

  /* Tri */
  els.sort.addEventListener('change', () => {
    state.sort = els.sort.value;
    renderProducts();
  });

  /* Recherche en temps réel ; la soumission fait défiler vers le catalogue */
  els.search.addEventListener('input', () => {
    state.query = els.search.value;
    renderProducts();
  });
  els.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $('#catalogue').scrollIntoView({ behavior: 'smooth' });
  });

  /* Réinitialisation des filtres (état « aucun résultat ») */
  $('#reset-filters').addEventListener('click', () => {
    state.category = 'Tous';
    state.query = '';
    state.sort = 'default';
    els.search.value = '';
    els.sort.value = 'default';
    renderFilters();
    renderProducts();
  });

  /* Délégation d'événements sur la grille : « Voir détails » et « Ajouter » */
  els.grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'details') openModal(id);
    if (btn.dataset.action === 'add') addToCart(id);
  });

  /* Délégation d'événements sur la liste du panier */
  els.cartList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === 'increase') changeQty(id, +1);
    if (action === 'decrease') changeQty(id, -1);
    if (action === 'remove') removeFromCart(id);
  });

  /* Ouverture / fermeture du panier */
  els.cartBtn.addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#confirm-close').addEventListener('click', closeCart);
  $('#checkout-btn').addEventListener('click', checkout);
  $('#clear-cart').addEventListener('click', () => {
    if (state.cart.length && window.confirm('Vider entièrement votre panier ?')) clearCart();
  });

  /* Modale : bouton fermer, ajout au panier, clic en dehors de la carte */
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-add').addEventListener('click', () => {
    if (state.modalProductId !== null) addToCart(state.modalProductId);
    closeModal();
  });
  els.modal.addEventListener('click', (e) => { if (e.target === els.modal) closeModal(); });

  /* Clic sur l'overlay : ferme le panneau ouvert */
  els.overlay.addEventListener('click', () => {
    if (els.modal.classList.contains('is-open')) closeModal();
    else if (els.drawer.classList.contains('is-open')) closeCart();
  });

  /* Clavier : Échap pour fermer, Tab piégé dans le panneau ouvert */
  document.addEventListener('keydown', (e) => {
    const modalOpen = els.modal.classList.contains('is-open');
    const drawerOpen = els.drawer.classList.contains('is-open');
    if (e.key === 'Escape') {
      if (modalOpen) closeModal();
      else if (drawerOpen) closeCart();
    }
    if (e.key === 'Tab') {
      if (modalOpen) trapFocus(e, els.modal);
      else if (drawerOpen) trapFocus(e, els.drawer);
    }
  });

  /* Menu mobile */
  els.navToggle.addEventListener('click', () => {
    const open = els.nav.classList.toggle('is-open');
    els.navToggle.setAttribute('aria-expanded', String(open));
    els.navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  els.nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      els.nav.classList.remove('is-open');
      els.navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* Formulaires */
  $('#newsletter-form').addEventListener('submit', handleNewsletter);
  $('#contact-form').addEventListener('submit', handleContact);

  /* Synchronisation entre plusieurs onglets : si le panier change ailleurs, on le recharge */
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      state.cart = loadCart();
      renderCart();
    }
  });
}

/* Le script est chargé avec "defer" : le DOM est prêt, on peut initialiser */
init();