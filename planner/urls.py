from django.urls import path
from . import views

urlpatterns = [
    path('', views.root_redirect, name='root'),
    path('calendar', views.calendar_view, name='calendar'),
    path('finance', views.finance_view, name='finance'),
    path('login.html', views.login_view, name='login'),
    path('<path:template_path>', views.dynamic_template_view, name='dynamic_template'),
]
