// ===================================
// PORTFOLIO PAGE - MINIMAL INTERACTIONS
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ===================================
  // 3D FLOATING CUBES INTERACTION
  // ===================================
  
  const cubes = document.querySelectorAll('.floating-cube');
  const heroSection = document.querySelector('.portfolio-hero-minimal');
  
  // DISABLED - Portfolio cube animations disabled for performance
  console.log('Portfolio cube animations disabled for performance');
  
  // ===================================
  // PROJECT CARDS INTERACTIONS
  // ===================================
  
  const projectCards = document.querySelectorAll('.project-card-minimal');
  
  projectCards.forEach((card, index) => {
    // Add hover tilt effect
    card.addEventListener('mousemove', handleCardTilt);
    card.addEventListener('mouseleave', resetCardTilt);
    
    // Add click interaction
    card.addEventListener('click', () => {
      handleProjectClick(card, index);
    });
    
    // Stagger animation on load
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.2}s`;
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + (index * 200));
  });
  
  function handleCardTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }
  
  function resetCardTilt(e) {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }
  
  function handleProjectClick(card, index) {
    // Add click animation
    card.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      card.style.transform = '';
    }, 150);
    
    // Create ripple effect
    createProjectRipple(card, index);
    
    // Show project details (could expand to modal)
    showProjectFeedback(card, index);
  }
  
  function createProjectRipple(card, index) {
    const ripple = document.createElement('div');
    ripple.className = 'project-ripple';
    
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
      animation: projectRipple 0.8s ease-out;
      z-index: 0;
    `;
    
    card.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 800);
  }
  
  function showProjectFeedback(card, index) {
    const projectNames = ['Portfolio Website', 'Analytics Dashboard', 'E-Commerce Platform'];
    const feedback = document.createElement('div');
    feedback.className = 'project-feedback';
    feedback.textContent = `Viewing ${projectNames[index] || 'Project'}`;
    
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
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
  // CATEGORY CARDS INTERACTIONS
  // ===================================
  
  const categoryCards = document.querySelectorAll('.category-card-minimal');
  
  categoryCards.forEach((card, index) => {
    // Add hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-12px) scale(1.02)';
      
      // Animate icon
      const icon = card.querySelector('.category-icon-minimal');
      if (icon) {
        icon.style.transform = 'scale(1.1) rotate(5deg)';
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      
      // Reset icon
      const icon = card.querySelector('.category-icon-minimal');
      if (icon) {
        icon.style.transform = '';
      }
    });
    
    // Stagger animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.15}s`;
  });
  
  // ===================================
  // SCROLL ANIMATIONS
  // ===================================
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('category-card-minimal')) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        } else {
          entry.target.classList.add('animate-in');
        }
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animatedElements = document.querySelectorAll('.category-card-minimal, .projects-header-minimal, .categories-header-minimal, .cta-content-minimal');
  animatedElements.forEach(el => {
    observer.observe(el);
  });
  
  // ===================================
  // CONNECTING LINES ANIMATION
  // ===================================
  
  const linePaths = document.querySelectorAll('.line-path');
  
  linePaths.forEach((path, index) => {
    path.style.strokeDasharray = '4, 8';
    path.style.strokeDashoffset = '0';
    path.style.animation = `dashMove 10s linear infinite`;
    path.style.animationDelay = `${index * 2}s`;
  });
  
  // ===================================
  // TECH TAGS HOVER EFFECTS
  // ===================================
  
  const techTags = document.querySelectorAll('.tech-tag-minimal');
  
  techTags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      tag.style.transform = 'translateY(-2px) scale(1.05)';
      tag.style.borderColor = 'var(--primary-color)';
      tag.style.color = 'var(--primary-color)';
    });
    
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = '';
      tag.style.borderColor = '';
      tag.style.color = '';
    });
  });
  
  // ===================================
  // PROJECT LINKS INTERACTIONS
  // ===================================
  
  const projectLinks = document.querySelectorAll('.project-link-minimal');
  
  projectLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-2px) scale(1.02)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = '';
    });
    
    link.addEventListener('click', (e) => {
      // Add click animation
      link.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        link.style.transform = '';
      }, 150);
    });
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
      button.style.transform = '';
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
  
  // ===================================
  // ADD DYNAMIC STYLES
  // ===================================
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes projectRipple {
      to {
        width: 300px;
        height: 300px;
        opacity: 0;
      }
    }
    
    @keyframes dashMove {
      to {
        stroke-dashoffset: -24;
      }
    }
    
    .animate-in {
      opacity: 1;
      transform: translateY(0);
      transition: all 0.6s ease;
    }
    
    .project-card-minimal {
      position: relative;
      overflow: hidden;
    }
    
    .project-card-minimal > * {
      position: relative;
      z-index: 1;
    }
    
    .floating-cube {
      transition: transform 0.3s ease;
    }
    
    .category-icon-minimal {
      transition: all 0.3s ease;
    }
    
    .btn-primary-minimal:hover {
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }
    
    .project-link-primary:hover {
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }
  `;
  document.head.appendChild(style);
  
  // ===================================
  // ENHANCED PROJECT SHOWCASE INTERACTIONS
  // ===================================
  
  const projectItems = document.querySelectorAll('.project-item-enhanced');
  const displayScreens = document.querySelectorAll('.display-screen');
  const indicators = document.querySelectorAll('.indicator');
  const controlButtons = document.querySelectorAll('.control-button');
  let currentProject = 0;
  const projectElements = document.querySelectorAll('.project-item-enhanced');
  const projects = Array.from(projectElements).map(el => el.getAttribute('data-project'));
  
  // Project item interactions
  projectItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      switchProject(index);
    });
    
    item.addEventListener('mouseenter', () => {
      if (!item.classList.contains('active')) {
        item.style.transform = 'translateX(5px)';
        item.style.borderColor = 'var(--primary-color)';
      }
    });
    
    item.addEventListener('mouseleave', () => {
      if (!item.classList.contains('active')) {
        item.style.transform = '';
        item.style.borderColor = '';
      }
    });
  });
  
  // Control button interactions
  controlButtons.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      
      if (action === 'prev') {
        currentProject = (currentProject - 1 + projects.length) % projects.length;
      } else if (action === 'next') {
        currentProject = (currentProject + 1) % projects.length;
      }
      
      switchProject(currentProject);
    });
  });
  
  // Indicator interactions
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      switchProject(index);
    });
  });
  
  function switchProject(index) {
    currentProject = index;
    const projectName = projects[index];
    
    // Update project items
    projectItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
        item.style.transform = 'translateX(10px)';
      } else {
        item.classList.remove('active');
        item.style.transform = '';
      }
    });
    
    // Update display screens
    displayScreens.forEach(screen => {
      const screenProject = screen.getAttribute('data-project-display');
      if (screenProject === projectName) {
        screen.style.opacity = '1';
        screen.style.transform = 'translateZ(0) rotateY(0deg)';
      } else {
        screen.style.opacity = '0';
        screen.style.transform = 'translateZ(-100px) rotateY(45deg)';
      }
    });
    
    // Update indicators
    indicators.forEach((indicator, i) => {
      if (i === index) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
    
    // Show feedback
    showProjectSwitchFeedback(projectName);
  }
  
  function showProjectSwitchFeedback(projectName) {
    const feedback = document.createElement('div');
    feedback.className = 'project-switch-feedback';
    feedback.textContent = `Viewing ${projectName.charAt(0).toUpperCase() + projectName.slice(1)}`;
    
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
  // FLOATING TECH ICONS INTERACTIONS
  // ===================================
  
  const techIcons = document.querySelectorAll('.tech-icon');
  
  techIcons.forEach((icon, index) => {
    icon.addEventListener('mouseenter', () => {
      icon.style.animationPlayState = 'paused';
      icon.style.transform = 'scale(1.2)';
      icon.style.background = 'var(--primary-color)';
      icon.style.color = 'white';
      
      // Show tech name
      const techName = icon.getAttribute('data-tech');
      showTechTooltip(icon, techName);
    });
    
    icon.addEventListener('mouseleave', () => {
      icon.style.animationPlayState = 'running';
      icon.style.transform = '';
      icon.style.background = '';
      icon.style.color = '';
      
      // Hide tooltip
      const tooltip = document.querySelector('.tech-tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  });
  
  function showTechTooltip(icon, techName) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tech-tooltip';
    tooltip.textContent = techName.charAt(0).toUpperCase() + techName.slice(1);
    
    tooltip.style.cssText = `
      position: absolute;
      bottom: -35px;
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
  
  // ===================================
  // 3D DISPLAY SCREEN INTERACTIONS
  // ===================================
  
  const displayContainer = document.querySelector('.project-3d-display');
  
  if (displayContainer) {
    displayContainer.addEventListener('mousemove', (e) => {
      const rect = displayContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const rotateY = (x - 0.5) * 10;
      const rotateX = (y - 0.5) * -10;
      
      displayContainer.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    displayContainer.addEventListener('mouseleave', () => {
      displayContainer.style.transform = '';
    });
  }
  
  // ===================================
  // AUTO-ROTATE PROJECTS
  // ===================================
  
  let autoRotateInterval;
  
  function startAutoRotate() {
    autoRotateInterval = setInterval(() => {
      currentProject = (currentProject + 1) % projects.length;
      switchProject(currentProject);
    }, 5000);
  }
  
  function stopAutoRotate() {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval);
    }
  }
  
  // Start auto-rotate
  startAutoRotate();
  
  // Stop auto-rotate on user interaction
  const interactiveElements = document.querySelectorAll('.project-item-enhanced, .control-button, .indicator');
  interactiveElements.forEach(element => {
    element.addEventListener('click', () => {
      stopAutoRotate();
      // Restart after 10 seconds of inactivity
      setTimeout(startAutoRotate, 10000);
    });
  });
  
  // ===================================
  // ENHANCED TECH TAGS
  // ===================================
  
  const techTagsEnhanced = document.querySelectorAll('.tech-tag-enhanced');
  
  techTagsEnhanced.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      tag.style.transform = 'translateY(-3px) scale(1.05) rotate(2deg)';
      tag.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
    });
    
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = '';
      tag.style.boxShadow = '';
    });
  });
  
  // ===================================
  // ENHANCED PROJECT LINKS
  // ===================================
  
  const projectLinksEnhanced = document.querySelectorAll('.project-link-enhanced');
  
  projectLinksEnhanced.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = '';
    });
    
    link.addEventListener('click', (e) => {
      // Add click animation
      link.style.transform = 'scale(0.98)';
      setTimeout(() => {
        link.style.transform = '';
      }, 150);
    });
  });
  
  // ===================================
  // KEYBOARD NAVIGATION
  // ===================================
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      currentProject = (currentProject - 1 + projects.length) % projects.length;
      switchProject(currentProject);
      stopAutoRotate();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      currentProject = (currentProject + 1) % projects.length;
      switchProject(currentProject);
      stopAutoRotate();
    }
  });
  
  // ===================================
  // ADD ENHANCED DYNAMIC STYLES
  // ===================================
  
  const enhancedStyle = document.createElement('style');
  enhancedStyle.textContent = `
    @keyframes tooltipFadeIn {
      to {
        opacity: 1;
      }
    }
    
    .tech-icon {
      pointer-events: auto;
      cursor: pointer;
    }
    
    .project-item-enhanced.active {
      background: rgba(99, 102, 241, 0.1);
    }
    
    .display-screen {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .control-button:active {
      transform: scale(0.95);
    }
    
    .indicator:active {
      transform: scale(0.9);
    }
    
    .project-3d-display:hover {
      transform-style: preserve-3d;
    }
    
    .floating-tech-icons .tech-icon:hover {
      z-index: 10;
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }
  `;
  document.head.appendChild(enhancedStyle);
  
  console.log('🎨 Portfolio page enhanced with 3D interactions initialized!');
});