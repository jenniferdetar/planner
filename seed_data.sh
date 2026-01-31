#!/bin/bash

URL="https://hhhuidbnvbtllxcaiusl.supabase.co/rest/v1"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHVpZGJudmJ0bGx4Y2FpdXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODUxNzcsImV4cCI6MjA4MTE2MTE3N30.bXob7mlt0m8QD5gQpcTYZlC3vrsPvUZt7u_tJB17XHE"

# Delete existing for Monthly Review
curl -X DELETE "$URL/work_planner_edits?date_key=eq.fin-review-2026" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY"

# Insert Monthly Review
curl -X POST "$URL/work_planner_edits" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"date_key": "fin-review-2026", "slot_key": "fin-goals", "value": "Complete the 2026 budget and increase savings by 15%."},
    {"date_key": "fin-review-2026", "slot_key": "fin-expenses", "value": "Maintain monthly expenses under $4,500."},
    {"date_key": "fin-review-2026", "slot_key": "fin-savings", "value": "Reached $10k in emergency fund."}
  ]'

# Insert Goals
curl -X POST "$URL/category_entries" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"category": "Goals-left", "date_key": "2026-01-31", "content": "Professional development: Learn advanced Supabase RLS and multi-tenancy patterns."},
    {"category": "Goals-right", "date_key": "2026-01-31", "content": "Personal: Run 3 times a week and complete a half-marathon by June."}
  ]'
