const SidebarModule = (() => {
  const sidebarItems = [
    { href: '/', text: 'Home' },
    { href: '/', text: 'Personal Planner' },
    { href: '/work-planner.html', text: 'Work Planner' },
    { href: '/planning/', text: 'Planning' },
    { href: '/csea/', text: 'CSEA' },
    { href: '/icaap/', text: 'iCAAP' },
    { href: '/health/', text: 'Health' },
    { href: '/finance/', text: 'Finance' }
  ];

  function init() {
    const sidebar = document.querySelector('.planner-sidebar');
    if (!sidebar) return;

    const normalizedPath = window.location.pathname.replace(/\\/g, '/').replace(/\/$/, '') || '/';
    
    sidebar.innerHTML = sidebarItems.map(item => {
      const targetPath = item.href.replace(/\\/g, '').replace(/\/$/, '') || '/';
      const isActive = normalizedPath === targetPath;
      return `<a href="${item.href}" class="planner-sidebar-item ${isActive ? 'active' : ''}">${item.text}</a>`;
    }).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
