
from django.contrib import admin
from .models import GatePass 

class GatePassAdmin(admin.ModelAdmin):
    list_display = (
        'student__user__username',
        'request_type',
        'status',
        'reason',
        'departure_datetime',
    )

    readonly_fields = (
        'created_at',
        'updated_at',
        'exit_time',
        'entry_time'
    )

    # Optional but helpful: add search and filter capabilities
    search_fields = ('student__user__username', 'qr_code_id')
    list_filter = ('status', 'request_type')

admin.site.register(GatePass, GatePassAdmin)