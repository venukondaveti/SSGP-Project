from django.urls import path
from . import views

urlpatterns = [

    # Student URLs
    path('outPassRequest/', views.Request_pass, name='leave_request'),
    path('History/', views.Show_History, name='show_history'),
    path('TrackPass/', views.Track_Pass, name='track_pass'),
    path('ActivePass/', views.Show_pass, name='current_pass'),
    path('ViewPass/<int:pass_id>/', views.Show_pass, name='show_pass'),

    # Administration URLs
    path('ManageRequests/', views.Manage_requests, name='manage_requests'),
    path('UpdateStatus/<int:pk>/', views.update_status, name='update_status'),

    # Caretaker URLs
    path('Caretaker/DashBoard/', views.Caretaker_DashBoard, name='caretaker_dashboard'),
    path('IssuePass/<int:pk>/', views.Issue_pass, name='issue_pass'),

    #Security URLs
    path("security/dashboard/", views.Security_DashBoard, name="security_dashboard"),
    path('verify/pass/<uuid:qr_id>/', views.verify_gatepass_api, name='verify_gatepass_api'),
]
