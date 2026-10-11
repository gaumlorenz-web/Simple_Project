import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CakeFlavor } from '../types';
import { soundEngine } from '../utils/audio';
import { burstConfettiCenter, fireSideCannons } from '../utils/confetti';
import { Flame, Wind, Sparkles, RotateCw, Mic, MicOff, Info } from 'lucide-react';

interface Cake3DProps {
  flavor?: CakeFlavor;
  candlesCount?: number;
  recipientName: string;
  onBlowCandles?: () => void;
}

export const Cake3D: React.FC<Cake3DProps> = ({
  flavor = 'strawberry',
  candlesCount = 3,
  recipientName,
  onBlowCandles
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [candlesLit, setCandlesLit] = useState(true);
  const [hasBlownWish, setHasBlownWish] = useState(false);
  
  // Microphone blow detection states
  const [isMicListening, setIsMicListening] = useState(false);
  const [micLevel, setMicLevel] = useState(0); // 0 to 100 visual meter
  const [micError, setMicError] = useState<string | null>(null);

  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameMicRef = useRef<number | null>(null);

  // References to three.js scene elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cakeGroupRef = useRef<THREE.Group | null>(null);
  const flamesRef = useRef<{ mesh: THREE.Mesh; light: THREE.PointLight; baseScale: number }[]>([]);
  const smokeParticlesRef = useRef<{ mesh: THREE.Mesh; velY: number; velX: number; life: number }[]>([]);

  // Dragging states
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const rotVelRef = useRef({ x: 0, y: 0.004 });
  const targetRotationRef = useRef({ x: 0.35, y: 0 });

  // Flavor palette
  const getFlavorPalette = useCallback((flv: CakeFlavor) => {
    switch (flv) {
      case 'strawberry':
      default:
        return {
          tier1: 0xffb5d0,
          tier2: 0xffd1dc,
          icing: 0xffffff,
          trim: 0xff85a2,
          plate: 0xfff0f5,
          goldRim: 0xf6d365
        };
      case 'confetti':
        return {
          tier1: 0xfff1c5,
          tier2: 0xfff7db,
          icing: 0xffffff,
          trim: 0xffa8ba,
          plate: 0xffffff,
          goldRim: 0xf9ca24
        };
      case 'matcha':
        return {
          tier1: 0xb7e4c7,
          tier2: 0xd8f3dc,
          icing: 0xffffff,
          trim: 0x74c69d,
          plate: 0xf3fbf6,
          goldRim: 0xd4af37
        };
      case 'chocolate':
        return {
          tier1: 0x6f4e37,
          tier2: 0x8b5a2b,
          icing: 0xffb6c1,
          trim: 0xd2691e,
          plate: 0xfdfbf7,
          goldRim: 0xf5cd79
        };
      case 'blueberry':
        return {
          tier1: 0xbfd7ea,
          tier2: 0xdbe7e4,
          icing: 0xffffff,
          trim: 0x93b7be,
          plate: 0xf4f7f6,
          goldRim: 0xf3a683
        };
    }
  }, []);

  // Stop mic helper
  const stopMic = useCallback(() => {
    if (animFrameMicRef.current) {
      cancelAnimationFrame(animFrameMicRef.current);
      animFrameMicRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicListening(false);
    setMicLevel(0);
  }, []);

  // Handle candle blow action
  const handleBlowOut = useCallback(() => {
    if (!candlesLit) return;
    setCandlesLit(false);
    setHasBlownWish(true);
    soundEngine.playCandleBlow();
    stopMic(); // clean up microphone once blown

    // Extinguish flames and trigger smoke puffs
    flamesRef.current.forEach((item) => {
      item.mesh.visible = false;
      item.light.intensity = 0;

      if (sceneRef.current) {
        for (let i = 0; i < 9; i++) {
          const smokeGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.05, 6, 6);
          const smokeMat = new THREE.MeshBasicMaterial({
            color: 0xe2e8f0,
            transparent: true,
            opacity: 0.65
          });
          const smokeMesh = new THREE.Mesh(smokeGeo, smokeMat);
          const worldPos = new THREE.Vector3();
          item.mesh.getWorldPosition(worldPos);
          smokeMesh.position.copy(worldPos);
          smokeMesh.position.x += (Math.random() - 0.5) * 0.12;
          smokeMesh.position.z += (Math.random() - 0.5) * 0.12;

          sceneRef.current.add(smokeMesh);
          smokeParticlesRef.current.push({
            mesh: smokeMesh,
            velY: 0.035 + Math.random() * 0.02,
            velX: (Math.random() - 0.5) * 0.015,
            life: 1.0
          });
        }
      }
    });

    // Celebratory fanfare and confetti
    window.setTimeout(() => {
      soundEngine.playPartyFanfare();
      burstConfettiCenter();
      fireSideCannons();
      if (onBlowCandles) {
        onBlowCandles();
      }
    }, 200);
  }, [candlesLit, stopMic, onBlowCandles]);

  const handleRelight = () => {
    setCandlesLit(true);
    setHasBlownWish(false);
    flamesRef.current.forEach((item) => {
      item.mesh.visible = true;
      item.light.intensity = 1.2;
    });
    soundEngine.playConfettiCannon();
  };

  // Robust Microphone Blow Detector
  const toggleMicDetection = async () => {
    if (isMicListening) {
      stopMic();
      return;
    }

    setMicError(null);

    try {
      // Disable noise suppression & echo cancellation so breath whooshes are NOT filtered out by the OS!
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.2;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicListening(true);

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.fftSize);

      let blowStreak = 0;

      const detectBlow = () => {
        if (!micStreamRef.current || !candlesLit) {
          stopMic();
          return;
        }

        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);

        // 1. Calculate low-frequency turbulence (bins 1 to 12 correspond to < 300 Hz)
        let lowFreqSum = 0;
        const lowBinsCount = 12;
        for (let i = 1; i <= lowBinsCount; i++) {
          lowFreqSum += freqData[i];
        }
        const lowFreqAvg = lowFreqSum / lowBinsCount;

        // 2. Calculate time-domain RMS turbulence
        let rmsSum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const val = (timeData[i] - 128) / 128;
          rmsSum += val * val;
        }
        const rms = Math.sqrt(rmsSum / timeData.length) * 100;

        // Combined breath score
        const currentScore = Math.min(100, Math.round((lowFreqAvg * 0.7) + (rms * 1.5)));
        setMicLevel(currentScore);

        // Blow threshold: gently blowing creates scores > 36-40
        if (currentScore > 36) {
          blowStreak++;
          if (blowStreak >= 2) { // 2 consecutive frames to prevent momentary click false-positives
            handleBlowOut();
            return;
          }
        } else {
          blowStreak = Math.max(0, blowStreak - 1);
        }

        animFrameMicRef.current = requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch (err: any) {
      console.warn('Mic access failed:', err);
      setMicError('Mic blocked. Tap "Blow Out" instead!');
      setIsMicListening(false);
      setTimeout(() => setMicError(null), 3500);
    }
  };

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [stopMic]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 7.8);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Studio 3-point Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7fc, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(5, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffd6ec, 0.9);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfff9db, 0.7);
    rimLight.position.set(0, -3, -5);
    scene.add(rimLight);

    // Cake Group
    const cakeGroup = new THREE.Group();
    cakeGroupRef.current = cakeGroup;
    scene.add(cakeGroup);

    // Palette
    const colors = getFlavorPalette(flavor);

    // 1. Pedestal Stand
    const plateGeo = new THREE.CylinderGeometry(2.6, 2.5, 0.18, 48);
    const plateMat = new THREE.MeshStandardMaterial({
      color: colors.plate,
      roughness: 0.15,
      metalness: 0.1
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -0.9;
    plate.receiveShadow = true;
    cakeGroup.add(plate);

    // Plate Gold Trim
    const goldRimGeo = new THREE.TorusGeometry(2.6, 0.05, 16, 48);
    const goldRimMat = new THREE.MeshStandardMaterial({
      color: colors.goldRim,
      roughness: 0.3,
      metalness: 0.8
    });
    const goldRim = new THREE.Mesh(goldRimGeo, goldRimMat);
    goldRim.rotation.x = Math.PI / 2;
    goldRim.position.y = -0.85;
    cakeGroup.add(goldRim);

    // Plate Stem
    const stemGeo = new THREE.CylinderGeometry(0.9, 1.4, 0.45, 32);
    const stem = new THREE.Mesh(stemGeo, plateMat);
    stem.position.y = -1.15;
    cakeGroup.add(stem);

    // 2. Bottom Cake Tier
    const tier1Geo = new THREE.CylinderGeometry(2.0, 2.05, 1.0, 48);
    const tier1Mat = new THREE.MeshStandardMaterial({
      color: colors.tier1,
      roughness: 0.45,
      metalness: 0.05
    });
    const tier1 = new THREE.Mesh(tier1Geo, tier1Mat);
    tier1.position.y = -0.35;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    cakeGroup.add(tier1);

    // Bottom cream beads
    const beadCount = 36;
    for (let i = 0; i < beadCount; i++) {
      const angle = (i / beadCount) * Math.PI * 2;
      const beadGeo = new THREE.SphereGeometry(0.1, 12, 12);
      const beadMat = new THREE.MeshStandardMaterial({
        color: colors.icing,
        roughness: 0.2
      });
      const bead = new THREE.Mesh(beadGeo, beadMat);
      bead.position.set(Math.cos(angle) * 2.04, -0.82, Math.sin(angle) * 2.04);
      cakeGroup.add(bead);
    }

    // 3. Top Cake Tier
    const tier2Geo = new THREE.CylinderGeometry(1.4, 1.42, 0.85, 48);
    const tier2Mat = new THREE.MeshStandardMaterial({
      color: colors.tier2,
      roughness: 0.4,
      metalness: 0.05
    });
    const tier2 = new THREE.Mesh(tier2Geo, tier2Mat);
    tier2.position.y = 0.55;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    cakeGroup.add(tier2);

    // Frosting trim
    const midTrimGeo = new THREE.TorusGeometry(1.42, 0.08, 16, 40);
    const midTrimMat = new THREE.MeshStandardMaterial({
      color: colors.icing,
      roughness: 0.25
    });
    const midTrim = new THREE.Mesh(midTrimGeo, midTrimMat);
    midTrim.rotation.x = Math.PI / 2;
    midTrim.position.y = 0.15;
    cakeGroup.add(midTrim);

    // 4. Whipped Cream Swirls & Strawberries
    const rosettesCount = 10;
    for (let i = 0; i < rosettesCount; i++) {
      const angle = (i / rosettesCount) * Math.PI * 2;
      const radius = 1.15;
      const rx = Math.cos(angle) * radius;
      const rz = Math.sin(angle) * radius;

      const dollopGeo = new THREE.ConeGeometry(0.16, 0.26, 12);
      const dollopMat = new THREE.MeshStandardMaterial({
        color: colors.icing,
        roughness: 0.2
      });
      const dollop = new THREE.Mesh(dollopGeo, dollopMat);
      dollop.position.set(rx, 1.05, rz);
      dollop.rotation.y = angle;
      cakeGroup.add(dollop);

      if (i % 2 === 0) {
        const berryGeo = new THREE.DodecahedronGeometry(0.12, 1);
        const berryMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          roughness: 0.3,
          metalness: 0.1
        });
        const berry = new THREE.Mesh(berryGeo, berryMat);
        berry.position.set(rx * 0.85, 1.05, rz * 0.85);
        berry.scale.set(1, 1.25, 1);
        cakeGroup.add(berry);

        const leafGeo = new THREE.ConeGeometry(0.04, 0.08, 5);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(rx * 0.85, 1.18, rz * 0.85);
        cakeGroup.add(leaf);
      }
    }

    // 5. Rainbow Sprinkles
    const sprinkleColors = [0xff477e, 0xffa07a, 0xffd166, 0x06d6a0, 0x118ab2, 0x9d4edd];
    for (let i = 0; i < 90; i++) {
      const r = Math.sqrt(Math.random()) * 0.95;
      const theta = Math.random() * Math.PI * 2;
      const spGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6);
      const spMat = new THREE.MeshStandardMaterial({
        color: sprinkleColors[i % sprinkleColors.length],
        roughness: 0.3
      });
      const sprinkle = new THREE.Mesh(spGeo, spMat);
      sprinkle.position.set(Math.cos(theta) * r, 0.98, Math.sin(theta) * r);
      sprinkle.rotation.set(Math.PI / 2, Math.random() * Math.PI, Math.random() * Math.PI);
      cakeGroup.add(sprinkle);
    }

    // 6. Candles & Animated Flames
    flamesRef.current = [];
    const count = 3;
    const candlePositions = [
      { x: 0, z: -0.38 },
      { x: -0.35, z: 0.25 },
      { x: 0.35, z: 0.25 }
    ];

    candlePositions.forEach((pos, idx) => {
      const candleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.65, 16);
      const candleHue = idx % 2 === 0 ? 0xff85a2 : 0xfde047;
      const candleMat = new THREE.MeshStandardMaterial({
        color: candleHue,
        roughness: 0.3
      });
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.set(pos.x, 1.3, pos.z);
      candle.castShadow = true;
      cakeGroup.add(candle);

      const wickGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8);
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.set(pos.x, 1.66, pos.z);
      cakeGroup.add(wick);

      const flameGeo = new THREE.ConeGeometry(0.07, 0.24, 12);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameMesh.position.set(pos.x, 1.76, pos.z);
      cakeGroup.add(flameMesh);

      const coreGeo = new THREE.ConeGeometry(0.04, 0.16, 8);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const flameCore = new THREE.Mesh(coreGeo, coreMat);
      flameCore.position.set(0, -0.02, 0);
      flameMesh.add(flameCore);

      const candleLight = new THREE.PointLight(0xffbe53, 1.4, 2.5);
      candleLight.position.set(pos.x, 1.8, pos.z);
      cakeGroup.add(candleLight);

      flamesRef.current.push({
        mesh: flameMesh,
        light: candleLight,
        baseScale: 1.0
      });
    });

    cakeGroup.rotation.x = targetRotationRef.current.x;

    // Render loop
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDraggingRef.current) {
        cakeGroup.rotation.y += rotVelRef.current.y;
        rotVelRef.current.y *= 0.985;
        if (Math.abs(rotVelRef.current.y) < 0.003) {
          rotVelRef.current.y = 0.003;
        }
      }

      flamesRef.current.forEach((flameItem, i) => {
        if (flameItem.mesh.visible) {
          const wobble = Math.sin(elapsedTime * 12 + i * 1.5) * 0.15;
          const wobbleZ = Math.cos(elapsedTime * 10 + i * 2) * 0.1;
          const scaleWobble = 1 + Math.sin(elapsedTime * 15 + i) * 0.12;

          flameItem.mesh.rotation.z = wobble;
          flameItem.mesh.rotation.x = wobbleZ;
          flameItem.mesh.scale.set(scaleWobble, scaleWobble * 1.1, scaleWobble);
          flameItem.light.intensity = 1.2 + Math.sin(elapsedTime * 18 + i) * 0.35;
        }
      });

      for (let i = smokeParticlesRef.current.length - 1; i >= 0; i--) {
        const p = smokeParticlesRef.current[i];
        p.life -= 0.02;
        p.mesh.position.y += p.velY;
        p.mesh.position.x += p.velX;
        p.mesh.scale.multiplyScalar(1.02);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.life * 0.6);

        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          smokeParticlesRef.current.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse & Touch Interaction
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMousePosRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !cakeGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevMousePosRef.current.x;
      const deltaY = clientY - prevMousePosRef.current.y;

      cakeGroupRef.current.rotation.y += deltaX * 0.009;
      cakeGroupRef.current.rotation.x = Math.max(
        0.1,
        Math.min(0.65, cakeGroupRef.current.rotation.x + deltaY * 0.005)
      );

      rotVelRef.current.y = deltaX * 0.006;
      prevMousePosRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.style.touchAction = 'none'; // prevent mobile browser scroll clash during 3D inspection
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      renderer.dispose();
    };
  }, [flavor, getFlavorPalette]);

  return (
    <div className="relative w-full h-[290px] xs:h-[330px] sm:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-b from-pink-100/40 via-white/50 to-pink-50/50 backdrop-blur-xs border border-pink-200/60 shadow-xl shadow-pink-200/30 flex flex-col items-center justify-center">
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        title="Drag to spin Ivy's birthday cake!"
      />

      {/* Floating 3D Badge */}
      <div className="absolute top-3 left-3 sm:left-4 flex items-center gap-2 pointer-events-none">
        <span className="text-[11px] sm:text-xs font-semibold text-pink-700 bg-white/90 px-3 py-1 rounded-full shadow-xs border border-pink-200 flex items-center gap-1.5 font-fun">
          <RotateCw className="w-3.5 h-3.5 text-pink-500 animate-spin" style={{ animationDuration: '6s' }} />
          Ivy&apos;s 20th Birthday Cake 🍓
        </span>
      </div>

      {/* Live Mic Blow Level Bar (When listening) */}
      {isMicListening && candlesLit && (
        <div className="absolute top-12 sm:top-14 inset-x-4 max-w-xs mx-auto z-20 bg-white/95 backdrop-blur-md border border-pink-300 rounded-2xl p-2.5 shadow-lg text-center animate-in fade-in">
          <div className="flex items-center justify-between text-[11px] font-fun font-bold text-pink-700 mb-1 px-1">
            <span className="flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Blow into microphone! 💨
            </span>
            <span className="font-mono text-[10px] text-pink-500">{micLevel}%</span>
          </div>
          <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-400 via-rose-500 to-emerald-400 h-full transition-all duration-75 rounded-full"
              style={{ width: `${Math.min(100, micLevel * 2)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Blow softly onto your phone&apos;s mic to extinguish the candles!
          </p>
        </div>
      )}

      {/* Mic Error Toast */}
      {micError && (
        <div className="absolute top-12 inset-x-4 max-w-xs mx-auto z-20 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-2 text-xs text-center shadow-md animate-in fade-in">
          {micError}
        </div>
      )}

      {/* Wish Toast when blown */}
      {hasBlownWish && !candlesLit && (
        <div className="absolute top-4 inset-x-4 sm:max-w-md mx-auto z-20 bg-white/95 backdrop-blur-md border-2 border-pink-300 rounded-2xl p-3 sm:p-4 shadow-xl text-center animate-bounce">
          <div className="flex items-center justify-center gap-1.5 text-pink-600 font-fun font-bold text-sm sm:text-base">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Make a Wish, Ivy! 🌟
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs text-slate-700 mt-0.5 sm:mt-1">
            Candles are blown! Welcome to your 20s, achieve all your goals and celebrate with all your heart! ✨
          </p>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="absolute bottom-3 inset-x-2 sm:inset-x-auto flex flex-wrap items-center justify-center gap-2 z-10">
        {candlesLit ? (
          <>
            <button
              onClick={handleBlowOut}
              className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-fun font-semibold text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Wind className="w-4 h-4 text-white" />
              Blow Out Candles!
            </button>

            <button
              onClick={toggleMicDetection}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-fun font-medium rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isMicListening
                  ? 'bg-emerald-500 border-emerald-600 text-white animate-pulse'
                  : 'bg-white/95 hover:bg-white border-pink-200 text-slate-700'
              }`}
              title="Blow air into your phone's microphone to extinguish candles!"
            >
              {isMicListening ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
                  <span>Listening... Blow! 💨</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-pink-500" />
                  <span>Mic Blow 💨</span>
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleRelight}
            className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-fun font-semibold text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Flame className="w-4 h-4 text-white animate-flame" />
            Relight Candles 🕯️
          </button>
        )}
      </div>
    </div>
  );
};
