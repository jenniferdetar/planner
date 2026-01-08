const SidebarModule = (() => {
  const sidebarItems = [
    { href: 'index.html', text: 'Home' },
    { href: 'index.html', text: 'Personal Planner' },
    { href: 'work-planner.html', text: 'Work Planner' },
    { href: 'planning.html', text: 'Planning' },
    { href: 'csea.html', text: 'CSEA' },
    { href: 'icaap.html', text: 'iCAAP' },
    { href: 'health.html', text: 'Health' },
    { href: 'finance.html', text: 'Finance' }
  ];

  function init() {
    const sidebar = document.querySelector('.planner-sidebar');
    if (!sidebar) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    sidebar.innerHTML = sidebarItems.map(item => {
      const isActive = item.href === currentPage || (currentPage === '' && item.href === 'index.html');
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
