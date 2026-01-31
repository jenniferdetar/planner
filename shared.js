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

function setGlobalHeaderTitle(title) {
    const el = document.getElementById('global-header-title');
    if (el) el.innerText = title;
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
function animateAndNavigate(event, url, direction = 'next') {
    if (event) event.preventDefault();
    
    // Target specific panes for half-page turn
    const panes = document.querySelectorAll('.view-pane');
    const targetPane = (direction === 'next') ? panes[panes.length - 1] : panes[0];
    
    if (targetPane) {
        targetPane.classList.remove('flip-in-next', 'flip-in-prev');
        targetPane.classList.add(`flip-out-${direction}`);
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
        @keyframes flip-in-next {
            0% { transform: perspective(2500px) rotateY(90deg); opacity: 0; }
            100% { transform: perspective(2500px) rotateY(0deg); opacity: 1; }
        }
        @keyframes flip-out-next {
            0% { transform: perspective(2500px) rotateY(0deg); opacity: 1; }
            100% { transform: perspective(2500px) rotateY(-180deg); opacity: 0; }
        }
        @keyframes flip-in-prev {
            0% { transform: perspective(2500px) rotateY(-90deg); opacity: 0; }
            100% { transform: perspective(2500px) rotateY(0deg); opacity: 1; }
        }
        @keyframes flip-out-prev {
            0% { transform: perspective(2500px) rotateY(0deg); opacity: 1; }
            100% { transform: perspective(2500px) rotateY(180deg); opacity: 0; }
        }

        .view-pane {
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s linear;
            backface-visibility: hidden;
            perspective: 2500px;
        }

        .flip-in-next {
            animation: flip-in-next 0.6s ease-out forwards !important;
            transform-origin: left center !important;
        }
        .flip-out-next {
            animation: flip-out-next 0.6s ease-in forwards !important;
            transform-origin: left center !important;
            z-index: 20;
        }
        .flip-in-prev {
            animation: flip-in-prev 0.6s ease-out forwards !important;
            transform-origin: right center !important;
        }
        .flip-out-prev {
            animation: flip-out-prev 0.6s ease-in forwards !important;
            transform-origin: right center !important;
            z-index: 20;
        }

        /* Global Planner Layout Styles */
        :root {
            --app-bg: #1a1a1a;
            --sidebar-bg: #262626;
            --content-bg: #fdfdfd;
            --accent-color: #4a3427;
            --sun-bg: #ff5252;
            --mon-bg: #fb8c00;
            --tue-bg: #00acc1;
            --wed-bg: #3949ab;
            --thu-bg: #e91e63;
            --fri-bg: #fdd835;
            --sat-bg: #00897b;
            --border-color: #2f4f4f;
        }
        .app-container {
            display: flex;
            flex-direction: column;
            width: 100vw;
            height: 100vh;
            position: relative;
            background: var(--app-bg);
            overflow: hidden;
        }
        .app-main {
            display: flex;
            flex: 1;
            width: 100%;
            overflow: hidden;
            position: relative;
        }
        .header-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2px 0;
            height: 24px;
            gap: 20px;
            width: 100%;
            background: #1a1a1a;
            border-bottom: 1px solid #333;
            z-index: 1000;
            flex-shrink: 0;
        }
        .header-title {
            font-size: 10pt;
            letter-spacing: 4px;
            color: #fff;
            margin: 0;
            text-transform: uppercase;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-weight: 700;
        }
        .nav-btn-header {
            background: transparent;
            border: 1px solid #444;
            color: #aaa;
            padding: 2px 8px;
            cursor: pointer;
            font-size: 8pt;
            border-radius: 4px;
            text-transform: uppercase;
            transition: all 0.2s;
        }
        .nav-btn-header:hover {
            border-color: #666;
            color: #fff;
            background: rgba(255,255,255,0.05);
        }
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--sidebar-bg);
            padding: 0;
            overflow: hidden; /* Prevent scrolling on container to keep spine fixed */
            position: relative;
            min-height: 100%;
        }
        .notebook-spread {
            display: flex;
            flex: 1;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            position: relative;
            gap: 0;
            padding: 5px;
            box-sizing: border-box;
        }
        .main-content::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 30px;
            transform: translateX(-50%);
            background: linear-gradient(90deg, 
                rgba(0,0,0,0.2) 0%, 
                rgba(255,255,255,0.3) 50%, 
                rgba(0,0,0,0.2) 100%);
            pointer-events: none;
            z-index: 100;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
        }
        .main-content::before {
            display: none; /* Removed pseudo-element implementation */
        }
        .binder-rings {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            width: 30px;
            z-index: 101;
            pointer-events: none;
            padding: 30px 0;
        }
        .ring {
            width: 20px;
            height: 20px;
            border: 2px solid #ccc;
            border-radius: 50%;
            background: #eee;
            box-shadow: 1px 1px 3px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.8);
            position: relative;
        }
        .ring::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 14px;
            height: 2px;
            background: #888;
            border-radius: 1px;
        }
        .view-pane {
            flex: 1;
            background: var(--content-bg);
            margin: 2px;
            padding: 20px 30px;
            overflow-y: auto;
            position: relative;
            border-radius: 4px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            min-height: 100%;
        }
        .view-pane:first-child {
            padding-right: 60px;
        }
        .view-pane:last-child {
            padding-left: 60px;
        }
        .tabs-sidebar {
            width: 100px;
            background: var(--sidebar-bg);
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 10px 0;
            z-index: 100;
            border-left: 1px solid #333;
        }
        .tab {
            padding: 20px 5px;
            color: var(--tab-text-color, #fff);
            background: var(--tab-color, #444);
            font-size: 11pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            cursor: pointer;
            transition: all 0.2s;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            text-align: center;
            border-left: 4px solid transparent;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid rgba(0,0,0,0.2);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .tab:hover {
            filter: brightness(1.2);
            padding-left: 8px;
        }
        .tab.active {
            background: var(--tab-color, var(--accent-color));
            color: var(--tab-text-color, #fff);
            border-left: 6px solid #fff;
            box-shadow: -4px 0 10px rgba(0,0,0,0.2);
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
        const appContainer = document.querySelector('.app-container') || document.querySelector('.notebook-container');
        
        if (appContainer) {
            // 1. Inject Global Header
            if (!document.querySelector('.header-controls')) {
                const header = document.createElement('div');
                header.className = 'header-controls';
                header.innerHTML = `
                    <button class="nav-btn-header" onclick="if(window.changeWeek) changeWeek(-1); else if(window.changeMonth) changeMonth(-1);">Prev</button>
                    <h1 class="header-title" id="global-header-title"></h1>
                    <button class="nav-btn-header" onclick="if(window.changeWeek) changeWeek(1); else if(window.changeMonth) changeMonth(1);">Next</button>
                `;
                appContainer.prepend(header);
            }

            // 2. Wrap Main Content + Sidebar in app-main for flex layout
            let appMain = document.querySelector('.app-main');
            let mainContent = document.querySelector('.main-content');
            
            if (!appMain) {
                appMain = document.createElement('div');
                appMain.className = 'app-main';
                
                // Move existing children (except header) into app-main
                const children = Array.from(appContainer.childNodes).filter(node => 
                    node.nodeType === 1 && !node.classList.contains('header-controls')
                );
                children.forEach(child => appMain.appendChild(child));
                appContainer.appendChild(appMain);
                
                // Re-find mainContent if it was moved
                mainContent = document.querySelector('.main-content');
            }

            // 2b. Inject Binder Rings
            if (mainContent && !document.querySelector('.binder-rings')) {
                const ringsContainer = document.createElement('div');
                ringsContainer.className = 'binder-rings';
                for (let i = 0; i < 6; i++) {
                    const ring = document.createElement('div');
                    ring.className = 'ring';
                    ringsContainer.appendChild(ring);
                }
                mainContent.appendChild(ringsContainer);
            }

            // 3. Auto-initialize Navigation Sidebar if it doesn't exist
            if (!document.querySelector('.tabs-sidebar')) {
                const sidebar = document.createElement('div');
                sidebar.className = 'tabs-sidebar';
                
                const urlParams = new URLSearchParams(window.location.search);
                const category = urlParams.get('category') || '';
                const path = window.location.pathname;
                
                const isIndex = path.endsWith('index.html') || path === '/';
                const isHOA = path.endsWith('hoa.html') || category === 'HOA';
                const isCSEA = path.endsWith('csea.html') || category === 'CSEA';
                const isICAAP = path.endsWith('icaap.html') || category.toUpperCase() === 'ICAAP';
                const isFinance = path.endsWith('financial.html') || ['FINANCE', 'BUDGET'].includes(category.toUpperCase());
                const isPlan = path.endsWith('planning.html') || ['PLANNING', 'PLAN'].includes(category.toUpperCase());
                
                const sections = [
                    { name: 'HOA', url: 'hoa.html', active: isHOA, color: '#ff9800', textColor: '#000000' },
                    { name: 'CSEA', url: 'csea.html', active: isCSEA, color: '#00326b', textColor: '#ffca38' },
                    { name: 'ICAAP', url: 'icaap.html', active: isICAAP, color: '#c2185b', textColor: '#ffffff' },
                    { name: 'FINANCE', url: 'financial.html', active: isFinance, color: '#1b5e20', textColor: '#ffffff' },
                    { name: 'PLAN', url: 'planning.html', active: isPlan, color: '#4a148c', textColor: '#ffff00' }
                ];

                const activeIndex = sections.findIndex(s => s.active);
                
                let html = '';
                sections.forEach((s, i) => {
                    const direction = i > activeIndex ? 'next' : 'prev';
                    html += `<div class="tab ${s.active ? 'active' : ''}" style="--tab-color: ${s.color}; --tab-text-color: ${s.textColor}" onclick="animateAndNavigate(event, '${s.url}', '${direction}')">${s.name}</div>`;
                });
                
                html += `
                    <div class="logout-btn" onclick="logout()">🚪 Logout</div>
                `;
                
                sidebar.innerHTML = html;
                appMain.appendChild(sidebar);
            }

            // 4. Initial Animation (Disabled to prevent tilt issues)
            const panes = document.querySelectorAll('.view-pane');
            if (panes.length > 0) {
                // By default, just ensure they are visible without transform
                panes.forEach(p => {
                    p.style.transform = 'none';
                    p.style.opacity = '1';
                });
            }
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
    const { data, error } = await client.from('category_entries').insert({ category, content, date_key: date }).select().single();
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
