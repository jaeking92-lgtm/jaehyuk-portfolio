const progress = document.querySelector('.progress');
const revealEls = document.querySelectorAll('.reveal');
const introScreen = document.getElementById('introScreen');
const header = document.querySelector('[data-nav]');

document.body.classList.add('intro-active');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const introStorageKey = 'cinematicAtelierIntroPlayed';
const hasSeenIntro = (() => {
  try {
    return sessionStorage.getItem(introStorageKey) === 'true';
  } catch (error) {
    return false;
  }
})();

function closeIntro(immediate = false) {
  if (!introScreen) {
    document.body.classList.remove('intro-active');
    return;
  }
  if (immediate) {
    introScreen.style.display = 'none';
  } else {
    introScreen.classList.add('is-hidden');
    setTimeout(() => { introScreen.style.display = 'none'; }, 900);
  }
  document.body.classList.remove('intro-active');
  try {
    sessionStorage.setItem(introStorageKey, 'true');
  } catch (error) {}
}
if (reduceMotion || hasSeenIntro) closeIntro(true);
else setTimeout(() => closeIntro(false), 820);

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
    const profile = document.querySelector('#profile');
    profile?.scrollIntoView({behavior:'smooth', block:'start'});
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
  setupAtelierOpeningStamp();
  setupHeroTypographyReveal();
  setupWorkbenchSpotlightCursor();
  setupHeroProjectPreview();
  setupHeroScrollGuide();
}

function setupAtelierOpeningStamp() {
  const opening = document.querySelector('.atelier-opening');

  if (!opening) {
    document.body.classList.add('hero-intro-done');
    return;
  }

  if (reduceMotion) {
    document.body.classList.add('hero-intro-done');
    opening.remove();
    return;
  }

  window.setTimeout(() => {
    document.body.classList.add('hero-intro-done');
  }, 950);

  window.setTimeout(() => {
    opening.remove();
  }, 1500);
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

  letters.forEach((letter, index) => {
    letter.style.transitionDelay = `${index * 42}ms`;
  });

  title.addEventListener('mousemove', (event) => {
    const rect = title.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    title.classList.add('is-magnetic');

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
      const rect = trigger.getBoundingClientRect();

      if (previewTitle) previewTitle.textContent = title;

      preview.classList.add('is-active');
      preview.style.setProperty('--preview-x', `${rect.left + rect.width / 2}px`);
      preview.style.setProperty('--preview-y', `${rect.top}px`);
    });

    trigger.addEventListener('blur', () => {
      preview.classList.remove('is-active');
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
    const nextSection =
      document.querySelector('#profile') ||
      document.querySelector('.profile') ||
      document.querySelector('[data-section-index="A-01"]');

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
  const previewImg = preview?.querySelector('img');
  const previewTitle = preview?.querySelector('span');
  const cards = document.querySelectorAll('.works-hanging-card[data-preview-title]');
  const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!preview || !cards.length || isTouchLike || reduceMotion) return;

  if (previewImg) {
    previewImg.removeAttribute('src');
  }

  const movePreview = (event) => {
    preview.style.setProperty('--works-preview-x', `${event.clientX}px`);
    preview.style.setProperty('--works-preview-y', `${event.clientY}px`);
  };

  const showPreview = (card, event) => {
    if (previewTitle) {
      previewTitle.textContent = card.dataset.previewTitle || card.textContent.trim();
    }

    if (previewImg) {
      const image = card.dataset.previewImage || '';

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

    if (event) {
      movePreview(event);
    } else {
      const rect = card.getBoundingClientRect();
      preview.style.setProperty('--works-preview-x', `${rect.left + rect.width / 2}px`);
      preview.style.setProperty('--works-preview-y', `${rect.top}px`);
    }
  };

  const hidePreview = () => {
    preview.classList.remove('is-active');
  };

  cards.forEach((card) => {
    card.addEventListener('mouseenter', (event) => showPreview(card, event));
    card.addEventListener('mousemove', movePreview);
    card.addEventListener('mouseleave', hidePreview);
    card.addEventListener('focus', () => showPreview(card));
    card.addEventListener('blur', hidePreview);
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

function initProfilePaperResponse() {
  const profile = document.querySelector('.profile');
  const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!profile || isTouchLike || reduceMotion) return;

  const updatePaper = (event) => {
    const rect = profile.getBoundingClientRect();
    const x = clamp01((event.clientX - rect.left) / Math.max(rect.width, 1));
    const y = clamp01((event.clientY - rect.top) / Math.max(rect.height, 1));
    const tiltX = (x - 0.5) * 3.2;
    const tiltY = (0.5 - y) * 2.6;

    profile.classList.add('is-paper-probing');
    profile.style.setProperty('--profile-paper-x', `${(x * 100).toFixed(2)}%`);
    profile.style.setProperty('--profile-paper-y', `${(y * 100).toFixed(2)}%`);
    profile.style.setProperty('--profile-tilt-x', `${tiltX.toFixed(2)}deg`);
    profile.style.setProperty('--profile-tilt-y', `${tiltY.toFixed(2)}deg`);
    profile.style.setProperty('--profile-soft-tilt-x', `${(tiltX * 0.45).toFixed(2)}deg`);
    profile.style.setProperty('--profile-soft-tilt-y', `${(tiltY * 0.45).toFixed(2)}deg`);
    profile.style.setProperty('--profile-shadow-x', `${(tiltX * -4).toFixed(2)}px`);
    profile.style.setProperty('--profile-shadow-y', `${(Math.abs(tiltY) * 4 + 18).toFixed(2)}px`);
    profile.style.setProperty('--profile-copy-x', `${(tiltX * 0.48).toFixed(2)}px`);
    profile.style.setProperty('--profile-copy-y', `${(tiltY * -0.42).toFixed(2)}px`);
  };

  const resetPaper = () => {
    profile.classList.remove('is-paper-probing');
    profile.style.setProperty('--profile-tilt-x', '0deg');
    profile.style.setProperty('--profile-tilt-y', '0deg');
    profile.style.setProperty('--profile-soft-tilt-x', '0deg');
    profile.style.setProperty('--profile-soft-tilt-y', '0deg');
    profile.style.setProperty('--profile-shadow-x', '0px');
    profile.style.setProperty('--profile-shadow-y', '18px');
    profile.style.setProperty('--profile-copy-x', '0px');
    profile.style.setProperty('--profile-copy-y', '0px');
  };

  profile.addEventListener('pointermove', updatePaper);
  profile.addEventListener('pointerleave', resetPaper);
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
  const revealSections = document.querySelectorAll('.section-reveal:not(.hero):not(.project-axis-section), .profile, .tools-photo-section, .works-display');
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
  const titleTargets = document.querySelectorAll('.hero-title, .profile h2, .tools-board-title, .works-copy h2');
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
initWorksPreviewCursor();
initToolsPegboardInteraction();
initSectionStageIndicator();
initProfileLayoutFormation();
initProfilePaperResponse();

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
    'tool-pin-ps',
    'tool-pin-ai',
    'tool-pin-figma',
    'tool-pin-vscode',
    'tool-pin-aitools',
    'tool-pin-autocad',
    'tool-pin-react'
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

const projectDetails = {
  kia: {
    no: 'Project 01',
    title: 'KIA Website',
    type: 'Web Design · UI/UX · Brand Experience',
    image: 'assets/kia-hero.webp',
    alt: 'KIA website project visual',
    goal: '기아의 브랜드 메시지와 차량 정보를 명확한 웹 경험으로 재구성한 UI 디자인입니다.',
    role: 'UI Design / Web Layout / Visual Direction',
    output: 'Main Page / Detail Section / Responsive Layout'
  },
  gunit: {
    no: 'Project 02',
    title: 'GUNIT App',
    type: 'App Design · UX Flow · Service Concept',
    image: 'assets/work-03-placeholder.svg',
    alt: 'GUNIT app project visual',
    goal: '에어소프트 팀 매칭과 커뮤니티 활동을 연결하는 앱 서비스 UX를 설계했습니다.',
    role: 'UX Structure / App UI / Screen Flow',
    output: 'Home / Profile / Community / Event Screens'
  },
  character: {
    no: 'Project 03',
    title: 'Character Design',
    type: 'Character · Visual System · Brand Mood',
    image: 'assets/work-03-placeholder.svg',
    alt: 'Character design project visual',
    goal: 'Milo & Pippa 캐릭터의 성격과 브랜드 무드를 시각 시스템으로 정리했습니다.',
    role: 'Concept / Character Style / Application',
    output: 'Main Character / Expression / Color Variation'
  },
  modeling: {
    no: 'Project 04',
    title: '3D Modeling',
    type: '3D Modeling · Material · Rendering',
    image: 'assets/modeling-hero.webp',
    alt: '3D modeling project visual',
    goal: '목재 의자의 형태, 재질, 조명을 정리해 현실감 있는 3D 렌더링으로 완성했습니다.',
    role: 'Modeling / Material Setup / Lighting',
    output: 'Object Modeling / Detail Rendering / Final Image'
  }
};

const projectModal = document.getElementById('projectModal');
const projectModalImage = document.getElementById('projectModalImage');
const projectModalNo = document.getElementById('projectModalNo');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectModalType = document.getElementById('projectModalType');
const projectModalGoal = document.getElementById('projectModalGoal');
const projectModalRole = document.getElementById('projectModalRole');
const projectModalOutput = document.getElementById('projectModalOutput');
const projectOpenButtons = document.querySelectorAll('.project-open');
let pinnedWorksCard = null;

function openProjectModal(projectKey) {
  const data = projectDetails[projectKey];
  if (!data || !projectModal || !projectModalImage) return;

  projectModalImage.src = data.image;
  projectModalImage.alt = data.alt;
  if (projectModalNo) projectModalNo.textContent = data.no;
  if (projectModalTitle) projectModalTitle.textContent = data.title;
  if (projectModalType) projectModalType.textContent = data.type;
  if (projectModalGoal) projectModalGoal.textContent = data.goal;
  if (projectModalRole) projectModalRole.textContent = data.role;
  if (projectModalOutput) projectModalOutput.textContent = data.output;

  projectModal.classList.add('is-open');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  if (!projectModal) return;

  projectModal.classList.remove('is-open');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  pinnedWorksCard?.classList.remove('is-pinned');
  pinnedWorksCard = null;
}

projectOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    pinnedWorksCard?.classList.remove('is-pinned');
    pinnedWorksCard = button;
    button.classList.add('is-pressing');
    button.classList.add('is-pinned');

    window.setTimeout(() => {
      button.classList.remove('is-pressing');
      openProjectModal(button.dataset.project);
    }, 130);
  });
});

document.querySelectorAll('[data-modal-close]').forEach((button) => {
  button.addEventListener('click', closeProjectModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && projectModal?.classList.contains('is-open')) {
    closeProjectModal();
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

initWorksInspector();


/* A-02 Project Axis: card stack assembly and manual foundation fitting. */
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
const AXIS_CONTACT_HOLD_START_PROGRESS = 0.92;
const AXIS_CONTACT_HOLD_RESET_PROGRESS = 0.89;
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
  document.querySelectorAll('.axis-card img').forEach((img) => {
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
  const axisCards = document.querySelectorAll('.axis-card');

  if (!axisSection || !axisStage || !axisCards.length) return;

  const rect = axisSection.getBoundingClientRect();
  const scrollable = axisSection.offsetHeight - window.innerHeight;
  const globalProgress = clamp01((-rect.top) / Math.max(scrollable, 1));
  const worksHandoffProgress = smooth(range(globalProgress, 0.02, 0.18));
  const worksHandoffFade = 1 - smooth(range(globalProgress, 0.22, 0.40));

  const stageRect = axisStage.getBoundingClientRect();
  const stageW = stageRect.width;
  const stageH = stageRect.height;

  const moveProgress = smooth(range(globalProgress, 0.00, 0.34));
  const alignProgress = smooth(range(globalProgress, 0.28, 0.46));
  const gatherProgress = smooth(range(globalProgress, 0.58, 0.66));
  const stackProgress = smooth(range(globalProgress, 0.64, 0.74));
  const pressProgress = smooth(range(globalProgress, 0.70, 0.735));
  const pillarProgress = smooth(range(globalProgress, 0.705, 0.79));
  const rawFoundationProgress = smooth(range(globalProgress, 0.88, 0.92));
  const rawContactProgress = smooth(range(globalProgress, 0.91, 0.945));
  const rawMismatchProgress = smooth(range(globalProgress, 0.935, 0.965));
  const rawBounceProgress = smooth(range(globalProgress, 0.945, 0.970));
  const rawContourDrawProgress = smooth(range(globalProgress, 0.965, 0.982));
  const rawOverlayProgress = smooth(range(globalProgress, 0.978, 0.992));

  setAxisVar('--axis-handoff-progress', worksHandoffProgress.toFixed(3));
  setAxisVar('--axis-handoff-opacity', (worksHandoffProgress * worksHandoffFade).toFixed(3));
  setAxisVar('--axis-handoff-y', `${lerp(48, -10, worksHandoffProgress).toFixed(2)}px`);
  setAxisVar('--axis-handoff-scale', lerp(.94, 1, worksHandoffProgress).toFixed(3));

  if (
    globalProgress < AXIS_CONTACT_HOLD_RESET_PROGRESS &&
    !axisManualCutState.cutComplete &&
    axisManualCutState.cutProgress === 0
  ) {
    axisManualCutState.contactHoldProgress = 0;
    axisManualCutState.contactHoldComplete = false;
    axisManualCutState.contactHoldScrollY = null;
  }

  const sideMargin = Math.max(36, stageW * 0.04);
  const cardGap = Math.min(Math.max(stageW * 0.022, 22), 40);
  const availableW = stageW - sideMargin * 2;
  const fitCardW = (availableW - cardGap * 2) / 3;
  const desiredCardW = stageW < 760
    ? stageW * 0.72
    : stageW * 0.35;
  const minCardW = stageW < 760
    ? Math.min(280, fitCardW)
    : Math.min(360, fitCardW);
  const cardW = Math.max(
    minCardW,
    Math.min(desiredCardW, fitCardW)
  );
  const cardH = Math.min(
    stageH * (stageW < 760 ? 0.38 : 0.42),
    cardW * 0.62
  );
  const totalCardsW = cardW * 3 + cardGap * 2;
  const startGroupLeft = stageW * 0.42;
  const alignedGroupLeft = (stageW - totalCardsW) / 2;
  const movingGroupLeft = lerp(startGroupLeft, alignedGroupLeft, moveProgress);
  const groupLeft = lerp(movingGroupLeft, alignedGroupLeft, alignProgress);
  const visibleCenters = [
    groupLeft + cardW / 2,
    groupLeft + cardW + cardGap + cardW / 2,
    groupLeft + cardW * 2 + cardGap * 2 + cardW / 2
  ];
  const firstCardLeft = visibleCenters[0] - cardW / 2;
  const thirdCardRight = visibleCenters[2] + cardW / 2;
  const fullyVisibleTolerance = 1;
  const allCardsFullyVisible =
    firstCardLeft >= sideMargin * 0.25 - fullyVisibleTolerance &&
    thirdCardRight <= stageW - sideMargin * 0.25 + fullyVisibleTolerance;
  const hasHoldCompleted = globalProgress >= 0.58;
  const canStartAssembly = allCardsFullyVisible && hasHoldCompleted;
  const safeGatherProgress = canStartAssembly ? gatherProgress : 0;
  const safeStackProgress = canStartAssembly ? stackProgress : 0;
  const safePressProgress = canStartAssembly ? pressProgress : 0;
  const safePillarProgress = canStartAssembly ? pillarProgress : 0;
  const pillarComplete = safePillarProgress >= 0.98;
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
  const gatheredCenters = [
    stageW * 0.50 - cardW * 0.18,
    stageW * 0.50,
    stageW * 0.50 + cardW * 0.18
  ];

  axisCards.forEach((card, index) => {
    const visibleX = visibleCenters[index];
    const gatherX = lerp(visibleX, gatheredCenters[index], safeGatherProgress);
    const stackOffsets = [-20, 0, 20];
    const stackX = lerp(gatherX, stageW * 0.50 + stackOffsets[index], safeStackProgress);
    const stackY = lerp(stageH * 0.38, stageH * 0.43 + index * 8, safeStackProgress);
    const cardOpacity = 1 - smooth(range(Math.max(safeStackProgress, safePressProgress), 0.42, 0.72));

    card.style.setProperty('--card-left', `${stackX.toFixed(2)}px`);
    card.style.setProperty('--card-top', `${stackY.toFixed(2)}px`);
    card.style.setProperty('--card-w', `${cardW.toFixed(2)}px`);
    card.style.setProperty('--card-h', `${cardH.toFixed(2)}px`);
    card.style.setProperty('--card-opacity', cardOpacity.toFixed(3));
    card.style.setProperty('--card-label-opacity', cardOpacity.toFixed(3));
    card.style.setProperty('--card-rot', '0deg');
  });

  const stackCollapseProgress = smooth(range(safePressProgress, 0.02, 0.52));
  const stackFade = 1 - smooth(range(globalProgress, 0.695, 0.72));
  const stackSpread = 1 - stackCollapseProgress;
  const stackBaseScale = lerp(.96, 1, safeStackProgress);
  const stackOpacity = safeStackProgress * stackFade;
  const stackY = lerp(24, 0, safeStackProgress) + lerp(0, stageH * 0.07, stackCollapseProgress);

  setAxisVar('--stack-opacity', stackOpacity.toFixed(3));
  setAxisVar('--stack-scale', stackBaseScale.toFixed(3));
  setAxisVar('--stack-scale-x', lerp(1, .94, stackCollapseProgress).toFixed(3));
  setAxisVar('--stack-scale-y', lerp(1, .92, stackCollapseProgress).toFixed(3));
  setAxisVar('--stack-y', `${stackY.toFixed(2)}px`);
  setAxisVar('--stack-kia-x', `${(-18 * stackSpread).toFixed(2)}px`);
  setAxisVar('--stack-kia-y', `${(-16 * stackSpread).toFixed(2)}px`);
  setAxisVar('--stack-kia-rot', `${(-2 * stackSpread).toFixed(2)}deg`);
  setAxisVar('--stack-gunit-x', '0px');
  setAxisVar('--stack-gunit-y', '0px');
  setAxisVar('--stack-gunit-rot', `${(.6 * stackSpread).toFixed(2)}deg`);
  setAxisVar('--stack-character-x', `${(18 * stackSpread).toFixed(2)}px`);
  setAxisVar('--stack-character-y', `${(16 * stackSpread).toFixed(2)}px`);
  setAxisVar('--stack-character-rot', `${(2 * stackSpread).toFixed(2)}deg`);

  const slabStartW = Math.min(Math.max(stageW * 0.24, 300), 430);
  const slabStartH = Math.min(stageH * 0.48, 460);
  const pillarFinalW = Math.min(Math.max(stageW * 0.14, 230), 380);
  const pillarFinalH = stageH * 0.54;
  const standProgress = safePillarProgress;
  const slabToPillarW = lerp(slabStartW, pillarFinalW, standProgress);
  const slabToPillarH = lerp(slabStartH, pillarFinalH, standProgress);
  const slabPressScaleX = 1;
  const slabPressScaleY = 1;
  const pillarReveal = smooth(range(standProgress, .02, .42));
  const layerSlotProgress = smooth(range(safePressProgress, .08, .82));
  const layerSideOffset = Math.min(slabStartW * .34, 138);

  setAxisVar('--slab-w', `${slabToPillarW.toFixed(2)}px`);
  setAxisVar('--slab-h', `${slabToPillarH.toFixed(2)}px`);
  setAxisVar('--slab-y', `${lerp(0, -stageH * 0.02, standProgress).toFixed(2)}px`);
  setAxisVar('--slab-opacity', '0');
  setAxisVar('--slab-scale-x', lerp(slabPressScaleX, 1, standProgress).toFixed(3));
  setAxisVar('--slab-scale-y', lerp(slabPressScaleY, 1, standProgress).toFixed(3));
  setAxisVar('--slab-label-opacity', (1 - smooth(range(standProgress, .12, .45))).toFixed(3));
  setAxisVar('--slab-layer-scale-y', lerp(.94, 1, layerSlotProgress).toFixed(3));
  setAxisVar('--slab-layer-gap', `${lerp(26, 0, layerSlotProgress).toFixed(2)}px`);
  setAxisVar('--slab-layer-depth', `${lerp(34, 0, layerSlotProgress).toFixed(2)}px`);
  setAxisVar('--slab-kia-x', `${lerp(-layerSideOffset, 0, layerSlotProgress).toFixed(2)}px`);
  setAxisVar('--slab-kia-y', `${lerp(26, 0, layerSlotProgress).toFixed(2)}px`);
  setAxisVar('--slab-kia-rot', `${lerp(-7.5, 0, layerSlotProgress).toFixed(2)}deg`);
  setAxisVar('--slab-kia-tilt', `${lerp(11, 0, layerSlotProgress).toFixed(2)}deg`);
  setAxisVar('--slab-gunit-x', '0px');
  setAxisVar('--slab-gunit-y', `${lerp(-16, 0, layerSlotProgress).toFixed(2)}px`);
  setAxisVar('--slab-gunit-rot', `${lerp(.9, 0, layerSlotProgress).toFixed(2)}deg`);
  setAxisVar('--slab-character-x', `${lerp(layerSideOffset, 0, layerSlotProgress).toFixed(2)}px`);
  setAxisVar('--slab-character-y', `${lerp(26, 0, layerSlotProgress).toFixed(2)}px`);
  setAxisVar('--slab-character-rot', `${lerp(7.5, 0, layerSlotProgress).toFixed(2)}deg`);
  setAxisVar('--slab-character-tilt', `${lerp(-11, 0, layerSlotProgress).toFixed(2)}deg`);

  setAxisVar('--pillar-opacity', pillarReveal.toFixed(3));
  setAxisVar('--pillar-scale', lerp(.985, 1, pillarReveal).toFixed(3));
  setAxisVar('--pillar-w', `${slabToPillarW.toFixed(2)}px`);
  setAxisVar('--pillar-h', `${slabToPillarH.toFixed(2)}px`);
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

  if (globalProgress < 0.86 && axisManualCutState.cutProgress > 0) {
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
