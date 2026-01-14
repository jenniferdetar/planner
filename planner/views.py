from django.shortcuts import render
from django.template import TemplateDoesNotExist
from .models import Goals, OpusTasks, CalendarRecurring, HoaExpenses, HoursWorked, OpusMeetings

def goals_view(request):
    goals = Goals.objects.all()
    return render(request, 'goals.html', {'goals': goals})

def calendar_view(request):
    from datetime import date, timedelta
    recurring_events = CalendarRecurring.objects.all()
    upcoming_meetings = OpusMeetings.objects.filter(date__gte=date.today(), date__lte=date.today() + timedelta(days=14)).order_by('date')
    
    template = 'index.html' if request.path in ['', '/', '/index.html'] else 'calendar.html'
    
    return render(request, template, {
        'recurring_events': recurring_events,
        'upcoming_meetings': upcoming_meetings
    })

def finance_view(request):
    hoa_expenses = HoaExpenses.objects.all()
    return render(request, 'finance.html', {'hoa_expenses': hoa_expenses})

def personal_planner_view(request):
    tasks = OpusTasks.objects.all()
    return render(request, 'personal-planner/index.html', {'tasks': tasks})

def work_planner_view(request):
    tasks = OpusTasks.objects.filter(category='Work')
    return render(request, 'work-planner/index.html', {'tasks': tasks})

def login_view(request):
    return render(request, 'login.html')

def dynamic_template_view(request, template_path):
    if not template_path.endswith('.html'):
        template_path += '.html'
    try:
        return render(request, template_path)
    except TemplateDoesNotExist:
        return render(request, '404.html', status=404)
