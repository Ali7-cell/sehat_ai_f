import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

class MetaballGeometry extends THREE.BufferGeometry {
  radius: number;
  numBlobs: number;
  transforms: any[];
  bounds: number[];
  positions: Float32Array;
  normals: Float32Array;
  noise: Float32Array;
  indices: Uint32Array | null;
  positionTyped: THREE.Float32BufferAttribute;
  normalTyped: THREE.Float32BufferAttribute;
  blobCenter: THREE.Vector3;

  constructor(radius: number, numBlobs: number, transforms: any[], bounds: number[], positions: Float32Array) {
    super();
    const baseGeom = new THREE.IcosahedronGeometry(1, 64);
    this.radius = radius;
    this.numBlobs = numBlobs;
    this.transforms = transforms;
    this.bounds = bounds;
    this.positions = new Float32Array(positions.length);
    this.normals = new Float32Array(positions.length);
    this.noise = new Float32Array(positions.length);

    const posAttr = baseGeom.attributes.position as THREE.BufferAttribute;
    const norAttr = baseGeom.attributes.normal as THREE.BufferAttribute;
    const index = baseGeom.index;

    for (let i = 0; i < posAttr.count; i++) {
      this.positions[3 * i] = posAttr.getX(i);
      this.positions[3 * i + 1] = posAttr.getY(i);
      this.positions[3 * i + 2] = posAttr.getZ(i);
      this.normals[3 * i] = norAttr.getX(i);
      this.normals[3 * i + 1] = norAttr.getY(i);
      this.normals[3 * i + 2] = norAttr.getZ(i);
    }

    if (index) {
      this.indices = new Uint32Array(index.array);
      this.setIndex(new THREE.Uint32BufferAttribute(this.indices, 1));
    } else {
      this.indices = null;
    }

    this.positionTyped = new THREE.Float32BufferAttribute(new Float32Array(this.positions), 3);
    this.normalTyped = new THREE.Float32BufferAttribute(new Float32Array(this.normals), 3);
    this.setAttribute('position', this.positionTyped);
    this.setAttribute('normal', this.normalTyped);
    this.setAttribute('noise', new THREE.BufferAttribute(this.noise, 3));
    this.blobCenter = new THREE.Vector3(...bounds);
  }

  update(t: number) {
    for (let i = 0; i < this.numBlobs; i++) {
      const scale = this.transforms[i].scale;
      const speed = this.transforms[i].speed;
      const offset = t * speed;
      const pos = this.transforms[i].position.slice();
      pos[0] = pos[0] + Math.sin(offset + pos[1] * 0.15) * scale[0];
      pos[1] = pos[1] + Math.sin(offset * 1.5 + pos[0] * 0.1) * scale[1];

      for (let j = 0; j < this.positions.length / 3; j++) {
        const px = this.positions[3 * j];
        const py = this.positions[3 * j + 1];
        const pz = this.positions[3 * j + 2];
        const f = (px - pos[0]) * (px - pos[0]) + (py - pos[1]) * (py - pos[1]) + (pz - pos[2]) * (pz - pos[2]);
        let a = this.radius;
        a /= f;
        this.noise[3 * j] += a * (px - pos[0]);
        this.noise[3 * j + 1] += a * (py - pos[1]);
        this.noise[3 * j + 2] += a * (pz - pos[2]);
      }
    }

    for (let j = 0; j < this.positions.length / 3; j++) {
      this.positionTyped.array[3 * j] = this.positions[3 * j] + this.noise[3 * j];
      this.positionTyped.array[3 * j + 1] = this.positions[3 * j + 1] + this.noise[3 * j + 1];
      this.positionTyped.array[3 * j + 2] = this.positions[3 * j + 2] + this.noise[3 * j + 2];

      const nx = this.noise[3 * j];
      const ny = this.noise[3 * j + 1];
      const nz = this.noise[3 * j + 2];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      this.normalTyped.array[3 * j] = this.normals[3 * j] + (this.noise[3 * j] / len) * 2.3;
      this.normalTyped.array[3 * j + 1] = this.normals[3 * j + 1] + (this.noise[3 * j + 1] / len) * 2.3;
      this.normalTyped.array[3 * j + 2] = this.normals[3 * j + 2] + (this.noise[3 * j + 2] / len) * 2.3;
    }

    this.positionTyped.needsUpdate = true;
    this.normalTyped.needsUpdate = true;
    this.computeVertexNormals();
    this.computeBoundingSphere();
    this.noise.fill(0);
  }
}

export default function MetaballCore() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.offsetWidth || window.innerWidth;
    const h = container.offsetHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(1.6, window.devicePixelRatio));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x0a140f, 1);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    camera.position.set(0, 0, 10);

    // Fog
    scene.fog = new THREE.Fog(0x0a140f, 10, 30);

    // Material
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x1a3a2e,
      emissive: 0x2d6a4f,
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.1,
    });
    (material as any).uniforms = {};

    // Floor
    const floorGeom = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.3, color: 0x0f1f18 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.6;
    floor.receiveShadow = true;
    scene.add(floor);

    // Metaballs
    const count = window.innerWidth < 768 ? 2 : 3;
    const radius = 1.3;
    const bounds = [0, 0, 0];
    const metaBalls: THREE.Object3D[] = [];
    const groupBalls = new THREE.Group();
    scene.add(groupBalls);

    for (let i = 0; i < count; i++) {
      const newBall = new THREE.Object3D();
      newBall.name = 'ball_' + i;
      const angle = Math.PI * 2 * (i / count);
      newBall.position.x = Math.cos(angle) * 0.8;
      newBall.position.y = Math.sin(angle * 2.3) * 0.2;
      newBall.position.z = Math.sin(angle) * 0.8;
      const transforms = {
        scale: [0.3 + Math.random() * 0.1, 0.4 + Math.random() * 0.1, 0.3 + Math.random() * 0.1],
        speed: 0.5 + Math.random() * 0.5,
        position: [newBall.position.x, newBall.position.y, newBall.position.z],
      };
      const geom = new MetaballGeometry(radius, 1, [transforms], bounds, new Float32Array(3 * 3 * 40000));
      const mesh = new THREE.Mesh(geom as unknown as THREE.BufferGeometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      newBall.add(mesh);
      metaBalls.push(newBall);
      groupBalls.add(newBall);
    }

    // Lights
    const light1 = new THREE.DirectionalLight(0x74c69d, 1);
    light1.position.set(2, 4, 3);
    light1.castShadow = true;
    light1.shadow.mapSize.width = 1024;
    light1.shadow.mapSize.height = 1024;
    light1.shadow.camera.near = 0.1;
    light1.shadow.camera.far = 20;
    light1.shadow.camera.left = -5;
    light1.shadow.camera.right = 5;
    light1.shadow.camera.top = 5;
    light1.shadow.camera.bottom = -5;
    light1.shadow.bias = -0.001;
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x2d6a4f, 0.8);
    light2.position.set(-3, 3, -2);
    scene.add(light2);

    const light3 = new THREE.DirectionalLight(0x1a3a2e, 0.5);
    light3.position.set(0, -2, 4);
    scene.add(light3);

    // Ambient light
    const ambient = new THREE.AmbientLight(0x74c69d, 0.15);
    scene.add(ambient);

    // Particles
    const particleCount = window.innerWidth < 768 ? 50 : 100;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    particleGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x74c69d,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.6,
      0.5,
      0.85
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // Animation
    let totalTime = 0;
    const speed = 0.5;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const dt = 0.016;
      totalTime += dt * speed;

      // Floor pulse
      floorMat.opacity = 0.3 + Math.sin(totalTime * 0.5) * 0.1;

      // Particles rise
      const posAttr = particleGeom.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i);
        y += dt * 0.02;
        if (y > 7.5) y = -7.5;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Group rotation
      groupBalls.rotation.y = totalTime * 0.15;

      // Update metaballs
      metaBalls.forEach(ball => {
        ball.children.forEach(child => {
          if ((child as THREE.Mesh).geometry) {
            (((child as THREE.Mesh).geometry as unknown) as MetaballGeometry).update(totalTime * 0.8);
          }
        });
      });

      composer.render();
    };

    animate();

    // Resize
    const handleResize = () => {
      const nw = container.offsetWidth || window.innerWidth;
      const nh = container.offsetHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      composer.setSize(nw, nh);
      bloomPass.resolution.set(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      composer.dispose();
      material.dispose();
      floorGeom.dispose();
      floorMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
