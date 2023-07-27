from rest_framework import serializers
from quiz.models import (
    QuestionCategory,
    Question,
    QuestionOption,
    QuizCategory,
    Quiz,
    QuizQuestion,
    QuizQuestionGroup,
    AllowedUser,
    UserAttempt,
    QuizInstanceQuestion,
    QuizInstanceOption,
)
from account.api.serializers import GradeSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

# Question serializers


class QuestionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionCategory
        fields = ["id", "name", "total_questions"]


class QuestionSerializer(serializers.ModelSerializer):
    category = QuestionCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)

    def update(self, instance, validated_data):
        category_id = validated_data.pop("category_id", None)

        if category_id is not None:
            instance.category_id = category_id

        return super().update(instance, validated_data)

    class Meta:
        model = Question
        fields = [
            "id",
            "category",
            "category_id",
            "body_text",
            "body_photo",
            "score",
            "updated",
        ]


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = "__all__"


class ExcelUploadSerializer(serializers.Serializer):
    excel_file = serializers.FileField()
    options = serializers.IntegerField()
    category = serializers.IntegerField()


# Quiz serializers


class QuizCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizCategory
        fields = ["id", "name", "total_quizes"]


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "category",
            "start_time",
            "duration",
            "end_time",
            "access",
            "has_random_questions",
            "has_random_options",
            "grouped_questions",
            "attempts",
            "total_questions",
            "questions",
            "total_participants",
        ]


class QuizQuestionSerializer(serializers.ModelSerializer):
    question = QuestionSerializer()

    class Meta:
        model = QuizQuestion
        fields = "__all__"


class BulkQuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = "__all__"


class QuizQuestionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestionGroup
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    grade = GradeSerializer()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "grade"]


class AllowedUserSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = AllowedUser
        fields = ["id", "user"]


class QuestionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestionGroup
        fields = ["id", "title", "total_questions", "point"]


class UserQuizSerializer(serializers.ModelSerializer):
    category = QuizCategorySerializer()
    past_attempts = serializers.SerializerMethodField()
    left_attempts = serializers.SerializerMethodField()
    active = serializers.SerializerMethodField()
    question_groups = serializers.SerializerMethodField()
    
    def get_past_attempts(self, obj: Quiz):
        request = self.context.get("request")
        user: User = request.user if request else None
        past_attempts = user.attempts.filter(quiz=obj).count()
        return past_attempts

    def get_left_attempts(self, obj: Quiz):
        return obj.attempts - self.get_past_attempts(obj)

    def get_active(self, obj: Quiz):
        if obj.status != 0:
            return None
        request = self.context.get("request")
        user: User = request.user if request else None
        local_time = timezone.localtime()
        active_attempts = user.attempts.filter(
            quiz=obj,
            is_completed=False,
            started_at__lte=local_time,
            end_time__gte=local_time,
        )
        if len(active_attempts):
            active = active_attempts.first()
            return {
                "id": active.id,
                "end_time": timezone.localtime(active.end_time),
            }
        else:
            return None

    def get_question_groups(self, obj: Quiz):
        if not obj.grouped_questions:
            return None
        group_serializer = QuestionGroupSerializer(obj.question_groups.all(), many=True)
        return group_serializer.data

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "category",
            "start_time",
            "duration",
            "end_time",
            "questions",
            "question_groups",
            "past_attempts",
            "left_attempts",
            "active",
        ]


class OptionInstanceSerializer(serializers.ModelSerializer):
    body_text = serializers.CharField(source="option.body_text")
    body_photo = serializers.CharField(source="option.body_photo_url")

    class Meta:
        model = QuizInstanceOption
        fields = ["id", "body_text", "body_photo", "option_order", "selected"]


class QuestionInstanceSerializer(serializers.ModelSerializer):
    body_text = serializers.CharField(source="question.body_text")
    body_photo = serializers.CharField(source="question.body_photo_url")
    options = OptionInstanceSerializer(many=True)

    class Meta:
        model = QuizInstanceQuestion
        fields = ["id", "group", "body_text", "body_photo", "question_order", "options"]


class UserAttemptSerializer(serializers.ModelSerializer):
    quiz = UserQuizSerializer()
    questions = QuestionInstanceSerializer(source="instance_questions", many=True)

    class Meta:
        model = UserAttempt
        fields = [
            "id",
            "quiz",
            "started_at",
            "end_time",
            "is_completed",
            "completed_at",
            "questions",
        ]
