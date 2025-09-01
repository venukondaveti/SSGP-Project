from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    User,
    Students,
    Wardens,
    Caretakers,
    Security,
    Authority
)

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role')
    list_filter = ('role',)

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'ph_no', 'gender')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'ph_no', 'gender')}),
    )


admin.site.register(User, CustomUserAdmin)
admin.site.register(Students)
admin.site.register(Wardens)
admin.site.register(Caretakers)
admin.site.register(Security)
admin.site.register(Authority)
