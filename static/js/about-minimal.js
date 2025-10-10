// ===================================
// ABOUT PAGE - MINIMAL INTERACTIONS
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ===================================
  // 3D TILT EFFECT
  // ===================================
  
  const tiltElements = document.querySelectorAll('[data-tilt]');
  
  tiltElements.forEach(element => {
    element.addEventListener('mousemove', handleTilt);
    element.addEventListener('mouseleave', resetTilt);
  });
  
  function handleTilt(e) {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  }
  
  function resetTilt(e) {
    const element = e.currentTarget;
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }
  
  // ===================================
  // SMOOTH SCROLL ANIMATIONS
  // ===================================
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animatedElements = document.querySelectorAll('.interactive-card, .profile-image-minimal, .profile-text-minimal');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
  
  // ===================================
  // FLOATING ORBS MOUSE INTERACTION
  // ===================================
  
  const orbs = document.querySelectorAll('.floating-orb');
  const heroSection = document.querySelector('.about-hero-minimal');
  
  // DISABLED - About page orb animations disabled for performance
  console.log('About page orb animations disabled for performance');
  
  // ===================================
  // INTERACTIVE CARDS HOVER EFFECTS
  // ===================================
  
  const interactiveCards = document.querySelectorAll('.interactive-card');
  
  interactiveCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      // Add ripple effect
      createRipple(card, index);
    });
  });
  
  function createRipple(element, index) {
    const ripple = document.createElement('div');
    ripple.className = 'card-ripple';
    
    const colors = ['#6366f1', '#f59e0b', '#10b981'];
    
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: ${colors[index] || colors[0]};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.3;
      pointer-events: none;
      animation: rippleExpand 0.6s ease-out;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }
  
  // ===================================
  // SKILL TAGS STAGGER ANIMATION
  // ===================================
  
  const skillTags = document.querySelectorAll('.skill-tag-minimal');
  
  skillTags.forEach((tag, index) => {
    tag.style.opacity = '0';
    tag.style.transform = 'translateY(20px)';
    tag.style.transition = `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`;
    
    // Trigger animation when skills section is visible
    const skillsContainer = tag.parentElement;
    observer.observe(skillsContainer);
    
    // Add individual hover effects
    tag.addEventListener('mouseenter', () => {
      tag.style.transform = 'translateY(-4px) scale(1.05)';
    });
    
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Animate skill tags when container is visible
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.skill-tag-minimal');
        tags.forEach(tag => {
          tag.style.opacity = '1';
          tag.style.transform = 'translateY(0)';
        });
      }
    });
  }, observerOptions);
  
  const skillsContainer = document.querySelector('.skills-minimal');
  if (skillsContainer) {
    skillsObserver.observe(skillsContainer);
  }
  
  // ===================================
  // SOCIAL LINKS ANIMATION
  // ===================================
  
  const socialLinks = document.querySelectorAll('.social-link-minimal');
  
  socialLinks.forEach((link, index) => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-4px) rotate(5deg) scale(1.1)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translateY(0) rotate(0deg) scale(1)';
    });
    
    // Stagger animation
    link.style.opacity = '0';
    link.style.transform = 'translateY(20px)';
    link.style.transition = `all 0.4s ease ${index * 0.1 + 0.5}s`;
    
    setTimeout(() => {
      link.style.opacity = '1';
      link.style.transform = 'translateY(0)';
    }, (index * 100) + 1000);
  });
  
  // ===================================
  // BUTTON HOVER EFFECTS
  // ===================================
  
  const buttons = document.querySelectorAll('.btn-minimal');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // ===================================
  // PERFORMANCE OPTIMIZATION
  // ===================================
  
  // Throttle mouse move events
  let ticking = false;
  
  function throttle(func, delay) {
    if (!ticking) {
      func();
      ticking = true;
      setTimeout(() => {
        ticking = false;
      }, delay);
    }
  }
  
  // Apply throttling to mouse move events
  const throttledMouseMove = (e) => {
    throttle(() => {
      // Handle throttled mouse movements for performance
      const orbs = document.querySelectorAll('.floating-orb');
      const heroSection = document.querySelector('.about-hero-minimal');
      
      if (heroSection && orbs.length > 0) {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        orbs.forEach((orb, index) => {
          const speed = (index + 1) * 0.3;
          const offsetX = (x - 0.5) * 20 * speed;
          const offsetY = (y - 0.5) * 20 * speed;
          
          orb.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
      }
    }, 16); // ~60fps
  };
  
  // ===================================
  // ADD DYNAMIC STYLES
  // ===================================
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleExpand {
      to {
        width: 200px;
        height: 200px;
        opacity: 0;
      }
    }
    
    .card-ripple {
      z-index: 0;
    }
    
    .interactive-card > * {
      position: relative;
      z-index: 1;
    }
    
    .floating-orb {
      transition: transform 0.3s ease;
    }
    
    .social-link-minimal:hover {
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
    }
    
    .btn-primary-minimal:hover {
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }
  `;
  document.head.appendChild(style);
  
  // ===================================
  // 3D INTERACTIVE ELEMENT CONTROLS
  // ===================================
  
  const controlBtns = document.querySelectorAll('.control-btn');
  const cubeSystem = document.querySelector('.rotating-cube-system');
  const mainCube = document.querySelector('.main-cube');
  let isRotating = true;
  let isPaused = false;
  
  controlBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.getAttribute('data-action');
      
      // Add click animation
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        btn.style.transform = '';
      }, 150);
      
      switch(action) {
        case 'rotate':
          if (cubeSystem) {
            cubeSystem.style.animationPlayState = isRotating ? 'paused' : 'running';
            isRotating = !isRotating;
            showControlFeedback('Rotation ' + (isRotating ? 'Started' : 'Paused'));
          }
          break;
          
        case 'pause':
          if (cubeSystem) {
            cubeSystem.style.animationPlayState = isPaused ? 'running' : 'paused';
            isPaused = !isPaused;
            showControlFeedback(isPaused ? 'Animation Paused' : 'Animation Resumed');
          }
          break;
          
        case 'reset':
          if (cubeSystem) {
            cubeSystem.style.animation = 'none';
            setTimeout(() => {
              cubeSystem.style.animation = 'systemRotate 20s infinite linear';
            }, 10);
            showControlFeedback('Animation Reset');
          }
          break;
      }
    });
  });
  
  function showControlFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'control-feedback';
    feedback.textContent = message;
    
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      z-index: 1000;
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.3s ease;
      border: 1px solid rgba(99, 102, 241, 0.3);
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateX(100px)';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 2500);
  }
  
  // ===================================
  // MAIN CUBE INTERACTION
  // ===================================
  
  if (mainCube) {
    mainCube.addEventListener('click', () => {
      // Add click effect
      mainCube.style.transform = 'translate(-50%, -50%) scale(0.9)';
      
      setTimeout(() => {
        mainCube.style.transform = 'translate(-50%, -50%) scale(1.1)';
      }, 150);
      
      setTimeout(() => {
        mainCube.style.transform = '';
      }, 300);
      
      // Create explosion effect
      createCubeExplosion();
    });
    
    mainCube.addEventListener('mouseenter', () => {
      mainCube.style.animationPlayState = 'paused';
    });
    
    mainCube.addEventListener('mouseleave', () => {
      mainCube.style.animationPlayState = 'running';
    });
  }
  
  function createCubeExplosion() {
    const explosion = document.createElement('div');
    explosion.className = 'cube-explosion';
    
    explosion.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border: 2px solid var(--primary-color);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.8;
      pointer-events: none;
      animation: explosionExpand 0.6s ease-out forwards;
    `;
    
    if (mainCube) {
      mainCube.appendChild(explosion);
      
      setTimeout(() => {
        if (explosion.parentNode) {
          explosion.parentNode.removeChild(explosion);
        }
      }, 600);
    }
  }
  
  // ===================================
  // STATS ANIMATION
  // ===================================
  
  const statCards = document.querySelectorAll('.stat-card-enhanced');
  const progressBars = document.querySelectorAll('.progress-bar');
  
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate progress bars
        const progressBar = entry.target.querySelector('.progress-bar');
        if (progressBar) {
          const width = progressBar.getAttribute('data-width');
          setTimeout(() => {
            progressBar.style.width = width + '%';
          }, 300);
        }
        
        // Animate numbers
        const numberElement = entry.target.querySelector('.stat-number-enhanced');
        if (numberElement) {
          animateNumber(numberElement);
        }
      }
    });
  }, { threshold: 0.5 });
  
  statCards.forEach(card => {
    statsObserver.observe(card);
  });
  
  // Initialize progress bars animation on page load
  progressBars.forEach((bar, index) => {
    bar.style.opacity = '0';
    bar.style.transform = 'scaleX(0)';
    bar.style.transformOrigin = 'left';
    bar.style.transition = `all 0.8s ease ${index * 0.2}s`;
  });
  
  function animateNumber(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const hasPercent = text.includes('%');
    const number = parseInt(text.replace(/\D/g, ''));
    
    let current = 0;
    const increment = number / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= number) {
        element.textContent = number + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
      }
    }, 30);
  }
  
  // ===================================
  // ENHANCED SKILL TAGS
  // ===================================
  
  const skillTagsEnhanced = document.querySelectorAll('.skill-tag-enhanced');
  
  skillTagsEnhanced.forEach((tag, index) => {
    tag.style.opacity = '0';
    tag.style.transform = 'translateY(20px)';
    tag.style.transition = `all 0.4s ease ${index * 0.1}s`;
    
    setTimeout(() => {
      tag.style.opacity = '1';
      tag.style.transform = 'translateY(0)';
    }, 500 + (index * 100));
    
    tag.addEventListener('mouseenter', () => {
      tag.style.transform = 'translateY(-5px) scale(1.05) rotate(2deg)';
    });
    
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = 'translateY(0) scale(1) rotate(0deg)';
    });
  });
  
  // ===================================
  // ENHANCED SOCIAL LINKS
  // ===================================
  
  const socialLinksEnhanced = document.querySelectorAll('.social-link-enhanced');
  
  socialLinksEnhanced.forEach((link, index) => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-8px) scale(1.15) rotate(5deg)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translateY(0) scale(1) rotate(0deg)';
    });
    
    // Stagger animation
    link.style.opacity = '0';
    link.style.transform = 'translateY(30px)';
    link.style.transition = `all 0.5s ease ${index * 0.15}s`;
    
    setTimeout(() => {
      link.style.opacity = '1';
      link.style.transform = 'translateY(0)';
    }, 800 + (index * 150));
  });
  
  // ===================================
  // ENHANCED BUTTONS
  // ===================================
  
  const buttonsEnhanced = document.querySelectorAll('.btn-enhanced');
  
  buttonsEnhanced.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-4px) scale(1.02)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) scale(1)';
    });
    
    button.addEventListener('click', () => {
      button.style.transform = 'scale(0.98)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    });
  });
  
  // ===================================
  // ADD ENHANCED DYNAMIC STYLES
  // ===================================
  
  const enhancedStyle = document.createElement('style');
  enhancedStyle.textContent = `
    @keyframes explosionExpand {
      to {
        width: 200px;
        height: 200px;
        opacity: 0;
      }
    }
    
    .rotating-cube-system:hover {
      animation-play-state: paused;
    }
    
    .cube-face:hover {
      background: linear-gradient(135deg, var(--accent-color), var(--primary-light));
      transform: scale(1.1);
    }
    
    .orbit-dot {
      animation: dotPulse 2s infinite ease-in-out;
    }
    
    @keyframes dotPulse {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.5); opacity: 1; }
    }
    
    .particle-3d:hover {
      animation-play-state: paused;
      transform: scale(2);
      opacity: 1;
    }
    
    .btn-primary-enhanced:hover .btn-arrow {
      animation: arrowBounce 0.6s ease-in-out infinite;
    }
    
    @keyframes arrowBounce {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(8px); }
    }
  `;
  document.head.appendChild(enhancedStyle);
  
  // ===================================
  // ENHANCED ABOUT SECTIONS INTERACTIONS
  // ===================================
  
  const aboutSections = document.querySelectorAll('.about-section');
  const displayScreensAbout = document.querySelectorAll('.display-screen-about');
  const indicatorsAbout = document.querySelectorAll('.indicator-about');
  const controlButtonsAbout = document.querySelectorAll('.control-button-about');
  let currentSection = 0;
  const sections = ['personal', 'skills', 'philosophy'];
  
  // About section interactions
  aboutSections.forEach((section, index) => {
    section.addEventListener('click', () => {
      switchAboutSection(index);
    });
    
    section.addEventListener('mouseenter', () => {
      if (!section.classList.contains('active')) {
        section.style.transform = 'translateX(5px)';
        section.style.borderColor = 'var(--primary-color)';
      }
    });
    
    section.addEventListener('mouseleave', () => {
      if (!section.classList.contains('active')) {
        section.style.transform = '';
        section.style.borderColor = '';
      }
    });
  });
  
  // Control button interactions
  controlButtonsAbout.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      
      if (action === 'prev') {
        currentSection = (currentSection - 1 + sections.length) % sections.length;
      } else if (action === 'next') {
        currentSection = (currentSection + 1) % sections.length;
      }
      
      switchAboutSection(currentSection);
    });
  });
  
  // Indicator interactions
  indicatorsAbout.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      switchAboutSection(index);
    });
  });
  
  function switchAboutSection(index) {
    currentSection = index;
    const sectionName = sections[index];
    
    // Update about sections
    aboutSections.forEach((section, i) => {
      if (i === index) {
        section.classList.add('active');
        section.style.transform = 'translateX(10px)';
      } else {
        section.classList.remove('active');
        section.style.transform = '';
      }
    });
    
    // Update display screens
    displayScreensAbout.forEach(screen => {
      const screenSection = screen.getAttribute('data-display');
      if (screenSection === sectionName) {
        screen.classList.add('active');
        screen.style.opacity = '1';
        screen.style.transform = 'translateZ(0) rotateY(0deg)';
      } else {
        screen.classList.remove('active');
        screen.style.opacity = '0';
        screen.style.transform = 'translateZ(-100px) rotateY(45deg)';
      }
    });
    
    // Update indicators
    indicatorsAbout.forEach((indicator, i) => {
      if (i === index) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
    
    // Animate skill bars if skills section
    if (sectionName === 'skills') {
      animateSkillBars();
    }
    
    // Show feedback
    showSectionSwitchFeedback(sectionName);
  }
  
  function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    skillBars.forEach((bar, index) => {
      const width = bar.style.width;
      bar.style.setProperty('--bar-width', width);
      
      setTimeout(() => {
        bar.style.setProperty('--animation-delay', `${index * 0.2}s`);
        bar.classList.add('animate-bar');
      }, 300);
    });
  }
  
  function showSectionSwitchFeedback(sectionName) {
    const feedback = document.createElement('div');
    feedback.className = 'section-switch-feedback';
    feedback.textContent = `Viewing ${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`;
    
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      z-index: 1000;
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.3s ease;
      border: 1px solid rgba(99, 102, 241, 0.3);
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateX(100px)';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 2000);
  }
  
  // ===================================
  // FLOATING SKILL ICONS INTERACTIONS
  // ===================================
  
  const skillIcons = document.querySelectorAll('.skill-icon');
  
  skillIcons.forEach((icon, index) => {
    icon.addEventListener('mouseenter', () => {
      icon.style.animationPlayState = 'paused';
      
      // Show skill tooltip
      const skillName = icon.getAttribute('data-skill');
      showSkillTooltip(icon, skillName);
    });
    
    icon.addEventListener('mouseleave', () => {
      icon.style.animationPlayState = 'running';
      
      // Hide tooltip
      const tooltip = document.querySelector('.skill-tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
    
    icon.addEventListener('click', () => {
      // Create skill ripple effect
      createSkillRipple(icon, index);
    });
  });
  
  function showSkillTooltip(icon, skillName) {
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    tooltip.textContent = skillName.charAt(0).toUpperCase() + skillName.slice(1);
    
    tooltip.style.cssText = `
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      z-index: 10;
      opacity: 0;
      animation: tooltipFadeIn 0.3s ease forwards;
    `;
    
    icon.appendChild(tooltip);
  }
  
  function createSkillRipple(icon, index) {
    const ripple = document.createElement('div');
    ripple.className = 'skill-ripple';
    
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#8b5cf6'];
    
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: ${colors[index] || colors[0]};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.6;
      pointer-events: none;
      animation: skillRippleExpand 0.8s ease-out;
      z-index: 0;
    `;
    
    icon.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 800);
  }
  
  // ===================================
  // 3D DISPLAY INTERACTIONS
  // ===================================
  
  const aboutDisplayContainer = document.querySelector('.about-3d-display');
  
  if (aboutDisplayContainer) {
    aboutDisplayContainer.addEventListener('mousemove', (e) => {
      const rect = aboutDisplayContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const rotateY = (x - 0.5) * 15;
      const rotateX = (y - 0.5) * -15;
      
      aboutDisplayContainer.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    aboutDisplayContainer.addEventListener('mouseleave', () => {
      aboutDisplayContainer.style.transform = '';
    });
  }
  
  // ===================================
  // AUTO-ROTATE SECTIONS
  // ===================================
  
  let autoRotateAboutInterval;
  
  function startAutoRotateAbout() {
    autoRotateAboutInterval = setInterval(() => {
      currentSection = (currentSection + 1) % sections.length;
      switchAboutSection(currentSection);
    }, 6000);
  }
  
  function stopAutoRotateAbout() {
    if (autoRotateAboutInterval) {
      clearInterval(autoRotateAboutInterval);
    }
  }
  
  // Start auto-rotate
  startAutoRotateAbout();
  
  // Stop auto-rotate on user interaction
  const interactiveAboutElements = document.querySelectorAll('.about-section, .control-button-about, .indicator-about');
  interactiveAboutElements.forEach(element => {
    element.addEventListener('click', () => {
      stopAutoRotateAbout();
      // Restart after 10 seconds of inactivity
      setTimeout(startAutoRotateAbout, 10000);
    });
  });
  
  // ===================================
  // KEYBOARD NAVIGATION FOR ABOUT
  // ===================================
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentSection = (currentSection - 1 + sections.length) % sections.length;
      switchAboutSection(currentSection);
      stopAutoRotateAbout();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentSection = (currentSection + 1) % sections.length;
      switchAboutSection(currentSection);
      stopAutoRotateAbout();
    }
  });
  
  // ===================================
  // ADD ENHANCED DYNAMIC STYLES
  // ===================================
  
  const aboutEnhancedStyle = document.createElement('style');
  aboutEnhancedStyle.textContent = `
    @keyframes tooltipFadeIn {
      to {
        opacity: 1;
      }
    }
    
    @keyframes skillRippleExpand {
      to {
        width: 100px;
        height: 100px;
        opacity: 0;
      }
    }
    
    .skill-bar.animate-bar::after {
      width: var(--bar-width);
      animation-delay: var(--animation-delay);
    }
    
    .about-section.active {
      background: rgba(99, 102, 241, 0.08);
    }
    
    .display-screen-about {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .control-button-about:active {
      transform: scale(0.95);
    }
    
    .indicator-about:active {
      transform: scale(0.9);
    }
    
    .about-3d-display:hover {
      transform-style: preserve-3d;
    }
    
    .skill-icon {
      z-index: 5;
    }
    
    .skill-icon:hover {
      z-index: 10;
    }
    
    .avatar-core {
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
    }
    
    .info-line:hover {
      background: var(--primary-color);
      color: white;
      transform: translateX(5px);
    }
  `;
  document.head.appendChild(aboutEnhancedStyle);
  
  console.log('✨ About page enhanced with advanced 3D interactions initialized!');
  
  // ===================================
  // FINAL ENHANCEMENTS
  // ===================================
  
  // Page load animation
  window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
    
    // Animate elements on page load
    const elementsToAnimate = document.querySelectorAll('.about-hero-minimal, .about-content-enhanced, .stats-enhanced, .cta-enhanced');
    elementsToAnimate.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = `all 0.8s ease ${index * 0.2}s`;
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100 + (index * 200));
    });
  });
  
  // Enhanced scroll behavior
  let lastScrollY = window.scrollY;
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
    
    // Add scroll direction class to body
    document.body.classList.toggle('scrolling-down', scrollDirection === 'down');
    document.body.classList.toggle('scrolling-up', scrollDirection === 'up');
    
    lastScrollY = currentScrollY;
  });
  
  // Enhanced keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Add visual feedback for keyboard navigation
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
    
    // Enhanced section navigation
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      currentSection = (currentSection - 1 + sections.length) % sections.length;
      switchAboutSection(currentSection);
      stopAutoRotateAbout();
      showNavigationFeedback('Previous Section');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      currentSection = (currentSection + 1) % sections.length;
      switchAboutSection(currentSection);
      stopAutoRotateAbout();
      showNavigationFeedback('Next Section');
    } else if (e.key === 'Enter' || e.key === ' ') {
      const focusedElement = document.activeElement;
      if (focusedElement.classList.contains('about-section')) {
        e.preventDefault();
        focusedElement.click();
      }
    }
  });
  
  // Remove keyboard navigation class on mouse use
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
  
  function showNavigationFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'navigation-feedback';
    feedback.textContent = message;
    
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      z-index: 1000;
      opacity: 0;
      scale: 0.8;
      transition: all 0.3s ease;
      border: 1px solid rgba(99, 102, 241, 0.3);
      backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.scale = '1';
    }, 10);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.scale = '0.8';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 1500);
  }
  
  // Enhanced touch support for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  
  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Horizontal swipe detection
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - previous section
        currentSection = (currentSection - 1 + sections.length) % sections.length;
        switchAboutSection(currentSection);
        stopAutoRotateAbout();
        showNavigationFeedback('Previous Section');
      } else {
        // Swipe left - next section
        currentSection = (currentSection + 1) % sections.length;
        switchAboutSection(currentSection);
        stopAutoRotateAbout();
        showNavigationFeedback('Next Section');
      }
    }
  });
  
  // Enhanced error handling
  window.addEventListener('error', (e) => {
    console.warn('About page error handled:', e.error);
  });
  
  // Performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log(`About page loaded in ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
        }
      }, 0);
    });
  }
  
  // Cleanup function for better memory management
  window.addEventListener('beforeunload', () => {
    // Clear intervals
    if (autoRotateAboutInterval) {
      clearInterval(autoRotateAboutInterval);
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', arguments.callee);
    document.removeEventListener('touchstart', arguments.callee);
    document.removeEventListener('touchend', arguments.callee);
  });
  
  console.log('🚀 About page fully enhanced and optimized!');});
