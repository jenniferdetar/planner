const SidebarModule = (() => {
  const sidebarItems = [
    { href: '/calendar', text: 'Home' },
    { href: '/personal-planner', text: 'Personal Planner' },
    { href: '/work-planner', text: 'Work Planner' },
    { href: '/goals', text: 'Goals' },
    { href: '/planning', text: 'Planning' },
    { href: '/csea', text: 'CSEA' },
    { href: '/icaap', text: 'iCAAP' },
    { href: '/health', text: 'Health' },
    { href: '/finance', text: 'Finance' },
    { href: '/hoa', text: 'HOA' }
  ];

  async function init() {
    const sidebar = document.querySelector('.planner-sidebar');
    if (!sidebar) return;

    let userEmail = '';
    if (window.supabaseClient) {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      if (user) userEmail = user.email;
    }

    const normalizedPath = window.location.pathname.replace(/\/$/, '') || '/';
    
    sidebar.innerHTML = sidebarItems.map(item => {
      const targetPath = item.href.replace(/\/$/, '') || '/';
      const isActive = normalizedPath === targetPath;
      return `<a href="${item.href}" class="planner-sidebar-item ${isActive ? 'active' : ''}">${item.text}</a>`;
    }).join('') + `
      <div style="margin-top: auto; padding-top: 20px; text-align: center; color: rgba(10, 47, 95, 0.6); font-size: 0.8rem;">
        ${userEmail ? `<div style="margin-bottom: 8px; word-break: break-all;">${userEmail}</div>` : ''}
        <button id="logout-btn" class="planner-button" style="width: 100%; font-size: 0.85rem; padding: 4px 8px;">Logout</button>
      </div>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (window.supabaseClient) {
          await window.supabaseClient.auth.signOut();
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
