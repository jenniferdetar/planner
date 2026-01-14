# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class CheckBreakdown(models.Model):
    id = models.BigIntegerField(primary_key=True)
    account = models.TextField(db_column='Account', blank=True, null=True)  # Field name made lowercase.
    number_2025_07_08 = models.TextField(db_column='2025 07 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2025_07_23 = models.TextField(db_column='2025 07 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2025_08_08 = models.TextField(db_column='2025 08 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2025_08_23 = models.TextField(db_column='2025 08 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    sep_08_2025 = models.TextField(db_column='Sep 08 2025', blank=True, null=True)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    number_2025_09_23 = models.TextField(db_column='2025 09 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2025_10_08 = models.TextField(db_column='2025 10 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2025_10_23 = models.TextField(db_column='2025 10 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2025_11_08 = models.TextField(db_column='2025 11 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2025_11_23 = models.TextField(db_column='2025 11 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2025_12_08 = models.TextField(db_column='2025 12 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2025_12_23 = models.TextField(db_column='2025 12 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_01_08 = models.TextField(db_column='2026 01 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_01_23 = models.TextField(db_column='2026 01 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_02_08 = models.TextField(db_column='2026 02 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_02_23 = models.TextField(db_column='2026 02 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_03_08 = models.TextField(db_column='2026 03 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_04_23 = models.TextField(db_column='2026 04 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_05_08 = models.TextField(db_column='2026 05 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_05_23 = models.TextField(db_column='2026 05 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_06_08 = models.TextField(db_column='2026 06 08', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.
    number_2026_06_23 = models.TextField(db_column='2026 06 23', blank=True, null=True)  # Field renamed to remove unsuitable characters. Field renamed because it wasn't a valid Python identifier.

    class Meta:
        managed = False
        db_table = 'Check Breakdown'


class ApprovalDates(models.Model):
    name = models.TextField(db_column='Name', primary_key=True)  # Field name made lowercase.
    jul = models.TextField(db_column='Jul')  # Field name made lowercase.
    aug = models.TextField(db_column='Aug')  # Field name made lowercase.
    sep = models.TextField(db_column='Sep')  # Field name made lowercase.
    oct = models.TextField(db_column='Oct')  # Field name made lowercase.
    nov = models.TextField(db_column='Nov')  # Field name made lowercase.
    dec = models.TextField(db_column='Dec')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'approval_dates'


class Books(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.TextField()
    author = models.TextField(blank=True, null=True)
    completed = models.BooleanField(blank=True, null=True)
    category = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'books'


class CalendarByDate(models.Model):
    id = models.UUIDField(primary_key=True)
    date = models.DateField()
    title = models.TextField()
    category = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'calendar_by_date'


class CalendarRecurring(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.TextField()
    frequency = models.TextField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    pattern = models.TextField(blank=True, null=True)
    day_of_month = models.IntegerField(blank=True, null=True)
    weekdays = models.TextField(blank=True, null=True)  # This field type is a guess.
    skip_months = models.TextField(blank=True, null=True)  # This field type is a guess.
    skip_holidays = models.BooleanField(blank=True, null=True)
    skip_dates = models.TextField(blank=True, null=True)  # This field type is a guess.
    holiday_rule = models.TextField(blank=True, null=True)
    category = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'calendar_recurring'


class Goals(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.TextField(unique=True)
    category = models.TextField(blank=True, null=True)
    specific = models.TextField(blank=True, null=True)
    measurable = models.TextField(blank=True, null=True)
    achievable = models.TextField(blank=True, null=True)
    relevant = models.TextField(blank=True, null=True)
    timebound = models.TextField(blank=True, null=True)
    statement = models.TextField(blank=True, null=True)
    weekly_tasks = models.TextField(blank=True, null=True)  # This field type is a guess.
    ties_to = models.TextField(blank=True, null=True)  # This field type is a guess.
    created_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'goals'


class HoaExpenses(models.Model):
    id = models.UUIDField(primary_key=True)
    vendor = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    insights = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hoa_expenses'


class HoursWorked(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.TextField()
    jul = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    aug = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    sep = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    oct = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    nov = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    dec = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    jan = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    feb = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    mar = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    apr = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    may = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    jun = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    total = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'hours_worked'


class MaxCompletionTimes(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.TextField()
    jul = models.TextField(blank=True, null=True)
    aug = models.TextField(blank=True, null=True)
    sep = models.TextField(blank=True, null=True)
    oct = models.TextField(blank=True, null=True)
    nov = models.TextField(blank=True, null=True)
    dec = models.TextField(blank=True, null=True)
    jan = models.TextField(blank=True, null=True)
    feb = models.TextField(blank=True, null=True)
    mar = models.TextField(blank=True, null=True)
    apr = models.TextField(blank=True, null=True)
    may = models.TextField(blank=True, null=True)
    jun = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'max_completion_times'


class OpusGoals(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    category = models.TextField(blank=True, null=True)
    mission_alignment = models.TextField(blank=True, null=True)  # This field type is a guess.
    timeframe = models.TextField(blank=True, null=True)
    linked_task_ids = models.TextField(blank=True, null=True)  # This field type is a guess.
    status = models.TextField(blank=True, null=True)
    progress_percent = models.DecimalField(max_digits=65535, decimal_places=65535, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opus_goals'


class OpusMasterTasks(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    priority = models.TextField(blank=True, null=True)
    linked_goal_ids = models.TextField(blank=True, null=True)  # This field type is a guess.
    category = models.TextField(blank=True, null=True)
    scheduled_task_id = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opus_master_tasks'


class OpusMeetings(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.TextField()
    date = models.DateField(blank=True, null=True)
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    attendees = models.TextField(blank=True, null=True)  # This field type is a guess.
    agenda = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    linked_task_ids = models.TextField(blank=True, null=True)  # This field type is a guess.
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opus_meetings'


class OpusMission(models.Model):
    id = models.UUIDField(primary_key=True)
    statement = models.TextField(blank=True, null=True)
    values = models.TextField(blank=True, null=True)  # This field type is a guess.
    last_updated = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(unique=True, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opus_mission'


class OpusNotes(models.Model):
    id = models.UUIDField(primary_key=True)
    date = models.DateField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    tags = models.TextField(blank=True, null=True)  # This field type is a guess.
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opus_notes'


class OpusPreferences(models.Model):
    id = models.UUIDField(primary_key=True)
    theme = models.TextField(blank=True, null=True)
    default_view = models.TextField(blank=True, null=True)
    work_start_hour = models.IntegerField(blank=True, null=True)
    work_end_hour = models.IntegerField(blank=True, null=True)
    week_start_day = models.TextField(blank=True, null=True)
    notifications = models.BooleanField(blank=True, null=True)
    time_format = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(unique=True, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opus_preferences'


class OpusTasks(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    due_time = models.TimeField(blank=True, null=True)
    priority = models.TextField(blank=True, null=True)
    completed = models.BooleanField(blank=True, null=True)
    linked_goal_ids = models.TextField(blank=True, null=True)  # This field type is a guess.
    category = models.TextField(blank=True, null=True)
    subtasks = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'opus_tasks'


class Tasks(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)
    priority = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    completed = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tasks'


class VisionBoardPhotos(models.Model):
    id = models.UUIDField(primary_key=True)
    url = models.TextField()
    category = models.TextField(blank=True, null=True)
    title = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'vision_board_photos'


class WorkPlannerEdits(models.Model):
    id = models.UUIDField(primary_key=True)
    date_key = models.TextField()
    slot_key = models.TextField()
    value = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    user_id = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'work_planner_edits'
        unique_together = (('date_key', 'slot_key', 'user_id'),)
