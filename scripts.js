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
else setTimeout(() => closeIntro(false), 2450);

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

function initSectionReveal() {
  const revealSections = document.querySelectorAll('.profile, .tools-photo-section, .works-display');
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
initSectionReveal();
initTitleReveal();

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
    image: 'assets/gunit-hero.webp',
    alt: 'GUNIT app project visual',
    goal: '에어소프트 팀 매칭과 커뮤니티 활동을 연결하는 앱 서비스 UX를 설계했습니다.',
    role: 'UX Structure / App UI / Screen Flow',
    output: 'Home / Profile / Community / Event Screens'
  },
  character: {
    no: 'Project 03',
    title: 'Character Design',
    type: 'Character · Visual System · Brand Mood',
    image: 'assets/character-hero.webp',
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
}

projectOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.add('is-pressing');
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


/* Measured Portfolio: project images cut, flow, and fuse into one composite image. */
const axisSection = document.querySelector('.project-axis-section');
const axisStage = document.querySelector('.project-axis-stage');
const axisCards = [...document.querySelectorAll('.axis-card')];
const axisGuidePath = document.getElementById('axisGuidePath');
const axisDonePath = document.getElementById('axisDonePath');
const axisCutSvg = document.querySelector('.axis-cut-svg');

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}
function smooth(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function range(value, start, end) {
  return clamp01((value - start) / (end - start));
}
function setAxisVar(name, value) {
  axisSection?.style.setProperty(name, value);
}
function setCardBox(card, box) {
  card.style.setProperty('--card-left', `${box.x.toFixed(2)}px`);
  card.style.setProperty('--card-top', `${box.y.toFixed(2)}px`);
  card.style.setProperty('--card-w', `${box.w.toFixed(2)}px`);
  card.style.setProperty('--card-h', `${box.h.toFixed(2)}px`);
}

let axisPathLength = 0;
function measureAxisPath() {
  if (!axisGuidePath || !axisDonePath) return;
  axisPathLength = axisGuidePath.getTotalLength();
  axisDonePath.style.strokeDasharray = axisPathLength;
  axisDonePath.style.strokeDashoffset = axisPathLength;
}

function updateAxisInteraction() {
  if (!axisSection || !axisStage || axisCards.length < 3) return;

  const rect = axisSection.getBoundingClientRect();
  const stageRect = axisStage.getBoundingClientRect();
  const stageW = stageRect.width;
  const stageH = stageRect.height;
  const scrollable = axisSection.offsetHeight - window.innerHeight;
  const globalProgress = clamp01(-rect.top / Math.max(scrollable, 1));

  const horizontalProgress = smooth(range(globalProgress, 0.00, 0.25));
  const alignProgress = smooth(range(globalProgress, 0.18, 0.35));
  const guideProgress = smooth(range(globalProgress, 0.30, 0.42));
  const traceProgress = smooth(range(globalProgress, 0.35, 0.65));
  const cutProgress = smooth(range(globalProgress, 0.35, 0.70));
  const flowProgress = smooth(range(globalProgress, 0.45, 0.75));
  const blockProgress = smooth(range(globalProgress, 0.55, 0.80));
  const pillarProgress = smooth(range(globalProgress, 0.72, 1.00));

  const cardW = Math.max(stageW * (stageW < 760 ? .64 : .5), 360);
  const cardH = Math.min(stageH * .46, Math.max(310, stageW * .31));
  const startY = stageH * .39;
  const alignedY = stageH * .40;
  const startCenters = [stageW * .82, stageW * 1.42, stageW * 2.02];
  const passCenters = [stageW * -.08, stageW * .50, stageW * 1.08];
  const alignedCenters = [stageW * .14, stageW * .50, stageW * .86];

  axisCards.forEach((card, index) => {
    const passX = lerp(startCenters[index], passCenters[index], horizontalProgress);
    const alignedX = lerp(passX, alignedCenters[index], alignProgress);
    const y = lerp(startY, alignedY, alignProgress);
    setCardBox(card, { x: alignedX, y, w: cardW, h: cardH });
  });

  const cutA = lerp(0, 10.5, cutProgress);
  const cutB = lerp(0, 15.5, cutProgress);
  const cutC = lerp(0, 8.5, cutProgress);
  setAxisVar('--card-clip-a', `${cutA.toFixed(2)}%`);
  setAxisVar('--card-clip-b', `${cutB.toFixed(2)}%`);
  setAxisVar('--card-clip-c', `${cutC.toFixed(2)}%`);
  setAxisVar('--cards-opacity', (1 - smooth(range(globalProgress, .74, .94))).toFixed(3));
  setAxisVar('--card-label-opacity', (1 - smooth(range(globalProgress, .33, .52))).toFixed(3));

  setAxisVar('--guide-opacity', guideProgress.toFixed(3));
  setAxisVar('--cut-label-opacity', guideProgress.toFixed(3));
  setAxisVar('--cursor-opacity', (traceProgress * (1 - smooth(range(globalProgress, .66, .74)))).toFixed(3));

  if (!axisPathLength) measureAxisPath();
  if (axisGuidePath && axisDonePath && axisCutSvg && axisPathLength) {
    const point = axisGuidePath.getPointAtLength(axisPathLength * traceProgress);
    const svgRect = axisCutSvg.getBoundingClientRect();
    const cursorX = svgRect.left - stageRect.left + (point.x / 1000) * svgRect.width;
    const cursorY = svgRect.top - stageRect.top + (point.y / 260) * svgRect.height;
    axisDonePath.style.strokeDashoffset = axisPathLength * (1 - traceProgress);
    setAxisVar('--cursor-x', `${cursorX.toFixed(2)}px`);
    setAxisVar('--cursor-y', `${cursorY.toFixed(2)}px`);
  }

  setAxisVar('--flow-opacity', (flowProgress * (1 - smooth(range(globalProgress, .78, .94)))).toFixed(3));
  setAxisVar('--flow-y', `${lerp(-18, 60, flowProgress).toFixed(1)}px`);
  setAxisVar('--flow-spread', `${lerp(54, 0, flowProgress).toFixed(1)}px`);

  const blockFade = 1 - smooth(range(globalProgress, .78, .92));
  setAxisVar('--block-opacity', (blockProgress * blockFade).toFixed(3));
  setAxisVar('--block-scale', lerp(.42, 1, blockProgress).toFixed(3));

  setAxisVar('--pillar-opacity', pillarProgress.toFixed(3));
  setAxisVar('--pillar-h', `${lerp(12, stageW < 760 ? 54 : 62, pillarProgress).toFixed(2)}vh`);
  setAxisVar('--pillar-w', `${lerp(stageW < 760 ? 34 : 18, stageW < 760 ? 42 : 22, pillarProgress).toFixed(2)}vw`);
  setAxisVar('--final-opacity', smooth(range(globalProgress, .86, 1.00)).toFixed(3));
}

let axisRaf = 0;
function requestAxisUpdate() {
  if (axisRaf) return;
  axisRaf = requestAnimationFrame(() => {
    axisRaf = 0;
    updateAxisInteraction();
  });
}

measureAxisPath();
addEventListener('scroll', requestAxisUpdate, {passive:true});
addEventListener('resize', () => {
  measureAxisPath();
  requestAxisUpdate();
});
requestAxisUpdate();
