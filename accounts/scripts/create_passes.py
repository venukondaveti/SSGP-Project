import random
from datetime import timedelta
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from accounts.models import Students
from gatepass.models import GatePass

# A list of sample reasons and addresses for creating varied data
SAMPLE_REASONS = [
    "Going home for the weekend",
    "Attending a family function",
    "Medical appointment",
    "Shopping for personal items",
    "Visiting a local guardian",
    "Attending a workshop in town",
    "Library visit for research",
]
SAMPLE_ADDRESSES = [
    "123 Main Street, Srikakulam, Andhra Pradesh",
    "456 Park Avenue, Visakhapatnam, Andhra Pradesh",
    "789 Lake Side, Rajahmundry, Andhra Pradesh",
    "101 Hill Top, Araku Valley, Andhra Pradesh",
    "202 Beach Road, Vizianagaram, Andhra Pradesh",
]
SAMPLE_PARENT_NAMES = [
    "Srinivas Rao", "Lakshmi Devi", "Venkatesh Kumar", "Padma Reddy", "Ravi Teja"
]

def run():
    """
    This is the main function that `runscript` will execute.
    It finds existing students and creates random gate passes for them.
    """
    print("Starting to create sample gate passes for existing students...")

    # Define the range of student IDs
    start_id = 210575
    end_id = 210599

    # Get all possible status choices from the model
    status_choices = [choice[0] for choice in GatePass.STATUS_CHOICES]

    for i in range(start_id, end_id + 1):
        student_id = f"S{i}"
        
        try:
            # --- Find the existing student ---
            # Corrected line: Look for the student via the 'user' relationship's 'username' field.
            student = Students.objects.get(user__username=student_id)
            print(f"Found student: {student_id}. Creating passes...")

            # Create 1 or 2 gate passes for each student
            for _ in range(random.randint(1, 2)):
                # --- Generate Random Data ---
                request_type = random.choice(['leave', 'outing'])
                
                departure_days_from_now = random.randint(1, 10)
                departure_hour = random.randint(8, 18)
                departure_date = timezone.now() + timedelta(days=departure_days_from_now)
                departure_datetime = departure_date.replace(hour=departure_hour, minute=0, second=0, microsecond=0)

                duration_hours = random.randint(4, 48) if request_type == 'outing' else random.randint(48, 120)
                return_datetime = departure_datetime + timedelta(hours=duration_hours)

                # Assign a status, ensuring a good number are 'pending'.
                if random.random() < 0.5:
                    status = 'pending'
                else:
                    status = random.choice(status_choices)

                # --- Create the GatePass Object ---
                GatePass.objects.create(
                    student=student,
                    request_type=request_type,
                    departure_datetime=departure_datetime,
                    return_datetime=return_datetime,
                    reason=random.choice(SAMPLE_REASONS),
                    address=random.choice(SAMPLE_ADDRESSES),
                    parent_type=random.choice(['Father', 'Mother', 'Guardian']),
                    parent_name=random.choice(SAMPLE_PARENT_NAMES),
                    parent_contact=f"98765{random.randint(10000, 99999)}",
                    status=status,
                )

        except ObjectDoesNotExist:
            # If a student doesn't exist, print a warning and continue
            print(f'Warning: Student with ID {student_id} not found. Skipping.')
            continue
    
    print('Successfully created all sample gate passes.')
