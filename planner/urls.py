from django.urls import path
from . import views

urlpatterns = [
    path('', views.calendar_view, name='root'),
    path('index.html', views.calendar_view, name='index_html'),
    path('calendar/', views.calendar_view, name='calendar'),
    path('finance/', views.finance_view, name='finance'),
    path('goals/', views.goals_view, name='goals'),
    path('goals.html', views.goals_view, name='goals_html'),
    path('personal-planner/', views.personal_planner_view, name='personal_planner'),
    path('personal-planner/index.html', views.personal_planner_view, name='personal_planner_html'),
    path('work-planner/', views.work_planner_view, name='work_planner'),
    path('work-planner/index.html', views.work_planner_view, name='work_planner_html'),
    path('login.html', views.login_view, name='login'),
    path('<path:template_path>', views.dynamic_template_view, name='dynamic_template'),
]
