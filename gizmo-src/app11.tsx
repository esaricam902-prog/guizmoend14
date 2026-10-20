import React, { useState, useEffect, useCallback, useRef } from 'react';
import { gizmoRuntime } from '@gizmo/runtime';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Shield, 
  Wallet, 
  Globe, 
  Heart, 
  Zap, 
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Award,
  Flag,
  Scale,
  Check,
  X
} from 'lucide-react';

// --- TWEAKS ---
const tweaks = gizmoRuntime.tweaks({
  bgColor: { index: 0, name: 'Background Color', type: 'color', value: '#000000' },
  primaryColor: { index: 1, name: 'Primary UI Color', type: 'color', value: '#2227F5' },
  accentColor: { index: 2, name: 'Accent Color', type: 'color', value: '#E93323' },
  
  titleText: { index: 3, name: 'Title Text', type: 'text', value: 'PRÉSIDENT SIMULATEUR', group: 'title' },
  titleColor: { index: 4, name: 'Title Color', type: 'color', value: '#FFFFFF', group: 'title' },
  titleVisible: { index: 5, name: 'Title Visible', type: 'toggle', value: true, group: 'title' },
  titleSize: { index: 6, name: 'Title Size', type: 'slider', value: 24, min: 12, max: 48, step: 1, group: 'title' },

  startBtnText: { index: 7, name: 'Start Button', type: 'text', value: 'Prendre le Pouvoir', group: 'start-btn' },
  startBtnColor: { index: 8, name: 'Start Button Color', type: 'color', value: '#75F94C', group: 'start-btn' },
  startBtnVisible: { index: 9, name: 'Start Button Visible', type: 'toggle', value: true, group: 'start-btn' },
  startBtnSize: { index: 10, name: 'Start Button Size', type: 'slider', value: 20, min: 12, max: 32, step: 1, group: 'start-btn' },

  difficulty: { index: 11, name: 'Difficulté', type: 'slider', value: 0.575, min: 0.1, max: 2, step: 0.1 },
  termLength: { index: 12, name: 'Durée du Mandat (Jours)', type: 'slider', value: 100, min: 20, max: 365, step: 1 },

  countryLabel: { index: 13, name: 'Label Pays', type: 'text', value: 'Choisissez votre Pays', group: 'setup-labels' },
  ideologyLabel: { index: 14, name: 'Label Idéologie', type: 'text', value: 'Orientation Politique', group: 'setup-labels' },
});

// --- DATA ---
const COUNTRIES = [
  { id: 'fr', name: 'France', emoji: '🇫🇷', stats: { approval: 50, stability: 70, budget: 50 }, desc: 'Stabilité forte, budget serré.' },
  { id: 'us', name: 'USA', emoji: '🇺🇸', stats: { approval: 40, stability: 50, budget: 80 }, desc: 'Budget colossal, peuple divisé.' },
  { id: 'br', name: 'Brésil', emoji: '🇧🇷', stats: { approval: 70, stability: 40, budget: 50 }, desc: 'Peuple passionné, instabilité politique.' },
  { id: 'jp', name: 'Japon', emoji: '🇯🇵', stats: { approval: 50, stability: 80, budget: 40 }, desc: 'Ordre absolu, économie stagnante.' },
  { id: 'ca', name: 'Canada', emoji: '🇨🇦', stats: { approval: 60, stability: 60, budget: 60 }, desc: 'Équilibre parfait, mais défis climatiques.' },
  { id: 'de', name: 'Allemagne', emoji: '🇩🇪', stats: { approval: 55, stability: 75, budget: 65 }, desc: 'Rigueur budgétaire et industrie forte.' },
  { id: 'gb', name: 'Royaume-Uni', emoji: '🇬🇧', stats: { approval: 45, stability: 55, budget: 55 }, desc: 'Tradition et défis post-Brexit.' },
  { id: 'it', name: 'Italie', emoji: '🇮🇹', stats: { approval: 50, stability: 45, budget: 40 }, desc: 'Culture riche, politique mouvementée.' },
  { id: 'es', name: 'Espagne', emoji: '🇪🇸', stats: { approval: 55, stability: 50, budget: 45 }, desc: 'Tourisme et chômage des jeunes.' },
  { id: 'cn', name: 'Chine', emoji: '🇨🇳', stats: { approval: 80, stability: 90, budget: 85 }, desc: 'Croissance rapide, contrôle strict.' },
  { id: 'ru', name: 'Russie', emoji: '🇷🇺', stats: { approval: 65, stability: 70, budget: 50 }, desc: 'Ressources vastes, tensions mondiales.' },
  { id: 'in', name: 'Inde', emoji: '🇮🇳', stats: { approval: 75, stability: 50, budget: 45 }, desc: 'Démocratie géante, contrastes forts.' },
  { id: 'au', name: 'Australie', emoji: '🇦🇺', stats: { approval: 60, stability: 70, budget: 60 }, desc: 'Ressources minières et faune unique.' },
  { id: 'mx', name: 'Mexique', emoji: '🇲🇽', stats: { approval: 60, stability: 40, budget: 45 }, desc: 'Économie dynamique, défis sécuritaires.' },
  { id: 'za', name: 'Afrique du Sud', emoji: '🇿🇦', stats: { approval: 50, stability: 40, budget: 40 }, desc: 'Nation arc-en-ciel, défis sociaux.' },
  { id: 'kr', name: 'Corée du Sud', emoji: '🇰🇷', stats: { approval: 50, stability: 75, budget: 60 }, desc: 'Technologie de pointe, voisin tendu.' },
  { id: 'sa', name: 'Arabie Saoudite', emoji: '🇸🇦', stats: { approval: 70, stability: 80, budget: 90 }, desc: 'Pétrole et réformes sociétales.' },
  { id: 'tr', name: 'Turquie', emoji: '🇹🇷', stats: { approval: 55, stability: 50, budget: 40 }, desc: 'Pont entre continents, inflation forte.' },
  { id: 'ar', name: 'Argentine', emoji: '🇦🇷', stats: { approval: 60, stability: 35, budget: 30 }, desc: 'Passion football, économie fragile.' },
  { id: 'eg', name: 'Égypte', emoji: '🇪🇬', stats: { approval: 55, stability: 60, budget: 35 }, desc: 'Histoire millénaire, canal stratégique.' },
  { id: 'ng', name: 'Nigeria', emoji: '🇳🇬', stats: { approval: 50, stability: 35, budget: 45 }, desc: 'Géant africain, pétrole et jeunesse.' },
  { id: 'ch', name: 'Suisse', emoji: '🇨🇭', stats: { approval: 70, stability: 95, budget: 80 }, desc: 'Neutralité et banques prestigieuses.' },
  { id: 'se', name: 'Suède', emoji: '🇸🇪', stats: { approval: 65, stability: 85, budget: 70 }, desc: 'Modèle social et innovation.' },
  { id: 'be', name: 'Belgique', emoji: '🇧🇪', stats: { approval: 50, stability: 60, budget: 50 }, desc: 'Cœur de l\'Europe, compromis complexes.' },
  { id: 'ma', name: 'Maroc', emoji: '🇲🇦', stats: { approval: 65, stability: 75, budget: 45 }, desc: 'Stabilité régionale et tourisme.' },
  { id: 'dz', name: 'Algérie', emoji: '🇩🇿', stats: { approval: 55, stability: 60, budget: 50 }, desc: 'Gaz naturel et histoire profonde.' },
  { id: 'vn', name: 'Vietnam', emoji: '🇻🇳', stats: { approval: 75, stability: 80, budget: 55 }, desc: 'Industrie en plein essor.' },
  { id: 'th', name: 'Thaïlande', emoji: '🇹🇭', stats: { approval: 60, stability: 50, budget: 50 }, desc: 'Sourire et instabilité politique.' },
  { id: 'id', name: 'Indonésie', emoji: '🇮🇩', stats: { approval: 70, stability: 60, budget: 55 }, desc: 'Archipel géant, biodiversité.' },
  { id: 'pl', name: 'Pologne', emoji: '🇵🇱', stats: { approval: 55, stability: 65, budget: 55 }, desc: 'Croissance est-européenne.' },
];

const IDEOLOGIES = [
  { 
    id: 'left', 
    name: 'Gauche', 
    emoji: '🌹', 
    desc: 'Focus Social. +15% Approbation, -10% Budget.',
    modifiers: { approval: 1.2, budget: 0.8, stability: 1.0 }
  },
  { 
    id: 'right', 
    name: 'Droite', 
    emoji: '🦅', 
    desc: 'Focus Économique. +15% Budget, -10% Stabilité.',
    modifiers: { approval: 0.8, budget: 1.2, stability: 1.0 }
  },
  { 
    id: 'indie', 
    name: 'Indépendant', 
    emoji: '⚖️', 
    desc: 'Pragmatisme. Stats équilibrées, pas de bonus.',
    modifiers: { approval: 1.0, budget: 1.0, stability: 1.0 }
  }
];

const CRISES = [
  {
    id: 'strike',
    title: 'Grève Générale',
    description: 'Les syndicats bloquent les raffineries pour réclamer des hausses de salaires.',
    options: [
      { text: 'Négocier et céder', impact: { approval: 15, budget: -15, stability: 5 }, emoji: '🤝' },
      { text: 'Utiliser la force', impact: { approval: -20, budget: 0, stability: -10 }, emoji: '👮' },
      { text: 'Ignorer la situation', impact: { approval: -10, budget: 5, stability: -15 }, emoji: '🙈' }
    ]
  },
  {
    id: 'pandemic',
    title: 'Alerte Sanitaire',
    description: 'Un nouveau virus se propage rapidement dans les grandes villes.',
    options: [
      { text: 'Confinement total', impact: { approval: -15, budget: -20, stability: 10 }, emoji: '🏠' },
      { text: 'Masques obligatoires', impact: { approval: -5, budget: -5, stability: 5 }, emoji: '😷' },
      { text: 'Immunité collective', impact: { approval: -30, budget: 10, stability: -20 }, emoji: '🧬' }
    ]
  },
  {
    id: 'war',
    title: 'Conflit Frontalier',
    description: 'Une nation voisine déploie des troupes à la frontière.',
    options: [
      { text: 'Diplomatie intense', impact: { approval: 5, budget: -5, stability: 5 }, emoji: '🕊️' },
      { text: 'Mobilisation armée', impact: { approval: 10, budget: -25, stability: 15 }, emoji: '🪖' },
      { text: 'Sanctions économiques', impact: { approval: 0, budget: -10, stability: 0 }, emoji: '📉' }
    ]
  },
  {
    id: 'scandal',
    title: 'Scandale Financier',
    description: 'Votre ministre de l\'économie est accusé de détournement de fonds.',
    options: [
      { text: 'Le limoger immédiatement', impact: { approval: 10, budget: 0, stability: -5 }, emoji: '🚫' },
      { text: 'Le soutenir publiquement', impact: { approval: -25, budget: 0, stability: 10 }, emoji: '🛡️' },
      { text: 'Lancer une enquête', impact: { approval: 5, budget: -2, stability: 0 }, emoji: '🔍' }
    ]
  },
  {
    id: 'energy',
    title: 'Crise Énergétique',
    description: 'Le prix de l\'électricité explose suite à une panne majeure.',
    options: [
      { text: 'Subventionner les prix', impact: { approval: 15, budget: -30, stability: 5 }, emoji: '⚡' },
      { text: 'Rationnement strict', impact: { approval: -20, budget: 5, stability: -5 }, emoji: '🕯️' },
      { text: 'Investir dans le nucléaire', impact: { approval: 5, budget: -40, stability: 10 }, emoji: '⚛️' }
    ]
  },
  {
    id: 'cyber',
    title: 'Cyber-Attaque',
    description: 'Les serveurs de l\'État sont piratés par un groupe inconnu.',
    options: [
      { text: 'Payer la rançon', impact: { approval: -5, budget: -20, stability: 10 }, emoji: '💰' },
      { text: 'Contre-attaquer', impact: { approval: 5, budget: -10, stability: 5 }, emoji: '💻' },
      { text: 'Tout réinitialiser', impact: { approval: -15, budget: -5, stability: -10 }, emoji: '🔄' }
    ]
  },
  {
    id: 'olympics',
    title: 'Jeux Olympiques',
    description: 'Votre pays est pressenti pour accueillir les prochains JO.',
    options: [
      { text: 'Candidature massive', impact: { approval: 20, budget: -40, stability: 5 }, emoji: '🏅' },
      { text: 'Candidature modeste', impact: { approval: 10, budget: -15, stability: 5 }, emoji: '🏟️' },
      { text: 'Refuser l\'accueil', impact: { approval: -10, budget: 10, stability: 0 }, emoji: '❌' }
    ]
  },
  {
    id: 'climate',
    title: 'Canicule Historique',
    description: 'Une vague de chaleur sans précédent frappe le pays.',
    options: [
      { text: 'Plan d\'urgence eau', impact: { approval: 10, budget: -10, stability: 5 }, emoji: '💧' },
      { text: 'Aides aux agriculteurs', impact: { approval: 15, budget: -15, stability: 0 }, emoji: '🚜' },
      { text: 'Ne rien faire', impact: { approval: -25, budget: 5, stability: -10 }, emoji: '🔥' }
    ]
  },
  {
    id: 'ai_rise',
    title: 'Révolution IA',
    description: 'L\'intelligence artificielle menace de remplacer 30% des emplois.',
    options: [
      { text: 'Taxer les robots', impact: { approval: 15, budget: 20, stability: -5 }, emoji: '🤖' },
      { text: 'Formation massive', impact: { approval: 10, budget: -25, stability: 10 }, emoji: '📚' },
      { text: 'Laissez-faire total', impact: { approval: -20, budget: 15, stability: -15 }, emoji: '📈' }
    ]
  },
  {
    id: 'space',
    title: 'Programme Spatial',
    description: 'Vos scientifiques veulent envoyer une mission sur Mars.',
    options: [
      { text: 'Financement total', impact: { approval: 25, budget: -50, stability: 5 }, emoji: '🚀' },
      { text: 'Partenariat privé', impact: { approval: 10, budget: -10, stability: 5 }, emoji: '🤝' },
      { text: 'Annuler le projet', impact: { approval: -15, budget: 20, stability: 0 }, emoji: '🛑' }
    ]
  },
  {
    id: 'immigration',
    title: 'Crise Migratoire',
    description: 'Un afflux massif de réfugiés arrive aux frontières.',
    options: [
      { text: 'Accueil humanitaire', impact: { approval: 10, budget: -15, stability: -10 }, emoji: '🏠' },
      { text: 'Fermer les frontières', impact: { approval: -10, budget: -5, stability: 15 }, emoji: '🚧' },
      { text: 'Quota de travail', impact: { approval: 5, budget: 5, stability: 5 }, emoji: '📋' }
    ]
  },
  {
    id: 'education',
    title: 'Réforme Scolaire',
    description: 'Le niveau des élèves baisse, les professeurs manifestent.',
    options: [
      { text: 'Augmenter les salaires', impact: { approval: 15, budget: -20, stability: 10 }, emoji: '🍎' },
      { text: 'Plus de discipline', impact: { approval: -5, budget: 0, stability: 15 }, emoji: '📏' },
      { text: 'Digitalisation totale', impact: { approval: 5, budget: -15, stability: 5 }, emoji: '💻' }
    ]
  },
  {
    id: 'fake_news',
    title: 'Campagne de Désinformation',
    description: 'Des rumeurs folles circulent sur votre vie privée.',
    options: [
      { text: 'Censure des réseaux', impact: { approval: -20, budget: 0, stability: 20 }, emoji: '🔇' },
      { text: 'Conférence de presse', impact: { approval: 10, budget: -5, stability: 5 }, emoji: '🎤' },
      { text: 'Ignorer superbement', impact: { approval: -5, budget: 0, stability: -5 }, emoji: '💅' }
    ]
  },
  {
    id: 'housing',
    title: 'Crise du Logement',
    description: 'Les loyers deviennent inaccessibles dans la capitale.',
    options: [
      { text: 'Encadrement des prix', impact: { approval: 20, budget: -5, stability: -10 }, emoji: '🏢' },
      { text: 'Construire massivement', impact: { approval: 10, budget: -30, stability: 5 }, emoji: '🏗️' },
      { text: 'Aides au logement', impact: { approval: 15, budget: -20, stability: 0 }, emoji: '💸' }
    ]
  },
  {
    id: 'corruption',
    title: 'Corruption Locale',
    description: 'Plusieurs maires sont impliqués dans un réseau de pots-de-vin.',
    options: [
      { text: 'Loi anti-corruption', impact: { approval: 15, budget: 5, stability: -10 }, emoji: '⚖️' },
      { text: 'Amnistie discrète', impact: { approval: -30, budget: 10, stability: 15 }, emoji: '🤫' },
      { text: 'Enquête indépendante', impact: { approval: 10, budget: -5, stability: 0 }, emoji: '🕵️' }
    ]
  },
  {
    id: 'transport',
    title: 'Panne Ferroviaire',
    description: 'Le réseau de trains national est totalement paralysé.',
    options: [
      { text: 'Privatisation', impact: { approval: -15, budget: 25, stability: -5 }, emoji: '🎫' },
      { text: 'Rénovation d\'urgence', impact: { approval: 10, budget: -25, stability: 10 }, emoji: '🛠️' },
      { text: 'Bus de substitution', impact: { approval: -5, budget: -5, stability: 0 }, emoji: '🚌' }
    ]
  },
  {
    id: 'religion',
    title: 'Tensions Religieuses',
    description: 'Un conflit éclate entre deux communautés religieuses.',
    options: [
      { text: 'Médiation inter-foi', impact: { approval: 10, budget: -2, stability: 10 }, emoji: '🙏' },
      { text: 'Laïcité stricte', impact: { approval: -10, budget: 0, stability: 15 }, emoji: '⛪' },
      { text: 'Couvre-feu', impact: { approval: -20, budget: -5, stability: 20 }, emoji: '🌙' }
    ]
  },
  {
    id: 'drugs',
    title: 'Trafic de Drogue',
    description: 'Les cartels prennent le contrôle de certains quartiers.',
    options: [
      { text: 'Légalisation contrôlée', impact: { approval: -10, budget: 20, stability: -5 }, emoji: '🌿' },
      { text: 'Guerre totale', impact: { approval: 5, budget: -30, stability: 20 }, emoji: '🔫' },
      { text: 'Police de proximité', impact: { approval: 10, budget: -15, stability: 10 }, emoji: '👮' }
    ]
  },
  {
    id: 'water',
    title: 'Pénurie d\'Eau',
    description: 'Les réserves d\'eau potable sont au plus bas.',
    options: [
      { text: 'Désalinisation', impact: { approval: 5, budget: -40, stability: 10 }, emoji: '🌊' },
      { text: 'Coupures tournantes', impact: { approval: -30, budget: 5, stability: -10 }, emoji: '🚰' },
      { text: 'Interdire l\'arrosage', impact: { approval: -10, budget: 0, stability: 5 }, emoji: '🚫' }
    ]
  },
  {
    id: 'culture',
    title: 'Festival Mondial',
    description: 'Le pays accueille un immense festival culturel.',
    options: [
      { text: 'Subventionner', impact: { approval: 20, budget: -15, stability: 5 }, emoji: '🎨' },
      { text: 'Sécurité renforcée', impact: { approval: 5, budget: -10, stability: 15 }, emoji: '🛡️' },
      { text: 'Laisser le privé gérer', impact: { approval: 0, budget: 5, stability: 0 }, emoji: '🎪' }
    ]
  },
  {
    id: 'tax_haven',
    title: 'Paradis Fiscaux',
    description: 'Une fuite révèle que vos plus grandes entreprises ne paient pas d\'impôts.',
    options: [
      { text: 'Taxe exceptionnelle', impact: { approval: 25, budget: 30, stability: -15 }, emoji: '💰' },
      { text: 'Négocier des accords', impact: { approval: -5, budget: 10, stability: 5 }, emoji: '🤝' },
      { text: 'Ne rien changer', impact: { approval: -20, budget: 5, stability: 10 }, emoji: '📉' }
    ]
  },
  {
    id: 'pension',
    title: 'Réforme des Retraites',
    description: 'Le système de retraite est en déficit chronique.',
    options: [
      { text: 'Reculer l\'âge', impact: { approval: -35, budget: 40, stability: -20 }, emoji: '👴' },
      { text: 'Baisser les pensions', impact: { approval: -40, budget: 30, stability: -10 }, emoji: '📉' },
      { text: 'Augmenter les cotisations', impact: { approval: -20, budget: 20, stability: -5 }, emoji: '💸' }
    ]
  },
  {
    id: 'nuclear',
    title: 'Incident Nucléaire',
    description: 'Une fuite mineure est détectée dans une centrale.',
    options: [
      { text: 'Évacuation préventive', impact: { approval: -10, budget: -20, stability: 10 }, emoji: '☢️' },
      { text: 'Cacher l\'info', impact: { approval: -50, budget: 0, stability: 20 }, emoji: '🤫' },
      { text: 'Sortie du nucléaire', impact: { approval: 15, budget: -60, stability: -10 }, emoji: '🍃' }
    ]
  },
  {
    id: 'unemployment',
    title: 'Chômage des Jeunes',
    description: 'La moitié des diplômés ne trouvent pas de travail.',
    options: [
      { text: 'Emplois aidés', impact: { approval: 15, budget: -25, stability: 10 }, emoji: '💼' },
      { text: 'Baisse des charges', impact: { approval: 5, budget: -15, stability: 5 }, emoji: '📉' },
      { text: 'Service militaire', impact: { approval: -10, budget: -10, stability: 20 }, emoji: '🪖' }
    ]
  },
  {
    id: 'space_debris',
    title: 'Débris Spatiaux',
    description: 'Un satellite menace de s\'écraser sur une ville.',
    options: [
      { text: 'Missile d\'interception', impact: { approval: 10, budget: -20, stability: 15 }, emoji: '🚀' },
      { text: 'Évacuation massive', impact: { approval: -15, budget: -10, stability: 5 }, emoji: '🏃' },
      { text: 'Prier', impact: { approval: -30, budget: 0, stability: -20 }, emoji: '🙏' }
    ]
  },
  {
    id: 'genetic',
    title: 'Génie Génétique',
    description: 'Des bébés génétiquement modifiés sont nés illégalement.',
    options: [
      { text: 'Interdiction totale', impact: { approval: 10, budget: 0, stability: 10 }, emoji: '🧬' },
      { text: 'Régulation souple', impact: { approval: -5, budget: 10, stability: 0 }, emoji: '🔬' },
      { text: 'Encourager la recherche', impact: { approval: -15, budget: 20, stability: -5 }, emoji: '🧪' }
    ]
  },
  {
    id: 'ubi',
    title: 'Revenu Universel',
    description: 'Une pétition demande un revenu de base pour tous.',
    options: [
      { text: 'L\'instaurer', impact: { approval: 40, budget: -80, stability: 10 }, emoji: '💶' },
      { text: 'Expérimentation locale', impact: { approval: 15, budget: -15, stability: 5 }, emoji: '🧪' },
      { text: 'Refus catégorique', impact: { approval: -25, budget: 20, stability: 0 }, emoji: '❌' }
    ]
  },
  {
    id: 'trade_war',
    title: 'Guerre Commerciale',
    description: 'Une puissance rivale taxe vos exportations.',
    options: [
      { text: 'Rétorsion immédiate', impact: { approval: 10, budget: -10, stability: 5 }, emoji: '⚔️' },
      { text: 'Négocier à l\'OMC', impact: { approval: 0, budget: -2, stability: 5 }, emoji: '⚖️' },
      { text: 'Subventionner l\'export', impact: { approval: 15, budget: -20, stability: 0 }, emoji: '🚢' }
    ]
  }
];

const WAR_TARGETS = [
  { id: 'target1', name: 'Nation Voisine', emoji: '🏳️', power: 20, reward: 'Popularité immense', cost: 30 },
  { id: 'target2', name: 'Empire Rival', emoji: '🚩', power: 50, reward: 'Ressources infinies', cost: 60 },
  { id: 'target3', name: 'Îles Rebelles', emoji: '🏝️', power: 10, reward: 'Unité nationale', cost: 15 },
];

const STAKEHOLDERS = [
  { name: 'Peuple', emoji: '👥', key: 'approval' },
  { name: 'Armée', emoji: '🎖️', key: 'stability' },
  { name: 'Marchés', emoji: '💹', key: 'budget' }
];

const getStakeholderStatus = (key, value) => {
  if (key === 'approval') {
    if (value >= 80) return "Culte de la personnalité. Vous êtes un dieu vivant.";
    if (value >= 60) return "Le peuple soutient votre action.";
    if (value >= 40) return "L'opinion est divisée.";
    if (value >= 20) return "Le mécontentement grandit dangereusement.";
    return "Révolution imminente ! Ils veulent votre tête.";
  }
  if (key === 'stability') {
    if (value >= 80) return "L'État est inébranlable. L'armée est loyale.";
    if (value >= 60) return "Les institutions fonctionnent normalement.";
    if (value >= 40) return "Quelques troubles à l'ordre public.";
    if (value >= 20) return "Émeutes fréquentes et désobéissance civile.";
    return "Anarchie totale. L'État s'effondre.";
  }
  if (key === 'budget') {
    if (value >= 80) return "Excédent budgétaire record. L'économie rugit.";
    if (value >= 60) return "Les finances sont saines.";
    if (value >= 40) return "Dette croissante, attention aux dépenses.";
    if (value >= 20) return "Austérité forcée. Les caisses sont vides.";
    return "Faillite nationale. Le FMI prend le contrôle.";
  }
  return "";
};

// --- COMPONENT ---
export default function Component() {
  // Tweak values
  const bgColor = tweaks.bgColor.useState();
  const primaryColor = tweaks.primaryColor.useState();
  const accentColor = tweaks.accentColor.useState();
  const titleText = tweaks.titleText.useState();
  const titleColor = tweaks.titleColor.useState();
  const titleVisible = tweaks.titleVisible.useState();
  const titleSize = tweaks.titleSize.useState();
  const startBtnText = tweaks.startBtnText.useState();
  const startBtnColor = tweaks.startBtnColor.useState();
  const startBtnVisible = tweaks.startBtnVisible.useState();
  const startBtnSize = tweaks.startBtnSize.useState();
  const difficulty = tweaks.difficulty.useState();
  const termLength = tweaks.termLength.useState();
  const countryLabel = tweaks.countryLabel.useState();
  const ideologyLabel = tweaks.ideologyLabel.useState();

  // Game State
  const [gameState, setGameState] = useState('menu');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedIdeology, setSelectedIdeology] = useState(IDEOLOGIES[2]);
  const [stats, setStats] = useState({ approval: 60, stability: 70, budget: 80 });
  const [day, setDay] = useState(1);
  const [currentCrisis, setCurrentCrisis] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [showWarMenu, setShowWarMenu] = useState(false);
  
  const scrollRef = useRef(null);

  const startSetup = () => {
    gizmoRuntime.performHaptic('medium');
    setGameState('setup');
  };

  const startGame = () => {
    gizmoRuntime.performHaptic('heavy');
    // Apply ideology modifiers to starting stats
    const baseStats = { approval: 80, stability: 80, budget: 80 }; // Much easier starting stats
    if (selectedIdeology.id === 'left') {
      baseStats.approval += 20;
      baseStats.budget -= 5;
    } else if (selectedIdeology.id === 'right') {
      baseStats.budget += 20;
      baseStats.stability -= 5;
    }
    
    setStats({
      approval: Math.max(20, Math.min(100, baseStats.approval)),
      stability: Math.max(20, Math.min(100, baseStats.stability)),
      budget: Math.max(20, Math.min(100, baseStats.budget)),
    });
    
    setDay(1);
    setHistory([`Investiture en tant que Président de ${selectedCountry.name} (${selectedIdeology.name}).`]);
    setGameState('playing');
    generateCrisis();
  };

  const generateCrisis = useCallback(() => {
    const randomCrisis = CRISES[Math.floor(Math.random() * CRISES.length)];
    setCurrentCrisis(randomCrisis);
  }, []);

  const handleDecision = (option) => {
    gizmoRuntime.performHaptic('light');
    
    const mods = selectedIdeology.modifiers;
    
    // Make it much easier: positive impacts are boosted, negative impacts are reduced
    const boost = 1.5;
    const reduction = 0.3;

    const calcImpact = (val) => {
      if (val > 0) return val * difficulty * boost;
      return val * difficulty * reduction;
    };

    const newStats = {
      approval: Math.max(0, Math.min(100, stats.approval + calcImpact(option.impact.approval))),
      stability: Math.max(0, Math.min(100, stats.stability + calcImpact(option.impact.stability))),
      budget: Math.max(0, Math.min(100, stats.budget + calcImpact(option.impact.budget))),
    };

    setStats(newStats);
    setHistory(prev => [`Jour ${day}: ${option.text} - ${currentCrisis?.title}`, ...prev].slice(0, 10));
    
    if (newStats.approval <= 0 || newStats.stability <= 0 || newStats.budget <= 0) {
      setGameState('gameover');
      return;
    }

    if (day >= termLength) {
      setGameState('victory');
      return;
    }

    setDay(prev => prev + 1);
    generateCrisis();
  };

  const handleWar = (target) => {
    gizmoRuntime.performHaptic('heavy');
    const success = Math.random() * 100 < (stats.stability + 20); // High chance of success
    
    if (success) {
      setStats(prev => ({
        approval: Math.min(100, prev.approval + 30),
        stability: Math.min(100, prev.stability + 10),
        budget: Math.max(0, prev.budget - target.cost / 2),
      }));
      setHistory(prev => [`Jour ${day}: VICTOIRE ! Invasion de ${target.name} réussie.`, ...prev]);
    } else {
      setStats(prev => ({
        approval: Math.max(0, prev.approval - 10),
        stability: Math.max(0, prev.stability - 20),
        budget: Math.max(0, prev.budget - target.cost),
      }));
      setHistory(prev => [`Jour ${day}: ÉCHEC ! La guerre contre ${target.name} a tourné au désastre.`, ...prev]);
    }
    setShowWarMenu(false);
    setDay(prev => prev + 1);
    generateCrisis();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [history]);

  const getStatColor = (val) => {
    if (val > 70) return '#75F94C';
    if (val > 30) return '#EFB63F';
    return '#E93323';
  };

  const StatBar = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center text-xs font-bold text-white/70 uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <Icon size={14} />
          <span>{label}</span>
        </div>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${value}%`, backgroundColor: getStatColor(value) }}
        />
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans" style={{ backgroundColor: bgColor }}>
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px]" style={{ backgroundColor: primaryColor }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px]" style={{ backgroundColor: accentColor }} />
      </div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/10 bg-black/40 backdrop-blur-md">
        {titleVisible && (
          <h1 className="font-black italic tracking-tighter" style={{ color: titleColor, fontSize: titleSize }}>
            {titleText}
          </h1>
        )}
        {gameState === 'playing' && (
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedCountry.emoji}</span>
            <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">
              JOUR {day}/{termLength}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {gameState === 'menu' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 p-4">
            <div className="text-8xl animate-bounce">🏛️</div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Le destin de la nation est entre vos mains.</h2>
              <p className="text-white/60 text-sm max-w-[280px]">Gérez les crises, maintenez l'ordre et évitez la banqueroute pour terminer votre mandat.</p>
            </div>
            {startBtnVisible && (
              <button 
                onClick={startSetup}
                className="px-8 py-4 rounded-2xl font-black shadow-2xl active:scale-95 transition-transform"
                style={{ backgroundColor: startBtnColor, fontSize: startBtnSize, color: '#000' }}
              >
                {startBtnText}
              </button>
            )}
          </div>
        )}

        {gameState === 'setup' && (
          <div className="flex-1 flex flex-col gap-6 p-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Flag size={14} /> {countryLabel}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCountry(c); gizmoRuntime.performHaptic('light'); }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      selectedCountry.id === c.id ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{c.emoji}</span>
                      <div>
                        <div className="text-white font-bold">{c.name}</div>
                        <div className="text-white/40 text-xs">{c.desc}</div>
                      </div>
                    </div>
                    {selectedCountry.id === c.id && <Check className="text-green-400" size={20} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Scale size={14} /> {ideologyLabel}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {IDEOLOGIES.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => { setSelectedIdeology(i); gizmoRuntime.performHaptic('light'); }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      selectedIdeology.id === i.id ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{i.emoji}</span>
                      <div>
                        <div className="text-white font-bold">{i.name}</div>
                        <div className="text-white/40 text-xs">{i.desc}</div>
                      </div>
                    </div>
                    {selectedIdeology.id === i.id && <Check className="text-green-400" size={20} />}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={startGame}
              className="mt-4 w-full py-5 rounded-2xl font-black text-black shadow-2xl active:scale-95 transition-transform"
              style={{ backgroundColor: startBtnColor }}
            >
              COMMENCER LE MANDAT
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
              <StatBar label="Approbation" value={stats.approval} icon={Users} />
              <StatBar label="Stabilité" value={stats.stability} icon={Shield} />
              <StatBar label="Budget" value={stats.budget} icon={Wallet} />
            </div>

            {/* Crisis Card */}
            {currentCrisis && (
              <div className="bg-white/10 rounded-3xl p-6 border border-white/20 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-xl">
                    <AlertTriangle className="text-red-500" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{currentCrisis.title}</h3>
                </div>
                <p className="text-white/80 leading-relaxed">{currentCrisis.description}</p>
                
                <div className="flex flex-col gap-3 mt-2">
                  {currentCrisis.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDecision(opt)}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 active:bg-white/20 rounded-2xl border border-white/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-white font-medium">{opt.text}</span>
                      </div>
                      <ChevronRight className="text-white/30 group-active:translate-x-1 transition-transform" size={18} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* History Log */}
            <div className="flex-1 min-h-[100px] bg-black/20 rounded-3xl p-4 border border-white/5 overflow-hidden flex flex-col">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Journal d'Activité</h4>
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 text-xs">
                {history.map((entry, i) => (
                  <div key={i} className="text-white/60 border-l-2 border-white/10 pl-2 py-1">
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {(gameState === 'gameover' || gameState === 'victory') && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 p-6 animate-in zoom-in duration-300">
            <div className="text-8xl">
              {gameState === 'victory' ? '🏆' : '📉'}
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white">
                {gameState === 'victory' ? 'MANDAT RÉUSSI !' : 'DESTITUTION !'}
              </h2>
              <p className="text-white/60">
                {gameState === 'victory' 
                  ? `Vous avez survécu aux ${termLength} jours de votre mandat en tant que Président de ${selectedCountry.name}.`
                  : `Le pays (${selectedCountry.name}) a sombré dans le chaos. Votre politique de ${selectedIdeology.name} a échoué.`}
              </p>
            </div>

            <div className="w-full max-w-xs bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Score Final</span>
                <span className="text-white font-bold">{Math.round((stats.approval + stats.stability + stats.budget) / 3)} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Jours au Pouvoir</span>
                <span className="text-white font-bold">{day}</span>
              </div>
            </div>

            <button 
              onClick={() => setGameState('menu')}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold active:scale-95 transition-transform"
            >
              <RotateCcw size={20} />
              Recommencer
            </button>
          </div>
        )}
      </main>

      {/* Modal for Stakeholder Details */}
      {selectedStakeholder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedStakeholder(null)}>
           <div 
             className="bg-[#1a1a1a] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6 animate-in slide-in-from-bottom-10 duration-300" 
             onClick={e => e.stopPropagation()}
           >
              {/* Header */}
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="text-4xl p-2 bg-white/5 rounded-2xl">{selectedStakeholder.emoji}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">{selectedStakeholder.name}</h3>
                      <p className="text-white/40 text-xs font-bold">RAPPORT DÉTAILLÉ</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedStakeholder(null)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                   <X size={20} />
                 </button>
              </div>
              
              {/* Stats */}
              <div className="space-y-2">
                 <div className="flex justify-between items-end">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Niveau Actuel</span>
                    <span className="text-4xl font-black" style={{ color: getStatColor(stats[selectedStakeholder.key]) }}>
                      {Math.round(stats[selectedStakeholder.key])}%
                    </span>
                 </div>
                 <div className="h-6 bg-black/40 rounded-full overflow-hidden border border-white/5 p-1">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats[selectedStakeholder.key]}%`, backgroundColor: getStatColor(stats[selectedStakeholder.key]) }}
                    />
                 </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-white/90 text-center font-medium leading-relaxed">
                   "{getStakeholderStatus(selectedStakeholder.key, stats[selectedStakeholder.key])}"
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* Modal for War Menu */}
      {showWarMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowWarMenu(false)}>
           <div 
             className="bg-[#1a1a1a] w-full max-w-sm rounded-3xl p-6 border border-red-500/30 shadow-2xl space-y-6 animate-in zoom-in duration-300" 
             onClick={e => e.stopPropagation()}
           >
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="text-4xl p-2 bg-red-500/20 rounded-2xl">⚔️</div>
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">MINISTÈRE DE LA GUERRE</h3>
                      <p className="text-red-500/60 text-xs font-bold">DÉCLARER UN CONFLIT</p>
                    </div>
                 </div>
                 <button onClick={() => setShowWarMenu(false)} className="p-2 bg-white/10 rounded-full text-white">
                   <X size={20} />
                 </button>
              </div>

              <div className="space-y-3">
                {WAR_TARGETS.map(target => (
                  <button
                    key={target.id}
                    disabled={stats.budget < target.cost}
                    onClick={() => handleWar(target)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      stats.budget >= target.cost ? 'bg-white/5 border-white/10 active:bg-red-500/20' : 'opacity-50 bg-black border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{target.emoji}</span>
                      <div>
                        <div className="text-white font-bold">{target.name}</div>
                        <div className="text-white/40 text-[10px] uppercase tracking-tighter">Récompense: {target.reward}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-500 font-black">-{target.cost}€</div>
                      <div className="text-[8px] text-white/30 uppercase">Coût Budget</div>
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="text-white/40 text-[10px] text-center italic">
                "La guerre est la continuation de la politique par d'autres moyens."
              </p>
           </div>
        </div>
      )}

      {/* Footer Stakeholders */}
      {gameState === 'playing' && (
        <footer className="p-2 pb-6 bg-black/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-center z-10">
          <button 
            onClick={() => {
              setShowWarMenu(true);
              gizmoRuntime.performHaptic('medium');
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl active:bg-red-500/20 active:scale-95 transition-all w-20"
          >
            <div className="relative">
              <span className="text-3xl filter drop-shadow-lg">⚔️</span>
            </div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-1">Guerre</span>
          </button>

          {STAKEHOLDERS.map((s) => {
            const val = stats[s.key];
            let reaction = '😐';
            if (val > 75) reaction = '🤩';
            else if (val > 60) reaction = '😊';
            else if (val < 25) reaction = '🤬';
            else if (val < 40) reaction = '😠';

            return (
              <button 
                key={s.name} 
                onClick={() => {
                  setSelectedStakeholder(s);
                  gizmoRuntime.performHaptic('light');
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-xl active:bg-white/10 active:scale-95 transition-all w-24"
              >
                <div className="relative">
                  <span className="text-3xl filter drop-shadow-lg">{s.emoji}</span>
                  <span className="absolute -top-1 -right-2 text-sm animate-bounce">{reaction}</span>
                </div>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider mt-1">{s.name}</span>
                <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden mt-1">
                   <div className="h-full" style={{ width: `${val}%`, backgroundColor: getStatColor(val) }} />
                </div>
              </button>
            );
          })}
        </footer>
      )}
    </div>
  );
}