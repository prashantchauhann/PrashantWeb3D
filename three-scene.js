/**
 * Prashant Singh Chauhan - Futuristic 3D WebGL Engine
 * Built with Three.js (Procedural Sci-Fi 3D Models & Interactive Canvas)
 */

class Futuristic3DScene {
    constructor() {
        this.container = document.getElementById('webgl-container');
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Model groups
        this.mainGroup = null;
        this.coreGroup = null;
        this.droneGroup = null;
        this.matrixGroup = null;
        this.particles = null;
        this.gridHelper = null;
        this.thrusterParticles = null;

        // Current active model ('core', 'drone', 'matrix')
        this.currentModelType = 'core';
        this.isWireframe = false;
        this.autoRotate = true;
        this.rotationSpeedMultiplier = 1;

        // Interaction state
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.isDragging = false;
        this.prevMousePosition = { x: 0, y: 0 };
        this.manualRotation = { x: 0.2, y: 0.4 };

        // Scroll state
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.init();
    }

    init() {
        // 1. Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050811, 0.022);

        // 2. Camera setup
        this.camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 9);

        // 3. Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('webgl-canvas'),
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.resizeRenderer();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.3;

        // 4. Lighting
        this.setupLights();

        // 5. Environment & Grid
        this.setupEnvironment();

        // 6. Build 3D Models
        this.mainGroup = new THREE.Group();
        this.scene.add(this.mainGroup);

        this.buildQuantumCore();
        this.buildCyberDrone();
        this.buildNeuralMatrix();

        // Default: display Quantum Core
        this.switchModel('core');

        // 7. Event listeners
        this.bindEvents();

        // 8. Animation loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupLights() {
        // Ambient soft cyan fill
        const ambientLight = new THREE.AmbientLight(0x0d2137, 1.8);
        this.scene.add(ambientLight);

        // Primary cyan key light
        this.keyLight = new THREE.DirectionalLight(0x00f0ff, 2.8);
        this.keyLight.position.set(6, 8, 7);
        this.scene.add(this.keyLight);

        // Secondary purple rim light for sci-fi contrast
        this.rimLight = new THREE.DirectionalLight(0x9d4edd, 2.5);
        this.rimLight.position.set(-8, -4, -4);
        this.scene.add(this.rimLight);

        // Glowing core point light (pulsates inside the core)
        this.coreLight = new THREE.PointLight(0x00f0ff, 3, 20);
        this.coreLight.position.set(0, 0, 0);
        this.scene.add(this.coreLight);
    }

    setupEnvironment() {
        // Futuristic Cyber Grid floor
        const size = 120;
        const divisions = 60;
        this.gridHelper = new THREE.GridHelper(size, divisions, 0x00f0ff, 0x152238);
        this.gridHelper.position.y = -4.5;
        this.gridHelper.material.opacity = 0.35;
        this.gridHelper.material.transparent = true;
        this.scene.add(this.gridHelper);

        // Starfield / Cosmic data particle constellation
        const particleCount = 1200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0x00f0ff);
        const color2 = new THREE.Color(0x7b2cbf);
        const color3 = new THREE.Color(0x00ffaa);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 80;
            positions[i3 + 1] = (Math.random() - 0.5) * 60;
            positions[i3 + 2] = (Math.random() - 0.5) * 80;

            const mixedColor = i % 3 === 0 ? color1 : (i % 3 === 1 ? color2 : color3);
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create glowing circular particle texture procedurally
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        const particleTexture = new THREE.CanvasTexture(canvas);

        const material = new THREE.PointsMaterial({
            size: 0.35,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            map: particleTexture,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    /* -------------------------------------------------------------
       MODEL 1: QUANTUM CYBER-CORE (Gyroscopic Reactor with Satellites)
       ------------------------------------------------------------- */
    buildQuantumCore() {
        this.coreGroup = new THREE.Group();

        // Materials
        const darkMetalMat = new THREE.MeshStandardMaterial({
            color: 0x111928,
            metalness: 0.9,
            roughness: 0.2,
            wireframe: false
        });

        const neonCyanMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.8,
            metalness: 0.5,
            roughness: 0.1,
            wireframe: false
        });

        const neonPurpleMat = new THREE.MeshStandardMaterial({
            color: 0x9d4edd,
            emissive: 0x7b2cbf,
            emissiveIntensity: 0.7,
            metalness: 0.5,
            roughness: 0.2
        });

        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.45
        });

        // 1. Central Pulsating Plasma Sphere
        const coreGeo = new THREE.IcosahedronGeometry(1.2, 4);
        this.plasmaSphere = new THREE.Mesh(coreGeo, neonCyanMat);
        this.coreGroup.add(this.plasmaSphere);

        // Outer wireframe cage around plasma sphere
        const cageGeo = new THREE.IcosahedronGeometry(1.4, 2);
        this.wireCage = new THREE.Mesh(cageGeo, wireframeMat);
        this.coreGroup.add(this.wireCage);

        // 2. Gyroscopic Gimbal Rings
        // Ring 1 (Inner tech ring)
        const ring1Geo = new THREE.TorusGeometry(1.9, 0.08, 16, 100);
        this.gimbalRing1 = new THREE.Mesh(ring1Geo, darkMetalMat);
        this.coreGroup.add(this.gimbalRing1);

        // Ring 1 nodes
        for (let i = 0; i < 6; i++) {
            const nodeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8);
            const node = new THREE.Mesh(nodeGeo, neonCyanMat);
            const angle = (i / 6) * Math.PI * 2;
            node.position.set(Math.cos(angle) * 1.9, Math.sin(angle) * 1.9, 0);
            node.rotation.z = angle + Math.PI / 2;
            this.gimbalRing1.add(node);
        }

        // Ring 2 (Middle ring)
        const ring2Geo = new THREE.TorusGeometry(2.4, 0.09, 16, 100);
        this.gimbalRing2 = new THREE.Mesh(ring2Geo, neonPurpleMat);
        this.gimbalRing2.rotation.x = Math.PI / 3;
        this.coreGroup.add(this.gimbalRing2);

        // Ring 3 (Outer thick structural ring with data conduits)
        const ring3Geo = new THREE.TorusGeometry(2.9, 0.11, 16, 100);
        this.gimbalRing3 = new THREE.Mesh(ring3Geo, darkMetalMat);
        this.gimbalRing3.rotation.y = Math.PI / 4;
        this.coreGroup.add(this.gimbalRing3);

        // 3. Orbital Satellites / Data Shards
        this.satelliteGroup = new THREE.Group();
        const satGeo = new THREE.OctahedronGeometry(0.28, 0);
        for (let i = 0; i < 4; i++) {
            const sat = new THREE.Mesh(satGeo, neonCyanMat);
            sat.position.set(
                Math.cos((i / 4) * Math.PI * 2) * 3.7,
                Math.sin(i * 1.5) * 1.2,
                Math.sin((i / 4) * Math.PI * 2) * 3.7
            );
            this.satelliteGroup.add(sat);
        }
        this.coreGroup.add(this.satelliteGroup);

        // 4. Energy Halo Rings
        const haloGeo = new THREE.RingGeometry(3.3, 3.45, 64);
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35
        });
        this.haloRing = new THREE.Mesh(haloGeo, haloMat);
        this.haloRing.rotation.x = Math.PI / 2;
        this.coreGroup.add(this.haloRing);

        this.mainGroup.add(this.coreGroup);
    }

    /* -------------------------------------------------------------
       MODEL 2: CYBER DRONE / RECON STARSHIP (Sci-Fi High-Tech Craft)
       ------------------------------------------------------------- */
    buildCyberDrone() {
        this.droneGroup = new THREE.Group();

        const chassisMat = new THREE.MeshStandardMaterial({
            color: 0x111c2e,
            metalness: 0.95,
            roughness: 0.18
        });

        const accentCyan = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.9,
            metalness: 0.6,
            roughness: 0.2
        });

        const visorGlass = new THREE.MeshStandardMaterial({
            color: 0x00e1ff,
            emissive: 0x0077aa,
            emissiveIntensity: 0.7,
            metalness: 0.8,
            roughness: 0.1,
            transparent: true,
            opacity: 0.85
        });

        // 1. Center Fuselage
        const bodyGeo = new THREE.ConeGeometry(0.85, 3.2, 5);
        const body = new THREE.Mesh(bodyGeo, chassisMat);
        body.rotation.x = Math.PI / 2;
        this.droneGroup.add(body);

        // Cockpit Sensor Dome
        const visorGeo = new THREE.SphereGeometry(0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const visor = new THREE.Mesh(visorGeo, visorGlass);
        visor.position.set(0, 0.35, 0.4);
        visor.rotation.x = -0.3;
        this.droneGroup.add(visor);

        // 2. Swept Cyber Wings (Left & Right)
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(2.4, -0.9);
        wingShape.lineTo(2.2, -1.6);
        wingShape.lineTo(0, -0.6);
        wingShape.closePath();

        const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);

        // Right Wing
        const rightWing = new THREE.Mesh(wingGeo, chassisMat);
        rightWing.position.set(0.3, 0.1, 0.2);
        rightWing.rotation.x = Math.PI / 2;
        this.droneGroup.add(rightWing);

        // Left Wing (mirrored)
        const leftWing = rightWing.clone();
        leftWing.scale.x = -1;
        leftWing.position.x = -0.3;
        this.droneGroup.add(leftWing);

        // Wing Edge Glow Strips
        const edgeStripGeo = new THREE.BoxGeometry(0.06, 0.06, 2.2);
        const rightStrip = new THREE.Mesh(edgeStripGeo, accentCyan);
        rightStrip.position.set(1.4, 0.1, -0.4);
        rightStrip.rotation.y = 0.55;
        this.droneGroup.add(rightStrip);

        const leftStrip = rightStrip.clone();
        leftStrip.position.x = -1.4;
        leftStrip.rotation.y = -0.55;
        this.droneGroup.add(leftStrip);

        // 3. Dual Ion Thrusters
        const thrusterGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.8, 16);
        const thrusterR = new THREE.Mesh(thrusterGeo, chassisMat);
        thrusterR.rotation.x = Math.PI / 2;
        thrusterR.position.set(0.6, -0.1, -1.5);
        this.droneGroup.add(thrusterR);

        const thrusterL = thrusterR.clone();
        thrusterL.position.x = -0.6;
        this.droneGroup.add(thrusterL);

        // Thruster exhaust glow cones
        const exhaustGeo = new THREE.ConeGeometry(0.28, 1.2, 16);
        const exhaustMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.85
        });
        const exhaustR = new THREE.Mesh(exhaustGeo, exhaustMat);
        exhaustR.position.set(0.6, -0.1, -2.1);
        exhaustR.rotation.x = -Math.PI / 2;
        this.droneGroup.add(exhaustR);

        const exhaustL = exhaustR.clone();
        exhaustL.position.x = -0.6;
        this.droneGroup.add(exhaustL);

        // 4. Rotating Scanner Radar Dish on Top
        const radarGeo = new THREE.CylinderGeometry(0.5, 0.45, 0.12, 16);
        this.droneRadar = new THREE.Mesh(radarGeo, accentCyan);
        this.droneRadar.position.set(0, 0.65, -0.3);
        this.droneGroup.add(this.droneRadar);

        // Stabilizer rings around drone
        const stabRingGeo = new THREE.TorusGeometry(1.6, 0.04, 8, 48);
        const stabRing = new THREE.Mesh(stabRingGeo, accentCyan);
        stabRing.rotation.x = Math.PI / 2;
        this.droneGroup.add(stabRing);

        this.droneGroup.scale.set(1.1, 1.1, 1.1);
        this.droneGroup.visible = false;
        this.mainGroup.add(this.droneGroup);
    }

    /* -------------------------------------------------------------
       MODEL 3: NEURAL TECH MATRIX (Interconnected Data Nexus)
       ------------------------------------------------------------- */
    buildNeuralMatrix() {
        this.matrixGroup = new THREE.Group();

        const nodeMat = new THREE.MeshStandardMaterial({
            color: 0x00ffaa,
            emissive: 0x00ffaa,
            emissiveIntensity: 0.8,
            metalness: 0.8,
            roughness: 0.2
        });

        const lineMat = new THREE.LineBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.6
        });

        // Generate 32 interconnected neural nodes
        const nodeCount = 30;
        this.matrixNodes = [];
        const nodeGeo = new THREE.DodecahedronGeometry(0.18, 0);

        const points = [];
        for (let i = 0; i < nodeCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / nodeCount);
            const theta = Math.sqrt(nodeCount * Math.PI) * phi;
            const radius = 2.4 + (Math.random() - 0.5) * 0.8;

            const x = radius * Math.cos(theta) * Math.sin(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(phi);

            const mesh = new THREE.Mesh(nodeGeo, nodeMat);
            mesh.position.set(x, y, z);
            this.matrixGroup.add(mesh);
            this.matrixNodes.push({
                mesh: mesh,
                basePos: new THREE.Vector3(x, y, z),
                speed: 0.5 + Math.random()
            });

            points.push(new THREE.Vector3(x, y, z));
        }

        // Connect nodes with futuristic line paths
        const lineGeo = new THREE.BufferGeometry();
        const linePositions = [];
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                if (points[i].distanceTo(points[j]) < 2.3) {
                    linePositions.push(points[i].x, points[i].y, points[i].z);
                    linePositions.push(points[j].x, points[j].y, points[j].z);
                }
            }
        }
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        this.matrixLines = new THREE.LineSegments(lineGeo, lineMat);
        this.matrixGroup.add(this.matrixLines);

        // Core neural crystal in center
        const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0x7b2cbf,
            emissive: 0x9d4edd,
            emissiveIntensity: 0.8,
            wireframe: true
        });
        this.neuralCrystal = new THREE.Mesh(crystalGeo, crystalMat);
        this.matrixGroup.add(this.neuralCrystal);

        this.matrixGroup.visible = false;
        this.mainGroup.add(this.matrixGroup);
    }

    /* -------------------------------------------------------------
       MODEL SWITCHER & HUD CONTROLS
       ------------------------------------------------------------- */
    switchModel(modelType) {
        this.currentModelType = modelType;

        if (this.coreGroup) this.coreGroup.visible = (modelType === 'core');
        if (this.droneGroup) this.droneGroup.visible = (modelType === 'drone');
        if (this.matrixGroup) this.matrixGroup.visible = (modelType === 'matrix');

        // Play subtle synthesizer click
        if (window.soundFX) {
            window.soundFX.playBeep(880, 0.08);
        }

        // Update HUD active buttons if present
        document.querySelectorAll('.model-btn').forEach(btn => {
            if (btn.dataset.model === modelType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Trigger brief pulse animation on camera or group
        this.mainGroup.scale.set(0.7, 0.7, 0.7);
        gsapFadeInScale(this.mainGroup);
    }

    toggleWireframe() {
        this.isWireframe = !this.isWireframe;
        this.scene.traverse((child) => {
            if (child.isMesh && child.material && child !== this.haloRing) {
                child.material.wireframe = this.isWireframe;
            }
        });

        if (window.soundFX) {
            window.soundFX.playBeep(620, 0.1);
        }

        const btn = document.getElementById('wireframe-toggle-btn');
        if (btn) {
            btn.classList.toggle('active', this.isWireframe);
            btn.setAttribute('aria-pressed', this.isWireframe ? 'true' : 'false');
        }
    }

    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        const btn = document.getElementById('autorotate-toggle-btn');
        if (btn) {
            btn.classList.toggle('active', this.autoRotate);
            btn.setAttribute('aria-pressed', this.autoRotate ? 'true' : 'false');
        }
    }

    cycleSpeed() {
        if (this.rotationSpeedMultiplier === 1) this.rotationSpeedMultiplier = 2;
        else if (this.rotationSpeedMultiplier === 2) this.rotationSpeedMultiplier = 3;
        else this.rotationSpeedMultiplier = 1;

        const btn = document.getElementById('speed-toggle-btn');
        if (btn) {
            btn.textContent = `${this.rotationSpeedMultiplier}X SPEED`;
        }
        if (window.soundFX) {
            window.soundFX.playBeep(440 * this.rotationSpeedMultiplier, 0.07);
        }
    }

    resetOrientation() {
        this.manualRotation.x = 0.2;
        this.manualRotation.y = 0.4;
        this.mainGroup.rotation.set(0.2, 0.4, 0);
        if (window.soundFX) {
            window.soundFX.playBeep(520, 0.08);
        }
    }

    /* -------------------------------------------------------------
       EVENTS & INTERACTION (Mouse, Touch, Scroll, Resize)
       ------------------------------------------------------------- */
    bindEvents() {
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Cursor parallax & model drag
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = (e.clientX - this.windowHalfX) / this.windowHalfX;
            this.mouse.targetY = (e.clientY - this.windowHalfY) / this.windowHalfY;

            if (this.isDragging) {
                const deltaX = e.clientX - this.prevMousePosition.x;
                const deltaY = e.clientY - this.prevMousePosition.y;

                this.manualRotation.y += deltaX * 0.008;
                this.manualRotation.x += deltaY * 0.008;

                this.prevMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        // Pointer down/up for drag interaction
        const canvasElement = this.renderer.domElement;
        canvasElement.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.prevMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointerup', () => {
            this.isDragging = false;
        });

        // Touch support
        canvasElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.prevMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }, { passive: true });

        canvasElement.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1) {
                const deltaX = e.touches[0].clientX - this.prevMousePosition.x;
                const deltaY = e.touches[0].clientY - this.prevMousePosition.y;

                this.manualRotation.y += deltaX * 0.01;
                this.manualRotation.x += deltaY * 0.01;

                this.prevMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // HUD Controls hookup
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const model = e.currentTarget.dataset.model;
                if (model) this.switchModel(model);
            });
        });

        const wireframeBtn = document.getElementById('wireframe-toggle-btn');
        if (wireframeBtn) wireframeBtn.addEventListener('click', () => this.toggleWireframe());

        const rotateBtn = document.getElementById('autorotate-toggle-btn');
        if (rotateBtn) rotateBtn.addEventListener('click', () => this.toggleAutoRotate());

        const speedBtn = document.getElementById('speed-toggle-btn');
        if (speedBtn) speedBtn.addEventListener('click', () => this.cycleSpeed());

        const resetBtn = document.getElementById('reset-view-btn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetOrientation());
    }

    onWindowResize() {
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.resizeRenderer();
    }

    resizeRenderer() {
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    /* -------------------------------------------------------------
       ANIMATION & RENDER LOOP
       ------------------------------------------------------------- */
    animate() {
        requestAnimationFrame(this.animate);

        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // 1. Mouse Lerp for smooth parallax
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

        // 2. Keep the model in the home hero viewport.
        // At top: Model positioned to the right of hero text on large screens
        const isMobile = window.innerWidth <= 768;
        const baseOffsetX = isMobile ? 0 : 2.5;

        // 3. Camera & Main Group Choreography
        this.camera.position.z = 8.8;
        this.camera.position.y = 0;
        this.camera.position.x = this.mouse.x * 0.6;
        this.camera.lookAt(0, 0, 0);

        // Keep the model clear of the hero copy and its controls.
        this.mainGroup.position.x = baseOffsetX;
        this.mainGroup.position.y = 0;

        // 4. Auto-rotation & manual drag inertia
        if (this.autoRotate) {
            const rotSpeed = delta * 0.35 * this.rotationSpeedMultiplier;
            this.manualRotation.y += rotSpeed;
        }

        // Apply smooth orientation to mainGroup
        this.mainGroup.rotation.x = this.manualRotation.x + (this.mouse.y * 0.25);
        this.mainGroup.rotation.y = this.manualRotation.y + (this.mouse.x * 0.35);

        // 5. Model Specific Sub-Animations
        if (this.currentModelType === 'core') {
            // Pulsate central plasma core
            const pulse = 1 + Math.sin(elapsedTime * 3.5) * 0.08;
            this.plasmaSphere.scale.set(pulse, pulse, pulse);
            this.wireCage.rotation.y -= delta * 0.4;
            this.wireCage.rotation.x += delta * 0.2;

            // Gyroscope counter-rotations
            this.gimbalRing1.rotation.z += delta * 0.9 * this.rotationSpeedMultiplier;
            this.gimbalRing2.rotation.x += delta * 0.7 * this.rotationSpeedMultiplier;
            this.gimbalRing3.rotation.y -= delta * 0.5 * this.rotationSpeedMultiplier;

            // Orbit satellites
            this.satelliteGroup.rotation.y += delta * 1.2 * this.rotationSpeedMultiplier;
            this.haloRing.rotation.z += delta * 0.2;

            // Pulsate core light
            this.coreLight.intensity = 2.4 + Math.sin(elapsedTime * 4.0) * 1.2;
        }
        else if (this.currentModelType === 'drone') {
            // Hover bobbing effect
            this.droneGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.15;
            this.droneGroup.rotation.z = Math.sin(elapsedTime * 1.8) * 0.08;

            // Spin radar
            this.droneRadar.rotation.y += delta * 4.0;
        }
        else if (this.currentModelType === 'matrix') {
            // Rotate neural crystal
            this.neuralCrystal.rotation.x += delta * 0.5;
            this.neuralCrystal.rotation.y += delta * 0.8;

            // Float matrix nodes gently
            for (let i = 0; i < this.matrixNodes.length; i++) {
                const node = this.matrixNodes[i];
                const offset = Math.sin(elapsedTime * node.speed + i) * 0.08;
                node.mesh.position.y = node.basePos.y + offset;
            }
        }

        // 6. Infinite Cyber Grid Animation (glides forward)
        this.gridHelper.position.z = (elapsedTime * 1.8) % 2;

        // 7. Background Cosmic Particles drift
        if (this.particles) {
            this.particles.rotation.y = elapsedTime * 0.03;
            this.particles.rotation.x = elapsedTime * 0.015;
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Helper: Smooth scale pop transition
function gsapFadeInScale(target) {
    let progress = 0;
    const initialScale = 0.6;
    const finalScale = 1.0;
    const startTime = performance.now();
    const duration = 400; // ms

    function step(now) {
        const elapsed = now - startTime;
        progress = Math.min(elapsed / duration, 1);
        // Elastic/back ease out
        const ease = 1 + 2.70158 * Math.pow(progress - 1, 3) + 1.70158 * Math.pow(progress - 1, 2);
        const current = initialScale + (finalScale - initialScale) * ease;
        target.scale.set(current, current, current);

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

// Global initialization on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.futuristicScene = new Futuristic3DScene();
});
