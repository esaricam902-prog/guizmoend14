import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { gizmoRuntime } from '@gizmo/runtime';

const rainbowColors = ['#E93323', '#EFB63F', '#75F94C', '#53B5F9', '#2227F5', '#8762F6', '#E432B7'];

const MUSICS = {
  mario: {
    name: 'Super Mario 🍄',
    notes: ['E5', 'E5', 'E5', 'C5', 'E5', 'G5', 'G4', 'C5', 'G4', 'E4', 'A4', 'B4', 'Bb4', 'A4', 'G4', 'E5', 'G5', 'A5', 'F5', 'G5', 'E5', 'C5', 'D5', 'B4']
  },
  megalovania: {
    name: 'Megalovania 💀',
    notes: ['D4', 'D4', 'D5', 'A4', 'Ab4', 'G4', 'F4', 'D4', 'F4', 'G4', 'C4', 'C4', 'D5', 'A4', 'Ab4', 'G4', 'F4', 'D4', 'F4', 'G4']
  },
  tetris: {
    name: 'Tetris 🧱',
    notes: ['E5', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4', 'A4', 'C5', 'E5', 'D5', 'C5', 'B4', 'C5', 'D5', 'E5', 'C5', 'A4', 'A4']
  },
  starwars: {
    name: 'Star Wars ⚔️',
    notes: ['G4', 'G4', 'G4', 'C5', 'G5', 'F5', 'E5', 'D5', 'C6', 'G5', 'F5', 'E5', 'D5', 'C6', 'G5', 'F5', 'E5', 'F5', 'D5']
  },
  rush_e: {
    name: 'Rush E 🎹',
    notes: ['E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4']
  },
  nokia: {
    name: 'Nokia Tune 📱',
    notes: ['E5', 'D5', 'F#4', 'G#4', 'C#5', 'B4', 'D4', 'E4', 'B4', 'A4', 'C#4', 'E4', 'A4']
  },
  pacman: {
    name: 'Pac-Man 🕹️',
    notes: ['B4', 'B5', 'F#5', 'D#5', 'B5', 'F#5', 'D#5', 'C5', 'C6', 'G5', 'E5', 'C6', 'G5', 'E5', 'B4', 'B5', 'F#5', 'D#5', 'B5', 'F#5', 'D#5']
  },
  harrypotter: {
    name: 'Harry Potter ⚡',
    notes: ['B4', 'E5', 'G5', 'F#5', 'E5', 'B5', 'A5', 'F#5', 'E5', 'G5', 'F#5', 'D#5', 'F5', 'B4']
  },
  pirates: {
    name: 'Pirates 🏴‍☠️',
    notes: ['D4', 'F4', 'G4', 'G4', 'G4', 'A4', 'Bb4', 'Bb4', 'Bb4', 'C5', 'A4', 'A4', 'G4', 'F4', 'F4', 'G4']
  },
  queen: {
    name: 'We Will Rock You 🎸',
    notes: ['F4', 'F4', 'G4', 'F4', 'F4', 'G4', 'F4', 'F4', 'G4', 'A4', 'A4', 'A4', 'G4']
  },
  daftpunk: {
    name: 'Harder Better 🤖',
    notes: ['F#4', 'F#4', 'A4', 'B4', 'C#5', 'E5', 'F#5', 'E5', 'C#5', 'B4', 'A4', 'F#4']
  },
  indiana: {
    name: 'Indiana Jones 🤠',
    notes: ['E4', 'F4', 'G4', 'C5', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5']
  },
  mission: {
    name: 'Mission Impossible 🕵️',
    notes: ['G4', 'G4', 'Bb4', 'C5', 'G4', 'G4', 'F4', 'F#4', 'G4', 'G4', 'Bb4', 'C5', 'G4', 'G4', 'F4', 'F#4']
  },
  beethoven: {
    name: 'Lettre à Élise 🎹',
    notes: ['E5', 'D#5', 'E5', 'D#5', 'E5', 'B4', 'D5', 'C5', 'A4', 'C4', 'E4', 'A4', 'B4', 'E4', 'G#4', 'B4', 'C5']
  },
  france: {
    name: 'La Marseillaise 🇫🇷',
    notes: ['D4', 'D4', 'D4', 'G4', 'G4', 'A4', 'A4', 'D5', 'B4', 'G4', 'B4', 'A4']
  },
  switzerland: {
    name: 'Cantique Suisse 🇨🇭',
    notes: ['G4', 'C5', 'C5', 'B4', 'A4', 'G4', 'A4', 'B4', 'C5', 'G4', 'E4', 'F4', 'G4']
  },
  badguy: {
    name: 'Bad Guy 🕶️',
    notes: ['G3', 'G3', 'G3', 'G3', 'C4', 'C4', 'C4', 'C4', 'D4', 'D4', 'D4', 'D4', 'G3', 'G3', 'G3', 'G3']
  },
  blinding: {
    name: 'Blinding Lights 🌅',
    notes: ['F4', 'F4', 'Eb4', 'F4', 'G4', 'C4', 'F4', 'F4', 'Eb4', 'F4', 'G4', 'C4']
  },
  uptown: {
    name: 'Uptown Funk 🕺',
    notes: ['D4', 'D4', 'F4', 'D4', 'G4', 'D4', 'C4', 'D4', 'D4', 'F4', 'D4', 'G4', 'D4', 'C4']
  },
  sevennation: {
    name: 'Seven Nation 🎸',
    notes: ['E4', 'E4', 'G4', 'E4', 'D4', 'C4', 'B3']
  },
  frozen: {
    name: 'Libérée Délivrée ❄️',
    notes: ['G4', 'A4', 'B4', 'D5', 'D5', 'E5', 'D5', 'B4', 'G4', 'A4', 'B4', 'B4', 'A4', 'G4', 'A4']
  },
  pokemon: {
    name: 'Pokémon ⚡',
    notes: ['G4', 'G4', 'G4', 'G4', 'E4', 'F4', 'G4', 'C5', 'B4', 'A4', 'G4', 'A4', 'B4', 'C5']
  },
  despacito: {
    name: 'Despacito 💃',
    notes: ['D5', 'C#5', 'B4', 'F#4', 'F#4', 'F#4', 'F#4', 'B4', 'B4', 'B4', 'B4', 'B4', 'A4', 'B4', 'G4']
  },
  believer: {
    name: 'Believer 🥁',
    notes: ['Bb3', 'Bb3', 'Bb3', 'Bb3', 'D4', 'D4', 'D4', 'D4', 'F4', 'F4', 'F4', 'F4', 'Eb4', 'Eb4', 'Eb4', 'Eb4']
  },
  dance_monkey: {
    name: 'Dance Monkey 🐒',
    notes: ['F#4', 'F#4', 'F#4', 'F#4', 'A4', 'A4', 'A4', 'A4', 'B4', 'B4', 'B4', 'B4', 'D5', 'D5', 'D5', 'D5']
  },
  shape_of_you: {
    name: 'Shape of You ➗',
    notes: ['C#4', 'E4', 'C#4', 'C#4', 'E4', 'C#4', 'C#4', 'E4', 'C#4', 'D#4', 'B3']
  },
  never_gonna: {
    name: 'Rickroll 🕺',
    notes: ['G4', 'A4', 'C5', 'A4', 'E5', 'E5', 'D5', 'G4', 'A4', 'C5', 'A4', 'D5', 'D5', 'C5', 'B4', 'A4']
  },
  pink_panther: {
    name: 'Panthère Rose 🐾',
    notes: ['D#4', 'E4', 'F#4', 'G4', 'D#4', 'E4', 'F#4', 'G4', 'C5', 'B4', 'E4', 'G4', 'B4', 'Bb4']
  },
  simpsons: {
    name: 'Simpsons 🍩',
    notes: ['C4', 'E4', 'F#4', 'A4', 'G4', 'E4', 'C4', 'A3', 'F#3', 'F#3', 'F#3', 'G3']
  },
  gravity_falls: {
    name: 'Gravity Falls 🌲',
    notes: ['F4', 'A4', 'D5', 'A4', 'F4', 'A4', 'D5', 'A4', 'G4', 'Bb4', 'D5', 'Bb4', 'G4', 'Bb4', 'D5', 'Bb4']
  }
};

const tweaks = gizmoRuntime.tweaks({
  boxSize: { index: 0, name: 'Taille du cercle', type: 'slider', value: 360.0, min: 200, max: 1000, step: 10 },
  gravity: { index: 1, name: 'Pesanteur', type: 'slider', value: 0, min: 0, max: 20, step: 0.1 },
  ballSpeed: { index: 2, name: 'Vitesse initiale', type: 'slider', value: 7, min: 1, max: 15, step: 0.5 },
  ballRadius: { index: 3, name: 'Taille de la balle', type: 'slider', value: 10, min: 4, max: 30, step: 0.5 },
  speedIncreaseRate: { index: 4, name: 'Accélération (km/h/rebond)', type: 'slider', value: 0.2, min: 0, max: 2, step: 0.05 },
  backgroundColor: { index: 5, name: 'Couleur de fond', type: 'color', value: '#000000' },
  boxColor: { index: 6, name: 'Couleur du cercle', type: 'color', value: '#FFFFFF' },
  timerText: { index: 7, name: 'Libellé Temps', type: 'text', value: 'Temps :', group: 'timer' },
  timerColor: { index: 8, name: 'Couleur Temps', type: 'color', value: '#FFFFFF', group: 'timer' },
  timerSize: { index: 9, name: 'Taille Temps', type: 'slider', value: 20, min: 10, max: 40, step: 1, group: 'timer' },
  timerVisible: { index: 10, name: 'Afficher Temps', type: 'toggle', value: true, group: 'timer' },
  speedText: { index: 11, name: 'Libellé Vitesse', type: 'text', value: 'Vitesse :', group: 'speed' },
  speedColor: { index: 12, name: 'Couleur Vitesse', type: 'color', value: '#FFFFFF', group: 'speed' },
  speedSize: { index: 13, name: 'Taille Vitesse', type: 'slider', value: 20, min: 10, max: 40, step: 1, group: 'speed' },
  speedVisible: { index: 14, name: 'Afficher Vitesse', type: 'toggle', value: true, group: 'speed' },
  spawnCount: { index: 15, name: 'Balles par clic', type: 'slider', value: 1, min: 1, max: 10, step: 1 },
});

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  id: number;
  lastCollisionTime: number;
  color: string;
  spawnTime: number;
}

interface BouncePoint {
  x: number;
  y: number;
  ballId: number;
  createdAt: number;
  color: string;
}

interface Hole {
  angle: number; // radians
  width: number; // radians
}

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const nextIdRef = useRef(0);
  const rafRef = useRef<number>();
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const audioReadyRef = useRef(false);
  const bouncePointsRef = useRef<BouncePoint[]>([]);
  const noteIndexRef = useRef(0);
  const holesRef = useRef<Hole[]>([]);
  const lastTimeRef = useRef(Date.now());

  const tweakBoxSize = tweaks.boxSize.useState();
  const gravity = tweaks.gravity.useState();
  const ballSpeed = tweaks.ballSpeed.useState();
  const tweakBallRadius = tweaks.ballRadius.useState();
  const tweakSpeedIncreaseRate = tweaks.speedIncreaseRate.useState();
  const backgroundColor = tweaks.backgroundColor.useState();
  const boxColor = tweaks.boxColor.useState();
  const timerText = tweaks.timerText.useState();
  const timerColor = tweaks.timerColor.useState();
  const timerSize = tweaks.timerSize.useState();
  const timerVisible = tweaks.timerVisible.useState();
  const speedText = tweaks.speedText.useState();
  const speedColor = tweaks.speedColor.useState();
  const speedSize = tweaks.speedSize.useState();
  const speedVisible = tweaks.speedVisible.useState();
  const tweakSpawnCount = tweaks.spawnCount.useState();

  const [ballCount, setBallCount] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSpeedBoost, setCurrentSpeedBoost] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<keyof typeof MUSICS>('mario');
  const [isPlacingHole, setIsPlacingHole] = useState(false);

  const [localBoxSize, setLocalBoxSize] = useState(tweakBoxSize);
  const [localBallRadius, setLocalBallRadius] = useState(tweakBallRadius);
  const [localSpeedIncrease, setLocalSpeedIncrease] = useState(tweakSpeedIncreaseRate);
  const [localSpawnCount, setLocalSpawnCount] = useState(tweakSpawnCount);
  const [localGravity, setLocalGravity] = useState(gravity);

  const speedBoostRef = useRef(0);

  useEffect(() => {
    setLocalBoxSize(tweakBoxSize);
    setLocalBallRadius(tweakBallRadius);
    setLocalSpeedIncrease(tweakSpeedIncreaseRate);
    setLocalSpawnCount(tweakSpawnCount);
    setLocalGravity(gravity);
  }, [tweakBoxSize, tweakBallRadius, tweakSpeedIncreaseRate, tweakSpawnCount, gravity]);

  useEffect(() => {
    const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.15 }
    }).connect(reverb);

    if (ballsRef.current.length === 0) {
      const angle = Math.random() * Math.PI * 2;
      const speed = ballSpeed * 50;
      ballsRef.current = [{
        x: 375 / 2,
        y: 535 / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: tweakBallRadius,
        id: nextIdRef.current++,
        lastCollisionTime: 0,
        color: rainbowColors[0],
        spawnTime: Date.now(),
      }];
    }

    return () => {
      synthRef.current?.dispose();
      reverb.dispose();
    };
  }, [ballSpeed, tweakBallRadius]);

  const playCollisionSound = useCallback(async () => {
    if (!audioReadyRef.current) {
      try {
        await Tone.start();
        audioReadyRef.current = true;
      } catch (e) { return; }
    }
    if (!synthRef.current) return;
    
    const music = MUSICS[selectedMusic];
    const note = music.notes[noteIndexRef.current % music.notes.length];
    noteIndexRef.current++;
    synthRef.current.triggerAttackRelease(note, '8n');
  }, [selectedMusic]);

  const playPopSound = useCallback(async () => {
    if (!audioReadyRef.current) {
      try {
        await Tone.start();
        audioReadyRef.current = true;
      } catch (e) { return; }
    }
    if (!synthRef.current) return;
    synthRef.current.triggerAttackRelease('G5', '0.05');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    lastTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const currentTime = now;
      const collisionCooldown = 100;
      const boxHalfSize = localBoxSize / 2;

      const margin = 40;
      const availableWidth = canvas.width - margin;
      const availableHeight = canvas.height - margin;
      const scale = Math.min(availableWidth / localBoxSize, availableHeight / localBoxSize, 1.0);

      setElapsedTime(prev => prev + deltaTime);
      setCurrentSpeedBoost(speedBoostRef.current);
      
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);

      // Draw circle with holes
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 3 / scale;
      
      if (holesRef.current.length === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, boxHalfSize, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const sortedHoles = [...holesRef.current].sort((a, b) => a.angle - b.angle);
        let currentAngle = 0;
        sortedHoles.forEach(hole => {
          const startHole = hole.angle - hole.width / 2;
          const endHole = hole.angle + hole.width / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, boxHalfSize, currentAngle, startHole);
          ctx.stroke();
          currentAngle = endHole;
        });
        ctx.beginPath();
        ctx.arc(centerX, centerY, boxHalfSize, currentAngle, Math.PI * 2);
        ctx.stroke();
      }

      const subSteps = 8;
      const dt = deltaTime / subSteps;
      const friction = 1.0; 
      const restitution = 1.0; 

      for (let s = 0; s < subSteps; s++) {
        // Ball-Ball collisions
        for (let i = 0; i < ballsRef.current.length; i++) {
          for (let j = i + 1; j < ballsRef.current.length; j++) {
            const b1 = ballsRef.current[i];
            const b2 = ballsRef.current[j];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const distSq = dx * dx + dy * dy;
            const minDist = b1.radius + b2.radius;
            if (distSq < minDist * minDist) {
              const dist = Math.sqrt(distSq);
              const nx = dx / dist;
              const ny = dy / dist;
              const rvx = b2.vx - b1.vx;
              const rvy = b2.vy - b1.vy;
              const velAlongNormal = rvx * nx + rvy * ny;
              if (velAlongNormal > 0) continue;
              const e = 0.9; 
              let jImpulse = -(1 + e) * velAlongNormal;
              jImpulse /= (1/1 + 1/1); 
              const impulseX = jImpulse * nx;
              const impulseY = jImpulse * ny;
              b1.vx -= impulseX;
              b1.vy -= impulseY;
              b2.vx += impulseX;
              b2.vy += impulseY;
              const percent = 0.2;
              const slop = 0.01;
              const penetration = minDist - dist;
              const correction = Math.max(penetration - slop, 0) / (1/1 + 1/1) * percent;
              const cx = correction * nx;
              const cy = correction * ny;
              b1.x -= cx;
              b1.y -= cy;
              b2.x += cx;
              b2.y += cy;
              
              // Add randomness to break trajectories and make movements less predictable
              const randX = (Math.random() - 0.5) * 5.0;
              const randY = (Math.random() - 0.5) * 5.0;
              b1.vx += randX;
              b1.vy += randY;
              b2.vx -= randX;
              b2.vy -= randY;

              if (s === 0) {
                gizmoRuntime.performHaptic('light');
                playCollisionSound();
              }
            }
          }
        }

        ballsRef.current.forEach(ball => {
          ball.vy += (localGravity * 100) * dt;
          ball.vx *= Math.pow(friction, dt);
          ball.vy *= Math.pow(friction, dt);
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;
          const dx = ball.x - centerX, dy = ball.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = boxHalfSize - ball.radius;
          if (dist > maxDist) {
            const angle = Math.atan2(dy, dx);
            let normAngle = angle;
            while (normAngle < 0) normAngle += Math.PI * 2;
            while (normAngle >= Math.PI * 2) normAngle -= Math.PI * 2;
            const inHole = holesRef.current.some(hole => {
              let hStart = hole.angle - hole.width / 2;
              let hEnd = hole.angle + hole.width / 2;
              if (hStart < 0) return normAngle > (hStart + Math.PI * 2) || normAngle < hEnd;
              if (hEnd > Math.PI * 2) return normAngle > hStart || normAngle < (hEnd - Math.PI * 2);
              return normAngle >= hStart && normAngle <= hEnd;
            });
            if (!inHole) {
              const nx = Math.cos(angle);
              const ny = Math.sin(angle);
              ball.x = centerX + nx * maxDist;
              ball.y = centerY + ny * maxDist;
              const dot = ball.vx * nx + ball.vy * ny;
              if (dot > 0) {
                ball.vx = (ball.vx - 2 * dot * nx) * restitution;
                ball.vy = (ball.vy - 2 * dot * ny) * restitution;
                
                // Add a bit of randomness on bounce to prevent loops and make it more dynamic
                const bounceRandX = (Math.random() - 0.5) * 4.0;
                const bounceRandY = (Math.random() - 0.5) * 4.0;
                ball.vx += bounceRandX;
                ball.vy += bounceRandY;

                const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                const boost = localSpeedIncrease * 10;
                if (currentSpeed > 0) {
                  ball.vx += (ball.vx / currentSpeed) * boost;
                  ball.vy += (ball.vy / currentSpeed) * boost;
                }
              }
              if (currentTime - ball.lastCollisionTime > collisionCooldown) {
                ball.lastCollisionTime = currentTime;
                gizmoRuntime.performHaptic('light');
                playCollisionSound();
                speedBoostRef.current += localSpeedIncrease;
                const bX = centerX + nx * boxHalfSize;
                const bY = centerY + ny * boxHalfSize;
                bouncePointsRef.current.push({ x: bX, y: bY, ballId: ball.id, createdAt: currentTime, color: ball.color });
                if (bouncePointsRef.current.length > 200) bouncePointsRef.current.shift();
              }
            } else {
              if (dist > boxHalfSize + ball.radius * 4) {
                ball.radius = -1; 
              }
            }
          }
        });

        bouncePointsRef.current.forEach((bp) => {
          for (const ball of ballsRef.current) {
            if (ball.id !== bp.ballId && ball.radius > 0) {
              const creator = ballsRef.current.find(b => b.id === bp.ballId);
              let targetX = bp.x, targetY = bp.y;
              if (creator) { targetX = creator.x; targetY = creator.y; }
              const ldx = targetX - bp.x, ldy = targetY - bp.y;
              const lenSq = ldx * ldx + ldy * ldy;
              const collisionRadius = ball.radius * 1.2;
              if (lenSq < 1) {
                const distSq = Math.pow(ball.x - bp.x, 2) + Math.pow(ball.y - bp.y, 2);
                if (distSq < collisionRadius * collisionRadius) transferLine(bp, ball);
                continue;
              }
              const bdx = ball.x - bp.x, bdy = ball.y - bp.y;
              const t = Math.max(0, Math.min(1, (bdx * ldx + bdy * ldy) / lenSq));
              const closestX = bp.x + t * ldx;
              const closestY = bp.y + t * ldy;
              const distSq = Math.pow(ball.x - closestX, 2) + Math.pow(ball.y - closestY, 2);
              if (distSq < collisionRadius * collisionRadius) transferLine(bp, ball);
            }
          }
        });
      }

      function transferLine(bp: BouncePoint, ball: Ball) {
        bp.ballId = ball.id;
        bp.color = ball.color;
        gizmoRuntime.performHaptic('soft');
      }

      const initialBallCount = ballsRef.current.length;
      ballsRef.current = ballsRef.current.filter(ball => {
        if (ball.radius < 0) {
          playPopSound();
          return false;
        }
        return true;
      });
      if (ballsRef.current.length !== initialBallCount) setBallCount(ballsRef.current.length);

      bouncePointsRef.current.forEach(bp => {
        const ball = ballsRef.current.find(b => b.id === bp.ballId);
        if (ball) {
          const c = bp.color;
          const r = Math.max(0, parseInt(c.slice(1, 3), 16) - 40);
          const g = Math.max(0, parseInt(c.slice(3, 5), 16) - 40);
          const b = Math.max(0, parseInt(c.slice(5, 7), 16) - 40);
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = 2 / scale;
          const dx = ball.x - bp.x, dy = ball.y - bp.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > ball.radius) {
            const ex = ball.x - (dx / dist) * ball.radius, ey = ball.y - (dy / dist) * ball.radius;
            ctx.beginPath();
            ctx.moveTo(bp.x, bp.y);
            ctx.lineTo(ex, ey);
            ctx.stroke();
          }
        }
      });

      ballsRef.current.forEach(ball => {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [localBoxSize, localGravity, ballSpeed, localBallRadius, backgroundColor, boxColor, localSpeedIncrease, playCollisionSound, playPopSound]);

  const handleAddBall = () => {
    if (isPlacingHole) return;
    for (let i = 0; i < localSpawnCount; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = ballSpeed * 50;
      ballsRef.current.push({
        x: 375 / 2, 
        y: 535 / 2, 
        vx: Math.cos(angle) * speed, 
        vy: Math.sin(angle) * speed, 
        radius: localBallRadius,
        id: nextIdRef.current++, 
        lastCollisionTime: 0, 
        color: rainbowColors[ballsRef.current.length % rainbowColors.length], 
        spawnTime: Date.now()
      });
    }
    setBallCount(ballsRef.current.length);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlacingHole) {
      handleAddBall();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const angle = Math.atan2(y - centerY, x - centerX);
    let normAngle = angle;
    while (normAngle < 0) normAngle += Math.PI * 2;
    while (normAngle >= Math.PI * 2) normAngle -= Math.PI * 2;
    holesRef.current.push({ angle: normAngle, width: 0.4 });
    setIsPlacingHole(false);
    gizmoRuntime.performHaptic('medium');
  };

  const handleReset = () => {
    setElapsedTime(0);
    speedBoostRef.current = 0;
    noteIndexRef.current = 0;
    holesRef.current = [];
    const angle = Math.random() * Math.PI * 2;
    const speed = ballSpeed * 50;
    ballsRef.current = [{
      x: 375 / 2, 
      y: 535 / 2, 
      vx: Math.cos(angle) * speed, 
      vy: Math.sin(angle) * speed, 
      radius: localBallRadius,
      id: nextIdRef.current++, 
      lastCollisionTime: 0, 
      color: rainbowColors[0], 
      spawnTime: Date.now()
    }];
    bouncePointsRef.current = [];
    setBallCount(1);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 overflow-hidden" style={{ background: backgroundColor }}>
      <div className="absolute top-10 left-0 w-full flex justify-between px-6 pointer-events-none z-10">
        {timerVisible && <div style={{ color: timerColor, fontSize: timerSize }} className="font-mono font-bold">{timerText} {elapsedTime.toFixed(1)}s</div>}
        {speedVisible && <div style={{ color: speedColor, fontSize: speedSize }} className="font-mono font-bold">{speedText} {(ballSpeed + currentSpeedBoost).toFixed(1)} km/h</div>}
      </div>
      
      {isPlacingHole && (
        <div className="absolute top-24 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-bold animate-pulse z-20">
          Clique sur le cercle pour placer un trou !
        </div>
      )}

      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={375} 
          height={535} 
          className={`rounded-lg cursor-pointer max-h-full max-w-full object-contain ${isPlacingHole ? 'ring-4 ring-white/50' : ''}`} 
          style={{ touchAction: 'none' }} 
          onClick={handleCanvasClick} 
        />
      </div>
      
      <div className="flex gap-4 z-10 pb-8">
        <button onClick={handleAddBall} className="px-6 py-3 rounded-lg font-bold text-lg transition-transform active:scale-95 whitespace-nowrap" style={{ background: '#FFFFFF', color: '#000000' }}>Ajouter une balle ({ballCount})</button>
        <button onClick={() => setIsMenuOpen(true)} className="px-6 py-3 rounded-lg font-bold text-lg transition-transform active:scale-95" style={{ background: '#FFFFFF', color: '#000000' }}>Menu</button>
      </div>

      {isMenuOpen && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-sm rounded-3xl p-6 flex flex-col gap-6 border border-zinc-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h2 className="text-white text-2xl font-black uppercase tracking-tight">Paramètres</h2>
              <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full text-white text-2xl">&times;</button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-zinc-400 text-sm font-bold uppercase">Mélodie des rebonds</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(MUSICS).map(([key, music]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedMusic(key as keyof typeof MUSICS);
                        noteIndexRef.current = 0;
                      }}
                      className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${selectedMusic === key ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}
                    >
                      {music.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-zinc-400 text-sm font-bold uppercase">Actions Spéciales</div>
                <button 
                  onClick={() => { setIsPlacingHole(true); setIsMenuOpen(false); }}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  🕳️ Placer un trou
                </button>
                <button 
                  onClick={() => { holesRef.current = []; setIsMenuOpen(false); }}
                  className="w-full py-3 bg-zinc-800 text-white font-bold rounded-xl active:scale-95 transition-transform"
                >
                  Effacer les trous
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-zinc-400 text-sm font-bold uppercase"><span>Taille du Cercle</span><span className="text-white">{localBoxSize.toFixed(0)}</span></div>
                <input type="range" min="200" max="1000" step="10" value={localBoxSize} onChange={(e) => setLocalBoxSize(parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-zinc-400 text-sm font-bold uppercase"><span>Taille Balle</span><span className="text-white">{localBallRadius.toFixed(1)}</span></div>
                <input type="range" min="4" max="30" step="0.5" value={localBallRadius} onChange={(e) => setLocalBallRadius(parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-zinc-400 text-sm font-bold uppercase"><span>Pesanteur</span><span className="text-white">{localGravity.toFixed(1)}</span></div>
                <input type="range" min="0" max="20" step="0.1" value={localGravity} onChange={(e) => setLocalGravity(parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-zinc-400 text-sm font-bold uppercase"><span>Boost Vitesse (km/h)</span><span className="text-white">+{localSpeedIncrease.toFixed(2)}</span></div>
                <input type="range" min="0" max="2" step="0.05" value={localSpeedIncrease} onChange={(e) => setLocalSpeedIncrease(parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-zinc-400 text-sm font-bold uppercase"><span>Balles par Clic</span><span className="text-white">{localSpawnCount}</span></div>
                <input type="range" min="1" max="10" step="1" value={localSpawnCount} onChange={(e) => setLocalSpawnCount(parseInt(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <button onClick={() => { handleReset(); setIsMenuOpen(false); }} className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-transform shadow-lg shadow-red-900/20">Réinitialiser</button>
                <button onClick={() => setIsMenuOpen(false)} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-transform">Reprendre</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}