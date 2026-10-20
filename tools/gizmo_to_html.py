#!/usr/bin/env python3
"""Convertit les codes exportés depuis Gizmo (React/TSX) en pages HTML autonomes.

Le code du jeu n'est pas modifié : il est inséré tel quel dans une page qui
fournit React, les bibliothèques importées (lucide-react, matter-js, tone,
framer-motion) via une import map, et un remplacement de '@gizmo/runtime'.

Usage : python3 tools/gizmo_to_html.py
  lit   gizmo-src/appN.tsx
  écrit apps/appN.html
"""

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "gizmo-src"
OUT_DIR = ROOT / "apps"

APPS = {
    1: "YouTube Simulator Pro",
    2: "Simulateur de Presse Hydraulique",
    3: "Cercle Musical & Physique",
    4: "Stimulus Clicker",
    5: "Neuro-Link: Domination",
    6: "Simulateur de Peste",
    7: "Math Solver",
    8: "Ragdoll Smash Lab",
    9: "Simulateur PC Gamer",
    10: "Amazin Shopping",
    11: "Président Simulateur",
    12: "Phone Simulator",
    13: "Rainy 75 Keyboard",
    14: "Bizarre Slime",
}

REACT = "18.3.1"
IMPORT_MAP = {
    "imports": {
        "react": f"https://esm.sh/react@{REACT}",
        "react/jsx-runtime": f"https://esm.sh/react@{REACT}/jsx-runtime",
        "react-dom": f"https://esm.sh/react-dom@{REACT}?external=react",
        "react-dom/client": f"https://esm.sh/react-dom@{REACT}/client?external=react",
        "lucide-react": "https://esm.sh/lucide-react@0.454.0?external=react",
        "framer-motion": "https://esm.sh/framer-motion@11.11.17?external=react,react-dom",
        "matter-js": "https://esm.sh/matter-js@0.19.0",
        "tone": "https://esm.sh/tone@15.0.4",
        "@gizmo/runtime": "./gizmo-runtime.js",
    }
}

TEMPLATE = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>{title}</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Modules utilisés par le code Gizmo -->
  <script type="importmap">
{import_map}
  </script>

  <!-- Babel pour interpréter le React/TypeScript (TSX) -->
  <script src="https://unpkg.com/@babel/standalone@7.26.4/babel.min.js"></script>
  <script>
    Babel.registerPreset('gizmo-tsx', {{
      presets: [
        [Babel.availablePresets.typescript, {{ allExtensions: true, isTSX: true }}],
        Babel.availablePresets.react,
      ],
    }});
  </script>

  <style>
    html, body, #root {{ margin: 0; height: 100%; }}
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel" data-type="module" data-presets="gizmo-tsx">
// ===== CODE GIZMO ORIGINAL (non modifié) =====
{code}
// ===== FIN DU CODE GIZMO =====

import {{ createRoot as __gizmoCreateRoot }} from 'react-dom/client';
__gizmoCreateRoot(document.getElementById('root')).render(<{component} />);
  </script>
</body>
</html>
"""


def convert(app_id: int, title: str) -> Path:
    code = (SRC_DIR / f"app{app_id}.tsx").read_text(encoding="utf-8").rstrip()
    if "</script" in code.lower():
        raise ValueError(f"app{app_id}: le code contient '</script'")
    match = re.search(r"export\s+default\s+function\s+(\w+)", code)
    if not match:
        raise ValueError(f"app{app_id}: aucun 'export default function' trouvé")
    import_map = json.dumps(IMPORT_MAP, indent=2)
    page = TEMPLATE.format(
        title=html.escape(title),
        import_map="\n".join("  " + line for line in import_map.splitlines()),
        code=code,
        component=match.group(1),
    )
    out = OUT_DIR / f"app{app_id}.html"
    out.write_text(page, encoding="utf-8")
    return out


def main():
    for app_id, title in APPS.items():
        print(f"{convert(app_id, title).relative_to(ROOT)}  <-  {title}")


if __name__ == "__main__":
    main()
