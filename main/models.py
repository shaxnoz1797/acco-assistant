from django.db import models
from django.contrib.auth.models import User



# 1. Foydalanuvchi profili (Qo'shimcha ma'lumotlar uchun)
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, verbose_name="Telefon raqami")
    age = models.IntegerField(null=True, blank=True, verbose_name="Yoshi")

    def __str__(self):
        return self.full_name if self.full_name else self.user.username



# 2. Korxona (Firma) modeli
class Company(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='companies')
    name = models.CharField(max_length=255, verbose_name="Firma nomi")
    is_nds_payer = models.BooleanField(default=False, verbose_name="NDS to'lovchimi?")
    inn = models.CharField(max_length=20, verbose_name="STIR (INN)", unique=True)

    def __str__(self):
        return self.name



# 3. Hisobotlar va ularning muddatlari
class ReportTask(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=255, verbose_name="Hisobot turi") # Masalan: Aylanmadan soliq
    deadline = models.DateField(verbose_name="Topshirish muddati")
    is_completed = models.BooleanField(default=False, verbose_name="Bajarildimi?")

    def __str__(self):
        return f"{self.report_type} - {self.company.name}"



# models.py ichiga qo'shing
class ReportStatus(models.Model):
    company = models.ForeignKey('Company', on_delete=models.CASCADE)
    report_name = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    date_marked = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company.name} - {self.report_name}"