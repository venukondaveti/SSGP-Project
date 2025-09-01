from django.urls import path,include
from .import views
urlpatterns = [
    
    path('login/<str:role>/', views.Login_view, name='login_view'),
    path('Request/',include('gatepass.urls')),
    path('Profile/',views.Profile,name = 'profile'),

    # Student
    path('Student/DashBoard/',views.Student_DashBoard,name = 'student_dashboard'),
    path('Student/GuideLines/',views.Student_Guidelines,name = 'guidelines'),

    #Administration
    path('Administration/DashBoard/',views.Administration_DashBoard,name = 'administration_dashboard'),
    path('StudentStats/',views.Student_Stats,name='student_stats'),

    path('Logout/',views.logout_view,name = 'logout')
]

    