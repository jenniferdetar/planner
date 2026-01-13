from django.shortcuts import render
from django.template import TemplateDoesNotExist

def dynamic_template_view(request, template_path):
    # 1. Handle CSEA nesting cleanup
    if template_path.startswith('csea/') and template_path.count('/') == 1:
        inner_path = template_path.split('/', 1)[1]
        # Only allow real CSEA pages in the subdirectory
        if not inner_path.startswith('csea-') and inner_path not in ['index.html', 'issue-log.html']:
            template_path = inner_path[:-5] if inner_path.endswith('.html') else inner_path

    # 2. Try to find the template (appending .html)
    actual_template = template_path
    if not actual_template.endswith('.html'):
        actual_template += '.html'
    
    try:
        # Prefer root templates over html/ subdirectory
        return render(request, actual_template)
    except TemplateDoesNotExist:
        # Fallback to check if it exists in 'html/' subdirectory
        if '/' not in actual_template:
            try:
                return render(request, f'html/{actual_template}')
            except TemplateDoesNotExist:
                pass
        return render(request, '404.html', status=404)

def finance_view(request):
    return render(request, 'finance.html')

def calendar_view(request):
    return render(request, 'calendar.html')

def login_view(request):
    return render(request, 'login.html')
