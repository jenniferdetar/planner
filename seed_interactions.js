
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const schools = [
    { site_name: 'Compton Ave Elementary' },
    { site_name: 'MiSiS' },
    { site_name: 'HR' },
    { site_name: 'Elizabeth Learning Center' },
    { site_name: 'Beaudry' },
    { site_name: 'John B Monlux Elementary' },
    { site_name: 'O\'Melveny Elementary' }
];

const interactions = [
    // Grievance Form Data
    {
        category: 'CSEA',
        date_spoke: '2024-04-19',
        member_name: 'Norma Fuentes',
        work_location: 'Compton Ave Elementary',
        discussion: 'SAA talking down to member and complaining when doing what was asked by administrator and not telling her. Retaliation was taken when member complained to administrator about SAA. Work was compromised when a hand-held scanner cord was cut during member\'s lunch period.',
        who_involved: 'SAA',
        contact_person: 'Caden Stearns',
        point_of_contact: 'school work site in Region East or Region South'
    },
    {
        category: 'CSEA',
        date_spoke: '2024-06-02',
        member_name: 'Mary Rose Charazrian',
        work_location: 'MiSiS',
        discussion: 'Mistreatment by supervisor',
        who_involved: 'Supervisor and Director',
        contact_person: 'Christopher Crump',
        point_of_contact: 'administrative non-school work site or Beaudry'
    },
    {
        category: 'CSEA',
        date_spoke: '2024-06-04',
        member_name: 'Ester Cid',
        work_location: 'HR',
        discussion: 'Salary Allocations',
        who_involved: '',
        contact_person: 'Christopher Crump',
        point_of_contact: 'administrative non-school work site or Beaudry'
    },
    {
        category: 'CSEA',
        date_spoke: '2024-06-06',
        member_name: 'Isabel Ramierz',
        work_location: 'Elizabeth Learning Center',
        discussion: 'Office Technician position being cut. Involuntary transfer. Told member to call Karla Toscano and ask what other vacancies there are.',
        who_involved: 'Administrator',
        contact_person: 'Karla Toscano',
        point_of_contact: 'Assignment Technician for District East'
    },
    {
        category: 'CSEA',
        date_spoke: '2024-06-21',
        member_name: 'Victor Lopez',
        work_location: 'Beaudry',
        discussion: 'Meeting is called for Monday, June 24th at 3 pm to discuss working out of classification, but in reality is working duties as assigned.',
        who_involved: 'Multiple People',
        contact_person: 'Caden Stearns',
        point_of_contact: 'school work site in Region East or Region South'
    },
    {
        category: 'CSEA',
        date_spoke: '2024-12-11',
        member_name: 'Jennifer Burbank',
        work_location: 'Beaudry',
        discussion: 'Working out of classification; not being able to have work experience credited; needing forms to be signed off to be able to promote to validate work experience',
        who_involved: 'Multiple People',
        contact_person: 'Matthew Korn',
        point_of_contact: 'school work site in Region North and Region West'
    },
    // Inquiries Data
    {
        category: 'CSEA',
        date_spoke: '2024-06-06',
        member_name: 'Elizabeth Leones',
        work_location: 'John B Monlux Elementary',
        discussion: 'Lay offs',
        who_involved: '',
        contact_person: 'No lays off are happening, just involuntary movements',
        point_of_contact: ''
    },
    {
        category: 'CSEA',
        date_spoke: '2024-06-14',
        member_name: 'Ernie Cadena',
        work_location: 'Beaudry',
        discussion: 'If LAUSD is considering offering a Golden Handshake for early retirement next year',
        who_involved: 'Emailed Benefits',
        contact_person: 'District does not offer Golden Handshakes',
        point_of_contact: ''
    },
    {
        category: 'CSEA',
        date_spoke: '2024-06-14',
        member_name: 'Sindy Banuelos',
        work_location: 'Beaudry',
        discussion: 'Being denied OT because of taking PTO',
        who_involved: 'Gave member a copy of the CPA',
        contact_person: '',
        point_of_contact: ''
    },
    {
        category: 'CSEA',
        date_spoke: '2024-06-26',
        member_name: 'Roberta Barrera',
        work_location: 'Beaudry',
        discussion: 'Reclassification and a salary study',
        who_involved: 'Sent to Letetsia and Chris',
        contact_person: '',
        point_of_contact: ''
    },
    {
        category: 'CSEA',
        date_spoke: '2024-07-24',
        member_name: 'Esmeralda Flores',
        work_location: 'Beaudry',
        discussion: 'Seniority List',
        who_involved: '',
        contact_person: 'When the seniority list gets printed, it has to be checked multiple times by different departments (some are short-staffed) to make sure all of our members are accounted for. These reports go to Letetsia first to review, and she catches many of the mistakes that appear',
        point_of_contact: ''
    },
    {
        category: 'CSEA',
        date_spoke: '2024-07-25',
        member_name: 'Jerri Paley-Hayashi',
        work_location: 'O\'Melveny Elementary',
        discussion: 'I was wondering why LAUSD switched HRA custodians for our FSA Health Care. TSAC is the current custodian, I am having trouble regarding communication with them when requesting reimbursements, they have denied my request without giving me an explanation and when I call them to find out why it\'s difficult to reach them by phone during my work hours. They have a letter of necessity on file yet continue to request it when submitting my claim. The other custodian did not hassel me every time I submitted as claim.',
        who_involved: 'Reach out to Matt Korn',
        contact_person: '',
        point_of_contact: ''
    },
    {
        category: 'CSEA',
        date_spoke: '2024-08-05',
        member_name: 'Mary Rose Ghazarian',
        work_location: 'Beaudry',
        discussion: 'Christine Santos is asking for an invoice to support',
        who_involved: 'Emailed Chris Crump',
        contact_person: '',
        point_of_contact: ''
    },
    {
        category: 'CSEA',
        date_spoke: '2024-08-16',
        member_name: 'Brian Wanta',
        work_location: 'Beaudry',
        discussion: 'Lunch schedule',
        who_involved: 'Sent member copy of the contract, and referred to',
        contact_person: '',
        point_of_contact: ''
    },
    {
        category: 'CSEA',
        date_spoke: '2024-05-20',
        member_name: 'Triny',
        work_location: 'Beaudry',
        discussion: 'Steps for Senior Office Techs',
        who_involved: '',
        contact_person: '',
        point_of_contact: ''
    }
];

async function seed() {
    console.log('Inserting schools...');
    const { error: schoolError } = await supabase.from('school_directory').insert(schools);
    if (schoolError) console.error('School error:', schoolError);

    console.log('Inserting interactions...');
    const { error: interError } = await supabase.from('member_interactions').insert(interactions);
    if (interError) console.error('Interaction error:', interError);

    console.log('Seeding complete.');
}

seed();
