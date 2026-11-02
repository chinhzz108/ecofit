(() => {
  const links = [
    ['Khám phá', '/#eco-home'],
    ['Sản phẩm', '/san-pham/ao-ecofit/'],
    ['Chơi game', '/ecofit-game/'],
    ['Chất liệu', '/chat-lieu/'],
    ['Về Ecofit', '/ve-ecofit/'],
  ];

  const makeLink = ([label, href], className = '') => {
    const link = document.createElement('a');
    link.className = className;
    link.href = href;
    link.textContent = label;
    if (href === location.pathname) link.setAttribute('aria-current', 'page');
    link.addEventListener('click', () => {
      document.querySelector('header')?.classList.remove('ecofit-menu-open');
      document.querySelector('.ecofit-menu-trigger')?.setAttribute('aria-expanded', 'false');
    });
    return link;
  };

  function ensureSocialDock() {
    if (!document.body || document.getElementById('ecofit-social-dock')) return;
    const dock = document.createElement('nav');
    dock.id = 'ecofit-social-dock';
    dock.className = 'ecofit-social-dock';
    dock.setAttribute('aria-label', 'Kết nối với Ecofit');
    dock.innerHTML = `
      <a href="https://www.facebook.com/profile.php?id=61594559625360" target="_blank" rel="noopener noreferrer" aria-label="Ecofit trên Facebook" title="Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.99 22 12c0-5.523-4.477-10-10-10Z"/></svg>
      </a>
      <a href="https://www.tiktok.com/@ecofit.wear?is_from_webapp=1&amp;sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Ecofit trên TikTok" title="TikTok">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.9 2.88 2.88 2.88 0 1 1 .4-5.73V9.35a6.4 6.4 0 1 0 5.95 6.32V9.01a8.2 8.2 0 0 0 4.8 1.54V7.1a4.8 4.8 0 0 1-1.03-.41Z"/></svg>
      </a>
      <a href="https://zalo.me/0868060624" target="_blank" rel="noopener noreferrer" aria-label="Ecofit trên Zalo, số 0868 060 624" title="Zalo · 0868 060 624">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M5.2 4.5h13.6A2.2 2.2 0 0 1 21 6.7v9.6a2.2 2.2 0 0 1-2.2 2.2h-7L5 21v-2.5h-.2a2.2 2.2 0 0 1-2.2-2.2V6.7a2.2 2.2 0 0 1 2.6-2.2Z"/><path fill="currentColor" d="M7.7 8h8.6v1.7l-5 4.3h5.1v2H7.8v-1.7l5-4.3H7.7z"/></svg>
      </a>`;
    document.body.append(dock);
  }

  function prepareAnchors() {
    const firstSection = document.querySelector('main section, #root main > div');
    if (firstSection && !firstSection.id) firstSection.id = 'eco-home';

    const trending = [...document.querySelectorAll('h1, h2, h3')]
      .find((heading) => heading.textContent.trim().toLowerCase() === 'trending');
    if (trending && !trending.id) trending.id = 'eco-trending';

    const footer = document.querySelector('footer');
    if (footer && !footer.id) footer.id = 'eco-footer';
  }

  let headerNode = null;
  let headerIsCompact = null;
  const syncHeaderDensity = () => {
    const header = headerNode || document.querySelector('header.ecofit-header');
    if (!header) return;
    headerNode = header;
    const compact = window.scrollY > 36;
    if (compact === headerIsCompact) return;
    headerIsCompact = compact;
    header.classList.toggle('ecofit-header-compact', compact);
  };
  window.addEventListener('scroll', syncHeaderDensity, { passive: true });

  function patchHeader() {
    ensureSocialDock();
    const header = document.querySelector('header');
    const row = header?.firstElementChild;
    if (!header || !row || row.children.length < 3) return;

    headerNode = header;
    header.classList.add('ecofit-header');
    row.classList.add('ecofit-header-row');
    const utilityBar = header.previousElementSibling;
    if (utilityBar && /find a store|join us|sign in/i.test(utilityBar.innerText || '')) {
      utilityBar.classList.add('ecofit-source-utility');
    }

    const logo = row.children[0];
    const controls = row.children[row.children.length - 1];
    logo.classList.add('ecofit-logo-wrap');
    controls.classList.add('ecofit-header-actions');
    controls.classList.remove('space-x-2', 'sm:space-x-3');

    for (const nav of row.querySelectorAll(':scope > nav')) {
      if (!nav.classList.contains('ecofit-header-nav')) nav.classList.add('ecofit-source-nav');
    }

    if (!row.querySelector(':scope > .ecofit-header-nav')) {
      const nav = document.createElement('nav');
      nav.className = 'ecofit-header-nav';
      nav.setAttribute('aria-label', 'Điều hướng Ecofit');
      for (const item of links) nav.append(makeLink(item));
      row.insertBefore(nav, controls);
    }

    const desktopSearch = controls.querySelector('.relative button');
    const mobileSearch = controls.querySelector('button[aria-label="Search"]');
    desktopSearch?.classList.add('ecofit-desktop-search');
    mobileSearch?.classList.add('ecofit-mobile-search');
    desktopSearch?.setAttribute('aria-label', 'Tìm sản phẩm');
    mobileSearch?.setAttribute('aria-label', 'Tìm sản phẩm');
    const searchText = desktopSearch?.querySelector('span');
    if (searchText) searchText.textContent = 'Tìm sản phẩm';

    const favorites = controls.querySelector('button[aria-label="Favorites"]');
    favorites?.classList.add('ecofit-hide-control');

    const cart = controls.querySelector('button[aria-label="Cart"]');
    if (cart) {
      cart.classList.add('ecofit-cart-button');
      cart.setAttribute('aria-label', 'Giỏ hàng');
      cart.title = 'Giỏ hàng';
      if (!cart.querySelector('.ecofit-cart-label')) {
        const label = document.createElement('span');
        label.className = 'ecofit-cart-label';
        label.textContent = 'Giỏ hàng';
        cart.append(label);
      }
    }

    const oldMenu = controls.querySelector('button[aria-label="Open navigation menu"]');
    oldMenu?.classList.add('ecofit-hide-control');

    let cta = controls.querySelector(':scope > .ecofit-header-cta');
    const isProductPage = document.body?.dataset.ecofitPage === 'product';
    if (isProductPage) {
      cta?.remove();
    } else if (!cta) {
      cta = makeLink(['Xem sản phẩm', '/san-pham/ao-ecofit/'], 'ecofit-header-cta');
      if (cart) controls.insertBefore(cta, cart);
      else controls.append(cta);
    }

    let menuTrigger = controls.querySelector(':scope > .ecofit-menu-trigger');
    if (!menuTrigger) {
      menuTrigger = document.createElement('button');
      menuTrigger.type = 'button';
      menuTrigger.className = 'ecofit-menu-trigger';
      menuTrigger.setAttribute('aria-label', 'Mở menu Ecofit');
      menuTrigger.setAttribute('aria-expanded', 'false');
      menuTrigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>';
      controls.append(menuTrigger);
    }
    if (!menuTrigger.dataset.ecofitBound) {
      menuTrigger.dataset.ecofitBound = 'true';
      menuTrigger.addEventListener('click', () => {
        const isOpen = header.classList.toggle('ecofit-menu-open');
        menuTrigger.setAttribute('aria-expanded', String(isOpen));
      });
    }

    let mobileMenu = header.querySelector(':scope > .ecofit-mobile-menu');
    if (!mobileMenu) {
      mobileMenu = document.createElement('nav');
      mobileMenu.className = 'ecofit-mobile-menu';
      mobileMenu.setAttribute('aria-label', 'Điều hướng Ecofit');
      for (const item of links) mobileMenu.append(makeLink(item));
      header.append(mobileMenu);
    }

    prepareAnchors();
    syncHeaderDensity();
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      patchHeader();
      if (document.querySelector('.ecofit-menu-trigger')) observer.disconnect();
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  patchHeader();
  if (document.querySelector('.ecofit-menu-trigger')) observer.disconnect();
})();
