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
    
    sidebar.innerHTML = `
      <div class="sidebar-brand" style="color: white; font-weight: 800; font-size: 1.2rem; margin-right: auto; padding: 0 10px;">
        OPUS ONE
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
        ${sidebarItems.map(item => {
          const targetPath = item.href.replace(/\/$/, '') || '/';
          const isActive = normalizedPath === targetPath;
          return `<a href="${item.href}" class="planner-sidebar-item ${isActive ? 'active' : ''}">${item.text}</a>`;
        }).join('')}
      </div>
      <div style="margin-left: auto; display: flex; align-items: center; gap: 12px; padding: 0 10px;">
        ${userEmail ? `<span style="color: rgba(255,255,255,0.7); font-size: 0.8rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userEmail}</span>` : ''}
        <button id="logout-btn" class="planner-button" style="font-size: 0.75rem; padding: 4px 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white;">Logout</button>
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
