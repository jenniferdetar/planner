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
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (days - 1));
    const startStr = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    const endStr = endDate.toISOString().split('T')[0];

    const { data, error } = await client
        .from('planner_data')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr);

    if (error) {
        console.error('Error fetching planner data:', error);
        return [];
    }
    return data || [];
}

async function savePlannerData(date, fieldId, content) {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client
        .from('planner_data')
        .upsert({ 
            date: date, 
            field_id: fieldId, 
            content: content,
            updated_at: new Date()
        }, { onConflict: 'date,field_id' });

    if (error) {
        console.error('Save error:', error);
        return false;
    }
    return true;
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
        return null;
    }
    return data;
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
    return data;
}

async function saveInteraction(category, interaction) {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client
        .from('member_interactions')
        .insert({ category, ...interaction })
        .select()
        .single();
    
    if (error) {
        console.error('Error saving interaction:', error);
        return null;
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
    return data || [];
}

async function fetchCseaStewards() {
    const client = getSupabase();
    if (!client) return [];
    const { data } = await client.from('csea_stewards').select('*').order('name');
    return data || [];
}

async function fetchCseaIssues() {
    const client = getSupabase();
    if (!client) return [];
    const { data } = await client.from('csea_issues').select('*').order('issue_name');
    return data || [];
}

async function fetchSchoolDirectory() {
    const client = getSupabase();
    if (!client) return [];
    const { data } = await client.from('school_directory').select('*').order('site_name');
    return data || [];
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
