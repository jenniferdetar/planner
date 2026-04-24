const MONGO_APP_ID = '69caa28329abfb126e9f3a88'; 
const MONGO_USER = "jennifermsamples_db_user";
const MONGO_PASS = "al-gjS6jf_q01hajcZ9ZZtUaCORZp0eUxBfYy4uL5q1dN9";

let mongoApp = null;
let mongoUser = null;
let mongoClient = null;

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

// Global Helpers
window.getDateKey = function(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

window.getEventClass = function(title) {
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
    if (lowerTitle.includes('celebrate')) return 'event-pill celebrate';
    if (lowerTitle.includes('conference')) return 'event-pill conference';
    if (lowerTitle.includes('cruise')) return 'event-pill cruise';
    
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
};

async function getMongoClient() {
    if (mongoClient) return mongoClient;
    if (typeof Realm === 'undefined') return null;
    
    if (!mongoApp) {
        mongoApp = new Realm.App({ id: MONGO_APP_ID });
    }

    if (!mongoApp.currentUser) {
        const credentials = Realm.Credentials.emailPassword(MONGO_USER, MONGO_PASS);
        mongoUser = await mongoApp.logIn(credentials);
    } else {
        mongoUser = mongoApp.currentUser;
    }

    mongoClient = mongoUser.mongoClient("mongodb-atlas");
    return mongoClient;
}

function getCollection(name) {
    const client = mongoClient || (mongoUser && mongoUser.mongoClient("mongodb-atlas"));
    if (!client) return null;
    // Replace spaces with underscores to match migration script
    const collName = name.replace(/ /g, '_');
    return client.db("planner_2026").collection(collName);
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
async function requireAuth() {
    if (typeof Realm === 'undefined') return null;
    if (!mongoApp) mongoApp = new Realm.App({ id: MONGO_APP_ID });
    
    let user = mongoApp.currentUser;
    if (!user) {
        try {
            user = await getMongoClient();
        } catch (err) {
            console.error('Auto-login failed:', err);
        }
    } else {
        await getMongoClient();
    }
    return user;
}

function setGlobalHeaderTitle(title) {
    const el = document.getElementById('global-header-title');
    if (el) el.innerText = title;
}

// Global Auth Check
if (typeof window !== 'undefined') {
    (async () => {
        try {
            await requireAuth();
        } catch (err) {
            console.error('Auth error:', err);
        }
    })();
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
    const client = await getMongoClient();
    const coll = getCollection('work_planner_edits');
    if (!coll) return [];

    const isDateString = typeof startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startDate);
    const isDateObject = startDate instanceof Date;

    let filter = {};
    if (isDateString || isDateObject) {
        const startStr = getDateKey(startDate);
        const endDate = new Date(startStr + 'T12:00:00');
        endDate.setDate(endDate.getDate() + (days - 1));
        const endStr = getDateKey(endDate);
        filter = { date_key: { $gte: startStr, $lte: endStr } };
    } else {
        filter = { date_key: startDate };
    }

    try {
        const data = await coll.find(filter);
        return (data || []).map(item => ({
            date: item.date_key,
            field_id: item.slot_key,
            content: item.value
        }));
    } catch (err) {
        console.error('Error fetching planner data:', err);
        return [];
    }
}

async function savePlannerData(date, fieldId, content, skipTimestamp = false) {
    const client = await getMongoClient();
    const coll = getCollection('work_planner_edits');
    if (!coll) return null;

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
        await coll.updateOne(
            { date_key: date, slot_key: fieldId },
            { $set: { value: finalValue } },
            { upsert: true }
        );
        return finalValue;
    } catch (err) {
        console.error('Save error details:', err);
        return null;
    }
}

async function fetchCalendarEvents(startDate, days = 7) {
    const client = await getMongoClient();
    const coll = getCollection('calendar_by_date');
    if (!coll) return [];

    const startStr = getDateKey(startDate);
    const endDate = new Date(startStr + 'T12:00:00');
    endDate.setDate(endDate.getDate() + (days - 1));
    const endStr = getDateKey(endDate);

    let dbEvents = [];
    try {
        dbEvents = await coll.find({
            date: { $gte: startStr, $lte: endStr }
        });
    } catch (err) {
        console.error('Error fetching calendar events:', err);
    }

    const hardcodedEvents = getCalendarEvents().filter(e => e.date >= startStr && e.date <= endStr);
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
        { date: '2026-04-01', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2026-05-31', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2026-07-30', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2026-09-28', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2026-11-27', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2027-01-26', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2027-03-27', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
        { date: '2027-05-26', title: 'A-D WEN SweetAlmondMint & Pomegranate' },
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

async function fetchEntries(category, date) {
    const client = await getMongoClient();
    const coll = getCollection('category_entries');
    if (!coll) return [];
    
    let filter = { category };
    if (date) filter.date_key = date;
    
    try {
        return await coll.find(filter, { sort: { created_at: -1 } });
    } catch (err) {
        console.error('Error fetching entries:', err);
        return [];
    }
}

async function saveEntry(category, date, content) {
    const client = await getMongoClient();
    const coll = getCollection('category_entries');
    if (!coll || !content.trim()) return null;
    
    const finalContent = ensureTimestamp(content);
    const doc = { category, content: finalContent, date_key: date, created_at: new Date().toISOString() };
    try {
        await coll.insertOne(doc);
        return doc;
    } catch (err) {
        console.error('Error saving entry:', err);
        return null;
    }
}

async function fetchCategoryEntries(category) {
    return await fetchEntries(category);
}

async function saveCategoryEntry(category, content) {
    return await saveEntry(category, null, content);
}

async function updateCategoryEntry(id, content) {
    const client = await getMongoClient();
    const coll = getCollection('category_entries');
    if (!coll) return false;
    
    const finalContent = ensureTimestamp(content);
    try {
        await coll.updateOne({ _id: id }, { $set: { content: finalContent } });
        return finalContent;
    } catch (err) {
        console.error('Error updating entry:', err);
        return null;
    }
}

async function deleteEntry(id) {
    const client = await getMongoClient();
    const coll = getCollection('category_entries');
    if (!coll) return false;
    try {
        await coll.deleteOne({ _id: id });
        return true;
    } catch (err) {
        console.error('Error deleting entry:', err);
        return false;
    }
}

async function fetchInteractions(category) {
    const client = await getMongoClient();
    const coll = getCollection('member_interactions');
    if (!coll) return [];
    
    try {
        const data = await coll.find({ category }, { sort: { date_spoke: -1 } });
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
    } catch (err) {
        console.error('Error fetching interactions:', err);
        return [];
    }
}

async function saveInteraction(category, interaction) {
    const client = await getMongoClient();
    const coll = getCollection('member_interactions');
    if (!coll) return null;
    
    const knownFields = ['_id', 'id', 'category', 'date_spoke', 'member_name', 'work_location', 'discussion', 'who_involved', 'contact_person', 'created_at'];
    const extraFields = {};
    const baseInteraction = { category, created_at: new Date().toISOString() };
    
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
    
    try {
        await coll.insertOne(baseInteraction);
        if (baseInteraction.point_of_contact && baseInteraction.point_of_contact.startsWith('{')) {
            try {
                const extra = JSON.parse(baseInteraction.point_of_contact);
                return { ...baseInteraction, ...extra };
            } catch (e) {}
        }
        return baseInteraction;
    } catch (err) {
        console.error('Error saving interaction:', err);
        return null;
    }
}

async function deleteInteraction(id) {
    const client = await getMongoClient();
    const coll = getCollection('member_interactions');
    if (!coll) return false;
    try {
        await coll.deleteOne({ _id: id });
        return true;
    } catch (err) {
        console.error('Error deleting interaction:', err);
        return false;
    }
}

async function fetchCseaMembers() {
    const client = await getMongoClient();
    const coll = getCollection('csea_members');
    if (!coll) return [];
    try {
        const data = await coll.find({}, { sort: { full_name: 1 } });
        return (data || []).map(m => ({ ...m, name: toTitleCase(m.full_name) }));
    } catch (err) {
        console.error('Error fetching csea members:', err);
        return [];
    }
}

async function fetchHoursWorked(year) {
    const client = await getMongoClient();
    const coll = getCollection('hours_worked');
    if (!coll) return [];
    try {
        let filter = {};
        if (year) filter.fiscal_year = year;
        const data = await coll.find(filter);
        return (data || []).map(r => ({ ...r, name: toTitleCase(r.name) }));
    } catch (err) {
        console.error('Error fetching hours worked:', err);
        return [];
    }
}

async function fetchApprovalDates(year) {
    const client = await getMongoClient();
    const coll = getCollection('approval_dates');
    if (!coll) return [];
    try {
        let filter = {};
        if (year) filter.fiscal_year = year;
        const data = await coll.find(filter);
        return (data || []).map(r => ({ ...r, Name: toTitleCase(r.Name || r.name) }));
    } catch (err) {
        console.error('Error fetching approval dates:', err);
        return [];
    }
}

async function fetchPaylogSubmissions(year) {
    const client = await getMongoClient();
    const coll = getCollection('paylog submission');
    if (!coll) return [];
    try {
        let filter = {};
        if (year) filter.fiscal_year = year;
        const data = await coll.find(filter);
        return (data || []).map(r => ({ ...r, name: toTitleCase(r['Employee Name'] || r.name) }));
    } catch (err) {
        console.error('Error fetching paylog submissions:', err);
        return [];
    }
}

async function fetchAllTrackingNames(year) {
    const client = await getMongoClient();
    const coll = getCollection('employees');
    if (!coll) return [...DEFAULT_EMPLOYEES].sort();
    
    try {
        const data = await coll.find({}, { sort: { "Lastname Firstname": 1 } });
        const nameSet = new Set();
        if (data && data.length > 0) {
            data.forEach(r => {
                const name = r['Lastname Firstname'];
                if (name) nameSet.add(toTitleCase(name));
            });
        }

        if (nameSet.size === 0) {
            DEFAULT_EMPLOYEES.forEach(n => nameSet.add(toTitleCase(n)));
        }

        return [...nameSet].filter(n => n && n.trim()).sort();
    } catch (err) {
        console.error('Error fetching tracking names:', err);
        return [...DEFAULT_EMPLOYEES].sort();
    }
}

async function fetchAttendanceTrackerNames() {
    const client = await getMongoClient();
    const coll = getCollection('attendance tracker');
    if (!coll) return [...DEFAULT_EMPLOYEES].sort();
    
    try {
        const data = await coll.find({}, { sort: { name: 1 } });
        const nameSet = new Set();
        if (data && data.length > 0) {
            data.forEach(r => {
                if (r.name) nameSet.add(toTitleCase(r.name));
            });
        }

        if (nameSet.size === 0) {
            DEFAULT_EMPLOYEES.forEach(n => nameSet.add(toTitleCase(n)));
        }

        return [...nameSet].filter(n => n && n.trim()).sort();
    } catch (err) {
        console.error('Error fetching attendance tracker names:', err);
        return [...DEFAULT_EMPLOYEES].sort();
    }
}

function normalizeNameForMatch(name) {
    if (!name) return '';
    let n = name.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    let parts = n.split(' ');
    return parts.sort().join(' ');
}

async function saveTrackingData(table, name, month, value, year) {
    const client = await getMongoClient();
    const coll = getCollection(table);
    if (!coll) return false;
    
    const isHours = table.includes('hours_worked');
    const isPaylog = table.includes('paylog submission');
    const isApproval = table.includes('approval_dates');
    
    let col = month;
    if (isHours) {
        col = month.toLowerCase().substring(0, 3);
        if (month.toLowerCase() === 'total') col = 'total';
    } else if (isPaylog) {
        const mPart = month.substring(0, 3);
        const capitalizedM = mPart.charAt(0).toUpperCase() + mPart.slice(1).toLowerCase();
        if (!month.includes('202')) {
            const mIdx = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'].indexOf(capitalizedM);
            const colYear = mIdx !== -1 && mIdx < 6 ? year : year + 1;
            col = `${capitalizedM} ${colYear}`;
        }
    } else if (isApproval) {
        col = month.substring(0, 3);
    }
    
    const nameCol = isPaylog ? 'Employee Name' : (isHours ? 'name' : 'Name');
    const normName = normalizeNameForMatch(name);
    
    try {
        let filter = { fiscal_year: year };
        const allRows = await coll.find(filter);
        const existing = allRows.find(r => normalizeNameForMatch(r[nameCol]) === normName);

        if (existing) {
            await coll.updateOne({ _id: existing._id }, { $set: { [col]: value } });
        } else {
            await coll.insertOne({ [nameCol]: name, [col]: value, fiscal_year: year });
        }
        return true;
    } catch (err) {
        console.error(`Error saving tracking data to ${table}:`, err);
        return false;
    }
}

async function fetchCseaStewards() {
    const client = await getMongoClient();
    const coll = getCollection('csea_stewards');
    if (!coll) return [];
    try {
        const data = await coll.find({}, { sort: { name: 1 } });
        return (data || []).map(m => ({ ...m, name: toTitleCase(m.name) }));
    } catch (err) {
        console.error('Error fetching stewards:', err);
        return [];
    }
}

async function fetchCseaIssues() {
    const client = await getMongoClient();
    const coll = getCollection('member_interactions');
    if (!coll) return [];
    
    try {
        const data = await coll.find({ discussion: { $ne: null } });
        const uniqueDiscussions = [...new Set(data.map(i => toTitleCase(i.discussion.trim())))]
            .filter(d => d.length > 0)
            .map(d => ({ issue_name: d }));
        return uniqueDiscussions;
    } catch (err) {
        console.error('Error fetching issues:', err);
        return [];
    }
}

async function fetchSchoolDirectory() {
    const client = await getMongoClient();
    const coll = getCollection('school_directory');
    if (!coll) return [];
    try {
        const data = await coll.find({}, { sort: { site_name: 1 } });
        return (data || []).map(s => ({ ...s, site_name: toTitleCase(s.site_name) }));
    } catch (err) {
        console.error('Error fetching school directory:', err);
        return [];
    }
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
    document.querySelectorAll('a.nav-link, a.nav-btn, a.tracking-pill, a.tracking-link, a.section-icon, a.section-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            let base = href.split('?')[0];
            let params = new URLSearchParams(href.split('?')[1] || '');
            params.set('date', dateStr);
            link.setAttribute('href', base + '?' + params.toString());
        }
    });
}

function formatDateMMM(dateStr) {
    if (!dateStr) return '';
    let date;
    if (dateStr instanceof Date) {
        date = dateStr;
    } else {
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const parts = datePart.split('-');
        if (parts.length === 3) {
            date = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            date = new Date(dateStr);
        }
    }
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
}

function formatTime(timeStr, compact = false, showSpace = false) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    let ampm = compact ? (h >= 12 ? 'p' : 'a') : (h >= 12 ? 'pm' : 'am');
    if (showSpace && !compact) ampm = ' ' + ampm;
    let displayH = h % 12 || 12;
    return `${displayH}:${String(m).padStart(2, '0')}${ampm}`;
}

// Dashboard Layout
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        :root { --primary-navy: #00326b; --accent-gold: #c5a059; --bg-light: #f5f7fa; --text-dark: #333; --border-color: #d1d1d1; --font-main: 'Coming Soon', cursive; }
        * { box-sizing: border-box; font-family: 'Coming Soon', cursive !important; }
        body, html { margin: 0; padding: 0; height: 100vh; width: 100vw; overflow: hidden !important; background: var(--bg-light); font-size: 10pt; line-height: 1.2; font-weight: 600; }
        .dashboard-container { display: flex; width: 100vw; height: 100vh; overflow: hidden; }
        .dashboard-sidebar { width: 250px; background: var(--primary-navy); color: #fff; display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; padding-top: 20px; }
        .sidebar-section { padding: 10px 0; }
        .sidebar-label { padding: 5px 25px; font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.5); font-weight: 700; }
        .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 10px 25px; color: #fff; text-decoration: none; font-size: 10pt; transition: background 0.2s; }
        .sidebar-link:hover { background: rgba(255,255,255,0.1); }
        .sidebar-link.active { background: rgba(255,255,255,0.2); border-left: 4px solid var(--accent-gold); padding-left: 21px; }
        .sidebar-icon { font-size: 12pt; }
        .dashboard-main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; background: #fff; }
        .dashboard-header { flex-shrink: 0; background: #fff; border-bottom: 1px solid var(--border-color); padding: 10px 20px; display: flex; align-items: center; justify-content: center; min-height: 80px; position: relative; z-index: 100; }
        .header-left-controls { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 15px; z-index: 101; }
        .header-center { text-align: center; width: 100%; display: flex; justify-content: center; align-items: center; }
        .header-right-controls { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 15px; z-index: 101; }
        .header-title { font-size: 14px; font-weight: 700; color: var(--primary-navy); margin: 0; letter-spacing: 3px; text-transform: uppercase; }
        .header-nav-btn { background: #fff; border: 1px solid var(--border-color); padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 10pt; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
        .header-nav-btn:hover { background: #f8f9fa; border-color: var(--primary-navy); }
        .dashboard-body { flex: 1; overflow: auto; padding: 0 !important; background: #fff; }
    `;
    document.head.appendChild(style);

    window.setGlobalHeaderTitle = function(title) {
        const titleEl = document.querySelector('.header-title');
        if (titleEl) titleEl.innerText = title;
    };

    document.addEventListener('DOMContentLoaded', () => {
        const existingNodes = Array.from(document.body.childNodes);
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const urlParams = new URLSearchParams(window.location.search);
        const dateStr = urlParams.get('date') || localStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0];
        
        const dashboard = document.createElement('div');
        dashboard.className = 'dashboard-container';
        dashboard.innerHTML = `
            <aside class="dashboard-sidebar">
                <div style="padding: 0 25px 30px; font-size: 10pt; font-weight: 700; color: #fff; letter-spacing: 2px;">PLANNER 2026</div>
                <div id="sidebar-nav"></div>
            </aside>
            <main class="dashboard-main">
                <header class="dashboard-header">
                    <div class="header-left-controls">
                        <button class="header-nav-btn" onclick="localStorage.removeItem('selectedDate'); window.location.href='index.html'">Today</button>
                    </div>
                    <div class="header-center"><h1 class="header-title">PLANNER 2026</h1></div>
                    <div class="header-right-controls">
                        <input type="date" value="${dateStr}" id="global-date-picker" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc; font-family: 'Coming Soon', cursive; font-size: 10pt;">
                    </div>
                </header>
                <div class="dashboard-body"></div>
            </main>
        `;

        const dashboardBody = dashboard.querySelector('.dashboard-body');
        existingNodes.forEach(node => {
            if (node.nodeType === 1 && (node.tagName === 'STYLE' || node.tagName === 'SCRIPT')) return;
            dashboardBody.appendChild(node);
        });
        document.body.replaceChildren(dashboard, ...Array.from(document.body.querySelectorAll('script, style')));
    });
})();
