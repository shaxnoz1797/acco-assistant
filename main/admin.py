from django.contrib import admin
from .models import Profile, Company, ReportTask, ReportStatus


admin.site.register(Profile)
admin.site.register(Company)
admin.site.register(ReportTask)
admin.site.register(ReportStatus)
