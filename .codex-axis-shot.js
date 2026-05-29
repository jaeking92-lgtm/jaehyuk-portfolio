const fs = require('fs');

(async () => {
  const tabs = await fetch('http://127.0.0.1:9223/json').then((response) => response.json());
  const page = tabs.find((tab) => tab.type === 'page' && tab.url.includes('index.html'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  ws.onmessage = ({data}) => {
    const message = JSON.parse(data);
    if (!message.id || !pending.has(message.id)) return;
    const pair = pending.get(message.id);
    pending.delete(message.id);
    message.error ? pair.reject(new Error(JSON.stringify(message.error))) : pair.resolve(message.result);
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const messageId = ++id;
    pending.set(messageId, {resolve, reject});
    ws.send(JSON.stringify({id: messageId, method, params}));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.reload', {ignoreCache: true});
  await new Promise((resolve) => setTimeout(resolve, 700));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        sessionStorage.setItem('cinematicAtelierIntroPlayed', 'true');
        document.body.classList.remove('intro-active');
        const intro = document.getElementById('introScreen');
        if (intro) intro.style.display = 'none';
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.overflow = 'auto';
        const section = document.querySelector('.project-axis-section');
        const top = window.scrollY + section.getBoundingClientRect().top;
        const scrollable = section.offsetHeight - innerHeight;
        const target = top + scrollable * .735;
        document.documentElement.scrollTop = target;
        document.body.scrollTop = target;
        window.scrollTo({top: target, behavior: 'instant'});
      })();
    `
  });
  await new Promise((resolve) => setTimeout(resolve, 900));

  const metrics = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const style = getComputedStyle(document.querySelector('.project-axis-stage'));
        return {
          label: document.querySelector('.axis-label-c').textContent,
          stackOpacity: style.getPropertyValue('--stack-opacity').trim(),
          slabOpacity: style.getPropertyValue('--slab-opacity').trim(),
          pillarOpacity: style.getPropertyValue('--pillar-opacity').trim()
        };
      })()
    `,
    returnByValue: true
  });
  const capture = await send('Page.captureScreenshot', {format: 'png', fromSurface: true});
  fs.writeFileSync('axis-merge-check.png', Buffer.from(capture.data, 'base64'));
  console.log(JSON.stringify(metrics.result.value, null, 2));
  ws.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
