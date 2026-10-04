const WHATSAPP_NUMBER = "221710519711";
const STORAGE_KEY = "dgb_cart_v1";
let panier = loadCart();

const $ = (selector) => document.querySelector(selector);
const formatPrice = (value) => new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

function loadCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveCart() { localStorage.setItem(STORAGE_KEY, JSON.stringify(panier)); }
function getProduct(id) { return produits.find((p) => p.id === Number(id)); }
function cartCount() { return panier.reduce((sum, item) => sum + item.quantity, 0); }
function cartTotal() { return panier.reduce((sum, item) => sum + item.quantity * item.price, 0); }

function productImage(product) {
  if (product.image) return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.nom)}" loading="lazy">`;
  return `<div class="product-placeholder"><span>🛍️</span><small>Photo du produit</small></div>`;
}

function optionSelect(label, values, className, itemKey) {
  if (!values || !values.length) return "";
  return `<label class="option-label">${label}<select class="product-option ${className}" data-key="${itemKey}">${values.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("")}</select></label>`;
}

function renderProducts(list = produits) {
  const grid = $("#productsGrid");
  $("#emptyProducts").classList.toggle("hidden", list.length !== 0);
  grid.innerHTML = list.map((p) => `
    <article class="product-card" data-product-id="${p.id}">
      <div class="product-media">${productImage(p)}<span class="badge">${escapeHtml(p.badge || "Disponible")}</span></div>
      <div class="product-body">
        <div class="product-category">${escapeHtml(p.categorie)}</div>
        <h3>${escapeHtml(p.nom)}</h3>
        <p>${escapeHtml(p.description)}</p>
        <div class="price">${formatPrice(p.prix)}</div>
        <div class="options">${optionSelect("Volume", p.volumes, "volume", "volume")}${optionSelect("Taille", p.tailles, "size", "taille")}${optionSelect("Couleur", p.couleurs, "color", "couleur")}</div>
        <button class="btn btn-blue full add-btn" type="button" data-id="${p.id}">🛒 Ajouter au panier</button>
      </div>
    </article>`).join("");
}

function initCategories() {
  const categories = [...new Set(produits.map((p) => p.categorie))].sort();
  $("#categoryFilter").insertAdjacentHTML("beforeend", categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join(""));
}

function filterProducts() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const category = $("#categoryFilter").value;
  const result = produits.filter((p) => {
    const matchesText = [p.nom, p.categorie, p.description, ...(p.volumes || []), ...(p.tailles || []), ...(p.couleurs || [])].join(" ").toLowerCase().includes(query);
    return matchesText && (category === "all" || p.categorie === category);
  });
  renderProducts(result);
}

function addToCart(productId, card) {
  const product = getProduct(productId);
  const options = {};
  card.querySelectorAll("select").forEach((select) => { options[select.dataset.key] = select.value; });
  const variant = [options.volume, options.taille, options.couleur].filter(Boolean).join(" • ") || "Standard";
  const key = `${product.id}|${variant}`;
  const existing = panier.find((item) => item.key === key);
  if (existing) existing.quantity += 1;
  else panier.push({ key, productId: product.id, name: product.nom, price: product.prix, variant, quantity: 1 });
  saveCart(); renderCart(); updateCartBadge(); openCart(); showToast(`${product.nom} ajouté au panier.`);
}

function renderCart() {
  const items = $("#cartItems");
  const empty = $("#cartEmpty");
  items.innerHTML = panier.map((item) => `
    <div class="cart-item">
      <div class="cart-item-main"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.variant)}</small><span>${formatPrice(item.price)}</span></div>
      <div class="cart-controls"><button type="button" data-cart-action="minus" data-key="${escapeHtml(item.key)}">−</button><b>${item.quantity}</b><button type="button" data-cart-action="plus" data-key="${escapeHtml(item.key)}">+</button><button class="remove" type="button" data-cart-action="remove" data-key="${escapeHtml(item.key)}">×</button></div>
    </div>`).join("");
  empty.classList.toggle("hidden", panier.length !== 0);
  $("#cartTotal").textContent = formatPrice(cartTotal());
  $("#checkoutBtn").disabled = panier.length === 0;
  $("#clearCartBtn").disabled = panier.length === 0;
}

function updateCartBadge() { $("#cartCount").textContent = cartCount(); }
function openCart() { $("#cartDrawer").classList.add("open"); $("#overlay").classList.remove("hidden"); $("#cartDrawer").setAttribute("aria-hidden", "false"); }
function closeCart() { $("#cartDrawer").classList.remove("open"); $("#overlay").classList.add("hidden"); $("#cartDrawer").setAttribute("aria-hidden", "true"); }
function openModal() { if (!panier.length) return showToast("Votre panier est vide."); closeCart(); $("#checkoutModal").classList.remove("hidden"); document.body.classList.add("no-scroll"); setTimeout(() => $("#lastName").focus(), 50); }
function closeModal() { $("#checkoutModal").classList.add("hidden"); document.body.classList.remove("no-scroll"); }
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2400); }

function buildWhatsAppMessage(formData) {
  const lines = [
    "Bonjour Diagne Global Business 👋",
    "",
    "Je souhaite confirmer ma commande :",
    "",
    "🛍️ COMMANDE"
  ];
  panier.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`);
    lines.push(`   ${item.variant}`);
    lines.push(`   Quantité : ${item.quantity}`);
    lines.push(`   Sous-total : ${formatPrice(item.quantity * item.price)}`);
  });
  lines.push("", `💰 TOTAL : ${formatPrice(cartTotal())}`, "", "👤 INFORMATIONS CLIENT", `Nom : ${formData.lastName}`, `Prénom : ${formData.firstName}`, `Téléphone : ${formData.phone}`, `Lieu de livraison : ${formData.deliveryPlace}`);
  if (formData.address) lines.push(`Adresse / précision : ${formData.address}`);
  lines.push("", "Merci de confirmer ma commande et de m'indiquer les modalités de paiement par Wave ou Orange Money.");
  return lines.join("\n");
}

function handleCheckout(event) {
  event.preventDefault();
  const data = { lastName: $("#lastName").value.trim(), firstName: $("#firstName").value.trim(), phone: $("#phone").value.trim(), deliveryPlace: $("#deliveryPlace").value.trim(), address: $("#address").value.trim() };
  const error = $("#formError");
  if (!data.lastName || !data.firstName || !data.phone || !data.deliveryPlace) { error.textContent = "Veuillez remplir tous les champs obligatoires (*)."; return; }
  if (data.phone.replace(/\D/g, "").length < 8) { error.textContent = "Veuillez vérifier votre numéro de téléphone."; return; }
  error.textContent = "";
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
  window.open(url, "_blank", "noopener");
}

document.addEventListener("click", (event) => {
  const add = event.target.closest(".add-btn");
  if (add) addToCart(Number(add.dataset.id), add.closest(".product-card"));
  const action = event.target.closest("[data-cart-action]");
  if (action) {
    const item = panier.find((i) => i.key === action.dataset.key);
    if (!item) return;
    if (action.dataset.cartAction === "plus") item.quantity += 1;
    if (action.dataset.cartAction === "minus") item.quantity -= 1;
    if (action.dataset.cartAction === "remove" || item.quantity <= 0) panier = panier.filter((i) => i.key !== action.dataset.key);
    saveCart(); renderCart(); updateCartBadge();
  }
});

$("#openCartBtn").addEventListener("click", openCart);
$("#closeCartBtn").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
$("#checkoutBtn").addEventListener("click", openModal);
$("#closeModalBtn").addEventListener("click", closeModal);
$("#checkoutModal").addEventListener("click", (e) => { if (e.target.id === "checkoutModal") closeModal(); });
$("#clearCartBtn").addEventListener("click", () => { panier = []; saveCart(); renderCart(); updateCartBadge(); showToast("Panier vidé."); });
$("#searchInput").addEventListener("input", filterProducts);
$("#categoryFilter").addEventListener("change", filterProducts);
$("#checkoutForm").addEventListener("submit", handleCheckout);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); closeModal(); } });

initCategories();
renderProducts();
renderCart();
updateCartBadge();
$("#year").textContent = new Date().getFullYear();
