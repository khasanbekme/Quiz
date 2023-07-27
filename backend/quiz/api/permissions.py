from quiz.models import Quiz, UserAttempt
from rest_framework.permissions import BasePermission
from django.utils import timezone


class StartQuizPermission(BasePermission):
    def has_start_permission(request, obj: Quiz):
        is_open = obj.status == 0
        now = timezone.localtime()
        no_active_attempts = (
            request.user.attempts.filter(
                quiz=obj, is_completed=False, started_at__lte=now, end_time__gte=now
            ).count()
            == 0
        )
        has_attempts = obj.attempts - request.user.attempts.filter(quiz=obj).count() > 0
        quiz_permission = (
            obj.access == "private"
            and obj.allowed_users.filter(user=request.user).exists()
            or obj.access == "public"
        )

        return is_open and no_active_attempts and has_attempts and quiz_permission


class UserAttemptSerializer(BasePermission):
    def has_start_permission(request, obj: UserAttempt):
        now = timezone.localtime()

        return (
            obj.user == request.user
            and not obj.is_completed
            and obj.started_at <= now <= obj.end_time
        )
