from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Company, ReportTask, ReportStatus



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')




class RegisterSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(write_only=True)
    age = serializers.IntegerField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email', 'phone', 'age')



    def create(self, validated_data):
        # Profil ma'lumotlarini alohida olib olamiz
        phone = validated_data.pop('phone')
        age = validated_data.pop('age')

        # User yaratamiz
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', '')
        )

        # Userga tegishli Profilni yaratamiz
        Profile.objects.create(user=user, phone=phone, age=age)
        return user



class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'is_nds_payer', 'inn']
        read_only_fields = ['owner'] # Owner avtomatik login qilgan user bo'ladi


class ReportTaskSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')

    class Meta:
        model = ReportTask
        fields = ['id', 'company_name', 'report_type', 'deadline', 'is_completed']


class ReportStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportStatus
        fields = ['id', 'company', 'report_name', 'is_completed']