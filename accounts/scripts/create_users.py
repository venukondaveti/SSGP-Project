from django.contrib.auth.hashers import make_password
from accounts.models import User, Students, Wardens, Caretakers, Security, Authority
import random

from accounts.models import Students
def run():
    password = make_password("Password@123")

    def create_user(uid, fname, lname, email, role, gender, phone, profile_model, profile_data):
        u = User.objects.create(
            username=uid, first_name=fname, last_name=lname, email=email,
            password=password, role=role, ph_no=phone, gender=gender
        )
        profile_model.objects.create(user=u, **profile_data)

    depts = ['CSE','ECE','CIVIL','MECH','EEE']
    for i in range(581, 600):
        sid = f"S210{i}"
        create_user(
            sid, f"Student{i}", "Test", f"student{i}@example.com",
            User.Role.STUDENT, User.Gender.MALE if i % 2 == 0 else User.Gender.FEMALE,
            f"90000{i}", Students,
            {"year": 2, "dept": random.choice(depts), "hostel": "Block A", "room_no": str(100+i)}
        )

 
    roles = [
        ("W001", "Jane", "Smith", "warden@example.com", User.Role.WARDEN, User.Gender.FEMALE, "4445556660", Wardens, {"years_allowed": "1,2"}),
        ("C001", "Peter", "Jones", "caretaker@example.com", User.Role.CARETAKER, User.Gender.MALE, "7778889990", Caretakers, {"hostel_assigned": "Block A"}),
        ("SEC001", "Susan", "Davis", "security@example.com", User.Role.SECURITY, User.Gender.FEMALE, "1231231230", Security, {}),
        ("A001", "Robert", "Brown", "authority@example.com", User.Role.AUTHORITY, User.Gender.MALE, "4564564560", Authority, {"designation": "Dean of Student Affairs"}),
    ]

    for r in roles:
        create_user(*r)

    print("All users created successfully.")
