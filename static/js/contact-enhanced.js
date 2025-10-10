// ===================================
// CONTACT PAGE - ENHANCED INTERACTIONS
// ===================================

document.addEventListener('DOMContentLoaded', function () {

  // ===================================
  // FORM HANDLING
  // ===================================

  const contactForm = document.getElementById('contactFormEnhanced');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.querySelector('.submit-btn-enhanced');
  const inputs = document.querySelectorAll('.input-enhanced');

  // Enhanced form submission
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmission);
  } else {
    // Fallback for old form ID
    const fallbackForm = document.getElementById('contactForm');
    if (fallbackForm) {
      fallbackForm.addEventListener('submit', handleFormSubmission);
    }
  }

  function handleFormSubmission(e) {
    e.preventDefault();

    // Show loading state
    showLoadingState();

    // Get form data
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('subject', document.getElementById('subject').value);
    formData.append('message', document.getElementById('message').value);
    
    // Add CSRF token
    const csrfToken = document.querySelector('input[name="csrf_token"]').value;
    formData.append('csrf_token', csrfToken);

    // Send form data to backend
    fetch('/contact', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Reset loading state
      resetLoadingState();

      if (data.success) {
        // Show success message
        showFormStatus('success', data.message);

        // Reset form
        contactForm.reset();

        // Reset input focus lines
        document.querySelectorAll('.input-focus-line').forEach(line => {
          line.style.width = '0';
        });
      } else {
        // Show error message
        showFormStatus('error', data.message || 'Something went wrong. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      
      // Reset loading state
      resetLoadingState();
      
      // Show error message
      showFormStatus('error', 'Network error. Please check your connection and try again.');
    });
  }

  function showLoadingState() {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.querySelector('.btn-text').textContent = 'Sending...';
    submitBtn.querySelector('.btn-icon').style.animation = 'spin 1s linear infinite';
  }

  function resetLoadingState() {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.querySelector('.btn-text').textContent = 'Send Message';
    submitBtn.querySelector('.btn-icon').style.animation = '';
  }

  function showFormStatus(type, message) {
    formStatus.className = `form-status ${type}`;
    formStatus.textContent = message;

    // Hide after 5 seconds
    setTimeout(() => {
      formStatus.style.opacity = '0';
      formStatus.style.transform = 'translateY(10px)';
    }, 5000);
  }

  // ===================================
  // INPUT ENHANCEMENTS
  // ===================================

  inputs.forEach(input => {
    // Add floating label effect
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      if (!input.value) {
        input.parentElement.classList.remove('focused');
      }
    });

    // Add typing animation
    input.addEventListener('input', () => {
      if (input.value) {
        input.parentElement.classList.add('has-value');
      } else {
        input.parentElement.classList.remove('has-value');
      }
    });
  });

  // ===================================
  // 3D BACKGROUND INTERACTIONS
  // ===================================

  const heroSection = document.querySelector('.contact-hero-enhanced');
  const orbs = document.querySelectorAll('.floating-orb');
  const particles = document.querySelectorAll('.particle');

  // DISABLED - Contact page animations disabled for performance
  console.log('Contact page animations disabled for performance');

  // ===================================
  // CONTACT INFO INTERACTIONS
  // ===================================

  const infoItems = document.querySelectorAll('.info-item');
  const contactIcons = document.querySelectorAll('.contact-icon-float');

  // Info item interactions
  infoItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      infoItems.forEach(i => i.classList.remove('active'));

      // Add active class to clicked item
      item.classList.add('active');

      // Show interaction feedback
      const infoType = item.getAttribute('data-info');
      showContactFeedback(infoType);
    });

    // Stagger animation on load
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = `all 0.5s ease ${index * 0.1}s`;

    setTimeout(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 500 + (index * 100));
  });

  // Floating icon interactions
  contactIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const contactType = icon.getAttribute('data-contact');

      // Create ripple effect
      createIconRipple(icon);

      // Show tooltip
      showIconTooltip(icon, contactType);

      // Trigger corresponding info item
      const correspondingItem = document.querySelector(`[data-info="${contactType}"]`);
      if (correspondingItem) {
        correspondingItem.click();
      }
    });

    icon.addEventListener('mouseenter', () => {
      icon.style.animationPlayState = 'paused';
    });

    icon.addEventListener('mouseleave', () => {
      icon.style.animationPlayState = 'running';

      // Remove tooltip
      const tooltip = icon.querySelector('.icon-tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  });

  function createIconRipple(icon) {
    const ripple = document.createElement('div');
    ripple.className = 'icon-ripple';

    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(99, 102, 241, 0.5);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.8;
      pointer-events: none;
      animation: iconRippleExpand 0.6s ease-out;
      z-index: 0;
    `;

    icon.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  function showIconTooltip(icon, contactType) {
    const tooltip = document.createElement('div');
    tooltip.className = 'icon-tooltip';

    const tooltipText = {
      email: 'Send Email',
      phone: 'Call Me',
      location: 'My Location',
      social: 'Social Links'
    };

    tooltip.textContent = tooltipText[contactType] || 'Contact';

    tooltip.style.cssText = `
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
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

  function showContactFeedback(infoType) {
    const feedback = document.createElement('div');
    feedback.className = 'contact-feedback';

    const feedbackText = {
      email: 'Email Selected',
      phone: 'Phone Selected',
      location: 'Location Highlighted',
      time: 'Response Time Info'
    };

    feedback.textContent = feedbackText[infoType] || 'Contact Info Selected';

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
  // SOCIAL LINKS ENHANCEMENTS
  // ===================================

  const socialLinks = document.querySelectorAll('.social-link-enhanced');

  socialLinks.forEach((link, index) => {
    // Add hover sound effect (visual feedback)
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-5px) scale(1.05)';

      // Add platform-specific glow
      const platform = link.getAttribute('data-platform');
      addPlatformGlow(link, platform);
    });

    link.addEventListener('mouseleave', () => {
      link.style.transform = '';
      removePlatformGlow(link);
    });

    // Stagger animation on load
    link.style.opacity = '0';
    link.style.transform = 'translateY(20px)';
    link.style.transition = `all 0.5s ease ${index * 0.15}s`;

    setTimeout(() => {
      link.style.opacity = '1';
      link.style.transform = 'translateY(0)';
    }, 800 + (index * 150));

    // Click analytics (placeholder)
    link.addEventListener('click', () => {
      const platform = link.getAttribute('data-platform');
      console.log(`Social link clicked: ${platform}`);

      // Add click animation
      link.style.transform = 'scale(0.95)';
      setTimeout(() => {
        link.style.transform = '';
      }, 150);
    });
  });

  function addPlatformGlow(link, platform) {
    const glowColors = {
      GitHub: 'rgba(51, 51, 51, 0.5)',
      LinkedIn: 'rgba(0, 119, 181, 0.5)',
      Instagram: 'rgba(228, 64, 95, 0.5)',
      Email: 'rgba(99, 102, 241, 0.5)'
    };

    const color = glowColors[platform] || 'rgba(99, 102, 241, 0.5)';
    link.style.boxShadow = `0 10px 30px ${color}`;
  }

  function removePlatformGlow(link) {
    link.style.boxShadow = '';
  }

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
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';

        // Special handling for form elements
        if (entry.target.classList.contains('form-container-enhanced')) {
          animateFormElements();
        }

        // Special handling for 3D showcase
        if (entry.target.classList.contains('contact-3d-showcase')) {
          animate3DShowcase();
        }
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll('.form-container-enhanced, .contact-3d-showcase, .social-section-enhanced');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  function animateFormElements() {
    const formGroups = document.querySelectorAll('.form-group-enhanced');
    formGroups.forEach((group, index) => {
      group.style.opacity = '0';
      group.style.transform = 'translateX(-20px)';
      group.style.transition = `all 0.4s ease ${index * 0.1}s`;

      setTimeout(() => {
        group.style.opacity = '1';
        group.style.transform = 'translateX(0)';
      }, 300 + (index * 100));
    });
  }

  function animate3DShowcase() {
    const showcase = document.querySelector('.contact-display-screen');
    if (showcase) {
      showcase.style.transform = 'perspective(1000px) rotateY(15deg)';

      setTimeout(() => {
        showcase.style.transform = '';
      }, 1000);
    }
  }

  // ===================================
  // KEYBOARD NAVIGATION
  // ===================================

  document.addEventListener('keydown', (e) => {
    // Add visual feedback for keyboard navigation
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }

    // Enhanced form navigation
    if (e.key === 'Enter' && e.target.classList.contains('input-enhanced')) {
      const inputs = Array.from(document.querySelectorAll('.input-enhanced'));
      const currentIndex = inputs.indexOf(e.target);
      const nextInput = inputs[currentIndex + 1];

      if (nextInput) {
        e.preventDefault();
        nextInput.focus();
      }
    }
  });

  // Remove keyboard navigation class on mouse use
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });

  // ===================================
  // PERFORMANCE OPTIMIZATIONS
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
      const heroSection = document.querySelector('.contact-hero-enhanced');
      const orbs = document.querySelectorAll('.floating-orb');

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
  // PAGE LOAD ANIMATIONS
  // ===================================

  window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');

    // Animate hero elements
    const heroElements = document.querySelectorAll('.intro-badge, .hero-title-enhanced, .hero-description-enhanced, .hero-stats');
    heroElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = `all 0.8s ease ${index * 0.2}s`;

      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100 + (index * 200));
    });

    // Animate stat items
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
      item.style.transition = `all 0.6s ease ${index * 0.1 + 0.5}s`;

      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      }, 600 + (index * 100));
    });
  });

  // ===================================
  // ENHANCED ERROR HANDLING
  // ===================================

  window.addEventListener('error', (e) => {
    console.warn('Contact page error handled:', e.error);
  });

  // Form validation enhancements
  function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    const errors = [];

    if (name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!isValidEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    if (subject.length < 5) {
      errors.push('Subject must be at least 5 characters long');
    }

    if (message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }

    return errors;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Real-time validation
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateField(input);
    });
  });

  function validateField(input) {
    const value = input.value.trim();
    const fieldName = input.getAttribute('name');
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'name':
        if (value.length < 2) {
          isValid = false;
          errorMessage = 'Name must be at least 2 characters long';
        }
        break;
      case 'email':
        if (!isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'subject':
        if (value.length < 5) {
          isValid = false;
          errorMessage = 'Subject must be at least 5 characters long';
        }
        break;
      case 'message':
        if (value.length < 10) {
          isValid = false;
          errorMessage = 'Message must be at least 10 characters long';
        }
        break;
    }

    // Show/hide error state
    const wrapper = input.parentElement;
    const existingError = wrapper.querySelector('.field-error');

    if (!isValid) {
      input.style.borderColor = 'var(--error-color)';

      if (!existingError) {
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = errorMessage;
        errorElement.style.cssText = `
          color: var(--error-color);
          font-size: 0.875rem;
          margin-top: 0.5rem;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        `;
        wrapper.appendChild(errorElement);

        setTimeout(() => {
          errorElement.style.opacity = '1';
          errorElement.style.transform = 'translateY(0)';
        }, 10);
      }
    } else {
      input.style.borderColor = '';

      if (existingError) {
        existingError.style.opacity = '0';
        existingError.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          existingError.remove();
        }, 300);
      }
    }
  }

  // ===================================
  // CLEANUP AND MEMORY MANAGEMENT
  // ===================================

  window.addEventListener('beforeunload', () => {
    // Clear any intervals or timeouts
    // Remove event listeners if needed
    document.removeEventListener('keydown', arguments.callee);
  });

  // ===================================
  // ADD DYNAMIC STYLES
  // ===================================

  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes iconRippleExpand {
      to {
        width: 100px;
        height: 100px;
        opacity: 0;
      }
    }
    
    @keyframes tooltipFadeIn {
      to {
        opacity: 1;
      }
    }
    
    .keyboard-navigation *:focus {
      outline: 2px solid var(--primary-color) !important;
      outline-offset: 2px !important;
    }
    
    .input-wrapper.focused .input-enhanced {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .input-wrapper.has-value .input-enhanced {
      background: rgba(255, 255, 255, 0.08);
    }
    
    .social-link-enhanced:hover .social-icon {
      animation: socialIconBounce 0.6s ease-in-out;
    }
    
    @keyframes socialIconBounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    
    .contact-icon-float:hover {
      animation-play-state: paused;
    }
    
    .info-item:hover .info-icon {
      animation: infoIconPulse 1s ease-in-out infinite;
    }
    
    @keyframes infoIconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;
  document.head.appendChild(style);

  console.log('🚀 Contact page enhanced with advanced interactions initialized!');
});

// ===================================
// RESUME SECTION ENHANCEMENTS
// ===================================

// Animate skill bars when they come into view
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const skillBars = entry.target.querySelectorAll('.skill-progress-enhanced');
      skillBars.forEach((bar, index) => {
        const width = bar.getAttribute('data-width');
        setTimeout(() => {
          bar.style.width = width + '%';
        }, index * 200);
      });
    }
  });
}, { threshold: 0.5 });

const skillsSection = document.querySelector('.skills-grid-enhanced');
if (skillsSection) {
  skillsObserver.observe(skillsSection);
}

// Timeline item animations
const timelineItems = document.querySelectorAll('.timeline-item-enhanced');
timelineItems.forEach((item, index) => {
  item.style.opacity = '0';
  item.style.transform = 'translateX(-30px)';
  item.style.transition = `all 0.6s ease ${index * 0.2}s`;

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, { threshold: 0.3 });

  timelineObserver.observe(item);
});

// Project item animations
const projectItems = document.querySelectorAll('.project-item-enhanced');
projectItems.forEach((item, index) => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(30px)';
  item.style.transition = `all 0.6s ease ${index * 0.15}s`;

  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.3 });

  projectObserver.observe(item);
});

// Enhanced button interactions
const enhancedButtons = document.querySelectorAll('.btn-enhanced');
enhancedButtons.forEach(button => {
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-3px) scale(1.02)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = '';
  });

  button.addEventListener('click', () => {
    button.style.transform = 'scale(0.98)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  });
});

// Tech tag interactions
const techTags = document.querySelectorAll('.tech-tag, .tag');
techTags.forEach(tag => {
  tag.addEventListener('mouseenter', () => {
    tag.style.transform = 'translateY(-3px) scale(1.05)';
  });

  tag.addEventListener('mouseleave', () => {
    tag.style.transform = '';
  });
});

// Resume card hover effects
const resumeCards = document.querySelectorAll('.resume-card-enhanced');
resumeCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    // Add subtle tilt effect
    card.style.transform = 'translateY(-8px) perspective(1000px) rotateX(2deg)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// Print functionality enhancement
const printButton = document.querySelector('button[onclick="window.print()"]');
if (printButton) {
  printButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Show print preparation message
    showPrintPreparation();

    // Prepare page for printing
    setTimeout(() => {
      window.print();
    }, 1000);
  });
}

function showPrintPreparation() {
  const message = document.createElement('div');
  message.className = 'print-preparation';
  message.textContent = 'Preparing resume for download...';

  message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 1.5rem 2rem;
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

  document.body.appendChild(message);

  setTimeout(() => {
    message.style.opacity = '1';
    message.style.scale = '1';
  }, 10);

  setTimeout(() => {
    message.style.opacity = '0';
    message.style.scale = '0.8';
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 300);
  }, 2000);
}

// ===================================
// FINAL ENHANCEMENTS AND OPTIMIZATIONS
// ===================================

// Smooth scroll behavior for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Enhanced scroll behavior with direction detection
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

  // Add scroll direction class to body
  document.body.classList.toggle('scrolling-down', scrollDirection === 'down');
  document.body.classList.toggle('scrolling-up', scrollDirection === 'up');

  // Add scroll progress indicator
  const scrollProgress = (currentScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  document.documentElement.style.setProperty('--scroll-progress', `${scrollProgress}%`);

  lastScrollY = currentScrollY;
});

// Add scroll progress indicator to page
const scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-progress-indicator';
scrollIndicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: var(--scroll-progress, 0%);
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
    z-index: 1000;
    transition: width 0.1s ease;
  `;
document.body.appendChild(scrollIndicator);

// Enhanced touch support for mobile interactions
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

  // Detect swipe gestures for navigation
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
    if (deltaX > 0) {
      // Swipe right - could trigger previous section
      console.log('Swipe right detected');
    } else {
      // Swipe left - could trigger next section
      console.log('Swipe left detected');
    }
  }
});

// Performance monitoring and optimization
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log(`Contact page loaded in ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
      }
    }, 0);
  });
}

// Cleanup function for better memory management
window.addEventListener('beforeunload', () => {
  // Clean up any intervals or event listeners
  console.log('Contact page cleanup completed');
});

console.log('Contact page enhanced successfully!');