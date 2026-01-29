
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NTE3NywiZXhwIjoyMDgxMTYxMTc3fQ.9J1dOAVqYCENKVgiOKBpspe3MgqqnP3jqnwTRwGjfCE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const employees = [
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

const financialBills = [
    { id: 1, cat: 'Auto', item: 'Auto Maintenance', amt: '$100', class: 'row-auto' },
    { id: 2, cat: 'Auto', item: 'Mercury Auto Insurance', amt: '$388', class: 'row-auto' },
    { id: 3, cat: 'Auto', item: 'Tahoe Registration', amt: '$15', class: 'row-auto' },
    { id: 4, cat: 'Auto', item: 'Trailblazer Registration', amt: '$28', class: 'row-auto' },
    { id: 5, cat: 'Bill Pay', item: 'DWP', amt: '$100', class: 'row-bill' },
    { id: 6, cat: 'Bill Pay', item: 'Jeff\'s Credit Cards', amt: '$500', class: 'row-bill' },
    { id: 7, cat: 'Bill Pay', item: 'Jennifer\'s Student Loans', amt: '$150', class: 'row-bill' },
    { id: 8, cat: 'Bill Pay', item: 'Schools First Loan', amt: '$142', class: 'row-bill' },
    { id: 9, cat: 'Cash', item: 'Cleaning Lady', amt: '$320', class: 'row-cash' },
    { id: 10, cat: 'Cash', item: 'Gas', amt: '$600', class: 'row-cash' },
    { id: 11, cat: 'Cash', item: 'Laundry', amt: '$80', class: 'row-cash' },
    { id: 12, cat: 'Credit Card', item: 'ADT', amt: '$53', class: 'row-cc' },
    { id: 13, cat: 'Credit Card', item: 'Amazon', amt: '$100', class: 'row-cc' },
    { id: 14, cat: 'Credit Card', item: 'Groceries', amt: '$600', class: 'row-cc' },
    { id: 15, cat: 'Credit Card', item: 'Hair', amt: '$110', class: 'row-cc' },
    { id: 16, cat: 'Credit Card', item: 'Orkin', amt: '$50', class: 'row-cc' },
    { id: 17, cat: 'Housing', item: 'HELOC', amt: '$357', class: 'row-housing' },
    { id: 18, cat: 'Housing', item: 'Hoa', amt: '$520', class: 'row-housing' },
    { id: 19, cat: 'Housing', item: 'Mortgage', amt: '$2,250', class: 'row-housing' },
    { id: 20, cat: 'Housing', item: 'Spectrum', amt: '$197', class: 'row-housing' },
    { id: 21, cat: 'Housing', item: 'Verizon', amt: '$283', class: 'row-housing' },
    { id: 22, cat: 'Savings', item: 'Blow', amt: '$200', class: 'row-savings' },
    { id: 23, cat: 'Savings', item: 'HSA', amt: '$200', class: 'row-savings' },
    { id: 24, cat: 'Savings', item: 'Summer Saver', amt: '$400', class: 'row-savings' },
    { id: 25, cat: 'Savings', item: 'Tahoe\'s Major Repairs', amt: '$200', class: 'row-savings' },
    { id: 26, cat: 'Savings', item: 'Vacation', amt: '$125', class: 'row-savings' }
];

async function seed() {
    console.log('Seeding employees...');
    const employeeData = employees.map(name => ({ full_name: name }));
    const { error: empError } = await supabase.from('csea_members').insert(employeeData);
    if (empError) console.error('Error seeding employees:', empError);
    else console.log('Successfully seeded employees');

    console.log('Seeding financial bills...');
    // Create table first if needed (via RPC or assuming it exists)
    // For now just try to insert
    const { error: billError } = await supabase.from('financial_bills').insert(financialBills);
    if (billError) {
        if (billError.code === 'PGRST204' || billError.message.includes('not found')) {
            console.log('Table financial_bills not found. You might need to create it manually in Supabase SQL editor:');
            console.log(`
            CREATE TABLE financial_bills (
                id SERIAL PRIMARY KEY,
                cat TEXT,
                item TEXT,
                amt TEXT,
                class TEXT
            );
            ALTER TABLE financial_bills ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Allow public read" ON financial_bills FOR SELECT TO public USING (true);
            `);
        } else {
            console.error('Error seeding financial bills:', billError);
        }
    } else {
        console.log('Successfully seeded financial bills');
    }
}

seed();
