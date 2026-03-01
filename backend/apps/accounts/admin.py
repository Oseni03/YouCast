from django.contrib import admin
from .models import Creator

@admin.register(Creator)
class CreatorAdmin(admin.ModelAdmin):
    list_display = [
        'email', 'display_name', 'plan_tier', 'tos_accepted_at',
        'created_at', 'updated_at',
    ]
    list_filter = ['plan_tier', 'tos_accepted_at']
    search_fields = ['email', 'display_name']
    readonly_fields = ['created_at', 'updated_at', 'tos_accepted_at']
    ordering = ['-created_at']
