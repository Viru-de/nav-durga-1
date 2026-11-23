import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RotateCcw, Eye, Layers, Cpu } from 'lucide-react';

export type SteelProfile3DMode = 'channel' | 'beam' | 'angle' | 'rolling';

interface ThreeSteelShowcaseProps {
  initialMode?: SteelProfile3DMode;
  heightClass?: string;
  onRequestQuote?: (profileName: string) => void;
}

const PROFILE_META: Record<
  SteelProfile3DMode,
  {
    label: string;
    standard: string;
    section: string;
    specs: string;
  }
> = {
  channel: {
    label: 'MS Channel (ISMC)',
    standard: 'IS 2062 E250 / IS 808',
    section: 'Medium & Light Section',
    specs: '70×35mm to 250×82mm • Structural C-Profile',
  },
  beam: {
    label: 'MS Joist / I-Beam (ISMB)',
    standard: 'IS 2062 / Heavy Load Flange',
    section: 'Medium Section',
    specs: '100×50mm to 300×140mm • High Bending Resistance',
  },
  angle: {
    label: 'MS Equal Angle (ISA)',
    standard: 'IS 2062 / Unit-2 Precision',
    section: 'Light Section',
    specs: '40×5mm to 65×6mm • Tower & Truss Framing',
  },
  rolling: {
    label: 'Hot Rolling Stand',
    standard: 'Urla Automated Mill Line',
    section: 'Mill Engineering',
    specs: 'Precision Controlled Pass & Gauge Calibration',
  },
};

function isSoftwareGl(gl: WebGLRenderingContext | WebGL2RenderingContext | null): boolean {
  if (!gl) return true;
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
    return /SwiftShader|llvmpipe|Softpipe|Microsoft Basic Render/i.test(renderer);
  } catch {
    return false;
  }
}

function createExtrudedChannel(
  width: number,
  height: number,
  thickness: number,
  length: number,
  bevel: boolean
): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, -height / 2);
  s.lineTo(width / 2, -height / 2);
  s.lineTo(width / 2, -height / 2 + thickness);
  s.lineTo(-width / 2 + thickness, -height / 2 + thickness);
  s.lineTo(-width / 2 + thickness, height / 2 - thickness);
  s.lineTo(width / 2, height / 2 - thickness);
  s.lineTo(width / 2, height / 2);
  s.lineTo(-width / 2, height / 2);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: length,
    bevelEnabled: bevel,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 2,
    steps: 1,
  });
  geo.center();
  return geo;
}

function createExtrudedIBeam(
  flangeW: number,
  height: number,
  flangeT: number,
  webT: number,
  length: number,
  bevel: boolean
): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  const hw = flangeW / 2;
  const hh = height / 2;
  const hwt = webT / 2;
  s.moveTo(-hw, -hh);
  s.lineTo(hw, -hh);
  s.lineTo(hw, -hh + flangeT);
  s.lineTo(hwt, -hh + flangeT);
  s.lineTo(hwt, hh - flangeT);
  s.lineTo(hw, hh - flangeT);
  s.lineTo(hw, hh);
  s.lineTo(-hw, hh);
  s.lineTo(-hw, hh - flangeT);
  s.lineTo(-hwt, hh - flangeT);
  s.lineTo(-hwt, -hh + flangeT);
  s.lineTo(-hw, -hh + flangeT);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: length,
    bevelEnabled: bevel,
    bevelThickness: 0.016,
    bevelSize: 0.012,
    bevelSegments: 2,
    steps: 1,
  });
  geo.center();
  return geo;
}

function createExtrudedAngle(
  leg: number,
  thickness: number,
  length: number,
  bevel: boolean
): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(leg, 0);
  s.lineTo(leg, thickness);
  s.lineTo(thickness, thickness);
  s.lineTo(thickness, leg);
  s.lineTo(0, leg);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: length,
    bevelEnabled: bevel,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
    steps: 1,
  });
  geo.center();
  return geo;
}

export const ThreeSteelShowcase: React.FC<ThreeSteelShowcaseProps> = ({
  initialMode = 'channel',
  heightClass = 'h-[360px] sm:h-[460px] lg:h-[520px] min-[1920px]:h-[580px]',
  onRequestQuote,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<SteelProfile3DMode>(initialMode);
  const [autoRotate, setAutoRotate] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const resetCameraFnRef = useRef<(() => void) | null>(null);
  const autoRotateRef = useRef(autoRotate);
  const explodedRef = useRef(exploded);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    explodedRef.current = exploded;
  }, [exploded]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglError(true);
      return;
    }

    const gl = renderer.getContext();
    const softwareGl = isSoftwareGl(gl);
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 440;

    renderer.setPixelRatio(softwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !softwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1ece3);
    scene.fog = new THREE.Fog(0xf1ece3, 11, 24);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    const defaultCamPos = new THREE.Vector3(4.3, 2.5, 4.9);
    camera.position.copy(defaultCamPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 9.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.target.set(0, 0.2, 0);

    // Three-point light studio rig
    const keyLight = new THREE.DirectionalLight(0xfff8eb, 1.85);
    keyLight.position.set(5, 7, 4);
    if (!softwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 18;
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf1ece3, 0.9);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffcf70, 0.55);
    rimLight.position.set(0, 4, -6);
    scene.add(rimLight);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d0c3, 0.65);
    scene.add(hemi);

    // Warm Linen Studio Ground Grid + Stage Plinth
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xeae3d7,
      roughness: 0.85,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.85;
    floor.receiveShadow = !softwareGl;
    scene.add(floor);

    const grid = new THREE.GridHelper(14, 28, 0xc7bfb2, 0xddd6c9);
    grid.position.y = -0.84;
    scene.add(grid);

    // Materials (Calibrated PBR Steel)
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.86,
      roughness: 0.28,
      envMapIntensity: 1.15,
    });

    const darkSteelEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x46536a,
      metalness: 0.82,
      roughness: 0.36,
    });

    const blueAccentMat = new THREE.MeshStandardMaterial({
      color: 0x14213d,
      metalness: 0.45,
      roughness: 0.32,
    });

    const timberSkidMat = new THREE.MeshStandardMaterial({
      color: 0xd6b88d,
      metalness: 0.05,
      roughness: 0.8,
    });

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const animatedParts: Array<{ mesh: THREE.Object3D; basePos: THREE.Vector3; explodeOffset: THREE.Vector3 }> = [];
    const disposableGeos: THREE.BufferGeometry[] = [floorGeo];

    const addPart = (mesh: THREE.Object3D, explodeOffset = new THREE.Vector3(0, 0, 0)) => {
      if ((mesh as THREE.Mesh).isMesh) {
        mesh.castShadow = !softwareGl;
        mesh.receiveShadow = !softwareGl;
      }
      rootGroup.add(mesh);
      animatedParts.push({
        mesh,
        basePos: mesh.position.clone(),
        explodeOffset,
      });
    };

    const bevel = !softwareGl;

    if (mode === 'channel') {
      // Timber skids under steel bundle
      const skidGeo = new THREE.BoxGeometry(2.3, 0.14, 0.22);
      disposableGeos.push(skidGeo);
      [-1.1, 1.1].forEach((zPos) => {
        const skid = new THREE.Mesh(skidGeo, timberSkidMat);
        skid.position.set(0, -0.76, zPos);
        addPart(skid, new THREE.Vector3(0, -0.15, 0));
      });

      const chGeo = createExtrudedChannel(0.56, 0.84, 0.085, 3.3, bevel);
      disposableGeos.push(chGeo);
      const positions = [
        { x: -0.64, y: -0.26, ex: new THREE.Vector3(-0.35, 0, 0) },
        { x: 0, y: -0.26, ex: new THREE.Vector3(0, 0.18, 0) },
        { x: 0.64, y: -0.26, ex: new THREE.Vector3(0.35, 0, 0) },
        { x: -0.32, y: 0.58, ex: new THREE.Vector3(-0.22, 0.45, 0) },
        { x: 0.32, y: 0.58, ex: new THREE.Vector3(0.22, 0.45, 0) },
      ];
      positions.forEach((p) => {
        const m = new THREE.Mesh(chGeo, steelMat);
        m.position.set(p.x, p.y, 0);
        addPart(m, p.ex);
      });

      // Primary Blue Nav Durga steel strap bands
      const bandGeo = new THREE.BoxGeometry(1.94, 0.04, 0.07);
      disposableGeos.push(bandGeo);
      [-0.95, 0.95].forEach((z) => {
        const band = new THREE.Mesh(bandGeo, blueAccentMat);
        band.position.set(0, 0.16, z);
        addPart(band, new THREE.Vector3(0, 0.65, 0));
      });
    } else if (mode === 'beam') {
      const beamGeo = createExtrudedIBeam(0.95, 1.35, 0.11, 0.09, 3.6, bevel);
      disposableGeos.push(beamGeo);
      const beam = new THREE.Mesh(beamGeo, steelMat);
      beam.position.set(0, 0.12, 0);
      addPart(beam, new THREE.Vector3(0, 0.15, 0));

      // Bolted structural end plate + crimson gusset stiffeners
      const plateGeo = new THREE.BoxGeometry(1.16, 1.52, 0.08);
      disposableGeos.push(plateGeo);
      const endPlate = new THREE.Mesh(plateGeo, darkSteelEdgeMat);
      endPlate.position.set(0, 0.12, 1.88);
      addPart(endPlate, new THREE.Vector3(0, 0.15, 0.55));

      const boltGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.12, 6);
      boltGeo.rotateX(Math.PI / 2);
      disposableGeos.push(boltGeo);
      [
        [-0.38, 0.64],
        [0.38, 0.64],
        [-0.38, -0.4],
        [0.38, -0.4],
      ].forEach(([bx, by]) => {
        const bolt = new THREE.Mesh(boltGeo, blueAccentMat);
        bolt.position.set(bx, by, 1.94);
        addPart(bolt, new THREE.Vector3(0, 0.15, 0.8));
      });

      // Second parallel support beam in background
      const beam2 = new THREE.Mesh(beamGeo, steelMat);
      beam2.position.set(-1.15, -0.15, -0.2);
      beam2.scale.set(0.7, 0.7, 0.9);
      addPart(beam2, new THREE.Vector3(-0.4, 0, -0.2));
    } else if (mode === 'angle') {
      const skidGeo = new THREE.BoxGeometry(2.1, 0.12, 0.22);
      disposableGeos.push(skidGeo);
      [-1.0, 1.0].forEach((z) => {
        const skid = new THREE.Mesh(skidGeo, timberSkidMat);
        skid.position.set(0, -0.76, z);
        addPart(skid, new THREE.Vector3(0, -0.1, 0));
      });

      const angleGeo = createExtrudedAngle(0.55, 0.07, 3.2, bevel);
      disposableGeos.push(angleGeo);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const m = new THREE.Mesh(angleGeo, steelMat);
          m.position.set((col - 1) * 0.62, -0.35 + row * 0.42, 0);
          m.rotation.z = Math.PI / 4;
          addPart(m, new THREE.Vector3((col - 1) * 0.28, row * 0.25, 0));
        }
      }

      const tagGeo = new THREE.BoxGeometry(0.45, 0.22, 0.05);
      disposableGeos.push(tagGeo);
      const tag = new THREE.Mesh(tagGeo, blueAccentMat);
      tag.position.set(0.68, 0.1, 1.62);
      addPart(tag, new THREE.Vector3(0.25, 0.15, 0.35));
    } else {
      // Rolling Stand Assembly
      const baseGeo = new THREE.BoxGeometry(3.4, 0.24, 1.8);
      const housingGeo = new THREE.BoxGeometry(0.36, 1.85, 1.25);
      const rollerGeo = new THREE.CylinderGeometry(0.24, 0.24, 2.2, 24);
      rollerGeo.rotateZ(Math.PI / 2);
      const capGeo = new THREE.BoxGeometry(2.9, 0.2, 0.9);
      const workpieceGeo = createExtrudedChannel(0.42, 0.56, 0.07, 4.1, bevel);
      disposableGeos.push(baseGeo, housingGeo, rollerGeo, capGeo, workpieceGeo);

      const base = new THREE.Mesh(baseGeo, darkSteelEdgeMat);
      base.position.set(0, -0.7, 0);
      addPart(base, new THREE.Vector3(0, -0.2, 0));

      [-1.15, 1.15].forEach((hx) => {
        const housing = new THREE.Mesh(housingGeo, steelMat);
        housing.position.set(hx, 0.25, 0);
        addPart(housing, new THREE.Vector3(hx * 0.3, 0.1, 0));
      });

      const topCap = new THREE.Mesh(capGeo, blueAccentMat);
      topCap.position.set(0, 1.2, 0);
      addPart(topCap, new THREE.Vector3(0, 0.48, 0));

      [0.52, -0.18].forEach((ry, idx) => {
        const roller = new THREE.Mesh(rollerGeo, steelMat);
        roller.position.set(0, ry, 0);
        addPart(roller, new THREE.Vector3(0, idx === 0 ? 0.35 : -0.12, 0));
      });

      const workpiece = new THREE.Mesh(workpieceGeo, steelMat);
      workpiece.position.set(0, 0.17, 0.45);
      addPart(workpiece, new THREE.Vector3(0, 0, 0.55));
    }

    let rafId = 0;
    let isContextLost = false;
    let needsRender = true;
    const clock = new THREE.Clock();

    const requestRender = () => {
      needsRender = true;
    };

    const onControlChange = () => {
      requestRender();
    };
    controls.addEventListener('change', onControlChange);

    resetCameraFnRef.current = () => {
      camera.position.copy(defaultCamPos);
      controls.target.set(0, 0.2, 0);
      controls.update();
      requestRender();
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      setWebglError(true);
    };
    const handleContextRestored = () => {
      isContextLost = false;
      setWebglError(false);
      requestRender();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      }
    });
    resizeObserver.observe(container);

    let explodeLerp = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (isContextLost) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const targetExplode = explodedRef.current ? 1 : 0;
      if (Math.abs(explodeLerp - targetExplode) > 0.002) {
        explodeLerp += (targetExplode - explodeLerp) * Math.min(1, dt * 8);
        animatedParts.forEach((p) => {
          p.mesh.position.copy(p.basePos).addScaledVector(p.explodeOffset, explodeLerp);
        });
        needsRender = true;
      }

      if (autoRotateRef.current) {
        rootGroup.rotation.y += dt * 0.38;
        needsRender = true;
      }

      if (controls.update()) {
        needsRender = true;
      }

      if (needsRender) {
        renderer.render(scene, camera);
        needsRender = false;
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.removeEventListener('change', onControlChange);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      disposableGeos.forEach((g) => g.dispose());
      steelMat.dispose();
      darkSteelEdgeMat.dispose();
      blueAccentMat.dispose();
      timberSkidMat.dispose();
      floorMat.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [mode]);

  const meta = PROFILE_META[mode];

  return (
    <div className={`relative w-full ${heightClass} bg-[var(--color-linen)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-xs select-none`}>
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Fallback when WebGL unavailable */}
      {webglError && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-linen)] to-[var(--color-linen)] flex flex-col items-center justify-center p-6 text-center">
          <Cpu className="w-10 h-10 text-[var(--color-navy)] mb-3" />
          <h3 className="text-lg font-extrabold text-[var(--color-navy)]">{meta.label}</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-md">{meta.specs}</p>
        </div>
      )}

      {/* Top Overlay Bar: Engineering Readout + Quick Actions (flex prevents mobile overlap) */}
      <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 z-10 flex items-start justify-between gap-2 pointer-events-none">
        <div className="min-w-0 flex-1 max-w-[300px]">
          <div className="bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border)] rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 shadow-xs">
            <div className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-navy)] truncate">
              <span className="w-3 h-[2px] bg-[var(--color-amber)] shrink-0" aria-hidden="true" />
              <span>3D Engineering Spec</span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-[var(--color-navy)] mt-0.5 truncate">{meta.label}</div>
            <div className="hidden min-[480px]:block text-[11px] font-medium text-[var(--color-text-secondary)] mt-0.5">{meta.specs}</div>
            <div className="hidden min-[480px]:flex mt-1.5 pt-1.5 border-t border-[var(--color-border)] items-center justify-between gap-3 text-[10px] font-mono text-[var(--color-navy)]">
              <span>{meta.standard}</span>
              <span className="font-bold text-[var(--color-navy)]">{meta.section}</span>
            </div>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setExploded((v) => !v)}
            className={`min-h-[36px] sm:min-h-[38px] px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] font-bold border shadow-2xs transition-colors cursor-pointer flex items-center gap-1 ${
              exploded
                ? 'bg-[var(--color-amber)] text-[var(--color-navy)] border-[var(--color-amber)]'
                : 'bg-[var(--color-surface)]/95 text-[var(--color-navy)] border-[var(--color-border)] hover:bg-[var(--color-surface)]'
            }`}
            title="Toggle exploded assembly view"
            aria-label={exploded ? 'Switch to assembled view' : 'Switch to exploded view'}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden min-[380px]:inline">{exploded ? 'Assembled' : 'Explode'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className={`min-h-[36px] sm:min-h-[38px] px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] font-bold border shadow-2xs transition-colors cursor-pointer flex items-center gap-1 ${
              autoRotate
                ? 'bg-[var(--color-navy)] text-[var(--color-linen)] border-[var(--color-navy)]'
                : 'bg-[var(--color-surface)]/95 text-[var(--color-navy)] border-[var(--color-border)] hover:bg-[var(--color-surface)]'
            }`}
            title="Toggle turntable rotation"
            aria-label={autoRotate ? 'Pause rotation' : 'Enable rotation'}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{autoRotate ? 'Spinning' : 'Static'}</span>
          </button>

          <button
            type="button"
            onClick={() => resetCameraFnRef.current?.()}
            className="min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] p-1.5 rounded-lg bg-[var(--color-surface)]/95 text-[var(--color-navy)] border border-[var(--color-border)] hover:bg-[var(--color-amber)] hover:border-[var(--color-amber)] shadow-2xs cursor-pointer inline-flex items-center justify-center transition-colors"
            title="Reset camera angle"
            aria-label="Reset 3D camera angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Profile Switcher Dock */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto inline-flex flex-wrap items-center gap-1 bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border)] p-1 rounded-xl shadow-xs max-w-full">
          {(
            [
              { id: 'channel', label: 'MS Channel' },
              { id: 'beam', label: 'MS Joist / Beam' },
              { id: 'angle', label: 'MS Angle' },
              { id: 'rolling', label: 'Rolling Mill Stand' },
            ] as Array<{ id: SteelProfile3DMode; label: string }>
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`min-h-[34px] px-2 sm:px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                mode === item.id
                  ? 'bg-[var(--color-amber)] text-[var(--color-navy)]'
                  : 'text-[var(--color-navy)] hover:bg-[var(--color-linen)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {onRequestQuote && (
          <button
            type="button"
            onClick={() => onRequestQuote(meta.label)}
            className="nd-btn-primary pointer-events-auto min-h-[36px] px-3.5 py-1.5 rounded-xl text-[11px] font-bold shadow-xs cursor-pointer"
          >
            Quote {meta.label.split(' ')[0]} {meta.label.split(' ')[1]} →
          </button>
        )}
      </div>
    </div>
  );
};
