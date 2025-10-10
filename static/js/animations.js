/**
 * Unified Animation System
 * This file contains standardized animations for consistent user experience
 * across all pages of the portfolio.
 */

// Register GSAP plugins if not already registered
if (typeof ScrollTrigger !== 'undefined' && !gsap.plugins.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

const Animations = {
  // Configuration
  config: {
    staggerTime: 0.1,
    duration: {
      fast: 0.3,
      normal: 0.5,
      slow: 0.8
    },
    ease: {
      smooth: 'power2.out',
      bounce: 'back.out(1.7)',
      elastic: 'elastic.out(1, 0.3)',
      sharp: 'power4.out'
    }
  },
  
  /**
   * Initialize all animations
   */
  init() {
    this.initPageTransitions();
    this.initScrollAnimations();
    this.initHoverEffects();
    this.initParallaxEffects();
  },
  
  /**
   * Page transition animations
   */
  initPageTransitions() {
    // Fade in page content on load
    gsap.from('.page-content', {
      opacity: 0,
      y: 20,
      duration: this.config.duration.normal,
      ease: this.config.ease.smooth,
      clearProps: 'all'
    });
  },
  
  /**
   * Scroll-triggered animations
   */
  initScrollAnimations() {
    // Fade in elements when scrolled into view
    gsap.utils.toArray('.fade-in-element').forEach(element => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 30,
        duration: this.config.duration.normal,
        ease: this.config.ease.smooth,
        clearProps: 'all'
      });
    });
    
    // Staggered animations for lists and grids
    gsap.utils.toArray('.stagger-container').forEach(container => {
      const items = container.querySelectorAll('.stagger-item');
      
      gsap.from(items, {
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 20,
        duration: this.config.duration.normal,
        stagger: this.config.staggerTime,
        ease: this.config.ease.smooth,
        clearProps: 'all'
      });
    });
    
    // Scale animations
    gsap.utils.toArray('.scale-in-element').forEach(element => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        scale: 0.8,
        duration: this.config.duration.normal,
        ease: this.config.ease.bounce,
        clearProps: 'all'
      });
    });
    
    // Text reveal animations
    gsap.utils.toArray('.text-reveal').forEach(element => {
      // Create a wrapper for the text
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      
      const parent = element.parentNode;
      parent.insertBefore(wrapper, element);
      wrapper.appendChild(element);
      
      gsap.from(element, {
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: '100%',
        duration: this.config.duration.normal,
        ease: this.config.ease.smooth,
        clearProps: 'all'
      });
    });
  },
  
  /**
   * Hover animations for interactive elements
   */
  initHoverEffects() {
    // Card hover effects
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -5,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 0 20px rgba(74, 155, 255, 0.5)',
          duration: this.config.duration.fast,
          ease: this.config.ease.smooth
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          duration: this.config.duration.fast,
          ease: this.config.ease.smooth
        });
      });
    });
    
    // Button hover effects
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: this.config.duration.fast,
          ease: this.config.ease.smooth
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          duration: this.config.duration.fast,
          ease: this.config.ease.smooth
        });
      });
    });
  },
  
  /**
   * Parallax effects for depth
   */
  initParallaxEffects() {
    // Simple parallax for background elements
    gsap.utils.toArray('.parallax-bg').forEach(element => {
      gsap.to(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        },
        y: (i, target) => -100 * parseFloat(target.dataset.speed || 0.2),
        ease: 'none'
      });
    });
    
    // Mouse parallax for hero elements
    const heroElements = document.querySelectorAll('.mouse-parallax');
    
    if (heroElements.length > 0) {
      document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        heroElements.forEach(element => {
          const speed = parseFloat(element.dataset.speed || 1);
          const offsetX = mouseX * 20 * speed;
          const offsetY = mouseY * 20 * speed;
          
          gsap.to(element, {
            x: offsetX,
            y: offsetY,
            duration: 1,
            ease: 'power2.out'
          });
        });
      });
    }
  },
  
  /**
   * Animate specific UI components
   */
  animateComponent: {
    // Animate navigation menu
    navigation() {
      const navItems = document.querySelectorAll('.nav-item');
      
      gsap.from(navItems, {
        opacity: 0,
        y: -20,
        stagger: 0.1,
        duration: Animations.config.duration.normal,
        ease: Animations.config.ease.smooth,
        clearProps: 'all'
      });
    },
    
    // Animate hero section
    hero() {
      const heroTimeline = gsap.timeline();
      
      heroTimeline
        .from('.hero-kicker', {
          opacity: 0,
          y: 20,
          duration: Animations.config.duration.normal,
          ease: Animations.config.ease.smooth
        })
        .from('.hero-title .title-line', {
          opacity: 0,
          y: 30,
          duration: Animations.config.duration.normal,
          ease: Animations.config.ease.smooth
        }, '-=0.2')
        .from('.hero-title .title-name', {
          opacity: 0,
          y: 30,
          duration: Animations.config.duration.normal,
          ease: Animations.config.ease.bounce
        }, '-=0.1')
        .from('.hero-title .title-role', {
          opacity: 0,
          y: 30,
          duration: Animations.config.duration.normal,
          ease: Animations.config.ease.smooth
        }, '-=0.1')
        .from('.hero-description', {
          opacity: 0,
          y: 30,
          duration: Animations.config.duration.normal,
          ease: Animations.config.ease.smooth
        }, '-=0.1')
        .from('.hero-badges .badge', {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: Animations.config.duration.normal,
          ease: Animations.config.ease.smooth
        }, '-=0.2')
        .from('.cta-buttons .btn', {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: Animations.config.duration.normal,
          ease: Animations.config.ease.smooth
        }, '-=0.3');
      
      return heroTimeline;
    },
    
    // Animate skill bars
    skillBars() {
      const skillBars = document.querySelectorAll('.skill-bar-progress');
      
      skillBars.forEach(bar => {
        const percentage = bar.dataset.percentage || '0';
        
        gsap.fromTo(bar, 
          { width: '0%' },
          {
            scrollTrigger: {
              trigger: bar,
              start: 'top 80%',
              toggleActions: 'play none none none'
            },
            width: percentage,
            duration: Animations.config.duration.slow,
            ease: Animations.config.ease.smooth
          }
        );
      });
    },
    
    // Animate counters
    counters() {
      const counters = document.querySelectorAll('.counter');
      
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target || '0', 10);
        
        gsap.fromTo(counter, 
          { innerText: '0' },
          {
            scrollTrigger: {
              trigger: counter,
              start: 'top 80%',
              toggleActions: 'play none none none'
            },
            innerText: target,
            duration: Animations.config.duration.slow,
            ease: Animations.config.ease.smooth,
            snap: { innerText: 1 },
            onUpdate: function() {
              counter.innerText = Math.ceil(this.targets()[0].innerText);
            }
          }
        );
      });
    },
    
    // Animate modal opening/closing
    modal(modalElement) {
      const modalTimeline = gsap.timeline();
      const modalContent = modalElement.querySelector('.modal-content');
      
      modalTimeline
        .fromTo(modalElement, 
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
        .fromTo(modalContent,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' },
          '-=0.1'
        );
      
      return modalTimeline;
    },
    
    // Close modal animation
    closeModal(modalElement) {
      const modalTimeline = gsap.timeline();
      const modalContent = modalElement.querySelector('.modal-content');
      
      modalTimeline
        .to(modalContent, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' })
        .to(modalElement, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '-=0.1');
      
      return modalTimeline;
    },
    
    // Animate tabs switching
    tabSwitch(oldTab, newTab) {
      const tabTimeline = gsap.timeline();
      
      tabTimeline
        .to(oldTab, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' })
        .set(oldTab, { display: 'none' })
        .set(newTab, { display: 'block', opacity: 0, y: -10 })
        .to(newTab, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      
      return tabTimeline;
    },
    
    // Animate form submission
    formSubmit(form) {
      const formElements = form.querySelectorAll('input, textarea, button');
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      // Disable form elements
      formElements.forEach(el => el.disabled = true);
      
      // Show loading state
      submitButton.innerHTML = '<span class="loading-spinner"></span> Sending...';
      
      // Simulate form submission (replace with actual submission logic)
      setTimeout(() => {
        // Success animation
        submitButton.innerHTML = '<span class="success-icon">✓</span> Sent!';
        
        // Reset form after delay
        setTimeout(() => {
          form.reset();
          submitButton.innerHTML = originalText;
          formElements.forEach(el => el.disabled = false);
        }, 2000);
      }, 1500);
    }
  }
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Animations.init();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Animations;
}