from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer
from datetime import date
from .models import Company, ReportTask, ReportStatus
from .serializers import CompanySerializer, ReportTaskSerializer, ReportStatusSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
import random


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer



class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]


    def get_queryset(self):
        return Company.objects.filter(owner=self.request.user)


    def perform_create(self, serializer):
        company = serializer.save(owner=self.request.user)
        today = date.today()

        if company.is_nds_payer:
            # Agar NDS to'lovchi bo'lsa - faqat NDS hisobotini yaratadi
            ReportTask.objects.create(
                company=company,
                report_type="QQS (NDS) hisoboti",
                deadline=date(today.year, today.month, 20)
            )
            # NDS to'lovchilar yana Foyda solig'i ham topshiradi, xohlasang buni ham qo'sh:
            ReportTask.objects.create(
                company=company,
                report_type="Foyda solig'i hisoboti",
                deadline=date(today.year, today.month, 25)
            )
        else:
            # Agar NDS bo'lmasa - faqat Aylanmadan olinadigan soliqni yaratadi
            ReportTask.objects.create(
                company=company,
                report_type="Aylanmadan olinadigan soliq hisoboti",
                deadline=date(today.year, today.month, 15)
            )


# Hisobotlarni ko'rish uchun alohida View
class ReportTaskListView(generics.ListAPIView):
    serializer_class = ReportTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"Ma'lumot so'rayotgan foydalanuvchi: {user.username}") # Terminalda ko'ring
        queryset = ReportTask.objects.filter(company__owner=user).order_by('deadline')
        print(f"Topilgan hisobotlar soni: {queryset.count()}") # Nechta topganini ko'ring
        return queryset



class AccountantTipsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tips = [
        "Hujjatlarni o'z vaqtida arxivlashni unutmang.",
        "NDS hisobotini topshirishda hisob-fakturalarni qayta tekshiring.",
        "Soliq o'zgarishini kuzatib boring (Soliq.uz).",
        "Xodimning ish haqidan olinadigan daromad solig'ini 15-sanagacha to'lang.",
        "E-imzo (ERI) kalitining amal qilish muddatini tekshirib turing."
        ]
        return Response({"tip": random.choice(tips)})


class ReportStatusView(APIView):
    def get(self, request):
        # Hamma statuslarni bazadan olish
        statuses = ReportStatus.objects.all()
        serializer = ReportStatusSerializer(statuses, many=True)
        return Response(serializer.data)

    def post(self, request):
        company_id = request.data.get('company')
        report_name = request.data.get('report_name')

        # Bazada bormi yoki yo'qligini tekshirish, bo'lsa yangilash, bo'lmasa yaratish
        obj, created = ReportStatus.objects.update_or_create(
            company_id=company_id,
            report_name=report_name,
            defaults={'is_completed': request.data.get('is_completed')}
        )
        return Response({"status": "ok"})





class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer