from django.db import models
from django.conf import settings
import uuid
from accounts.models import *

class GatePass(models.Model):
    
    REQUEST_TYPE_CHOICES = [
        ('leave', 'Leave'),
        ('outing', 'Outing'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved by Warden'),
        ('rejected', 'Rejected'),
        ('issued', 'Pass Issued'),
        ('off_campus', 'Off Campus'), 
        ('completed', 'Completed'),
        ('late', 'Late Entry'),
    ]

    PARENT_TYPE_CHOICES = [
        ('Father', 'Father'),
        ('Mother', 'Mother'),
        ('Guardian', 'Guardian'),
    ]

    student = models.ForeignKey(Students, on_delete=models.CASCADE, related_name="gate_passes")
    
    request_type = models.CharField(max_length=10, choices=REQUEST_TYPE_CHOICES)
    departure_datetime = models.DateTimeField()
    return_datetime = models.DateTimeField(null=True, blank=True) 
    reason = models.TextField()
    address = models.TextField()
    parent_type = models.CharField(max_length=10, choices=PARENT_TYPE_CHOICES, default='Father')
    parent_name = models.CharField(max_length=100)
    parent_contact = models.CharField(max_length=15)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    approved_by = models.ForeignKey(
        Wardens, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="approved_passes"
    )

    issued_by = models.ForeignKey(
        Caretakers,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="issued_passes"
    )

    scanned_by = models.ForeignKey(
        Security,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scaned_passes"
    )

    is_emergency = models.BooleanField(default=False)
    qr_code_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    approved_at = models.DateTimeField(null=True, blank=True)
    issued_at = models.DateTimeField(null=True, blank=True)
    
    exit_time = models.DateTimeField(null=True, blank=True)
    entry_time = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.get_request_type_display()} ({self.get_status_display()})"
    
    class Meta:
        ordering = ['-created_at']