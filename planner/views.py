from django.shortcuts import render
from django.template import TemplateDoesNotExist

def dynamic_template_view(request, template_path):
    # 1. Handle CSEA nesting cleanup
    if template_path.startswith('csea/') and template_path.count('/') == 1:
        inner_path = template_path.split('/', 1)[1]
        # Only allow real CSEA pages in the subdirectory
        if not inner_path.startswith('csea-') and inner_path not in ['index.html', 'issue-log.html']:
            template_path = inner_path[:-5] if inner_path.endswith('.html') else inner_path

    # 2. Try template variations, including folder index pages.
    candidates = []
    if template_path.endswith('.html'):
        candidates.append(template_path)
    else:
        candidates.append(f"{template_path}.html")
        candidates.append(f"{template_path}/index.html")

    for candidate in candidates:
        try:
            return render(request, candidate)
        except TemplateDoesNotExist:
            # Fallback to html/ subdirectory for top-level templates only.
            if '/' not in candidate:
                try:
                    return render(request, f"html/{candidate}")
                except TemplateDoesNotExist:
                    pass

    return render(request, '404.html', status=404)

def finance_view(request):
    return render(request, 'finance.html')

def calendar_view(request):
    return render(request, 'calendar.html')

def login_view(request):
    return render(request, 'login.html')
