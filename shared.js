const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';

const DEFAULT_EMPLOYEES = [
    "Adalid Sanchez Rodriguez", "Adan Saucedo", "Adrian Irvine", "Adriana Gomez",
    "Adriana Ojeda", "Agnes Lewis", "Alberto Solorzano", "Alexander Aston",
    "Alexis Contreras", "Alice Hilal", "Alicia Cerna", "Aline Millan",
    "Alyson Han", "Amber Mastroianni", "Amber Trudgeon", "Amber Wilton",
    "Ameel Noos", "Amparo Martin", "Ana Guevara", "Ancelmo Ramos",
    "Andrea Chagoya", "Andrea Douglas", "Andreina Morales", "Angel Gamino",
    "Angela Lopez", "Anna Quezada", "Anthony Bernard", "Anthony Morales",
    "Anthony Zarate", "Antoinette Matiga", "Araksya Manukyan", "Avia Greene-Vanburen",
    "Aya Shigenaga", "Baharak Saadat Beheshti", "Barbara Stoliker", "Barry Blisten",
    "Beatris Segura", "Bennett Winter", "Bernice Grewell-Godinez", "Beverly Junio-Magee",
    "Bienvenido Pineda", "Brigette Pena", "Carmen Fuentes", "Cassondra Holt Hightower",
    "Cecille Basilio", "Charles Izuakor", "Cherie Lebron", "Chevon Booker",
    "Chinedu Ezeh", "Christa Mcmullin", "Christina Clark", "Christina Silva",
    "Christina Sithole", "Christine Choi", "Christopher Linares", "Claire Daigle",
    "Claudia Franco", "Connie Gracia-Barraza", "Crystal Cohen", "Crystal Mendez",
    "Crystal Rivera", "Cynthia Barrilleaux", "Cynthia Bitterman", "Cynthia Timm",
    "D.M. Grant", "Dalese Hardin", "Dana Fikes", "Daniel Saldana",
    "Danielle O'Connor", "David Hadjichristodoulou", "Dawn Sebastian", "Dawnise Francisco",
    "Deanna Baldwin", "Debora Wechsler", "Deborah Francois", "Diana Olivas",
    "Dominique Harris", "Dora Marquez", "Douglas Klaif", "Douglas Reisgen",
    "Dulce Bacon", "Eberardo Rodriguez", "Edith Braswell-Grant", "Edith Janec",
    "Efren Rodriguez", "Eileen Alcorn", "Eimi Miller", "Elisabeth Mullins Medina",
    "Elizabeth Chavez", "Elizabeth Elizalde", "Elizabeth Romero", "Emilee Velazco Franco",
    "Emily Wassler", "Emir Gonzalez", "Enas Makar", "Eric Hopson",
    "Erica Pan", "Erica Sanchez", "Erika Paz", "Erin Mettlen",
    "Ester Yang", "Evelyn Mcfarlane", "Farhad Mahmud", "Frances Morales",
    "Freshta Sidiqi", "Gavriela Trujillo", "Gene Dean", "Genesis Aguirre",
    "Gina Go", "Gladys Barbosa", "Glenda Tamay", "Guillermo Diaz",
    "Gustavo Lopez", "Hamilton Gernon-Wyatt", "Hector Martinez", "Hina Ahmad",
    "Ida Quijada", "Iliana Quintero", "Indira Ortiz", "Irma Griffiths",
    "Irma Salas", "Irma Torres", "Isidro Castillo", "Ivy Grace Thorne",
    "Jacqueline Cruz", "Jacqueline Palacios", "Jakeisha Sanders", "Jamall Farr",
    "Janet Frnzyan", "Janet Ledesma", "Jasmin Segovia", "Javier Ponce Garcia",
    "Jeanine Flier", "Jeanne Garcia-Armstrong", "Jeen Yu", "Jehisol Urbina",
    "Jennifer Lopez", "Jennifer Washington", "Jenny Peterson", "Jereme Stark",
    "Jhun De Guzman", "Jiabei Li", "Jittima Bouillot", "John Kuykendall",
    "Jordan Baldry", "Jordan Gonzalez", "Jorge Torres", "Jose Alvarenga",
    "Jose Hernandez", "Jose Romero", "Joseph Thomas", "Joseph Zeccola",
    "Joshua Griffiths", "Joy Kasper", "Juan Catalan", "Juan Pina",
    "Julia Calamandrei", "Julian Mendez", "Julianne Fassett", "Julie Ann Resurreccion",
    "Julie Sornberger", "Karen Caruso", "Karen Siercke Noriega", "Karina Maravilla",
    "Karsina Gaither", "Kelsie Hogen", "Kelvin Means", "Kerry Shimizu",
    "Kevin Seegan", "Kimberly Rabas", "Kionna Hawkins", "Kristalyn Smith",
    "Kristine Adams", "Kristy Beaudry", "La Tresha Glasco", "Ladan Dejam",
    "Lailani Joy Gonzaga", "Lanette Black", "Laura Incelli", "Laveda Harris",
    "Lawrence Ramos", "Leslie Anderson", "Leslie Black", "Leslie Perez",
    "Leslie Zamora", "Leticia Gudino", "Leticia Martinez", "Liberty Amos",
    "Lila Rosas Madrigal", "Liliana Amezcua", "Liliana Jauregui-George", "Liliana Martinez",
    "Lilit Akilian", "Linda Hoang", "Linda Santana", "Linda Taylor",
    "Lisa Darbidian", "Lisa Harvey", "Lisa Marks", "Louise Cummings",
    "Luciano Latini", "Lucrecia Yescas Luna", "Ma Joanna Razon", "Ma Teresa Aki",
    "Maeli Montecinos", "Maikai Finnell", "Malika Ferrell", "Malina Rios",
    "Mandana Saidi", "Maria Aldave Cabrera", "Maria Hernandez", "Maria Pinto",
    "Maria Zamora", "Marianne Valencia", "Marie Bennett", "Marissa Gilmore",
    "Marites Felicilda", "Mark Todd", "Marla Pizzuto", "Marlene Yu",
    "Marta Martin", "Mary Jane Opoku", "Matthew Miller", "Mayra Alcantar",
    "Mayra Rodarte-Nava", "Melanie Ronning", "Melinda Duran", "Michael Juarez",
    "Michelle Lopez", "Miguel Agredano", "Miisha Davis", "Miriam Oguejiofor",
    "Nancy Madrid", "Naomi Kaidin", "Nayeli Meza Amaral", "Neta Markusfeld",
    "Nicole Douglass", "Nicoli Ueda", "Nora Watanabe", "Nune Mc Combs",
    "Oscar Montenegro", "Palma Scirone", "Paola Martinez", "Patricia Castillo",
    "Patricia Chavez", "Patrick Navas", "Paula Dominguez", "Paulette Duarte",
    "Paulette Shelley", "Pedro Aguilar", "Praveen Ray", "Ralph Bravo",
    "Rana Khan", "Raquel Huerta", "Rebeca Chaidez", "Rene Gaudet",
    "Rhory Rebellon", "Richard Lee", "Rick Swanson", "Robert Jones",
    "Robert Moose", "Robin Aaron", "Rodolfo Gutierrez", "Rosalina Pacheco",
    "Rosalyn Lee", "Rosanna Davisson", "Rosemarie Fagfoomsintu", "Ross Kramer",
    "Ruth Rendon", "Ryan Boyes", "Sabrina Sheikh", "Sabrina Sullivan",
    "Sallyann Tejeda", "Salvador Magana-Arriola", "Sandra Canela", "Sandra Hernandez",
    "Sandra Meredith", "Sandra Mijarez", "Sandra Valdivia", "Sandy Estrada",
    "Sandy Walker", "Sara Goico Alcantar", "Scott Cody", "Senisa Austin",
    "Shannon Moultrie", "Shannon Sayer", "Sharon Maculada", "Shawn Hall",
    "Sherita Rogers", "Sheveeta Jackson", "Silvia Ramos", "Silvia Sanchez",
    "Sofia Manzo-Reyes", "Sofia Vasserman", "Stacey Byham", "Stacey Williams",
    "Staci Holmes", "Stacy Orosco", "Stephanie Harlow", "Stephen Maccarone",
    "Steven Vitela", "Suhjung Ko", "Susan Deloach", "Susan Nolan",
    "Susana Mislang", "Susana Santa Cruz", "Susanna Garcia", "Tacy Schull",
    "Tamryn Wilkins", "Tanya Acosta", "Tarah Bagadiong-Trice", "Tatianika Montalbo",
    "Tiffanie Griffin", "Tiffany Vojkovich", "Toby Sperber", "Tonya Boyd",
    "Tonya Thompson", "Troy Poe", "Valerie De La Rosa", "Valerie Hoggard",
    "Vanessa Sandoval", "Veganush Frnzyan", "Veronica Arevalo", "Veronica Rodriguez Sifontes",
    "Veronica Viramontes", "Victor Castaneda", "Victoria Maldonado", "Wendy Jasso",
    "Wendy Marrero", "Wendy Mora", "Xiaowei Wei", "Yasmin Lilly",
    "Yesenia Duran", "Yesenia Enriquez", "Yolanda Hashimoto", "Young Choy",
    "Yuriko Jung", "Zarui Grigoryan", "Zina Dixon"
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
            --sidebar-width: 120px;
            --header-height: 50px;
            --primary-navy: #00326b;
            --accent-gold: #c5a059;
            --bg-light: #f5f7fa;
            --text-dark: #333;
            --border-color: #d1d1d1;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: var(--bg-light);
            display: flex;
            height: 100vh;
            overflow: hidden;
        }

        .dashboard-container {
            display: flex;
            width: 100%;
            height: 100%;
        }

        /* Sidebar - Right Side */
        .dashboard-sidebar {
            width: var(--sidebar-width);
            background: var(--primary-navy);
            display: flex;
            flex-direction: column;
            padding: 20px 0;
            gap: 10px;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            order: 2; /* Move to right side */
        }

        .sidebar-item {
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            padding: 15px 10px;
            text-align: center;
            font-size: 8.5pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.2s;
            border-left: 4px solid transparent;
        }

        .sidebar-item:hover {
            color: #fff;
            background: rgba(255,255,255,0.05);
        }

        .sidebar-item.active {
            color: #fff;
            background: rgba(255,255,255,0.1);
            border-left: 4px solid var(--accent-gold);
        }

        /* Main Content Area */
        .dashboard-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            order: 1;
        }

        .dashboard-header {
            height: var(--header-height);
            background: #fff;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 30px;
            z-index: 10;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .header-title {
            font-size: 14pt;
            font-weight: 700;
            color: var(--primary-navy);
            margin: 0;
            letter-spacing: 1px;
        }

        .header-nav-btn {
            background: #f0f0f0;
            border: 1px solid var(--border-color);
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 9pt;
            font-weight: 600;
            color: var(--text-dark);
            transition: all 0.2s;
        }

        .header-nav-btn:hover {
            background: #e0e0e0;
        }

        .dashboard-body {
            flex: 1;
            overflow-y: auto;
            padding: 30px;
            background: var(--bg-light);
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
            .dashboard-sidebar { width: 70px; }
            .sidebar-item { font-size: 7pt; padding: 10px 5px; }
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

        const bodyContent = document.body.innerHTML;
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const urlParams = new URLSearchParams(window.location.search);
        const dateStr = urlParams.get('date') || new Date().toISOString().split('T')[0];
        const category = urlParams.get('category');

        // Create Navigation Links
        const navItems = [
            { label: 'Home', path: 'index.html', icon: '🏠' },
            { label: 'HOA', path: 'planner.html?category=HOA', cat: 'HOA' },
            { label: 'CSEA', path: 'planner.html?category=CSEA', cat: 'CSEA' },
            { label: 'ICAAP', path: 'icaap.html', cat: 'ICAAP' },
            { label: 'Finance', path: 'planner.html?category=Budget', cat: 'Budget' },
            { label: 'Planning', path: 'planner.html?category=Intentions', cat: 'Intentions' }
        ];

        const sidebarHtml = navItems.map(item => {
            const isActive = currentPath === item.path.split('?')[0] && (!item.cat || category === item.cat);
            return `<a href="${item.path}" class="sidebar-item ${isActive ? 'active' : ''}">${item.label}</a>`;
        }).join('');

        document.body.innerHTML = `
            <div class="dashboard-container">
                <main class="dashboard-main">
                    <header class="dashboard-header">
                        <div class="header-left">
                            <h1 class="header-title">PLANNER 2026</h1>
                            <button class="header-nav-btn" onclick="window.location.href='index.html?date=${dateStr}'">Today</button>
                        </div>
                        <div class="header-right">
                            <input type="date" value="${dateStr}" id="global-date-picker" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
                        </div>
                    </header>
                    <div class="dashboard-body">
                        ${bodyContent}
                    </div>
                </main>
                <aside class="dashboard-sidebar">
                    ${sidebarHtml}
                    <div style="flex-grow: 1;"></div>
                    <a href="#" onclick="logout(); return false;" class="sidebar-item" style="opacity: 0.6;">Logout</a>
                </aside>
            </div>
        `;

        // Handle Date Picker
        const datePicker = document.getElementById('global-date-picker');
        if (datePicker) {
            datePicker.addEventListener('change', (e) => {
                const newDate = e.target.value;
                const params = new URLSearchParams(window.location.search);
                params.set('date', newDate);
                window.location.href = `${window.location.pathname}?${params.toString()}`;
            });
        }

        // Update all links to preserve date
        updateNavigationLinks(dateStr);
    });
})();

async function savePlannerData(date, fieldId, content) {
    const client = getSupabase();
    if (!client) return false;

    // Apply timestamp for text entries, skip for numeric/empty/checkmarks
    let finalValue = content;
    const isNumeric = !isNaN(parseFloat(content)) && isFinite(content);
    const isCheckmark = content === 'true' || content === 'false';
    if (content && content.trim() && !isNumeric && !isCheckmark) {
        finalValue = ensureTimestamp(content);
    }

    // Manual upsert: delete existing then insert
    try {
        await client
            .from('work_planner_edits')
            .delete()
            .eq('date_key', date)
            .eq('slot_key', fieldId);

        const { error } = await client
            .from('work_planner_edits')
            .insert({ 
                date_key: date, 
                slot_key: fieldId, 
                value: finalValue,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Save error:', error);
            return null;
        }
        return finalValue;
    } catch (err) {
        console.error('Unexpected save error:', err);
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
    
    // Merge events, prioritizing DB events if there's a title/time collision? 
    // For now, just combine them.
    return [...dbEvents, ...hardcodedEvents];
}

function getCalendarEvents() {
    return [
        { date: '2026-01-26', time: '17:30', title: 'Chapter 500 Monthly', duration: 120 },
        { date: '2026-01-26', time: '19:00', title: 'LA Fed', duration: 60 },
        { date: '2026-02-06', time: '09:30', title: 'CSEA Reopener Negotiations', duration: 420 }
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
        .update({ content: finalContent, updated_at: new Date().toISOString() })
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
    // Handle YYYY-MM-DD by splitting to avoid timezone shifts
    const parts = dateStr.split('-');
    let date;
    if (parts.length === 3) {
        date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
        date = new Date(dateStr);
    }
    
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
    if (year) query = query.eq('fiscal_year', year);
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
    if (year) query = query.eq('fiscal_year', year);
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
    let query = client.from('paylog_submission').select('*');
    if (year) query = query.eq('fiscal_year', year);
    const { data, error } = await query;
    if (error) {
        // Fallback if table doesn't exist yet
        console.warn('paylog_submission table not found, using empty data');
        return [];
    }
    return (data || []).map(r => ({ ...r, name: toTitleCase(r.name) }));
}

async function fetchAllTrackingNames(year) {
    const [hours, approvals, paylogs] = await Promise.all([
        fetchHoursWorked(year).catch(() => []),
        fetchApprovalDates(year).catch(() => []),
        fetchPaylogSubmissions(year).catch(() => [])
    ]);
    
    const names = new Set();
    hours.forEach(r => { if (r.name) names.add(toTitleCase(r.name)); });
    approvals.forEach(r => { if (r.Name) names.add(toTitleCase(r.Name)); });
    paylogs.forEach(r => { if (r.name) names.add(toTitleCase(r.name)); });
    
    return [...names].sort();
}

async function saveTrackingData(table, name, month, value, year) {
    const client = getSupabase();
    if (!client) return false;
    
    // Normalize month: lowercase for hours_worked and paylog_submission, Capitalized for others
    let col = (table === 'hours_worked' || table === 'paylog_submission') ? month.toLowerCase().substring(0, 3) : month.substring(0, 3);
    
    // Override for 'total' column in hours_worked
    if (table === 'hours_worked' && month.toLowerCase() === 'total') {
        col = 'total';
    }
    
    const nameCol = (table === 'hours_worked' || table === 'paylog_submission') ? 'name' : 'Name';
    
    // 1. Try exact match first
    let query = client.from(table).select('*').eq(nameCol, name);
    if (year) query = query.eq('fiscal_year', year);
    let { data: existingData, error: fetchError } = await query;

    // 2. If no exact match, try case-insensitive match (using ilike)
    if (!fetchError && (!existingData || existingData.length === 0)) {
        let ciQuery = client.from(table).select('*').ilike(nameCol, name);
        if (year) ciQuery = ciQuery.eq('fiscal_year', year);
        const { data: ciData, error: ciError } = await ciQuery;
        if (!ciError && ciData && ciData.length > 0) {
            existingData = ciData;
        }
    }

    if (existingData && existingData.length > 0) {
        // Update the existing record (use the exact name from the DB to be safe)
        const dbName = existingData[0][nameCol];
        const updateObj = { [col]: value };
        if (year) updateObj.fiscal_year = year;
        
        let updateQuery = client.from(table).update(updateObj).eq(nameCol, dbName);
        if (year) updateQuery = updateQuery.eq('fiscal_year', year);
        
        const { error: updateError } = await updateQuery;
        
        if (updateError) {
            console.error(`Error updating ${table}:`, updateError);
            return false;
        }
    } else {
        // Insert new record
        const insertObj = { [nameCol]: name, [col]: value };
        if (year) insertObj.fiscal_year = year;
        
        const { error: insertError } = await client
            .from(table)
            .insert(insertObj);
        
        if (insertError) {
            console.error(`Error inserting into ${table}:`, insertError);
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
        'personal-planner.html',
        'planner.html',
        'csea.html',
        'financial.html',
        'hoa.html',
        'icaap.html',
        'planning.html',
        'monthly-review.html',
        'check-breakdown.html',
        'icaap-tracking.html',
        'icaap-attendance.html',
        'mantra.html',
        'personal-goals.html'
    ];

    const categoryMapping = {
        'financial.html': 'Budget',
        'monthly-review.html': 'Monthly-Review',
        'icaap-tracking.html': 'ICAAP-Tracking',
        'icaap-attendance.html': 'ICAAP-Attendance',
        'csea.html': 'CSEA',
        'hoa.html': 'HOA',
        'mantra.html': 'Mantra',
        'personal-goals.html': 'Goals',
        'planning.html': 'Intentions',
        'work-planner.html': 'Work-Planner',
        'personal-planner.html': 'Personal-Planner'
    };

    document.querySelectorAll('a.nav-link, a.nav-btn, a.tracking-pill, a.tracking-link, a.section-icon').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            let base = href.split('?')[0];
            let targetUrl = base;
            let params = new URLSearchParams(href.split('?')[1] || '');
            
            if (categoryMapping[base]) {
                targetUrl = 'planner.html';
                params.set('category', categoryMapping[base]);
            }
            
            if (internalPages.includes(base) || base === 'planner.html') {
                params.set('date', dateStr);
                link.href = `${targetUrl}?${params.toString()}`;
            }
        }
    });
}

async function fetchFinancialBills() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('financial_bills').select('*').order('id');
    if (error) {
        console.error('Error fetching financial bills:', error);
        return [];
    }
    return data || [];
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
