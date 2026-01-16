from django.shortcuts import render
from django.db import DatabaseError
from django.db.utils import OperationalError
from django.template import TemplateDoesNotExist
from .models import OpusGoals, OpusTasks, CalendarRecurring, HoaExpenses, HoursWorked, OpusMeetings

from django.http import HttpResponse

def health_check(request):
    return HttpResponse("OK")

def safe_queryset(queryset):
    try:
        return list(queryset)
    except (OperationalError, DatabaseError):
        return []

def goals_view(request):
    goals = safe_queryset(OpusGoals.objects.all())
    return render(request, 'planning/goals.html', {'goals': goals})

def calendar_view(request):
    from datetime import date, timedelta
    recurring_events = safe_queryset(CalendarRecurring.objects.all())
    upcoming_meetings = safe_queryset(
        OpusMeetings.objects.filter(
            date__gte=date.today(),
            date__lte=date.today() + timedelta(days=14)
        ).order_by('date')
    )
    
    template = 'index.html' if request.path in ['', '/', '/index.html'] else 'calendar/index.html'
    
    return render(request, template, {
        'recurring_events': recurring_events,
        'upcoming_meetings': upcoming_meetings
    })

def finance_view(request):
    hoa_expenses = safe_queryset(HoaExpenses.objects.all())
    return render(request, 'finance/index.html', {'hoa_expenses': hoa_expenses})

def personal_planner_view(request):
    tasks = safe_queryset(OpusTasks.objects.all())
    return render(request, 'personal-planner/index.html', {'tasks': tasks})

def work_planner_view(request):
    tasks = safe_queryset(OpusTasks.objects.filter(category='Work'))
    return render(request, 'work-planner/index.html', {'tasks': tasks})

def login_view(request):
    return render(request, 'login.html')

def dynamic_template_view(request, template_path):
    # If path ends with a slash, or is empty, try index.html
    if template_path.endswith('/') or not template_path:
        template_path += 'index.html'
    elif not template_path.endswith('.html'):
        # Try as is first (for directories without trailing slash)
        try:
            return render(request, template_path.rstrip('/') + '/index.html')
        except TemplateDoesNotExist:
            template_path += '.html'
    
    try:
        return render(request, template_path)
    except TemplateDoesNotExist:
        return render(request, '404.html', status=404)
