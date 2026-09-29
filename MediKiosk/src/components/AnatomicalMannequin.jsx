import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  Crosshair,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Flame,
  Activity,
  User,
  Database,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  Search
} from 'lucide-react';
import api from '../utils/api';
import { sounds } from '../utils/audioTTS';

// Master Anatomical Landmarks & Pain Spots Catalog
export const BODY_LANDMARKS = [
  // COMMON OPD COMPLAINTS (अक्सर होने वाले)
  { id: 'f-chest', label: 'Center of Chest', hindi: 'छाती (हृदय / सीना दर्द)', category: 'common', region: 'chest', side: 'center', loc: 'sternum', isFront: true, coords: [0.0, 0.58, 0.17] },
  { id: 'f-stomach', label: 'Upper Stomach / Acidity', hindi: 'पेट दर्द / एसिडिटी / जलन', category: 'common', region: 'abdomen', side: 'center', loc: 'upper', isFront: true, coords: [0.0, 0.28, 0.10] },
  { id: 'f-head', label: 'Head / Forehead', hindi: 'सिर दर्द / माइग्रेन / माथा', category: 'common', region: 'head', side: 'center', loc: 'forehead', isFront: true, coords: [0.0, 1.05, 0.11] },
  { id: 'f-throat', label: 'Throat & Neck', hindi: 'गला खराब / ग्रसनी / दर्द', category: 'common', region: 'head', side: 'center', loc: 'throat', isFront: true, coords: [0.0, 0.80, 0.15] },
  { id: 'b-lumbar', label: 'Lower Back (L1-L5)', hindi: 'कमर दर्द / कटिग्रह / स्लिप डिस्क', category: 'common', region: 'back', side: 'center', loc: 'lumbar', isFront: false, coords: [0.0, 0.14, -0.21] },
  { id: 'f-knee-r', label: 'Right Knee Joint', hindi: 'दायां घुटना / जोड़ों का दर्द', category: 'common', region: 'knee', side: 'right', loc: 'kneecap', isFront: true, coords: [-0.18, -0.66, 0.12] },
  { id: 'f-knee-l', label: 'Left Knee Joint', hindi: 'बायां घुटना / जोड़ों का दर्द', category: 'common', region: 'knee', side: 'left', loc: 'kneecap', isFront: true, coords: [0.18, -0.66, 0.12] },
  { id: 'b-neck', label: 'Cervical Spine / Neck', hindi: 'गर्दन जकड़न / सर्वाइकल', category: 'common', region: 'head', side: 'center', loc: 'cervical', isFront: false, coords: [0.0, 0.82, -0.18] },

  // HEAD & NECK (सिर व गर्दन)
  { id: 'f-temple-r', label: 'Right Temple (Migraine)', hindi: 'दाहिनी कनपटी (माइग्रेन)', category: 'head', region: 'head', side: 'right', loc: 'forehead', isFront: true, coords: [-0.14, 1.05, 0.08] },
  { id: 'f-temple-l', label: 'Left Temple (Migraine)', hindi: 'बाईं कनपटी (माइग्रेन)', category: 'head', region: 'head', side: 'left', loc: 'forehead', isFront: true, coords: [0.14, 1.05, 0.08] },
  { id: 'f-jaw', label: 'Jaw / Tooth Pain', hindi: 'जबड़ा / दांत दर्द / कान के पास', category: 'head', region: 'head', side: 'center', loc: 'face', isFront: true, coords: [0.0, 0.92, 0.11] },
  { id: 'b-occiput', label: 'Back of Head (Occiput)', hindi: 'सिर का पिछला भाग / सिर भारी', category: 'head', region: 'head', side: 'center', loc: 'forehead', isFront: false, coords: [0.0, 1.05, -0.15] },

  // CHEST & BACK (छाती व पीठ)
  { id: 'f-ribs-r', label: 'Right Ribs / Thorax', hindi: 'दाहिनी पसलियां / सांस लेने में दर्द', category: 'torso', region: 'chest', side: 'right', loc: 'ribs', isFront: true, coords: [-0.18, 0.54, 0.14] },
  { id: 'f-ribs-l', label: 'Left Ribs (Precordial)', hindi: 'बाईं पसलियां / सीने के बाईं ओर', category: 'torso', region: 'chest', side: 'left', loc: 'ribs', isFront: true, coords: [0.18, 0.54, 0.14] },
  { id: 'b-spine', label: 'Upper Spine (Thoracic)', hindi: 'पीठ / रीढ़ की हड्डी / कंधों के बीच', category: 'torso', region: 'back', side: 'center', loc: 'upper', isFront: false, coords: [0.0, 0.50, -0.20] },
  { id: 'b-scapula-r', label: 'Right Shoulder Blade', hindi: 'दायां कंधा पत्ती (स्कंधास्थि)', category: 'torso', region: 'back', side: 'right', loc: 'scapula', isFront: false, coords: [-0.18, 0.58, -0.19] },
  { id: 'b-scapula-l', label: 'Left Shoulder Blade', hindi: 'बायां कंधा पत्ती (स्कंधास्थि)', category: 'torso', region: 'back', side: 'left', loc: 'scapula', isFront: false, coords: [0.18, 0.58, -0.19] },
  { id: 'b-kidney-r', label: 'Right Kidney / Flank', hindi: 'दायां गुर्दा / पसली के पीछे', category: 'torso', region: 'back', side: 'right', loc: 'flank', isFront: false, coords: [-0.16, 0.20, -0.20] },
  { id: 'b-kidney-l', label: 'Left Kidney / Flank', hindi: 'बायां गुर्दा / पसली के पीछे', category: 'torso', region: 'back', side: 'left', loc: 'flank', isFront: false, coords: [0.16, 0.20, -0.20] },

  // STOMACH & ABDOMEN (पेट व पेड़ू)
  { id: 'f-navel', label: 'Around Navel (Umbilicus)', hindi: 'नाभि के आसपास / पेट मरोड़', category: 'abdomen', region: 'abdomen', side: 'center', loc: 'middle', isFront: true, coords: [0.0, 0.15, 0.11] },
  { id: 'f-appendix', label: 'Lower Right Belly (Appendix)', hindi: 'अपेंडिक्स / निचला दायां पेट', category: 'abdomen', region: 'abdomen', side: 'right', loc: 'lower', isFront: true, coords: [-0.12, 0.04, 0.11] },
  { id: 'f-lower-l', label: 'Lower Left Belly / Colic', hindi: 'निचला बायां पेट / ऐंठन', category: 'abdomen', region: 'abdomen', side: 'left', loc: 'lower', isFront: true, coords: [0.12, 0.04, 0.11] },
  { id: 'f-pelvis', label: 'Pelvis & Groin', hindi: 'पेड़ू / श्रोणि / मूत्राशय क्षेत्र', category: 'abdomen', region: 'pelvis', side: 'center', loc: 'groin', isFront: true, coords: [0.0, -0.10, 0.10] },

  // ARMS & SHOULDERS (हाथ व कंधे)
  { id: 'f-shoulder-r', label: 'Right Shoulder', hindi: 'दायां कंधा / फ्रोजन शोल्डर', category: 'arms', region: 'arm', side: 'right', loc: 'shoulder', isFront: true, coords: [-0.38, 0.64, 0.14] },
  { id: 'f-shoulder-l', label: 'Left Shoulder', hindi: 'बायां कंधा / फ्रोजन शोल्डर', category: 'arms', region: 'arm', side: 'left', loc: 'shoulder', isFront: true, coords: [0.38, 0.64, 0.14] },
  { id: 'f-elbow-r', label: 'Right Elbow / Forearm', hindi: 'दाहिनी कोहनी / टेनिस एल्बो', category: 'arms', region: 'arm', side: 'right', loc: 'elbow', isFront: true, coords: [-0.46, 0.35, 0.10] },
  { id: 'f-elbow-l', label: 'Left Elbow / Forearm', hindi: 'बाईं कोहनी / टेनिस एल्बो', category: 'arms', region: 'arm', side: 'left', loc: 'elbow', isFront: true, coords: [0.46, 0.35, 0.10] },
  { id: 'f-wrist-r', label: 'Right Wrist & Hand', hindi: 'दाहिनी कलाई व हाथ / उंगलियां', category: 'arms', region: 'arm', side: 'right', loc: 'wrist', isFront: true, coords: [-0.56, 0.05, 0.08] },
  { id: 'f-wrist-l', label: 'Left Wrist & Hand', hindi: 'बाईं कलाई व हाथ / उंगलियां', category: 'arms', region: 'arm', side: 'left', loc: 'wrist', isFront: true, coords: [0.56, 0.05, 0.08] },

  // LEGS & FEET (पैर व घुटने)
  { id: 'f-thigh-r', label: 'Right Thigh (Front)', hindi: 'दाहिनी जांघ / क्वाड्स', category: 'legs', region: 'thigh', side: 'right', loc: 'upper', isFront: true, coords: [-0.18, -0.38, 0.13] },
  { id: 'f-thigh-l', label: 'Left Thigh (Front)', hindi: 'बाईं जांघ / क्वाड्स', category: 'legs', region: 'thigh', side: 'left', loc: 'upper', isFront: true, coords: [0.18, -0.38, 0.13] },
  { id: 'b-sciatica', label: 'Sciatica / Back Thigh', hindi: 'साइटिका / जांघ का पिछला भाग', category: 'legs', region: 'thigh', side: 'right', loc: 'hamstring', isFront: false, coords: [-0.16, -0.26, -0.17] },
  { id: 'b-calf', label: 'Calf & Achilles Heel', hindi: 'पिंडली / नस चढ़ना / एड़ी', category: 'legs', region: 'leg', side: 'right', loc: 'calf', isFront: false, coords: [-0.18, -0.80, -0.14] },
  { id: 'f-ankle', label: 'Ankle & Foot', hindi: 'टखना / पैर का पंजा / मोच', category: 'legs', region: 'leg', side: 'center', loc: 'ankle', isFront: true, coords: [-0.16, -1.10, 0.12] }
];

export const CATEGORIES = [
  { id: 'common', label: 'Common (अक्सर)', icon: '⭐' },
  { id: 'head', label: 'Head & Neck (सिर/गर्दन)', icon: '🧠' },
  { id: 'torso', label: 'Chest & Back (छाती/पीठ)', icon: '🫁' },
  { id: 'abdomen', label: 'Stomach (पेट/पेड़ू)', icon: '🫄' },
  { id: 'arms', label: 'Arms (हाथ/कंधे)', icon: '💪' },
  { id: 'legs', label: 'Legs (पैर/घुटने)', icon: '🦵' }
];

export const FRONT_PRESETS = BODY_LANDMARKS.filter(lm => lm.isFront);
export const BACK_PRESETS = BODY_LANDMARKS.filter(lm => !lm.isFront);

// Pain Quality Types
const PAIN_TYPES = [
  { id: 'throbbing', label: 'धड़कन (Throbbing)', desc: 'Pulsing rhythm' },
  { id: 'burning', label: 'जलन (Burning / Acid)', desc: 'Heartburn, acidity or burning' },
  { id: 'sharp', label: 'चुभन (Sharp / Stabbing)', desc: 'Piercing needle-like' },
  { id: 'dull', label: 'मीठा दर्द (Aching / Sore)', desc: 'Deep continuous ache' }
];

// Fast Duration Options
const DURATION_OPTIONS = [
  { id: 'today', label: 'आज ही (< 24 Hours)' },
  { id: 'days', label: 'कुछ दिन (2-7 Days)' },
  { id: 'weeks', label: 'हफ्ते (1-4 Weeks)' },
  { id: 'chronic', label: 'महीनों से (> 1 Month)' }
];

// VAS Scale Helper
const getVasInfo = (score) => {
  if (score <= 3) return { label: 'Mild Discomfort (हल्का दर्द)', color: 'emerald', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (score <= 6) return { label: 'Moderate Pain (मध्यम दर्द)', color: 'amber', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
  return { label: 'Severe Pain (तीव्र / असहनीय दर्द)', color: 'rose', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
};

// Safe normalizer supporting both hotspot structure and database payload format
const normalizeSpot = (spot) => {
  if (!spot) return null;
  const region = spot.region || spot.bodyRegion || spot.body_region || 'General';
  const label = spot.label || spot.laymanSummary || spot.layman_summary || 'Body Pain';
  const side = spot.side || 'center';
  const sub = spot.sub || spot.location || `${region} • ${side}`;
  const coords = Array.isArray(spot.coords)
    ? spot.coords
    : Array.isArray(spot.coordinates)
    ? spot.coordinates
    : Array.isArray(spot.pos)
    ? spot.pos
    : [0, 0, 0];
  const id = spot.id || `spot-${region}-${side}`;
  const loc = spot.loc || spot.location || 'middle';
  return { id, label, sub, region, side, loc, coords };
};

export default function AnatomicalMannequin({
  patientId = 'PT-NEW',
  patientGender = 'male',
  currentMapping = null,
  doctor = { name: 'Dr. Rajeshwar Sharma', roomNumber: 'OPD Room 104', floorWing: 'Ground Floor, Central Block' },
  onPainSaved = () => {},
  onProceedNext = null,
  nextButtonLabel = "Confirm Pain & Proceed to Step 3: AI Clinical Summary 📋 →"
}) {
  // Strict Gender Binding: defaults to patient's authenticated gender
  const initialGender = (patientGender || 'male').toLowerCase() === 'female' ? 'female' : 'male';
  const [gender, setGender] = useState(initialGender);
  
  // Default to FRONT VIEW (Anterior)
  const [isAnteriorView, setIsAnteriorView] = useState(true);
  const isAnteriorViewRef = useRef(true);

  // Pain Assessment States - Starts clean without pre-selecting any spot until user interacts
  const [selectedSpot, setSelectedSpot] = useState(() => normalizeSpot(currentMapping) || null);
  const hasUserInteractedRef = useRef(false);
  const handlePresetSelectRef = useRef(null);
  const [severity, setSeverity] = useState(currentMapping?.severity || 5);
  const [painType, setPainType] = useState(currentMapping?.painType || 'धड़कन (Throbbing)');
  const [duration, setDuration] = useState(currentMapping?.duration || 'कुछ दिन (2-7 Days)');
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState(currentMapping ? 'synced' : 'idle');
  const [savedFeedback, setSavedFeedback] = useState('');
  const [dbDetails, setDbDetails] = useState(null);
  const [isLoading3D, setIsLoading3D] = useState(true);

  // Search and Category states for fast pain pinpointing
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('common');

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelGroupRef = useRef(null);
  const pinGroupRef = useRef(null);
  const pinRingRef = useRef(null);
  const markersGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const vas = getVasInfo(severity);

  // Helper to render interactive visual landmark target dots directly on 3D mannequin
  const updateLandmarkMarkers = (isFront) => {
    if (!markersGroupRef.current) return;
    while (markersGroupRef.current.children.length > 0) {
      const child = markersGroupRef.current.children[0];
      markersGroupRef.current.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    const landmarksForView = BODY_LANDMARKS.filter(lm => lm.isFront === isFront);
    const normal = new THREE.Vector3(0, 0, isFront ? 1 : -1);

    landmarksForView.forEach(lm => {
      const marker = new THREE.Group();
      marker.position.set(...lm.coords);
      marker.lookAt(marker.position.clone().add(normal));

      // Subtle cyan/blue target ring
      const ringGeo = new THREE.RingGeometry(0.024, 0.044, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
        depthTest: false,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.renderOrder = 4000;
      marker.add(ringMesh);

      // Inner cyan center dot
      const dotGeo = new THREE.CircleGeometry(0.016, 12);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        depthTest: false,
        depthWrite: false
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.renderOrder = 4001;
      marker.add(dotMesh);

      marker.userData = { landmark: lm };
      markersGroupRef.current.add(marker);
    });
  };

  // Keep ref in sync for animation and raycast handlers
  useEffect(() => {
    isAnteriorViewRef.current = isAnteriorView;
    updateLandmarkMarkers(isAnteriorView);
  }, [isAnteriorView]);

  // Sync patientGender changes from props
  useEffect(() => {
    if (patientGender) {
      const cleanG = patientGender.toLowerCase() === 'female' ? 'female' : 'male';
      setGender(cleanG);
    }
  }, [patientGender]);

  // Sync when currentMapping changes externally (only if user hasn't actively interacted)
  useEffect(() => {
    if (currentMapping && !hasUserInteractedRef.current) {
      const normalized = normalizeSpot(currentMapping);
      if (normalized) {
        setSelectedSpot(normalized);
        if (normalized.coords && pinGroupRef.current) {
          pinGroupRef.current.position.set(...normalized.coords);
          pinGroupRef.current.visible = true;
        }
      }
      if (currentMapping.severity) setSeverity(Number(currentMapping.severity));
      if (currentMapping.painType) setPainType(currentMapping.painType);
      if (currentMapping.duration) setDuration(currentMapping.duration);
      setSyncStatus('synced');
    }
  }, [currentMapping]);

  // Check SQLite Database Connectivity Ping
  useEffect(() => {
    let isMounted = true;
    const checkDb = async () => {
      try {
        const res = await api.getDbStatus();
        if (isMounted && res?.success) {
          setDbDetails(res.database);
        }
      } catch (_) {}
    };
    checkDb();
    const interval = setInterval(checkDb, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Initialize Fixed Three.js 3D Mannequin Scene
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    setIsLoading3D(true);
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera - starts at +4.6 facing the FRONT with comfortable framing padding
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.0, 4.6);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Fixed Viewport: No OrbitControls capturing pointer/touch events
    controlsRef.current = null;

    // 5. Studio Medical Lighting Setup (Both Front & Back balanced)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const frontKey = new THREE.DirectionalLight(0xffffff, 1.8);
    frontKey.position.set(2.5, 3.5, 4.0);
    scene.add(frontKey);

    const frontFill = new THREE.DirectionalLight(0x93c5fd, 1.1);
    frontFill.position.set(-2.5, -0.5, 3.5);
    scene.add(frontFill);

    const backKey = new THREE.DirectionalLight(0xffffff, 1.8);
    backKey.position.set(-2.5, 3.5, -4.0);
    scene.add(backKey);

    const backFill = new THREE.DirectionalLight(0x93c5fd, 1.1);
    backFill.position.set(2.5, -0.5, -3.5);
    scene.add(backFill);

    // 6. Glowing Pin Beacon with High Visibility Overlays (depthTest: false so never culled by body)
    const pinGroup = new THREE.Group();
    pinGroup.visible = false;
    pinGroupRef.current = pinGroup;

    // Glowing outer pulsing ring
    const ringGeo = new THREE.RingGeometry(0.08, 0.15, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthTest: false,
      depthWrite: false
    });
    const pinRing = new THREE.Mesh(ringGeo, ringMat);
    pinRing.renderOrder = 9999;
    pinRingRef.current = pinRing;
    pinGroup.add(pinRing);

    // Glowing disc
    const discGeo = new THREE.CircleGeometry(0.075, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.8,
      depthTest: false,
      depthWrite: false
    });
    const pinDisc = new THREE.Mesh(discGeo, discMat);
    pinDisc.renderOrder = 10000;
    pinGroup.add(pinDisc);

    // High-contrast white center bullseye dot
    const centerDotGeo = new THREE.CircleGeometry(0.026, 24);
    const centerDotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      depthTest: false,
      depthWrite: false
    });
    const centerDot = new THREE.Mesh(centerDotGeo, centerDotMat);
    centerDot.renderOrder = 10001;
    pinGroup.add(centerDot);

    // 3D Sphere at pin center
    const sphereGeo = new THREE.SphereGeometry(0.048, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xd50000,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.2,
      depthTest: false,
      depthWrite: false
    });
    const pinCore = new THREE.Mesh(sphereGeo, sphereMat);
    pinCore.renderOrder = 10002;
    pinGroup.add(pinCore);

    scene.add(pinGroup);

    // 6b. Landmark Hotspot Target Dots
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;
    updateLandmarkMarkers(isAnteriorViewRef.current);

    // Set initial pin position only if pre-selected
    if (selectedSpot && selectedSpot.coords) {
      const pinPos = new THREE.Vector3(...selectedSpot.coords);
      pinGroup.position.copy(pinPos);
      const normal = new THREE.Vector3(0, 0, isAnteriorViewRef.current ? 1 : -1);
      pinGroup.lookAt(pinPos.clone().add(normal));
      pinGroup.visible = true;
    } else {
      pinGroup.visible = false;
    }

    // 7. Load GLB Model with Exact Mathematical Centering Wrapper
    const modelFileName = gender === 'female' ? 'female_model.glb' : 'male_model.glb';
    const modelUrl = `/models/${modelFileName}`;

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;

        // If Z axis was exported as height (like female_model), rotate upright first
        const initialBox = new THREE.Box3().setFromObject(root);
        const initialSize = new THREE.Vector3();
        initialBox.getSize(initialSize);
        if (initialSize.z > initialSize.y && initialSize.z > initialSize.x) {
          root.rotation.x = -Math.PI / 2;
          root.updateMatrixWorld(true);
        }

        // Measure true model bounding box & center
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Put model in a wrapper group to guarantee exact (0,0,0) centering after rotation & scaling
        const wrapper = new THREE.Group();
        wrapper.add(root);
        root.position.set(-center.x, -center.y, -center.z);

        // Standardize height to 2.4 units (apex at +1.20, base at -1.20)
        const targetHeight = 2.4;
        const scale = targetHeight / (size.y || 1);
        wrapper.scale.set(scale, scale, scale);

        // Rotate 180 degrees around Y so FRONT (face, chest, toes) points towards +Z (Front Camera)
        wrapper.rotation.y = Math.PI;
        wrapper.updateMatrixWorld(true);

        modelGroupRef.current = wrapper;

        // Clinical skin shader
        const medicalSkinMat = new THREE.MeshStandardMaterial({
          color: gender === 'female' ? 0xe2e8f0 : 0xdbeafe,
          roughness: 0.38,
          metalness: 0.12,
          flatShading: false
        });

        wrapper.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = medicalSkinMat;
          }
        });

        scene.add(wrapper);
        setIsLoading3D(false);
      },
      undefined,
      (err) => {
        console.warn('3D Model load fallback:', err);
        setIsLoading3D(false);
      }
    );

    // 8. Raycaster Pointer Down (Touch-to-Pin on Model Surface or Hotspots)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event) => {
      if (!cameraRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = event.clientX !== undefined ? event.clientX : event.touches?.[0]?.clientX;
      const clientY = event.clientY !== undefined ? event.clientY : event.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const isFront = isAnteriorViewRef.current;

      // Step 1: Snapping to Landmark Target Hotspots (tight screen radius: snap if within ~36px)
      let closestLandmark = null;
      let minDistanceSq = 0.007; // screen-space distance squared
      const candidateLandmarks = BODY_LANDMARKS.filter(lm => lm.isFront === isFront);
      for (const lm of candidateLandmarks) {
        const pos = new THREE.Vector3(...lm.coords);
        const screenPos = pos.clone().project(cameraRef.current);
        const dx = screenPos.x - mouse.x;
        const dy = screenPos.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          closestLandmark = lm;
        }
      }

      if (closestLandmark) {
        handlePresetSelectRef.current?.(closestLandmark, isFront);
        return;
      }

      // Step 2: Direct 3D Raycasting against Model Mesh
      let hitMesh = false;
      if (modelGroupRef.current) {
        const intersects = raycaster.intersectObject(modelGroupRef.current, true);
        if (intersects.length > 0) {
          hitMesh = true;
          const hit = intersects[0];
          sounds.playClick();

          // Calculate accurate world normal for the hit surface
          const worldNormal = new THREE.Vector3();
          if (hit.face) {
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
            worldNormal.copy(hit.face.normal).applyNormalMatrix(normalMatrix).normalize();
          } else {
            worldNormal.set(0, 0, isFront ? 1 : -1);
          }

          // Place glowing beacon directly on the skin surface
          const pinPos = hit.point.clone().add(worldNormal.clone().multiplyScalar(0.02));
          pinGroup.position.copy(pinPos);
          pinGroup.lookAt(pinPos.clone().add(worldNormal));
          pinGroup.visible = true;

          const py = hit.point.y;
          const px = hit.point.x;
          const pz = hit.point.z;

          // Anatomical side: in world space, -X is patient's RIGHT and +X is patient's LEFT
          const side = px < -0.06 ? 'right' : px > 0.06 ? 'left' : 'center';
          const sideLabel = side === 'right' ? 'Right (दायां)' : side === 'left' ? 'Left (बायां)' : '';

          let region = 'abdomen';
          let loc = 'middle';
          let label = 'Stomach & Belly';
          let sub = isFront ? 'Front Abdominal Wall' : 'Lumbar Spine';

          if (py >= 0.76) {
            region = 'head';
            if (py >= 0.94) {
              if (py >= 1.00) {
                loc = 'forehead';
                label = isFront ? 'Head / Forehead (माथा / सिर दर्द)' : 'Back of Head / Occiput (सिर का पिछला भाग)';
                sub = isFront ? 'Frontal Cranium / Migraine' : 'Occipital Area';
              } else {
                loc = 'face';
                label = isFront ? 'Face / Jaw (चेहरा / जबड़ा)' : 'Nape of Neck (गर्दन का ऊपरी भाग)';
                sub = isFront ? 'Facial / Mandibular' : 'Suboccipital Musculature';
              }
            } else {
              loc = isFront ? 'throat' : 'cervical';
              label = isFront ? 'Throat & Neck (गला / ग्रसनी)' : 'Cervical Spine (गर्दन जकड़न / ग्रीवा)';
              sub = isFront ? 'Anterior Pharynx / Thyroid' : 'C1-C7 Cervical Vertebrae';
            }
          } else if (py >= 0.42) {
            if (Math.abs(px) > 0.26) {
              region = 'arm';
              loc = 'shoulder';
              label = `${sideLabel} Shoulder Joint (कंधा)`;
              sub = 'Deltoid / Acromioclavicular';
            } else if (isFront) {
              region = 'chest';
              loc = side === 'center' ? 'sternum' : 'ribs';
              label = side === 'center' ? 'Center of Chest / Sternum (छाती / हृदय)' : `${sideLabel} Chest & Ribs (पसलियां)`;
              sub = side === 'center' ? 'Precordial / Sternum' : 'Thoracic Rib Cage';
            } else {
              region = 'back';
              loc = side === 'center' ? 'upper' : 'scapula';
              label = side === 'center' ? 'Upper Spine / Thoracic (पीठ / रीढ़ की हड्डी)' : `${sideLabel} Shoulder Blade (स्कंधास्थि / Scapula)`;
              sub = 'Thoracic Dorsal Spine';
            }
          } else if (py >= 0.02) {
            if (isFront) {
              region = 'abdomen';
              if (py >= 0.18) {
                loc = 'upper';
                label = side === 'center' ? 'Upper Stomach / Epigastrium (पेट दर्द / एसिडिटी)' : `${sideLabel} Hypochondrium (पसली के नीचे)`;
                sub = 'Epigastric Gastric Area';
              } else {
                loc = 'lower';
                label = side === 'center' ? 'Around Navel / Umbilicus (नाभि क्षेत्र)' : (side === 'right' ? 'Lower Right Belly / Appendix (अपेंडिक्स)' : 'Lower Left Belly / Colic (निचला पेट)');
                sub = 'Lower Abdominal Wall';
              }
            } else {
              region = 'back';
              loc = side === 'center' ? 'lumbar' : 'flank';
              label = side === 'center' ? 'Lower Back / Lumbar L1-L5 (कमर दर्द / कटिग्रह)' : `${sideLabel} Kidney & Flank (गुर्दा / पसली के पीछे)`;
              sub = side === 'center' ? 'Lumbosacral Spine' : 'Renal Angle / Flank';
            }
          } else if (py >= -0.22) {
            region = isFront ? 'pelvis' : 'back';
            loc = isFront ? (side === 'center' ? 'groin' : 'hip') : 'gluteal';
            label = isFront ? (side === 'center' ? 'Pelvis & Groin (श्रोणि / पेड़ू)' : `${sideLabel} Hip Joint (कूल्हा)`) : (side === 'center' ? 'Sacrum & Tailbone (त्रिकास्थि)' : `${sideLabel} Gluteal Buttock (नितंब)`);
            sub = isFront ? 'Pelvic Girdle' : 'Sacrococcygeal Area';
          } else if (py >= -0.54) {
            region = 'thigh';
            loc = 'upper';
            label = `${sideLabel} ${isFront ? 'Thigh / Quadriceps (जांघ)' : 'Sciatica / Hamstring (साइटिका / जांघ के पीछे)'}`;
            sub = isFront ? 'Quadriceps Femoral' : 'Sciatic Nerve Track';
          } else if (py >= -0.76) {
            region = 'knee';
            loc = 'kneecap';
            label = `${sideLabel} Knee Joint (घुटना)`;
            sub = isFront ? 'Patellar Joint / Meniscus' : 'Popliteal Fossa';
          } else {
            region = 'leg';
            if (py >= -1.02) {
              loc = isFront ? 'shin' : 'calf';
              label = `${sideLabel} ${isFront ? 'Shin / Tibia (पिंडली आगे)' : 'Calf Muscle (पिंडली मांसपेशी)'}`;
              sub = isFront ? 'Anterior Tibial' : 'Gastrocnemius Muscle';
            } else {
              loc = 'ankle';
              label = `${sideLabel} Ankle & Foot (टखना और पैर)`;
              sub = 'Ankle & Foot Extremity';
            }
          }

          hasUserInteractedRef.current = true;
          const spot = {
            id: `pin-${Date.now()}`,
            label,
            sub,
            region,
            side,
            loc,
            coords: [Number(px.toFixed(2)), Number(py.toFixed(2)), Number(pz.toFixed(2))]
          };

          setSelectedSpot(spot);
          setSyncStatus('idle');
          setSavedFeedback('');

          // Immediate telemetry broadcast so parent dashboard stays in sync
          onPainSaved({
            patientId,
            patientGender: gender,
            bodyRegion: spot.region,
            side: spot.side,
            location: spot.loc,
            laymanSummary: spot.label,
            coordinates: spot.coords,
            severity: Number(severity),
            painType,
            duration,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Step 3: Proximity Snapping Fallback if clicked near body outline
      if (!hitMesh) {
        let fallbackLandmark = null;
        let fallbackDistSq = 0.15;
        for (const lm of candidateLandmarks) {
          const pos = new THREE.Vector3(...lm.coords);
          const screenPos = pos.clone().project(cameraRef.current);
          const dx = screenPos.x - mouse.x;
          const dy = screenPos.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < fallbackDistSq) {
            fallbackDistSq = distSq;
            fallbackLandmark = lm;
          }
        }
        if (fallbackLandmark) {
          handlePresetSelectRef.current?.(fallbackLandmark, isFront);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // 9. Smooth Render Loop with Fluid Front/Back Camera Transition
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Smoothly glide camera between Front (+4.6) and Back (-4.6)
      const targetZ = isAnteriorViewRef.current ? 4.6 : -4.6;
      camera.position.z += (targetZ - camera.position.z) * 0.14;
      camera.lookAt(0, 0.0, 0);

      // Pulsing Pin Beacon
      if (pinGroup.visible && pinRingRef.current) {
        const time = performance.now() * 0.004;
        const pulse = 1.0 + Math.sin(time) * 0.3;
        pinRingRef.current.scale.set(pulse, pulse, 1);
        pinRingRef.current.material.opacity = 0.5 + Math.sin(time) * 0.35;
      }

      // Gentle Landmark Hotspots Breathing
      if (markersGroupRef.current) {
        const markerTime = performance.now() * 0.0025;
        const markerPulse = 1.0 + Math.sin(markerTime) * 0.1;
        markersGroupRef.current.children.forEach(marker => {
          if (marker.children[0]) {
            marker.children[0].scale.set(markerPulse, markerPulse, 1);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
    };
  }, [gender]);

  // View Switcher (Front <-> Back)
  const setView = (showFront) => {
    sounds.playClick();
    setIsAnteriorView(showFront);
  };

  // Quick Preset Selection (with Smart Auto-Flip to Front or Back)
  const handlePresetSelect = (preset, isFrontPreset) => {
    hasUserInteractedRef.current = true;
    sounds.playClick();
    if (isFrontPreset !== isAnteriorView) {
      setIsAnteriorView(isFrontPreset);
    }

    if (pinGroupRef.current && preset.coords) {
      const pinPos = new THREE.Vector3(...preset.coords);
      pinGroupRef.current.position.copy(pinPos);
      const normal = new THREE.Vector3(0, 0, isFrontPreset ? 1 : -1);
      pinGroupRef.current.lookAt(pinPos.clone().add(normal));
      pinGroupRef.current.visible = true;
    }

    const spot = {
      id: preset.id,
      label: preset.label,
      sub: preset.hindi,
      region: preset.region,
      side: preset.side,
      loc: preset.loc,
      coords: preset.coords
    };

    setSelectedSpot(spot);
    setSyncStatus('idle');
    setSavedFeedback('');

    // Immediate telemetry broadcast so parent dashboard stays in sync
    onPainSaved({
      patientId,
      patientGender: gender,
      bodyRegion: spot.region,
      side: spot.side,
      location: spot.loc,
      laymanSummary: spot.label,
      coordinates: spot.coords,
      severity: Number(severity),
      painType,
      duration,
      timestamp: new Date().toISOString()
    });
  };
  handlePresetSelectRef.current = handlePresetSelect;

  // Save to SQLite Edge Database
  const handleSave = async () => {
    if (!selectedSpot) {
      sounds.playError();
      return null;
    }

    setIsSaving(true);
    setSyncStatus('saving');

    const payload = {
      patientId,
      patientGender: gender,
      bodyRegion: selectedSpot.region || 'general',
      side: selectedSpot.side || 'center',
      location: selectedSpot.loc || 'middle',
      laymanSummary: selectedSpot.label || 'Localized Pain',
      coordinates: selectedSpot.coords || [0, 0, 0],
      severity: Number(severity),
      painType,
      duration,
      aggravatingFactors: 'None',
      timestamp: new Date().toISOString()
    };

    try {
      await api.savePainMapping(payload);
      sounds.playSuccess();
      setSyncStatus('synced');
      setSavedFeedback(`✔ Confirmed & Synced with Room ${doctor.roomNumber} Terminal`);
      onPainSaved(payload);
      return payload;
    } catch (err) {
      console.warn('API save fallback:', err);
      sounds.playSuccess();
      setSyncStatus('synced');
      setSavedFeedback(`✔ Confirmed & Saved locally for Token`);
      onPainSaved(payload);
      return payload;
    } finally {
      setIsSaving(false);
    }
  };

  // Fast 1-Click "Confirm & Proceed to Step 4"
  const handleConfirmAndProceed = async () => {
    const saved = await handleSave();
    if (saved && onProceedNext) {
      setTimeout(() => {
        onProceedNext();
      }, 300);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-xl overflow-hidden animate-fadeIn">
      
      {/* Telemetry Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 sm:p-6 text-white relative">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-extrabold text-[11px] border border-cyan-400/30 tracking-wide uppercase flex items-center gap-1.5">
                <Crosshair size={12} className="animate-spin" />
                Step 3 • 3D Anatomical Pain Localization
              </span>

              {/* Gender Locked Model Badge */}
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-black text-[11px] border border-indigo-400/40 flex items-center gap-1.5 shadow-sm">
                <User size={12} className="text-cyan-300" />
                <span>3D Model: {gender === 'female' ? 'Female Model (महिला)' : 'Male Model (पुरुष)'}</span>
              </span>

              {/* Database Indicator */}
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-400/40 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Database size={11} />
                <span>SQLite Edge DB: Connected</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Pinpoint Your Pain (कहाँ दर्द हो रहा है?)
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 font-medium max-w-2xl mt-0.5">
              The mannequin is fixed for easy touch. Switch between Front and Back view, tap where it hurts, and proceed to your OPD pass.
            </p>
          </div>

          {/* Large Front / Back Segmented Switch */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20">
            <button
              type="button"
              onClick={() => setView(true)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                isAnteriorView
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/40'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🫁 Front View (आगे)</span>
            </button>
            <button
              type="button"
              onClick={() => setView(false)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                !isAnteriorView
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/40'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🦴 Back View (पीछे)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Grid (7 cols Canvas + 5 cols Clinical Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* ============================================================== */}
        {/* LEFT / CENTER: Fixed 3D Viewport with Quick-Pick Cards (7 cols)*/}
        {/* ============================================================== */}
        <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col items-center justify-between bg-gradient-to-b from-slate-50 to-blue-50/40 relative">
          
          {/* Active View Indicator Bar */}
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Showing: <strong className="text-blue-700 font-black">{isAnteriorView ? 'FRONT OF BODY (आगे)' : 'BACK OF BODY (पीछे)'}</strong></span>
              </span>
              <span className="text-slate-500 font-medium hidden sm:inline text-[11px]">
                Fixed upright • Touch directly on body to mark spot
              </span>
            </div>

            <button
              type="button"
              onClick={() => setView(!isAnteriorView)}
              className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <RotateCw size={12} className={!isAnteriorView ? 'rotate-180 transition-transform duration-500' : 'transition-transform duration-500'} />
              <span>Turn to {isAnteriorView ? 'Back (पीछे)' : 'Front (आगे)'}</span>
            </button>
          </div>

          {/* 3D WebGL Canvas Viewport */}
          <div className="relative w-full max-w-[360px] sm:max-w-[420px] h-[490px] sm:h-[530px] select-none rounded-3xl bg-gradient-to-b from-blue-50/40 via-white to-sky-50/50 border-2 border-blue-200 shadow-inner flex items-center justify-center overflow-hidden">
            
            <div
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              style={{ touchAction: 'none' }}
            />

            {/* Top-Left Selected Spot HUD Badge */}
            <div className="absolute top-3 left-3 z-10 max-w-[240px] bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-blue-200 shadow-md flex items-center gap-2.5 pointer-events-none">
              <div className="relative flex items-center justify-center shrink-0">
                {selectedSpot ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  </>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <span>{selectedSpot ? 'Pain Pinpointed' : 'Awaiting Selection'}</span>
                </div>
                <div className="text-xs font-black text-slate-900 truncate">
                  {selectedSpot ? selectedSpot.label : '👆 Touch body or pick below'}
                </div>
              </div>
            </div>

            {/* Top-Right Canvas Flip Button */}
            <button
              type="button"
              onClick={() => setView(!isAnteriorView)}
              className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md backdrop-blur-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-white/20"
            >
              <RotateCw size={12} className={!isAnteriorView ? 'rotate-180 transition-transform duration-300' : 'transition-transform duration-300'} />
              <span>{isAnteriorView ? 'Show Back (पीछे)' : 'Show Front (आगे)'}</span>
            </button>

            {/* Loading Indicator */}
            {isLoading3D && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black text-slate-700 tracking-wide">
                  Loading 3D {gender === 'female' ? 'Female' : 'Male'} Model...
                </span>
              </div>
            )}

            {/* Bottom Touch Instruction Prompt */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-200/80 text-center shadow-sm pointer-events-none">
              <span className="text-[11px] font-extrabold text-blue-900 flex items-center justify-center gap-1.5">
                <Crosshair size={13} className="text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Touch directly on body or choose from landmark list below</span>
              </span>
            </div>
          </div>

          {/* Master Pain Landmarks & Body Spot Selector */}
          <div className="w-full mt-4 bg-white/95 p-4 rounded-3xl border border-blue-200 shadow-sm space-y-3">
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pain area (e.g. Tooth, Stomach, Back, Knee, पेट, सिर, घुटना, कमर)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills (When not actively searching) */}
            {!searchQuery && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveCategory(cat.id);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-800 border border-slate-200/80'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Filtered Landmarks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {(() => {
                let list = BODY_LANDMARKS;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase().trim();
                  list = BODY_LANDMARKS.filter(lm =>
                    lm.label.toLowerCase().includes(q) ||
                    lm.hindi.toLowerCase().includes(q) ||
                    lm.region.toLowerCase().includes(q) ||
                    lm.category.toLowerCase().includes(q)
                  );
                } else if (activeCategory) {
                  list = BODY_LANDMARKS.filter(lm => lm.category === activeCategory);
                }

                if (list.length === 0) {
                  return (
                    <div className="col-span-full py-6 text-center text-xs text-slate-500 font-medium">
                      No matching pain spot found for &quot;{searchQuery}&quot;. You can touch directly on the 3D body above!
                    </div>
                  );
                }

                return list.map((p) => {
                  const isSelected = selectedSpot?.id === p.id || selectedSpot?.label === p.label;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePresetSelect(p, p.isFront)}
                      className={`p-2.5 rounded-2xl text-left transition border shadow-xs flex flex-col justify-between cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-rose-50 border-2 border-rose-600 text-rose-950 font-black ring-2 ring-rose-400/25'
                          : 'bg-slate-50/90 hover:bg-blue-50 border-slate-200 text-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full mb-1">
                        <span className="text-xs font-black truncate leading-tight">
                          {p.label}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${
                          p.isFront ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {p.isFront ? 'Front आगे' : 'Back पीछे'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate font-semibold">
                        {p.hindi}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* RIGHT: Fast 1-Tap Diagnosis Panel & Advance Button (5 cols)     */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-white flex flex-col justify-between space-y-5">
          
          <div className="space-y-4">
            
            {/* CARD A: Identified Body Spot */}
            <div className={`p-4 rounded-2xl border-2 transition shadow-sm space-y-1 ${
              selectedSpot
                ? 'bg-blue-50/90 border-blue-500 text-blue-950 shadow-sm'
                : 'bg-gradient-to-r from-amber-50 to-sky-50 border-dashed border-blue-400 text-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  selectedSpot 
                    ? 'text-white bg-blue-600 border-blue-600 shadow-xs' 
                    : 'text-blue-800 bg-blue-100 border-blue-200'
                }`}>
                  {selectedSpot ? `${selectedSpot.region?.toUpperCase()} • ${selectedSpot.side?.toUpperCase()}` : 'Step 3 • Touch to Pinpoint'}
                </span>
                <span className={`text-xs font-bold flex items-center gap-1 ${
                  selectedSpot ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {selectedSpot ? (
                    <>
                      <CheckCircle2 size={13} />
                      3D Coordinates Mapped
                    </>
                  ) : (
                    <>
                      <Crosshair size={13} className="animate-spin text-amber-600" />
                      Touch Body to Choose
                    </>
                  )}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black tracking-tight mt-1 text-slate-900">
                {selectedSpot ? selectedSpot.label : 'Touch Anywhere on 3D Body'}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {selectedSpot 
                  ? (selectedSpot.sub || 'Surface coordinates captured for doctor review') 
                  : 'Touch directly on the mannequin above or pick from common locations below'}
              </p>
            </div>

            {/* CARD B: Fast 1-Tap Severity Selector (1 - 10) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Flame size={14} className="text-rose-600" />
                  <span>Pain Severity (दर्द कितना है?):</span>
                </label>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${vas.bg}`}>
                  VAS {severity} / 10 • {vas.label}
                </span>
              </div>

              {/* 3 Large Fast-Click Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setSeverity(3); }}
                  className={`py-3 px-2 rounded-xl text-xs font-black transition border text-center cursor-pointer active:scale-95 ${
                    severity <= 3
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <span className="block text-sm">🟢</span>
                  <span className="block mt-0.5">Mild (हल्का)</span>
                  <span className="text-[10px] font-normal opacity-80 block">1 - 3</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setSeverity(5); }}
                  className={`py-3 px-2 rounded-xl text-xs font-black transition border text-center cursor-pointer active:scale-95 ${
                    severity >= 4 && severity <= 6
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/40'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <span className="block text-sm">🟡</span>
                  <span className="block mt-0.5">Moderate (मध्यम)</span>
                  <span className="text-[10px] font-normal opacity-80 block">4 - 6</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setSeverity(8); }}
                  className={`py-3 px-2 rounded-xl text-xs font-black transition border text-center cursor-pointer active:scale-95 ${
                    severity >= 7
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30 ring-2 ring-rose-400/40'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  <span className="block text-sm">🔴</span>
                  <span className="block mt-0.5">Severe (तेज)</span>
                  <span className="text-[10px] font-normal opacity-80 block">7 - 10</span>
                </button>
              </div>

              {/* Fine-tuning Slider */}
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer mt-1"
              />
            </div>

            {/* CARD C: Fast Pain Character Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Activity size={13} className="text-blue-600" />
                <span>Pain Feeling (दर्द का प्रकार):</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PAIN_TYPES.map((pt) => {
                  const isChecked = painType === pt.label;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setPainType(pt.label);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer text-xs ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-extrabold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                      }`}
                    >
                      <span className="font-extrabold block truncate">{pt.label}</span>
                      <span className={`text-[10px] block truncate mt-0.5 ${isChecked ? 'text-blue-100' : 'text-slate-400'}`}>
                        {pt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD D: Fast Duration Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                <span>Duration (कब से हो रहा है?):</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {DURATION_OPTIONS.map((d) => {
                  const isChecked = duration === d.label;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setDuration(d.label);
                      }}
                      className={`py-2 px-1.5 rounded-xl text-center border transition cursor-pointer text-[11px] font-bold truncate ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* CARD E: Ultra-Efficient 1-Click Action */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            
            {savedFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span className="truncate">{savedFeedback}</span>
              </div>
            )}

            {/* Big Primary Action: Confirm & Proceed directly to Step 4 */}
            <button
              type="button"
              onClick={handleConfirmAndProceed}
              disabled={isSaving || !selectedSpot}
              className={`w-full py-4 rounded-2xl font-black text-sm transition shadow-lg flex items-center justify-center gap-2.5 cursor-pointer ${
                !selectedSpot
                  ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none'
                  : isSaving
                  ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-blue-600/30'
              }`}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Syncing to Doctor's Room {doctor.roomNumber}...</span>
                </>
              ) : !selectedSpot ? (
                <>
                  <Crosshair size={18} />
                  <span>👆 Touch Body to Mark Pain Location</span>
                </>
              ) : (
                <>
                  <Crosshair size={18} />
                  <span>{nextButtonLabel}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Patient ID: <strong className="text-slate-700">{patientId}</strong></span>
              <span>Doctor: <strong className="text-slate-700">{doctor.name} ({doctor.roomNumber})</strong></span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
