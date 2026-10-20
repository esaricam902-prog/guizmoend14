import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { gizmoRuntime } from '@gizmo/runtime';

const tweaks = gizmoRuntime.tweaks({
  titleText: { index: 0, name: 'Titre', type: 'text', value: 'Simulateur de Presse Hydraulique', group: 'title' },
  startButtonText: { index: 1, name: 'Bouton Start', type: 'text', value: 'Commencer le jeu', group: 'start-btn' },
  spawnButtonText: { index: 2, name: 'Bouton Apparition', type: 'text', value: 'Lancer un objet', group: 'spawn-button' },
  spawnButtonColor: { index: 3, name: 'Bouton Apparition', type: 'color', value: "#5AFF2A", group: 'spawn-button' },
  spawnButtonSize: { index: 4, name: 'Bouton Apparition', type: 'slider', value: 20.0, min: 4, max: 20, step: 1, group: 'spawn-button' },
  pressButtonText: { index: 5, name: 'Bouton Presse', type: 'text', value: 'Presser', group: 'press-button' },
  pressButtonColor: { index: 6, name: 'Bouton Presse', type: 'color', value: '#E93323', group: 'press-button' },
  pressButtonSize: { index: 7, name: 'Bouton Presse', type: 'slider', value: 20.0, min: 4, max: 20, step: 1, group: 'press-button' },
  backgroundColor: { index: 8, name: 'Arrière-plan', type: 'color', value: '#000000' },
  crushPlatformColor: { index: 9, name: 'Plateforme Presse', type: 'color', value: '#2227F5' },
  crushSpeed: { index: 10, name: 'Vitesse Presse', type: 'slider', value: 12.0, min: 2, max: 20, step: 1 },
  crushFragments: { index: 11, name: 'Fragments par écrasement', type: 'slider', value: 4.0, min: 2, max: 8, step: 1 },
  gravity: { index: 12, name: 'Gravité', type: 'slider', value: 1.0, min: 0, max: 5, step: 0.1 },
  objectSize: { index: 13, name: 'Taille Objet', type: 'slider', value: 70, min: 20, max: 150, step: 5 },
  showMoneyLabel: { index: 14, name: 'Afficher Label x10', type: 'toggle', value: true },
  shopTitle: { index: 15, name: 'Titre Boutique', type: 'text', value: '🛍️ Boutique', group: 'shop-ui' },
  ownedText: { index: 16, name: 'Texte Possédé', type: 'text', value: 'Possédé', group: 'shop-ui' },
  buyText: { index: 17, name: 'Texte Acheter', type: 'text', value: 'Acheter', group: 'shop-ui' },
  notEnoughText: { index: 18, name: 'Texte Pas Assez', type: 'text', value: 'Pas assez', group: 'shop-ui' },
  maxReachedText: { index: 19, name: 'Texte Max Atteint', type: 'text', value: 'Max atteint', group: 'shop-ui' },
  winText: { index: 20, name: 'Texte Victoire', type: 'text', value: 'Vous avez fini le jeu !', group: 'win-ui' },
});

const COLORS = ['#E93323', '#E432B7', '#2227F5', '#53B5F9', '#75F94C', '#EFB63F', '#8762F6', '#FFDD46'];
const SHAPES = ['circle', 'square', 'rectangle', 'triangle'];
const STORAGE_KEY = 'hydraulic-press-save-v1';

export default function Component() {
  // Tweak values
  const titleText = tweaks.titleText.useState();
  const startButtonText = tweaks.startButtonText.useState();
  const spawnButtonText = tweaks.spawnButtonText.useState();
  const spawnButtonColor = tweaks.spawnButtonColor.useState();
  const spawnButtonSize = tweaks.spawnButtonSize.useState();
  const pressButtonText = tweaks.pressButtonText.useState();
  const pressButtonColor = tweaks.pressButtonColor.useState();
  const pressButtonSize = tweaks.pressButtonSize.useState();
  const backgroundColor = tweaks.backgroundColor.useState();
  const crushPlatformColor = tweaks.crushPlatformColor.useState();
  const crushSpeed = tweaks.crushSpeed.useState();
  const crushFragments = tweaks.crushFragments.useState();
  const gravity = tweaks.gravity.useState();
  const objectSize = tweaks.objectSize.useState();
  const showMoneyLabel = tweaks.showMoneyLabel.useState();
  const shopTitle = tweaks.shopTitle.useState();
  const ownedText = tweaks.ownedText.useState();
  const buyText = tweaks.buyText.useState();
  const notEnoughText = tweaks.notEnoughText.useState();
  const maxReachedText = tweaks.maxReachedText.useState();
  const winText = tweaks.winText.useState();

  // Game State
  const [money, setMoney] = useState(0);
  const [moneyMultiplier, setMoneyMultiplier] = useState(1);
  const [spawnCooldownReduction, setSpawnCooldownReduction] = useState(0);
  const [spawnCountUpgrades, setSpawnCountUpgrades] = useState(0);
  const [allShapesMultiplier, setAllShapesMultiplier] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // UI State
  const [isPressing, setIsPressing] = useState(false);
  const [spawnCooldown, setSpawnCooldown] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [buttonColorIndex, setButtonColorIndex] = useState(0);

  // Refs for Matter.js and performance
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const renderRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);
  const crushPlatformRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectsRef = useRef<Map<number, { size: number; shapeType: string; color: string; isMultiplier: boolean }>>(new Map());
  const crushedRef = useRef<Set<number>>(new Set());

  const spawnUpgradePrices = [500, 2000, 5000, 10000, 20000];

  // Persistence: Load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setMoney(data.money ?? 0);
        setMoneyMultiplier(data.moneyMultiplier ?? 1);
        setSpawnCooldownReduction(data.spawnCooldownReduction ?? 0);
        setSpawnCountUpgrades(data.spawnCountUpgrades ?? 0);
        setAllShapesMultiplier(data.allShapesMultiplier ?? false);
        setGameCompleted(data.gameCompleted ?? false);
      }
    } catch (e) {
      console.error("Failed to load save", e);
    }
  }, []);

  // Persistence: Auto-save every 5 seconds
  useEffect(() => {
    const save = () => {
      try {
        const data = {
          money,
          moneyMultiplier,
          spawnCooldownReduction,
          spawnCountUpgrades,
          allShapesMultiplier,
          gameCompleted
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Failed to save", e);
      }
    };
    const interval = setInterval(save, 5000);
    return () => clearInterval(interval);
  }, [money, moneyMultiplier, spawnCooldownReduction, spawnCountUpgrades, allShapesMultiplier, gameCompleted]);

  // Matter.js Setup
  useEffect(() => {
    if (!sceneRef.current || !gameStarted) return;

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const engine = Engine.create();
    engine.world.gravity.y = gravity;
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: backgroundColor,
      },
    });
    renderRef.current = render;

    const ground = Bodies.rectangle(width / 2, height - 30, width, 60, { isStatic: true, render: { fillStyle: '#4A4A4A' } });
    const wallLeft = Bodies.rectangle(-30, height / 2, 60, height, { isStatic: true, render: { fillStyle: '#4A4A4A' } });
    const wallRight = Bodies.rectangle(width + 30, height / 2, 60, height, { isStatic: true, render: { fillStyle: '#4A4A4A' } });
    const crushPlatform = Bodies.rectangle(width / 2, 60, width, 40, { isStatic: true, render: { fillStyle: crushPlatformColor } });
    crushPlatformRef.current = crushPlatform;
    const ceiling = Bodies.rectangle(width / 2, 10, width, 20, { isStatic: true, render: { fillStyle: '#4A4A4A' } });

    Composite.add(engine.world, [ground, wallLeft, wallRight, crushPlatform, ceiling]);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.8, render: { visible: false } },
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    const crushObject = (body: any) => {
      if (body.isStatic || crushedRef.current.has(body.id)) return;
      crushedRef.current.add(body.id);
      gizmoRuntime.performHaptic('heavy');

      const objectData = objectsRef.current.get(body.id);
      if (!objectData) return;

      const { size, shapeType, color, isMultiplier } = objectData;
      const newSize = size * 0.6;
      const moneyReward = (isMultiplier ? 10 : 1) * moneyMultiplier;

      if (newSize < 15) {
        Composite.remove(engine.world, body);
        objectsRef.current.delete(body.id);
        setMoney(prev => prev + moneyReward);
        return;
      }

      const x = body.position.x;
      const y = body.position.y;

      for (let i = 0; i < crushFragments; i++) {
        const angle = (i / crushFragments) * Math.PI * 2;
        const newX = x + Math.cos(angle) * 20;
        const newY = y + Math.sin(angle) * 20;

        let newBody;
        if (shapeType === 'circle') newBody = Bodies.circle(newX, newY, newSize / 2, { render: { fillStyle: color }, restitution: 0.6 });
        else if (shapeType === 'square') newBody = Bodies.rectangle(newX, newY, newSize, newSize, { render: { fillStyle: color }, restitution: 0.6 });
        else if (shapeType === 'rectangle') newBody = Bodies.rectangle(newX, newY, newSize * 1.5, newSize * 0.7, { render: { fillStyle: color }, restitution: 0.6 });
        else newBody = Bodies.polygon(newX, newY, 3, newSize / 1.5, { render: { fillStyle: color }, restitution: 0.6 });

        objectsRef.current.set(newBody.id, { size: newSize, shapeType, color, isMultiplier });
        Composite.add(engine.world, newBody);
      }

      Composite.remove(engine.world, body);
      objectsRef.current.delete(body.id);
      setMoney(prev => prev + moneyReward);
    };

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        if (bodyA === crushPlatform || bodyA === ceiling) crushObject(bodyB);
        else if (bodyB === crushPlatform || bodyB === ceiling) crushObject(bodyA);
      });
    });

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    return () => {
      Runner.stop(runner);
      Render.stop(render);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas?.remove();
    };
  }, [backgroundColor, crushFragments, gameStarted, moneyMultiplier, gravity]);

  // Hydraulic Press Animation
  useEffect(() => {
    if (!crushPlatformRef.current || !engineRef.current) return;
    const { Body } = Matter;
    const groundY = window.innerHeight - 60;
    const targetY = isPressing ? groundY - 20 : 60;
    
    const animate = () => {
      const currentY = crushPlatformRef.current.position.y;
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.5) {
        const direction = diff > 0 ? 1 : -1;
        Body.setPosition(crushPlatformRef.current, {
          x: crushPlatformRef.current.position.x,
          y: currentY + direction * crushSpeed,
        });
        rafRef.current = requestAnimationFrame(animate);
      } else {
        Body.setPosition(crushPlatformRef.current, {
          x: crushPlatformRef.current.position.x,
          y: targetY,
        });
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPressing, crushSpeed]);

  // Overlay Canvas for Labels
  useEffect(() => {
    if (!sceneRef.current || !gameStarted) return;
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = window.innerWidth;
    overlayCanvas.height = window.innerHeight;
    overlayCanvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:5;';
    document.body.appendChild(overlayCanvas);
    overlayCanvasRef.current = overlayCanvas;
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    let labelRafId: number;
    const drawLabels = () => {
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      if (engineRef.current && showMoneyLabel) {
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        bodies.forEach((body: any) => {
          const data = objectsRef.current.get(body.id);
          if (data && data.isMultiplier) {
            ctx.save();
            ctx.fillStyle = '#FFDD46';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText('x10$', body.position.x, body.position.y);
            ctx.fillText('x10$', body.position.x, body.position.y);
            ctx.restore();
          }
        });
      }
      labelRafId = requestAnimationFrame(drawLabels);
    };
    labelRafId = requestAnimationFrame(drawLabels);
    return () => { cancelAnimationFrame(labelRafId); overlayCanvas.remove(); };
  }, [gameStarted, showMoneyLabel]);

  const spawnObject = useCallback(() => {
    if (!engineRef.current || !crushPlatformRef.current) return;
    const { Bodies, Composite, Body } = Matter;
    const width = window.innerWidth;
    const spawnCount = 1 + spawnCountUpgrades;
    Body.setPosition(crushPlatformRef.current, { x: crushPlatformRef.current.position.x, y: 60 });
    setIsPressing(false);

    for (let i = 0; i < spawnCount; i++) {
      const shapeType = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const x = Math.random() * (width - 100) + 50;
      const y = 150;
      const size = objectSize;
      const shouldBeX10 = allShapesMultiplier ? true : Math.random() < 0.1;

      let body;
      if (shapeType === 'circle') body = Bodies.circle(x, y, size / 2, { render: { fillStyle: color }, restitution: 0.6 });
      else if (shapeType === 'square') body = Bodies.rectangle(x, y, size, size, { render: { fillStyle: color }, restitution: 0.6 });
      else if (shapeType === 'rectangle') body = Bodies.rectangle(x, y, size * 1.5, size * 0.7, { render: { fillStyle: color }, restitution: 0.6 });
      else body = Bodies.polygon(x, y, 3, size / 1.5, { render: { fillStyle: color }, restitution: 0.6 });

      objectsRef.current.set(body.id, { size, shapeType, color, isMultiplier: shouldBeX10 });
      Composite.add(engineRef.current.world, body);
    }
  }, [spawnCountUpgrades, objectSize, allShapesMultiplier]);

  const handleSpawn = () => {
    spawnObject();
    gizmoRuntime.performHaptic('light');
  };

  useEffect(() => {
    if (spawnCooldown <= 0) return;
    const timer = setInterval(() => setSpawnCooldown(p => Math.max(p - 0.1, 0)), 100);
    return () => clearInterval(timer);
  }, [spawnCooldown]);

  useEffect(() => {
    if (!gameStarted) {
      const colorInterval = setInterval(() => setButtonColorIndex(prev => (prev + 1) % COLORS.length), 1000);
      return () => clearInterval(colorInterval);
    }
  }, [gameStarted]);

  if (!gameStarted) {
    return (
      <>
        <div aria-hidden className="fixed inset-0 -z-10" style={{ background: backgroundColor }} />
        <div className="w-full h-screen flex flex-col items-center justify-center gap-8 px-4">
          <h1 className="text-5xl font-bold text-white text-center">{titleText}</h1>
          <button
            onClick={() => setGameStarted(true)}
            className="px-12 py-4 text-white font-bold text-2xl rounded-xl active:scale-95 transition-all"
            style={{ backgroundColor: COLORS[buttonColorIndex], transition: 'background-color 1s ease-in-out' }}
          >
            {startButtonText}
          </button>
        </div>
      </>
    );
  }

  if (gameCompleted) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-8">
        <h1 className="text-5xl font-bold text-white text-center">{winText}</h1>
      </div>
    );
  }

  return (
    <>
      <div aria-hidden className="fixed inset-0 -z-10" style={{ background: backgroundColor }} />
      <div ref={sceneRef} className="w-full h-screen" style={{ touchAction: 'none' }} />
      <div className="fixed top-0 left-0 z-10 p-4 text-white font-bold text-2xl">💰 {money}</div>
      
      <div className="fixed bottom-0 left-0 right-0 flex gap-4 justify-center px-4 z-10" style={{ height: '80px', paddingBottom: '20px' }}>
        <button
          onTouchStart={() => { setIsPressing(true); gizmoRuntime.performHaptic('medium'); }}
          onTouchEnd={() => setIsPressing(false)}
          onTouchCancel={() => setIsPressing(false)}
          className="rounded-lg font-bold text-white transition-all active:scale-95 flex items-center justify-center flex-1"
          style={{ backgroundColor: pressButtonColor, fontSize: `${pressButtonSize}px`, height: '60px' }}
        >
          {pressButtonText}
        </button>
        <button
          onClick={handleSpawn}
          className="rounded-lg font-bold text-white transition-all active:scale-95 flex items-center justify-center flex-1"
          style={{ backgroundColor: spawnButtonColor, fontSize: `${spawnButtonSize}px`, height: '60px' }}
        >
          {spawnButtonText}
        </button>
      </div>

      <button
        onClick={() => setShowShop(true)}
        className="fixed top-0 right-0 z-10 rounded-lg font-bold text-white transition-all active:scale-95 flex items-center justify-center m-4"
        style={{ backgroundColor: '#8762F6', fontSize: '32px', height: '60px', width: '60px' }}
      >
        🛍️
      </button>

      {showShop && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border-4 border-purple-500 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">{shopTitle}</h1>
              <button onClick={() => setShowShop(false)} className="text-white text-2xl font-bold">✕</button>
            </div>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              {/* Double Money */}
              <div className="bg-gray-800 rounded-lg p-3 border-2 border-green-400">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-white font-bold">💵 Argent Double</p>
                  <p className="text-green-400 font-bold">100💰</p>
                </div>
                <button
                  onClick={() => { if (money >= 100 && moneyMultiplier === 1) { setMoney(m => m - 100); setMoneyMultiplier(2); gizmoRuntime.performHaptic('medium'); } }}
                  disabled={money < 100 || moneyMultiplier > 1}
                  className="w-full bg-green-400 text-black font-bold py-2 rounded-lg disabled:opacity-50"
                >
                  {moneyMultiplier > 1 ? ownedText : money >= 100 ? buyText : notEnoughText}
                </button>
              </div>
              {/* Faster Spawn */}
              <div className="bg-gray-800 rounded-lg p-3 border-2 border-yellow-400">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-white font-bold">⚡ Spawn Rapide</p>
                  <p className="text-yellow-400 font-bold">200💰</p>
                </div>
                <button
                  onClick={() => { if (money >= 200 && spawnCooldownReduction < 3) { setMoney(m => m - 200); setSpawnCooldownReduction(p => p + 1); gizmoRuntime.performHaptic('medium'); } }}
                  disabled={money < 200 || spawnCooldownReduction >= 3}
                  className="w-full bg-yellow-400 text-black font-bold py-2 rounded-lg disabled:opacity-50"
                >
                  {spawnCooldownReduction >= 3 ? maxReachedText : money >= 200 ? buyText : notEnoughText}
                </button>
              </div>
              {/* Spawn +1 */}
              <div className="bg-gray-800 rounded-lg p-3 border-2 border-blue-400">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-white font-bold">📦 Spawn +1 Objet</p>
                  <p className="text-blue-400 font-bold">{spawnCountUpgrades < 5 ? spawnUpgradePrices[spawnCountUpgrades] : 'Max'}💰</p>
                </div>
                <button
                  onClick={() => {
                    const price = spawnUpgradePrices[spawnCountUpgrades];
                    if (money >= price && spawnCountUpgrades < 5) { setMoney(m => m - price); setSpawnCountUpgrades(p => p + 1); gizmoRuntime.performHaptic('medium'); }
                  }}
                  disabled={money < spawnUpgradePrices[spawnCountUpgrades] || spawnCountUpgrades >= 5}
                  className="w-full bg-blue-400 text-black font-bold py-2 rounded-lg disabled:opacity-50"
                >
                  {spawnCountUpgrades >= 5 ? maxReachedText : money >= spawnUpgradePrices[spawnCountUpgrades] ? buyText : notEnoughText}
                </button>
              </div>
              {/* All x10 */}
              <div className="bg-gray-800 rounded-lg p-3 border-2 border-orange-400">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-white font-bold">✨ Tout en x10</p>
                  <p className="text-orange-400 font-bold">50000💰</p>
                </div>
                <button
                  onClick={() => { if (money >= 50000 && !allShapesMultiplier) { setMoney(m => m - 50000); setAllShapesMultiplier(true); gizmoRuntime.performHaptic('medium'); } }}
                  disabled={money < 50000 || allShapesMultiplier}
                  className="w-full bg-orange-400 text-black font-bold py-2 rounded-lg disabled:opacity-50"
                >
                  {allShapesMultiplier ? ownedText : money >= 50000 ? buyText : notEnoughText}
                </button>
              </div>
              {/* Win Game */}
              <div className="bg-gray-800 rounded-lg p-3 border-2 border-red-400">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-white font-bold">🏆 Finir le jeu</p>
                  <p className="text-red-400 font-bold">100000💰</p>
                </div>
                <button
                  onClick={() => { if (money >= 100000) { setMoney(m => m - 100000); setGameCompleted(true); gizmoRuntime.performHaptic('heavy'); } }}
                  disabled={money < 100000}
                  className="w-full bg-red-400 text-black font-bold py-2 rounded-lg disabled:opacity-50"
                >
                  {money >= 100000 ? buyText : notEnoughText}
                </button>
              </div>
            </div>
            <div className="mt-4 text-center text-white font-bold">💰 Total: {money}</div>
          </div>
        </div>
      )}
    </>
  );
}