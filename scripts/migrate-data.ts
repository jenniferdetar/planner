import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const userId = process.argv[2];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

if (!userId) {
  console.error('Please provide a user_id as the first argument');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateCalendar() {
  console.log('Migrating calendar data...');
  const calendarDataPath = path.join(process.cwd(), 'data/calendar-data.json');
  const calendarData = JSON.parse(fs.readFileSync(calendarDataPath, 'utf8'));

  // Recurring events
  const recurring = calendarData.recurring || [];
  const habits = (calendarData.habits || []).flatMap((group: any) => 
    group.items.map((item: any) => ({
      ...item,
      category: group.title,
      frequency: 'weekly',
      weekdays: item.days
    }))
  );

  const allRecurring = [...recurring, ...habits].map(ev => ({
    title: ev.title || ev.name,
    frequency: ev.frequency,
    start_date: ev.startDate || null,
    end_date: ev.endDate || null,
    time: ev.time || null,
    end_time: ev.endTime || null,
    pattern: ev.pattern || null,
    day_of_month: ev.dayOfMonth || null,
    weekdays: ev.weekdays || null,
    skip_months: ev.skipMonths || null,
    skip_holidays: ev.skipHolidays || false,
    skip_dates: ev.skipDates || null,
    category: ev.category || null,
    user_id: userId
  }));

  const { error: recError } = await supabase.from('calendar_recurring').insert(allRecurring);
  if (recError) console.error('Error migrating recurring events:', recError);
  else console.log(`Migrated ${allRecurring.length} recurring events.`);

  // Fixed events
  const byDate = calendarData.byDate || {};
  const allFixed: any[] = [];
  Object.entries(byDate).forEach(([date, events]: [string, any]) => {
    events.forEach((ev: any) => {
      allFixed.push({
        date,
        title: ev.title,
        category: ev.category || null,
        user_id: userId
      });
    });
  });

  const { error: fixError } = await supabase.from('calendar_by_date').insert(allFixed);
  if (fixError) console.error('Error migrating fixed events:', fixError);
  else console.log(`Migrated ${allFixed.length} fixed events.`);
}

async function migrateGoals() {
  console.log('Migrating goals data...');
  const goalsDataPath = path.join(process.cwd(), 'data/goals-data.js');
  const content = fs.readFileSync(goalsDataPath, 'utf8');
  const jsonPart = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
  // Simple cleanup to make it somewhat valid JSON if it's close, 
  // but it's JS so we might need to be careful. 
  // For this specific file, it's mostly string keys and values.
  // Actually, we can't easily parse JS as JSON. 
  // Let's use a trick: eval in a sandbox or just use a more robust parser.
  // Since I know the structure, I'll try to extract it.
  
  // NOTE: In a real scenario, I'd use a JS parser. 
  // For now, I'll assume I can import it if I'm using ts-node.
  const { GOALS } = await import(goalsDataPath);
  
  const allGoals = Object.entries(GOALS).map(([title, data]: [string, any]) => ({
    title,
    category: data.category,
    specific: data.specific,
    measurable: data.measurable,
    achievable: data.achievable,
    relevant: data.relevant,
    timebound: data.timebound,
    statement: data.statement,
    weekly_tasks: data.weeklyTasks,
    ties_to: data.tiesTo,
    user_id: userId
  }));

  const { error } = await supabase.from('goals').insert(allGoals);
  if (error) console.error('Error migrating goals:', error);
  else console.log(`Migrated ${allGoals.length} goals.`);
}

async function migrateHoursWorked() {
  console.log('Migrating hours worked data...');
  const hoursDataPath = path.join(process.cwd(), 'js/hours-worked-data.js');
  const content = fs.readFileSync(hoursDataPath, 'utf8');
  const jsonPart = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
  const data = JSON.parse(jsonPart);

  const allHours = data.map((row: any) => ({
    name: row.name,
    jul: parseFloat(row.jul) || 0,
    aug: parseFloat(row.aug) || 0,
    sep: parseFloat(row.sep) || 0,
    oct: parseFloat(row.oct) || 0,
    nov: parseFloat(row.nov) || 0,
    dec: parseFloat(row.dec) || 0,
    jan: parseFloat(row.jan) || 0,
    feb: parseFloat(row.feb) || 0,
    mar: parseFloat(row.mar) || 0,
    apr: parseFloat(row.apr) || 0,
    may: parseFloat(row.may) || 0,
    jun: parseFloat(row.jun) || 0,
    total: parseFloat(row.total) || 0,
    user_id: userId
  }));

  // Insert in batches if too large
  const batchSize = 100;
  for (let i = 0; i < allHours.length; i += batchSize) {
    const batch = allHours.slice(i, i + batchSize);
    const { error } = await supabase.from('hours_worked').insert(batch);
    if (error) {
      console.error(`Error migrating hours worked batch ${i}:`, error);
      break;
    }
  }
  console.log(`Migrated ${allHours.length} hours worked records.`);
}

async function migrateVisionPhotos() {
  console.log('Migrating vision board photos...');
  const visionDataPath = path.join(process.cwd(), 'js/vision-board-photos.js');
  const content = fs.readFileSync(visionDataPath, 'utf8');
  
  // This one is harder to parse without execution. 
  // I'll extract DEFAULT_PHOTOS_BY_KEY using regex.
  const regex = /const DEFAULT_PHOTOS_BY_KEY = ({[\s\S]*?});/;
  const match = content.match(regex);
  if (!match) {
    console.error('Could not find DEFAULT_PHOTOS_BY_KEY in vision-board-photos.js');
    return;
  }
  
  // Clean up the match to be parseable as JSON (replace single quotes with double, etc.)
  // Or just use eval for this specific case if we trust the source.
  // Since it's a migration script, we'll try a simple eval-like approach.
  let data;
  try {
    const rawObj = match[1]
      .replace(/src: /g, '"src": ')
      .replace(/name: /g, '"name": ')
      .replace(/'/g, '"')
      .replace(/,(\s*})/g, '$1'); // remove trailing commas
    data = JSON.parse(rawObj);
  } catch (err) {
    console.error('Failed to parse vision board photos object:', err);
    return;
  }

  const allPhotos: any[] = [];
  Object.entries(data).forEach(([key, photos]: [string, any]) => {
    const category = key.split(':')[1] || key;
    photos.forEach((p: any) => {
      allPhotos.push({
        url: p.src,
        category: category,
        title: p.name,
        user_id: userId
      });
    });
  });

  const { error } = await supabase.from('vision_board_photos').insert(allPhotos);
  if (error) console.error('Error migrating vision photos:', error);
  else console.log(`Migrated ${allPhotos.length} vision photos.`);
}

async function main() {
  try {
    await migrateCalendar();
    await migrateGoals();
    await migrateHoursWorked();
    await migrateVisionPhotos();
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

main();
