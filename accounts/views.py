from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .forms import LoginForm
from utils.decorators import role_required 
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from .forms import LoginForm

from .models import *
from gatepass.models import GatePass

def Login_view(request, role):
    role = role.lower() 
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                user_role = user.role.lower()
                
                if role == 'authority' and user_role == 'warden':
                    user_role = 'authority'
                if role == user_role:
                    login(request, user)
                    redirect_map = {
                        'student': 'student_dashboard',
                        'warden': 'administration_dashboard',
                        'authority': 'administration_dashboard',
                        'caretaker': 'caretaker_dashboard',
                        'security': 'security_dashboard',
                    }
                    return redirect(redirect_map.get(user_role, 'home'))
                else:
                    form.add_error(None, "Authentication failed: role mismatch.")
            else:
                form.add_error(None, "Invalid username or password.")
    else:
        form = LoginForm()

    template_map = {
        'student': 'Student/student_login.html',
        'authority': 'Administration/AdministrationLogin.html',
        'caretaker': 'Caretaker/Caretaker_Login.html',
        'security': 'Security/SecurityLogin.html',
        'warden': 'Administration/AdministrationLogin.html',
    }

    return render(request, template_map.get(role, 'home.html'), {'form': form})

def logout_view(request):
    logout(request)
    return redirect('home')

@login_required
def Profile(request):
    student = get_object_or_404(Students,user = request.user)
    context  ={
        'student':student
    }
    return render(request,'Home/profile.html',context)

@login_required
@role_required(['STUDENT'])
def Student_DashBoard(request):
    student = get_object_or_404(Students, user=request.user)

    last_scanned = GatePass.objects.filter(
        student=student,
        exit_time__isnull=False
    ).order_by('-exit_time').first()

    current_status = "On Campus"
    status_description = "You are currently inside the campus."

    if last_scanned and last_scanned.entry_time is None:
        current_status = "Outside Campus"
        status_description = "You are currently outside the campus."

    recent_passes = GatePass.objects.filter(
        student=student
    ).order_by('-created_at')[:5]

    context = {
        'student': student,
        'current_status': current_status,
        'status_description': status_description,
        'latest_pass': recent_passes[0],
        'recent_passes':recent_passes
    }
    
    return render(request, 'Student/Home.html', context)
@login_required
@role_required(['STUDENT'])
def Student_Guidelines(request):
    return render(request,'Student/Guidelines.html')

def format_late_duration(gatepass):

    if not (gatepass.entry_time and gatepass.return_datetime):
        return "N/A"

    if gatepass.entry_time <= gatepass.return_datetime:
        return "On Time"

    late_duration = gatepass.entry_time - gatepass.return_datetime
    days = late_duration.days
    hours, remainder = divmod(late_duration.seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    
    parts = []
    if days > 0:
        parts.append(f"{days} {'day' if days == 1 else 'days'}")
    if hours > 0:
        parts.append(f"{hours} {'hr' if hours == 1 else 'hrs'}")
    if minutes > 0:
        parts.append(f"{minutes} {'min' if minutes == 1 else 'mins'}")
        
    return ", ".join(parts) if parts else "0 mins"

def get_stats():
    all_students = Students.objects.select_related('user').all()
    outside_gatepasses = GatePass.objects.filter(status='off_campus').select_related('student__user')
    all_caretakers = Caretakers.objects.select_related('user').all()
    late_gatepasses = GatePass.objects.filter(status='late').select_related('student__user')
    late_students_data = [
        {'gatepass': gp, 'late_by': format_late_duration(gp)}
        for gp in late_gatepasses
    ]
    context = {
        'all_students': all_students,
        'outside_gatepasses': outside_gatepasses,
        'all_caretakers': all_caretakers,
        'late_students_data': late_students_data,
        'all_students_count': all_students.count(),
        'outside_count': outside_gatepasses.count(),
        'caretakers_count': all_caretakers.count(),
        'late_count': late_gatepasses.count(),
    }
    return context

@login_required
@role_required(['AUTHORITY','WARDEN'])
def Administration_DashBoard(request):
    if request.user.role == 'AUTHORITY':
        admin = get_object_or_404(Authority,user = request.user)
        context = get_stats()
        context['admin'] = admin
        return render(request,'Administration/Authority.html',context)
    else:
        return render(request, 'Administration/Home.html')

@login_required
@role_required(['AUTHORITY','WARDEN'])
def Student_Stats(request):
    context = get_stats()
    return render(request, 'Administration/Stats.html', context)
