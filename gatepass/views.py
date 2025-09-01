from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from utils.decorators import role_required
from django.urls import reverse
from django.db.models import Q, Count
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import GatePass
from datetime import datetime
from accounts.models import *

@login_required
@role_required(['STUDENT'])
def Request_pass(request):
    student = get_object_or_404(Students,user = request.user)
    if request.method == 'POST':
        request_type = request.POST.get('requestType')
        departure_str = request.POST.get('departureDateTime')
        return_str = request.POST.get('returnDateTime')

        if request_type == 'outing' and departure_str:
            departure_obj = datetime.fromisoformat(departure_str)
            return_obj = departure_obj.replace(hour=20, minute=0, second=0)
            return_str = return_obj.isoformat()
        new_pass = GatePass(
            student=student,
            request_type=request_type,
            departure_datetime=departure_str,
            return_datetime=return_str if return_str else None,
            reason=request.POST.get('reason'),
            parent_type=request.POST.get('parentType'),
            parent_name=request.POST.get('parentName'),
            parent_contact=request.POST.get('parentContact'),
            address=request.POST.get('address'),
        )
        new_pass.save()
        return redirect('track_pass')
    else:
        context = {
            'student':student
        }
        return render(request, 'Student/Leave_outform.html',context)

def Pass_details(user):
    try:
        latest_pass = GatePass.objects.filter(
            student=user
        ).exclude(
            status__in=['completed', 'late']
        ).latest('created_at')
    except GatePass.DoesNotExist:
        latest_pass = None
    return latest_pass

@login_required
@role_required(['STUDENT'])
def Track_Pass(request):
    student = get_object_or_404(Students,user = request.user)
    latest_pass = Pass_details(student)
    if latest_pass and latest_pass.status == 'completed':
        latest_pass = None
    context = {
        'latest_pass': latest_pass,
        'student': student
    }
    return render(request, 'Student/Tracking.html', context)

@login_required
@role_required(['STUDENT'])
def Show_History(request):
    student = get_object_or_404(Students,user = request.user)
    passes = GatePass.objects.filter(student=student)
    context = {
        'gate_passes': passes,
        'student': student
    }
    return render(request, 'Student/outpass_history.html', context)

@login_required
@role_required(['STUDENT'])
def Show_pass(request, pass_id=None):
    student = get_object_or_404(Students,user = request.user)
    if pass_id:
        cur_pass = get_object_or_404(GatePass, id=pass_id, student=student)
    else:
        cur_pass = Pass_details(student)
        if cur_pass and cur_pass.status != 'issued':
             cur_pass = None
    context = {
        "outpass": cur_pass,
        'student':student
    }
    return render(request, 'Student/outpass.html', context)

## Administration Views
@login_required
@role_required(['WARDEN'])
def Manage_requests(request):
    stats = GatePass.objects.aggregate(
        total_count=Count('id'),
        pending_count=Count('id', filter=Q(status='pending')),
        approved_count=Count('id', filter=Q(status='approved')),
        rejected_count=Count('id', filter=Q(status='rejected'))
    )
    requests_list = GatePass.objects.select_related('student').all()
    status_filter = request.GET.get('status')
    search_term = request.GET.get('search')

    if status_filter and status_filter != 'All':
        requests_list = requests_list.filter(status=status_filter)
    if search_term:
        requests_list = requests_list.filter(
            Q(student__user__username__icontains=search_term) |
            Q(student__user__first_name__icontains=search_term) |
            Q(student__user__last_name__icontains=search_term)
        )
    context = {
        'requests': requests_list,
        'stats': stats,
    }
    return render(request, 'Administration/Requests.html', context)

@login_required
@role_required(['WARDEN'])
def update_status(request, pk):
    warden = get_object_or_404(Wardens,user = request.user)
    gate_pass = get_object_or_404(GatePass, pk=pk)
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status == 'approved':
            gate_pass.status = 'approved'
            gate_pass.approved_by = warden
            gate_pass.approved_at = timezone.now()
            gate_pass.save()
        elif new_status == 'rejected':
            gate_pass.status = 'rejected'
            gate_pass.save()
    return redirect(reverse('manage_requests'))

## Caretaker Views
@login_required
@role_required(['CARETAKER'])
def Caretaker_DashBoard(request):
    requests = GatePass.objects.select_related('student').filter(status='approved')
    context = {
        'requests': requests
    }
    return render(request, 'Caretaker/Home.html', context)

@login_required
@role_required(['CARETAKER'])
def Issue_pass(request, pk):
    if request.method == 'POST':
        caretaker = get_object_or_404(Caretakers,user = request.user)
        outpass = get_object_or_404(GatePass, pk=pk)
        outpass.status = 'issued'
        outpass.issued_by = caretaker
        # FIX: Save the timestamp for when the pass was issued
        outpass.issued_at = timezone.now()
        outpass.save()
    return redirect(reverse('caretaker_dashboard'))

@login_required
@role_required(['SECURITY'])
def Security_DashBoard(request):
    # FIX: Renamed variable to 'recent_scans' to match the HTML template
    recent_scans = GatePass.objects.filter(
        scanned_by__isnull = False
    ).select_related(
        'student__user'
    ).order_by('-exit_time', '-entry_time')[:20]
    context = {
        'recent_scans': recent_scans
    }
    return render(request, 'Security/Home.html',context)

@login_required
@role_required(['SECURITY'])
@require_POST
def verify_gatepass_api(request, qr_id):
    try:
        gate_pass = GatePass.objects.get(qr_code_id=qr_id)
        security_user = get_object_or_404(Security, user=request.user)
    except GatePass.DoesNotExist:
        return JsonResponse({
            "status": "error", "message": "Verification Failed: This pass does not exist. The QR code may be fake."
        }, status=404)

    if gate_pass.status in ['issued', 'off_campus', 'late']:
        scan_type = ""
        if gate_pass.exit_time is None:
            gate_pass.exit_time = timezone.now()
            scan_type = "Exit"
            gate_pass.status = 'off_campus'
        else:
            gate_pass.entry_time = timezone.now()
            scan_type = "Entry"
            if gate_pass.return_datetime and gate_pass.entry_time > gate_pass.return_datetime:
                gate_pass.status = "late"
            else:
                gate_pass.status = "completed"
        
        gate_pass.scanned_by = security_user
        gate_pass.save()

        student_user_account = gate_pass.student.user
        scan_time = timezone.now()
        return JsonResponse({
            "status": "success", 
            "studentName": student_user_account.get_full_name() or student_user_account.username,
            "studentId": student_user_account.username, 
            "scanType": scan_type,
            "scanTime": timezone.now().strftime("%d %b %Y, %I:%M %p"),
            "returnBy": gate_pass.return_datetime.strftime("%d %b %Y, %I:%M %p") if gate_pass.return_datetime else "N/A",
            'scanTime': scan_time
        })
    else:
        if gate_pass.status == 'approved':
            message = "Action Required: Pass is approved but has not been issued by the Caretaker yet."
        elif gate_pass.status == 'pending':
            message = "Information: This pass is still pending approval from the Warden."
        elif gate_pass.status in ['completed', 'rejected']:
            message = f"Verification Failed: This pass has already been {gate_pass.status}."
        else:
            message = "Verification Failed: The pass is in an unknown or invalid state."
        return JsonResponse({"status": "error", "message": message}, status=400)