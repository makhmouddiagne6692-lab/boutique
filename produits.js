/*
  CATALOGUE DIAGNE GLOBAL BUSINESS
  Modifiez uniquement ce fichier pour ajouter vos produits.
  Pour une vraie photo, placez-la dans /produits et indiquez son chemin dans image.
*/
const produits = [
  {
    id: 1,
    nom: "Bois Intense",
    categorie: "Parfums",
    prix: 15000,
    description: "Parfum intense et élégant, idéal pour une utilisation quotidienne ou une occasion spéciale.",
    volumes: ["50 ml", "100 ml"],
    tailles: ["Standard"],
    couleurs: [],
    image: "",
    badge: "Populaire"
  },
  {
    id: 2,
    nom: "Parfum Élégance",
    categorie: "Parfums",
    prix: 12000,
    description: "Une fragrance raffinée avec une présence douce et durable.",
    volumes: ["30 ml", "50 ml"],
    tailles: ["Standard"],
    couleurs: [],
    image: "",
    badge: "Nouveau"
  },
  {
    id: 3,
    nom: "Chemise Classique",
    categorie: "Vêtements",
    prix: 10000,
    description: "Chemise polyvalente pour un style propre et élégant.",
    volumes: [],
    tailles: ["S", "M", "L", "XL", "XXL"],
    couleurs: ["Blanc", "Noir", "Bleu"],
    image: "",
    badge: "Disponible"
  },
  {
    id: 4,
    nom: "T-Shirt Premium",
    categorie: "Vêtements",
    prix: 7500,
    description: "T-shirt confortable disponible en plusieurs tailles et couleurs.",
    volumes: [],
    tailles: ["S", "M", "L", "XL"],
    couleurs: ["Blanc", "Noir", "Vert", "Bleu"],
    image: "",
    badge: "Choix client"
  },
  {
    id: 5,
    nom: "Accessoire Élégant",
    categorie: "Accessoires",
    prix: 5000,
    description: "Un accessoire simple pour compléter votre style.",
    volumes: [],
    tailles: ["Unique"],
    couleurs: ["Noir", "Bleu"],
    image: "",
    badge: "Nouveau"
  },
  {
    id: 6,
    nom: "Produit Exemple",
    categorie: "Divers",
    prix: 8000,
    description: "Produit exemple à remplacer par votre prochain article.",
    volumes: ["Standard"],
    tailles: ["Unique"],
    couleurs: [],
    image: "",
    badge: "Disponible"
  }
];

/*
  PRODUITS AJOUTÉS DEPUIS LA PAGE ADMIN (admin.html)
  Ils sont enregistrés dans le navigateur (localStorage) de l'appareil utilisé pour l'admin.
  Les produits ajoutés ont un id >= 1000.
*/
const ADMIN_STORAGE_KEY = "dgb_produits_admin_v1";
try {
  const ajoutes = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY)) || [];
  ajoutes.forEach((p) => {
    const existe = produits.some((x) => x.nom === p.nom && x.categorie === p.categorie);
    if (!existe) produits.push(p);
  });
} catch (e) { /* aucun produit ajouté */ }
