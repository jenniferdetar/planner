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
    { id: 4, cat: 'Bill', item: 'Edison', amt: '$150', class: 'row-bill' },
    { id: 5, cat: 'Bill', item: 'Gas Company', amt: '$50', class: 'row-bill' },
    { id: 6, cat: 'Bill', item: 'Spectrum', amt: '$85', class: 'row-bill' },
    { id: 7, cat: 'Bill', item: 'Water/Trash', amt: '$120', class: 'row-bill' },
    { id: 8, cat: 'Cash', item: 'Blow Cash Jennifer', amt: '$200', class: 'row-cash' },
    { id: 9, cat: 'Cash', item: 'Blow Cash Stephen', amt: '$200', class: 'row-cash' },
    { id: 10, cat: 'CC', item: 'Amazon Visa', amt: '$500', class: 'row-cc' },
    { id: 11, cat: 'CC', item: 'Citibank Visa', amt: '$300', class: 'row-cc' },
    { id: 12, cat: 'CC', item: 'Southwest Visa', amt: '$200', class: 'row-cc' },
    { id: 13, cat: 'Housing', item: 'Mortgage', amt: '$2,500', class: 'row-housing' },
    { id: 14, cat: 'Savings', item: 'Emergency Fund', amt: '$500', class: 'row-savings' }
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
async function requireAuth() {
    const client = getSupabase();
    if (!client) return;

    const { data: { session } } = await client.auth.getSession();
    if (!session) {
        // If on login.html, don't redirect
        if (!window.location.pathname.endsWith('login.html')) {
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

// Global Auth Check
if (typeof window !== 'undefined' && !window.location.pathname.endsWith('login.html')) {
    requireAuth();
}

// Planner Data Logic
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
function animateAndNavigate(event, url) {
    if (event) event.preventDefault();
    const container = document.getElementById('main-content-container') || 
                      document.querySelector('.main-container') || 
                      document.querySelector('.main-content') || 
                      document.querySelector('.notebook-main') ||
                      document.querySelector('.app-container');
    
    if (container) {
        container.classList.remove('flip-in');
        container.classList.add('flip-out');
        setTimeout(() => {
            window.location.href = url;
        }, 600);
    } else {
        window.location.href = url;
    }
}

// Inject Flip Styles & Handle Auto-Navigation
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes flip-in {
            0% { transform: perspective(2000px) rotateY(90deg); opacity: 0; }
            100% { transform: perspective(2000px) rotateY(0deg); opacity: 1; }
        }
        @keyframes flip-out {
            0% { transform: perspective(2000px) rotateY(0deg); opacity: 1; }
            100% { transform: perspective(2000px) rotateY(-90deg); opacity: 0; }
        }
        .main-container, .main-content, .notebook-main, .content-pane, .app-container, .planner-container {
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s linear;
            transform-origin: center center;
            backface-visibility: hidden;
            perspective: 2000px;
        }
        .flip-in {
            animation: flip-in 0.6s ease-out forwards !important;
        }
        .flip-out {
            animation: flip-out 0.6s ease-in forwards !important;
        }

        /* Global Planner Layout Styles */
        :root {
            --app-bg: #1a1a1a;
            --sidebar-bg: #262626;
            --content-bg: #fdfdfd;
            --accent-color: #4a3427;
        }
        .app-container {
            display: flex;
            width: 100vw;
            height: 100vh;
            position: relative;
            background: var(--app-bg);
        }
        .main-content {
            flex: 1;
            display: flex;
            gap: 0;
            background: var(--sidebar-bg);
            padding: 5px;
            overflow: hidden;
        }
        .view-pane {
            flex: 1;
            background: var(--content-bg);
            margin: 2px;
            padding: 20px;
            overflow-y: auto;
            position: relative;
            border-radius: 4px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .tabs-sidebar {
            width: 120px;
            background: var(--sidebar-bg);
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 10px 0;
            z-index: 100;
            border-left: 1px solid #333;
        }
        .tab {
            padding: 25px 10px;
            color: #aaa;
            font-size: 10pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            cursor: pointer;
            transition: all 0.2s;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            text-align: center;
            border-left: 4px solid transparent;
            text-decoration: none;
            display: block;
        }
        .tab:hover {
            color: #fff;
            background: #333;
        }
        .tab.active {
            background: var(--content-bg);
            color: var(--accent-color);
            border-left: 4px solid var(--accent-color);
        }
        .logout-btn {
            padding: 15px;
            font-size: 8pt;
            color: #666;
            cursor: pointer;
            text-align: center;
            margin-top: auto;
            border-top: 1px solid #333;
        }
        .logout-btn:hover {
            color: #fff;
            background: #c0392b;
        }
    `;
    document.head.appendChild(style);

    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('main-content-container') || 
                          document.querySelector('.main-container') || 
                          document.querySelector('.main-content') || 
                          document.querySelector('.notebook-main') ||
                          document.querySelector('.app-container') ||
                          document.querySelector('.planner-container');
        if (container) {
            container.classList.add('flip-in');
        }

        // Auto-initialize Navigation Sidebar if app-container exists
        const appContainer = document.querySelector('.app-container') || document.querySelector('.notebook-container');
        if (appContainer && !document.querySelector('.tabs-sidebar')) {
            const sidebar = document.createElement('div');
            sidebar.className = 'tabs-sidebar';
            
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category') || '';
            const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
            
            sidebar.innerHTML = `
                <div class="tab ${isIndex ? 'active' : ''}" onclick="animateAndNavigate(event, 'index.html')">HOME</div>
                <div class="tab ${category === 'HOA' ? 'active' : ''}" onclick="animateAndNavigate(event, 'planner.html?category=HOA')">HOA</div>
                <div class="tab ${category === 'CSEA' ? 'active' : ''}" onclick="animateAndNavigate(event, 'planner.html?category=CSEA')">CSEA</div>
                <div class="tab ${category === 'iCAAP' ? 'active' : ''}" onclick="animateAndNavigate(event, 'planner.html?category=iCAAP')">ICAAP</div>
                <div class="tab ${category === 'Finance' ? 'active' : ''}" onclick="animateAndNavigate(event, 'planner.html?category=Finance')">FINANCE</div>
                <div class="tab ${category === 'Planning' ? 'active' : ''}" onclick="animateAndNavigate(event, 'planner.html?category=Planning')">PLAN</div>
                <div class="logout-btn" onclick="animateAndNavigate(event, 'index.html')">🏠 Home</div>
                <div class="logout-btn" onclick="logout()">🚪 Logout</div>
            `;
            appContainer.appendChild(sidebar);

            // If we found a sidebar, ensure we remove any old sidebars
            const oldSidebar = document.querySelector('.section-sidebar');
            if (oldSidebar) oldSidebar.remove();
        }
    });

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href && !link.target && !link.getAttribute('onclick') && 
            link.hostname === window.location.hostname && !link.href.includes('#')) {
            
            // Check if it's a navigation element
            const isNav = link.closest('.sidebar') || 
                          link.closest('.tabs') || 
                          link.closest('.navigation') ||
                          link.closest('.nav-buttons') ||
                          link.classList.contains('section-icon') || 
                          link.classList.contains('nav-btn') || 
                          link.classList.contains('sidebar-link') ||
                          link.classList.contains('tab') ||
                          link.classList.contains('pill');
            
            if (isNav) {
                animateAndNavigate(e, link.href);
            }
        }
    });
})();

async function savePlannerData(date, fieldId, content) {
    const client = getSupabase();
    if (!client) return false;

    // Manual upsert: delete existing then insert
    // Since we don't have a unique constraint, this prevents duplicates
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
                value: content,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Save error:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Unexpected save error:', err);
        return false;
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
        { date: '2026-01-27', time: '14:00', title: 'LA 500 Negotiations Prep', duration: 90 },
        { date: '2026-01-28', time: '12:30', title: 'CSEA Reopener Negotiations', duration: 240 },
        { date: '2026-02-06', time: '09:30', title: 'CSEA Reopener Negotiations', duration: 420 }
    ];
}

// Notes Logic
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
    const { data, error } = await client
        .from('category_entries')
        .insert({ category, content })
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
    const { error } = await client
        .from('category_entries')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id);
    
    if (error) {
        console.error('Error updating entry:', error);
        return false;
    }
    return true;
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
        if (knownFields.includes(key)) {
            baseInteraction[key] = interaction[key];
        } else {
            extraFields[key] = interaction[key];
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
    const hours = await fetchHoursWorked(year);
    const approvals = await fetchApprovalDates(year);
    const paylogs = await fetchPaylogSubmissions(year);
    
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
        'icaap.html': 'iCAAP',
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
