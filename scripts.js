const progress = document.querySelector('.progress');
const revealEls = document.querySelectorAll('.reveal');
const header = document.querySelector('[data-nav]');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.16, rootMargin:'0px 0px -6% 0px'});
revealEls.forEach(el=>observer.observe(el));

function updateProgress(){
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? (scrollY / max) * 100 : 0;
  if (progress) progress.style.width = pct + '%';
  document.documentElement.style.setProperty('--hero-y', Math.min(120, scrollY * .18) + 'px');
  header?.classList.toggle('is-scrolled', scrollY > 40);
}
addEventListener('scroll', updateProgress, {passive:true});
addEventListener('resize', updateProgress);
updateProgress();

let lastY = scrollY;
addEventListener('scroll', () => {
  if (!header || innerWidth < 720) return;
  const currentY = scrollY;
  header.classList.toggle('is-hidden', currentY > lastY && currentY > 240);
  lastY = currentY;
}, {passive:true});

window.addEventListener('pointermove', (event) => {
  const mx = (event.clientX / innerWidth - .5) * 2;
  const my = (event.clientY / innerHeight - .5) * 2;
  document.documentElement.style.setProperty('--mx', mx.toFixed(4));
  document.documentElement.style.setProperty('--my', my.toFixed(4));
}, {passive:true});

function initHeroIntroInteractions() {
  initSiteIntro();
  initAtelierLayerFallback();
  setupHeroTypographyReveal();
  setupWorkbenchSpotlightCursor();
  setupHeroWorkbenchCards();
  setupHeroProjectPreview();
  setupHeroScrollGuide();
}

function initAtelierLayerFallback() {
  const scene = document.querySelector('.hero-atelier-scene');
  const bg = document.querySelector('.hero-atelier-bg');
  const table = document.querySelector('.hero-atelier-table');

  if (!scene) return;

  const fallbackSrc = 'assets/atelier-wide.webp';

  const useFallback = () => {
    if (scene.classList.contains('is-fallback')) return;

    scene.classList.add('is-fallback');
    scene.innerHTML = `
      <img class="hero-atelier-layer hero-atelier-fallback" src="${fallbackSrc}" alt="">
    `;
  };

  [bg, table].forEach((img) => {
    if (!img) {
      useFallback();
      return;
    }

    img.addEventListener('error', useFallback);

    if (img.complete && img.naturalWidth === 0) {
      useFallback();
    }
  });
}

function initSiteIntro() {
  const intro = document.querySelector('[data-site-intro]');
  if (!intro) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;

  const cleanup = () => {
    window.removeEventListener('wheel', onSkip);
    window.removeEventListener('touchstart', onSkip);
    window.removeEventListener('keydown', onKeyDown);
  };

  const hideIntro = () => {
    if (intro.classList.contains('is-hidden')) return;

    intro.classList.add('is-hidden');
    intro.setAttribute('aria-hidden', 'true');
    cleanup();

    window.setTimeout(() => {
      intro.remove();
    }, prefersReducedMotion ? 0 : 850);
  };

  function skip() {
    window.clearTimeout(timer);
    hideIntro();
  }

  function onSkip() {
    skip();
  }

  function onKeyDown(event) {
    if (
      event.key === 'ArrowDown' ||
      event.key === 'PageDown' ||
      event.key === ' ' ||
      event.key === 'Enter' ||
      event.key === 'Escape'
    ) {
      skip();
    }
  }

  if (prefersReducedMotion) {
    hideIntro();
    return;
  }

  timer = window.setTimeout(hideIntro, 2350);

  window.addEventListener('wheel', onSkip, {once: true, passive: true});
  window.addEventListener('touchstart', onSkip, {once: true, passive: true});
  window.addEventListener('keydown', onKeyDown);
}

function setupHeroTypographyReveal() {
  const title = document.querySelector('[data-hero-title]');
  if (!title) return;

  if (!title.querySelector('span')) {
    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.textContent = '';

    [...text].forEach((letter) => {
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = letter;
      title.appendChild(span);
    });
  }

  const letters = title.querySelectorAll('span');
  const heroStage = document.querySelector('.hero-stage');
  let overlapShift = 0;

  const updateTitleOverlap = () => {
    if (!heroStage || window.innerWidth <= 1100) {
      title.style.setProperty('--hero-title-overlap-start', '100%');
      return;
    }

    const titleRect = title.getBoundingClientRect();
    const stageRect = heroStage.getBoundingClientRect();

    if (!titleRect.width) return;

    const overlapStart = ((stageRect.left - titleRect.left) / titleRect.width) * 100;
    const clamped = Math.max(0, Math.min(100, overlapStart + overlapShift));
    title.style.setProperty('--hero-title-overlap-start', `${clamped.toFixed(2)}%`);
  };

  letters.forEach((letter, index) => {
    letter.style.transitionDelay = `${index * 42}ms`;
  });

  updateTitleOverlap();
  window.addEventListener('resize', updateTitleOverlap, {passive: true});
  window.addEventListener('scroll', updateTitleOverlap, {passive: true});

  title.addEventListener('mousemove', (event) => {
    const rect = title.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    title.classList.add('is-magnetic');
    overlapShift = x * -5;
    updateTitleOverlap();

    letters.forEach((letter, index) => {
      const direction = index - (letters.length - 1) / 2;
      const letterX = x * direction * 1.8;
      const letterY = y * 3;

      letter.style.setProperty('--letter-x', `${letterX.toFixed(2)}px`);
      letter.style.setProperty('--letter-y', `${letterY.toFixed(2)}px`);
    });
  });

  title.addEventListener('mouseleave', () => {
    title.classList.remove('is-magnetic');
    overlapShift = 0;
    updateTitleOverlap();

    letters.forEach((letter) => {
      letter.style.setProperty('--letter-x', '0px');
      letter.style.setProperty('--letter-y', '0px');
    });
  });
}

function setupWorkbenchSpotlightCursor() {
  const visual =
    document.querySelector('.hero-stage') ||
    document.querySelector('.hero-visual') ||
    document.querySelector('.hero_visual') ||
    document.querySelector('.hero-visual-scene');

  if (!visual || reduceMotion) return;

  visual.addEventListener('mousemove', (event) => {
    const rect = visual.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const parallaxX = (x - 50) * 0.08;
    const parallaxY = (y - 50) * 0.06;

    visual.style.setProperty('--spotlight-x', `${x.toFixed(2)}%`);
    visual.style.setProperty('--spotlight-y', `${y.toFixed(2)}%`);
    visual.style.setProperty('--atelier-parallax-x', `${parallaxX.toFixed(2)}px`);
    visual.style.setProperty('--atelier-parallax-y', `${parallaxY.toFixed(2)}px`);
  });

  visual.addEventListener('mouseleave', () => {
    visual.style.setProperty('--spotlight-x', '58%');
    visual.style.setProperty('--spotlight-y', '48%');
    visual.style.setProperty('--atelier-parallax-x', '0px');
    visual.style.setProperty('--atelier-parallax-y', '0px');
  });
}

function setupHeroWorkbenchCards() {
  const cards = Array.from(document.querySelectorAll('.hero-desk-card[data-hero-work]'));
  const triggers = Array.from(document.querySelectorAll('.hero-work-rail [data-hero-preview]'));

  if (!cards.length || !triggers.length) return;

  const setActiveWork = (work = 'kia', announce = true) => {
    cards.forEach((card) => {
      card.classList.toggle('is-active', card.dataset.heroWork === work);
    });

    triggers.forEach((trigger) => {
      trigger.classList.toggle('is-active', trigger.dataset.heroPreview === work);
    });

    if (announce) {
      window.dispatchEvent(new CustomEvent('heroWorkbenchActive', {
        detail: {work}
      }));
    }
  };

  triggers.forEach((trigger) => {
    const work = trigger.dataset.heroPreview || 'kia';

    trigger.addEventListener('mouseenter', () => setActiveWork(work));
    trigger.addEventListener('focus', () => setActiveWork(work));

    trigger.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('heroWorkbenchSelect', {
        detail: {work}
      }));
    });
  });

  cards.forEach((card) => {
    const work = card.dataset.heroWork || 'kia';
    card.addEventListener('mouseenter', () => setActiveWork(work));
  });

  setActiveWork('kia', false);
}

function setupHeroProjectPreview() {
  const preview = document.querySelector('.hero-project-preview');
  const previewImg = preview?.querySelector('img');
  const previewTitle = preview?.querySelector('span');
  const triggers = document.querySelectorAll('[data-hero-preview]');

  if (!preview || !triggers.length) return;

  if (previewImg) {
    previewImg.removeAttribute('src');
  }

  const movePreview = (event) => {
    preview.style.setProperty('--preview-x', `${event.clientX}px`);
    preview.style.setProperty('--preview-y', `${event.clientY}px`);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('mouseenter', (event) => {
      const title = trigger.dataset.previewTitle || trigger.textContent.trim();
      const image = trigger.dataset.previewImage || '';

      if (previewTitle) previewTitle.textContent = title;

      if (previewImg) {
        if (image) {
          previewImg.style.display = 'block';
          previewImg.style.visibility = 'hidden';
          previewImg.src = image;

          if (previewImg.complete && previewImg.naturalWidth > 0) {
            previewImg.style.visibility = 'visible';
          }
        } else {
          previewImg.removeAttribute('src');
          previewImg.style.display = 'none';
        }
      }

      preview.classList.add('is-active');
      movePreview(event);
    });

    trigger.addEventListener('mousemove', movePreview);

    trigger.addEventListener('mouseleave', () => {
      preview.classList.remove('is-active');
    });

    trigger.addEventListener('focus', () => {
      const title = trigger.dataset.previewTitle || trigger.textContent.trim();
      const image = trigger.dataset.previewImage || '';
      const rect = trigger.getBoundingClientRect();

      if (previewTitle) previewTitle.textContent = title;

      if (previewImg) {
        if (image) {
          previewImg.style.display = 'block';
          previewImg.style.visibility = 'hidden';
          previewImg.src = image;

          if (previewImg.complete && previewImg.naturalWidth > 0) {
            previewImg.style.visibility = 'visible';
          }
        } else {
          previewImg.removeAttribute('src');
          previewImg.style.display = 'none';
        }
      }

      preview.classList.add('is-active');
      preview.style.setProperty('--preview-x', `${rect.left + rect.width / 2}px`);
      preview.style.setProperty('--preview-y', `${rect.top}px`);
    });

    trigger.addEventListener('blur', () => {
      preview.classList.remove('is-active');
    });

    trigger.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }

      const projectKey = trigger.dataset.heroPreview;
      const targetCard = projectKey
        ? document.querySelector(`.project-open[data-project="${projectKey}"]`)
        : null;

      if (!targetCard) return;

      event.preventDefault();
      preview.classList.remove('is-active');

      document.querySelector('#works')?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });

      window.setTimeout(() => {
        targetCard.focus({preventScroll: true});
        targetCard.click();
      }, reduceMotion ? 0 : 420);
    });
  });

  if (previewImg) {
    previewImg.addEventListener('load', () => {
      previewImg.style.visibility = 'visible';
    });

    previewImg.addEventListener('error', () => {
      previewImg.style.display = 'none';
      previewImg.style.visibility = 'hidden';
    });
  }
}

function setupHeroScrollGuide() {
  const guide = document.querySelector('.hero-scroll-guide');
  if (!guide) return;

  guide.addEventListener('click', () => {
    const nextSection = document.querySelector('#tools');

    if (!nextSection) return;

    nextSection.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  });
}

function initWorksPreviewCursor() {
  const preview = document.querySelector('.works-preview-card');
  preview?.classList.remove('is-active');
  preview?.setAttribute('hidden', '');
}

function initToolsPegboardInteraction() {
  const tools = document.querySelectorAll('[data-tool-target]');
  const infos = document.querySelectorAll('[data-tool-info]');
  const infoLayer = document.querySelector('.tools-card-text-layer');
  const stage = document.querySelector('.tools-photo-stage');
  const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!tools.length || !infos.length) return;

  let lockedToolName = null;

  const setToolFocus = (tool) => {
    if (!stage || !tool) return;

    const stageRect = stage.getBoundingClientRect();
    const toolRect = tool.getBoundingClientRect();

    if (!stageRect.width || !stageRect.height) return;

    const x = ((toolRect.left + toolRect.width / 2 - stageRect.left) / stageRect.width) * 100;
    const y = ((toolRect.top + toolRect.height / 2 - stageRect.top) / stageRect.height) * 100;

    stage.classList.add('has-tool-focus');
    stage.style.setProperty('--tool-focus-x', `${x.toFixed(2)}%`);
    stage.style.setProperty('--tool-focus-y', `${y.toFixed(2)}%`);
  };

  const clearToolFocus = () => {
    stage?.classList.remove('has-tool-focus');
  };

  const activateTool = (name, isLocked = false) => {
    let activeTool = null;

    tools.forEach((tool) => {
      const isTarget = tool.dataset.toolTarget === name;
      tool.classList.toggle('is-active', isTarget);
      tool.classList.toggle('is-locked', isLocked && isTarget);

      if (isTarget) activeTool = tool;
    });

    infos.forEach((info) => {
      const isTarget = info.dataset.toolInfo === name;
      info.classList.toggle('is-active', isTarget);
      info.classList.toggle('is-locked', isLocked && isTarget);
    });

    infoLayer?.classList.add('has-active-tool');
    infoLayer?.classList.toggle('has-locked-tool', isLocked);

    setToolFocus(activeTool);
  };

  const clearTool = (force = false) => {
    if (lockedToolName && !force) return;

    tools.forEach((tool) => tool.classList.remove('is-active'));
    tools.forEach((tool) => tool.classList.remove('is-locked'));
    infos.forEach((info) => info.classList.remove('is-active'));
    infos.forEach((info) => info.classList.remove('is-locked'));
    infoLayer?.classList.remove('has-active-tool');
    infoLayer?.classList.remove('has-locked-tool');
    clearToolFocus();

    if (force) {
      lockedToolName = null;
    }
  };

  tools.forEach((tool) => {
    const name = tool.dataset.toolTarget;

    tool.addEventListener('mouseenter', () => {
      if (!lockedToolName) activateTool(name);
    });
    tool.addEventListener('focus', () => {
      if (!lockedToolName) activateTool(name);
    });
    tool.addEventListener('mouseleave', () => clearTool());
    tool.addEventListener('blur', () => clearTool());

    tool.addEventListener('click', () => {
      const willUnlock = lockedToolName === name;
      clearTool(true);

      if (!willUnlock) {
        lockedToolName = name;
        activateTool(name, true);
      } else if (isTouchLike) {
        window.setTimeout(() => clearTool(true), 0);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearTool(true);
    }
  });
}

function initSectionStageIndicator() {
  const indicator = document.querySelector('.section-stage-indicator');
  const stageIndex = indicator?.querySelector('.stage-index');
  const stageTitle = indicator?.querySelector('.stage-title');
  const stageState = indicator?.querySelector('.stage-state');
  const stageSections = Array.from(document.querySelectorAll('section[id]'));

  if (!indicator || !stageSections.length) return;

  const getSectionState = (section) => {
    if (section.classList.contains('project-axis-section')) {
      return document.querySelector('.axis-label-c')?.textContent || 'BUILD';
    }

    if (section.id === 'hero') return 'ATELIER';
    if (section.id === 'profile') return 'DESIGNER INFO';
    if (section.id === 'tools') return 'INSPECT TOOLS';
    if (section.id === 'works') return 'SELECT WORK';
    return 'READY';
  };

  const updateIndicator = () => {
    let currentSection = stageSections[0];
    let bestScore = -1;

    stageSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      const score = visible / Math.min(window.innerHeight, Math.max(rect.height, 1));

      if (score > bestScore) {
        bestScore = score;
        currentSection = section;
      }
    });

    if (stageIndex) {
      stageIndex.textContent = currentSection.dataset.sectionIndex || 'A-00';
    }

    if (stageTitle) {
      stageTitle.textContent = currentSection.dataset.sectionTitle || currentSection.dataset.sectionName || 'PORTFOLIO';
    }

    if (stageState) {
      stageState.textContent = getSectionState(currentSection);
    }

    const sectionIndex = stageSections.indexOf(currentSection);
    const sectionProgress = stageSections.length > 1
      ? sectionIndex / (stageSections.length - 1)
      : 0;

    document.documentElement.style.setProperty(
      '--section-stage-progress',
      `${(sectionProgress * 100).toFixed(2)}%`
    );
  };

  let indicatorRaf = null;

  const requestIndicatorUpdate = () => {
    if (indicatorRaf) return;

    indicatorRaf = requestAnimationFrame(() => {
      indicatorRaf = null;
      updateIndicator();
    });
  };

  window.addEventListener('scroll', requestIndicatorUpdate, {passive:true});
  window.addEventListener('resize', requestIndicatorUpdate);
  window.addEventListener('axis-statechange', requestIndicatorUpdate);
  updateIndicator();
}

function initPlaneCursorScratchReveal() {
  const board = document.querySelector('[data-scratch-board]');
  const canvas = document.querySelector('[data-wood-scratch-canvas]');
  if (!board || !canvas) return;

  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  const maskCanvas = document.createElement('canvas');
  const maskCtx = maskCanvas.getContext('2d', {willReadFrequently:true});
  const plane = board.querySelector('.plane-cursor');
  const skipButton = board.querySelector('.scratch-skip-button');
  const particleLayer = board.querySelector('.sawdust-particle-layer');
  const drops = [
    board.querySelector('.shaving-drop-1'),
    board.querySelector('.shaving-drop-2'),
    board.querySelector('.shaving-drop-3')
  ];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileFallback = window.matchMedia('(max-width: 760px)').matches;
  const thresholds = [.18, .38, .58];
  const completeThreshold = .7;
  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

  let isPointerDown = false;
  let lastPoint = null;
  let erasedRatio = 0;
  let dropIndex = 0;
  let complete = false;
  let progressRaf = null;
  let coverReady = false;
  let eraseEnergy = 0;
  let particleAnimationFrame = null;
  let staticRevealTimer = null;

  const particles = [];
  const landedParticles = [];
  const shavingSources = [
    'assets/about/wood-shaving-pass-01.webp',
    'assets/about/wood-shaving-pass-02.webp',
    'assets/about/wood-shaving-pass-03.webp'
  ];
  const maxParticles = mobileFallback ? 32 : 80;
  const maxLandedParticles = mobileFallback ? 32 : 80;

  const woodImage = new Image();
  woodImage.src = 'assets/about/wood-grain-light.jpg.png';

  const dropShaving = (index) => {
    const drop = drops[index];
    if (!drop || drop.classList.contains('is-dropped') || drop.classList.contains('is-missing')) return;
    drop.classList.add('is-missing');
  };

  const clearWoodCover = () => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    maskCtx.save();
    maskCtx.setTransform(1, 0, 0, 1, 0, 0);
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.restore();
  };

  const revealStatic = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (board.classList.contains('is-static-reveal')) return;

    if (particleAnimationFrame) {
      cancelAnimationFrame(particleAnimationFrame);
      particleAnimationFrame = null;
    }
    particles.splice(0).forEach((particle) => particle.el?.remove());
    landedParticles.length = 0;
    board.style.setProperty('--dust-opacity', '0');
    board.style.setProperty('--dust-bed-opacity', '0');
    board.style.setProperty('--dust-bed-scale', '.72');
    drops.forEach((_, index) => dropShaving(index));
    board.classList.add('is-complete', 'is-skip-revealing');
    canvas.style.opacity = '0';
    canvas.style.pointerEvents = 'none';
    isPointerDown = false;
    lastPoint = null;
    erasedRatio = 1;
    complete = true;

    window.clearTimeout(staticRevealTimer);
    staticRevealTimer = window.setTimeout(() => {
      clearWoodCover();
      board.classList.add('is-static-reveal');
    }, reduced || mobileFallback ? 0 : 620);
  };

  const drawWoodCover = () => {
    const rect = board.getBoundingClientRect();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, rect.width, rect.height);
    maskCtx.globalCompositeOperation = 'source-over';
    maskCtx.clearRect(0, 0, rect.width, rect.height);
    maskCtx.fillStyle = '#000';
    maskCtx.fillRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = '#e8c58f';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (woodImage.complete && woodImage.naturalWidth > 0) {
      const pattern = ctx.createPattern(woodImage, 'repeat');
      ctx.fillStyle = pattern || '#e8c58f';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    ctx.fillStyle = 'rgba(255,238,203,.18)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    coverReady = true;
  };

  const resizeCanvas = () => {
    if (complete) return;
    const rect = board.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWoodCover();
  };

  const getLocalPoint = (event) => {
    const rect = board.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, rect.width),
      y: clamp(event.clientY - rect.top, 0, rect.height)
    };
  };

  const movePlane = (point, previousPoint) => {
    if (!plane) return;
    plane.style.left = `${point.x}px`;
    plane.style.top = `${point.y}px`;
    plane.style.setProperty('--plane-rotate', '0deg');
  };

  const hasWoodAt = (x, y) => {
    const rect = board.getBoundingClientRect();
    const dpr = maskCanvas.width / Math.max(1, rect.width);
    const sampleSize = Math.max(8, Math.round(12 * dpr));
    const sampleX = Math.round(clamp(x * dpr - sampleSize / 2, 0, Math.max(0, maskCanvas.width - sampleSize)));
    const sampleY = Math.round(clamp(y * dpr - sampleSize / 2, 0, Math.max(0, maskCanvas.height - sampleSize)));
    const data = maskCtx.getImageData(sampleX, sampleY, sampleSize, sampleSize).data;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 30) return true;
    }

    return false;
  };

  const hasWoodOnPath = (point, previousPoint) => {
    if (!previousPoint) return hasWoodAt(point.x, point.y);
    const distance = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
    const steps = Math.max(1, Math.ceil(distance / 30));

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = previousPoint.x + (point.x - previousPoint.x) * t;
      const y = previousPoint.y + (point.y - previousPoint.y) * t;
      if (hasWoodAt(x, y)) return true;
    }

    return false;
  };

  const eraseStamp = (targetCtx, x, y, brushW, brushH, angle) => {
    targetCtx.save();
    targetCtx.translate(x, y);
    targetCtx.rotate(angle);
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, brushW, brushH, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.restore();
  };

  const eraseAt = (point, previousPoint) => {
    if (!coverReady) return false;
    const rect = board.getBoundingClientRect();
    const brushW = Math.max(54, rect.width * .064);
    const brushH = Math.max(118, rect.height * .165);
    const distance = previousPoint ? Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y) : 12;
    const removedWood = hasWoodOnPath(point, previousPoint);

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    maskCtx.save();
    maskCtx.globalCompositeOperation = 'destination-out';

    if (previousPoint) {
      const steps = Math.max(1, Math.ceil(distance / 18));

      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const x = previousPoint.x + (point.x - previousPoint.x) * t;
        const y = previousPoint.y + (point.y - previousPoint.y) * t;
        const angle = Math.sin((x + y) * .018) * .025;
        eraseStamp(ctx, x, y, brushW, brushH, angle);
        eraseStamp(maskCtx, x, y, brushW, brushH, angle);
      }
    } else {
      eraseStamp(ctx, point.x, point.y, brushW, brushH, 0);
      eraseStamp(maskCtx, point.x, point.y, brushW, brushH, 0);
    }

    maskCtx.restore();
    ctx.restore();
    if (removedWood) {
      eraseEnergy = clamp(eraseEnergy + clamp(distance / Math.max(rect.width, 1), .008, .035));
    }

    return removedWood;
  };

  const removeParticle = (particle) => {
    particle?.el?.remove();
    const particleIndex = particles.indexOf(particle);
    if (particleIndex > -1) particles.splice(particleIndex, 1);
    const landedIndex = landedParticles.indexOf(particle);
    if (landedIndex > -1) landedParticles.splice(landedIndex, 1);
  };

  const updateSawdustBed = () => {
    const landedAccumulation = clamp(landedParticles.length / maxLandedParticles);
    const eraseAccumulation = clamp(erasedRatio * .45);
    const accumulation = clamp(Math.max(landedAccumulation, eraseAccumulation));
    board.style.setProperty('--dust-bed-opacity', String((.14 + accumulation * .52).toFixed(3)));
    board.style.setProperty('--dust-bed-scale', String((.22 + accumulation * .82).toFixed(3)));
  };

  const spawnSawdust = (point, previousPoint) => {
    if (!particleLayer) return;

    const dx = previousPoint ? point.x - previousPoint.x : 1;
    const dy = previousPoint ? point.y - previousPoint.y : 0;
    const distance = Math.hypot(dx, dy);
    const motion = clamp(distance / 54, .2, 1);
    const count = Math.max(1, Math.round(motion * (mobileFallback ? 1.3 : 2.2)));
    const direction = distance > 0 ? {x:dx / distance, y:dy / distance} : {x:1, y:0};

    for (let i = 0; i < count; i += 1) {
      if (particles.length >= maxParticles) {
        const airborne = particles.find((particle) => !particle.landed);
        if (!airborne) return;
        removeParticle(airborne);
      }

      const el = document.createElement('img');
      el.className = 'shaving-particle';
      el.src = shavingSources[Math.floor(Math.random() * shavingSources.length)];
      el.alt = '';
      el.setAttribute('aria-hidden', 'true');

      const size = (mobileFallback ? 54 : 74) + Math.random() * (mobileFallback ? 30 : 58);
      const opacity = .84 + Math.random() * .14;
      el.style.setProperty('--shaving-size', `${size.toFixed(2)}px`);
      el.style.setProperty('--shaving-opacity', String(opacity.toFixed(2)));
      particleLayer.appendChild(el);

      particles.push({
        el,
        x: point.x - direction.x * (22 + Math.random() * 34) + (Math.random() - .5) * 34,
        y: point.y + 24 + Math.random() * 18,
        vx: (Math.random() - .5) * 1.65 + direction.x * .28,
        vy: .65 + Math.random() * 1.05 + Math.max(0, direction.y) * .18,
        gravity: .045 + Math.random() * .026,
        opacity,
        rotation: -32 + Math.random() * 64,
        spin: (Math.random() - .5) * 1.55,
        scale: .72 + Math.random() * .3,
        landed:false
      });
    }
  };

  const animateParticles = () => {
    const rect = board.getBoundingClientRect();
    const floorY = rect.height + Math.min(110, Math.max(64, rect.height * .1));

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      if (!particle) continue;

      if (!particle.landed) {
        particle.vy += particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.spin;

        if (particle.y >= floorY - Math.random() * 18) {
          const stackLift = Math.min(72, landedParticles.length * 2.1);
          particle.y = floorY - stackLift - Math.random() * 18;
          particle.rotation += -12 + Math.random() * 24;
          particle.vx *= .16;
          particle.vy = 0;
          particle.spin = 0;
          particle.landed = true;
          landedParticles.push(particle);

          updateSawdustBed();
        }
      }

      particle.el.style.left = `${particle.x.toFixed(2)}px`;
      particle.el.style.top = `${particle.y.toFixed(2)}px`;
      particle.el.style.opacity = String(particle.opacity.toFixed(3));
      particle.el.style.transform = `translate(-50%,-50%) rotate(${particle.rotation.toFixed(1)}deg) scale(${particle.landed ? particle.scale * .92 : particle.scale})`;
    }

    particleAnimationFrame = requestAnimationFrame(animateParticles);
  };

  const estimateErasedRatio = () => {
    const sampleSize = 72;
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = sampleSize;
    sampleCanvas.height = sampleSize;
    const sampleCtx = sampleCanvas.getContext('2d', {willReadFrequently:true});
    sampleCtx.drawImage(maskCanvas, 0, 0, sampleSize, sampleSize);
    let data;

    try {
      data = sampleCtx.getImageData(0, 0, sampleSize, sampleSize).data;
    } catch (error) {
      return clamp(Math.max(erasedRatio, eraseEnergy));
    }

    let transparent = 0;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 45) transparent += 1;
    }

    return transparent / (sampleSize * sampleSize);
  };

  const updateProgressEffects = () => {
    progressRaf = null;
    erasedRatio = estimateErasedRatio();
    board.style.setProperty('--dust-opacity', String(Math.min(erasedRatio * .95, .68).toFixed(3)));
    updateSawdustBed();

    if (dropIndex < thresholds.length && erasedRatio >= thresholds[dropIndex]) {
      dropShaving(dropIndex);
      dropIndex += 1;
    }

    if (!complete && erasedRatio >= completeThreshold) {
      complete = true;
      board.classList.add('is-complete');
    }
  };

  const requestProgressUpdate = () => {
    if (progressRaf) return;
    progressRaf = requestAnimationFrame(updateProgressEffects);
  };

  const handlePointerMove = (event) => {
    const point = getLocalPoint(event);
    board.classList.add('is-hovering');
    movePlane(point, lastPoint);

    if (isPointerDown || event.pointerType === 'mouse') {
      const removedWood = eraseAt(point, lastPoint);
      if (removedWood) {
        spawnSawdust(point, lastPoint);
      }
      requestProgressUpdate();
    }

    lastPoint = point;
  };

  if (plane) {
    plane.addEventListener('error', () => {
      const fallback = plane.dataset.planeFallback;
      if (fallback && !plane.dataset.fallbackApplied) {
        plane.dataset.fallbackApplied = 'true';
        plane.src = fallback;
        return;
      }
      plane.hidden = true;
    }, {once:false});
  }

  drops.forEach((drop) => {
    drop?.addEventListener('error', () => {
      drop.classList.add('is-missing');
    }, {once:true});
  });

  if (reduced || mobileFallback) {
    revealStatic();
    return;
  }

  woodImage.addEventListener('load', resizeCanvas, {once:true});
  woodImage.addEventListener('error', () => {
    drawWoodCover();
  }, {once:true});

  board.addEventListener('pointerenter', (event) => {
    board.classList.add('is-hovering');
    document.body.classList.add('is-scratch-cursor');
    lastPoint = getLocalPoint(event);
    movePlane(lastPoint, null);
  });

  board.addEventListener('pointerleave', () => {
    board.classList.remove('is-hovering');
    document.body.classList.remove('is-scratch-cursor');
    isPointerDown = false;
    lastPoint = null;
  });

  board.addEventListener('pointerdown', (event) => {
    isPointerDown = true;
    board.setPointerCapture?.(event.pointerId);
    handlePointerMove(event);
  });

  board.addEventListener('pointermove', handlePointerMove);

  board.addEventListener('pointerup', (event) => {
    isPointerDown = false;
    try {
      board.releasePointerCapture?.(event.pointerId);
    } catch (error) {}
  });

  skipButton?.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  skipButton?.addEventListener('pointerup', (event) => {
    event.stopPropagation();
  });
  skipButton?.addEventListener('click', revealStatic);
  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();
  if (particleLayer) {
    animateParticles();
  }
}

function initPageContinuity() {
  const measuredSections = Array.from(document.querySelectorAll('[data-section-name]'));
  const indicatorIndex = document.querySelector('.indicator-index');
  const indicatorName = document.querySelector('.indicator-name');
  const currentIndex = document.querySelector('.current-index');
  const currentTitle = document.querySelector('.current-title');
  const progressBar = document.querySelector('.page-scroll-progress span');
  const railDot = document.querySelector('.rail-dot');

  if (!measuredSections.length) return;

  const updateContinuity = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = docHeight > 0 ? scrollTop / docHeight : 0;
    const progressPercent = `${(pageProgress * 100).toFixed(2)}%`;

    document.documentElement.style.setProperty('--page-progress', progressPercent);

    if (progressBar) {
      progressBar.style.width = progressPercent;
    }

    if (railDot) {
      railDot.style.top = `${Math.min(100, Math.max(0, pageProgress * 100)).toFixed(2)}%`;
    }

    let current = measuredSections[0];

    measuredSections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      if (rect.top <= window.innerHeight * 0.42 && rect.bottom > window.innerHeight * 0.24) {
        current = section;
      }
    });

    const currentIndexNumber = measuredSections.indexOf(current);
    const nextSection = measuredSections[Math.min(currentIndexNumber + 1, measuredSections.length - 1)];
    const nextRect = nextSection?.getBoundingClientRect();
    const transitionProgress = nextRect
      ? clamp01((window.innerHeight * 0.86 - nextRect.top) / (window.innerHeight * 0.58))
      : 0;
    const isProjectAxisContinuity =
      current?.classList.contains('project-axis-section') ||
      nextSection?.classList.contains('project-axis-section');
    const transitionActivity = 0;
    const transitionDirection = currentIndexNumber % 2 === 0 ? 1 : -1;
    const morphGridSize = lerp(92, 56, (currentIndexNumber % 4) / 3);
    const morphGridOpacity = lerp(.032, .068, ((currentIndexNumber + 1) % 4) / 3);
    const morphTilt = lerp(-0.18, 0.18, currentIndexNumber / Math.max(measuredSections.length - 1, 1));
    const paperY = lerp(46, -34, transitionProgress);
    const paperRot = lerp(-0.55 * transitionDirection, 0.38 * transitionDirection, transitionProgress);
    const lineY = lerp(18, -18, transitionProgress);

    document.documentElement.style.setProperty('--section-transition-progress', transitionProgress.toFixed(3));
    document.documentElement.style.setProperty('--section-transition-activity', transitionActivity.toFixed(3));
    document.documentElement.style.setProperty('--section-paper-y', `${paperY.toFixed(2)}px`);
    document.documentElement.style.setProperty('--section-paper-rot', `${paperRot.toFixed(2)}deg`);
    document.documentElement.style.setProperty('--section-line-y', `${lineY.toFixed(2)}px`);
    document.documentElement.style.setProperty('--draft-grid-size', `${morphGridSize.toFixed(2)}px`);
    document.documentElement.style.setProperty('--draft-grid-opacity', morphGridOpacity.toFixed(3));
    document.documentElement.style.setProperty('--draft-line-tilt', `${morphTilt.toFixed(3)}deg`);
    document.body.classList.toggle('is-section-transitioning', transitionActivity > 0);
    document.body.classList.toggle('is-axis-continuity', isProjectAxisContinuity);

    const sectionIndex = current.dataset.sectionIndex || 'A-00';
    const sectionTitle = current.dataset.sectionTitle || current.dataset.sectionName || 'PORTFOLIO';

    if (indicatorIndex) {
      indicatorIndex.textContent = sectionIndex;
    }

    if (indicatorName) {
      indicatorName.textContent = sectionTitle;
    }

    if (currentIndex) {
      currentIndex.textContent = sectionIndex;
    }

    if (currentTitle) {
      currentTitle.textContent = sectionTitle;
    }
  };

  let continuityRaf = null;

  const requestUpdate = () => {
    if (continuityRaf) return;

    continuityRaf = window.requestAnimationFrame(() => {
      continuityRaf = null;
      updateContinuity();
    });
  };

  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate);
  updateContinuity();
}

function initSectionReveal() {
  const revealSections = document.querySelectorAll('.section-reveal:not(.hero):not(.project-axis-section), .about-shave-reveal, .about-standard, .profile, .tools-photo-section, .works-display, .contact');
  if (!revealSections.length) return;

  if (reduceMotion) {
    revealSections.forEach((section) => section.classList.add('section-in'));
    return;
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('section-in');
      sectionObserver.unobserve(entry.target);
    });
  }, {
    threshold:.18,
    rootMargin:'0px 0px -8% 0px'
  });

  revealSections.forEach((section) => sectionObserver.observe(section));
}

function initTitleReveal() {
  const titleTargets = document.querySelectorAll('.hero-title, .profile h2, .works-copy h2, .contact h2');
  if (!titleTargets.length) return;

  titleTargets.forEach((title) => {
    title.classList.add('title-reveal');
  });

  if (reduceMotion) {
    titleTargets.forEach((title) => title.classList.add('title-in'));
    return;
  }

  requestAnimationFrame(() => {
    document.querySelector('.hero-title')?.classList.add('title-in');
  });

  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('title-in');
      titleObserver.unobserve(entry.target);
    });
  }, {
    threshold:.25,
    rootMargin:'0px 0px -10% 0px'
  });

  titleTargets.forEach((title) => {
    if (!title.classList.contains('hero-title')) {
      titleObserver.observe(title);
    }
  });
}

initPageContinuity();
initSectionReveal();
initTitleReveal();
initHeroIntroInteractions();
initWorksInspector();
initProjectFilters();
initInteractionHints();
initContactLinks();
initWorksPreviewCursor();
initToolsPegboardInteraction();
initSectionStageIndicator();
initPlaneCursorScratchReveal();

const navLinks = [...document.querySelectorAll('.nav a')];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
let navRaf = null;

function updateActiveNavLink() {
  navRaf = null;

  const viewportAnchor = window.innerHeight * 0.45;
  let activeSection = navSections[0] || null;

  navSections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= viewportAnchor && rect.bottom >= viewportAnchor) {
      activeSection = section;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${activeSection?.id}`);
  });
}

function requestActiveNavUpdate() {
  if (navRaf) return;
  navRaf = requestAnimationFrame(updateActiveNavLink);
}

window.addEventListener('scroll', requestActiveNavUpdate, {passive:true});
window.addEventListener('resize', requestActiveNavUpdate);
updateActiveNavLink();

const toolSlots = document.querySelectorAll('.tool-pin');

if (toolSlots.length) {
  toolSlots.forEach((slot) => {
    slot.addEventListener('click', (event) => {
      const isTouchLike = window.matchMedia('(hover: none)').matches;

      if (!isTouchLike) return;

      event.stopPropagation();

      const isActive = slot.classList.contains('is-active');

      toolSlots.forEach((item) => item.classList.remove('is-active'));

      if (!isActive) {
        slot.classList.add('is-active');
      }
    });
  });

  document.addEventListener('click', () => {
    toolSlots.forEach((item) => item.classList.remove('is-active'));
  });
}

const projectModalData = {
  kia: {
    no: '01 / MAIN PROJECT',
    title: 'KIA Website',
    type: '기아 공식 웹사이트 리뉴얼 프로젝트',
    image: 'assets/kia-thumb.webp',
    alt: 'KIA Website project board',
    desc: 'KIA Website는 차량 탐색 과정에서 필요한 정보를 빠르게 비교하고 이해할 수 있도록, 브랜드 톤과 정보 구조를 함께 정리한 웹 리뉴얼 프로젝트입니다.',
    points: [
      '모델 탐색, 차량 정보, 구매 전환 흐름을 기준으로 주요 화면 구조를 재정리',
      '브랜드 이미지를 유지하면서도 사용자가 핵심 정보를 빠르게 비교하도록 시각 위계 설계',
      'PC 중심의 시네마틱 레이아웃에서 반응형 화면까지 이어지는 웹 UI 흐름 구성'
    ],
    links: {
      live: 'https://kia-eta.vercel.app/',
      planning: 'https://www.figma.com/slides/Pf4margiAH7b5YlR20yY8T',
      github: '',
      figma: '',
      prototype: ''
    },
    tags: ['UI/UX', 'Frontend', 'Responsive Web']
  },
  gunit: {
    no: '02 / MAIN PROJECT',
    title: 'GUNIT App',
    type: '에어소프트 입문자를 첫 경기까지 연결하는 온보딩 기반 커뮤니티 서비스',
    image: 'assets/gunit-thumb.webp',
    alt: 'GUNIT App project board',
    desc: 'GUNIT은 에어소프트 입문자가 정보 탐색에서 멈추지 않고 실제 첫 참여까지 이어질 수 있도록 설계한 온보딩 기반 커뮤니티 앱입니다.',
    points: [
      '초보자가 막히는 지점을 정보 부족, 동행 부족, 준비 부담으로 나누어 흐름 정의',
      '정보 탐색 → 준비 → 매칭 → 경기 참여까지 이어지는 온보딩 구조 설계',
      'AI 가이드, 버디 매칭, 경기/필드 탐색, 장비 안내 기능을 하나의 서비스 흐름으로 연결',
      '초보자도 안전하게 시작할 수 있도록 단계별 안내와 커뮤니티 진입 UX 구성'
    ],
    links: {
      live: 'https://airsoft-nine.vercel.app/',
      planning: 'https://www.figma.com/slides/ukARyKFs7EQbnPLwJjztRW',
      github: '',
      figma: '',
      prototype: ''
    },
    tags: ['APP DESIGN', 'UX/UI', 'ONBOARDING', 'COMMUNITY', 'AI GUIDE', 'BUDDY MATCHING']
  },
  gro: {
    no: '03 / MAIN PROJECT',
    title: 'GRO App',
    type: '반려식물 루틴 관리 앱 프로젝트',
    image: 'assets/GRO-project-thumb.webp',
    alt: 'GRO App project board',
    desc: 'GRO App은 반려식물 관리 루틴을 쉽게 기록하고 반복할 수 있도록, 초보자의 관찰 흐름에 맞춰 정리한 앱 프로젝트입니다.',
    points: [
      '물 주기, 빛 환경, 성장 상태를 루틴 단위로 기록하는 관리 흐름 설계',
      '초보 사용자도 식물 상태를 이해할 수 있도록 기록 항목과 정보 구조를 단순화',
      '반복 관리에 집중할 수 있도록 홈, 루틴, 기록 화면의 우선순위 정리',
      '차분한 그린 톤 UI와 카드형 정보 구조로 일상적인 관리 경험 제공'
    ],
    links: {
      live: 'https://jaeking92-lgtm.github.io/gro-plant-care/',
      planning: '',
      github: '',
      figma: '',
      prototype: ''
    },
    tags: ['App Design', 'Routine', 'Plant Care']
  },
  character: {
    no: '01 / SUPPORTING WORK',
    title: 'Character Design',
    type: '캐릭터 시스템과 3D 적용 보드',
    image: 'assets/character-crop.webp',
    alt: 'Character Design board',
    desc: '캐릭터의 성격, 장면, 적용 가능성을 한 장의 보드에서 읽을 수 있도록 정리한 캐릭터 시스템 작업입니다.',
    points: [
      '빵랑자 캐릭터의 성격과 세계관을 한눈에 읽히는 포스터 보드로 구성',
      '장면 일러스트, 표정, 키 모티프, 컬러 팔레트를 캐릭터 시스템으로 정리',
      '2D 캐릭터가 3D 스탠디와 굿즈 형태로 확장될 수 있는 적용 방향 제안'
    ],
    git: '',
    tags: ['Character', 'Illustration', '3D Application']
  },
  residential: {
    no: '02 / 3D WORK',
    title: 'Residential House',
    type: '협소 대지 주거 공간 3D 시각화',
    image: 'assets/modeling-pavilion-board.webp',
    alt: 'Residential House Project board',
    desc: '협소 대지의 주거 공간을 외관, 내부, 평면, 단면 정보가 함께 읽히도록 구성한 3D 시각화 보드입니다.',
    points: [
      '협소 대지 조건에서 수직 동선과 채광 구조가 드러나도록 공간 모델링',
      '외관 렌더링, interior perspective, floor plan, section을 한 장의 보드로 정리',
      'exploded view를 통해 층별 구조와 내부 연결 방식을 이해하기 쉽게 표현'
    ],
    git: '',
    tags: ['3D Modeling', 'Rendering', 'Architecture']
  },
  pavilion: {
    no: '03 / 3D WORK',
    title: 'Wood Pavilion',
    type: '목구조 파빌리온 공간 렌더링 보드',
    image: 'assets/modeling-residential-board.webp',
    alt: 'Wood Pavilion Architectural Space Study board',
    desc: '목재 구조와 자연광, 내부 체류 경험을 건축 보드 형식으로 정리한 3D 공간 시각화 작업입니다.',
    points: [
      '목구조의 반복 리듬과 재료감을 외관 및 내부 렌더링으로 표현',
      'plan / section과 interior view를 함께 배치해 공간 구조와 사용 흐름 설명',
      '따뜻한 우드 톤과 빛의 방향을 중심으로 차분한 체류 공간의 분위기 구성'
    ],
    git: '',
    tags: ['3D Modeling', 'Wood Space', 'Light Study']
  }
};

const projectModal = document.getElementById('projectModal');
const projectModalImage = document.getElementById('projectModalImage');
const projectModalFallback = document.getElementById('projectModalImageFallback');
const projectModalFallbackNo = document.getElementById('projectModalFallbackNo');
const projectModalFallbackTitle = document.getElementById('projectModalFallbackTitle');
const projectModalNo = document.getElementById('projectModalNo');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectModalType = document.getElementById('projectModalType');
const projectModalDesc = document.getElementById('projectModalDesc');
const projectModalPoints = document.getElementById('projectModalPoints');
const projectModalLinkSection = document.getElementById('projectModalLinkSection');
const projectModalGitLabel = document.getElementById('projectModalGitLabel');
const projectModalGit = document.getElementById('projectModalGit');
const projectModalLink = document.getElementById('projectModalLink');
const projectModalLinks = document.getElementById('projectModalLinks');
const projectModalTags = document.getElementById('projectModalTags');
const projectOpenButtons = document.querySelectorAll('.project-open');
const axisProjectButtons = document.querySelectorAll('[data-axis-project]');
let pinnedWorksCard = null;
let lastFocusedProjectTrigger = null;
let centeredAxisProjectButton = null;
let centeredAxisProjectKey = null;
let axisProjectModalTimer = null;
let axisCardSwapStartedAt = 0;
let axisCardSwapRaf = null;
let lastAxisProjectModalOpenAt = 0;
const axisFitZoomMotion = {
  zoom: 1,
  focusOpacity: 0,
  pullLineOpacity: 0,
  bgPullScale: 1,
  ready: false
};

function easeAxisFitValue(current, target, strength = .16, snapDistance = .001) {
  if (Math.abs(target - current) <= snapDistance) return target;
  return current + (target - current) * strength;
}

function getSmoothedAxisFitMotion(target) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!axisFitZoomMotion.ready || reduceMotion) {
    axisFitZoomMotion.zoom = target.zoom;
    axisFitZoomMotion.focusOpacity = target.focusOpacity;
    axisFitZoomMotion.pullLineOpacity = target.pullLineOpacity;
    axisFitZoomMotion.bgPullScale = target.bgPullScale;
    axisFitZoomMotion.ready = true;
    return axisFitZoomMotion;
  }

  axisFitZoomMotion.zoom = easeAxisFitValue(axisFitZoomMotion.zoom, target.zoom, .18);
  axisFitZoomMotion.focusOpacity = easeAxisFitValue(axisFitZoomMotion.focusOpacity, target.focusOpacity, .20);
  axisFitZoomMotion.pullLineOpacity = easeAxisFitValue(axisFitZoomMotion.pullLineOpacity, target.pullLineOpacity, .20);
  axisFitZoomMotion.bgPullScale = easeAxisFitValue(axisFitZoomMotion.bgPullScale, target.bgPullScale, .16);

  const shouldContinue =
    Math.abs(axisFitZoomMotion.zoom - target.zoom) > .002 ||
    Math.abs(axisFitZoomMotion.focusOpacity - target.focusOpacity) > .003 ||
    Math.abs(axisFitZoomMotion.pullLineOpacity - target.pullLineOpacity) > .003 ||
    Math.abs(axisFitZoomMotion.bgPullScale - target.bgPullScale) > .002;

  if (shouldContinue) {
    requestAxisUpdate();
  }

  return axisFitZoomMotion;
}

function refreshAxisCardPositions() {
  window.requestAnimationFrame(() => {
    updateAxisInteraction();
  });
}

function animateAxisCardSwap() {
  refreshAxisCardPositions();

  if (performance.now() - axisCardSwapStartedAt < 460) {
    axisCardSwapRaf = window.requestAnimationFrame(animateAxisCardSwap);
  } else {
    axisCardSwapRaf = null;
  }
}

function updateAxisModalHitLayerSlots() {
  const hitButtons = Array.from(document.querySelectorAll('.axis-modal-hit-layer [data-axis-project]'));
  if (!hitButtons.length) return;

  const slots = getAxisVisibleSlotKeys();
  const labels = {
    kia: 'KIA Website 상세 보기',
    gunit: 'GUNIT App 상세 보기',
    gro: 'GRO App 상세 보기'
  };

  hitButtons.forEach((button, index) => {
    const projectKey = slots[index] || slots[0];
    button.dataset.axisProject = projectKey;
    button.setAttribute('aria-label', labels[projectKey] || '프로젝트 상세 보기');
  });
}

function getAxisVisibleSlotKeys() {
  const slots = ['kia', 'gunit', 'gro'];
  const selectedIndex = slots.indexOf(centeredAxisProjectKey);

  if (selectedIndex >= 0 && selectedIndex !== 1) {
    [slots[selectedIndex], slots[1]] = [slots[1], slots[selectedIndex]];
  }

  return slots;
}

function getAxisProjectButtonByKey(projectKey) {
  return (
    Array.from(document.querySelectorAll('.axis-card-stack .axis-stack-card[data-axis-project]'))
      .find((button) => button.dataset.axisProject === projectKey) ||
    null
  );
}

function getAxisProjectKeyFromVisibleCardPoint(x, y) {
  const hitPadding = 12;
  const cards = Array.from(document.querySelectorAll('.axis-card-stack .axis-stack-card[data-axis-project]'))
    .map((card) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      return {
        card,
        rect,
        distance: Math.hypot(x - centerX, y - centerY),
        contains:
          rect.width > 0 &&
          rect.height > 0 &&
          x >= rect.left - hitPadding &&
          x <= rect.right + hitPadding &&
          y >= rect.top - hitPadding &&
          y <= rect.bottom + hitPadding
      };
    })
    .filter(({rect, contains}) => (
      contains &&
        rect.width > 0 &&
        rect.height > 0
    ));

  if (!cards.length) return '';

  cards.sort((a, b) => a.distance - b.distance);

  return cards[0].card.dataset.axisProject || '';
}

function showProjectImageFallback(data) {
  projectModalImage?.parentElement?.style.removeProperty('--project-modal-image');

  if (projectModalImage) {
    projectModalImage.hidden = true;
    projectModalImage.removeAttribute('src');
    projectModalImage.alt = '';
  }

  if (projectModalFallback) {
    projectModalFallback.hidden = false;
  }
  if (projectModalFallbackNo) projectModalFallbackNo.textContent = data.no;
  if (projectModalFallbackTitle) projectModalFallbackTitle.textContent = data.title;
}

function setProjectModalImage(data) {
  if (!projectModalImage) return;

  projectModalImage.onload = () => {
    projectModalImage.hidden = false;
    if (projectModalFallback) projectModalFallback.hidden = true;
  };

  projectModalImage.onerror = () => {
    showProjectImageFallback(data);
  };

  if (data.image) {
    projectModalImage.parentElement?.style.setProperty('--project-modal-image', `url("${data.image}")`);
    projectModalImage.hidden = false;
    projectModalImage.alt = data.alt || data.title;
    projectModalImage.src = data.image;
  } else {
    showProjectImageFallback(data);
  }
}

function openProjectModal(projectKey, trigger = null) {
  const data = projectModalData[projectKey];
  if (!data || !projectModal) return;

  lastFocusedProjectTrigger = trigger || document.activeElement;

  setProjectModalImage(data);

  if (projectModalNo) projectModalNo.textContent = data.no;
  if (projectModalTitle) projectModalTitle.textContent = data.title;
  if (projectModalType) projectModalType.textContent = data.type;
  if (projectModalDesc) projectModalDesc.textContent = data.desc;

  if (projectModalPoints) {
    projectModalPoints.replaceChildren(...data.points.map((point) => {
      const item = document.createElement('li');
      item.textContent = point;
      return item;
    }));
  }

  const linkData = data.links || {};
  const modalLinks = [
    {
      label: 'Live Site',
      href: linkData.live ?? data.liveSite ?? ''
    },
    {
      label: 'Planning Doc',
      href: linkData.planning ?? data.planningDoc ?? ''
    },
    {
      label: 'GitHub',
      href: linkData.github ?? data.git ?? ''
    },
    {
      label: 'Figma',
      href: linkData.figma ?? data.figma ?? ''
    },
    {
      label: 'Prototype',
      href: linkData.prototype ?? data.prototype ?? ''
    }
  ].filter((link) => Boolean(link.href));
  const shouldShowLinks = modalLinks.length > 0;

  if (projectModalGitLabel) {
    projectModalGitLabel.textContent = 'LINKS';
  }

  if (projectModalLinkSection) {
    projectModalLinkSection.hidden = !shouldShowLinks;
  }

  if (projectModalLinks) {
    projectModalLinks.replaceChildren(...modalLinks.map((link) => {
      const item = document.createElement('a');
      item.className = 'project-modal-link-card';
      item.href = link.href;
      item.target = '_blank';
      item.rel = 'noopener noreferrer';

      const label = document.createElement('span');
      label.textContent = link.label;

      const address = document.createElement('strong');
      address.textContent = link.href;

      const action = document.createElement('em');
      action.textContent = 'OPEN';

      item.append(label, address, action);
      return item;
    }));
  }

  if (projectModalGit) {
    projectModalGit.value = data.git || '';
  }

  if (projectModalLink) {
    projectModalLink.hidden = true;
    projectModalLink.removeAttribute('href');
    projectModalLink.setAttribute('aria-disabled', 'true');
  }

  if (projectModalTags) {
    projectModalTags.replaceChildren(...data.tags.map((tag) => {
      const item = document.createElement('span');
      item.textContent = tag;
      return item;
    }));
  }

  projectModal.classList.add('is-open');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  window.setTimeout(() => {
    projectModal.querySelector('[data-modal-close]')?.focus();
  }, 0);
}

function closeProjectModal() {
  if (!projectModal || !projectModal.classList.contains('is-open')) return;

  projectModal.classList.remove('is-open');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  pinnedWorksCard?.classList.remove('is-pinned');
  pinnedWorksCard = null;
  lastFocusedProjectTrigger?.focus?.();
  lastFocusedProjectTrigger = null;
}

projectOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const projectKey = button.dataset.project;
    if (!projectModalData[projectKey]) return;

    pinnedWorksCard?.classList.remove('is-pinned');
    pinnedWorksCard = button;
    button.classList.add('is-pressing');
    button.classList.add('is-pinned');

    window.setTimeout(() => {
      button.classList.remove('is-pressing');
      openProjectModal(projectKey, button);
    }, 130);
  });
});

axisProjectButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    if (!button.closest('.axis-modal-hit-layer') && event.detail !== 0) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.stopPropagation();
    openAxisProjectModalFromButton(button);
  });
});

function openAxisProjectModalFromButton(button) {
  const projectKey = button?.dataset?.axisProject;
  if (!projectModalData[projectKey]) return;
  if (projectModal?.classList.contains('is-open')) return;

  lastAxisProjectModalOpenAt = performance.now();
  centeredAxisProjectButton = button;
  centeredAxisProjectKey = projectKey;
  axisCardSwapStartedAt = performance.now();
  button.classList.add('is-axis-centered');
  updateAxisModalHitLayerSlots();
  refreshAxisCardPositions();

  if (axisCardSwapRaf) {
    window.cancelAnimationFrame(axisCardSwapRaf);
  }
  axisCardSwapRaf = window.requestAnimationFrame(animateAxisCardSwap);

  window.clearTimeout(axisProjectModalTimer);
  axisProjectModalTimer = window.setTimeout(() => {
    openProjectModal(projectKey, button);
  }, 500);
}

function getAxisProjectButtonAtPoint(x, y) {
  const directHit = document
    .elementsFromPoint(x, y)
    .map((element) => element.closest?.('[data-axis-project]'))
    .find(Boolean);

  if (directHit) return directHit;

  const candidates = Array.from(axisProjectButtons)
    .map((button) => ({button, rect: button.getBoundingClientRect()}))
    .filter(({rect}) => (
      rect.width > 0 &&
      rect.height > 0 &&
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ));

  if (!candidates.length) return null;

  candidates.sort((a, b) => {
    const aDistance = Math.hypot(
      x - (a.rect.left + a.rect.width / 2),
      y - (a.rect.top + a.rect.height / 2)
    );
    const bDistance = Math.hypot(
      x - (b.rect.left + b.rect.width / 2),
      y - (b.rect.top + b.rect.height / 2)
    );

    return aDistance - bDistance;
  });

  return candidates[0].button;
}

function getOrderedAxisProjectButtons() {
  return ['kia', 'gunit', 'gro']
    .map((projectKey) => Array.from(axisProjectButtons).find((button) => button.dataset.axisProject === projectKey))
    .filter(Boolean);
}

function getAxisProjectButtonFromPillarPoint(x, y) {
  const orderedButtons = getOrderedAxisProjectButtons();
  const axisStage = document.querySelector('.project-axis-stage');
  const pillarRect = axisStage?.querySelector('.axis-card-stack')?.getBoundingClientRect() ||
    axisStage?.querySelector('.axis-composite-pillar')?.getBoundingClientRect();

  if (
    !orderedButtons.length ||
    !pillarRect ||
    pillarRect.width <= 0 ||
    pillarRect.height <= 0 ||
    x < pillarRect.left ||
    x > pillarRect.right ||
    y < pillarRect.top ||
    y > pillarRect.bottom
  ) {
    return null;
  }

  const relativeX = (x - pillarRect.left) / pillarRect.width;
  const index = Math.max(0, Math.min(orderedButtons.length - 1, Math.floor(relativeX * orderedButtons.length)));

  return orderedButtons[index] || null;
}

function getAxisProjectButtonFromStagePoint(x, y) {
  const axisStage = document.querySelector('.project-axis-stage');
  const orderedButtons = getOrderedAxisProjectButtons();
  if (!axisStage || !orderedButtons.length) return null;

  const rect = axisStage.getBoundingClientRect();
  const localX = (x - rect.left) / Math.max(rect.width, 1);
  const localY = (y - rect.top) / Math.max(rect.height, 1);
  const isInVisiblePillarZone =
    localX >= .11 &&
    localX <= .89 &&
    localY >= .18 &&
    localY <= .82;

  if (!isInVisiblePillarZone) return null;

  const index = Math.max(0, Math.min(
    orderedButtons.length - 1,
    Math.floor(((localX - .11) / .78) * orderedButtons.length)
  ));

  return orderedButtons[index] || null;
}

document.addEventListener('pointerup', (event) => {
  if (projectModal?.classList.contains('is-open')) return;
  if (performance.now() - lastAxisProjectModalOpenAt < 450) return;

  const projectKey = getAxisProjectKeyFromVisibleCardPoint(event.clientX, event.clientY);
  if (!projectKey) return;

  const button = getAxisProjectButtonByKey(projectKey);
  if (!button) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  openAxisProjectModalFromButton(button);
}, true);

document.addEventListener('click', (event) => {
  if (projectModal?.classList.contains('is-open')) return;
  if (performance.now() - lastAxisProjectModalOpenAt < 650) return;

  const projectKey = getAxisProjectKeyFromVisibleCardPoint(event.clientX, event.clientY);
  if (!projectKey) return;

  const button = getAxisProjectButtonByKey(projectKey);
  if (!button) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  openAxisProjectModalFromButton(button);
}, true);

document.querySelectorAll('[data-modal-close]').forEach((button) => {
  button.addEventListener('click', closeProjectModal);
});

document.addEventListener('keydown', (event) => {
  if (!projectModal?.classList.contains('is-open')) return;

  if (event.key === 'Escape') {
    closeProjectModal();
    return;
  }

  if (event.key === 'Tab') {
    const focusable = Array.from(projectModal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

function initWorksInspector() {
  if (initWorksInspector.isInitialized) return;

  const cards = document.querySelectorAll('[data-inspector-target]');
  const panels = document.querySelectorAll('[data-inspector-panel]');
  const works = document.querySelector('.works-display');
  const cardList = document.querySelector('.works-hanging-list');

  if (!cards.length || !panels.length) return;

  initWorksInspector.isInitialized = true;

  const updateWorkFocus = (targetName) => {
    const activeCard = Array.from(cards).find((card) => card.dataset.inspectorTarget === targetName);

    if (!works || !cardList || !activeCard) {
      works?.classList.remove('is-work-previewing');
      return;
    }

    const listRect = cardList.getBoundingClientRect();
    const cardRect = activeCard.getBoundingClientRect();

    if (!listRect.height) return;

    const y = ((cardRect.top + cardRect.height / 2 - listRect.top) / listRect.height) * 100;

    works.classList.add('is-work-previewing');
    works.style.setProperty('--works-active-y', `${y.toFixed(2)}%`);
  };

  const activatePanel = (targetName) => {
    panels.forEach((panel) => {
      const isTarget = panel.dataset.inspectorPanel === targetName;
      panel.classList.toggle('is-active', isTarget);
    });

    cards.forEach((card) => {
      card.classList.toggle('is-previewing', card.dataset.inspectorTarget === targetName);
    });

    updateWorkFocus(targetName);
  };

  const resetPanel = () => {
    activatePanel('character');
  };

  cards.forEach((card) => {
    const target = card.dataset.inspectorTarget;

    card.addEventListener('mouseenter', () => {
      activatePanel(target);
    });

    card.addEventListener('focus', () => {
      activatePanel(target);
    });

  });

  cardList?.addEventListener('mouseleave', resetPanel);
  cardList?.addEventListener('focusout', (event) => {
    if (!cardList.contains(event.relatedTarget)) {
      resetPanel();
    }
  });

  resetPanel();
}

function initProjectFilters() {
  if (initProjectFilters.isInitialized) return;

  const filters = document.querySelectorAll('[data-project-filter]');
  const cards = document.querySelectorAll('.works-hanging-card[data-project-category]');

  if (!filters.length || !cards.length) return;

  initProjectFilters.isInitialized = true;

  const setFilter = (filterName) => {
    filters.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.projectFilter === filterName));
    });

    cards.forEach((card) => {
      const isVisible = filterName === 'all' || card.dataset.projectCategory === filterName;
      card.classList.toggle('is-filtered-out', !isVisible);
    });
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      setFilter(button.dataset.projectFilter || 'all');
    });
  });

  setFilter('all');
}

function initInteractionHints() {
  const toolsSection = document.querySelector('#tools');
  const axisSection = document.querySelector('#merge');
  const axisStage = axisSection?.querySelector('.project-axis-stage');
  const axisCards = Array.from(axisSection?.querySelectorAll('.axis-stack-card[data-axis-project]') || []);
  const worksSection = document.querySelector('#works');

  const dismiss = (section) => {
    section?.classList.add('is-interaction-hint-dismissed');
  };

  document.querySelectorAll('#tools [data-tool-target]').forEach((tool) => {
    ['pointerenter', 'focus', 'click'].forEach((eventName) => {
      tool.addEventListener(eventName, () => dismiss(toolsSection), {once:true});
    });
  });

  document.querySelectorAll('#works .works-hanging-card, #works [data-project-filter]').forEach((control) => {
    ['pointerenter', 'focus', 'click'].forEach((eventName) => {
      control.addEventListener(eventName, () => dismiss(worksSection), {once:true});
    });
  });

  const clearAxisCardHover = () => {
    axisStage?.classList.remove('has-axis-card-hover');
    axisCards.forEach((card) => card.classList.remove('is-axis-hovered'));
  };

  axisStage?.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || axisStage.classList.contains('has-foundation-visible')) {
      clearAxisCardHover();
      return;
    }

    const projectKey = getAxisProjectKeyFromVisibleCardPoint(event.clientX, event.clientY);
    axisStage.classList.toggle('has-axis-card-hover', Boolean(projectKey));
    axisCards.forEach((card) => {
      card.classList.toggle('is-axis-hovered', card.dataset.axisProject === projectKey);
    });
  });
  axisStage?.addEventListener('pointerleave', clearAxisCardHover);

  const dismissAxisHint = () => dismiss(axisSection);
  axisStage?.addEventListener('pointerdown', dismissAxisHint, {once:true});
  document.querySelector('[data-axis-skip]')?.addEventListener('click', dismissAxisHint, {once:true});
  const onAxisWheel = () => {
    const rect = axisSection?.getBoundingClientRect();
    if (!rect || rect.top >= window.innerHeight || rect.bottom <= 0) return;

    dismissAxisHint();
    window.removeEventListener('wheel', onAxisWheel);
  };
  window.addEventListener('wheel', onAxisWheel, {passive:true});
}

async function initContactLinks() {
  if (initContactLinks.isInitialized) return;

  const linkArea = document.querySelector('[data-contact-links]');
  if (!linkArea) return;

  initContactLinks.isInitialized = true;

  const email = (linkArea.dataset.contactEmail || '').trim();
  const resumeUrl = (linkArea.dataset.resumeUrl || '').trim();
  const portfolioUrl = (linkArea.dataset.portfolioUrl || '').trim();

  const canLoad = async (url) => {
    if (!url) return false;

    try {
      const response = await fetch(url, {method: 'HEAD', cache: 'no-store'});
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const candidates = [
    email
      ? {label: 'Email', href: `mailto:${email}`}
      : null,
    resumeUrl && await canLoad(resumeUrl)
      ? {label: 'Resume', href: resumeUrl, external: true}
      : null,
    portfolioUrl && await canLoad(portfolioUrl)
      ? {label: 'Portfolio PDF', href: portfolioUrl, external: true}
      : null,
  ].filter(Boolean);

  linkArea.replaceChildren(...candidates.map((item) => {
    const link = document.createElement('a');
    link.textContent = item.label;
    link.href = item.href;

    if (item.external) {
      link.target = '_blank';
      link.rel = 'noreferrer';
    }

    return link;
  }));
}

/* A-03 Project Axis: card stack assembly and manual foundation fitting. */
function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function range(value, min, max) {
  return clamp01((value - min) / (max - min));
}

function smooth(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function setAxisVar(name, value) {
  const axisStage = document.querySelector('.project-axis-stage');
  if (!axisStage) return;
  axisStage.style.setProperty(name, value);
}

function timelineProgress(key, value) {
  const timing = AXIS_TIMELINE[key];
  if (!timing) return 0;

  return smooth(range(value, timing[0], timing[1]));
}

const axisManualCutState = {
  pathLength: 0,
  traceSamples: [],
  traceSampleKey: '',
  traceDrawComplete: false,
  maxTraceLiftProgress: 0,
  cutReady: false,
  cutComplete: false,
  isSnapped: false,
  maxReachedIndex: 0,
  cutProgress: 0,
  finalPillarClip: '',
  finalCardClips: [],
  cutCompleteScrollY: null,
  settleProgress: 0,
  settleTargetY: 0,
  settleAnimationRaf: null,
  settleAnimationStartedAt: 0,
  contactHoldProgress: 0,
  contactHoldComplete: false,
  contactHoldScrollY: null,
  traceHoldProgress: 0,
  traceHoldComplete: false,
  traceHoldScrollY: null,
  contactImpactPlayed: false,
  contactImpactActive: false,
  contactImpactStartedAt: 0,
  contactImpactTimer: null,
  stabilityWheelProgress: 0,
  stabilityComplete: false,
  isInitialized: false
};

const TRACE_SAMPLE_COUNT = 220;
const MAGNET_IN = 86;
const MAGNET_OUT = 128;
const MAX_FORWARD_JUMP = TRACE_SAMPLE_COUNT;
const AXIS_CUT_COMPLETE_FALLBACK_PROGRESS = 0.92;
const AXIS_CONTACT_HOLD_START_PROGRESS = 0.790;
const AXIS_CONTACT_HOLD_REARM_PROGRESS = 0.785;
const AXIS_CONTACT_HOLD_RESET_PROGRESS = 0.60;
const AXIS_CRITICAL_WHEEL_START_PROGRESS = 0.70;
const AXIS_CRITICAL_WHEEL_MAX_DELTA = 320;
const AXIS_HOLD_WHEEL_MAX_DELTA = 220;
const AXIS_STABILITY_WHEEL_RESISTANCE = 0.68;
const AXIS_PILLAR_SEAT_ANCHOR_RATIO = 0;
const AXIS_PILLAR_SETTLE_SEAT_ANCHOR_RATIO = 0;
const AXIS_PILLAR_SURFACE_LIFT = -14;
const AXIS_PILLAR_CUT_SEAT_COMPENSATION = AXIS_PILLAR_SURFACE_LIFT;
const AXIS_PILLAR_UNCUT_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
const AXIS_PILLAR_TRACE_CLIP_MIN_Y = 0;
const AXIS_PILLAR_TRACE_CLIP_OVERLAP_PX = 0;
const AXIS_ENABLE_FINAL_STABILITY_TEST = false;
const AXIS_CARD_PILLAR_SIDE_CLIPS = [
  [[0, 0], [46, 0], [42, 100], [0, 100]],
  [[31, 0], [74, 0], [70, 100], [27, 100]],
  [[55, 0], [100, 0], [100, 100], [59, 100]]
];
const AXIS_TRACE_VIEWBOX_H = 220;
const AXIS_TRACE_STONE_SURFACE_ANCHOR_Y = 106;
const AXIS_TRACE_TRANSFER_ANCHOR_Y = 106;
const AXIS_FOUNDATION_VISIBLE_TOP_RATIO = 0.118;
const AXIS_TRACE_TRANSFER_TARGET_OFFSET = 8;
const AXIS_FOUNDATION_TRACE_PATH_D = 'M100.56 93.97 L110.55 86.67 L120.53 78.58 L130.52 73.1 L140.5 69.62 L150.49 67.85 L160.47 67.56 L170.46 67.95 L180.44 68.74 L190.43 69.62 L200.41 70.45 L210.39 71.63 L220.38 73.39 L230.36 75.1 L240.35 76.87 L250.33 78.19 L260.32 78.14 L270.3 77.21 L280.29 75.84 L290.27 74.47 L300.26 73.29 L310.24 71.77 L320.23 70.45 L330.21 69.27 L340.2 68.34 L350.18 67.56 L360.17 67.27 L370.15 66.63 L380.14 65.99 L390.12 65.21 L400.11 64.08 L410.09 62.61 L420.08 60.8 L430.06 58.79 L440.05 56.78 L450.03 54.67 L460.02 53.1 L470 51.54 L479.99 49.38 L489.97 46.88 L499.96 44.24 L509.94 41.54 L519.93 38.9 L529.91 36.3 L539.89 33.95 L549.88 31.89 L559.86 30.08 L569.85 28.61 L579.83 27.33 L589.82 26.35 L599.8 25.76 L609.79 26.3 L619.77 27.87 L629.76 31.55 L639.74 36.84 L649.73 40.86 L659.71 43.55 L669.7 45.71 L679.68 47.57 L689.67 49.18 L699.65 50.41 L709.64 51.14 L719.62 51.49 L729.61 51.44 L739.59 51.14 L749.58 50.61 L759.56 49.77 L769.55 48.79 L779.53 47.91 L789.52 47.13 L799.5 46.59 L809.49 46.98 L819.47 49.38 L829.46 55.8 L839.44 61.68 L849.42 65.94 L859.41 70.65 L869.39 77.75 L879.38 84.95 L889.36 92.25 L899.35 100.88 L908.26 106.02';
const AXIS_FOUNDATION_TRACE_PATH_IDS = [
  'foundationContourPath',
  'foundationTraceDrawPath',
  'foundationTraceDashedPath',
  'foundationTraceCutDonePath'
];
const AXIS_TIMELINE = {
  entry: [0.00, 0.04],
  hold: [0.04, 0.07],
  gather: [0.06, 0.18],
  stack: [0.14, 0.30],
  press: [0.26, 0.40],
  board: [0.36, 0.50],
  pillar: [0.44, 0.62],
  stand: [0.42, 0.60],
  pillarHandoff: [0.56, 0.68],
  foundation: [0.705, 0.745],
  contact: [0.745, 0.765],
  mismatch: [0.765, 0.785],
  bounce: [0.785, 0.805],
  contour: [0.770, 0.815],
  transfer: [0.815, 0.855]
};
const AxisFitStage = {
  PILLAR_READY: 'PILLAR_READY',
  FOUNDATION_APPEAR: 'FOUNDATION_APPEAR',
  FIRST_CONTACT: 'FIRST_CONTACT',
  MISMATCH_CHECK: 'MISMATCH_CHECK',
  CONTOUR_DRAW: 'CONTOUR_DRAW',
  TRANSFER_GUIDE: 'TRANSFER_GUIDE',
  USER_MANUAL_CUT: 'USER_MANUAL_CUT',
  CUT_COMPLETE: 'CUT_COMPLETE',
  SETTLE: 'SETTLE',
  FINAL: 'FINAL'
};

const axisPillarStabilityState = {
  isInitialized: false,
  isDragging: false,
  pointerId: null,
  startX: 0,
  currentForce: 0,
  maxForce: 0,
  returnRaf: null
};

const AXIS_STABILITY_DRAG_RESISTANCE = 96;
const AXIS_STABILITY_MAX_X = 13;
const AXIS_STABILITY_MAX_ROTATION = 3.2;
function setupAxisImageLoadingCheck() {
  document.querySelectorAll('.axis-card img, .axis-stack-card img').forEach((img) => {
    const markMissing = () => {
      img.closest('.axis-card')?.classList.add('is-image-missing');
    };

    if (img.complete && img.naturalWidth === 0) {
      markMissing();
    }

    img.addEventListener('error', markMissing);
    img.addEventListener('load', () => {
      img.closest('.axis-card')?.classList.remove('is-image-missing');
    });
  });
}

function setupFoundationImageFallback() {
  const foundationImg = document.querySelector('.axis-foundation-stone img');
  if (!foundationImg) return;
  if (foundationImg.dataset.axisFallbackReady === 'true') return;

  foundationImg.dataset.axisFallbackReady = 'true';

  const markMissing = () => {
    foundationImg.style.display = 'none';
    document.querySelector('.axis-foundation-stone')?.classList.add('is-missing-image');
  };

  if (foundationImg.complete && foundationImg.naturalWidth === 0) {
    markMissing();
  }

  foundationImg.addEventListener('error', markMissing);
  foundationImg.addEventListener('load', () => {
    foundationImg.style.display = '';
    document.querySelector('.axis-foundation-stone')?.classList.remove('is-missing-image');
  });
}

function sampleTracePath(path, count) {
  const svg = path.ownerSVGElement;
  const samples = [];

  if (!svg) return samples;

  const length = path.getTotalLength();
  const svgRect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox?.baseVal;
  const viewBoxX = viewBox?.x || 0;
  const viewBoxY = viewBox?.y || 0;
  const viewBoxW = viewBox?.width || 1000;
  const viewBoxH = viewBox?.height || 220;

  if (!svgRect.width || !svgRect.height || !viewBoxW || !viewBoxH) return samples;

  for (let i = 0; i <= count; i += 1) {
    const progress = i / count;
    const point = path.getPointAtLength(length * progress);
    const localXPct = ((point.x - viewBoxX) / viewBoxW) * 100;
    const localYPct = ((point.y - viewBoxY) / viewBoxH) * 100;

    samples.push({
      index: i,
      progress,
      x: svgRect.left + (localXPct / 100) * svgRect.width,
      y: svgRect.top + (localYPct / 100) * svgRect.height,
      localXPct,
      localYPct
    });
  }

  return samples;
}

function ensureAxisFoundationTracePath() {
  AXIS_FOUNDATION_TRACE_PATH_IDS.forEach((id) => {
    const path = document.getElementById(id);

    if (!path || path.dataset.axisSourcePath === 'foundation-line') return;

    path.setAttribute('d', AXIS_FOUNDATION_TRACE_PATH_D);
    path.dataset.axisSourcePath = 'foundation-line';
  });
}

function syncFoundationTraceSamples(force = false) {
  ensureAxisFoundationTracePath();

  const contourPath = document.getElementById('foundationContourPath');
  const svg = contourPath?.ownerSVGElement;

  if (!contourPath || !svg) return false;

  const svgRect = svg.getBoundingClientRect();
  const nextKey = [
    svgRect.left.toFixed(2),
    svgRect.top.toFixed(2),
    svgRect.width.toFixed(2),
    svgRect.height.toFixed(2)
  ].join('|');

  if (!force && nextKey === axisManualCutState.traceSampleKey) {
    return true;
  }

  axisManualCutState.traceSampleKey = nextKey;
  axisManualCutState.traceSamples = sampleTracePath(contourPath, TRACE_SAMPLE_COUNT);

  return axisManualCutState.traceSamples.length > 0;
}

function measureFoundationTrace() {
  ensureAxisFoundationTracePath();

  const drawPath = document.getElementById('foundationTraceDrawPath');
  const cutPath = document.getElementById('foundationTraceCutDonePath');
  const contourPath = document.getElementById('foundationContourPath');

  if (!drawPath || !cutPath || !contourPath) return;

  const length = contourPath.getTotalLength();
  axisManualCutState.pathLength = length;

  drawPath.style.strokeDasharray = length;
  cutPath.style.strokeDasharray = length;

  if (!axisManualCutState.traceDrawComplete) {
    drawPath.style.strokeDashoffset = length;
  }

  cutPath.style.strokeDashoffset = length * (1 - axisManualCutState.cutProgress);

  setAxisVar('--trace-draw-length', length.toFixed(2));
  setAxisVar('--trace-draw-offset', length.toFixed(2));
  setAxisVar('--trace-cut-length', length.toFixed(2));
  setAxisVar('--trace-cut-offset', (length * (1 - axisManualCutState.cutProgress)).toFixed(2));

  syncFoundationTraceSamples(true);
}

function findClosestTraceSample(clientX, clientY) {
  syncFoundationTraceSamples(true);

  const samples = axisManualCutState.traceSamples;
  if (!samples.length) return null;

  let closest = null;
  let closestDistance = Infinity;

  for (const sample of samples) {
    const dx = clientX - sample.x;
    const dy = clientY - sample.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = sample;
    }
  }

  if (!closest) return null;

  return {
    ...closest,
    distance: closestDistance
  };
}

function clearManualCutSnap() {
  const axisStage = document.querySelector('.project-axis-stage');

  axisManualCutState.isSnapped = false;
  axisStage?.classList.remove('is-user-cutting');
  setAxisVar('--snap-opacity', '0');
  updateTraceStateLabel();
}

function handleManualCutPointerMove(event) {
  const axisStage = document.querySelector('.project-axis-stage');

  if (!axisStage) return;
  if (!axisManualCutState.cutReady) return;
  if (axisManualCutState.cutComplete) return;

  const closest = findClosestTraceSample(event.clientX, event.clientY);
  if (!closest) return;

  const wasSnapped = axisManualCutState.isSnapped;
  const threshold = wasSnapped ? MAGNET_OUT : MAGNET_IN;

  if (closest.distance > threshold) {
    clearManualCutSnap();
    updateNextTracePoint();
    return;
  }

  axisManualCutState.isSnapped = true;
  axisStage.classList.add('is-user-cutting');

  setAxisVar('--snap-x', `${closest.localXPct.toFixed(3)}%`);
  setAxisVar('--snap-y', `${closest.localYPct.toFixed(3)}%`);
  setAxisVar('--snap-opacity', '1');
  setAxisVar('--snap-scale', '1');

  updateManualCutFromSample(closest.index);
  updateTraceStateLabel();
}

function initManualFoundationCut() {
  const traceZone = document.querySelector('[data-axis-trace-zone]');
  const axisStage = document.querySelector('.project-axis-stage');

  if (!traceZone || !axisStage || axisManualCutState.isInitialized) return;

  axisManualCutState.isInitialized = true;

  document.addEventListener('pointermove', handleManualCutPointerMove);

  document.addEventListener('pointerleave', () => {
    if (axisManualCutState.cutComplete) return;

    clearManualCutSnap();
  });

  window.addEventListener('blur', () => {
    if (axisManualCutState.cutComplete) return;

    clearManualCutSnap();
  });
}

function initAxisPillarStabilityDrag() {
  const pillarTargets = document.querySelectorAll('.axis-composite-pillar, .axis-card-stack');
  const axisStage = document.querySelector('.project-axis-stage');
  const fitLabelMain = document.querySelector('.fit-label-main');
  const fitLabelState = document.querySelector('.fit-label-state');

  if (!pillarTargets.length || !axisStage || axisPillarStabilityState.isInitialized) return;

  axisPillarStabilityState.isInitialized = true;

  const clearReturnAnimation = () => {
    if (!axisPillarStabilityState.returnRaf) return;

    cancelAnimationFrame(axisPillarStabilityState.returnRaf);
    axisPillarStabilityState.returnRaf = null;
  };

  const restorePillarStability = (startForce) => {
    clearReturnAnimation();

    const startedAt = performance.now();
    const duration = 760;

    const tick = (now) => {
      const t = Math.min(1, (now - startedAt) / duration);
      const damping = Math.pow(1 - t, 2.35);
      const oscillation = Math.cos(t * Math.PI * 5.2);
      const force = startForce * damping * oscillation;

      renderAxisStabilityForce(force);

      if (t < 1) {
        axisPillarStabilityState.returnRaf = requestAnimationFrame(tick);
        return;
      }

      axisPillarStabilityState.returnRaf = null;
      renderAxisStabilityForce(0);
      setAxisVar('--stability-gap-opacity', '0');
      setAxisVar('--stability-contact-opacity', '0');
    };

    axisPillarStabilityState.returnRaf = requestAnimationFrame(tick);
  };

  const endPillarStabilityDrag = () => {
    if (!axisPillarStabilityState.isDragging) return;

    const releaseForce = axisPillarStabilityState.currentForce;

    axisPillarStabilityState.isDragging = false;
    axisPillarStabilityState.pointerId = null;
    axisStage.classList.remove('is-stability-dragging');
    axisStage.classList.add('is-stability-returning');

    if (axisPillarStabilityState.maxForce >= 0.08) {
      completeAxisStabilityTest();
    }

    restorePillarStability(releaseForce);

    window.setTimeout(() => {
      axisStage.classList.remove('is-stability-returning');
      if (fitLabelMain) fitLabelMain.textContent = 'FINAL CONTACT';
      if (fitLabelState) fitLabelState.textContent = 'FITTED';
    }, 820);
  };

  const startPillarStabilityDrag = (event) => {
    if (!AXIS_ENABLE_FINAL_STABILITY_TEST) return;
    if (!axisStage.classList.contains('is-settled')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    clearReturnAnimation();
    axisPillarStabilityState.isDragging = true;
    axisPillarStabilityState.pointerId = event.pointerId;
    axisPillarStabilityState.startX = event.clientX;
    axisPillarStabilityState.maxForce = 0;

    if (fitLabelMain) fitLabelMain.textContent = 'STABILITY TEST';
    if (fitLabelState) fitLabelState.textContent = 'STABLE';

    renderAxisStabilityForce(0);
    axisStage.classList.remove('is-stability-returning');
    axisStage.classList.add('is-stability-dragging');
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const movePillarStabilityDrag = (event) => {
    if (!axisPillarStabilityState.isDragging) return;
    if (axisPillarStabilityState.pointerId !== event.pointerId) return;

    const dragX = event.clientX - axisPillarStabilityState.startX;
    const resisted = Math.tanh(dragX / AXIS_STABILITY_DRAG_RESISTANCE);

    renderAxisStabilityForce(resisted);
  };

  pillarTargets.forEach((pillar) => {
    pillar.addEventListener('pointerdown', startPillarStabilityDrag);
    pillar.addEventListener('pointermove', movePillarStabilityDrag);
    pillar.addEventListener('pointerup', endPillarStabilityDrag);
    pillar.addEventListener('pointercancel', endPillarStabilityDrag);
    pillar.addEventListener('lostpointercapture', () => {
      if (axisPillarStabilityState.isDragging) {
        endPillarStabilityDrag();
      }
    });
  });
}

function updateManualCutFromSample(sampleIndex) {
  const state = axisManualCutState;

  if (!state.cutReady || state.cutComplete) return;

  const hasStartedCut = state.maxReachedIndex > 0 || state.cutProgress > 0;
  const startIndex = getAxisManualCutStartIndex();

  if (
    !hasStartedCut &&
    (sampleIndex < startIndex - MAX_FORWARD_JUMP || sampleIndex > startIndex + MAX_FORWARD_JUMP * 2)
  ) {
    updateNextTracePoint();
    return;
  }

  state.maxReachedIndex = Math.max(state.maxReachedIndex, sampleIndex, startIndex);
  state.cutProgress = state.maxReachedIndex / TRACE_SAMPLE_COUNT;

  renderManualCutProgress();

  if (state.maxReachedIndex >= getAxisManualCutEndIndex()) {
    completeManualCut();
  }
}

function getAxisPillarTraceSamples(padding = 4) {
  const samples = axisManualCutState.traceSamples;
  const pillarRect = getAxisPillarMeasurementRect();

  if (!pillarRect || !samples.length) return [];

  if (!pillarRect.width) return [];

  return samples.filter((sample) => (
    sample.x >= pillarRect.left - padding &&
    sample.x <= pillarRect.right + padding
  ));
}

function getAxisManualCutStartIndex() {
  return 0;
}

function getAxisManualCutEndIndex() {
  return TRACE_SAMPLE_COUNT;
}

function getAxisManualCutCompleteProgress() {
  return getAxisManualCutEndIndex() / TRACE_SAMPLE_COUNT;
}

function renderManualCutProgress() {
  const state = axisManualCutState;
  const cutPath = document.getElementById('foundationTraceCutDonePath');

  if (!cutPath || !state.pathLength) return;

  const offset = state.pathLength * (1 - state.cutProgress);

  cutPath.style.strokeDashoffset = offset;

  setAxisVar('--trace-cut-offset', offset.toFixed(2));
  setAxisVar('--manual-cut-progress', state.cutProgress.toFixed(3));
  setAxisVar('--trace-cut-opacity', '1');

  updatePillarClipByCutProgress(state.cutProgress);
  updateNextTracePoint();
}

function completeManualCut() {
  const state = axisManualCutState;
  const axisStage = document.querySelector('.project-axis-stage');

  state.cutComplete = true;
  state.cutReady = false;
  state.isSnapped = false;
  state.cutProgress = 1;
  state.cutCompleteScrollY = window.scrollY;
  state.settleProgress = 0;

  axisStage?.classList.remove('is-cut-ready', 'is-user-cutting');
  axisStage?.classList.add('is-cut-complete');

  setAxisVar('--manual-cut-progress', '1');
  setAxisVar('--trace-pointer-events', 'none');
  setAxisVar('--snap-opacity', '0');
  setAxisVar('--next-opacity', '0');

  updatePillarClipByCutProgress(1, true);
  state.settleTargetY = getAxisPillarSettleTargetY();
  renderManualCutProgress();
  setAxisVar('--trace-opacity', '0');
  setAxisVar('--trace-draw-opacity', '0');
  setAxisVar('--trace-dashed-opacity', '0');
  setAxisVar('--trace-dotted-image-opacity', '0');
  setAxisVar('--trace-cut-opacity', '0');
  updateTraceStateLabel();
  startPostCutSettleAnimation();
  requestAxisUpdate();
}

function initAxisSkipControl() {
  const skipButton = document.querySelector('[data-axis-skip]');
  const axisSection = document.querySelector('.project-axis-section');
  const worksSection = document.querySelector('#works');

  if (!skipButton || !axisSection || !worksSection || skipButton.dataset.bound) return;

  skipButton.dataset.bound = 'true';
  skipButton.addEventListener('click', () => {
    if (!axisManualCutState.cutComplete) {
      completeManualCut();
    }

    axisManualCutState.contactHoldComplete = true;
    axisManualCutState.traceHoldComplete = true;
    axisManualCutState.settleProgress = 1;
    axisManualCutState.stabilityComplete = true;
    document.querySelector('.project-axis-stage')?.classList.add('is-settled', 'is-stability-complete');
    requestAxisUpdate();

    window.setTimeout(() => {
      const targetY = window.scrollY + worksSection.getBoundingClientRect().top;
      window.scrollTo({top:targetY, behavior:reduceMotion ? 'auto' : 'smooth'});
    }, reduceMotion ? 0 : 180);
  });
}

function startPostCutSettleAnimation() {
  const state = axisManualCutState;

  if (state.settleAnimationRaf) {
    cancelAnimationFrame(state.settleAnimationRaf);
    state.settleAnimationRaf = null;
  }

  if (reduceMotion) {
    state.settleProgress = 1;
    requestAxisUpdate();
    return;
  }

  state.settleAnimationStartedAt = performance.now();

  const duration = 1180;
  const tick = (now) => {
    if (!state.cutComplete) {
      state.settleAnimationRaf = null;
      return;
    }

    const progress = clamp01((now - state.settleAnimationStartedAt) / duration);
    const eased = smooth(progress);
    state.settleProgress = Math.max(state.settleProgress, eased);
    requestAxisUpdate();

    if (progress < 1 && state.settleProgress < 1) {
      state.settleAnimationRaf = requestAnimationFrame(tick);
      return;
    }

    state.settleProgress = 1;
    state.settleAnimationRaf = null;
    requestAxisUpdate();
  };

  state.settleAnimationRaf = requestAnimationFrame(tick);
}

function getAxisPillarContactTargetY() {
  const axisStage = document.querySelector('.project-axis-stage');
  const foundation = document.querySelector('.axis-foundation-stone');

  if (!axisStage || !foundation) return 22;

  const stageRect = axisStage.getBoundingClientRect();
  const pillarRect = getAxisPillarMeasurementRect();
  const foundationRect = foundation.getBoundingClientRect();

  if (!stageRect.height || !pillarRect?.height || !foundationRect.height) {
    return 22;
  }

  const stageStyle = getComputedStyle(axisStage);
  const currentContactY = parseFloat(stageStyle.getPropertyValue('--pillar-contact-y')) || 0;
  const currentBounceY = parseFloat(stageStyle.getPropertyValue('--pillar-bounce-y')) || 0;
  const currentSettleY = parseFloat(stageStyle.getPropertyValue('--pillar-settle-y')) || 0;
  const currentStackY = parseFloat(stageStyle.getPropertyValue('--stack-handoff-y')) || 0;
  const currentMotionY = axisStage.classList.contains('is-axis-pillar-handoff-active')
    ? currentStackY
    : currentContactY + currentBounceY + currentSettleY;
  const pillarBottomWithoutMotion = pillarRect.bottom - currentMotionY;
  const foundationTopY = foundationRect.top + foundationRect.height * AXIS_PILLAR_SEAT_ANCHOR_RATIO;
  const contactInset = AXIS_PILLAR_SURFACE_LIFT;
  const targetY = foundationTopY - pillarBottomWithoutMotion + contactInset;
  const maxTargetY = Math.min(280, stageRect.height * 0.34);

  return Math.min(maxTargetY, Math.max(0, targetY));
}

function getAxisPillarSettleTargetY() {
  const axisStage = document.querySelector('.project-axis-stage');
  const foundation = document.querySelector('.axis-foundation-stone');
  const contourPath = document.getElementById('foundationContourPath');

  if (!axisStage || !foundation) return 22;

  const stageRect = axisStage.getBoundingClientRect();
  const pillarRect = getAxisPillarMeasurementRect();
  const foundationRect = foundation.getBoundingClientRect();

  if (!stageRect.height || !pillarRect?.height || !foundationRect.height) {
    return 22;
  }

  const stageStyle = getComputedStyle(axisStage);
  const currentSettleY = parseFloat(stageStyle.getPropertyValue('--pillar-settle-y')) || 0;
  const currentTraceOverlayY = parseFloat(stageStyle.getPropertyValue('--trace-overlay-y')) || 0;
  const maxTarget = Math.min(260, stageRect.height * 0.34);

  if (Math.abs(currentTraceOverlayY) > 2) {
    const transferredLineTarget = -currentTraceOverlayY + AXIS_PILLAR_CUT_SEAT_COMPENSATION;

    return Math.min(maxTarget, Math.max(0, transferredLineTarget));
  }

  if (contourPath) {
    syncFoundationTraceSamples(true);
  }

  const foundationSeatY =
    foundationRect.top + foundationRect.height * AXIS_PILLAR_SETTLE_SEAT_ANCHOR_RATIO;
  const visibleCutSamples = axisManualCutState.traceSamples
    .filter((sample) => sample.x >= pillarRect.left && sample.x <= pillarRect.right);
  const cutReferenceY = visibleCutSamples.length
    ? Math.max(...visibleCutSamples.map((sample) => sample.y)) - currentSettleY
    : pillarRect.bottom - currentSettleY;
  const cutSeatCompensation = AXIS_PILLAR_CUT_SEAT_COMPENSATION;
  const geometricTarget = foundationSeatY - cutReferenceY + cutSeatCompensation;

  return Math.min(maxTarget, Math.max(0, geometricTarget));
}

function updateNextTracePoint() {
  const traceZone = document.querySelector('[data-axis-trace-zone]');
  const samples = axisManualCutState.traceSamples;
  const nextLabel = document.querySelector('.trace-next-point em');

  if (!traceZone || !samples.length) return;

  if (axisManualCutState.cutComplete) {
    setAxisVar('--next-opacity', '0');
    if (nextLabel) nextLabel.textContent = 'CUT COMPLETE';
    return;
  }

  const completeIndex = Math.min(
    samples.length - 1,
    Math.ceil(getAxisManualCutCompleteProgress() * TRACE_SAMPLE_COUNT)
  );
  const startIndex = getAxisManualCutStartIndex();
  const reachedIndex = axisManualCutState.maxReachedIndex > 0
    ? axisManualCutState.maxReachedIndex
    : startIndex;
  const nextIndex = Math.min(
    reachedIndex + 4,
    completeIndex
  );
  const next = samples[nextIndex];
  const hasStartedCut =
    axisManualCutState.cutProgress > 0.035 ||
    axisManualCutState.maxReachedIndex > startIndex + 8;

  setAxisVar('--next-x', `${next.localXPct.toFixed(3)}%`);
  setAxisVar('--next-y', `${next.localYPct.toFixed(3)}%`);
  setAxisVar('--next-opacity', axisManualCutState.cutReady ? '1' : '0');

  if (nextLabel) {
    if (!axisManualCutState.cutReady) {
      nextLabel.textContent = 'NEXT TRACE POINT';
    } else {
      nextLabel.textContent = hasStartedCut ? 'FOLLOW CONTOUR' : 'START HERE';
    }
  }
}

function getAxisPillarClipTarget() {
  const axisStage = document.querySelector('.project-axis-stage');
  const visibleCardPillar = axisStage?.classList.contains('is-axis-pillar-handoff-active')
    ? axisStage.querySelector('.axis-card-stack')
    : null;

  return visibleCardPillar || document.querySelector('.axis-composite-pillar');
}

function getAxisVisibleCardPillarRect() {
  const axisStage = document.querySelector('.project-axis-stage');

  if (!axisStage?.classList.contains('is-axis-pillar-handoff-active')) return null;

  const rects = Array.from(axisStage.querySelectorAll('.axis-stack-card'))
    .map((card) => card.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);

  if (!rects.length) return null;

  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));

  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top
  };
}

function getAxisPillarMeasurementRect() {
  const visibleCardRect = getAxisVisibleCardPillarRect();

  if (visibleCardRect) return visibleCardRect;

  const pillar = document.querySelector('.axis-composite-pillar');

  return pillar?.getBoundingClientRect() || null;
}

function getAxisSideClipPath(sidePoints) {
  return `polygon(${sidePoints.map(([x, y]) => `${x}% ${y}%`).join(', ')})`;
}

function buildAxisCutClipForRect(rect, reachedIndex, sidePoints) {
  const samples = axisManualCutState.traceSamples;
  const sideClip = getAxisSideClipPath(sidePoints);

  if (
    !rect?.width ||
    !rect.height ||
    !samples.length ||
    (!axisManualCutState.cutComplete && axisManualCutState.cutProgress <= 0)
  ) {
    return sideClip;
  }

  const sideMinX = Math.min(...sidePoints.map(([x]) => x));
  const sideMaxX = Math.max(...sidePoints.map(([x]) => x));

  const visibleSamples = samples
    .map((sample) => {
      const rawX = ((sample.x - rect.left) / rect.width) * 100;
      const targetY = ((sample.y - rect.top) / rect.height) * 100;
      const fittedY = targetY + (AXIS_PILLAR_TRACE_CLIP_OVERLAP_PX / rect.height) * 100;

      return {
        index: sample.index,
        x: Math.min(100, Math.max(0, rawX)),
        rawX,
        y: Math.min(100, Math.max(AXIS_PILLAR_TRACE_CLIP_MIN_Y, fittedY))
      };
    })
    .filter((sample) => sample.rawX >= sideMinX - 1.2 && sample.rawX <= sideMaxX + 1.2)
    .sort((a, b) => a.x - b.x);

  if (!visibleSamples.length) {
    return sideClip;
  }

  const cutPoints = visibleSamples.map((sample) => {
    const hasReached = sample.index <= reachedIndex;
    const reveal = axisManualCutState.cutComplete
      ? 1
      : (hasReached ? 1 : 0);

    return {
      x: sample.x,
      y: lerp(100, sample.y, reveal)
    };
  });

  const first = cutPoints[0];
  const last = cutPoints[cutPoints.length - 1];

  if (first && first.x > sideMinX + 0.1) {
    cutPoints.unshift({ x: sideMinX, y: first.y });
  }

  if (last && last.x < sideMaxX - 0.1) {
    cutPoints.push({ x: sideMaxX, y: last.y });
  }

  const topLeft = sidePoints[0] || [0, 0];
  const topRight = sidePoints[1] || [100, 0];
  const cutClipPoints = cutPoints
    .reverse()
    .map((point) => `${point.x.toFixed(2)}% ${point.y.toFixed(2)}%`);

  return `polygon(${topLeft[0]}% ${topLeft[1]}%, ${topRight[0]}% ${topRight[1]}%, ${cutClipPoints.join(', ')})`;
}

function updateVisibleCardPillarClip(reachedIndex, shouldFreeze = false) {
  const axisStage = document.querySelector('.project-axis-stage');
  const cards = axisStage?.querySelectorAll('.axis-stack-card') || [];
  const state = axisManualCutState;

  if (!axisStage?.classList.contains('is-axis-pillar-handoff-active') || !cards.length) {
    return;
  }

  if (state.cutComplete && state.finalCardClips.length && !shouldFreeze) {
    cards.forEach((card, index) => {
      const clip = state.finalCardClips[index];
      if (!clip) return;

      card.style.clipPath = clip;
      card.style.webkitClipPath = clip;
    });
    return;
  }

  const nextFinalCardClips = [];

  cards.forEach((card, index) => {
    const sidePoints = AXIS_CARD_PILLAR_SIDE_CLIPS[index] || AXIS_CARD_PILLAR_SIDE_CLIPS[1];
    const cutClip = buildAxisCutClipForRect(card.getBoundingClientRect(), reachedIndex, sidePoints);

    nextFinalCardClips[index] = cutClip;
    card.style.clipPath = cutClip;
    card.style.webkitClipPath = cutClip;
  });

  if (shouldFreeze) {
    state.finalCardClips = nextFinalCardClips;
  }
}

function updatePillarClipByCutProgress(progress, shouldFreeze = false) {
  const state = axisManualCutState;
  const reachedIndex = axisManualCutState.cutComplete
    ? TRACE_SAMPLE_COUNT
    : axisManualCutState.maxReachedIndex;
  const pillar = getAxisPillarClipTarget();
  const pillarRect = getAxisPillarMeasurementRect();
  const samples = axisManualCutState.traceSamples;

  if (state.cutComplete && state.finalPillarClip && !shouldFreeze) {
    setAxisVar('--pillar-fit-clip', state.finalPillarClip);
    updateVisibleCardPillarClip(reachedIndex);
    return;
  }

  if (!pillar || !pillarRect || !samples.length) {
    setAxisVar('--pillar-fit-clip', AXIS_PILLAR_UNCUT_CLIP);
    updateVisibleCardPillarClip(reachedIndex, shouldFreeze);
    return;
  }

  if (!pillarRect.width || !pillarRect.height) {
    return;
  }

  const visibleSamples = samples
    .map((sample) => {
      const rawX = ((sample.x - pillarRect.left) / pillarRect.width) * 100;
      const targetY = ((sample.y - pillarRect.top) / pillarRect.height) * 100;
      const fittedY = targetY + (AXIS_PILLAR_TRACE_CLIP_OVERLAP_PX / pillarRect.height) * 100;

      return {
        index: sample.index,
        progress: sample.progress,
        x: Math.min(100, Math.max(0, rawX)),
        rawX,
        y: Math.min(100, Math.max(AXIS_PILLAR_TRACE_CLIP_MIN_Y, fittedY))
      };
    })
    .filter((sample) => sample.rawX >= -1.2 && sample.rawX <= 101.2)
    .sort((a, b) => a.x - b.x);

  if (!visibleSamples.length) {
    setAxisVar('--pillar-fit-clip', AXIS_PILLAR_UNCUT_CLIP);
    updateVisibleCardPillarClip(reachedIndex, shouldFreeze);
    return;
  }

  const cutPoints = visibleSamples.map((sample) => {
    const hasReached = sample.index <= reachedIndex;
    const reveal = axisManualCutState.cutComplete
      ? 1
      : (hasReached ? 1 : 0);
    const y = lerp(100, sample.y, reveal);

    return {
      x: sample.x,
      y
    };
  });

  const first = cutPoints[0];
  const last = cutPoints[cutPoints.length - 1];

  if (first && first.x > 0.1) {
    cutPoints.unshift({ x: 0, y: first.y });
  }

  if (last && last.x < 99.9) {
    cutPoints.push({ x: 100, y: last.y });
  }

  const clipPoints = cutPoints
    .reverse()
    .map((point) => `${point.x.toFixed(2)}% ${point.y.toFixed(2)}%`);
  const clip = `polygon(0 0, 100% 0, ${clipPoints.join(', ')})`;

  setAxisVar('--pillar-fit-clip', clip);
  updateVisibleCardPillarClip(reachedIndex, shouldFreeze);

  if (shouldFreeze) {
    state.finalPillarClip = clip;
  }
}

function getAxisTraceOverlayY() {
  const axisStage = document.querySelector('.project-axis-stage');
  const traceZone = document.querySelector('[data-axis-trace-zone]');
  const pillarRect = getAxisPillarMeasurementRect();

  if (!axisStage || !traceZone || !pillarRect) return -42;

  const stageStyle = getComputedStyle(axisStage);
  const currentOverlayY = parseFloat(stageStyle.getPropertyValue('--trace-overlay-y')) || 0;
  const fitZoom = Math.max(
    0.001,
    parseFloat(stageStyle.getPropertyValue('--axis-fit-zoom')) || 1
  );

  const traceRect = traceZone.getBoundingClientRect();

  if (!traceRect.height || !pillarRect.height) return -42;

  const traceBaseTop = traceRect.top - currentOverlayY * fitZoom;
  const traceAnchorY =
    traceBaseTop +
    (AXIS_TRACE_TRANSFER_ANCHOR_Y / AXIS_TRACE_VIEWBOX_H) * traceRect.height;
  const transferTargetOffset = AXIS_TRACE_TRANSFER_TARGET_OFFSET * fitZoom;
  const visualDelta = pillarRect.bottom - transferTargetOffset - traceAnchorY;

  return visualDelta / fitZoom;
}

function updateTracePillarMask(shouldClip) {
  const axisStage = document.querySelector('.project-axis-stage');

  if (!axisStage) return;

  axisStage.classList.remove('is-trace-clipped-to-pillar');
  setAxisVar('--trace-pillar-clip-left', '0%');
  setAxisVar('--trace-pillar-clip-right', '0%');
}

function updateTraceStateLabel() {
  const traceState = document.querySelector('.trace-label-state');
  if (!traceState) return;

  if (!axisManualCutState.cutReady && !axisManualCutState.cutComplete) {
    traceState.textContent = 'WAITING';
  } else if (axisManualCutState.cutReady && !axisManualCutState.cutComplete) {
    traceState.textContent = axisManualCutState.isSnapped ? 'SNAPPED' : 'FOLLOW';
  } else {
    traceState.textContent = 'CUT COMPLETE';
  }
}

function renderAxisStabilityForce(force) {
  const clampedForce = Math.max(-1, Math.min(1, force));
  const forceAbs = Math.abs(clampedForce);
  const visualX = clampedForce * AXIS_STABILITY_MAX_X;
  const visualRotation = clampedForce * AXIS_STABILITY_MAX_ROTATION;

  axisPillarStabilityState.currentForce = clampedForce;
  axisPillarStabilityState.maxForce = Math.max(
    axisPillarStabilityState.maxForce,
    forceAbs
  );

  setAxisVar('--pillar-stability-x', `${visualX.toFixed(2)}px`);
  setAxisVar('--pillar-stability-rot', `${visualRotation.toFixed(2)}deg`);
  setAxisVar('--stability-force-shift', `${(clampedForce * 28).toFixed(2)}px`);
  setAxisVar('--stability-counter-shift', `${(clampedForce * -8).toFixed(2)}px`);
  setAxisVar('--stability-force-rot', `${(clampedForce * 5).toFixed(2)}deg`);
  setAxisVar('--stability-gap-opacity', (0.18 + forceAbs * 0.72).toFixed(3));
  setAxisVar('--stability-contact-opacity', (0.28 + forceAbs * 0.72).toFixed(3));
}

function lockAxisSettledMotion(axisStage) {
  axisStage?.classList.remove('is-stability-dragging', 'is-stability-returning');

  setAxisVar('--pillar-contact-wobble-x', '0px');
  setAxisVar('--pillar-contact-wobble-rot', '0deg');
  setAxisVar('--pillar-impact-x', '0px');
  setAxisVar('--pillar-impact-y', '0px');
  setAxisVar('--pillar-impact-rot', '0deg');
  setAxisVar('--pillar-impact-scale', '0');
  setAxisVar('--foundation-impact-x', '0px');
  setAxisVar('--foundation-impact-y', '0px');
  setAxisVar('--foundation-impact-rot', '0deg');
  setAxisVar('--foundation-impact-scale', '0');
  setAxisVar('--contact-bg-y', '0px');
  setAxisVar('--contact-bg-scale', '0');
  setAxisVar('--contact-impact-event', '0');
  setAxisVar('--contact-shock-opacity', '0');
  setAxisVar('--contact-floor-opacity', '0');
  setAxisVar('--contact-front-opacity', '0');
  renderAxisStabilityForce(0);
}

function completeAxisStabilityTest() {
  const axisStage = document.querySelector('.project-axis-stage');
  const fitLabelMain = document.querySelector('.fit-label-main');
  const fitLabelState = document.querySelector('.fit-label-state');

  axisManualCutState.stabilityComplete = true;
  axisManualCutState.stabilityWheelProgress = 1;
  axisStage?.classList.add('is-stability-complete');
  axisStage?.classList.remove('is-stability-dragging');

  if (fitLabelMain) fitLabelMain.textContent = 'FINAL CONTACT';
  if (fitLabelState) fitLabelState.textContent = 'FITTED';

  requestAxisUpdate();
}

function handleAxisCutWheelLock(event) {
  if (window.matchMedia('(max-width: 760px)').matches) return;

  const axisSection = document.querySelector('.project-axis-section');
  const axisStage = document.querySelector('.project-axis-stage');
  if (!axisSection || !axisStage) return;

  const rect = axisSection.getBoundingClientRect();
  const stageRect = axisStage.getBoundingClientRect();
  const scrollable = axisSection.offsetHeight - window.innerHeight;
  const globalProgress = clamp01((-rect.top) / Math.max(scrollable, 1));
  const normalizedDeltaY =
    event.deltaMode === 1
      ? event.deltaY * 16
      : event.deltaMode === 2
        ? event.deltaY * window.innerHeight
        : event.deltaY;
  const isAxisActive =
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    stageRect.top < window.innerHeight &&
    stageRect.bottom > 0;
  const heldDeltaY =
    normalizedDeltaY === 0
      ? 0
      : Math.sign(normalizedDeltaY) * Math.min(Math.abs(normalizedDeltaY), AXIS_HOLD_WHEEL_MAX_DELTA);
  const estimatedNextProgress = clamp01(
    globalProgress + Math.max(normalizedDeltaY, 0) / Math.max(scrollable, 1)
  );
  const shouldEnterContactHold =
    isAxisActive &&
    !axisManualCutState.contactHoldComplete &&
    !axisManualCutState.cutReady &&
    !axisManualCutState.cutComplete &&
    globalProgress < AXIS_CONTACT_HOLD_START_PROGRESS &&
    estimatedNextProgress >= AXIS_CONTACT_HOLD_START_PROGRESS &&
    normalizedDeltaY > 0;

  if (shouldEnterContactHold) {
    event.preventDefault();

    const sectionTopY = window.scrollY + rect.top;
    const contactStartY = sectionTopY + AXIS_CONTACT_HOLD_START_PROGRESS * Math.max(scrollable, 1);
    axisManualCutState.contactHoldScrollY = contactStartY;
    window.scrollTo({
      top: contactStartY,
      behavior: 'auto'
    });
    requestAxisUpdate();
    return;
  }

  const shouldHoldContact =
    isAxisActive &&
    !axisManualCutState.contactHoldComplete &&
    !axisManualCutState.cutReady &&
    !axisManualCutState.cutComplete &&
    globalProgress >= AXIS_CONTACT_HOLD_START_PROGRESS &&
    normalizedDeltaY > 0;

  if (shouldHoldContact) {
    event.preventDefault();

    if (axisManualCutState.contactHoldScrollY === null) {
      axisManualCutState.contactHoldScrollY = window.scrollY;
    }

    window.scrollTo({
      top: axisManualCutState.contactHoldScrollY,
      behavior: 'auto'
    });

    const needed = window.innerHeight * 0.46;
    axisManualCutState.contactHoldProgress = clamp01(
      axisManualCutState.contactHoldProgress + heldDeltaY / Math.max(needed, 1)
    );

    if (axisManualCutState.contactHoldProgress >= 1) {
      axisManualCutState.contactHoldComplete = true;
      axisManualCutState.traceHoldScrollY = axisManualCutState.contactHoldScrollY;
      axisManualCutState.contactHoldScrollY = null;
    }

    requestAxisUpdate();
    return;
  }

  const shouldHoldTrace =
    isAxisActive &&
    axisManualCutState.contactHoldComplete &&
    !axisManualCutState.traceHoldComplete &&
    !axisManualCutState.cutReady &&
    !axisManualCutState.cutComplete &&
    globalProgress >= AXIS_CONTACT_HOLD_START_PROGRESS &&
    normalizedDeltaY !== 0;

  if (shouldHoldTrace) {
    event.preventDefault();

    if (axisManualCutState.traceHoldScrollY === null) {
      axisManualCutState.traceHoldScrollY = window.scrollY;
    }

    window.scrollTo({
      top: axisManualCutState.traceHoldScrollY,
      behavior: 'auto'
    });

    const needed = window.innerHeight * 0.42;
    axisManualCutState.traceHoldProgress = clamp01(
      axisManualCutState.traceHoldProgress + Math.max(heldDeltaY, 0) / Math.max(needed, 1)
    );

    if (axisManualCutState.traceHoldProgress >= 1) {
      axisManualCutState.traceHoldComplete = true;
      axisManualCutState.traceHoldScrollY = null;
    }

    requestAxisUpdate();
    return;
  }

  const shouldLock =
    axisManualCutState.cutReady &&
    !axisManualCutState.cutComplete &&
    normalizedDeltaY > 0;

  if (isAxisActive && shouldLock) {
    event.preventDefault();
    clampAxisScrollBeforeNext();
    axisStage.classList.remove('is-fit-refused');
    void axisStage.offsetWidth;
    axisStage.classList.add('is-fit-refused');

    const traceState = document.querySelector('.trace-label-state');
    if (traceState) traceState.textContent = 'FOLLOW FIRST';
    return;
  }

  const shouldSettle =
    isAxisActive &&
    axisManualCutState.cutComplete &&
    axisManualCutState.settleProgress < 1 &&
    normalizedDeltaY > 0;

  if (shouldSettle) {
    event.preventDefault();
    clampAxisScrollBeforeNext();

    const needed = window.innerHeight * 0.32;
    axisManualCutState.settleProgress = clamp01(
      axisManualCutState.settleProgress + heldDeltaY / Math.max(needed, 1)
    );

    requestAxisUpdate();
    return;
  }

  const shouldHoldForStability =
    AXIS_ENABLE_FINAL_STABILITY_TEST &&
    isAxisActive &&
    axisManualCutState.cutComplete &&
    axisManualCutState.settleProgress >= 1 &&
    !axisManualCutState.stabilityComplete &&
    normalizedDeltaY > 0;

  if (shouldHoldForStability) {
    event.preventDefault();
    clampAxisScrollBeforeNext();

    const fitLabelMain = document.querySelector('.fit-label-main');
    const fitLabelState = document.querySelector('.fit-label-state');
    if (fitLabelMain) fitLabelMain.textContent = 'STABILITY TEST';
    if (fitLabelState) fitLabelState.textContent = 'WHEEL / DRAG';

    axisManualCutState.stabilityWheelProgress = clamp01(
      axisManualCutState.stabilityWheelProgress +
      heldDeltaY / Math.max(window.innerHeight * AXIS_STABILITY_WHEEL_RESISTANCE, 1)
    );

    const wheelProgress = axisManualCutState.stabilityWheelProgress;
    const force = Math.sin(wheelProgress * Math.PI * 4.4) * (1 - wheelProgress * 0.18) * 0.78;

    axisStage.classList.add('is-stability-dragging');
    renderAxisStabilityForce(force);

    if (wheelProgress >= 1) {
      completeAxisStabilityTest();

      window.setTimeout(() => {
        axisStage.classList.remove('is-stability-dragging', 'is-stability-returning');
        renderAxisStabilityForce(0);
      }, 420);
    }

    requestAxisUpdate();
    return;
  }

  const shouldCapCriticalAxisWheel =
    isAxisActive &&
    !axisManualCutState.cutReady &&
    !axisManualCutState.cutComplete &&
    normalizedDeltaY > AXIS_CRITICAL_WHEEL_MAX_DELTA &&
    globalProgress >= AXIS_CRITICAL_WHEEL_START_PROGRESS;

  if (shouldCapCriticalAxisWheel) {
    event.preventDefault();
    window.scrollTo({
      top: window.scrollY + AXIS_CRITICAL_WHEEL_MAX_DELTA,
      behavior: 'auto'
    });
    requestAxisUpdate();
    return;
  }

}

function shouldHoldAxisBeforeNextSection() {
  if (axisManualCutState.cutReady && !axisManualCutState.cutComplete) {
    return true;
  }

  if (
    !axisManualCutState.cutComplete &&
    axisManualCutState.traceHoldProgress > 0 &&
    !axisManualCutState.traceHoldComplete
  ) {
    return true;
  }

  if (!axisManualCutState.cutComplete) {
    return false;
  }

  return axisManualCutState.settleProgress < 1 ||
    (AXIS_ENABLE_FINAL_STABILITY_TEST && !axisManualCutState.stabilityComplete);
}

function getAxisLockedMaxScrollY() {
  const axisSection = document.querySelector('.project-axis-section');
  if (!axisSection) return null;

  const rect = axisSection.getBoundingClientRect();
  const sectionTop = window.scrollY + rect.top;

  return sectionTop + axisSection.offsetHeight - window.innerHeight - 2;
}

function clampAxisScrollBeforeNext() {
  let activeHoldScrollY = null;

  if (!axisManualCutState.cutComplete) {
    activeHoldScrollY = axisManualCutState.contactHoldScrollY !== null
      ? axisManualCutState.contactHoldScrollY
      : axisManualCutState.traceHoldScrollY;
  }

  if (activeHoldScrollY !== null) {
    if (Math.abs(window.scrollY - activeHoldScrollY) > 0.5) {
      window.scrollTo({
        top: activeHoldScrollY,
        behavior: 'auto'
      });
    }
    return;
  }

  if (!shouldHoldAxisBeforeNextSection()) return;

  const maxScrollY = getAxisLockedMaxScrollY();
  if (maxScrollY === null) return;

  if (window.scrollY > maxScrollY) {
    window.scrollTo({
      top: maxScrollY,
      behavior: 'auto'
    });
  }
}

function handleAxisScroll() {
  requestAxisUpdate();
  requestAnimationFrame(clampAxisScrollBeforeNext);
}

function getPostCutSettleProgress() {
  const state = axisManualCutState;

  if (!state.cutComplete || state.cutCompleteScrollY === null) {
    return 0;
  }

  const distance = window.scrollY - state.cutCompleteScrollY;
  const needed = window.innerHeight * 0.65;

  return Math.max(
    state.settleProgress || 0,
    clamp01(distance / Math.max(needed, 1))
  );
}

function playAxisContactImpact(axisStage) {
  const state = axisManualCutState;

  if (!axisStage || state.contactImpactPlayed || reduceMotion) return;

  state.contactImpactPlayed = true;
  state.contactImpactActive = true;
  state.contactImpactStartedAt = performance.now();

  if (state.contactImpactTimer) {
    clearTimeout(state.contactImpactTimer);
  }

  state.contactImpactTimer = window.setTimeout(() => {
    state.contactImpactTimer = null;
  }, 340);

  requestAxisUpdate();
}

function getAxisContactImpactMotion() {
  const state = axisManualCutState;
  const neutral = {
    stageX: 0,
    stageY: 0,
    stageRot: 0,
    pillarX: 0,
    pillarY: 0,
    pillarRot: 0,
    pillarScale: 0,
    foundationX: 0,
    foundationY: 0,
    foundationRot: 0,
    foundationScale: 0,
    impactStrength: 0
  };

  if (!state.contactImpactActive || reduceMotion) return neutral;

  const elapsed = performance.now() - state.contactImpactStartedAt;
  const progress = clamp01(elapsed / 300);

  if (progress >= 1) {
    state.contactImpactActive = false;
    return neutral;
  }

  requestAxisUpdate();

  const damping = Math.pow(1 - progress, 2.25);
  const stageWave = Math.sin(progress * Math.PI * 5.2) * damping;
  const settle = smooth(progress);
  let pillarY = 0;

  if (progress < .18) {
    pillarY = lerp(0, 4, smooth(range(progress, 0, .18)));
  } else if (progress < .48) {
    pillarY = lerp(4, -10, smooth(range(progress, .18, .48)));
  } else {
    pillarY = lerp(-10, 0, smooth(range(progress, .48, 1)));
  }

  const foundationPulse = progress < .26
    ? smooth(range(progress, 0, .26))
    : 1 - smooth(range(progress, .26, 1));
  const impactStrength = Math.sin(progress * Math.PI) * Math.pow(1 - progress * .18, 1.4);

  return {
    stageX: stageWave * 1.2,
    stageY: Math.cos(progress * Math.PI * 4.4) * damping * .9 + foundationPulse * .45,
    stageRot: stageWave * .03,
    pillarX: stageWave * 1.1,
    pillarY,
    pillarRot: stageWave * .18,
    pillarScale: -0.008 * (1 - settle),
    foundationX: stageWave * -0.45,
    foundationY: foundationPulse * 2.1,
    foundationRot: Math.sin(progress * Math.PI * 2.2) * (1 - progress) * .13,
    foundationScale: foundationPulse * .002,
    impactStrength
  };
}

function resetManualCutState() {
  const state = axisManualCutState;
  const cutPath = document.getElementById('foundationTraceCutDonePath');
  const axisStage = document.querySelector('.project-axis-stage');

  state.cutReady = false;
  state.cutComplete = false;
  state.isSnapped = false;
  state.maxTraceLiftProgress = 0;
  state.maxReachedIndex = 0;
  state.cutProgress = 0;
  state.finalPillarClip = '';
  state.finalCardClips = [];
  state.cutCompleteScrollY = null;
  state.settleProgress = 0;
  state.settleTargetY = 0;
  if (state.settleAnimationRaf) {
    cancelAnimationFrame(state.settleAnimationRaf);
    state.settleAnimationRaf = null;
  }
  state.settleAnimationStartedAt = 0;
  state.contactHoldProgress = 0;
  state.contactHoldComplete = false;
  state.contactHoldScrollY = null;
  state.traceHoldProgress = 0;
  state.traceHoldComplete = false;
  state.traceHoldScrollY = null;
  state.contactImpactPlayed = false;
  state.contactImpactActive = false;
  state.contactImpactStartedAt = 0;
  if (state.contactImpactTimer) {
    clearTimeout(state.contactImpactTimer);
    state.contactImpactTimer = null;
  }
  state.stabilityWheelProgress = 0;
  state.stabilityComplete = false;

  if (cutPath && state.pathLength) {
    cutPath.style.strokeDashoffset = state.pathLength;
  }

  setAxisVar('--manual-cut-progress', '0');
  setAxisVar('--trace-cut-offset', state.pathLength.toFixed(2));
  setAxisVar('--trace-cut-opacity', '0');
  setAxisVar('--trace-dotted-image-opacity', '0');
  setAxisVar('--snap-opacity', '0');
  setAxisVar('--next-opacity', '0');
  setAxisVar('--pillar-settle-y', '0px');
  setAxisVar('--axis-seat-progress', '0');
  setAxisVar('--axis-seat-opacity', '0');
  setAxisVar('--axis-seat-impact', '0');
  setAxisVar('--axis-seat-y', '16px');
  setAxisVar('--axis-seat-scale', '.92');
  setAxisVar('--axis-seat-ring-scale', '.94');
  setAxisVar('--axis-seat-shadow-width', '64%');
  setAxisVar('--axis-seat-label-y', '6px');
  setAxisVar('--pillar-cut-edge-y', '8px');
  setAxisVar('--pillar-fit-clip', AXIS_PILLAR_UNCUT_CLIP);
  setAxisVar('--contact-stage-x', '0px');
  setAxisVar('--contact-stage-y', '0px');
  setAxisVar('--contact-stage-rot', '0deg');
  setAxisVar('--pillar-impact-x', '0px');
  setAxisVar('--pillar-impact-y', '0px');
  setAxisVar('--pillar-impact-rot', '0deg');
  setAxisVar('--pillar-impact-scale', '0');
  setAxisVar('--foundation-impact-x', '0px');
  setAxisVar('--foundation-impact-y', '0px');
  setAxisVar('--foundation-impact-rot', '0deg');
  setAxisVar('--foundation-impact-scale', '0');
  updateTracePillarMask(false);

  axisStage?.classList.remove(
    'is-cut-ready',
    'is-user-cutting',
    'is-cut-complete',
    'is-fit-refused',
    'is-settled',
    'is-axis-impact-shake',
    'is-stability-dragging',
    'is-stability-returning',
    'is-stability-complete'
  );

  updateTraceStateLabel();
}

function updateAxisInteraction() {
  const axisSection = document.querySelector('.project-axis-section');
  const axisStage = document.querySelector('.project-axis-stage');
  const axisCards = document.querySelectorAll('.axis-stack-card');

  if (!axisSection || !axisStage || !axisCards.length) return;

  const rect = axisSection.getBoundingClientRect();
  const scrollable = axisSection.offsetHeight - window.innerHeight;
  const globalProgress = clamp01((-rect.top) / Math.max(scrollable, 1));

  const stageRect = axisStage.getBoundingClientRect();
  const stageW = stageRect.width;
  const stageH = stageRect.height;

  const entryProgress = 1;
  const holdProgress = timelineProgress('hold', globalProgress);
  const gatherProgress = timelineProgress('gather', globalProgress);
  const stackProgress = timelineProgress('stack', globalProgress);
  const pressProgress = timelineProgress('press', globalProgress);
  const boardProgress = timelineProgress('board', globalProgress);
  const pillarProgress = timelineProgress('pillar', globalProgress);
  const rawFoundationProgress = timelineProgress('foundation', globalProgress);
  const rawContactProgress = timelineProgress('contact', globalProgress);
  const rawMismatchProgress = timelineProgress('mismatch', globalProgress);
  const rawBounceProgress = timelineProgress('bounce', globalProgress);
  const rawContourDrawProgress = timelineProgress('contour', globalProgress);
  const rawOverlayProgress = timelineProgress('transfer', globalProgress);

  setAxisVar('--axis-handoff-opacity', '0');
  setAxisVar('--axis-handoff-y', '0px');
  setAxisVar('--axis-handoff-scale', '1');

  if (
    globalProgress < AXIS_CONTACT_HOLD_REARM_PROGRESS &&
    !axisManualCutState.cutComplete &&
    axisManualCutState.cutProgress === 0
  ) {
    axisManualCutState.contactHoldProgress = 0;
    axisManualCutState.contactHoldComplete = false;
    axisManualCutState.contactHoldScrollY = null;
    axisManualCutState.traceHoldProgress = 0;
    axisManualCutState.traceHoldComplete = false;
    axisManualCutState.traceHoldScrollY = null;
    axisManualCutState.contactImpactPlayed = false;
    axisManualCutState.contactImpactActive = false;
    axisManualCutState.contactImpactStartedAt = 0;
    if (axisManualCutState.contactImpactTimer) {
      clearTimeout(axisManualCutState.contactImpactTimer);
      axisManualCutState.contactImpactTimer = null;
    }
    axisStage.classList.remove('is-axis-impact-shake');
  }

  const allCardsFullyVisible = true;
  const canGather = globalProgress >= 0.10;
  const canStartAssembly = canGather;
  const safeGatherProgress = canGather ? gatherProgress : 0;
  const safeStackProgress = canGather ? stackProgress : 0;
  const safePressProgress = canGather ? pressProgress : 0;
  const safeBoardProgress = canGather ? boardProgress : 0;
  const safePillarProgress = canGather ? pillarProgress : 0;
  const standProgress = canGather ? timelineProgress('stand', globalProgress) : 0;
  const pillarHandoffProgress = canGather ? timelineProgress('pillarHandoff', globalProgress) : 0;
  const pillarComplete = pillarHandoffProgress >= 0.98;
  const pillarHoldProgress = smooth(range(globalProgress, 0.675, 0.705));
  const canShowFoundation = pillarComplete && pillarHoldProgress > 0;
  const foundationProgress = canShowFoundation ? rawFoundationProgress : 0;
  const foundationVisible = foundationProgress >= 0.58;
  const canFirstContact = canShowFoundation && foundationVisible;
  const contactHoldProgress = canFirstContact
    ? (axisManualCutState.contactHoldComplete ? 1 : axisManualCutState.contactHoldProgress)
    : 0;
  const contactProgress = canFirstContact
    ? Math.max(rawContactProgress, smooth(range(contactHoldProgress, 0, .38)))
    : 0;
  const physicalContactProgress = canFirstContact
    ? smooth(range(contactProgress, .78, .98))
    : 0;
  const hasPhysicalContact = physicalContactProgress >= 0.995;
  const firstContactComplete = hasPhysicalContact;
  const mismatchProgress = canFirstContact && firstContactComplete
    ? Math.max(rawMismatchProgress, smooth(range(contactHoldProgress, .44, .68)))
    : 0;
  const notFittedComplete = mismatchProgress >= 0.78;
  const bounceProgress = canFirstContact && notFittedComplete
    ? Math.max(rawBounceProgress, smooth(range(contactHoldProgress, .70, .96)))
    : 0;
  const bounceBackComplete = bounceProgress >= 0.84;
  const canDrawContour = canFirstContact && bounceBackComplete;
  const traceHoldProgress = canFirstContact && axisManualCutState.contactHoldComplete
    ? (axisManualCutState.traceHoldComplete ? 1 : axisManualCutState.traceHoldProgress)
    : 0;
  const hasTraceHold = axisManualCutState.contactHoldComplete ||
    axisManualCutState.traceHoldProgress > 0 ||
    axisManualCutState.traceHoldComplete;
  const heldContourDrawProgress = smooth(range(traceHoldProgress, .08, .58));
  const heldOverlayProgress = smooth(range(traceHoldProgress, .58, 1));
  const contourDrawProgress = canDrawContour
    ? (hasTraceHold ? heldContourDrawProgress : rawContourDrawProgress)
    : 0;
  const canTransferGuide = contourDrawProgress >= 0.88;
  const canShowDashedGuide = canTransferGuide;
  const overlayProgress = canTransferGuide
    ? (hasTraceHold ? heldOverlayProgress : rawOverlayProgress)
    : 0;
  const dashedGuideOverlayComplete = canTransferGuide && overlayProgress >= 0.86;
  const canStartManualCut = dashedGuideOverlayComplete;
  let axisFitStage = AxisFitStage.PILLAR_READY;

  if (axisManualCutState.cutComplete && getPostCutSettleProgress() >= 1) {
    axisFitStage = AxisFitStage.FINAL;
  } else if (axisManualCutState.cutComplete) {
    axisFitStage = AxisFitStage.SETTLE;
  } else if (canStartManualCut) {
    axisFitStage = AxisFitStage.USER_MANUAL_CUT;
  } else if (canTransferGuide) {
    axisFitStage = AxisFitStage.TRANSFER_GUIDE;
  } else if (canDrawContour) {
    axisFitStage = AxisFitStage.CONTOUR_DRAW;
  } else if (bounceProgress > 0 || mismatchProgress > 0) {
    axisFitStage = AxisFitStage.MISMATCH_CHECK;
  } else if (hasPhysicalContact) {
    axisFitStage = AxisFitStage.FIRST_CONTACT;
  } else if (foundationProgress > 0) {
    axisFitStage = AxisFitStage.FOUNDATION_APPEAR;
  }

  axisStage.dataset.axisFitStage = axisFitStage;
  let axisFlowStep = '01-cards-enter';
  if (canStartAssembly) axisFlowStep = '02-cards-assemble';
  if (safePressProgress > .18) axisFlowStep = '03-composite-board';
  if (pillarHandoffProgress > .12) axisFlowStep = '04-pillar-formed';
  if (foundationProgress > 0) axisFlowStep = '05-stone-enter';
  if (axisFitStage === AxisFitStage.FIRST_CONTACT) axisFlowStep = '06-front-contact';
  if (axisFitStage === AxisFitStage.MISMATCH_CHECK) axisFlowStep = '07-mismatch-check';
  if (axisFitStage === AxisFitStage.CONTOUR_DRAW) axisFlowStep = '08-read-stone-contour';
  if (axisFitStage === AxisFitStage.TRANSFER_GUIDE) axisFlowStep = '09-transfer-contour';
  if (axisFitStage === AxisFitStage.USER_MANUAL_CUT) axisFlowStep = '10-manual-cut';
  if (axisFitStage === AxisFitStage.SETTLE) axisFlowStep = '11-seat-pillar';
  if (axisFitStage === AxisFitStage.FINAL) axisFlowStep = '12-stability-test';
  axisStage.dataset.axisFlowStep = axisFlowStep;
  const foundationSceneActive =
    foundationProgress > 0.26 ||
    canFirstContact ||
    canDrawContour ||
    axisManualCutState.cutComplete;
  const keepOriginalCardsAsPillar =
    pillarComplete;
  axisStage.classList.toggle('has-foundation-visible', foundationSceneActive);
  axisStage.classList.toggle('is-axis-pillar-handoff-active', keepOriginalCardsAsPillar);
  axisStage.classList.toggle('is-axis-fit-pillar-hidden', keepOriginalCardsAsPillar);
  axisStage.classList.remove('has-clickable-axis-cards');
  const baseStackCardW = stageW < 760
    ? Math.min(stageW * 0.88, 390)
    : Math.min(stageW * 0.34, 560);
  const baseStackCardH = stageW < 760
    ? Math.min(stageH * 0.36, 300)
    : Math.min(stageH * 0.38, 360);
  const fitStoneW = stageW < 760
    ? Math.min(stageW * 0.72, 440)
    : Math.max(300, Math.min(stageW * 0.30, 460));
  const pillarFootprintMaxW = fitStoneW * (stageW < 760 ? .90 : .92);
  const pillarCardW = stageW < 760
    ? Math.min(Math.max(stageW * 0.38, 160), Math.min(240, pillarFootprintMaxW * .70))
    : Math.min(Math.max(stageW * 0.13, 190), Math.min(280, pillarFootprintMaxW * .72));
  const pillarCardH = stageW < 760
    ? Math.min(stageH * 0.42, 390)
    : Math.min(stageH * 0.44, 460);
  const fitTraceW = fitStoneW;
  const fitStoneH = fitStoneW * (2245 / 11217);
  const fitStoneBottom = stageW < 760
    ? Math.max(46, Math.min(stageH * 0.12, 82))
    : Math.max(64, Math.min(stageH * 0.12, 116));
  const fitTraceH = fitStoneH;
  const fitTraceBottom = fitStoneBottom;
  const fitContactBottom = fitStoneBottom + fitStoneH - 2;
  const fitPillarBaseGap = stageW < 760 ? 22 : 28;
  const fitPillarBaseBottom = fitContactBottom + fitPillarBaseGap;
  const fitLabelLift = Math.max(stageW < 760 ? 36 : 44, Math.min(58, pillarCardH * 0.12));
  const fitTraceLabelBottom = (fitStoneBottom - (stageW < 760 ? 24 : 32)) - fitTraceBottom;

  setAxisVar('--axis-stone-width', `${fitStoneW.toFixed(2)}px`);
  setAxisVar('--axis-trace-width', `${fitTraceW.toFixed(2)}px`);
  setAxisVar('--axis-stone-height', `${fitStoneH.toFixed(2)}px`);
  setAxisVar('--axis-stone-bottom', `${fitStoneBottom.toFixed(2)}px`);
  setAxisVar('--axis-trace-height', `${fitTraceH.toFixed(2)}px`);
  setAxisVar('--axis-trace-bottom', `${fitTraceBottom.toFixed(2)}px`);
  setAxisVar('--axis-contact-bottom', `${fitContactBottom.toFixed(2)}px`);
  setAxisVar('--axis-pillar-base-bottom', `${fitPillarBaseBottom.toFixed(2)}px`);
  setAxisVar('--axis-fit-label-bottom', `${(fitContactBottom + fitLabelLift).toFixed(2)}px`);
  setAxisVar('--axis-trace-label-bottom', `${fitTraceLabelBottom.toFixed(2)}px`);
  const rowGap = stageW < 760
    ? Math.min(stageW * 0.34, 150)
    : Math.min(stageW * 0.34, 420);
  const stackOffsetX = stageW < 760 ? 16 : 26;
  const stackOffsetY = stageW < 760 ? 10 : 16;
  const laminateOffsetX = stageW < 760
    ? Math.min(pillarCardW * .16, (pillarFootprintMaxW - pillarCardW) / 2)
    : Math.min(pillarCardW * .18, (pillarFootprintMaxW - pillarCardW) / 2);
  const stackCardCompress = smooth(range(safePressProgress, .10, .92));
  const cardToPillarProgress = Math.max(safeStackProgress, standProgress);
  const pressedCardW = lerp(
    baseStackCardW,
    Math.max(pillarCardW * 1.34, stageW < 760 ? 250 : 360),
    stackCardCompress
  );
  const pressedCardH = lerp(
    baseStackCardH,
    Math.max(baseStackCardH * .24, stageW < 760 ? 78 : 108),
    stackCardCompress
  );
  const stackCardW = lerp(pressedCardW, pillarCardW, standProgress);
  const stackCardH = lerp(pressedCardH, pillarCardH, standProgress);
  const cardFadeProgress = 0;
  const cardOpacity = entryProgress * (1 - cardFadeProgress);
  const cardLabelOpacity = keepOriginalCardsAsPillar
    ? 0
    : (1 - safeGatherProgress) * (1 - cardFadeProgress);
  const cardGlaze = lerp(.02, .42, Math.max(safeGatherProgress, stackCardCompress));
  const cardImageScale = lerp(1.015, 1.045, Math.max(safeGatherProgress, stackCardCompress));
  const pillarSurfaceProgress = smooth(range(cardToPillarProgress, .06, .96));
  const baseClip = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100]
  ];
  const morphClipPath = (points, progress) => {
    const clipProgress = smooth(range(progress, .04, .92));
    const coordinates = points.map(([x, y], pointIndex) => {
      const [fromX, fromY] = baseClip[pointIndex];
      return `${lerp(fromX, x, clipProgress).toFixed(2)}% ${lerp(fromY, y, clipProgress).toFixed(2)}%`;
    });
    return `polygon(${coordinates.join(', ')})`;
  };

  setAxisVar('--stack-card-w', `${stackCardW.toFixed(2)}px`);
  setAxisVar('--stack-card-h', `${stackCardH.toFixed(2)}px`);

  const cardFrames = [
    {
      enter: { x: -stageW * .72, y: stageH * .09, z: -170, rx: 0, ry: 7, rz: -4.2 },
      row: { x: -rowGap, y: 0, z: 12, rx: 0, ry: 0, rz: -1.4 },
      stack: { x: -stackOffsetX, y: -stackOffsetY, z: 42, rx: 0, ry: 0, rz: -2.4 },
      pillar: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }
    },
    {
      enter: { x: 0, y: -stageH * .46, z: -150, rx: 0, ry: 0, rz: .3 },
      row: { x: 0, y: 0, z: 28, rx: 0, ry: 0, rz: .15 },
      stack: { x: 0, y: 0, z: 72, rx: 0, ry: 0, rz: .25 },
      pillar: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }
    },
    {
      enter: { x: stageW * .72, y: stageH * .09, z: -170, rx: 0, ry: -7, rz: 4.2 },
      row: { x: rowGap, y: 0, z: 12, rx: 0, ry: 0, rz: 1.4 },
      stack: { x: stackOffsetX, y: stackOffsetY, z: 104, rx: 0, ry: 0, rz: 2.4 },
      pillar: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }
    }
  ];

  const getCardSlotTransform = (slotIndex) => {
    const frame = cardFrames[slotIndex];
    if (!frame) return null;

    let x = lerp(frame.enter.x, frame.row.x, entryProgress);
    let y = lerp(frame.enter.y, frame.row.y, entryProgress);
    let z = lerp(frame.enter.z, frame.row.z, entryProgress);
    let rx = lerp(frame.enter.rx, frame.row.rx, entryProgress);
    let ry = lerp(frame.enter.ry, frame.row.ry, entryProgress);
    let rz = lerp(frame.enter.rz, frame.row.rz, entryProgress);

    x = lerp(x, frame.stack.x, safeGatherProgress);
    y = lerp(y, frame.stack.y, safeGatherProgress);
    z = lerp(z, frame.stack.z, safeGatherProgress);
    rx = lerp(rx, frame.stack.rx, safeGatherProgress);
    ry = lerp(ry, frame.stack.ry, safeGatherProgress);
    rz = lerp(rz, frame.stack.rz, safeGatherProgress);

    x = lerp(x, frame.pillar.x, cardToPillarProgress);
    y = lerp(y, frame.pillar.y, cardToPillarProgress);
    z = lerp(z, frame.pillar.z, cardToPillarProgress);
    rx = lerp(rx, frame.pillar.rx, cardToPillarProgress);
    ry = lerp(ry, frame.pillar.ry, cardToPillarProgress);
    rz = lerp(rz, frame.pillar.rz, cardToPillarProgress);

    return {x, y, z, rx, ry, rz};
  };

  const selectedCardIndex = centeredAxisProjectKey
    ? Array.from(axisCards).findIndex((item) => item.dataset.axisProject === centeredAxisProjectKey)
    : -1;
  const hasSelectedAxisCard =
    selectedCardIndex >= 0 &&
    !keepOriginalCardsAsPillar;
  const cardSwapProgress = hasSelectedAxisCard
    ? smooth(clamp01((performance.now() - axisCardSwapStartedAt) / 380))
    : 0;

  axisCards.forEach((card, index) => {
    const transform = getCardSlotTransform(index);
    if (!transform) return;

    const isSelectedAxisCard =
      centeredAxisProjectKey &&
      card.dataset.axisProject === centeredAxisProjectKey &&
      !keepOriginalCardsAsPillar;

    if (hasSelectedAxisCard) {
      const targetSlotIndex = index === selectedCardIndex
        ? 1
        : (index === 1 ? selectedCardIndex : index);
      const targetTransform = getCardSlotTransform(targetSlotIndex);
      const swapProgress = targetSlotIndex === index ? 0 : cardSwapProgress;

      if (targetTransform) {
        const crossingCard =
          targetSlotIndex !== index &&
          (index === selectedCardIndex || index === 1);
        const arcDirection = index === selectedCardIndex ? -1 : 1;
        const arcLift = crossingCard
          ? Math.sin(cardSwapProgress * Math.PI) * (index === selectedCardIndex ? 34 : 18)
          : 0;
        const depthLift = crossingCard
          ? Math.sin(cardSwapProgress * Math.PI) * (index === selectedCardIndex ? 80 : 34)
          : 0;

        transform.x = lerp(transform.x, targetTransform.x, swapProgress);
        transform.y = lerp(transform.y, targetTransform.y, swapProgress) + (arcLift * arcDirection);
        transform.z = lerp(transform.z, targetTransform.z, swapProgress) + depthLift;
        transform.rx = lerp(transform.rx, targetTransform.rx, swapProgress);
        transform.ry = lerp(transform.ry, targetTransform.ry, swapProgress);
        transform.rz = lerp(transform.rz, targetTransform.rz, swapProgress);
      }
    }

    if ('disabled' in card) {
      card.disabled = false;
    }

    card.classList.toggle('is-axis-centered', Boolean(isSelectedAxisCard));
    card.classList.remove('is-axis-dimmed');
    card.style.setProperty('--card-x', `${transform.x.toFixed(2)}px`);
    card.style.setProperty('--card-y', `${transform.y.toFixed(2)}px`);
    card.style.setProperty('--card-z', `${transform.z.toFixed(2)}px`);
    card.style.setProperty('--card-rx', `${transform.rx.toFixed(2)}deg`);
    card.style.setProperty('--card-ry', `${transform.ry.toFixed(2)}deg`);
    card.style.setProperty('--card-rz', `${transform.rz.toFixed(2)}deg`);
    card.style.setProperty('--card-scale', lerp(.985, 1, entryProgress).toFixed(3));
    card.style.setProperty('--card-opacity', cardOpacity.toFixed(3));
    card.style.setProperty('--card-label-opacity', cardLabelOpacity.toFixed(3));
    card.style.setProperty('--card-paper-glaze', lerp(cardGlaze, .30, pillarSurfaceProgress).toFixed(3));
    card.style.setProperty('--card-image-opacity', lerp(.96, .76, pillarSurfaceProgress).toFixed(3));
    card.style.setProperty('--card-image-saturate', lerp(.96, .70, pillarSurfaceProgress).toFixed(3));
    card.style.setProperty('--card-image-contrast', lerp(.98, .92, pillarSurfaceProgress).toFixed(3));
    card.style.setProperty('--card-image-brightness', lerp(.98, 1.02, pillarSurfaceProgress).toFixed(3));
    card.style.setProperty('--card-image-blur', `${lerp(0, .08, pillarSurfaceProgress).toFixed(2)}px`);
    card.style.setProperty('--card-image-scale', cardImageScale.toFixed(3));
    const frozenCutClip = axisManualCutState.cutComplete
      ? axisManualCutState.finalCardClips[index]
      : '';
    const sideMorphClip = frozenCutClip ||
      morphClipPath(AXIS_CARD_PILLAR_SIDE_CLIPS[index], cardToPillarProgress);
    card.style.clipPath = sideMorphClip;
    card.style.webkitClipPath = sideMorphClip;
    card.style.zIndex = String(isSelectedAxisCard ? 80 : 24 + index);
  });

  const sceneRx = lerp(0, 5.2, safePressProgress) * (1 - standProgress);
  setAxisVar('--stack-scene-rotate-x', `${sceneRx.toFixed(2)}deg`);
  setAxisVar('--stack-scene-rotate-y', '0deg');

  const pressFrameOpacity = safePressProgress * (1 - smooth(range(standProgress, .12, .78)));
  setAxisVar('--press-frame-opacity', pressFrameOpacity.toFixed(3));
  setAxisVar('--press-top-y', `${lerp(-42, 18, safePressProgress).toFixed(2)}px`);
  setAxisVar('--press-bottom-y', `${lerp(-42, 18, safePressProgress).toFixed(2)}px`);

  const boardStandProgress = standProgress;
  const boardVisibleProgress = 0;
  const boardW = lerp(
    Math.max(stackCardW * .72, pillarCardW * 1.38),
    pillarCardW,
    boardStandProgress
  );
  const boardH = lerp(
    Math.max(stackCardH * .86, stageW < 760 ? 74 : 98),
    pillarCardH,
    boardStandProgress
  );

  setAxisVar('--board-opacity', boardVisibleProgress.toFixed(3));
  setAxisVar('--board-scale', lerp(.965, 1, Math.max(safeBoardProgress, boardStandProgress)).toFixed(3));
  setAxisVar('--board-w', `${boardW.toFixed(2)}px`);
  setAxisVar('--board-h', `${boardH.toFixed(2)}px`);
  setAxisVar('--board-rx', `${lerp(0, 0, boardStandProgress).toFixed(2)}deg`);
  setAxisVar('--board-ry', '0deg');
  setAxisVar('--board-rz', `${lerp(.2, 0, boardStandProgress).toFixed(2)}deg`);
  setAxisVar('--fusion-flow-opacity', '0');
  setAxisVar('--fusion-flow-draw', '0');
  setAxisVar('--fusion-block-opacity', '0');

  const pillarW = `${pillarCardW.toFixed(2)}px`;
  const pillarH = `${pillarCardH.toFixed(2)}px`;

  setAxisVar('--stack-opacity', '0');
  setAxisVar('--stack-scale', '1');
  setAxisVar('--stack-scale-x', '1');
  setAxisVar('--stack-scale-y', '1');
  setAxisVar('--stack-y', '0px');
  setAxisVar('--slab-w', '0px');
  setAxisVar('--slab-h', '0px');
  setAxisVar('--slab-y', '0px');
  setAxisVar('--slab-opacity', '0');
  setAxisVar('--slab-scale-x', '1');
  setAxisVar('--slab-scale-y', '1');
  setAxisVar('--slab-label-opacity', '0');
  setAxisVar('--pillar-opacity', '0');
  setAxisVar('--pillar-scale', lerp(.985, 1, safePillarProgress).toFixed(3));
  setAxisVar('--pillar-w', pillarW);
  setAxisVar('--pillar-h', pillarH);
  setAxisVar('--foundation-opacity', foundationProgress.toFixed(3));
  const foundationY = foundationVisible ? 0 : lerp(34, 0, foundationProgress);
  setAxisVar('--foundation-y', `${foundationY.toFixed(2)}px`);

  if (
    canFirstContact &&
    hasPhysicalContact &&
    !axisManualCutState.contactImpactPlayed &&
    !axisManualCutState.cutComplete
  ) {
    playAxisContactImpact(axisStage);
  }

  const oneShotImpact = getAxisContactImpactMotion();
  const contactTargetY = getAxisPillarContactTargetY();
  const contactEase = 1 - Math.pow(1 - contactProgress, 2.8);
  const contactImpactPulse =
    (hasPhysicalContact ? 1 : 0) *
    smooth(range(contactProgress, .44, .78)) *
    (1 - smooth(range(contactProgress, .86, 1)));
  const contactPressure =
    (hasPhysicalContact ? 1 : 0) *
    smooth(range(contactProgress, .62, 1)) *
    (1 - smooth(range(contourDrawProgress, .04, .52)));
  const impactVisibility = Math.max(contactImpactPulse, contactPressure * .72, oneShotImpact.impactStrength) *
    (1 - smooth(range(bounceProgress, .35, 1)) * .34);
  const wobbleProgress = smooth(range(contactProgress, .62, 1)) *
    (1 - smooth(range(bounceProgress, .28, 1))) *
    (1 - smooth(range(contourDrawProgress, .02, .28)));
  const wobbleDamping = Math.pow(1 - wobbleProgress, .82);
  const contactWobble =
    Math.sin(wobbleProgress * Math.PI * 3.15) *
    wobbleDamping *
    2.6;
  const contactYRaw = lerp(0, contactTargetY, contactEase) + contactImpactPulse * 3.2;
  const contactY = Math.min(contactTargetY, contactYRaw);
  const postCutSettleForGap = axisManualCutState.cutComplete ? getPostCutSettleProgress() : 0;
  const rejectLiftMax = stageW < 760 ? 28 : 46;
  const rejectLiftProgress = smooth(range(bounceProgress, .02, .82));
  const rejectSpring = Math.sin(smooth(range(bounceProgress, 0, .68)) * Math.PI) * (stageW < 760 ? 8 : 14);
  const unfittedGapY = Math.max(0, lerp(0, rejectLiftMax, rejectLiftProgress) + rejectSpring);
  const bounceY = -unfittedGapY * (
    axisManualCutState.cutComplete
      ? 1 - smooth(postCutSettleForGap)
      : 1
  );
  const contactStackY = Math.min(
    contactTargetY,
    contactY + Math.min(0, oneShotImpact.pillarY)
  );
  const handoffStackY = keepOriginalCardsAsPillar
    ? contactStackY + bounceY
    : 0;
  setAxisVar('--stack-handoff-y', `${handoffStackY.toFixed(2)}px`);
  setAxisVar('--pillar-contact-y', `${contactY.toFixed(2)}px`);
  setAxisVar('--pillar-bounce-y', `${bounceY.toFixed(2)}px`);
  setAxisVar('--pillar-contact-wobble-rot', `${contactWobble.toFixed(2)}deg`);
  setAxisVar('--pillar-contact-wobble-x', `${(contactWobble * -1.8).toFixed(2)}px`);
  setAxisVar('--impact-opacity', impactVisibility.toFixed(3));
  setAxisVar('--impact-scale', lerp(.72, 1.18, impactVisibility).toFixed(3));
  setAxisVar('--impact-spread', `${lerp(18, 48, impactVisibility).toFixed(2)}px`);
  const contactShock = contactImpactPulse *
    (1 - smooth(range(bounceProgress, .08, .62))) *
    (axisManualCutState.cutComplete ? 0 : 1);
  const contactStrike = smooth(range(contactProgress, .30, .58)) *
    (1 - smooth(range(contactProgress, .74, .96))) *
    (hasPhysicalContact ? 1 : 0) *
    (axisManualCutState.cutComplete ? 0 : 1);
  const contactImpactEvent = Math.max(contactShock, contactStrike, oneShotImpact.impactStrength);
  const contactShockScale = lerp(.64, 1.42, smooth(range(contactProgress, .30, .86)));
  const contactJolt = Math.sin(contactProgress * Math.PI * 9.2) * contactImpactEvent;
  const contactVibration =
    (
      Math.sin(contactProgress * Math.PI * 38) * .68 +
      Math.sin(contactProgress * Math.PI * 67) * .32
    ) *
    contactImpactEvent;
  const contactRevealProgress = canFirstContact && !axisManualCutState.cutComplete
    ? smooth(range(contactProgress, .02, .68))
    : 1;
  const contactRevealOpacity = canFirstContact && !axisManualCutState.cutComplete
    ? (1 - contactRevealProgress) * .62
    : 0;
  setAxisVar('--contact-impact-event', contactImpactEvent.toFixed(3));
  setAxisVar('--contact-shock-opacity', (contactImpactEvent * .86).toFixed(3));
  setAxisVar('--contact-shock-scale', contactShockScale.toFixed(3));
  setAxisVar('--contact-floor-opacity', (contactImpactEvent * .70).toFixed(3));
  const contactFrontFade = axisFitStage === AxisFitStage.FIRST_CONTACT
    ? 1
    : (axisFitStage === AxisFitStage.MISMATCH_CHECK ? 1 - smooth(range(mismatchProgress, 0, .18)) : 0);
  const contactFrontOpacity = contactImpactEvent *
    contactFrontFade *
    (axisManualCutState.cutComplete ? 0 : .34);
  setAxisVar('--contact-front-opacity', contactFrontOpacity.toFixed(3));
  setAxisVar('--contact-front-scale', lerp(.78, 1.20, contactImpactEvent).toFixed(3));
  setAxisVar('--contact-front-y', `${(contactImpactEvent * -1.2).toFixed(2)}px`);
  setAxisVar('--contact-reveal-opacity', contactRevealOpacity.toFixed(3));
  setAxisVar('--contact-reveal-scale', lerp(1.035, 1, contactRevealProgress).toFixed(3));
  setAxisVar('--contact-bg-scale', (contactImpactEvent * .048).toFixed(3));
  setAxisVar('--contact-bg-y', `${((contactJolt * 8.5) + (contactImpactEvent * 3.2)).toFixed(2)}px`);
  setAxisVar('--contact-bg-brightness', (1 + contactImpactEvent * .095).toFixed(3));
  setAxisVar('--contact-bg-contrast', (1 + contactImpactEvent * .06).toFixed(3));
  setAxisVar('--contact-stage-x', '0px');
  setAxisVar('--contact-stage-y', '0px');
  setAxisVar('--contact-stage-rot', '0deg');
  setAxisVar('--pillar-impact-x', `${((contactVibration * 2.4) + oneShotImpact.pillarX).toFixed(2)}px`);
  setAxisVar('--pillar-impact-y', `${((contactImpactEvent * 2.2) + (contactVibration * 1.2) + oneShotImpact.pillarY).toFixed(2)}px`);
  setAxisVar('--pillar-impact-rot', `${((contactVibration * .18) + oneShotImpact.pillarRot).toFixed(3)}deg`);
  setAxisVar('--pillar-impact-scale', ((contactImpactEvent * -.008) + oneShotImpact.pillarScale).toFixed(3));
  setAxisVar('--foundation-impact-x', '0px');
  setAxisVar('--foundation-impact-y', '0px');
  setAxisVar('--foundation-impact-rot', '0deg');
  setAxisVar('--foundation-impact-scale', '0');

  const mismatchVisibility = axisManualCutState.cutComplete
    ? 0
    : mismatchProgress * (1 - contourDrawProgress * .35);
  const fitLabelVisibility = axisManualCutState.cutComplete
    ? 0
    : Math.max(mismatchVisibility, hasPhysicalContact ? .88 : 0);
  const contactDotVisibility = axisManualCutState.cutComplete || canDrawContour
    ? 0
    : Math.max(
      (hasPhysicalContact ? smooth(range(contactProgress, .985, 1)) : 0) * (1 - contourDrawProgress * .45),
      impactVisibility
    );

  const fitGapVisibility = canDrawContour
    ? 0
    : Math.max(mismatchVisibility, impactVisibility);

  setAxisVar('--fit-gap-opacity', fitGapVisibility.toFixed(3));
  setAxisVar('--fit-label-opacity', fitLabelVisibility.toFixed(3));
  setAxisVar('--contact-dot-opacity', (contactDotVisibility * .42).toFixed(3));

  const fitLabelMain = document.querySelector('.fit-label-main');
  if (fitLabelMain && !axisManualCutState.cutComplete) {
    fitLabelMain.textContent = hasPhysicalContact ? 'CONTACT CHECK' : 'PILLAR DESCENDING';
  }

  const fitLabelState = document.querySelector('.fit-label-state');
  if (fitLabelState) {
    if (axisManualCutState.cutComplete) {
      fitLabelState.textContent = 'FITTED';
    } else if (mismatchProgress > .28) {
      fitLabelState.textContent = 'NOT FITTED';
    } else if (!hasPhysicalContact) {
      fitLabelState.textContent = 'LOWERING';
    } else {
      fitLabelState.textContent = 'CHECKING';
    }
  }

  const drawPath = document.getElementById('foundationTraceDrawPath');
  const traceLength = axisManualCutState.pathLength;

  if (drawPath && traceLength) {
    const drawOffset = traceLength * (1 - contourDrawProgress);
    drawPath.style.strokeDashoffset = drawOffset;
    setAxisVar('--trace-draw-offset', drawOffset.toFixed(2));
  }

  axisManualCutState.traceDrawComplete = contourDrawProgress >= 0.995;
  if (axisManualCutState.cutComplete) {
    updatePillarClipByCutProgress(1);
  } else if (axisManualCutState.cutProgress === 0) {
    setAxisVar('--pillar-fit-clip', AXIS_PILLAR_UNCUT_CLIP);
  }

  const rawTraceLiftProgress = canTransferGuide
    ? smooth(range(overlayProgress, .08, .96))
    : 0;
  if (!canTransferGuide && !axisManualCutState.cutReady && !axisManualCutState.cutComplete) {
    axisManualCutState.maxTraceLiftProgress = 0;
    updateTracePillarMask(false);
  }
  if (rawTraceLiftProgress > axisManualCutState.maxTraceLiftProgress) {
    axisManualCutState.maxTraceLiftProgress = rawTraceLiftProgress >= .995
      ? 1
      : rawTraceLiftProgress;
  }
  const traceLiftProgress = axisManualCutState.maxTraceLiftProgress;
  const stableOverlayProgress = Math.max(overlayProgress, traceLiftProgress);
  const contourInkOpacity = smooth(range(contourDrawProgress, .015, .18));
  const liftedGuideOpacity = axisManualCutState.cutComplete
    ? 0
    : Math.max(0, stableOverlayProgress);
  const traceOpacity = Math.max(
    contourInkOpacity * Math.max(contourDrawProgress, .001),
    stableOverlayProgress
  );
  const dashedOpacity = 0;

  setAxisVar('--trace-opacity', traceOpacity.toFixed(3));
  setAxisVar('--trace-draw-opacity', (contourInkOpacity * (1 - liftedGuideOpacity)).toFixed(3));
  setAxisVar('--trace-dashed-opacity', dashedOpacity.toFixed(3));
  setAxisVar('--trace-dotted-image-opacity', (liftedGuideOpacity * .78).toFixed(3));
  const tracePillarLineY = getAxisTraceOverlayY();
  const traceOverlayY = lerp(0, tracePillarLineY, traceLiftProgress);
  setAxisVar('--trace-overlay-y', `${traceOverlayY.toFixed(2)}px`);
  updateTracePillarMask(
    traceLiftProgress > .985 ||
    axisManualCutState.cutReady ||
    axisManualCutState.cutComplete
  );

  if (canStartManualCut || axisManualCutState.cutReady || axisManualCutState.cutComplete) {
    syncFoundationTraceSamples(true);
  }

  const traceLabelMain = document.querySelector('.trace-label-main');
  if (traceLabelMain) {
    if (canStartManualCut || axisManualCutState.cutReady) {
      traceLabelMain.textContent = 'GRANGI TRACE';
    } else if (canTransferGuide) {
      traceLabelMain.textContent = 'TRANSFER CONTOUR';
    } else if (canDrawContour) {
      traceLabelMain.textContent = 'GRANGI TRACE READY';
    } else {
      traceLabelMain.textContent = 'GRANGI TRACE';
    }
  }

  if (canStartManualCut && !axisManualCutState.cutComplete) {
    if (!axisManualCutState.cutReady) {
      axisManualCutState.cutReady = true;
      axisStage.classList.add('is-cut-ready');
      setAxisVar('--trace-pointer-events', 'auto');

      requestAnimationFrame(() => {
        measureFoundationTrace();
        updateNextTracePoint();
      });
    } else {
      updateNextTracePoint();
    }
  } else if (!axisManualCutState.cutComplete) {
    axisManualCutState.cutReady = false;
    axisManualCutState.isSnapped = false;
    axisStage.classList.remove('is-cut-ready', 'is-user-cutting');
    setAxisVar('--trace-pointer-events', 'none');
    setAxisVar('--snap-opacity', '0');
    setAxisVar('--next-opacity', '0');
  }

  if (axisManualCutState.cutComplete) {
    axisStage.classList.add('is-cut-complete');
    axisStage.classList.remove('is-user-cutting');
    setAxisVar('--trace-pointer-events', 'none');
    setAxisVar('--trace-opacity', '0');
    setAxisVar('--trace-draw-opacity', '0');
    setAxisVar('--trace-dashed-opacity', '0');
    setAxisVar('--trace-dotted-image-opacity', '0');
    setAxisVar('--trace-cut-opacity', '0');
    setAxisVar('--snap-opacity', '0');
    setAxisVar('--next-opacity', '0');
  }

  const canSettle = axisManualCutState.cutComplete === true;
  const settleProgress = canSettle ? getPostCutSettleProgress() : 0;
  const settleTargetY = axisManualCutState.settleTargetY || 0;
  const settleEase = smooth(settleProgress);
  const settleBounce = 0;
  const settleY = lerp(0, settleTargetY, settleEase) + settleBounce;
  setAxisVar('--pillar-settle-y', `${settleY.toFixed(2)}px`);
  const settledStackY = keepOriginalCardsAsPillar
    ? contactStackY + bounceY + settleY
    : 0;
  setAxisVar('--stack-handoff-y', `${settledStackY.toFixed(2)}px`);
  const seatGuideProgress = canSettle ? smooth(settleProgress) : 0;
  const seatImpact = settleProgress > .68 && settleProgress < 1
    ? Math.sin(range(settleProgress, .68, 1) * Math.PI)
    : 0;
  setAxisVar('--axis-seat-progress', seatGuideProgress.toFixed(3));
  setAxisVar('--axis-seat-opacity', (canSettle ? Math.max(.28, seatGuideProgress) : 0).toFixed(3));
  setAxisVar('--axis-seat-impact', seatImpact.toFixed(3));
  setAxisVar('--axis-seat-y', `${lerp(16, 0, seatGuideProgress).toFixed(2)}px`);
  setAxisVar('--axis-seat-scale', (0.92 + seatImpact * 0.045).toFixed(3));
  setAxisVar('--axis-seat-ring-scale', (0.94 + seatImpact * 0.12).toFixed(3));
  setAxisVar('--axis-seat-shadow-width', `${(64 + seatImpact * 8).toFixed(2)}%`);
  setAxisVar('--axis-seat-label-y', `${lerp(6, 0, seatGuideProgress).toFixed(2)}px`);
  setAxisVar('--pillar-cut-edge-y', `${lerp(8, 0, seatGuideProgress).toFixed(2)}px`);

  axisStage.classList.toggle('is-settled', settleProgress >= 1);

  if (settleProgress >= 1) {
    lockAxisSettledMotion(axisStage);
  }

  const traceStoneZoomProgress = canDrawContour
    ? smooth(range(contourDrawProgress, .10, .52))
    : 0;
  const traceZoomProgress = axisManualCutState.cutComplete
    ? 1
    : Math.max(
      traceStoneZoomProgress,
      smooth(range(overlayProgress, 0, .82)),
      axisManualCutState.cutReady ? 1 : 0
    );
  const fitPullProgress = traceZoomProgress;
  const fitPullEase = 1 - Math.pow(1 - fitPullProgress, 1.85);
  const isFitCloseupActive = fitPullProgress > 0.001;
  const fitZoomMax = 1.5;
  const targetFitZoom = lerp(1, fitZoomMax, fitPullEase);
  const targetFitFocusOpacity = lerp(0, .42, fitPullEase);
  const targetFitPullLineOpacity = axisManualCutState.cutComplete ? 0 : lerp(0, .58, fitPullEase);
  const targetAxisBgPullScale = lerp(1.18, .84, fitPullEase);
  const smoothFitMotion = getSmoothedAxisFitMotion({
    zoom: targetFitZoom,
    focusOpacity: targetFitFocusOpacity,
    pullLineOpacity: targetFitPullLineOpacity,
    bgPullScale: targetAxisBgPullScale
  });
  const fitCameraY = 0;
  const fitZoomOriginY = `${(stageH - fitStoneBottom - fitStoneH * .52).toFixed(2)}px`;

  setAxisVar('--axis-fit-zoom', smoothFitMotion.zoom.toFixed(3));
  setAxisVar('--axis-fit-camera-y', `${fitCameraY.toFixed(2)}px`);
  setAxisVar('--axis-fit-zoom-origin-y', fitZoomOriginY);
  setAxisVar('--axis-pull-origin-y', fitZoomOriginY);
  setAxisVar('--axis-fit-focus-opacity', smoothFitMotion.focusOpacity.toFixed(3));
  setAxisVar('--axis-pull-line-opacity', smoothFitMotion.pullLineOpacity.toFixed(3));
  setAxisVar('--axis-bg-pull-scale', smoothFitMotion.bgPullScale.toFixed(3));

  if (isFitCloseupActive) {
    setAxisVar('--foundation-y', '0px');
    setAxisVar('--pillar-scale', '1');
    setAxisVar('--contact-stage-x', '0px');
    setAxisVar('--contact-stage-y', '0px');
    setAxisVar('--contact-stage-rot', '0deg');
    setAxisVar('--pillar-impact-scale', '0');
    setAxisVar('--foundation-impact-scale', '0');
  }

  const finalProgress = axisManualCutState.cutComplete && settleProgress >= 1
    ? 1
    : 0;
  setAxisVar('--final-opacity', finalProgress.toFixed(3));
  setAxisVar(
    '--stability-hint-opacity',
    (AXIS_ENABLE_FINAL_STABILITY_TEST && settleProgress >= 1 ? 1 : 0).toFixed(3)
  );

  if (globalProgress < AXIS_CONTACT_HOLD_RESET_PROGRESS && axisManualCutState.cutProgress > 0) {
    resetManualCutState();
  }

  updateAxisBuildLabel(globalProgress, {
    canStartAssembly,
    pillarComplete,
    canShowFoundation,
    foundationVisible,
    canFirstContact,
    firstContactComplete,
    notFittedComplete,
    bounceBackComplete,
    canDrawContour,
    canShowDashedGuide,
    dashedGuideOverlayComplete,
    canStartManualCut
  }, settleProgress);
  updateTraceStateLabel();
  clampAxisScrollBeforeNext();
}

function updateAxisStageRuler(activeStep) {
  const steps = ['stack', 'press', 'fit', 'cut', 'settle'];
  const activeIndex = steps.indexOf(activeStep);
  const rulerItems = document.querySelectorAll('.axis-stage-ruler [data-axis-step]');

  if (activeIndex < 0 || !rulerItems.length) return;

  rulerItems.forEach((item) => {
    const itemIndex = steps.indexOf(item.dataset.axisStep);

    item.classList.toggle('is-active', itemIndex === activeIndex);
    item.classList.toggle('is-complete', itemIndex < activeIndex);
  });
}

function updateAxisBuildLabel(globalProgress, gates, settleProgress) {
  const axisLabelC = document.querySelector('.axis-label-c');

  const {
    canStartAssembly,
    pillarComplete,
    canShowFoundation,
    foundationVisible,
    firstContactComplete,
    notFittedComplete,
    bounceBackComplete,
    canDrawContour,
    canShowDashedGuide,
    dashedGuideOverlayComplete,
    canStartManualCut
  } = gates;

  let label = '3 WORKS ENTER';
  let activeAxisStep = 'stack';

  if (globalProgress < 0.10) {
    label = '01 KIA / 02 GUNIT / 03 GRO ENTER';
  } else if (globalProgress < 0.24) {
    label = 'ALIGN TO BASELINE';
  } else if (!canStartAssembly) {
    label = 'WORKS READY';
  } else if (globalProgress < 0.40) {
    label = 'OVERLAP THREE WORKS';
  } else if (globalProgress < 0.50) {
    label = 'STACKED WORKS';
  } else if (globalProgress < 0.60) {
    label = 'PRESS INTO BOARD';
    activeAxisStep = 'press';
  } else if (globalProgress < 0.70) {
    label = 'COMPOSITE BOARD';
    activeAxisStep = 'press';
  } else if (!pillarComplete) {
    label = 'BOARD STANDS INTO PILLAR';
    activeAxisStep = 'fit';
  } else if (!canShowFoundation) {
    label = 'COMPOSITE PILLAR READY';
    activeAxisStep = 'fit';
  } else if (canShowFoundation && !foundationVisible) {
    label = 'FOUNDATION STONE APPEARS';
    activeAxisStep = 'fit';
  } else if (!firstContactComplete) {
    label = 'PILLAR DESCENDS';
    activeAxisStep = 'fit';
  } else if (!notFittedComplete) {
    label = 'NOT FITTED';
    activeAxisStep = 'fit';
  } else if (!bounceBackComplete) {
    label = 'BOUNCE BACK / NOT FITTED';
    activeAxisStep = 'fit';
  } else if (canDrawContour && !canShowDashedGuide) {
    label = 'GRANGI TRACE READY';
    activeAxisStep = 'fit';
  } else if (canShowDashedGuide && !dashedGuideOverlayComplete) {
    label = 'TRANSFER CONTOUR TO PILLAR';
    activeAxisStep = 'fit';
  } else if (canStartManualCut && !axisManualCutState.cutComplete) {
    label = axisManualCutState.isSnapped ? 'GRANGI TRACE / SNAP ON' : 'GRANGI / FOLLOW CONTOUR';
    activeAxisStep = 'cut';
  } else if (axisManualCutState.cutReady && !axisManualCutState.cutComplete) {
    label = 'GRANGI TRACE';
    activeAxisStep = 'cut';
  } else if (axisManualCutState.cutComplete && settleProgress < 1) {
    label = 'PILLAR DROP / SEAT ON';
    activeAxisStep = 'settle';
  } else if (
    settleProgress >= 1 &&
    AXIS_ENABLE_FINAL_STABILITY_TEST &&
    !axisManualCutState.stabilityComplete
  ) {
    label = 'PILLAR SEATED EXACTLY';
    activeAxisStep = 'settle';
  } else if (settleProgress >= 1) {
    label = 'READ · REFINE · CONNECT';
    activeAxisStep = 'settle';
  }

  if (axisLabelC && axisLabelC.textContent !== label) {
    axisLabelC.textContent = label;
    window.dispatchEvent(new Event('axis-statechange'));
  }
  updateAxisStageRuler(activeAxisStep);
}

let axisRaf = null;

function requestAxisUpdate() {
  if (axisRaf) return;

  axisRaf = requestAnimationFrame(() => {
    axisRaf = null;
    updateAxisInteraction();
  });
}

setupAxisImageLoadingCheck();
setupFoundationImageFallback();
measureFoundationTrace();
initManualFoundationCut();
initAxisPillarStabilityDrag();
initAxisSkipControl();
requestAxisUpdate();

window.addEventListener('wheel', handleAxisCutWheelLock, {passive:false});
window.addEventListener('scroll', handleAxisScroll, {passive:true});
window.addEventListener('resize', () => {
  measureFoundationTrace();
  requestAxisUpdate();
});
document.addEventListener('DOMContentLoaded', () => {
  setupFoundationImageFallback();
  measureFoundationTrace();
  initManualFoundationCut();
  initAxisPillarStabilityDrag();
  initAxisSkipControl();
  requestAxisUpdate();
});
window.addEventListener('load', () => {
  measureFoundationTrace();
  requestAxisUpdate();
});

