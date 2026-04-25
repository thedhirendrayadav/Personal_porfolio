/**
 * 3D Solar System Skills Visualization - Realistic & Optimized
 * Features:
 * - Realistic lighting and shadows
 * - High-quality planet materials with atmosphere effects
 * - Holographic skill labels (Icons replacement)
 * - Dynamic starfield background
 * - Smooth camera controls
 */

document.addEventListener('DOMContentLoaded', function () {
    // Wait for fonts or other assets if needed, but usually DOMContentLoaded is enough
    initRealisticSolarSystem();
});

function initRealisticSolarSystem() {
    const container = document.getElementById('skills-3d-container');
    if (!container) return;

    container.innerHTML = ''; // Clear

    // --- Configuration ---
    const CONFIG = {
        sunSize: 15,
        speedFactor: 0.2, // Slower, more majestic
        ambientLight: 0.1,
        sunIntensity: 2.0,
        orbitOpacity: 0.15
    };

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.0015); // Deep space fog

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 100, 400);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Controls ---
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 50;
        controls.maxDistance = 800;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
    }

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x404040, CONFIG.ambientLight); // Soft white light
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffaa00, CONFIG.sunIntensity, 1000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // --- Sun ---
    const sunGeometry = new THREE.SphereGeometry(CONFIG.sunSize, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Sun Glow (Sprite)
    const textureLoader = new THREE.TextureLoader();
    const glowTexture = createGlowTexture();
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffaa00,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.8
    }));
    sunGlow.scale.set(CONFIG.sunSize * 8, CONFIG.sunSize * 8, 1);
    scene.add(sunGlow);

    // --- Skills Data ---
    const SKILLS = [
        { name: "HTML5", color: "#E34F26", size: 4, distance: 40, speed: 0.015, type: 'rocky' },
        { name: "CSS3", color: "#1572B6", size: 4.2, distance: 60, speed: 0.012, type: 'gas' },
        { name: "JS", color: "#F7DF1E", size: 4.5, distance: 85, speed: 0.010, type: 'rocky' },
        { name: "React", color: "#61DAFB", size: 5, distance: 110, speed: 0.008, type: 'gas', ring: true },
        { name: "Python", color: "#3776AB", size: 4.8, distance: 140, speed: 0.006, type: 'rocky' },
        { name: "Flask", color: "#FFFFFF", size: 4, distance: 165, speed: 0.005, type: 'ice' },
        { name: "MySQL", color: "#4479A1", size: 4.6, distance: 190, speed: 0.004, type: 'gas' },
        { name: "Git", color: "#F05032", size: 3.8, distance: 220, speed: 0.003, type: 'rocky' },
        { name: "Docker", color: "#2496ED", size: 5.2, distance: 250, speed: 0.0025, type: 'gas', ring: true },
        { name: "Figma", color: "#F24E1E", size: 4, distance: 280, speed: 0.002, type: 'rocky' },
        { name: "VS Code", color: "#007ACC", size: 4.5, distance: 310, speed: 0.0015, type: 'ice' }
    ];

    const planets = [];

    SKILLS.forEach(skill => {
        const planetGroup = new THREE.Group();
        scene.add(planetGroup);

        // Orbit Path
        const orbitGeo = new THREE.RingGeometry(skill.distance - 0.2, skill.distance + 0.2, 128);
        const orbitMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: CONFIG.orbitOpacity
        });
        const orbit = new THREE.Mesh(orbitGeo, orbitMat);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);

        // Planet Mesh
        const geometry = new THREE.SphereGeometry(skill.size, 32, 32);
        let material;

        if (skill.type === 'gas') {
            material = new THREE.MeshStandardMaterial({
                color: skill.color,
                roughness: 0.4,
                metalness: 0.1,
                flatShading: false
            });
        } else if (skill.type === 'ice') {
            material = new THREE.MeshStandardMaterial({
                color: skill.color,
                roughness: 0.2,
                metalness: 0.8,
                emissive: skill.color,
                emissiveIntensity: 0.2
            });
        } else { // rocky
            material = new THREE.MeshStandardMaterial({
                color: skill.color,
                roughness: 0.8,
                metalness: 0.0
            });
        }

        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = skill.distance;
        planet.castShadow = true;
        planet.receiveShadow = true;
        planetGroup.add(planet);

        // Atmosphere Glow
        const atmosphereGeo = new THREE.SphereGeometry(skill.size * 1.2, 32, 32);
        const atmosphereMat = new THREE.MeshBasicMaterial({
            color: skill.color,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        planet.add(atmosphere);

        // Ring?
        if (skill.ring) {
            const ringGeo = new THREE.RingGeometry(skill.size * 1.4, skill.size * 2.2, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: skill.color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.4
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.2;
            planet.add(ring);
        }

        // Holographic Label
        const labelSprite = createLabelSprite(skill.name, skill.color);
        labelSprite.position.set(0, skill.size + 8, 0);
        planet.add(labelSprite);

        planets.push({
            mesh: planet,
            group: planetGroup,
            speed: skill.speed,
            angle: Math.random() * Math.PI * 2,
            distance: skill.distance
        });
    });

    // --- Starfield ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
        starPos[i] = (Math.random() - 0.5) * 1500;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Animation ---
    function animate() {
        requestAnimationFrame(animate);

        planets.forEach(p => {
            p.angle += p.speed * CONFIG.speedFactor;
            p.group.rotation.y = p.angle;
            p.mesh.rotation.y += 0.01;
            // Keep label facing camera? Sprite does this automatically.
        });

        // Pulse Sun
        const scale = CONFIG.sunSize * 8 + Math.sin(Date.now() * 0.001) * 2;
        sunGlow.scale.set(scale, scale, 1);

        if (controls) controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // --- Resize ---
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Helper: Create Glow Texture
function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 200, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}

// Helper: Create Label Sprite
function createLabelSprite(text, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = 256;
    const h = 128;
    canvas.width = w;
    canvas.height = h;

    // Background (Holographic Panel)
    ctx.fillStyle = 'rgba(0, 10, 30, 0.6)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;

    // Rounded Rect
    const r = 20;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.font = 'bold 60px "Arial", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillText(text, w / 2, h / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(20, 10, 1);
    return sprite;
}
