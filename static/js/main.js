// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Three.js global variables
let scene, camera, renderer, stars, spaceShip;
let animationFrameId;

// Initialize Three.js scene
function initThreeJS() {
    // Check if we're on the home page and if the container exists
    const container = document.getElementById('three-container');
    if (!container) return;

    // Create scene, camera and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true
    });

    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Position camera
    camera.position.z = 5;

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Animation loop
    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        // Rotate stars slowly
        if (stars) {
            stars.rotation.y += 0.0005;
            stars.rotation.x += 0.0002;
        }

        // Rotate spaceship if it exists
        if (spaceShip) {
            spaceShip.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }

    animate();
}

// Mobile navigation is handled by inline script in base.html
// Do NOT add duplicate handlers here — causes double-toggle bug




// Legacy navigation support
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    initThreeJS();
    if (typeof initNavigation === 'function') initNavigation();

    // Only initialize other functions if they're defined
    if (typeof initAnimations === 'function') initAnimations();
    if (typeof initThemeToggle === 'function') initThemeToggle();
    if (typeof initScrollAnimations === 'function') initScrollAnimations();
    if (typeof initInteractiveElements === 'function') initInteractiveElements();
    if (typeof initParallaxEffects === 'function') initParallaxEffects();
    if (typeof init3DLogo === 'function') init3DLogo();

    // Initialize portfolio page elements if on portfolio page
    if (window.location.pathname.includes('portfolio')) {
        initPortfolioPage();
    }

    // Skills page now has a dedicated modern initializer in templates/skills.html.
    // Keep legacy init disabled to avoid duplicate canvases and conflicting animations.
});

// Mouse parallax for 3D scene and hero elements
const hero = document.querySelector('.hero-section');
const heroImage = document.querySelector('.hero-image-side');
const modelContainer = document.getElementById('model-container');

if (hero && heroImage) {
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;   // -0.5..0.5
        const dy = (e.clientY - cy) / rect.height;  // -0.5..0.5

        // Move hero image with parallax effect
        gsap.to(heroImage, { duration: 0.6, x: dx * -20, y: dy * -20, ease: 'power2.out' });

        // If we have a 3D scene, rotate it slightly based on mouse position
        if (spaceShip) {
            gsap.to(spaceShip.rotation, { duration: 0.8, y: dx * 0.2, x: -dy * 0.2, ease: 'power2.out' });
        }

        // Move particles with parallax effect
        document.querySelectorAll('.particle').forEach((particle, i) => {
            const factor = (i % 3 + 1) * 5;
            gsap.to(particle, { duration: 0.8, x: dx * factor, y: dy * factor, ease: 'power2.out' });
        });
    });
}

// Initialize Skills Page
function initSkillsPage() {
    console.log('Initializing Skills Page');
    initSkillsVisualization();
    initSkillsSpaceScene();
    animateSkillsOnScroll();
}

// Initialize 3D Skills Visualization
function initSkillsVisualization() {
    const container = document.getElementById('skills-3d-container');
    if (!container) return;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create skill sphere
    const skillSphere = createSkillSphere();
    scene.add(skillSphere);

    // Position camera
    camera.position.z = 5;

    // Add orbit controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate skill sphere
        skillSphere.rotation.y += 0.002;
        skillSphere.rotation.x += 0.001;

        controls.update();
        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Start animation
    animate();
}

// Create Skill Sphere with nodes
function createSkillSphere() {
    const group = new THREE.Group();

    // Define skill categories and their colors
    const skillCategories = [
        { name: 'Frontend', color: 0x4a9bff, skills: ['HTML', 'CSS', 'JavaScript', 'React', 'GSAP', 'Three.js'] },
        { name: 'Backend', color: 0xff6b6b, skills: ['Python', 'Flask', 'MySQL', 'REST API', 'Node.js', 'MongoDB'] },
        { name: 'Tools', color: 0x7dd87d, skills: ['Git', 'VS Code', 'Docker', 'Figma', 'AWS', 'CI/CD'] }
    ];

    // Create sphere geometry for the base
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x111827,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const baseSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(baseSphere);

    // Add skill nodes
    let nodeIndex = 0;
    skillCategories.forEach((category, categoryIndex) => {
        category.skills.forEach((skill, skillIndex) => {
            // Calculate position on sphere using fibonacci distribution
            const phi = Math.acos(-1 + (2 * nodeIndex) / (skillCategories.reduce((acc, cat) => acc + cat.skills.length, 0)));
            const theta = Math.sqrt(skillCategories.reduce((acc, cat) => acc + cat.skills.length, 0)) * Math.PI * phi;

            const x = 2 * Math.cos(theta) * Math.sin(phi);
            const y = 2 * Math.sin(theta) * Math.sin(phi);
            const z = 2 * Math.cos(phi);

            // Create node geometry
            const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            const nodeMaterial = new THREE.MeshPhongMaterial({ color: category.color });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);

            node.position.set(x, y, z);
            group.add(node);

            // Create connection line to center
            const lineMaterial = new THREE.LineBasicMaterial({
                color: category.color,
                transparent: true,
                opacity: 0.4
            });
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(x, y, z)
            ]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            group.add(line);

            nodeIndex++;
        });
    });

    return group;
}

// Initialize space scene for skills page
function initSkillsSpaceScene() {
    const canvas = document.getElementById('skills-space-scene');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Position camera
    camera.position.z = 5;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate stars slowly
        stars.rotation.y += 0.0005;
        stars.rotation.x += 0.0002;

        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start animation
    animate();
}

// Animate skills elements on scroll
function animateSkillsOnScroll() {
    // Animate skill bars
    gsap.utils.toArray('.skill').forEach((skill, i) => {
        const bar = skill.querySelector('.skill-bar span');

        gsap.from(bar, {
            width: 0,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: skill,
                start: 'top 90%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Animate timeline items
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.from(item, {
            x: -50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.2,
            scrollTrigger: {
                trigger: '.timeline-container',
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Animate 3D container
    gsap.from('#skills-3d-container', {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: '.visualization-container',
            start: 'top 70%',
            toggleActions: 'play none none none'
        }
    });

    // Animate legend items
    gsap.utils.toArray('.legend-item').forEach((item, i) => {
        gsap.from(item, {
            y: 20,
            opacity: 0,
            duration: 0.6,
            delay: 0.8 + (i * 0.2),
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.visualization-container',
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        });
    });
}

// Initialize loading screen
function initLoadingScreen() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';

    // Create stars container
    const starsContainer = document.createElement('div');
    starsContainer.className = 'loading-stars';

    // Add stars
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'loading-star';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }

    // Create orbit container
    const orbitContainer = document.createElement('div');
    orbitContainer.className = 'loading-orbit';

    // Create logo container
    const logoContainer = document.createElement('div');
    logoContainer.className = 'loading-logo';
    logoContainer.textContent = 'DY';

    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'Loading Experience';

    // Create loading bar container
    const loadingBarContainer = document.createElement('div');
    loadingBarContainer.className = 'loading-bar-container';

    // Create loading progress
    const loadingProgress = document.createElement('div');
    loadingProgress.className = 'loading-progress';

    // Create loading glow
    const loadingGlow = document.createElement('div');
    loadingGlow.className = 'loading-glow';

    // Create style sheet
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0f172a;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        
        .loading-stars {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        .loading-star {
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            animation: twinkle 3s infinite;
        }
        
        .loading-orbit {
            position: absolute;
            width: 150px;
            height: 150px;
            border: 1px solid rgba(74, 155, 255, 0.3);
            border-radius: 50%;
            animation: orbit-rotate 8s linear infinite;
            transform: translate(-50%, -50%);
        }
        
        .loading-logo {
            font-family: 'Orbitron', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: white;
            margin-bottom: 2rem;
            background: linear-gradient(135deg, #4a9bff, #00d4ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: pulse 2s infinite;
        }
        
        .loading-text {
            font-family: 'Space Mono', monospace;
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 1.5rem;
            letter-spacing: 0.1em;
        }
        
        .loading-bar-container {
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            position: relative;
        }
        
        .loading-progress {
            height: 100%;
            width: 0;
            background: linear-gradient(90deg, #4a9bff, #00d4ff);
            border-radius: 2px;
            position: relative;
            overflow: hidden;
        }
        
        .loading-glow {
            position: absolute;
            top: 0;
            left: -50%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
            animation: loading-glow 1.5s infinite;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
        }
        
        @keyframes loading-glow {
            0% { left: -50%; }
            100% { left: 150%; }
        }
        
        @keyframes orbit-rotate {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
    `;

    // Assemble elements
    document.head.appendChild(styleSheet);
    loadingProgress.appendChild(loadingGlow);
    loadingBarContainer.appendChild(loadingProgress);

    loadingOverlay.appendChild(starsContainer);
    loadingOverlay.appendChild(orbitContainer);
    loadingOverlay.appendChild(logoContainer);
    loadingOverlay.appendChild(loadingText);
    loadingOverlay.appendChild(loadingBarContainer);

    document.body.appendChild(loadingOverlay);

    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';

    // Animate loading progress
    gsap.to(loadingProgress, {
        duration: 2.5,
        width: '100%',
        ease: 'power2.inOut'
    });

    // Remove loading screen when page is fully loaded
    window.addEventListener('load', function () {
        setTimeout(() => {
            gsap.to(loadingOverlay, {
                duration: 0.8,
                opacity: 0,
                ease: 'power2.inOut',
                onComplete: () => {
                    loadingOverlay.remove();
                    document.body.style.overflow = '';
                }
            });
        }, 500);
    });
}
