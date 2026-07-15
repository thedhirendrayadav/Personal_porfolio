/**
 * Skills Universe
 * Responsive Three.js orbital visualization for the skills page.
 */
(function () {
  'use strict';

  const SKILLS = [
    { name: 'HTML5', color: '#E34F26', size: 3.8, distance: 42, speed: 0.016, type: 'rocky' },
    { name: 'CSS3', color: '#1572B6', size: 4.0, distance: 60, speed: 0.013, type: 'gas' },
    { name: 'JavaScript', color: '#F7DF1E', size: 4.2, distance: 82, speed: 0.010, type: 'rocky' },
    { name: 'React', color: '#61DAFB', size: 4.6, distance: 104, speed: 0.008, type: 'gas', ring: true },
    { name: 'Python', color: '#3776AB', size: 4.4, distance: 128, speed: 0.0065, type: 'rocky' },
    { name: 'Flask', color: '#D9DEE7', size: 3.8, distance: 150, speed: 0.0055, type: 'ice' },
    { name: 'MySQL', color: '#4479A1', size: 4.4, distance: 174, speed: 0.0048, type: 'gas' },
    { name: 'Git', color: '#F05032', size: 3.6, distance: 196, speed: 0.0042, type: 'rocky' },
    { name: 'Docker', color: '#2496ED', size: 4.8, distance: 220, speed: 0.0035, type: 'gas', ring: true },
    { name: 'VS Code', color: '#007ACC', size: 4.1, distance: 244, speed: 0.003, type: 'ice' }
  ];

  let resizeTimer = null;

  function isMobileViewport() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function initUniverse() {
    const container = document.getElementById('skills-3d-container');
    if (!container || typeof THREE === 'undefined') return;

    container.innerHTML = '';

    const mobile = isMobileViewport();
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, mobile ? 340 : 420);
    const maxOrbitRadius = Math.max(90, Math.min(width, height) * (mobile ? 0.36 : 0.42));
    const maxSkillDistance = SKILLS[SKILLS.length - 1].distance;
    const distanceScale = maxOrbitRadius / maxSkillDistance;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07152b, mobile ? 0.0015 : 0.0012);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, mobile ? 62 : 95, mobile ? 240 : 340);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = mobile ? 120 : 160;
      controls.maxDistance = mobile ? 420 : 620;
      controls.autoRotate = true;
      controls.autoRotateSpeed = mobile ? 0.35 : 0.5;
    }

    scene.add(new THREE.AmbientLight(0x4e74c4, 0.18));
    const sunLight = new THREE.PointLight(0xffb34d, 2, 900);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(mobile ? 10 : 12, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xffcd52 })
    );
    scene.add(sun);

    const sunGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture(),
        color: 0xffaf38,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.78
      })
    );
    sunGlow.scale.set(mobile ? 68 : 86, mobile ? 68 : 86, 1);
    scene.add(sunGlow);

    const planets = [];

    SKILLS.forEach(function (skill) {
      const orbitRadius = Math.max(28, skill.distance * distanceScale);
      const orbit = new THREE.Mesh(
        new THREE.RingGeometry(orbitRadius - 0.16, orbitRadius + 0.16, 96),
        new THREE.MeshBasicMaterial({
          color: 0x8bb6ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: mobile ? 0.12 : 0.16
        })
      );
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      const group = new THREE.Group();
      scene.add(group);

      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(2.8, skill.size * (mobile ? 0.86 : 1)), 28, 28),
        createPlanetMaterial(skill)
      );
      planet.position.x = orbitRadius;
      planet.castShadow = true;
      planet.receiveShadow = true;
      group.add(planet);

      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(planet.geometry.parameters.radius * 1.16, 24, 24),
        new THREE.MeshBasicMaterial({
          color: skill.color,
          transparent: true,
          opacity: 0.18,
          side: THREE.BackSide
        })
      );
      planet.add(atmosphere);

      if (skill.ring) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(planet.geometry.parameters.radius * 1.45, planet.geometry.parameters.radius * 2.2, 56),
          new THREE.MeshBasicMaterial({
            color: skill.color,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
          })
        );
        ring.rotation.x = Math.PI / 2.3;
        planet.add(ring);
      }

      const label = createLabelSprite(skill.name, skill.color, mobile);
      label.position.set(0, planet.geometry.parameters.radius + (mobile ? 5.8 : 7.2), 0);
      planet.add(label);

      planets.push({
        group: group,
        planet: planet,
        speed: skill.speed,
        angle: Math.random() * Math.PI * 2
      });
    });

    scene.add(createStarField(mobile ? 1300 : 2200));

    let frameId = 0;
    const speedFactor = mobile ? 0.15 : 0.2;

    function animate() {
      frameId = window.requestAnimationFrame(animate);
      planets.forEach(function (entry) {
        entry.angle += entry.speed * speedFactor;
        entry.group.rotation.y = entry.angle;
        entry.planet.rotation.y += 0.012;
      });

      const pulse = 1 + Math.sin(Date.now() * 0.0014) * 0.04;
      sunGlow.scale.set((mobile ? 68 : 86) * pulse, (mobile ? 68 : 86) * pulse, 1);

      if (controls) controls.update();
      renderer.render(scene, camera);
    }

    animate();

    const onResize = function () {
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, isMobileViewport() ? 340 : 420);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    window.addEventListener('resize', onResize, { passive: true });

    container.__skillsUniverseCleanup = function () {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      if (controls && typeof controls.dispose === 'function') controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }

  function createPlanetMaterial(skill) {
    if (skill.type === 'gas') {
      return new THREE.MeshStandardMaterial({
        color: skill.color,
        roughness: 0.42,
        metalness: 0.1
      });
    }

    if (skill.type === 'ice') {
      return new THREE.MeshStandardMaterial({
        color: skill.color,
        roughness: 0.22,
        metalness: 0.78,
        emissive: skill.color,
        emissiveIntensity: 0.12
      });
    }

    return new THREE.MeshStandardMaterial({
      color: skill.color,
      roughness: 0.78,
      metalness: 0.02
    });
  }

  function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,184,58,0.7)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 96, 96);
    return new THREE.CanvasTexture(canvas);
  }

  function createLabelSprite(text, color, mobile) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontSize = mobile ? 18 : 22;
    const fontWeight = 700;
    const fontFamily = 'Inter, Arial, sans-serif';

    ctx.font = fontWeight + ' ' + fontSize + 'px ' + fontFamily;
    const textWidth = Math.ceil(ctx.measureText(text).width);
    const paddingX = mobile ? 22 : 26;
    const paddingY = mobile ? 12 : 14;

    canvas.width = textWidth + paddingX * 2;
    canvas.height = fontSize + paddingY * 2;

    const w = canvas.width;
    const h = canvas.height;
    const radius = 10;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(5, 18, 42, 0.72)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    roundRect(ctx, 1, 1, w - 2, h - 2, radius, true, true);

    ctx.font = fontWeight + ' ' + fontSize + 'px ' + fontFamily;
    ctx.fillStyle = '#ecf4ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillText(text, w / 2, h / 2 + 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      })
    );

    const baseWidth = mobile ? 14 : 18;
    const ratio = h / w;
    sprite.scale.set(baseWidth, baseWidth * ratio, 1);
    return sprite;
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function createStarField(count) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < positions.length; i += 1) {
      positions[i] = (Math.random() - 0.5) * 1400;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xbfd9ff,
        size: 1.25,
        transparent: true,
        opacity: 0.72
      })
    );
  }

  function boot() {
    const container = document.getElementById('skills-3d-container');
    if (!container) return;

    if (typeof container.__skillsUniverseCleanup === 'function') {
      container.__skillsUniverseCleanup();
    }
    initUniverse();
  }

  function init() {
    boot();
    window.addEventListener('resize', function () {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(boot, 220);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
