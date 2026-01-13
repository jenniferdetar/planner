const SidebarModule = (() => {
  const sidebarItems = [
    { href: '/', text: 'Home' },
    { href: '/personal-planner/', text: 'Personal Planner' },
    { href: '/work-planner/', text: 'Work Planner' },
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
    }).join('') + `
      <div style="margin-top: auto; padding-top: 20px;">
        <button id="logout-btn" class="planner-sidebar-item" style="width: 100%; text-align: left; background: none; border: none; cursor: pointer; color: inherit; font: inherit;">Logout</button>
      </div>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (window.supabaseClient) {
          await window.supabaseClient.auth.signOut();
          window.location.href = '/login.html';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
