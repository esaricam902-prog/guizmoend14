# Gizmo Portal

Portail (`index.html`) de mini-jeux Gizmo convertis en pages HTML autonomes.

- `gizmo-src/appN.tsx` : codes exportés depuis Gizmo. Ne pas modifier sauf demande explicite.
- `tools/gizmo_to_html.py` : regénère `apps/appN.html` à partir de `gizmo-src/`.
  Ne jamais éditer `apps/appN.html` à la main : modifier la source puis relancer le script.
- `apps/gizmo-runtime.js` : remplace `@gizmo/runtime` dans le navigateur.

## Version du site (obligatoire)

À chaque mise à jour du site, ajouter une entrée **en haut** de la liste `CHANGELOG`
dans `index.html`, dans le même commit que le changement :

- `version` : incrémenter (`1.3.0` → `1.4.0` pour un ajout, `1.3.1` pour une correction) ;
- `date` : date du jour au format `JJ/MM/AAAA` ;
- `changes` : phrases courtes en français, compréhensibles par un joueur.

La version affichée sur le site (en-tête, bas de la liste des jeux, fenêtre « Nouveautés »)
vient automatiquement de la première entrée.

Indiquer aussi la nouvelle version dans le titre de la pull request, par exemple
`v1.4.0 — Ajout du jeu 15`.
