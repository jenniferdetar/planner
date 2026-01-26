const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE';

let supabaseClient;
function getSupabase() {
    if (supabaseClient) return supabaseClient;
    if (typeof window !== 'undefined' && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabaseClient;
    }
    return null;
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
        // Treat as a literal persistence key (e.g., 'icaap-tracking-data', '2026-planning')
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
    if (!client) {
        console.error('Supabase client not initialized');
        return [];
    }
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (days - 1));
    const startStr = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    const endStr = endDate.toISOString().split('T')[0];

    const { data, error } = await client
        .from('calendar_by_date')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr);

    if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }
    return data || [];
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

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
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
    if (lowerTitle.includes('csea')) return 'event-pill csea';
    if (lowerTitle.includes('la fed')) return 'event-pill la-fed';
    if (lowerTitle.includes('due')) return 'event-pill due';
    if (lowerTitle.includes('meeting')) return 'event-pill meeting';
    if (lowerTitle.includes('pay day') || lowerTitle.includes('payday') || lowerTitle.includes('paycheck')) return 'event-pill pay-day';
    if (lowerTitle.includes('budget')) return 'event-pill budget';
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
    const { data } = await client.from('csea_members').select('*').order('name');
    return (data || []).map(m => ({ ...m, name: toTitleCase(m.name) }));
}

async function fetchHoursWorked() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('hours_worked').select('*');
    if (error) {
        console.error('Error fetching hours_worked:', error);
        return [];
    }
    return (data || []).map(r => ({ ...r, name: toTitleCase(r.name) }));
}

async function fetchApprovalDates() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('approval_dates').select('*');
    if (error) {
        console.error('Error fetching approval_dates:', error);
        return [];
    }
    return (data || []).map(r => ({ ...r, Name: toTitleCase(r.Name) }));
}

async function fetchPaylogSubmissions() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('paylog_submission').select('*');
    if (error) {
        // Fallback if table doesn't exist yet
        console.warn('paylog_submission table not found, using empty data');
        return [];
    }
    return (data || []).map(r => ({ ...r, name: toTitleCase(r.name) }));
}

async function fetchAllTrackingNames() {
    const hours = await fetchHoursWorked();
    const approvals = await fetchApprovalDates();
    const paylogs = await fetchPaylogSubmissions();
    
    const names = new Set();
    hours.forEach(r => { if (r.name) names.add(toTitleCase(r.name)); });
    approvals.forEach(r => { if (r.Name) names.add(toTitleCase(r.Name)); });
    paylogs.forEach(r => { if (r.name) names.add(toTitleCase(r.name)); });
    
    return [...names].sort();
}

async function saveTrackingData(table, name, month, value) {
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
    let { data: existingData, error: fetchError } = await client
        .from(table)
        .select('*')
        .eq(nameCol, name);

    // 2. If no exact match, try case-insensitive match (using ilike)
    if (!fetchError && (!existingData || existingData.length === 0)) {
        const { data: ciData, error: ciError } = await client
            .from(table)
            .select('*')
            .ilike(nameCol, name);
        if (!ciError && ciData && ciData.length > 0) {
            existingData = ciData;
        }
    }

    if (existingData && existingData.length > 0) {
        // Update the existing record (use the exact name from the DB to be safe)
        const dbName = existingData[0][nameCol];
        const { error: updateError } = await client
            .from(table)
            .update({ [col]: value })
            .eq(nameCol, dbName);
        
        if (updateError) {
            console.error(`Error updating ${table}:`, updateError);
            return false;
        }
    } else {
        // Insert new record
        const { error: insertError } = await client
            .from(table)
            .insert({ [nameCol]: name, [col]: value });
        
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
    const uniqueDiscussions = [...new Set(data.map(i => i.discussion.trim()))]
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
        if (word.includes('-')) {
            return word.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

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
        'planning.html',
        'monthly-review.html',
        'check-breakdown.html',
        'icaap-tracking.html',
        'mantra.html'
    ];
    document.querySelectorAll('a.nav-link, a.nav-btn, a.tracking-pill').forEach(link => {
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
