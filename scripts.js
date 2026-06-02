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

function initScrollGuide() {
  const guide = document.querySelector('[data-scroll-guide]');
  const character = document.querySelector('[data-hero-character]');

  if (!guide) return;

  guide.addEventListener('click', () => {
    const nextSection = document.querySelector('#tools');
    nextSection?.scrollIntoView({behavior:'smooth', block:'start'});
  });

  if (character) {
    guide.addEventListener('mouseenter', () => {
      character.classList.add('is-looking-guide');
    });

    guide.addEventListener('mouseleave', () => {
      character.classList.remove('is-looking-guide');
    });
  }
}

function initHeroIntroInteractions() {
  initSiteIntro();
  initAtelierLayerFallback();
  initHeroMainCharacter();
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

function initHeroMainCharacter() {
  const scene = document.querySelector('.hero-atelier-scene');
  const characterLayer = document.querySelector('.hero-character-layer');
  const characterButton = document.querySelector('.hero-character-button');
  const characterImg = document.querySelector('.hero-character');
  const bubble = document.querySelector('.hero-character-bubble');

  if (!scene || !characterLayer || !characterButton || !characterImg) return;

  const src = {
    idle: 'assets/hero/carpenter/carpenter-hero-idle-front.webp',
    blink: 'assets/hero/carpenter/carpenter-hero-calm-blink.webp',
    wave: 'assets/hero/carpenter/carpenter-hero-wave.webp',
    look: 'assets/hero/carpenter/carpenter-hero-look-right.webp'
  };

  Object.values(src).forEach((url) => {
    const img = new Image();
    img.src = url;
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let bubbleTimer = null;
  let expressionTimer = null;
  let poseTimer = null;
  let scheduleBlink = () => {};
  let isWaving = false;

  const hideCharacter = () => {
    characterButton.style.display = 'none';
  };

  const setCharacter = (nextSrc) => {
    if (characterImg.getAttribute('src') === nextSrc) return;
    characterImg.setAttribute('src', nextSrc);
  };

  const showBubble = (message) => {
    if (!bubble) return;

    bubble.textContent = message;
    bubble.classList.add('is-active');

    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => {
      bubble.classList.remove('is-active');
    }, 2200);
  };

  const setCharacterPose = (x = 0, y = 0, rotate = 0) => {
    characterLayer.style.setProperty('--character-look-x', `${x.toFixed(2)}px`);
    characterLayer.style.setProperty('--character-look-y', `${y.toFixed(2)}px`);
    characterLayer.style.setProperty('--character-rotate', `${rotate.toFixed(2)}deg`);
  };

  const resetCharacterPose = () => {
    setCharacterPose(0, 0, 0);
    if (!isWaving) setCharacter(src.idle);
  };

  const blinkOnce = (duration = 320) => {
    if (prefersReducedMotion || isWaving) return;

    window.clearTimeout(expressionTimer);
    window.clearTimeout(poseTimer);
    isWaving = true;
    setCharacter(src.blink);

    poseTimer = window.setTimeout(() => {
      isWaving = false;
      setCharacter(src.idle);
      resetCharacterPose();
      scheduleBlink();
    }, duration);
  };

  const waveOnce = (message = 'CONNECT THE EXPERIENCE') => {
    showBubble(message);

    if (prefersReducedMotion) return;

    window.clearTimeout(expressionTimer);
    window.clearTimeout(poseTimer);
    isWaving = true;
    setCharacterPose(3, -1, 1.4);
    setCharacter(src.wave);

    poseTimer = window.setTimeout(() => {
      isWaving = false;
      setCharacter(src.idle);
      resetCharacterPose();
      scheduleBlink();
    }, 1450);
  };

  characterImg.addEventListener('error', hideCharacter);

  if (characterImg.complete && characterImg.naturalWidth === 0) {
    hideCharacter();
    return;
  }

  window.addEventListener('heroWorkbenchActive', (event) => {
    const work = event.detail?.work || 'kia';
    const messages = {
      kia: 'READ THE STRUCTURE',
      gunit: 'REFINE THE FLOW',
      gro: 'CONNECT THE EXPERIENCE'
    };

    showBubble(messages[work] || messages.kia);

    if (prefersReducedMotion) return;

    window.clearTimeout(poseTimer);

    if (work === 'gunit') {
      setCharacter(src.look);
      setCharacterPose(4, -1, 1.6);
      poseTimer = window.setTimeout(resetCharacterPose, 950);
      return;
    }

    if (work === 'gro') {
      setCharacterPose(2, -1, .8);
      blinkOnce(260);
      return;
    }

    resetCharacterPose();
  });

  window.addEventListener('heroWorkbenchSelect', () => {
    waveOnce('SELECTED FROM THE WORK BAR');
  });

  if (!prefersReducedMotion) {
    scene.addEventListener('mousemove', (event) => {
      const rect = scene.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      const lookX = Math.max(-6, Math.min(6, x * 10));
      const lookY = Math.max(-5, Math.min(5, y * 8));
      const rotate = Math.max(-4, Math.min(4, x * 5));

      setCharacterPose(lookX, lookY, rotate);

      if (!isWaving && x > 0.12) {
        setCharacter(src.look);
      } else if (!isWaving && x <= 0.12) {
        setCharacter(src.idle);
      }
    });

    scene.addEventListener('mouseleave', () => {
      resetCharacterPose();
    });

    scheduleBlink = () => {
      window.clearTimeout(expressionTimer);

      expressionTimer = window.setTimeout(() => {
        if (isWaving) {
          scheduleBlink();
          return;
        }

        setCharacter(src.blink);

        window.setTimeout(() => {
          if (!isWaving) setCharacter(src.idle);
          scheduleBlink();
        }, 520);
      }, 4200);
    };

    scheduleBlink();
  }

  characterButton.addEventListener('mouseenter', () => {
    showBubble('SELECT A WORK BELOW');
  });

  characterButton.addEventListener('click', () => {
    waveOnce('READ · REFINE · CONNECT');
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

function initCursorToolSystem() {
  const cursor = document.querySelector('.site-cursor');
  const label = cursor?.querySelector('.site-cursor-label');
  const targets = document.querySelectorAll('[data-cursor-label]');
  const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!cursor || isTouchLike || reduceMotion) return;

  const clearCursorMode = () => {
    document.body.classList.remove(
      'cursor-light',
      'cursor-inspect',
      'cursor-cut',
      'cursor-preview'
    );

    if (label) label.textContent = '';
  };

  const setCursorMode = (value) => {
    const normalized = value.trim().toLowerCase();
    clearCursorMode();

    if (label) label.textContent = value;

    if (normalized.includes('light')) {
      document.body.classList.add('cursor-light');
    } else if (normalized.includes('inspect')) {
      document.body.classList.add('cursor-inspect');
    } else if (normalized.includes('cut')) {
      document.body.classList.add('cursor-cut');
    } else {
      document.body.classList.add('cursor-preview');
    }
  };

  window.addEventListener('pointermove', (event) => {
    document.body.classList.add('is-using-cursor');
    document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
  }, {passive:true});

  targets.forEach((target) => {
    target.addEventListener('pointerenter', () => {
      setCursorMode(target.dataset.cursorLabel || 'PREVIEW');
    });

    target.addEventListener('pointerleave', clearCursorMode);
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
  updateIndicator();
}

function initProfileLayoutFormation() {
  const profile = document.querySelector('.profile');
  if (!profile) return;

  if (reduceMotion) {
    profile.classList.add('is-inview');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      profile.classList.toggle('is-inview', entry.isIntersecting);
    });
  }, {
    threshold:.24,
    rootMargin:'0px 0px -12% 0px'
  });

  observer.observe(profile);
}

function initPartialWoodShaveReveal() {
  const section = document.querySelector('.about-shave-reveal');
  const board = document.querySelector('[data-shave-board]');
  if (!section || !board) return;

  const plane = board.querySelector('.wood-plane');
  const shavingImages = board.querySelectorAll('.wood-shaving-img');
  const mobileFallback = window.matchMedia('(max-width: 640px)').matches;
  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const segment = (value, start, end) => clamp((value - start) / (end - start));
  const lerp = (from, to, amount) => from + (to - from) * amount;
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

  const setNumber = (name, value) => {
    board.style.setProperty(name, String(Number(value).toFixed(3)));
  };

  const setPercent = (name, value) => {
    board.style.setProperty(name, `${Number(value).toFixed(2)}%`);
  };

  const revealStatic = () => {
    setNumber('--p1-scale', 0);
    setNumber('--p2-scale', 0);
    setNumber('--p3-scale', 0);
    setNumber('--p1-num', 1);
    setNumber('--p2-num', 1);
    setNumber('--p3-num', 1);
    setNumber('--dust-progress', .72);
    setNumber('--plane-opacity', 0);
    board.classList.add('is-shave-complete');
    board.classList.remove('is-shave-ready');
    board.removeAttribute('data-active-shave-pass');
  };

  if (plane) {
    plane.addEventListener('error', () => {
      const fallback = plane.dataset.planeFallback;
      if (fallback && plane.src.indexOf(fallback) === -1) {
        plane.src = fallback;
        return;
      }

      plane.hidden = true;
      board.classList.add('is-plane-missing');
    });
  }

  shavingImages.forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
    }, {once:true});
  });

  if (reduceMotion || mobileFallback) {
    revealStatic();
    return;
  }

  board.classList.add('is-shave-ready');

  let ticking = false;

  const update = () => {
    ticking = false;

    const rect = section.getBoundingClientRect();
    const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-rect.top / scrollable);

    const p1 = easeOutCubic(segment(progress, .04, .32));
    const p2 = easeOutCubic(segment(progress, .34, .64));
    const p3 = easeOutCubic(segment(progress, .66, .92));

    setNumber('--p1-scale', 1 - p1);
    setNumber('--p2-scale', 1 - p2);
    setNumber('--p3-scale', 1 - p3);
    setNumber('--p1-num', p1);
    setNumber('--p2-num', p2);
    setNumber('--p3-num', p3);
    setNumber('--dust-progress', clamp((p1 * .25) + (p2 * .3) + (p3 * .45)));

    let activePass = 1;
    let local = p1;
    let x = lerp(-8, 108, p1);
    let y = lerp(28, 31, p1);
    let rotate = lerp(3, -2, p1);
    let flip = 1;
    let edgeRot = -1.2;

    if (progress >= .34 && progress < .66) {
      activePass = 2;
      local = p2;
      x = lerp(108, -8, p2);
      y = lerp(49, 53, p2);
      rotate = lerp(-4, 2, p2);
      flip = -1;
      edgeRot = .9;
    }

    if (progress >= .66) {
      activePass = 3;
      local = p3;
      x = lerp(-8, 104, p3);
      y = lerp(72, 75, p3);
      rotate = lerp(4, -1, p3);
      flip = 1;
      edgeRot = -.5;
    }

    const wiggle = Math.sin(local * Math.PI) * 2.2;
    const planeY = y + wiggle;
    const planeOpacity = progress > .96 ? .34 : progress < .015 ? .95 : 1;

    setPercent('--plane-x', x);
    setPercent('--plane-y', planeY);
    board.style.setProperty('--plane-rotate', `${rotate.toFixed(2)}deg`);
    board.style.setProperty('--plane-flip', String(flip));
    setNumber('--plane-opacity', planeOpacity);
    setPercent('--active-edge-x', x);
    setPercent('--active-edge-y', planeY + .8);
    board.style.setProperty('--active-edge-rot', `${edgeRot}deg`);

    setNumber('--shaving1-opacity', clamp(p1 * 1.35));
    setNumber('--shaving1-scale', .65 + (p1 * .35));
    setNumber('--shaving2-opacity', clamp(p2 * 1.35));
    setNumber('--shaving2-scale', .65 + (p2 * .35));
    setNumber('--shaving3-opacity', clamp(p3 * 1.35));
    setNumber('--shaving3-scale', .65 + (p3 * .35));

    if (activePass === 1) {
      setPercent('--shaving1-x', clamp(x - 10, 7, 82));
      setPercent('--shaving1-y', planeY + 4);
    } else if (activePass === 2) {
      setPercent('--shaving2-x', clamp(x + 8, 12, 84));
      setPercent('--shaving2-y', planeY + 4);
    } else {
      setPercent('--shaving3-x', clamp(x - 10, 10, 82));
      setPercent('--shaving3-y', planeY + 4);
    }

    if (progress > .015 && progress < .94 && local > .02 && local < .985) {
      board.dataset.activeShavePass = String(activePass);
    } else {
      board.removeAttribute('data-active-shave-pass');
    }

    board.classList.toggle('is-shave-complete', progress >= .92);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate);
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
    const transitionActivity = transitionProgress > 0 && transitionProgress < 1 ? 1 : 0;
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
  const titleTargets = document.querySelectorAll('.hero-title, .profile h2, .tools-board-title, .works-copy h2, .contact h2');
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

initScrollGuide();
initPageContinuity();
initSectionReveal();
initTitleReveal();
initHeroIntroInteractions();
initCursorToolSystem();
initWorksInspector();
initProjectFilters();
initContactLinks();
initWorksPreviewCursor();
initToolsPegboardInteraction();
initSectionStageIndicator();
initProfileLayoutFormation();
initPartialWoodShaveReveal();

const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('.nav a')];
const navObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const id = entry.target.id;
      navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === '#' + id));
    }
  });
},{threshold:.38});
sections.forEach(section => navObserver.observe(section));

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

const isToolsCalibrateMode = new URLSearchParams(window.location.search).get('calibrate') === 'tools';
const toolsStage = document.querySelector('.tools-photo-stage');

if (isToolsCalibrateMode && toolsStage) {
  const calibrationKey = 'toolsCalibrationV2';
  const pinOrder = [
    'tool-pin-js',
    'tool-pin-vscode',
    'tool-pin-react',
    'tool-pin-figma',
    'tool-pin-ps',
    'tool-pin-ai',
    'tool-pin-aitools',
    'tool-pin-autocad'
  ];
  const targetOrder = [
    ...pinOrder,
    'tools-card-text-layer',
    'tools-board-title',
    'tools-board-meta-left',
    'tools-board-meta-right',
    'tools-board-footer'
  ];
  const calibrationTargets = targetOrder
    .map((className) => toolsStage.querySelector(`.${className}`))
    .filter(Boolean);
  const toolPins = calibrationTargets.filter((item) => item.classList.contains('tool-pin'));
  let selectedTarget = null;
  let draggingTarget = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  toolsStage.classList.add('is-calibrating');

  const panel = document.createElement('div');
  panel.className = 'tools-calibration-panel';
  panel.innerHTML = `
    <strong>Tools Calibration</strong>
    <div data-calibration-selected>No tool selected</div>
    <label>left <input data-calibration-field="left" type="number" step="0.1" disabled></label>
    <label>top <input data-calibration-field="top" type="number" step="0.1" disabled></label>
    <label>right <input data-calibration-field="right" type="number" step="0.1" disabled></label>
    <label>bottom <input data-calibration-field="bottom" type="number" step="0.1" disabled></label>
    <label>width <input data-calibration-field="width" type="number" step="0.1" disabled></label>
    <label>height <input data-calibration-field="height" type="number" step="0.1" disabled></label>
    <label>scale <input data-calibration-field="scale" type="number" step="0.01" disabled></label>
    <label>rotate <input data-calibration-field="rotate" type="number" step="0.1" disabled></label>
    <button type="button" data-calibration-reference>Toggle Reference</button>
    <button type="button" data-calibration-grid>Toggle Grid</button>
    <button type="button" data-calibration-copy>Copy CSS</button>
    <button type="button" data-calibration-reset>Reset Local</button>
    <code data-calibration-output>Select an item to calibrate.</code>
  `;
  document.body.appendChild(panel);

  const selectedLabel = panel.querySelector('[data-calibration-selected]');
  const fields = {
    left: panel.querySelector('[data-calibration-field="left"]'),
    top: panel.querySelector('[data-calibration-field="top"]'),
    right: panel.querySelector('[data-calibration-field="right"]'),
    bottom: panel.querySelector('[data-calibration-field="bottom"]'),
    width: panel.querySelector('[data-calibration-field="width"]'),
    height: panel.querySelector('[data-calibration-field="height"]'),
    scale: panel.querySelector('[data-calibration-field="scale"]'),
    rotate: panel.querySelector('[data-calibration-field="rotate"]')
  };
  const output = panel.querySelector('[data-calibration-output]');
  const referenceButton = panel.querySelector('[data-calibration-reference]');
  const gridButton = panel.querySelector('[data-calibration-grid]');
  const copyButton = panel.querySelector('[data-calibration-copy]');
  const resetButton = panel.querySelector('[data-calibration-reset]');

  function getTargetClass(target) {
    return targetOrder.find((className) => target.classList.contains(className));
  }

  function getMetrics(target) {
    const stageRect = toolsStage.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const styles = getComputedStyle(target);
    const scale = parseFloat(styles.getPropertyValue('--tool-scale')) || 1;
    const rotateRaw = styles.getPropertyValue('--tool-rot').trim();
    const rotate = Number.parseFloat(rotateRaw) || 0;

    return {
      left: (target.offsetLeft / stageRect.width) * 100,
      top: (target.offsetTop / stageRect.height) * 100,
      right: ((stageRect.right - rect.right) / stageRect.width) * 100,
      bottom: ((stageRect.bottom - rect.bottom) / stageRect.height) * 100,
      width: (rect.width / stageRect.width) * 100,
      height: (rect.height / stageRect.height) * 100,
      scale,
      rotate
    };
  }

  function getCapabilities(target) {
    const className = getTargetClass(target);
    const isTool = target.classList.contains('tool-pin');

    if (isTool) return ['left', 'top', 'width', 'scale', 'rotate'];
    if (className === 'tools-card-text-layer') return ['left', 'right', 'bottom', 'height'];
    if (className === 'tools-board-title') return ['left', 'top', 'width', 'height'];
    if (className === 'tools-board-meta-left') return ['left', 'top', 'width', 'height'];
    if (className === 'tools-board-meta-right') return ['right', 'top', 'width', 'height'];
    if (className === 'tools-board-footer') return ['left', 'bottom', 'width', 'height'];
    return ['left', 'top', 'width', 'height'];
  }

  function loadPositions() {
    try {
      return JSON.parse(localStorage.getItem(calibrationKey)) || {};
    } catch (error) {
      return {};
    }
  }

  function savePositions() {
    const positions = {};
    calibrationTargets.forEach((target) => {
      const className = getTargetClass(target);
      if (!className) return;
      const metrics = getMetrics(target);
      const capabilities = getCapabilities(target);
      positions[className] = {};

      capabilities.forEach((key) => {
        const precision = key === 'scale' ? 2 : 2;
        positions[className][key] = Number(metrics[key].toFixed(precision));
      });
    });

    try {
      localStorage.setItem(calibrationKey, JSON.stringify(positions));
    } catch (error) {}
  }

  function setPercent(target, property, value) {
    target.style[property] = `${value.toFixed(2)}%`;
  }

  function applyPosition(target, values) {
    const isRightBased = target.classList.contains('tools-board-meta-right');
    const isBottomBased = target.classList.contains('tools-card-text-layer')
      || target.classList.contains('tools-board-footer');

    if (typeof values.left === 'number') {
      setPercent(target, 'left', values.left);
      if (isRightBased) target.style.right = 'auto';
    }
    if (typeof values.right === 'number') {
      setPercent(target, 'right', values.right);
      if (isRightBased || target.classList.contains('tools-card-text-layer')) target.style.left = target.style.left || '';
    }
    if (typeof values.top === 'number') {
      setPercent(target, 'top', values.top);
      if (isBottomBased) target.style.bottom = 'auto';
    }
    if (typeof values.bottom === 'number') {
      setPercent(target, 'bottom', values.bottom);
      if (isBottomBased) target.style.top = 'auto';
    }
    if (typeof values.width === 'number') setPercent(target, 'width', values.width);
    if (typeof values.height === 'number') setPercent(target, 'height', values.height);
    if (typeof values.scale === 'number') {
      target.style.setProperty('--tool-scale', values.scale.toFixed(2));
      target.style.setProperty('--tool-scale-hover', (values.scale + .05).toFixed(2));
    }
    if (typeof values.rotate === 'number') {
      target.style.setProperty('--tool-rot', `${values.rotate.toFixed(2)}deg`);
    }
  }

  function applySavedPositions() {
    const positions = loadPositions();
    calibrationTargets.forEach((target) => {
      const className = getTargetClass(target);
      if (!className || !positions[className]) return;
      applyPosition(target, positions[className]);
    });
  }

  function setSelectedTarget(target) {
    selectedTarget?.classList.remove('is-selected');
    selectedTarget = target;
    selectedTarget?.classList.add('is-selected');
    updatePanel();
  }

  function updatePanel(message = '') {
    if (!selectedTarget) {
      selectedLabel.textContent = 'No tool selected';
      Object.values(fields).forEach((field) => {
        field.value = '';
        field.disabled = true;
      });
      output.textContent = message || 'Select an item to calibrate.';
      return;
    }

    const className = getTargetClass(selectedTarget);
    const metrics = getMetrics(selectedTarget);
    const capabilities = getCapabilities(selectedTarget);
    selectedLabel.textContent = className || 'Selected item';

    Object.entries(fields).forEach(([key, field]) => {
      field.disabled = !capabilities.includes(key);
      field.value = capabilities.includes(key) ? metrics[key].toFixed(key === 'scale' ? 2 : 2) : '';
    });

    output.textContent = message || `${className}\n${capabilities.map((key) => `${key}: ${metrics[key].toFixed(2)}`).join('\n')}`;
  }

  function updateTargetFromPointer(target, event) {
    const stageRect = toolsStage.getBoundingClientRect();
    const metrics = getMetrics(target);
    const isTool = target.classList.contains('tool-pin');
    const isRightBased = target.classList.contains('tools-board-meta-right');
    const isBottomBased = target.classList.contains('tools-card-text-layer')
      || target.classList.contains('tools-board-footer');

    if (isTool) {
      const left = ((event.clientX - stageRect.left) / stageRect.width) * 100;
      const top = ((event.clientY - stageRect.top) / stageRect.height) * 100;
      applyPosition(target, {left, top});
    } else {
      const newLeft = ((event.clientX - stageRect.left - dragOffsetX) / stageRect.width) * 100;
      const newTop = ((event.clientY - stageRect.top - dragOffsetY) / stageRect.height) * 100;

      if (isRightBased) {
        applyPosition(target, {right: 100 - newLeft - metrics.width, top: newTop});
      } else if (isBottomBased) {
        applyPosition(target, {left: newLeft, bottom: 100 - newTop - metrics.height});
      } else {
        applyPosition(target, {left: newLeft, top: newTop});
      }
    }
    savePositions();
    updatePanel();
  }

  function nudgeSelected(deltaLeft, deltaTop, deltaWidth = 0, deltaScale = 0, deltaRotate = 0) {
    if (!selectedTarget) return;

    const metrics = getMetrics(selectedTarget);
    const capabilities = getCapabilities(selectedTarget);
    const values = {};

    if (capabilities.includes('left')) values.left = metrics.left + deltaLeft;
    if (capabilities.includes('right')) values.right = metrics.right - deltaLeft;
    if (capabilities.includes('top')) values.top = metrics.top + deltaTop;
    if (capabilities.includes('bottom')) values.bottom = metrics.bottom - deltaTop;
    if (capabilities.includes('width')) values.width = Math.max(.5, metrics.width + deltaWidth);
    if (capabilities.includes('scale')) values.scale = Math.max(.05, metrics.scale + deltaScale);
    if (capabilities.includes('rotate')) values.rotate = metrics.rotate + deltaRotate;

    applyPosition(selectedTarget, values);
    savePositions();
    updatePanel();
  }

  function formatRule(className, declarations) {
    return `.${className} {\n${declarations.map((item) => `  ${item}`).join('\n')}\n}`;
  }

  function generateCss() {
    const pinCss = pinOrder.map((pinClass) => {
      const pin = toolsStage.querySelector(`.${pinClass}`);
      if (!pin) return '';
      const metrics = getMetrics(pin);
      const hoverScale = Number.parseFloat(getComputedStyle(pin).getPropertyValue('--tool-scale-hover')) || metrics.scale + .05;
      return formatRule(pinClass, [
        `left: ${metrics.left.toFixed(2)}%;`,
        `top: ${metrics.top.toFixed(2)}%;`,
        `width: ${metrics.width.toFixed(2)}%;`,
        `--tool-scale: ${metrics.scale.toFixed(2)};`,
        `--tool-scale-hover: ${hoverScale.toFixed(2)};`,
        `--tool-rot: ${metrics.rotate.toFixed(2)}deg;`
      ]);
    }).filter(Boolean);

    const cardLayer = toolsStage.querySelector('.tools-card-text-layer');
    const title = toolsStage.querySelector('.tools-board-title');
    const metaLeft = toolsStage.querySelector('.tools-board-meta-left');
    const metaRight = toolsStage.querySelector('.tools-board-meta-right');
    const footer = toolsStage.querySelector('.tools-board-footer');
    const extraCss = [];

    if (cardLayer) {
      const m = getMetrics(cardLayer);
      extraCss.push(formatRule('tools-card-text-layer', [
        `left: ${m.left.toFixed(2)}%;`,
        `right: ${m.right.toFixed(2)}%;`,
        `bottom: ${m.bottom.toFixed(2)}%;`,
        `height: ${m.height.toFixed(2)}%;`
      ]));
    }
    if (title) {
      const m = getMetrics(title);
      extraCss.push(formatRule('tools-board-title', [
        `left: ${m.left.toFixed(2)}%;`,
        `top: ${m.top.toFixed(2)}%;`,
        `width: ${m.width.toFixed(2)}%;`,
        `height: ${m.height.toFixed(2)}%;`
      ]));
    }
    if (metaLeft) {
      const m = getMetrics(metaLeft);
      extraCss.push(formatRule('tools-board-meta-left', [
        `left: ${m.left.toFixed(2)}%;`,
        `top: ${m.top.toFixed(2)}%;`
      ]));
    }
    if (metaRight) {
      const m = getMetrics(metaRight);
      extraCss.push(formatRule('tools-board-meta-right', [
        `right: ${m.right.toFixed(2)}%;`,
        `top: ${m.top.toFixed(2)}%;`
      ]));
    }
    if (footer) {
      const m = getMetrics(footer);
      extraCss.push(formatRule('tools-board-footer', [
        `left: ${m.left.toFixed(2)}%;`,
        `bottom: ${m.bottom.toFixed(2)}%;`
      ]));
    }

    return [...pinCss, ...extraCss].join('\n\n');
  }

  async function copyCss() {
    const css = generateCss();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(css);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = css;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      output.textContent = 'Copied';
      window.setTimeout(() => updatePanel(), 1200);
    } catch (error) {
      output.textContent = css;
    }
  }

  applySavedPositions();

  calibrationTargets.forEach((target) => {
    target.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = target.getBoundingClientRect();
      setSelectedTarget(target);
      draggingTarget = target;
      dragOffsetX = event.clientX - rect.left;
      dragOffsetY = event.clientY - rect.top;
      target.setPointerCapture?.(event.pointerId);
    });

    target.addEventListener('pointermove', (event) => {
      if (draggingTarget !== target) return;
      event.preventDefault();
      updateTargetFromPointer(target, event);
    });

    target.addEventListener('pointerup', () => {
      draggingTarget = null;
    });

    target.addEventListener('pointercancel', () => {
      draggingTarget = null;
    });
  });

  Object.entries(fields).forEach(([key, field]) => {
    field.addEventListener('input', () => {
      if (!selectedTarget) return;
      const value = Number(field.value);
      if (!Number.isFinite(value)) return;

      applyPosition(selectedTarget, {[key]: value});
      savePositions();
      updatePanel();
    });
  });

  referenceButton.addEventListener('click', () => {
    toolsStage.classList.toggle('show-reference');
    referenceButton.textContent = toolsStage.classList.contains('show-reference')
      ? 'Hide Reference'
      : 'Toggle Reference';
  });

  gridButton.addEventListener('click', () => {
    toolsStage.classList.toggle('show-grid');
    gridButton.textContent = toolsStage.classList.contains('show-grid')
      ? 'Hide Grid'
      : 'Toggle Grid';
  });

  copyButton.addEventListener('click', copyCss);

  resetButton.addEventListener('click', () => {
    try {
      localStorage.removeItem(calibrationKey);
    } catch (error) {}
    window.location.reload();
  });

  document.addEventListener('keydown', (event) => {
    if (!selectedTarget) return;

    const step = event.shiftKey ? .5 : event.altKey ? .05 : .1;
    const scaleStep = event.shiftKey ? .06 : .02;
    const rotateStep = event.shiftKey ? -.5 : .5;
    const keyMap = {
      ArrowLeft: [-step, 0, 0, 0, 0],
      ArrowRight: [step, 0, 0, 0, 0],
      ArrowUp: [0, -step, 0, 0, 0],
      ArrowDown: [0, step, 0, 0, 0],
      '+': [0, 0, step, 0, 0],
      '=': [0, 0, step, 0, 0],
      '-': [0, 0, -step, 0, 0],
      ']': [0, 0, 0, scaleStep, 0],
      '[': [0, 0, 0, -scaleStep, 0],
      r: [0, 0, 0, 0, rotateStep],
      R: [0, 0, 0, 0, -.5]
    };
    const delta = keyMap[event.key];
    if (!delta) return;

    event.preventDefault();
    nudgeSelected(delta[0], delta[1], delta[2], delta[3], delta[4]);
  });

  updatePanel();
}

const projectModalData = {
  kia: {
    no: '01 / MAIN PROJECT',
    title: 'KIA Website',
    type: '기아 공식 웹사이트 리뉴얼 프로젝트',
    image: 'assets/kia-thumb.webp',
    alt: 'KIA Website project board',
    desc: '브랜드 경험을 디지털로 확장한 공식 웹사이트 리뉴얼 프로젝트입니다.',
    points: [
      '차량 정보 구조와 탐색 흐름을 정리해 사용자가 핵심 정보를 빠르게 찾도록 설계',
      '시네마틱 비주얼과 직관적 인터랙션으로 브랜드 이미지를 강화',
      'PC 중심 화면에서 반응형 흐름까지 이어지는 웹 UI 구조를 구성'
    ],
    git: '',
    tags: ['UI/UX', 'Frontend', 'Responsive Web']
  },
  gunit: {
    no: '02 / MAIN PROJECT',
    title: 'GUNIT App',
    type: '에어소프트 입문자를 첫 경기까지 연결하는 온보딩 기반 커뮤니티 서비스',
    image: 'assets/gunit-thumb.png',
    alt: 'GUNIT App project board',
    desc: 'GUNIT은 에어소프트 입문자가 정보 탐색에서 멈추지 않고, 실제 첫 참여까지 이어질 수 있도록 설계한 서비스입니다. AI 가이드, 버디 매칭, 경기·필드 탐색, 장비 안내를 하나의 흐름으로 연결해 초보자의 진입 부담을 낮추는 것을 목표로 했습니다.',
    points: [
      '입문자의 첫 참여 장벽을 낮추는 서비스',
      '정보 탐색 → 준비 → 경기 참여까지 연결',
      'AI 가이드, 버디 매칭, 경기/필드 탐색 기능 구성',
      '초보자도 안전하게 시작할 수 있는 온보딩 UX 설계'
    ],
    gitLabel: 'LIVE SITE',
    git: 'https://airsoft-nine.vercel.app/',
    gitDisplay: 'https://airsoft-nine.vercel.app/',
    tags: ['APP DESIGN', 'UX/UI', 'ONBOARDING', 'COMMUNITY', 'AI GUIDE', 'BUDDY MATCHING']
  },
  gro: {
    no: '03 / MAIN PROJECT',
    title: 'GRO App',
    type: '반려식물 루틴 관리 앱 프로젝트',
    image: 'assets/GRO-project-thumb.png',
    alt: 'GRO App project board',
    desc: '식물 관리 루틴을 쉽게 기록하고 반복할 수 있도록 정리한 앱 프로젝트입니다.',
    points: [
      '물 주기, 빛 환경, 성장 상태를 쉽게 기록하는 반려식물 관리 흐름 설계',
      '초보 사용자도 식물 상태를 이해할 수 있도록 정보 구조를 단순화',
      '차분한 그린 톤 UI와 반복 루틴 중심의 화면 설계로 일상적인 관리 경험 제공'
    ],
    git: '',
    tags: ['App Design', 'Routine', 'Plant Care']
  },
  character: {
    no: '01 / SUPPORTING WORK',
    title: 'Character Design',
    type: '캐릭터 시스템과 3D 적용 보드',
    image: 'assets/character-crop.png',
    alt: 'Character Design board',
    desc: '캐릭터 컨셉과 장면 일러스트, 3D 스탠디 적용 방향을 하나의 보드로 정리한 작업입니다.',
    points: [
      '빵랑자 캐릭터의 성격과 세계관을 한눈에 읽히는 포스터 보드로 구성',
      '장면 일러스트, 표정, 키 모티프, 컬러 팔레트를 하나의 캐릭터 시스템으로 정리',
      '2D 캐릭터가 3D 스탠디와 굿즈 형태로 확장될 수 있는 적용 방향 제안'
    ],
    git: '',
    tags: ['Character', 'Illustration', '3D Application']
  },
  residential: {
    no: '02 / 3D WORK',
    title: 'Residential House',
    type: '협소 대지 주거 공간 3D 시각화',
    image: 'assets/modeling-residential-board.png',
    alt: 'Residential House Project board',
    desc: '좁은 필지의 주거 공간을 외관, 내부, 평면, 단면 정보가 함께 읽히도록 구성한 3D 보드입니다.',
    points: [
      '협소 대지 조건에서 수직 동선과 채광 구조가 드러나도록 공간을 모델링',
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
    image: 'assets/modeling-pavilion-board.png',
    alt: 'Wood Pavilion Architectural Space Study board',
    desc: '목재 구조와 자연광, 내부 체류 경험을 건축 보드 형식으로 정리한 3D 공간 시각화 작업입니다.',
    points: [
      '목구조의 반복 리듬과 재료감을 외관 및 내부 렌더링으로 표현',
      'plan / section과 interior view를 함께 배치해 공간의 구조와 사용 흐름을 설명',
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
const projectModalGitLabel = document.getElementById('projectModalGitLabel');
const projectModalGit = document.getElementById('projectModalGit');
const projectModalLink = document.getElementById('projectModalLink');
const projectModalTags = document.getElementById('projectModalTags');
const projectOpenButtons = document.querySelectorAll('.project-open');
const axisProjectButtons = document.querySelectorAll('[data-axis-project]');
let pinnedWorksCard = null;
let lastFocusedProjectTrigger = null;

function showProjectImageFallback(data) {
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

  if (projectModalGit) {
    projectModalGit.value = data.gitDisplay || data.git || '';
  }

  if (projectModalGitLabel) {
    projectModalGitLabel.textContent = data.gitLabel || 'Git Address';
  }

  if (projectModalLink) {
    if (data.git) {
      projectModalLink.href = data.git;
      projectModalLink.target = '_blank';
      projectModalLink.rel = 'noopener noreferrer';
      projectModalLink.hidden = false;
      projectModalLink.setAttribute('aria-disabled', 'false');
    } else {
      projectModalLink.removeAttribute('href');
      projectModalLink.hidden = true;
      projectModalLink.setAttribute('aria-disabled', 'true');
    }
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
  button.addEventListener('click', () => {
    const projectKey = button.dataset.axisProject;
    if (!projectModalData[projectKey]) return;

    openProjectModal(projectKey, button);
  });
});

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
    activatePanel('default');
  };

  cards.forEach((card) => {
    const target = card.dataset.inspectorTarget;

    card.addEventListener('mouseenter', () => {
      activatePanel(target);
    });

    card.addEventListener('focus', () => {
      activatePanel(target);
    });

    card.addEventListener('mouseleave', resetPanel);
    card.addEventListener('blur', resetPanel);
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

async function initContactLinks() {
  if (initContactLinks.isInitialized) return;

  const linkArea = document.querySelector('[data-contact-links]');
  if (!linkArea) return;

  initContactLinks.isInitialized = true;

  const email = (linkArea.dataset.contactEmail || '').trim();
  const resumeUrl = (linkArea.dataset.resumeUrl || '').trim();
  const portfolioUrl = (linkArea.dataset.portfolioUrl || '').trim();
  const githubUrl = 'https://github.com/jaeking92-lgtm/jaehyuk-portfolio';

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
    {label: 'GitHub', href: githubUrl, external: true},
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

initWorksInspector();
initProjectFilters();
initContactLinks();


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

const axisManualCutState = {
  pathLength: 0,
  traceSamples: [],
  traceSampleKey: '',
  traceDrawComplete: false,
  cutReady: false,
  cutComplete: false,
  isSnapped: false,
  maxReachedIndex: 0,
  cutProgress: 0,
  cutCompleteScrollY: null,
  settleProgress: 0,
  settleTargetY: 0,
  contactHoldProgress: 0,
  contactHoldComplete: false,
  contactHoldScrollY: null,
  stabilityWheelProgress: 0,
  stabilityComplete: false,
  isInitialized: false
};

const TRACE_SAMPLE_COUNT = 220;
const MAGNET_IN = 34;
const MAGNET_OUT = 52;
const MAX_FORWARD_JUMP = 18;
const AXIS_CUT_COMPLETE_FALLBACK_PROGRESS = 0.92;
const AXIS_CUT_COMPLETE_MARGIN = 0.018;
const AXIS_CONTACT_HOLD_START_PROGRESS = 0.89;
const AXIS_CONTACT_HOLD_RESET_PROGRESS = 0.84;
const AXIS_STABILITY_WHEEL_RESISTANCE = 0.68;
const AXIS_PILLAR_SEAT_ANCHOR_RATIO = 0.18;
const AXIS_PILLAR_CUT_SEAT_COMPENSATION = 44;
const AXIS_TRACE_VIEWBOX_H = 220;
const AXIS_TRACE_BOTTOM_ANCHOR_Y = 165;
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
    const localX = ((point.x - viewBoxX) / viewBoxW) * svgRect.width;
    const localY = ((point.y - viewBoxY) / viewBoxH) * svgRect.height;

    samples.push({
      index: i,
      progress,
      x: svgRect.left + localX,
      y: svgRect.top + localY,
      localX,
      localY
    });
  }

  return samples;
}

function syncFoundationTraceSamples(force = false) {
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
  syncFoundationTraceSamples();

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

  setAxisVar('--snap-x', `${closest.localX.toFixed(2)}px`);
  setAxisVar('--snap-y', `${closest.localY.toFixed(2)}px`);
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
  const pillar = document.querySelector('.axis-composite-pillar');
  const axisStage = document.querySelector('.project-axis-stage');
  const fitLabelMain = document.querySelector('.fit-label-main');
  const fitLabelState = document.querySelector('.fit-label-state');

  if (!pillar || !axisStage || axisPillarStabilityState.isInitialized) return;

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
      if (fitLabelMain) fitLabelMain.textContent = 'CONTACT CHECK';
      if (fitLabelState) fitLabelState.textContent = 'FITTED';
    }, 820);
  };

  pillar.addEventListener('pointerdown', (event) => {
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
    pillar.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  pillar.addEventListener('pointermove', (event) => {
    if (!axisPillarStabilityState.isDragging) return;
    if (axisPillarStabilityState.pointerId !== event.pointerId) return;

    const dragX = event.clientX - axisPillarStabilityState.startX;
    const resisted = Math.tanh(dragX / AXIS_STABILITY_DRAG_RESISTANCE);

    renderAxisStabilityForce(resisted);
  });

  pillar.addEventListener('pointerup', endPillarStabilityDrag);
  pillar.addEventListener('pointercancel', endPillarStabilityDrag);
  pillar.addEventListener('lostpointercapture', () => {
    if (axisPillarStabilityState.isDragging) {
      endPillarStabilityDrag();
    }
  });
}

function updateManualCutFromSample(sampleIndex) {
  const state = axisManualCutState;

  if (!state.cutReady || state.cutComplete) return;

  const allowedMaxIndex = state.maxReachedIndex + MAX_FORWARD_JUMP;

  if (sampleIndex > allowedMaxIndex) {
    updateNextTracePoint();
    return;
  }

  state.maxReachedIndex = Math.max(state.maxReachedIndex, sampleIndex);
  state.cutProgress = state.maxReachedIndex / TRACE_SAMPLE_COUNT;

  renderManualCutProgress();

  if (state.cutProgress >= getAxisManualCutCompleteProgress()) {
    completeManualCut();
  }
}

function getAxisManualCutCompleteProgress() {
  const pillar = document.querySelector('.axis-composite-pillar');
  const samples = axisManualCutState.traceSamples;

  if (!pillar || !samples.length) {
    return AXIS_CUT_COMPLETE_FALLBACK_PROGRESS;
  }

  const pillarRect = pillar.getBoundingClientRect();

  if (!pillarRect.width) {
    return AXIS_CUT_COMPLETE_FALLBACK_PROGRESS;
  }

  const relevantSamples = samples.filter((sample) => (
    sample.x >= pillarRect.left - 4 &&
    sample.x <= pillarRect.right + 4
  ));

  if (!relevantSamples.length) {
    return AXIS_CUT_COMPLETE_FALLBACK_PROGRESS;
  }

  const lastPillarProgress = Math.max(...relevantSamples.map((sample) => sample.progress));

  return Math.min(
    .96,
    Math.max(.84, lastPillarProgress + AXIS_CUT_COMPLETE_MARGIN)
  );
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
  state.settleTargetY = getAxisPillarSettleTargetY();

  axisStage?.classList.remove('is-cut-ready', 'is-user-cutting');
  axisStage?.classList.add('is-cut-complete');

  setAxisVar('--manual-cut-progress', '1');
  setAxisVar('--trace-pointer-events', 'none');
  setAxisVar('--snap-opacity', '0');
  setAxisVar('--next-opacity', '0');

  updatePillarClipByCutProgress(1);
  renderManualCutProgress();
  updateTraceStateLabel();
  requestAxisUpdate();
}

function getAxisPillarContactTargetY() {
  const axisStage = document.querySelector('.project-axis-stage');
  const pillar = document.querySelector('.axis-composite-pillar');
  const foundation = document.querySelector('.axis-foundation-stone');

  if (!axisStage || !pillar || !foundation) return 82;

  const stageRect = axisStage.getBoundingClientRect();
  const pillarRect = pillar.getBoundingClientRect();
  const foundationRect = foundation.getBoundingClientRect();

  if (!stageRect.height || !pillarRect.height || !foundationRect.height) {
    return 82;
  }

  const stageStyle = getComputedStyle(axisStage);
  const currentContactY = parseFloat(stageStyle.getPropertyValue('--pillar-contact-y')) || 0;
  const currentBounceY = parseFloat(stageStyle.getPropertyValue('--pillar-bounce-y')) || 0;
  const currentSettleY = parseFloat(stageStyle.getPropertyValue('--pillar-settle-y')) || 0;
  const pillarBottomWithoutMotion =
    pillarRect.bottom - currentContactY - currentBounceY - currentSettleY;
  const foundationTopY = foundationRect.top + foundationRect.height * 0.08;
  const contactInset = Math.min(8, pillarRect.height * 0.018);
  const targetY = foundationTopY - pillarBottomWithoutMotion + contactInset;
  const maxTargetY = Math.min(106, stageRect.height * 0.105);

  return Math.min(maxTargetY, Math.max(44, targetY));
}

function getAxisPillarSettleTargetY() {
  const axisStage = document.querySelector('.project-axis-stage');
  const pillar = document.querySelector('.axis-composite-pillar');
  const foundation = document.querySelector('.axis-foundation-stone');

  if (!axisStage || !pillar || !foundation) return 42;

  const stageRect = axisStage.getBoundingClientRect();
  const pillarRect = pillar.getBoundingClientRect();
  const foundationRect = foundation.getBoundingClientRect();

  if (!stageRect.height || !pillarRect.height || !foundationRect.height) {
    return 42;
  }

  const currentSettleY = parseFloat(
    getComputedStyle(axisStage).getPropertyValue('--pillar-settle-y')
  ) || 0;

  const foundationTopY = foundationRect.top + foundationRect.height * AXIS_PILLAR_SEAT_ANCHOR_RATIO;
  const pillarBottomWithoutSettle = pillarRect.bottom - currentSettleY;
  const cutSeatCompensation = Math.min(
    AXIS_PILLAR_CUT_SEAT_COMPENSATION,
    stageRect.height * 0.085
  );
  const geometricTarget = foundationTopY - pillarBottomWithoutSettle + cutSeatCompensation;
  const maxTarget = Math.min(240, stageRect.height * 0.23);

  if (geometricTarget > 1) {
    return Math.min(geometricTarget, maxTarget);
  }

  return Math.min(Math.max(0, -getAxisTraceOverlayY() + cutSeatCompensation), maxTarget);
}

function updateNextTracePoint() {
  const traceZone = document.querySelector('[data-axis-trace-zone]');
  const samples = axisManualCutState.traceSamples;

  if (!traceZone || !samples.length) return;

  if (axisManualCutState.cutComplete) {
    setAxisVar('--next-opacity', '0');
    return;
  }

  const completeIndex = Math.min(
    samples.length - 1,
    Math.ceil(getAxisManualCutCompleteProgress() * TRACE_SAMPLE_COUNT)
  );
  const nextIndex = Math.min(
    axisManualCutState.maxReachedIndex + 4,
    completeIndex
  );
  const next = samples[nextIndex];

  setAxisVar('--next-x', `${next.localX.toFixed(2)}px`);
  setAxisVar('--next-y', `${next.localY.toFixed(2)}px`);
  setAxisVar('--next-opacity', axisManualCutState.cutReady ? '1' : '0');
}

function updatePillarClipByCutProgress(progress) {
  const p = smooth(clamp01(progress));
  const pillar = document.querySelector('.axis-composite-pillar');
  const samples = axisManualCutState.traceSamples;

  if (!pillar || !samples.length) {
    setAxisVar('--pillar-fit-clip', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)');
    return;
  }

  const pillarRect = pillar.getBoundingClientRect();

  if (!pillarRect.width || !pillarRect.height) {
    return;
  }

  const visibleSamples = samples
    .map((sample) => {
      const x = ((sample.x - pillarRect.left) / pillarRect.width) * 100;
      const targetY = ((sample.y - pillarRect.top) / pillarRect.height) * 100;

      return {
        progress: sample.progress,
        x,
        y: Math.min(100, Math.max(76, targetY))
      };
    })
    .filter((sample) => sample.x >= 0 && sample.x <= 100)
    .sort((a, b) => a.x - b.x);

  if (!visibleSamples.length) {
    setAxisVar('--pillar-fit-clip', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)');
    return;
  }

  const cutPoints = [];
  const first = visibleSamples[0];
  const last = visibleSamples[visibleSamples.length - 1];

  if (first.x > 0.1) {
    cutPoints.push('0.00% 100.00%');
  }

  visibleSamples.forEach((sample) => {
    const reveal = smooth(range(p, sample.progress - 0.018, sample.progress + 0.004));
    const y = lerp(100, sample.y, reveal);
    cutPoints.push(`${sample.x.toFixed(2)}% ${y.toFixed(2)}%`);
  });

  if (last.x < 99.9) {
    cutPoints.push('100.00% 100.00%');
  }

  const clip = `polygon(0 0, 100% 0, ${cutPoints.reverse().join(', ')})`;

  setAxisVar('--pillar-fit-clip', clip);
}

function getAxisTraceOverlayY() {
  const axisStage = document.querySelector('.project-axis-stage');
  const traceZone = document.querySelector('[data-axis-trace-zone]');
  const pillar = document.querySelector('.axis-composite-pillar');

  if (!axisStage || !traceZone || !pillar) return -42;

  const currentOverlayY = parseFloat(
    getComputedStyle(axisStage).getPropertyValue('--trace-overlay-y')
  ) || 0;

  const traceRect = traceZone.getBoundingClientRect();
  const pillarRect = pillar.getBoundingClientRect();

  if (!traceRect.height || !pillarRect.height) return -42;

  const traceBaseTop = traceRect.top - currentOverlayY;
  const traceAnchorY =
    traceBaseTop +
    (AXIS_TRACE_BOTTOM_ANCHOR_Y / AXIS_TRACE_VIEWBOX_H) * traceRect.height;

  return pillarRect.bottom - 2 - traceAnchorY;
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

function completeAxisStabilityTest() {
  const axisStage = document.querySelector('.project-axis-stage');
  const fitLabelMain = document.querySelector('.fit-label-main');
  const fitLabelState = document.querySelector('.fit-label-state');

  axisManualCutState.stabilityComplete = true;
  axisManualCutState.stabilityWheelProgress = 1;
  axisStage?.classList.add('is-stability-complete');
  axisStage?.classList.remove('is-stability-dragging');

  if (fitLabelMain) fitLabelMain.textContent = 'CONTACT CHECK';
  if (fitLabelState) fitLabelState.textContent = 'FITTED';

  requestAxisUpdate();
}

function handleAxisCutWheelLock(event) {
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

    const needed = window.innerHeight * 0.72;
    axisManualCutState.contactHoldProgress = clamp01(
      axisManualCutState.contactHoldProgress + normalizedDeltaY / Math.max(needed, 1)
    );

    if (axisManualCutState.contactHoldProgress >= 1) {
      axisManualCutState.contactHoldComplete = true;
      axisManualCutState.contactHoldScrollY = null;
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

    const needed = window.innerHeight * 0.58;
    axisManualCutState.settleProgress = clamp01(
      axisManualCutState.settleProgress + normalizedDeltaY / Math.max(needed, 1)
    );

    requestAxisUpdate();
    return;
  }

  const shouldHoldForStability =
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
      normalizedDeltaY / Math.max(window.innerHeight * AXIS_STABILITY_WHEEL_RESISTANCE, 1)
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
  }
}

function shouldHoldAxisBeforeNextSection() {
  if (axisManualCutState.cutReady && !axisManualCutState.cutComplete) {
    return true;
  }

  if (!axisManualCutState.cutComplete) {
    return false;
  }

  return axisManualCutState.settleProgress < 1 ||
    !axisManualCutState.stabilityComplete;
}

function getAxisLockedMaxScrollY() {
  const axisSection = document.querySelector('.project-axis-section');
  if (!axisSection) return null;

  const rect = axisSection.getBoundingClientRect();
  const sectionTop = window.scrollY + rect.top;

  return sectionTop + axisSection.offsetHeight - window.innerHeight - 2;
}

function clampAxisScrollBeforeNext() {
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

function resetManualCutState() {
  const state = axisManualCutState;
  const cutPath = document.getElementById('foundationTraceCutDonePath');
  const axisStage = document.querySelector('.project-axis-stage');

  state.cutReady = false;
  state.cutComplete = false;
  state.isSnapped = false;
  state.maxReachedIndex = 0;
  state.cutProgress = 0;
  state.cutCompleteScrollY = null;
  state.settleProgress = 0;
  state.settleTargetY = 0;
  state.contactHoldProgress = 0;
  state.contactHoldComplete = false;
  state.contactHoldScrollY = null;
  state.stabilityWheelProgress = 0;
  state.stabilityComplete = false;

  if (cutPath && state.pathLength) {
    cutPath.style.strokeDashoffset = state.pathLength;
  }

  setAxisVar('--manual-cut-progress', '0');
  setAxisVar('--trace-cut-offset', state.pathLength.toFixed(2));
  setAxisVar('--trace-cut-opacity', '0');
  setAxisVar('--snap-opacity', '0');
  setAxisVar('--next-opacity', '0');
  setAxisVar('--pillar-settle-y', '0px');
  setAxisVar('--pillar-fit-clip', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)');

  axisStage?.classList.remove(
    'is-cut-ready',
    'is-user-cutting',
    'is-cut-complete',
    'is-fit-refused',
    'is-settled',
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

  const entryProgress = smooth(range(globalProgress, 0.00, 0.24));
  const holdProgress = smooth(range(globalProgress, 0.24, 0.36));
  const gatherProgress = smooth(range(globalProgress, 0.36, 0.54));
  const stackProgress = smooth(range(globalProgress, 0.50, 0.68));
  const pressProgress = smooth(range(globalProgress, 0.64, 0.80));
  const boardProgress = smooth(range(globalProgress, 0.74, 0.84));
  const pillarProgress = smooth(range(globalProgress, 0.78, 0.88));
  const rawFoundationProgress = smooth(range(globalProgress, 0.855, 0.885));
  const rawContactProgress = smooth(range(globalProgress, 0.880, 0.912));
  const rawMismatchProgress = smooth(range(globalProgress, 0.900, 0.948));
  const rawBounceProgress = smooth(range(globalProgress, 0.936, 0.962));
  const rawContourDrawProgress = smooth(range(globalProgress, 0.958, 0.978));
  const rawOverlayProgress = smooth(range(globalProgress, 0.974, 0.990));

  setAxisVar('--axis-handoff-opacity', '0');
  setAxisVar('--axis-handoff-y', '0px');
  setAxisVar('--axis-handoff-scale', '1');

  if (
    globalProgress < AXIS_CONTACT_HOLD_RESET_PROGRESS &&
    !axisManualCutState.cutComplete &&
    axisManualCutState.cutProgress === 0
  ) {
    axisManualCutState.contactHoldProgress = 0;
    axisManualCutState.contactHoldComplete = false;
    axisManualCutState.contactHoldScrollY = null;
  }

  const allCardsFullyVisible = globalProgress >= 0.32;
  const canGather = allCardsFullyVisible && globalProgress >= 0.36;
  const canStartAssembly = canGather;
  const safeGatherProgress = canGather ? gatherProgress : 0;
  const safeStackProgress = canGather ? stackProgress : 0;
  const safePressProgress = canGather ? pressProgress : 0;
  const safeBoardProgress = canGather ? boardProgress : 0;
  const safePillarProgress = canGather ? pillarProgress : 0;
  const standProgress = canGather ? smooth(range(globalProgress, .76, .86)) : 0;
  const pillarHandoffProgress = canGather ? smooth(range(globalProgress, .835, .865)) : 0;
  const pillarComplete = pillarHandoffProgress >= 0.98;
  const canShowFoundation = pillarComplete;
  const foundationProgress = canShowFoundation ? rawFoundationProgress : 0;
  const foundationVisible = foundationProgress >= 0.9;
  const canFirstContact = canShowFoundation && foundationVisible;
  const contactHoldProgress = canFirstContact
    ? (axisManualCutState.contactHoldComplete ? 1 : axisManualCutState.contactHoldProgress)
    : 0;
  const contactProgress = canFirstContact
    ? Math.max(rawContactProgress, smooth(range(contactHoldProgress, 0, .36)))
    : 0;
  const firstContactComplete = contactProgress >= 0.95;
  const mismatchProgress = canFirstContact
    ? Math.max(rawMismatchProgress, smooth(range(contactHoldProgress, .24, .72)))
    : 0;
  const bounceProgress = canFirstContact
    ? Math.max(rawBounceProgress, smooth(range(contactHoldProgress, .62, 1)))
    : 0;
  const bounceBackComplete = bounceProgress >= 0.95;
  const canDrawContour = canFirstContact && bounceBackComplete;
  const contourDrawProgress = canDrawContour ? rawContourDrawProgress : 0;
  const canTransferGuide = contourDrawProgress >= 0.995;
  const canShowDashedGuide = canTransferGuide;
  const overlayProgress = canTransferGuide ? rawOverlayProgress : 0;
  const dashedGuideOverlayComplete = canTransferGuide && overlayProgress >= 0.98;
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
  } else if (contactProgress > 0) {
    axisFitStage = AxisFitStage.FIRST_CONTACT;
  } else if (foundationProgress > 0) {
    axisFitStage = AxisFitStage.FOUNDATION_APPEAR;
  }

  axisStage.dataset.axisFitStage = axisFitStage;
  let hasClickableAxisCards = false;

  const start = [
    { x: stageW * 0.58, y: 0, z: -120, rx: 0, ry: -8, rz: -2 },
    { x: stageW * 0.92, y: 0, z: -180, rx: 0, ry: -10, rz: 1 },
    { x: stageW * 1.26, y: 0, z: -240, rx: 0, ry: -12, rz: 3 }
  ];
  const visible = [
    { x: -stageW * 0.26, y: 0, z: 0, rx: 0, ry: 0, rz: -1 },
    { x: 0, y: 0, z: 40, rx: 0, ry: 0, rz: 0 },
    { x: stageW * 0.26, y: 0, z: 0, rx: 0, ry: 0, rz: 1 }
  ];
  const stacked = [
    { x: -28, y: -18, z: 80, rx: 6, ry: -4, rz: -3 },
    { x: 0, y: 0, z: 120, rx: 4, ry: 0, rz: 0 },
    { x: 28, y: 18, z: 160, rx: 6, ry: 4, rz: 3 }
  ];
  const standing = [
    { x: 0, y: stageH * 0.045, z: 0, rx: 0, ry: 0, rz: -.35 },
    { x: 0, y: stageH * 0.045, z: 10, rx: 0, ry: 0, rz: 0 },
    { x: 0, y: stageH * 0.045, z: 20, rx: 0, ry: 0, rz: .35 }
  ];
  const baseClip = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100]
  ];
  const standingClips = [
    [[0, 0], [46, 0], [42, 100], [0, 100]],
    [[31, 0], [74, 0], [70, 100], [27, 100]],
    [[55, 0], [100, 0], [100, 100], [59, 100]]
  ];
  const standingImageOpacity = [.68, .36, .48];
  const morphClipPath = (points, progress) => {
    const clipProgress = smooth(range(progress, .04, .92));
    const coordinates = points.map(([x, y], pointIndex) => {
      const [fromX, fromY] = baseClip[pointIndex];
      return `${lerp(fromX, x, clipProgress).toFixed(2)}% ${lerp(fromY, y, clipProgress).toFixed(2)}%`;
    });
    return `polygon(${coordinates.join(', ')})`;
  };
  const baseStackCardW = stageW < 760
    ? Math.min(stageW * 0.94, 430)
    : Math.min(stageW * 0.52, 720);
  const baseStackCardH = stageW < 760
    ? Math.min(stageH * 0.40, 320)
    : Math.min(stageH * 0.42, 430);
  const pillarCardW = stageW < 760
    ? Math.min(stageW * 0.54, 300)
    : Math.min(Math.max(stageW * 0.18, 280), 420);
  const pillarCardH = Math.min(stageH * 0.50, 540);
  const pressedStackCardH = lerp(
    baseStackCardH,
    Math.max(baseStackCardH * .44, stageW < 760 ? 132 : 180),
    safePressProgress
  );
  const stackCardW = lerp(baseStackCardW, pillarCardW, standProgress);
  const stackCardH = lerp(pressedStackCardH, pillarCardH, standProgress);

  setAxisVar('--stack-card-w', `${stackCardW.toFixed(2)}px`);
  setAxisVar('--stack-card-h', `${stackCardH.toFixed(2)}px`);

  axisCards.forEach((card, index) => {
    const from = start[index];
    const mid = visible[index];
    const to = stacked[index];
    const standTo = standing[index];

    if (!from || !mid || !to || !standTo) return;

    let x = lerp(from.x, mid.x, entryProgress);
    let y = lerp(from.y, mid.y, entryProgress);
    let z = lerp(from.z, mid.z, entryProgress);
    let rx = lerp(from.rx, mid.rx, entryProgress);
    let ry = lerp(from.ry, mid.ry, entryProgress);
    let rz = lerp(from.rz, mid.rz, entryProgress);

    x = lerp(x, to.x, safeGatherProgress);
    y = lerp(y, to.y, safeGatherProgress);
    z = lerp(z, to.z, safeStackProgress);
    rx = lerp(rx, to.rx, safeStackProgress);
    ry = lerp(ry, to.ry, safeStackProgress);
    rz = lerp(rz, to.rz, safeStackProgress);

    x = lerp(x, standTo.x, standProgress);
    y = lerp(y, standTo.y, standProgress);
    z = lerp(z, standTo.z, standProgress);
    rx = lerp(rx, standTo.rx, standProgress);
    ry = lerp(ry, standTo.ry, standProgress);
    rz = lerp(rz, standTo.rz, standProgress);

    const compressedScale = 1;
    const opacity = 1 - pillarHandoffProgress;
    const cardCanClick = opacity > .18 && !canStartManualCut;
    const surfaceProgress = smooth(range(standProgress, .18, 1));

    if ('disabled' in card) {
      card.disabled = !cardCanClick;
    }
    hasClickableAxisCards = hasClickableAxisCards || cardCanClick;

    card.style.setProperty('--card-x', `${x.toFixed(2)}px`);
    card.style.setProperty('--card-y', `${y.toFixed(2)}px`);
    card.style.setProperty('--card-z', `${z.toFixed(2)}px`);
    card.style.setProperty('--card-rx', `${rx.toFixed(2)}deg`);
    card.style.setProperty('--card-ry', `${ry.toFixed(2)}deg`);
    card.style.setProperty('--card-rz', `${rz.toFixed(2)}deg`);
    card.style.setProperty('--card-scale', compressedScale.toFixed(3));
    card.style.setProperty('--card-opacity', opacity.toFixed(3));
    card.style.setProperty('--card-label-opacity', (1 - standProgress).toFixed(3));
    card.style.setProperty(
      '--card-image-opacity',
      lerp(1, standingImageOpacity[index] ?? .7, surfaceProgress).toFixed(3)
    );
    card.style.setProperty('--card-paper-glaze', lerp(0, .52, surfaceProgress).toFixed(3));
    card.style.setProperty('--card-image-saturate', lerp(.92, .62, surfaceProgress).toFixed(3));
    card.style.setProperty('--card-image-contrast', lerp(.96, .84, surfaceProgress).toFixed(3));
    card.style.setProperty('--card-image-brightness', lerp(.94, 1.04, surfaceProgress).toFixed(3));
    card.style.setProperty('--card-image-blur', `${lerp(0, .18, surfaceProgress).toFixed(2)}px`);
    card.style.setProperty('--card-image-scale', lerp(1, 1.025, surfaceProgress).toFixed(3));
    card.style.clipPath = morphClipPath(standingClips[index], standProgress);
    card.style.zIndex = String(10 + index);
  });

  axisStage.classList.toggle('has-clickable-axis-cards', hasClickableAxisCards);

  const sceneRx = lerp(lerp(0, 6, safeStackProgress), 0, standProgress);
  const sceneRy = lerp(lerp(0, -4, safeStackProgress), 0, standProgress);

  setAxisVar('--stack-scene-rotate-x', `${sceneRx.toFixed(2)}deg`);
  setAxisVar('--stack-scene-rotate-y', `${sceneRy.toFixed(2)}deg`);
  const pressFrameOpacity =
    smooth(range(globalProgress, .48, .64)) *
    (1 - smooth(range(globalProgress, .82, .94)));
  setAxisVar('--press-frame-opacity', pressFrameOpacity.toFixed(3));
  setAxisVar('--press-top-y', `${lerp(0, 92, safePressProgress).toFixed(2)}px`);
  setAxisVar('--press-bottom-y', `${lerp(0, 92, safePressProgress).toFixed(2)}px`);
  setAxisVar('--board-opacity', '0');
  setAxisVar('--board-scale', lerp(.96, 1, safeBoardProgress).toFixed(3));
  setAxisVar('--board-h', `${lerp(20, 8, safePressProgress).toFixed(2)}vh`);
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
  setAxisVar('--pillar-opacity', pillarHandoffProgress.toFixed(3));
  setAxisVar('--pillar-scale', lerp(.985, 1, safePillarProgress).toFixed(3));
  setAxisVar('--pillar-w', pillarW);
  setAxisVar('--pillar-h', pillarH);
  setAxisVar('--foundation-opacity', foundationProgress.toFixed(3));
  setAxisVar('--foundation-y', `${lerp(34, 0, foundationProgress).toFixed(2)}px`);

  const contactTargetY = getAxisPillarContactTargetY();
  const contactEase = 1 - Math.pow(1 - contactProgress, 2.8);
  const contactImpactPulse =
    smooth(range(contactProgress, .44, .78)) *
    (1 - smooth(range(contactProgress, .86, 1)));
  const contactPressure =
    smooth(range(contactProgress, .62, 1)) *
    (1 - smooth(range(contourDrawProgress, .04, .52)));
  const impactVisibility = Math.max(contactImpactPulse, contactPressure * .72) *
    (1 - smooth(range(bounceProgress, .35, 1)) * .34);
  const wobbleProgress = smooth(range(contactProgress, .62, 1)) *
    (1 - smooth(range(bounceProgress, .28, 1))) *
    (1 - smooth(range(contourDrawProgress, .02, .28)));
  const wobbleDamping = Math.pow(1 - wobbleProgress, .82);
  const contactWobble =
    Math.sin(wobbleProgress * Math.PI * 3.15) *
    wobbleDamping *
    2.6;
  const contactY = lerp(0, contactTargetY, contactEase) + contactImpactPulse * 8;
  const bounceY = lerp(0, -42, bounceProgress);
  setAxisVar('--pillar-contact-y', `${contactY.toFixed(2)}px`);
  setAxisVar('--pillar-bounce-y', `${bounceY.toFixed(2)}px`);
  setAxisVar('--pillar-contact-wobble-rot', `${contactWobble.toFixed(2)}deg`);
  setAxisVar('--pillar-contact-wobble-x', `${(contactWobble * -1.8).toFixed(2)}px`);
  setAxisVar('--impact-opacity', impactVisibility.toFixed(3));
  setAxisVar('--impact-scale', lerp(.72, 1.18, impactVisibility).toFixed(3));
  setAxisVar('--impact-spread', `${lerp(18, 48, impactVisibility).toFixed(2)}px`);

  const mismatchVisibility = axisManualCutState.cutComplete
    ? 0
    : mismatchProgress * (1 - contourDrawProgress * .35);
  const fitLabelVisibility = axisManualCutState.cutComplete
    ? 1
    : Math.max(mismatchVisibility, smooth(range(contactProgress, .18, .78)) * .88);
  const contactDotVisibility = axisManualCutState.cutComplete
    ? 0
    : Math.max(
      smooth(range(contactProgress, .46, 1)) * (1 - contourDrawProgress * .45),
      impactVisibility
    );

  setAxisVar('--fit-gap-opacity', Math.max(mismatchVisibility, impactVisibility).toFixed(3));
  setAxisVar('--fit-label-opacity', fitLabelVisibility.toFixed(3));
  setAxisVar('--contact-dot-opacity', contactDotVisibility.toFixed(3));

  const fitLabelMain = document.querySelector('.fit-label-main');
  if (fitLabelMain && !axisManualCutState.cutComplete && contactProgress > .2 && mismatchProgress < .5) {
    fitLabelMain.textContent = 'FIRST CONTACT';
  } else if (fitLabelMain && !axisManualCutState.cutComplete) {
    fitLabelMain.textContent = 'CONTACT CHECK';
  }

  const fitLabelState = document.querySelector('.fit-label-state');
  if (fitLabelState) {
    if (axisManualCutState.cutComplete) {
      fitLabelState.textContent = 'FITTED';
    } else if (mismatchProgress > .5) {
      fitLabelState.textContent = 'NOT FITTED';
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

  const traceOpacity = Math.max(contourDrawProgress, overlayProgress);
  const dashedOpacity = axisManualCutState.traceDrawComplete
    ? overlayProgress
    : 0;

  setAxisVar('--trace-opacity', traceOpacity.toFixed(3));
  setAxisVar('--trace-draw-opacity', (1 - dashedOpacity).toFixed(3));
  setAxisVar('--trace-dashed-opacity', dashedOpacity.toFixed(3));
  const traceOverlayY = lerp(0, getAxisTraceOverlayY(), overlayProgress);
  setAxisVar('--trace-overlay-y', `${traceOverlayY.toFixed(2)}px`);

  const traceLabelMain = document.querySelector('.trace-label-main');
  if (traceLabelMain) {
    if (canStartManualCut || axisManualCutState.cutReady) {
      traceLabelMain.textContent = 'TRACE TO CUT';
    } else if (canTransferGuide) {
      traceLabelMain.textContent = 'TRANSFER GUIDE';
    } else if (canDrawContour) {
      traceLabelMain.textContent = 'READ CONTOUR';
    } else {
      traceLabelMain.textContent = 'TRACE TO CUT';
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
    setAxisVar('--snap-opacity', '0');
    setAxisVar('--next-opacity', '0');
  }

  const canSettle = axisManualCutState.cutComplete === true;
  const settleProgress = canSettle ? getPostCutSettleProgress() : 0;
  const settleTargetY = axisManualCutState.settleTargetY || 0;
  const settleEase = smooth(settleProgress);
  const settleBounce = settleProgress > .72 && settleProgress < 1
    ? Math.sin(range(settleProgress, .72, 1) * Math.PI) * 4
    : 0;
  const settleY = lerp(0, settleTargetY, settleEase) + settleBounce;
  setAxisVar('--pillar-settle-y', `${settleY.toFixed(2)}px`);

  axisStage.classList.toggle('is-settled', settleProgress >= 1);

  const finalProgress = axisManualCutState.cutComplete && axisManualCutState.stabilityComplete
    ? smooth(range(settleProgress, 0.4, 1))
    : 0;
  setAxisVar('--final-opacity', finalProgress.toFixed(3));
  setAxisVar('--stability-hint-opacity', (settleProgress >= 1 ? 1 : 0).toFixed(3));

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
  if (!axisLabelC) return;

  const {
    canStartAssembly,
    pillarComplete,
    canShowFoundation,
    foundationVisible,
    firstContactComplete,
    bounceBackComplete,
    canDrawContour,
    canShowDashedGuide,
    dashedGuideOverlayComplete,
    canStartManualCut
  } = gates;

  let label = 'GROUP MOVE';
  let activeAxisStep = 'stack';

  if (globalProgress < 0.46) {
    label = 'GROUP MOVE';
  } else if (globalProgress < 0.58) {
    label = 'ALL CARDS VISIBLE HOLD';
  } else if (!canStartAssembly) {
    label = 'WAITING FOR RIGHT CARD';
  } else if (globalProgress < 0.70) {
    label = globalProgress < 0.66 ? 'GATHER' : 'STACK';
  } else if (globalProgress < 0.735) {
    label = 'MERGE TO PILLAR';
    activeAxisStep = 'press';
  } else if (!pillarComplete) {
    label = 'RAISE INTO PILLAR';
    activeAxisStep = 'press';
  } else if (canShowFoundation && !foundationVisible) {
    label = 'FOUNDATION APPEAR';
    activeAxisStep = 'fit';
  } else if (!firstContactComplete) {
    label = 'FIRST CONTACT';
    activeAxisStep = 'fit';
  } else if (!bounceBackComplete) {
    label = 'MISMATCH CHECK / NOT FITTED';
    activeAxisStep = 'fit';
  } else if (canDrawContour && !canShowDashedGuide) {
    label = 'READ FOUNDATION CONTOUR';
    activeAxisStep = 'fit';
  } else if (canShowDashedGuide && !dashedGuideOverlayComplete) {
    label = 'TRANSFER GUIDE TO PILLAR';
    activeAxisStep = 'fit';
  } else if (canStartManualCut && !axisManualCutState.cutComplete) {
    label = axisManualCutState.isSnapped ? 'USER MANUAL CUT / SNAP ON' : 'FOLLOW THE DOTTED LINE';
    activeAxisStep = 'cut';
  } else if (axisManualCutState.cutReady && !axisManualCutState.cutComplete) {
    label = 'USER MANUAL CUT';
    activeAxisStep = 'cut';
  } else if (axisManualCutState.cutComplete && settleProgress < 1) {
    label = 'CUT COMPLETE / SCROLL TO SETTLE';
    activeAxisStep = 'settle';
  } else if (settleProgress >= 1 && !axisManualCutState.stabilityComplete) {
    label = 'WHEEL OR DRAG TO TEST FIT';
    activeAxisStep = 'settle';
  } else if (settleProgress >= 1) {
    label = 'FINAL / READ REFINE CONNECT';
    activeAxisStep = 'settle';
  }

  axisLabelC.textContent = label;
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
  requestAxisUpdate();
});
window.addEventListener('load', () => {
  measureFoundationTrace();
  requestAxisUpdate();
});

