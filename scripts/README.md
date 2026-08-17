# scripts

Utility scripts for the planner / iCAAP workbooks.

## icaap_hours_over_40.py

Lists every employee/month in an iCAAP Master workbook whose logged hours
exceed a threshold (default 40). It reads the **Payroll Tracker** sheet,
auto-detecting each month's `Hours` column, and considers only numeric cells
(blank / `N/A` entries are ignored).

```bash
pip install openpyxl

# Formatted table (default threshold 40)
python scripts/icaap_hours_over_40.py path/to/iCAAP_Master_20262027.xlsx

# Custom threshold
python scripts/icaap_hours_over_40.py MASTER.xlsx --threshold 80

# CSV output (Name, PERN, Month, Hours)
python scripts/icaap_hours_over_40.py MASTER.xlsx --csv > over40.csv
```
