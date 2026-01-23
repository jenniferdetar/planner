const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';

function updateNavigationLinks(date) {
    if (!date) return;
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const internalPages = [
        'index.html',
        'work-planner.html',
        'personal-planner.html',
        'csea.html',
        'financial.html',
        'hoa.html',
        'icaap.html',
        'planning.html'
    ];
    document.querySelectorAll('a.nav-link, a.nav-btn').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const base = href.split('?')[0];
            if (internalPages.includes(base)) {
                link.href = `${base}?date=${dateStr}`;
            }
        }
    });
}

// Global initialization if needed
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    if (dateParam) {
        updateNavigationLinks(dateParam);
    }
});
