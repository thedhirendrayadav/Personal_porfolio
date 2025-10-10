// Enhanced Skills Page Interactions
class SkillsPageEnhancer {
    constructor() {
        this.init();
    }
    
    init() {
        this.addModernEffects();
        this.initKeyboardNavigation();
        this.initPerformanceOptimizations();
    }
    
    addModernEffects() {
        // Add floating particles effect
        this.createFloatingParticles();
        
        // Add smooth scroll behavior
        this.initSmoothScroll();
        
        // Add dynamic background effects
        this.initDynamicBackground();
    }
    
    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'floating-particles';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        
        // Create particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 20 + 10}s infinite linear;
            `;
            particleContainer.appendChild(particle);
        }
        
        document.body.appendChild(particleContainer);
        
        // Add particle animation CSS
        const particleCSS = `
            @keyframes float {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = particleCSS;
        document.head.appendChild(style);
    }
    
    initSmoothScroll() {
        // Add smooth scrolling to anchor links
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
    }
    
    initDynamicBackground() {
        const hero = document.querySelector('.skills-hero-modern');
        if (!hero) return;
        
        let mouseX = 0;
        let mouseY = 0;
        
        hero.addEventListener('mousemove', (e) => {
            mouseX = e.clientX / window.innerWidth;
            mouseY = e.clientY / window.innerHeight;
            
            hero.style.background = `
                radial-gradient(circle at ${mouseX * 100}% ${mouseY * 100}%, rgba(120, 119, 198, 0.4) 0%, transparent 50%),
                radial-gradient(circle at ${(1-mouseX) * 100}% ${(1-mouseY) * 100}%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
                linear-gradient(135deg, #0F0F23 0%, #1A1A2E 25%, #16213E 50%, #1A1A2E 75%, #0F0F23 100%)
            `;
        });
    }
    
    initKeyboardNavigation() {
        // Add keyboard navigation for tabs
        const tabBtns = document.querySelectorAll('.tab-btn-modern');
        
        tabBtns.forEach((btn, index) => {
            btn.setAttribute('tabindex', '0');
            
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextBtn = tabBtns[(index + 1) % tabBtns.length];
                    nextBtn.focus();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevBtn = tabBtns[(index - 1 + tabBtns.length) % tabBtns.length];
                    prevBtn.focus();
                }
            });
        });
    }
    
    initPerformanceOptimizations() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
        
        // Optimize animations based on device capabilities
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
        }
        
        // Pause animations when page is not visible
        document.addEventListener('visibilitychange', () => {
            const animations = document.querySelectorAll('*');
            animations.forEach(el => {
                if (document.hidden) {
                    el.style.animationPlayState = 'paused';
                } else {
                    el.style.animationPlayState = 'running';
                }
            });
        });
    }
}

// Initialize enhanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SkillsPageEnhancer();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillsPageEnhancer;
}