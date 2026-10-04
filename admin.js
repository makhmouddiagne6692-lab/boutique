/* ADMIN — Diagne Global Business
   Protection simple côté navigateur (pas de serveur). Le mot de passe n'est pas écrit en clair. */
const PASSWORD_HASH = 6144032291554512;
const SESSION_KEY = "dgb_admin_session";
const $ = (s) => document.querySelector(s);
const escapeHtml = (v) => String(v ?? "").replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const formatPrice = (v) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function showToast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2400); }
function loadAdded() { try { return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY)) || []; } catch { return []; } }
function saveAdded(list) {
  try { localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(list)); return true; }
  catch { return false; }
}
const splitList = (v) => v.split(",").map((x) => x.trim()).filter(Boolean);

/* ---------- Connexion ---------- */
function setLoggedIn(on) {
  $("#loginView").classList.toggle("hidden", on);
  $("#adminView").classList.toggle("hidden", !on);
  $("#logoutBtn").classList.toggle("hidden", !on);
  if (on) renderAdmin();
}
$("#loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (cyrb53($("#password").value) === PASSWORD_HASH) {
    sessionStorage.setItem(SESSION_KEY, "1");
    $("#loginError").textContent = "";
    $("#password").value = "";
    setLoggedIn(true);
  } else {
    $("#loginError").textContent = "Mot de passe incorrect.";
  }
});
$("#logoutBtn").addEventListener("click", () => { sessionStorage.removeItem(SESSION_KEY); setLoggedIn(false); });

/* ---------- Photo (réduite pour tenir dans le navigateur) ---------- */
let imageData = "";
$("#pImage").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const preview = $("#imgPreview");
  if (!file) { imageData = ""; preview.classList.add("hidden"); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 700, ratio = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio); canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      imageData = canvas.toDataURL("image/jpeg", 0.78);
      preview.src = imageData; preview.classList.remove("hidden");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

/* ---------- Ajout / suppression ---------- */
$("#productForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nom = $("#pNom").value.trim(), categorie = $("#pCategorie").value.trim(), prix = Number($("#pPrix").value);
  const err = $("#productError");
  if (!nom || !categorie || !(prix >= 0) || $("#pPrix").value === "") { err.textContent = "Nom, catégorie et prix sont obligatoires."; return; }
  const added = loadAdded();
  const nextId = Math.max(999, ...added.map((p) => p.id)) + 1;
  const volumes = splitList($("#pVolumes").value), tailles = splitList($("#pTailles").value);
  added.push({
    id: nextId, nom, categorie, prix,
    description: $("#pDescription").value.trim(),
    volumes, tailles: tailles.length || volumes.length ? tailles : ["Unique"],
    couleurs: splitList($("#pCouleurs").value),
    image: imageData, badge: $("#pBadge").value.trim() || "Disponible"
  });
  if (!saveAdded(added)) { err.textContent = "Mémoire du navigateur pleine : utilisez une photo plus petite ou supprimez des produits."; return; }
  err.textContent = "";
  e.target.reset(); $("#pBadge").value = "Nouveau"; imageData = ""; $("#imgPreview").classList.add("hidden");
  showToast("Produit ajouté au catalogue ✔");
  renderAdmin(added);
});

document.addEventListener("click", (e) => {
  const del = e.target.closest("[data-del]");
  if (!del) return;
  if (!confirm("Supprimer ce produit ?")) return;
  const list = loadAdded().filter((p) => p.id !== Number(del.dataset.del));
  saveAdded(list); renderAdmin(list); showToast("Produit supprimé.");
});

function renderAdmin(added = loadAdded()) {
  const base = produits.filter((p) => p.id < 1000 || !added.some((x) => x.id === p.id));
  const all = [...base.filter((p) => p.id < 1000), ...added];
  $("#countLabel").textContent = `(${all.length})`;
  $("#catList").innerHTML = [...new Set(all.map((p) => p.categorie))].map((c) => `<option value="${escapeHtml(c)}">`).join("");
  $("#adminList").innerHTML = all.map((p) => `
    <div class="admin-item">
      ${p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : `<div class="thumb">🛍️</div>`}
      <div class="info"><strong>${escapeHtml(p.nom)}</strong><small>${escapeHtml(p.categorie)} • ${formatPrice(p.prix)}</small></div>
      ${p.id >= 1000 ? `<span class="tag">Ajouté</span><button class="del" type="button" data-del="${p.id}" aria-label="Supprimer">🗑</button>` : `<span class="tag base">Base</span>`}
    </div>`).join("");
}

/* ---------- Export du fichier produits.js ---------- */
$("#exportBtn").addEventListener("click", () => {
  const all = [...produits.filter((p) => p.id < 1000), ...loadAdded()].map((p, i) => ({ ...p, id: i + 1 }));
  const content = `/*\n  CATALOGUE DIAGNE GLOBAL BUSINESS (exporté depuis l'admin)\n  Remplacez le fichier produits.js du site par celui-ci pour publier les produits.\n*/\nconst produits = ${JSON.stringify(all, null, 2)};\n\nconst ADMIN_STORAGE_KEY = "dgb_produits_admin_v1";\ntry {\n  (JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY)) || []).forEach((p) => {\n    if (!produits.some((x) => x.nom === p.nom && x.categorie === p.categorie)) produits.push(p);\n  });\n} catch (e) {}\n`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: "text/javascript" }));
  a.download = "produits.js"; a.click(); URL.revokeObjectURL(a.href);
});

setLoggedIn(sessionStorage.getItem(SESSION_KEY) === "1");
