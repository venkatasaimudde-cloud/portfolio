/**
 * M. VENKATA SAI — PORTFOLIO INTERACTION ENGINE
 * Features: Typewriter, Dual Themes, Particle Canvas, Project Filter & Modal, Copy-to-Clipboard, Form Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================
  // 1. THEME SWITCHER (Dark & Light Mode)
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or system preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }

  // ==========================================
  // 2. TYPEWRITER EFFECT
  // ==========================================
  const typewriterElement = document.getElementById('typewriter-text');
  const roles = [
    'Full-Stack Web Developer',
    'B.Tech CSE Student @ RCEE',
    'Problem Solver & Builder',
    'Python & NLP Enthusiast',
    'Technical Leader & Collaborator'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typewriterTimeout = null;

  function typeRole() {
    if (!typewriterElement) return;

    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at full word
      typeSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 400;
    }

    typewriterTimeout = setTimeout(typeRole, typeSpeed);
  }

  typeRole();

  // ==========================================
  // 3. AMBIENT PARTICLE CANVAS BACKGROUND
  // ==========================================
  const canvas = document.getElementById('ambient-canvas');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId = null;
    let mouse = { x: null, y: null, radius: 120 };

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= Math.cos(angle) * force * 1.5;
            this.y -= Math.sin(angle) * force * 1.5;
          }
        }
      }

      draw(isDark) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.45)' : 'rgba(79, 70, 229, 0.3)';
        ctx.fill();
      }
    }

    const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 22000), 55);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);
      const isDark = htmlRoot.getAttribute('data-theme') === 'dark';

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 110) * (isDark ? 0.22 : 0.12);
            ctx.strokeStyle = isDark ? `rgba(6, 182, 212, ${alpha})` : `rgba(8, 145, 178, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw(isDark);
      });

      animationFrameId = requestAnimationFrame(renderCanvas);
    }

    renderCanvas();

    // Pause when tab not visible to conserve battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        renderCanvas();
      }
    });
  }

  // ==========================================
  // 4. NAVBAR SCROLL & ACTIVE INDICATORS
  // ==========================================
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinksContainer = document.getElementById('nav-links');

  // Sticky header class
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to top button visibility
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      if (window.scrollY > 450) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  });

  // Mobile menu toggle
  if (mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navLinksContainer.classList.contains('open');
      if (isOpen) {
        navLinksContainer.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      } else {
        navLinksContainer.classList.add('open');
        mobileMenuBtn.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close mobile menu when clicking nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section indicator via IntersectionObserver
  const sectionObserverOptions = {
    threshold: 0.35
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, sectionObserverOptions);

  sections.forEach((sec) => sectionObserver.observe(sec));

  // Back to top click
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================
  // 5. PROJECT FILTERING
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ==========================================
  // 6. CASE STUDY MODAL SYSTEM
  // ==========================================
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContent = document.getElementById('modal-content');
  const modalTriggers = document.querySelectorAll('.modal-trigger');

  const projectDetails = {
    mandimitra: {
      tag: 'Full-Stack Agri-Tech Application',
      title: 'Mandi Mitra — Digital Agricultural Marketplace',
      overview:
        'A comprehensive platform engineered to bridge agricultural farmers and wholesale vendors. Built to eliminate opaque middleman pricing by introducing real-time market price discovery, authenticated accounts, and instant digital billing.',
      features: [
        'Real-time Mandi price catalog across various regional agricultural hubs.',
        'Farmer & vendor authenticated roles with secure JWT session tokens.',
        'Client-side instant PDF invoice & receipt generator using jsPDF.',
        'Ultra-fast Vite frontend powered by React 19 and Tailwind CSS.',
        'Modular Express.js backend API with clean separation of routes and middleware.'
      ],
      techStack: ['React 19', 'TypeScript', 'Express.js', 'Vite', 'Tailwind CSS', 'jsPDF', 'JWT']
    },
    prakalp: {
      tag: 'Natural Language Processing & Python Web Tool',
      title: 'Prakalp — Academic Text Simplifier',
      overview:
        'An intelligent Python application designed to assist students and researchers in comprehending dense academic prose. It parses academic passages, replaces cumbersome terminology with simpler synonyms, and computes standard readability metrics.',
      features: [
        'NLTK tokenization and part-of-speech tagging pipeline for context-aware analysis.',
        'WordNet integration for semantic synonym resolution of complex multi-syllable terms.',
        'Automated Flesch Reading Ease & grade-level readability score calculation.',
        'Passive-to-active voice detection heuristics to improve text clarity.',
        'Interactive web interface developed with Flask and customized CSS design system.'
      ],
      techStack: ['Python', 'NLTK', 'WordNet', 'Flask', 'Readability Indexing', 'RegEx']
    },
    eduflow: {
      tag: 'College ERP & Timetable Optimization Engine',
      title: 'EduFlow ERP & Autonomous Scheduler',
      overview:
        'An enterprise-grade academic platform built during a college hackathon. It automates complex timetable generation, classroom allocation, and examination schedules while balancing faculty workloads and eliminating scheduling conflicts.',
      features: [
        'Multi-variable constraint solver balancing classroom capacity, faculty hours, and batches.',
        'Visual conflict inspector identifying double-bookings and room collisions in real-time.',
        'Comprehensive department, semester, subject, and student section management.',
        'Faculty workload monitor visualizing hours allocated per instructor.',
        'Production-ready UI with modern dashboard layout, collapsible sidebar, and responsive tables.'
      ],
      techStack: ['JavaScript ES6+', 'ERP Architecture', 'Constraint Solving', 'CSS Grid', 'SVG Graphics']
    },
    celebration: {
      tag: 'Creative Interactive Physics Engine',
      title: 'The Celebration Engine — HTML5 Canvas Experience',
      overview:
        'A high-performance visual experiment engineered to showcase native web graphics capabilities without external heavyweight gaming libraries. It simulates rotational lasers, particle rockets, and fireworks with 60fps hardware acceleration.',
      features: [
        'Vector math calculations for multi-angled rotational laser beams.',
        'Kinematic particle explosions with gravitational deceleration and decay fading.',
        'Custom render loop managed via window.requestAnimationFrame for smooth 60fps execution.',
        'Dynamic color palette generation utilizing responsive HSL color spectrums.',
        'Optimized memory usage with in-place particle array recycling to avoid memory leaks.'
      ],
      techStack: ['HTML5 Canvas 2D', 'Vector Physics', 'JavaScript ES6', 'Kinematic Motion', 'Hardware Acceleration']
    }
  };

  modalTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalKey = btn.getAttribute('data-modal');
      const data = projectDetails[modalKey];
      if (!data) return;

      modalContent.innerHTML = `
        <span class="modal-header-tag">${data.tag}</span>
        <h2 id="modal-title" class="modal-header-title">${data.title}</h2>
        
        <h3 class="modal-section-title">Project Overview</h3>
        <p class="card-text">${data.overview}</p>

        <h3 class="modal-section-title">Key Engineering Highlights</h3>
        <ul class="modal-feature-list">
          ${data.features.map((f) => `<li>${f}</li>`).join('')}
        </ul>

        <h3 class="modal-section-title">Technologies & Architecture</h3>
        <div class="modal-tech-grid">
          ${data.techStack.map((t) => `<span class="tech-pill">${t}</span>`).join('')}
        </div>
      `;

      projectModal.removeAttribute('hidden');
      setTimeout(() => projectModal.classList.add('active'), 10);
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    projectModal.classList.remove('active');
    setTimeout(() => {
      projectModal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }, 200);
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (projectModal) {
    projectModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
      closeModal();
    }
  });

  // ==========================================
  // 7. ONE-CLICK COPY TO CLIPBOARD & TOASTS
  // ==========================================
  const copyBtns = document.querySelectorAll('.copy-btn');
  const toastContainer = document.getElementById('toast-container');

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied "${textToCopy}" to clipboard!`);
        btn.querySelector('.copy-tooltip').textContent = 'Copied!';
        setTimeout(() => {
          btn.querySelector('.copy-tooltip').textContent = 'Copy';
        }, 2000);
      }).catch(() => {
        showToast('Unable to copy to clipboard.');
      });
    });
  });

  function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================
  // 8. CONTACT FORM VALIDATION & HANDLING
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Clear previous error states
      nameError.textContent = '';
      emailError.textContent = '';
      messageError.textContent = '';
      nameInput.classList.remove('error');
      emailInput.classList.remove('error');
      messageInput.classList.remove('error');
      formFeedback.className = 'form-feedback';
      formFeedback.style.display = 'none';

      // Name Validation
      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your full name.';
        nameInput.classList.add('error');
        isValid = false;
      }

      // Email Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim()) {
        emailError.textContent = 'Please enter your email address.';
        emailInput.classList.add('error');
        isValid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please provide a valid email format.';
        emailInput.classList.add('error');
        isValid = false;
      }

      // Message Validation
      if (!messageInput.value.trim()) {
        messageError.textContent = 'Please type a message before submitting.';
        messageInput.classList.add('error');
        isValid = false;
      } else if (messageInput.value.trim().length < 10) {
        messageError.textContent = 'Message should be at least 10 characters long.';
        messageInput.classList.add('error');
        isValid = false;
      }

      if (isValid) {
        // Show success state
        formFeedback.textContent =
          'Thank you, ' + nameInput.value.trim() + '! Your message has been prepared. You can also reach me directly at venkatasaimudde@gmail.com.';
        formFeedback.classList.add('success');
        formFeedback.style.display = 'block';

        showToast('Message validated successfully!');
        contactForm.reset();

        setTimeout(() => {
          formFeedback.style.display = 'none';
        }, 7000);
      }
    });
  }

  // ==========================================
  // 9. DYNAMIC FOOTER YEAR
  // ==========================================
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
});
