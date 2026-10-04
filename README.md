# Diagne Global Business

Boutique virtuelle sans backend — HTML, CSS et JavaScript.

## Fichiers
- `index.html` : structure et contenu du site
- `style.css` : design responsive
- `script.js` : catalogue, recherche, panier, formulaire et WhatsApp
- `produits.js` : données des produits
- `logo/logo.png` : logo officiel
- `produits/` : dossier prévu pour les photos des produits

## Page admin
- `admin.html` + `admin.js` + `admin.css` : connexion par mot de passe, ajout/suppression de produits (avec photo), export de `produits.js`.
- Les produits ajoutés sont gardés dans le navigateur utilisé. Pour les rendre visibles à tous : bouton « Exporter produits.js », puis remplacer le fichier du site.
- Protection simple côté navigateur (site sans serveur) : adaptée à un usage personnel, pas à des données sensibles.

## Modifier les produits
Ouvrez `produits.js` et ajoutez/modifiez les objets du tableau `produits`.
Placez les photos dans `produits/`, puis indiquez le chemin dans `image`, par exemple `produits/mon-produit.jpg`.

## WhatsApp
Le numéro de confirmation est configuré sur `+221 71 051 97 11`.

## Important
Cette version n'utilise pas de backend. Les paniers sont conservés localement dans le navigateur et les commandes sont transmises à WhatsApp. Le paiement n'est pas automatiquement vérifié par le site.
