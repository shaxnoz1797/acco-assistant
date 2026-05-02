from django.urls import path
from .views import (RegisterView, CompanyListCreateView, ReportTaskListView,
                    AccountantTipsView, ReportStatusView,CompanyDetailView)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('companies/', CompanyListCreateView.as_view(), name='company-list'),
    path('report-status/', ReportStatusView.as_view(), name='report-status'),


    path('my-reports/', ReportTaskListView.as_view(), name='report-list'),
    path('daily-tip/', AccountantTipsView.as_view(), name='daily-tip'),

    path('companies/<int:pk>/', CompanyDetailView.as_view()),
]