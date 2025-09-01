from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):

    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        WARDEN = 'WARDEN', 'Warden'
        CARETAKER = 'CARETAKER', 'Caretaker'
        SECURITY = 'SECURITY', 'Security'
        AUTHORITY = 'AUTHORITY', 'Authority'

    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'
    ph_no = models.CharField(max_length=15,blank=True,null = True)
    gender = models.CharField(max_length=10, choices = Gender.choices,blank=True)
    role = models.CharField(max_length=20, choices=Role.choices)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Students(models.Model):

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    year = models.PositiveIntegerField()
    dept = models.CharField(max_length=100)
    hostel = models.CharField(max_length=50)
    room_no = models.CharField(max_length=10)
    
    def __str__(self):
        return f"Student: {self.user.first_name} {self.user.last_name}"

class Wardens(models.Model):

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    years_allowed = models.CharField(max_length=50, help_text="Comma-separated list of years this warden can manage (e.g., 1,2,3)")

    def __str__(self):
        return f"Warden: {self.user.first_name} {self.user.last_name}"

class Caretakers(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    hostel_assigned = models.CharField(max_length=50)

    def __str__(self):
        return f"Caretaker: {self.user.first_name} {self.user.last_name}"

class Security(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)

    def __str__(self):
        return f"Security: {self.user.first_name} {self.user.last_name}"

class Authority(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    designation = models.CharField(max_length=100)

    def __str__(self):
        return f"Authority: {self.user.first_name} {self.user.last_name}"

