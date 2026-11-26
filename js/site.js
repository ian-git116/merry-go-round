// 快樂轉圈圈 Merry Go Round。選單、閱讀進度和年齡尺的小動作。
(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.progress');
  const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  // 捲動時：頁首加陰影，上方的進度線跟著走
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 4);
    if (progress) {
      const max = root.scrollHeight - window.innerHeight;
      progress.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // 電腦版的下拉選單：滑鼠移過去會打開，也可以點按或用鍵盤
  const items = [...document.querySelectorAll('.nav-item.has-menu')];
  const setItem = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('.nav-link').setAttribute('aria-expanded', String(open));
  };
  const closeAll = (except) => items.forEach((i) => { if (i !== except) setItem(i, false); });
  items.forEach((item) => {
    const btn = item.querySelector('.nav-link');
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      closeAll(item);
      setItem(item, open);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { setItem(item, false); btn.focus(); }
    });
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) setItem(item, false);
    });
    item.addEventListener('mouseleave', () => setItem(item, false));
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav-item')) closeAll(); });

  // 手機選單
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.getElementById('menu');
  if (toggle && panel) {
    const label = toggle.querySelector('.menu-label');
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      root.classList.toggle('menu-open', open);
      if (label) label.textContent = open ? '關閉' : '選單';
      if (open) {
        const bar = header.getBoundingClientRect().bottom;
        panel.style.maxHeight = `calc(100svh - ${Math.max(0, Math.round(bar))}px)`;
      }
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1120 && !panel.hidden) setOpen(false); });
  }

  // 手機下方的聯絡列，捲到頁尾的聯絡區時先收起來，避免同樣的按鈕出現兩次
  const callbar = document.querySelector('.callbar');
  const cta = document.querySelector('.cta');
  if (callbar && cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      callbar.classList.toggle('is-hidden', entry.isIntersecting);
    }, { threshold: 0.15 }).observe(cta);
  }

  // 年齡尺第一次出現在畫面上時，三條線由左往右畫出來
  const ruler = document.querySelector('[data-ruler]');
  if (ruler && motionOK && 'IntersectionObserver' in window) {
    const box = ruler.getBoundingClientRect();
    if (box.top > window.innerHeight * 0.85) {
      ruler.classList.add('will-draw');
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => ruler.classList.add('drawn'));
          io.disconnect();
        }
      }, { threshold: 0.45 });
      io.observe(ruler);
    }
  }
})();
