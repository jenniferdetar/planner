const SidebarModule = (() => {
  const sidebarItems = [
    { href: '/calendar/', text: 'Home', class: 'nav-home' },
    { href: '/csea/', text: 'CSEA', class: 'nav-csea' },
    { href: '/finance/', text: 'Finance', class: 'nav-finance' },
    { href: '/health/', text: 'Health', class: 'nav-health' },
    { href: '/hoa/', text: 'HOA', class: 'nav-hoa' },
    { href: '/icaap/', text: 'iCAAP', class: 'nav-icaap' },
    { href: '/planning/', text: 'Planning', class: 'nav-planning' }
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
      <div class="sidebar-brand">
        OPUS ONE
      </div>
      <div class="nav-rows-container">
        <div class="nav-row nav-row-1">
          ${sidebarItems.slice(0, 5).map(item => {
            const targetPath = item.href.replace(/\/$/, '') || '/';
            const isActive = normalizedPath === targetPath;
            return `<a href="${item.href}" class="planner-sidebar-item ${item.class} ${isActive ? 'active' : ''}">${item.text}</a>`;
          }).join('')}
        </div>
        <div class="nav-row nav-row-2">
          ${sidebarItems.slice(5).map(item => {
            const targetPath = item.href.replace(/\/$/, '') || '/';
            const isActive = normalizedPath === targetPath;
            return `<a href="${item.href}" class="planner-sidebar-item ${item.class} ${isActive ? 'active' : ''}">${item.text}</a>`;
          }).join('')}
        </div>
      </div>
      <div class="sidebar-user-info">
        ${userEmail ? `<span class="user-email" title="${userEmail}">${userEmail}</span>` : ''}
        <button id="logout-btn">Logout</button>
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

  return { init };
})();

window.SidebarModule = SidebarModule;
