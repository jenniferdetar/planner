const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';

const DEFAULT_EMPLOYEES = [
    "Bonnie Ratner", "Eberardo Rodriguez", "Maikai Finnell", "Patricia Pernin", "Rene Gaudet", "Stephen Maccarone", "Zina Dixon"
];

const DEFAULT_BILLS = [
    { id: 1, cat: 'Auto', item: 'Auto Maintenance', amt: '$100', class: 'row-auto' },
    { id: 2, cat: 'Auto', item: 'Mercury Auto Insurance', amt: '$388', class: 'row-auto' },
    { id: 3, cat: 'Auto', item: 'Tahoe Registration', amt: '$15', class: 'row-auto' },
    { id: 4, cat: 'Auto', item: 'Trailblazer Registration', amt: '$28', class: 'row-auto' },
    { id: 5, cat: 'Bill Pay', item: 'DWP', amt: '$100', class: 'row-billpay' },
    { id: 6, cat: 'Bill Pay', item: "Jeff's Credit Cards", amt: '$500', class: 'row-billpay' },
    { id: 7, cat: 'Bill Pay', item: "Jennifer's Student Loans", amt: '$150', class: 'row-billpay' },
    { id: 8, cat: 'Bill Pay', item: 'Schools First Loan', amt: '$142', class: 'row-billpay' },
    { id: 9, cat: 'Cash', item: 'Cleaning Lady', amt: '$320', class: 'row-cash' },
    { id: 10, cat: 'Cash', item: 'Gas', amt: '$600', class: 'row-cash' },
    { id: 11, cat: 'Cash', item: 'Laundry', amt: '$80', class: 'row-cash' },
    { id: 12, cat: 'Credit Card', item: 'ADT', amt: '$53', class: 'row-cc' },
    { id: 13, cat: 'Credit Card', item: 'Amazon', amt: '$100', class: 'row-cc' },
    { id: 14, cat: 'Credit Card', item: 'Groceries', amt: '$600', class: 'row-cc' },
    { id: 15, cat: 'Credit Card', item: 'Hair', amt: '$110', class: 'row-cc' },
    { id: 16, cat: 'Credit Card', item: 'Orkin', amt: '$50', class: 'row-cc' },
    { id: 17, cat: 'Housing', item: 'HELOC', amt: '$357', class: 'row-housing' },
    { id: 18, cat: 'Housing', item: 'HOA', amt: '$520', class: 'row-housing' },
    { id: 19, cat: 'Housing', item: 'Mortgage', amt: '$2,250', class: 'row-housing' },
    { id: 20, cat: 'Housing', item: 'Spectrum', amt: '$197', class: 'row-housing' },
    { id: 21, cat: 'Housing', item: 'Verizon', amt: '$283', class: 'row-housing' },
    { id: 22, cat: 'Savings', item: 'Blow', amt: '$200', class: 'row-savings' },
    { id: 23, cat: 'Savings', item: 'HSA', amt: '$200', class: 'row-savings' },
    { id: 24, cat: 'Savings', item: 'Summer Saver', amt: '$400', class: 'row-savings' },
    { id: 25, cat: 'Savings', item: "Tahoe's Major Repairs", amt: '$200', class: 'row-savings' },
    { id: 26, cat: 'Savings', item: 'Vacation', amt: '$125', class: 'row-savings' }
];

let supabaseClient;
function getSupabase() {
    if (supabaseClient) return supabaseClient;
    if (typeof window !== 'undefined' && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabaseClient;
    }
    return null;
}

function parseLocalDate(dateStr) {
    if (!dateStr) {
        const stored = localStorage.getItem('selectedDate');
        if (stored) dateStr = stored;
    }
    
    if (!dateStr) return new Date();

    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Auth Logic
function checkIsLoginPage() {
    const path = window.location.pathname;
    return path.endsWith('login.html') || 
           path.endsWith('/login') || 
           path === '/login/';
}

async function requireAuth() {
    const client = getSupabase();
    if (!client) return;

    const { data: { session } } = await client.auth.getSession();
    const isLoginPage = checkIsLoginPage();
    if (!session) {
        // If on login.html, don't redirect
        if (!isLoginPage) {
            window.location.href = 'login.html';
        }
    }
    return session;
}

async function logout() {
    const client = getSupabase();
    if (client) {
        await client.auth.signOut();
        window.location.href = 'login.html';
    }
}

function setGlobalHeaderTitle(title) {
    const el = document.getElementById('global-header-title');
    if (el) el.innerText = title;
}

// Global Auth Check
if (typeof window !== 'undefined') {
    if (!checkIsLoginPage()) {
        requireAuth();
    }
}

// Planner Data Logic
function formatTimestamp() {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `[${date} ${time}]`;
}

function ensureTimestamp(content) {
    if (!content || !content.trim()) return content;
    const tsRegex = /^\[\d{2}\/\d{2}\/\d{2}\s\d{2}:\d{2}\s[AP]M\]/;
    if (tsRegex.test(content.trim())) return content;
    return `${formatTimestamp()} ${content}`;
}

async function fetchPlannerData(startDate, days = 7) {
    const client = getSupabase();
    if (!client) {
        console.error('Supabase client not initialized');
        return [];
    }

    let query = client.from('work_planner_edits').select('date_key, slot_key, value');

    // Determine if startDate is a specific date or a generic persistence key
    const isDateString = typeof startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startDate);
    const isDateObject = startDate instanceof Date;

    if (isDateString || isDateObject) {
        const startStr = isDateObject ? startDate.toISOString().split('T')[0] : startDate;
        const endDate = new Date(startStr);
        endDate.setDate(endDate.getDate() + (days - 1));
        const endStr = endDate.toISOString().split('T')[0];
        query = query.gte('date_key', startStr).lte('date_key', endStr);
    } else {
        // Treat as a literal persistence key (e.g., 'icaap-tracking-data', 'planning-data')
        query = query.eq('date_key', startDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching planner data:', error);
        return [];
    }
    // Map back to internal format for compatibility
    return (data || []).map(item => ({
        date: item.date_key,
        field_id: item.slot_key,
        content: item.value
    }));
}

// Global Animation Helper
function animateAndNavigate(event, url, direction = 'next') {
    if (event) event.preventDefault();
    window.location.href = url;
}

// Modern Dashboard Layout & Navigation System
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --primary-navy: #00326b;
            --accent-gold: #c5a059;
            --bg-light: #f5f7fa;
            --text-dark: #333;
            --border-color: #d1d1d1;
            --font-main: 'Coming Soon', cursive;
        }

        * {
            box-sizing: border-box;
            font-family: 'Coming Soon', cursive !important;
        }

        body, html {
            margin: 0;
            padding: 0;
            height: 100vh;
            width: 100vw;
            overflow: hidden !important;
            background: var(--bg-light);
            font-size: 10pt;
            line-height: 1.2;
            font-weight: 600;
        }

        .dashboard-container {
            display: flex;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }

        .dashboard-sidebar {
            width: 250px;
            background: var(--primary-navy);
            color: #fff;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            overflow-y: auto;
            padding-top: 20px;
        }

        .sidebar-section {
            padding: 10px 0;
        }

        .sidebar-label {
            padding: 5px 25px;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.5);
            font-weight: 700;
        }

        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 25px;
            color: #fff;
            text-decoration: none;
            font-size: 10pt;
            transition: background 0.2s;
        }

        .sidebar-link:hover {
            background: rgba(255,255,255,0.1);
        }

        .sidebar-link.active {
            background: rgba(255,255,255,0.2);
            border-left: 4px solid var(--accent-gold);
            padding-left: 21px;
        }

        .sidebar-icon {
            font-size: 12pt;
        }

        .dashboard-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            background: #fff;
        }

        .dashboard-header {
            flex-shrink: 0;
            background: #fff;
            border-bottom: 1px solid var(--border-color);
            padding: 10px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 80px;
            position: relative;
            z-index: 100;
        }

        .header-left-controls {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 101;
        }

        .header-center {
            text-align: center;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .header-right-controls {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 101;
        }

        .header-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--primary-navy);
            margin: 0;
            letter-spacing: 3px;
            text-transform: uppercase;
        }

        .header-nav-btn {
            background: #fff;
            border: 1px solid var(--border-color);
            padding: 6px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10pt;
            font-weight: 600;
            color: var(--text-dark);
            transition: all 0.2s;
        }

        .header-nav-btn:hover {
            background: #f8f9fa;
            border-color: var(--primary-navy);
        }

        .dashboard-body {
            flex: 1;
            overflow: auto;
            padding: 0 !important;
            background: #fff;
        }

        .content-area {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
        }
    `;
    document.head.appendChild(style);

    // Dynamic Header Title Helper
    window.setGlobalHeaderTitle = function(title) {
        const titleEl = document.querySelector('.header-title');
        if (titleEl) titleEl.innerText = title;
    };

    // Initialize Dashboard Wrapper
    document.addEventListener('DOMContentLoaded', () => {
        if (checkIsLoginPage()) return;

        const existingNodes = Array.from(document.body.childNodes);
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const urlParams = new URLSearchParams(window.location.search);
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const dateStr = urlParams.get('date') || localStorage.getItem('selectedDate') || todayStr;
        const category = urlParams.get('category');

        // Create Sidebar Navigation
        const sidebarSections = [
            {
                label: 'Dashboard',
                items: [
                    { label: 'Calendar View', path: 'index.html', icon: '📅' },
                    { label: 'Personal Planner', path: 'planner.html', params: { category: 'Personal-Planner' }, icon: '🏠' }
                ]
            },
            {
                label: 'Planning',
                items: [
                    { label: 'Personal Goals', path: 'personal-goals.html', icon: '✨' },
                    { label: 'Monthly Review', path: 'monthly-review.html', icon: '📄', params: { category: 'Planning' } }
                ]
            },
            {
                label: 'ICAAP',
                items: [
                    { label: 'Paylog Submissions', path: 'icaap-paylogs.html', icon: '📄' },
                    { label: 'Hours Worked', path: 'icaap-hours.html', icon: '📄' },
                    { label: 'Approval Dates', path: 'icaap-approvals.html', icon: '📄' },
                    { label: 'Attendance Tracking', path: 'icaap-attendance.html', icon: '📄' },
                    { label: 'Notes', path: 'icaap-notes.html', icon: '📝' }
                ]
            },
            {
                label: 'Finance',
                items: [
                    { label: 'Recurring Bills', path: 'financial.html', icon: '💰' },
                    { label: 'Check Breakdown', path: 'check-breakdown.html', icon: '📄' }
                ]
            },
            {
                label: 'Other',
                items: [
                    { label: 'HOA', path: 'hoa.html', icon: '🏠' },
                    { label: 'CSEA', path: 'csea.html', icon: '📋' },
                    { label: 'Mantra', path: 'mantra.html', icon: '✨' }
                ]
            }
        ];

        const sidebarHtml = sidebarSections.map(section => `
            <div class="sidebar-section">
                <div class="sidebar-label">${section.label}</div>
                ${section.items.map(item => {
                    const itemUrl = new URL(item.path, window.location.origin);
                    if (item.params) {
                        Object.keys(item.params).forEach(key => itemUrl.searchParams.set(key, item.params[key]));
                    }
                    
                    const isActive = currentPath === item.path && 
                                   (!item.params || Object.keys(item.params).every(k => urlParams.get(k) === item.params[k]));
                    
                    return `
                        <a href="${itemUrl.pathname}${itemUrl.search}" class="sidebar-link ${isActive ? 'active' : ''}">
                            <span class="sidebar-icon">${item.icon}</span>
                            ${item.label}
                        </a>
                    `;
                }).join('')}
            </div>
        `).join('');

        const dashboard = document.createElement('div');
        dashboard.className = 'dashboard-container';
        dashboard.innerHTML = `
            <aside class="dashboard-sidebar">
                <div style="padding: 0 25px 30px; font-size: 10pt; font-weight: 700; color: #fff; letter-spacing: 2px;">PLANNER 2026</div>
                ${sidebarHtml}
            </aside>
            <main class="dashboard-main">
                <header class="dashboard-header">
                    <div class="header-left-controls">
                        <button class="header-nav-btn" onclick="localStorage.removeItem('selectedDate'); window.location.href='index.html'">Today</button>
                    </div>
                    <div class="header-center">
                        <h1 class="header-title">PLANNER 2026</h1>
                    </div>
                    <div class="header-right-controls">
                        <input type="date" value="${dateStr}" id="global-date-picker" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc; font-family: 'Coming Soon', cursive; font-size: 10pt; font-weight: 600;">
                        <a href="#" onclick="logout(); return false;" style="text-decoration: none; color: var(--primary-navy); font-size: 10pt; font-weight: 600; text-transform: uppercase;">Logout</a>
                    </div>
                </header>
                <div class="dashboard-body">
                </div>
            </main>
        `;

        const dashboardBody = dashboard.querySelector('.dashboard-body');
        existingNodes.forEach(node => {
            if (node.nodeType === 1 && (node.tagName === 'STYLE' || node.tagName === 'SCRIPT')) return;
            dashboardBody.appendChild(node);
        });
        
        document.body.innerHTML = '';
        document.body.appendChild(dashboard);

        // Handle Date Picker
        const datePicker = document.getElementById('global-date-picker');
        if (datePicker) {
            datePicker.addEventListener('change', (e) => {
                const newDate = e.target.value;
                localStorage.setItem('selectedDate', newDate);
                // Refresh without date in URL
                const params = new URLSearchParams(window.location.search);
                params.delete('date');
                const newSearch = params.toString();
                window.location.href = `${window.location.pathname}${newSearch ? '?' + newSearch : ''}`;
            });
        }

        // Update all links to preserve date
        updateNavigationLinks(dateStr);
    });
})();

async function savePlannerData(date, fieldId, content, skipTimestamp = false) {
    const client = getSupabase();
    if (!client) return null;

    // Apply timestamp for text entries, skip for numeric/currency/empty/checkmarks/ICAAP/HTML/explicit skip
    let finalValue = content;
    const isNumeric = content && !isNaN(parseFloat(content)) && isFinite(content);
    const isCurrency = content && /^\$?\d+(,\d{3})*(\.\d+)?$/.test(String(content).trim());
    const isCheckmark = content === 'true' || content === 'false';
    const isIcaap = fieldId && (fieldId.startsWith('attn-') || fieldId.startsWith('icaap-'));
    const isHtml = content && typeof content === 'string' && (content.includes('<') || content.includes('>'));

    if (!skipTimestamp && content && content.trim() && !isNumeric && !isCurrency && !isCheckmark && !isIcaap && !isHtml) {
        finalValue = ensureTimestamp(content);
    }

    try {
        const payload = { 
            date_key: date, 
            slot_key: fieldId, 
            value: finalValue
        };

        // Standard update/insert pattern for better reliability
        const { data: existing, error: fetchError } = await client
            .from('work_planner_edits')
            .select('id')
            .match({ date_key: date, slot_key: fieldId })
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
            const { error: updateError } = await client
                .from('work_planner_edits')
                .update({ value: finalValue })
                .eq('id', existing.id);
            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await client
                .from('work_planner_edits')
                .insert(payload);
            if (insertError) throw insertError;
        }
        
        return finalValue;
    } catch (err) {
        console.error('Save error details:', err);
        return null;
    }
}

// Calendar Events Logic
async function fetchCalendarEvents(startDate, days = 7) {
    const client = getSupabase();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (days - 1));
    const startStr = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    const endStr = endDate.toISOString().split('T')[0];

    let dbEvents = [];
    if (client) {
        const { data, error } = await client
            .from('calendar_by_date')
            .select('*')
            .gte('date', startStr)
            .lte('date', endStr);
        if (!error) dbEvents = data || [];
    }

    const hardcodedEvents = getCalendarEvents().filter(e => e.date >= startStr && e.date <= endStr);
    
    // Combine and deduplicate by date + title
    const allEvents = [...dbEvents, ...hardcodedEvents];
    const uniqueMap = new Map();
    allEvents.forEach(e => {
        const key = `${e.date}|${e.title}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, e);
        }
    });
    
    return Array.from(uniqueMap.values());
}

function getCalendarEvents() {
    return [
        { date: '2026-01-26', time: '17:30', title: 'Chapter 500 Monthly', duration: 120 },
        { date: '2026-01-26', time: '19:00', title: 'LA Fed', duration: 60 },
        { date: '2026-02-06', time: '09:30', title: 'CSEA Reopener Negotiations', duration: 420 },
        { date: '2026-02-07', time: '08:30', title: 'CSEA Officer Skills Training', duration: 450 },
        // WEN SweetAlmondMint & Pomegranate Auto-Delivery
        { date: '2026-04-01', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2026-05-31', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2026-07-30', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2026-09-28', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2026-11-27', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2027-01-26', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2027-03-27', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2027-05-26', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        // WEN Replenishing Treatment Auto-Delivery
        { date: '2026-02-17', title: 'A-D WEN Replenishing Treatment' },
        { date: '2026-04-18', title: 'A-D WEN Replenishing Treatment' },
        { date: '2026-06-17', title: 'A-D WEN Replenishing Treatment' },
        { date: '2026-08-16', title: 'A-D WEN Replenishing Treatment' },
        { date: '2026-10-15', title: 'A-D WEN Replenishing Treatment' },
        { date: '2026-12-14', title: 'A-D WEN Replenishing Treatment' },
        { date: '2027-02-12', title: 'A-D WEN Replenishing Treatment' },
        { date: '2027-04-13', title: 'A-D WEN Replenishing Treatment' },
        { date: '2027-06-12', title: 'A-D WEN Replenishing Treatment' }
    ];
}

// Notes Logic
async function fetchEntries(category, date) {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('category_entries').select('*').eq('category', category);
    if (date) query = query.eq('date_key', date);
    const { data, error } = await query.order('created_at', { ascending: false });
    return error ? [] : (data || []);
}

async function saveEntry(category, date, content) {
    const client = getSupabase();
    if (!client || !content.trim()) return null;
    const finalContent = ensureTimestamp(content);
    const { data, error } = await client.from('category_entries').insert({ category, content: finalContent, date_key: date }).select().single();
    return error ? null : data;
}

async function fetchCategoryEntries(category) {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
        .from('category_entries')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching entries:', error);
        return [];
    }
    return data;
}

async function saveCategoryEntry(category, content) {
    const client = getSupabase();
    if (!client || !content.trim()) return null;
    const finalContent = ensureTimestamp(content);
    const { data, error } = await client
        .from('category_entries')
        .insert({ category, content: finalContent })
        .select()
        .single();
    
    if (error) {
        console.error('Error saving entry:', error);
        alert('Save failed: ' + error.message);
        return null;
    }
    return data;
}

async function updateCategoryEntry(id, content) {
    const client = getSupabase();
    if (!client) return false;
    const finalContent = ensureTimestamp(content);
    const { error } = await client
        .from('category_entries')
        .update({ content: finalContent })
        .eq('id', id);
    
    if (error) {
        console.error('Error updating entry:', error);
        return null;
    }
    return finalContent;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).replace(',', '');
    const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    return `${datePart} ${timePart}`;
}

function formatDateMMM(dateStr) {
    if (!dateStr) return '';
    let date;
    if (dateStr instanceof Date) {
        date = dateStr;
    } else {
        // Handle ISO strings or YYYY-MM-DD by splitting to avoid timezone shifts
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const parts = datePart.split('-');
        if (parts.length === 3) {
            date = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            date = new Date(dateStr);
        }
    }
    
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).replace(',', '');
}

function formatTime(timeStr, compact = false, showSpace = false) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    let ampm = compact ? (h >= 12 ? 'p' : 'a') : (h >= 12 ? 'pm' : 'am');
    if (showSpace && !compact) ampm = ' ' + ampm;
    const displayHour = h % 12 || 12;
    if (compact && m === 0) {
        return `${displayHour}${ampm}`;
    }
    return `${displayHour}:${m.toString().padStart(2, '0')}${ampm}`;
}

function getEventClass(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('csea') || lowerTitle.includes('negotiations') || lowerTitle.includes('la 500')) return 'event-pill csea';
    if (lowerTitle.includes('la fed')) return 'event-pill la-fed';
    if (lowerTitle.includes('due')) return 'event-pill due';
    if (lowerTitle.includes('meeting')) return 'event-pill meeting';
    if (lowerTitle.includes('pay day') || lowerTitle.includes('payday') || lowerTitle.includes('paycheck')) return 'event-pill pay-day';
    if (lowerTitle.includes('budget')) return 'event-pill budget';
    if (lowerTitle.includes('wen')) return 'event-pill wen';
    if (lowerTitle.includes('dwp')) return 'event-pill dwp';
    if (lowerTitle.includes('cutoff') || lowerTitle.includes('cut-off') || lowerTitle.includes('off-cycle')) return 'event-pill lausd';
    if (lowerTitle.includes('conference')) return 'event-pill conference';
    if (lowerTitle.includes('cruise')) return 'event-pill cruise';
    
    // Names that are likely birthdays or explicitly Anniversary
    const celebrateNames = [
        'allison', 'allyson', 'anniversary', 'brienne', 'chelsea', 'chris', 
        'christine', 'cj ', 'craig', 'cynthia', 'debbie', 'dennis', 
        'dianne', 'donna', 'eberardo', 'elias', 'emily', 'gayle', 
        'geoff', 'greg', 'harrison', 'jacee', 'jackob', 'jaelyn', 
        'jana', 'jeff', 'jennifer', 'jeremy', 'jim', 'joie', 
        'kathie', 'kay ', 'lincoln', 'lynda', 'marjorie', 'nick ', 
        'nicole', 'norm ', 'renee', 'rose', 'susan', 'terry', 'tom ', 
        'vic ', 'stephen'
    ];
    
    if (celebrateNames.some(name => lowerTitle.includes(name))) {
        return 'event-pill celebrate';
    }

    return 'event-pill';
}

async function deleteCategoryEntry(id) {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client
        .from('category_entries')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting entry:', error);
        return false;
    }
    return true;
}

// Interaction Log Logic
async function fetchInteractions(category) {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
        .from('member_interactions')
        .select('*')
        .eq('category', category)
        .order('date_spoke', { ascending: false });
    
    if (error) {
        console.error('Error fetching interactions:', error);
        return [];
    }
    
    // Unpack extra fields from point_of_contact if they exist and normalize names
    return (data || []).map(inter => {
        let normalized = { 
            ...inter, 
            member_name: toTitleCase(inter.member_name),
            work_location: toTitleCase(inter.work_location)
        };
        if (inter.point_of_contact && inter.point_of_contact.startsWith('{')) {
            try {
                const extra = JSON.parse(inter.point_of_contact);
                normalized = { ...normalized, ...extra };
            } catch (e) {}
        }
        return normalized;
    });
}

async function saveInteraction(category, interaction) {
    const client = getSupabase();
    if (!client) return null;
    
    // Pack extra fields into point_of_contact to avoid schema changes
    const knownFields = ['id', 'category', 'date_spoke', 'member_name', 'work_location', 'discussion', 'who_involved', 'contact_person', 'created_at'];
    const extraFields = {};
    const baseInteraction = { category };
    
    Object.keys(interaction).forEach(key => {
        let val = interaction[key];
        if ((key === 'discussion' || key === 'outcome') && val && typeof val === 'string' && val.trim()) {
            val = ensureTimestamp(val);
        }

        if (knownFields.includes(key)) {
            baseInteraction[key] = val;
        } else {
            extraFields[key] = val;
        }
    });
    
    if (Object.keys(extraFields).length > 0) {
        baseInteraction.point_of_contact = JSON.stringify(extraFields);
    }
    
    const { data, error } = await client
        .from('member_interactions')
        .insert(baseInteraction)
        .select()
        .single();
    
    if (error) {
        console.error('Error saving interaction:', error);
        return null;
    }
    
    // Unpack for the response
    if (data.point_of_contact && data.point_of_contact.startsWith('{')) {
        try {
            const extra = JSON.parse(data.point_of_contact);
            return { ...data, ...extra };
        } catch (e) {}
    }
    return data;
}

async function deleteInteraction(id) {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client
        .from('member_interactions')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting interaction:', error);
        return false;
    }
    return true;
}

// Reference Tables Logic
async function fetchCseaMembers() {
    const client = getSupabase();
    if (!client) return [];
    const { data } = await client.from('csea_members').select('*').order('full_name');
    return (data || []).map(m => ({ ...m, name: toTitleCase(m.full_name) }));
}

async function fetchHoursWorked(year) {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('hours_worked').select('*');
    // hours_worked table does not include fiscal_year in current schema
    const { data, error } = await query;
    if (error) {
        console.error('Error fetching hours_worked:', error);
        return [];
    }
    return (data || []).map(r => ({ ...r, name: toTitleCase(r.name) }));
}

async function fetchApprovalDates(year) {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('approval_dates').select('*');
    // approval_dates table does not include fiscal_year in current schema
    const { data, error } = await query;
    if (error) {
        console.error('Error fetching approval_dates:', error);
        return [];
    }
    return (data || []).map(r => ({ ...r, Name: toTitleCase(r.Name) }));
}

async function fetchPaylogSubmissions(year) {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('paylog submission').select('*');
    const { data, error } = await query;
    if (error) {
        console.warn('paylog submission table not found, using empty data');
        return [];
    }
    return (data || []).map(r => ({ ...r, name: toTitleCase(r['Employee Name'] || r.name) }));
}

async function fetchAllTrackingNames(year) {
    const client = getSupabase();
    if (!client) return [...DEFAULT_EMPLOYEES].sort();
    
    try {
        const [csea, hours, approvals, paylogs, attendance] = await Promise.all([
            client.from('csea_members').select('full_name'),
            client.from('hours_worked').select('name'),
            client.from('approval_dates').select('Name'),
            client.from('paylog submission').select('"Employee Name"'),
            client.from('attendance tracker').select('name')
        ]);

        const nameSet = new Set(DEFAULT_EMPLOYEES.map(toTitleCase));
        
        if (csea.data) csea.data.forEach(r => nameSet.add(toTitleCase(r.full_name || r.name)));
        if (hours.data) hours.data.forEach(r => nameSet.add(toTitleCase(r.name)));
        if (approvals.data) approvals.data.forEach(r => nameSet.add(toTitleCase(r.Name || r.name)));
        if (paylogs.data) paylogs.data.forEach(r => nameSet.add(toTitleCase(r['Employee Name'] || r.name)));
        if (attendance.data) attendance.data.forEach(r => nameSet.add(toTitleCase(r.name)));

        return [...nameSet].filter(n => n && n.trim()).sort();
    } catch (err) {
        console.error('Error fetching tracking names:', err);
        return [...DEFAULT_EMPLOYEES].sort();
    }
}

async function saveTrackingData(table, name, month, value, year) {
    const client = getSupabase();
    if (!client) return false;
    
    const actualTable = table === 'paylog_submission' ? 'paylog submission' : table;
    const isHours = actualTable === 'hours_worked';
    const isPaylog = actualTable === 'paylog submission';
    const isApproval = actualTable === 'approval_dates';
    const supportsFiscalYear = !['hours_worked', 'paylog submission', 'approval_dates'].includes(actualTable);
    
    let col = month;
    if (isHours) {
        col = month.toLowerCase().substring(0, 3);
        if (month.toLowerCase() === 'total') col = 'total';
    } else if (isPaylog) {
        // month passed is usually like 'jul' or 'July'
        const mPart = month.substring(0, 3);
        const capitalizedM = mPart.charAt(0).toUpperCase() + mPart.slice(1).toLowerCase();
        // Determine year based on month index if possible, but here we just have 'month' and 'year'
        // For paylog, we expect the caller to pass the full column name or we construct it
        if (!month.includes('202')) {
            const mIdx = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'].indexOf(capitalizedM);
            const colYear = mIdx !== -1 && mIdx < 6 ? year : year + 1;
            col = `${capitalizedM} ${colYear}`;
        }
    } else {
        col = month.substring(0, 3);
    }
    
    const nameCol = isPaylog ? 'Employee Name' : (isHours ? 'name' : 'Name');
    
    // 1. Try exact match first
    let query = client.from(actualTable).select('*').eq(nameCol, name);
    if (year && supportsFiscalYear) query = query.eq('fiscal_year', year);
    let { data: existingData, error: fetchError } = await query;

    // 2. If no exact match, try case-insensitive match (using ilike)
    if (!fetchError && (!existingData || existingData.length === 0)) {
        let ciQuery = client.from(actualTable).select('*').ilike(nameCol, name);
        if (year && supportsFiscalYear) ciQuery = ciQuery.eq('fiscal_year', year);
        const { data: ciData, error: ciError } = await ciQuery;
        if (!ciError && ciData && ciData.length > 0) {
            existingData = ciData;
        }
    }

    if (existingData && existingData.length > 0) {
        // Update the existing record (use the exact name from the DB to be safe)
        const dbName = existingData[0][nameCol];
        const updateObj = { [col]: value };
        if (year && supportsFiscalYear) updateObj.fiscal_year = year;
        
        let updateQuery = client.from(actualTable).update(updateObj).eq(nameCol, dbName);
        if (year && supportsFiscalYear) updateQuery = updateQuery.eq('fiscal_year', year);
        
        const { error: updateError } = await updateQuery;
        
        if (updateError) {
            console.error(`Error updating ${actualTable}:`, updateError);
            return false;
        }
    } else {
        // Insert new record
        const insertObj = { [nameCol]: name, [col]: value };
        if (year && supportsFiscalYear) insertObj.fiscal_year = year;
        
        const { error: insertError } = await client
            .from(actualTable)
            .insert(insertObj);
        
        if (insertError) {
            console.error(`Error inserting into ${actualTable}:`, insertError);
            return false;
        }
    }
    
    return true;
}

async function fetchCseaStewards() {
    const client = getSupabase();
    if (!client) return [];
    const { data } = await client.from('csea_stewards').select('*').order('name');
    return (data || []).map(m => ({ ...m, name: toTitleCase(m.name) }));
}

async function fetchCseaIssues() {
    const client = getSupabase();
    if (!client) return [];
    
    // Combine logic: Get unique discussion topics from member_interactions
    const { data, error } = await client
        .from('member_interactions')
        .select('discussion')
        .not('discussion', 'is', null)
        .order('discussion');
    
    if (error) {
        console.error('Error fetching issues from interactions:', error);
        return [];
    }
    
    // Filter for unique, non-empty values and map to issue_name format
    const uniqueDiscussions = [...new Set(data.map(i => toTitleCase(i.discussion.trim())))]
        .filter(d => d.length > 0)
        .map(d => ({ issue_name: d }));
        
    return uniqueDiscussions;
}

async function fetchSchoolDirectory() {
    const client = getSupabase();
    if (!client) return [];
    const { data } = await client.from('school_directory').select('*').order('site_name');
    return (data || []).map(s => ({ ...s, site_name: toTitleCase(s.site_name) }));
}

function toTitleCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => {
        let processed = word;
        if (processed.includes('-')) {
            processed = processed.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
        }
        if (processed.includes("'")) {
            processed = processed.split("'").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("'");
        }
        if (!word.includes('-') && !word.includes("'")) {
            processed = processed.charAt(0).toUpperCase() + processed.slice(1);
        }
        return processed;
    }).join(' ');
}

function updateNavigationLinks(date) {
    if (!date) return;
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const internalPages = [
        'index.html',
        'work-planner.html',
        'planner.html',
        'csea.html',
        'financial.html',
        'hoa.html',
        'planning.html',
        'monthly-review.html',
        'check-breakdown.html',
        'icaap-attendance.html',
        'mantra.html',
        'personal-goals.html'
    ];

    const categoryMapping = {
        'financial.html': 'Budget',
        'monthly-review.html': 'Monthly-Review',
        'icaap-attendance.html': 'ICAAP-Attendance',
        'csea.html': 'CSEA',
        'hoa.html': 'HOA',
        'mantra.html': 'Mantra',
        'personal-goals.html': 'Goals',
        'planning.html': 'Planning',
        'work-planner.html': 'Work-Planner',
        'personal-planner.html': 'Personal-Planner'
    };

    document.querySelectorAll('a.nav-link, a.nav-btn, a.tracking-pill, a.tracking-link, a.section-icon, a.section-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            let base = href.split('?')[0];
            let targetUrl = base;
            let params = new URLSearchParams(href.split('?')[1] || '');
            
            // If it was pointing to personal-planner.html, point to index.html instead
            if (base === 'personal-planner.html') {
                targetUrl = 'index.html';
                base = 'index.html';
            }

            // Do not put date in URL as per user request
            if (params.has('date')) {
                params.delete('date');
            }
            
            if (params.toString()) {
                link.href = `${targetUrl}?${params.toString()}`;
            } else {
                link.href = targetUrl;
            }
        }
    });
}

async function fetchFinancialBills() {
    const client = getSupabase();
    if (!client) return DEFAULT_BILLS;
    const { data, error } = await client.from('financial_bills').select('*').order('id');
    if (error || !data || data.length === 0) {
        console.error('Error fetching financial bills or empty, using defaults:', error);
        return DEFAULT_BILLS;
    }
    return data;
}

async function updateFinancialBill(id, field, value) {
    const client = getSupabase();
    if (!client) return false;
    
    const updateData = {};
    updateData[field] = value;
    
    const { error } = await client
        .from('financial_bills')
        .update(updateData)
        .eq('id', id);
        
    if (error) {
        console.error('Error updating financial bill:', error);
        return false;
    }
    return true;
}

// Global initialization if needed
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    const today = new Date().toISOString().split('T')[0];
    
    if (dateParam) {
        updateNavigationLinks(dateParam);
    } else {
        // If no date, update links with today's date
        updateNavigationLinks(today);
    }
});
