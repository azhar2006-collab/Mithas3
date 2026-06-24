/* ============================================================
   MITHAS ICE CREAM — INTERACTIVE JAVASCRIPT
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 0. ICE CREAM PRELOADER ── */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Show preloader only once per tab/session
    const PRELOADER_KEY = 'mithas_preloader_seen_v2';
    const alreadySeen = sessionStorage.getItem(PRELOADER_KEY) === '1';

    const dismissPreloader = () => {
      preloader.classList.add('loaded');
      document.body.classList.remove('preloader-active');
      sessionStorage.setItem(PRELOADER_KEY, '1');
    };

    if (alreadySeen) {
      // Skip animations and keep page interactive
      preloader.classList.add('loaded');
      document.body.classList.remove('preloader-active');
    } else {
      document.body.classList.add('preloader-active');

      // Let the rise + progress play, then slide away
      const preloaderTimeout = setTimeout(dismissPreloader, 2800);

      // Dismiss on click/tap
      preloader.addEventListener('click', () => {
        clearTimeout(preloaderTimeout);
        dismissPreloader();
      });
    }
  }


  /* ── 1. ACTIVE PAGE NAVIGATION LINK ── */
  const currentPath = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('header nav a');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    // Highlight links if they map to the current HTML file
    if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
      link.classList.add('active-link');
    } else {
      link.classList.remove('active-link');
    }
  });

  /* ── 2. HEADER SCROLL & PROGRESS BAR ── */
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('progressBar');
  const toTop = document.getElementById('toTop');
  let scrollTicking = false;

  const onScroll = () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && totalScroll > 0) {
      progressBar.style.width = ((window.scrollY / totalScroll) * 100) + '%';
    }
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }
    if (toTop) {
      toTop.classList.toggle('show', window.scrollY > 600);
    }
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      onScroll();
      scrollTicking = false;
    });
  }, { passive: true });
  onScroll();

  // Back to top click event
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 3. MOBILE NAVIGATION ── */
  const menuToggle = document.getElementById('menuToggle');
  const navList = document.getElementById('navList');

  if (menuToggle && navList) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navList.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });

    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('open');
        menuToggle.classList.remove('active');
      });
    });
  }

  /* ── 4. SCROLL REVEAL ANIMATIONS ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    revealObserver.observe(el);
  });

  // Stagger delays for children of stagger containers
  document.querySelectorAll('.reveal-stagger').forEach(container => {
    Array.from(container.children).forEach((child, idx) => {
      child.style.transitionDelay = (idx * 0.08) + 's';
    });
  });

  /* ── 4b. GALLERY MARQUEE — clone items once for seamless loop ── */
  document.querySelectorAll('.marquee-row').forEach(row => {
    const items = [...row.children];
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      row.appendChild(clone);
    });
  });

  /* ── 4c. PRODUCT CARD TILT ON HOVER (desktop only) ── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isMobileView = window.matchMedia('(max-width: 768px)').matches;

  if (!prefersReducedMotion && !isTouchDevice) {
    const tiltSelector = document.body.classList.contains('page-home')
      ? '.cat-item'
      : '.product-card, .cat-item, .why-card';
    document.querySelectorAll(tiltSelector).forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── 5. NUMERICAL COUNTER ANIMATIONS ── */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        let current = 0;
        const duration = 1200; // Total duration in ms
        const fps = 60;
        const steps = duration / (1000 / fps);
        const increment = target / steps;

        const countTick = () => {
          current += increment;
          if (current >= target) {
            el.textContent = target.toLocaleString();
            return;
          }
          el.textContent = Math.floor(current).toLocaleString();
          requestAnimationFrame(countTick);
        };
        countTick();
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(cnt => {
    counterObserver.observe(cnt);
  });

  /* ── 6. HONEY DRIP CURSOR PARTICLES (desktop only, pauses when idle) ── */
  const canvas = document.getElementById('drip-canvas');
  if (canvas && !isTouchDevice && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let cw = canvas.width = window.innerWidth;
    let ch = canvas.height = window.innerHeight;
    let particles = [];
    let lastSpawn = 0;
    let rafId = null;
    const brandColors = [
      '227, 30, 36',
      '46, 49, 146',
      '48, 181, 255',
      '0, 115, 194'
    ];

    const resizeCanvas = () => {
      cw = canvas.width = window.innerWidth;
      ch = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas, { passive: true });

    function spawnDrip(x, y) {
      if (particles.length > 24) return;
      const color = brandColors[Math.floor(Math.random() * brandColors.length)];
      particles.push({
        x, y,
        vy: 1.0 + Math.random() * 1.2,
        vx: (Math.random() - 0.5) * 0.4,
        r: 2 + Math.random() * 2.5,
        life: 1.0,
        color,
        elongation: 1.0 + Math.random() * 1.2
      });
      scheduleFrame();
    }

    function animateParticles() {
      rafId = null;
      if (!particles.length) return;

      ctx.clearRect(0, 0, cw, ch);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.life -= 0.022;
        const alpha = Math.max(p.life, 0) * 0.55;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * p.life, p.r * p.life * p.elongation, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();
      });

      particles = particles.filter(p => p.life > 0);
      if (particles.length) scheduleFrame();
    }

    function scheduleFrame() {
      if (!rafId) rafId = requestAnimationFrame(animateParticles);
    }

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSpawn > 50) {
        spawnDrip(e.clientX, e.clientY);
        lastSpawn = now;
      }
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        particles = [];
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        ctx.clearRect(0, 0, cw, ch);
      }
    });
  } else if (canvas) {
    canvas.remove();
  }

  /* ── 7–8. HERO effects disabled for performance ── */

  /* ── 9. FLAVOUR MIXER GAME LOGIC ── */
  const scoop = document.getElementById('icecreamScoop');
  const stream = document.getElementById('syrupStream');
  const syrupLayer = document.getElementById('syrupLayer');
  const toppingsDisplay = document.getElementById('toppingsDisplay');
  const drizzleBtn = document.getElementById('mixerDrizzleBtn');
  const creationToast = document.getElementById('creationToast');

  if (drizzleBtn && scoop) {
    let currentBase = 'vanilla';
    let currentSyrup = 'honey';
    let toppingsList = { almond: false, cookie: false };

    // Base selection
    document.querySelectorAll('[data-base]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.parentElement.querySelector('.active').classList.remove('active');
        btn.classList.add('active');

        const baseVal = btn.dataset.base;
        scoop.className = 'icecream-scoop-display';
        scoop.classList.add('scoop-flavour-' + baseVal);
        currentBase = baseVal;

        scoop.innerHTML = '';
        if (baseVal === 'kesarpista') {
          for (let i = 0; i < 8; i++) {
            const nut = document.createElement('div');
            nut.className = 'kesarpista-nut';
            nut.style.left = (20 + Math.random() * 60) + '%';
            nut.style.top = (20 + Math.random() * 50) + '%';
            nut.style.transform = `rotate(${Math.random() * 360}deg)`;
            scoop.appendChild(nut);
          }
          for (let i = 0; i < 4; i++) {
            const saff = document.createElement('div');
            saff.className = 'kesarpista-saffron';
            saff.style.left = (30 + Math.random() * 40) + '%';
            saff.style.top = (15 + Math.random() * 60) + '%';
            saff.style.transform = `rotate(${Math.random() * 90}deg)`;
            scoop.appendChild(saff);
          }
        }
        resetDrizzle();
      });
    });

    // Syrup selection
    document.querySelectorAll('[data-syrup]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.parentElement.querySelector('.active').classList.remove('active');
        btn.classList.add('active');
        currentSyrup = btn.dataset.syrup;
        resetDrizzle();
      });
    });

    // Toppings selection
    document.querySelectorAll('[data-topping]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const topVal = btn.dataset.topping;
        toppingsList[topVal] = btn.classList.contains('active');
        updateToppingsVisual();
      });
    });

    function resetDrizzle() {
      syrupLayer.className = 'syrup-layer-scoop';
      syrupLayer.style.clipPath = 'polygon(0 0, 100% 0, 100% 0, 0 0)';
      drizzleBtn.disabled = false;
    }

    function updateToppingsVisual() {
      toppingsDisplay.innerHTML = '';
      if (toppingsList.almond) {
        for (let i = 0; i < 12; i++) {
          const alm = document.createElement('div');
          alm.className = 'almond-shaving visible';
          alm.style.left = (15 + Math.random() * 70) + '%';
          alm.style.top = (10 + Math.random() * 55) + '%';
          alm.style.setProperty('--rot', (Math.random() * 360) + 'deg');
          toppingsDisplay.appendChild(alm);
        }
      }
      if (toppingsList.cookie) {
        for (let i = 0; i < 16; i++) {
          const crb = document.createElement('div');
          crb.className = 'cookie-crumb visible';
          crb.style.left = (12 + Math.random() * 76) + '%';
          crb.style.top = (8 + Math.random() * 60) + '%';
          crb.style.setProperty('--rot', (Math.random() * 360) + 'deg');
          toppingsDisplay.appendChild(crb);
        }
      }
    }

    drizzleBtn.addEventListener('click', () => {
      if (currentSyrup === 'none') {
        triggerSuccessToast();
        return;
      }
      
      drizzleBtn.disabled = true;
      stream.className = 'syrup-stream pour-active stream-' + currentSyrup;
      
      setTimeout(() => {
        syrupLayer.className = 'syrup-layer-scoop drizzle-active syrup-' + currentSyrup;
        const scoopWrapper = document.getElementById('scoopWrapper') || scoop;
        scoopWrapper.style.transform = 'translateY(22px) scale(1.05)';
        setTimeout(() => {
          scoopWrapper.style.transform = 'translateY(15px) scale(1)';
        }, 250);
        stream.className = 'syrup-stream';
        triggerSuccessToast();
      }, 1000);
    });

    function triggerSuccessToast() {
      const baseNames = { vanilla: 'Vanilla', chocolate: 'Chocolate', kesarpista: 'Kesar Pista', mango: 'Mango Ripple' };
      const syrupNames = { honey: 'Raw Honey Drizzle', chocolate: 'Choco Syrup', caramel: 'Caramel Sauce', none: 'No Syrup' };
      let toppingsText = '';
      const selectedTops = Object.keys(toppingsList).filter(k => toppingsList[k]);
      if (selectedTops.length === 1) {
        toppingsText = ' with ' + (selectedTops[0] === 'almond' ? 'Almond flakes' : 'Cookies');
      } else if (selectedTops.length === 2) {
        toppingsText = ' with Almonds & Cookies';
      }

      const description = `${baseNames[currentBase]} Scoop coated in ${syrupNames[currentSyrup]}${toppingsText}!`;
      creationToast.querySelector('.toast-msg').textContent = `Drizzled! ${description}`;
      creationToast.classList.add('show');

      setTimeout(() => {
        creationToast.classList.remove('show');
      }, 4000);
    }
  }

  /* ── 10. ACCORDION CATALOG & FILTER/SEARCH (MENU PAGE) ── */
  const searchInput = document.getElementById('catalogSearch');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const catSections = document.querySelectorAll('.cat-section');

  // Accordion Toggle
  document.querySelectorAll('.cat-header').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.cat-section');
      const isOpen = section.classList.contains('open');

      // Toggle the section
      section.classList.toggle('open');
      header.setAttribute('aria-expanded', !isOpen);

      // Smooth scroll to opened section on mobile
      if (!isOpen && window.innerWidth <= 768) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    });
  });

  // Tab Filter for Accordion Categories
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.tab-btn.active').classList.remove('active');
      btn.classList.add('active');
      filterAccordionCatalog();
    });
  });

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', filterAccordionCatalog);
  }

  function filterAccordionCatalog() {
    const activeTab = document.querySelector('.tab-btn.active');
    const filterCategory = activeTab ? activeTab.dataset.filter : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    catSections.forEach(section => {
      const sectionCat = section.dataset.cat;
      const catItems = section.querySelectorAll('.cat-item');
      let visibleCount = 0;

      // Category-level filter
      const categoryMatch = (filterCategory === 'all' || sectionCat === filterCategory);

      if (!categoryMatch) {
        section.style.display = 'none';
        return;
      }

      section.style.display = '';

      // Item-level search filter
      catItems.forEach(item => {
        const name = item.querySelector('.cat-item-name').textContent.toLowerCase();
        const size = item.querySelector('.cat-item-size').textContent.toLowerCase();
        const badge = item.querySelector('.item-badge');
        const badgeText = badge ? badge.textContent.toLowerCase() : '';

        const searchMatch = (
          searchQuery === '' ||
          name.includes(searchQuery) ||
          size.includes(searchQuery) ||
          badgeText.includes(searchQuery)
        );

        if (searchMatch) {
          item.style.display = '';
          item.style.opacity = '1';
          item.style.transform = '';
          visibleCount++;
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 200);
        }
      });

      // If no items visible in a section, hide the whole section
      if (visibleCount === 0 && searchQuery !== '') {
        section.style.display = 'none';
      }

      // Auto-open sections that have matching results when searching
      if (searchQuery !== '' && visibleCount > 0) {
        section.classList.add('open');
        section.querySelector('.cat-header').setAttribute('aria-expanded', 'true');
      }
    });
  }

  // Mobile touch ripple effect for product items
  document.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('touchstart', () => {
      item.style.transition = 'transform 0.15s ease';
      item.querySelector('.cat-item-img').style.animation = 'itemTapPulse 0.6s ease';
    }, { passive: true });

    item.addEventListener('touchend', () => {
      const imgEl = item.querySelector('.cat-item-img');
      imgEl.style.animation = '';
    }, { passive: true });
  });

  /* ── 11. BULK ORDER & INQUIRY FORM TABS (CONTACT PAGE) ── */
  const formTabBtns = document.querySelectorAll('.form-tab-btn');
  const formPanes = document.querySelectorAll('.form-pane');

  formTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle Tab Active Classes
      document.querySelector('.form-tab-btn.active').classList.remove('active');
      btn.classList.add('active');

      // Toggle Display Pane Active Classes
      const targetPaneId = btn.dataset.formTab;
      formPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === targetPaneId);
      });
    });
  });

  /* ── 12. PARLOR FORM INQUIRY SUBMISSIONS (CONTACT PAGE) ── */
  const bookingForm = document.getElementById('bookingForm');
  const partnerForm = document.getElementById('partnerForm');
  const globalToast = document.getElementById('creationToast'); // Reuse toast container

  const handleFormSubmission = (e, formType) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userName = formData.get('name') || 'Guest';

    // Highlight console log
    console.log(`%c [Mithas Inquiry Form] Submitted: ${formType} from ${userName} `, 'background: #E8920A; color: #1A0C00; font-weight: bold; padding: 6px;');

    // Trigger Toast Notification
    if (globalToast) {
      globalToast.querySelector('.toast-msg').textContent = `Inquiry Submitted! Thank you, ${userName}. We will connect shortly.`;
      globalToast.classList.add('show');
      setTimeout(() => {
        globalToast.classList.remove('show');
      }, 5000);
    }

    // Reset Form fields
    e.target.reset();
  };

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => handleFormSubmission(e, 'Bulk Booking Order'));
  }
  if (partnerForm) {
    partnerForm.addEventListener('submit', (e) => handleFormSubmission(e, 'Distributorship Inquiry'));
  }

  /* ── 13. DRAGGABLE REEL SCROLLER FALLBACK CONTROLS ── */
  const reelTrack = document.getElementById('reelTrack');
  const reelPrev = document.getElementById('reelPrev');
  const reelNext = document.getElementById('reelNext');

  if (reelTrack && reelPrev && reelNext) {
    reelNext.addEventListener('click', () => {
      reelTrack.scrollBy({ left: 340, behavior: 'smooth' });
    });
    reelPrev.addEventListener('click', () => {
      reelTrack.scrollBy({ left: -340, behavior: 'smooth' });
    });
  }

});
