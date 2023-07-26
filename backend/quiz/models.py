from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from account.models import Grade

User = settings.AUTH_USER_MODEL

# Quiz questions base


class QuestionCategory(models.Model):
    name = models.TextField(max_length=200)
    updated = models.DateTimeField(auto_now=True)

    @property
    def total_questions(self):
        return self.questions.count()

    def __str__(self):
        return self.name


class Question(models.Model):
    category = models.ForeignKey(
        QuestionCategory, related_name="questions", on_delete=models.CASCADE
    )
    body_text = models.TextField(null=True, blank=True)
    body_photo = models.ImageField(upload_to="questions/", null=True, blank=True)
    score = models.FloatField(default=1)
    updated = models.DateTimeField(auto_now=True)

    @property
    def total_options(self):
        return self.options.count()

    def __str__(self):
        return self.body_text[:50]


class QuestionOption(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="options"
    )
    body_text = models.TextField(null=True, blank=True)
    body_photo = models.ImageField(upload_to="options/", null=True, blank=True)
    order_number = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    is_correct = models.BooleanField(default=False)

    class Meta:
        ordering = ["order_number"]


# quizzes base


class QuizCategory(models.Model):
    name = models.CharField(max_length=200)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def total_quizes(self):
        return self.quizes.count()


class Quiz(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        QuizCategory,
        related_name="quizes",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
    )
    start_time = models.DateTimeField()
    duration = models.PositiveIntegerField()
    end_time = models.DateTimeField(null=True, blank=True)
    access = models.CharField(
        max_length=10,
        choices=(("public", "Public"), ("private", "Private")),
        default="public",
    )
    grouped_questions = models.BooleanField(default=False)
    has_random_questions = models.BooleanField(default=False)
    has_random_options = models.BooleanField(default=False)
    attempts = models.PositiveBigIntegerField(default=1)
    total_questions = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    def save(self, *args, **kwargs):
        if not self.end_time:
            self.end_time = self.start_time + timedelta(minutes=self.duration)
        super().save(*args, **kwargs)

    @property
    def status(self):
        current_time = timezone.localtime()

        if current_time < self.start_time:
            return -1
        elif current_time >= self.start_time and current_time <= self.end_time:
            return 0
        else:
            return 1

    @property
    def questions(self):
        if self.grouped_questions:
            value = self.question_groups.aggregate(value=Sum("total_questions"))[
                "value"
            ]
            return value if value else 0
        else:
            return (
                self.total_questions
                if self.has_random_questions
                else self.quiz_questions.count()
            )

    @property
    def total_participants(self):
        return self.allowed_users.count()

    def __str__(self):
        return self.title

    class Meta:
        ordering = ("-start_time",)


class AllowedGrade(models.Model):
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="allowed_grades"
    )
    grade = models.ForeignKey(
        Grade, on_delete=models.CASCADE, related_name="allowed_quizes"
    )

    def __str__(self):
        return f"{self.quiz.id} - {self.grade.id}"

    class Meta:
        unique_together = ("quiz", "grade")


class AllowedUser(models.Model):
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="allowed_users"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="allowed_quizes"
    )

    def __str__(self):
        return f"{self.quiz.id} - {self.user.id}"

    class Meta:
        unique_together = ("quiz", "user")


class QuizQuestionGroup(models.Model):
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="question_groups"
    )
    title = models.CharField(max_length=255)
    group = models.ForeignKey(QuestionCategory, on_delete=models.CASCADE)
    random_questions = models.BooleanField(default=False)
    random_options = models.BooleanField(default=False)
    total_questions = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    order_number = models.PositiveIntegerField(
        validators=[MinValueValidator(1)], default=1
    )
    point = models.FloatField(default=1.0)

    def save(self, *args, **kwargs):
        if not self.pk:
            highest_order_number = (
                QuizQuestionGroup.objects.filter(quiz=self.quiz)
                .order_by("-order_number")
                .first()
            )
            if highest_order_number is not None:
                self.order_number = highest_order_number.order_number + 1
            else:
                self.order_number = 1

        super().save(*args, **kwargs)


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="quiz_questions"
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order_number = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    score = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ("quiz", "question")
        ordering = ["order_number"]


class UserAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attempts")
    started_at = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True)


class QuizInstanceQuestion(models.Model):
    user_attempt = models.ForeignKey(
        UserAttempt, on_delete=models.CASCADE, related_name="instance_questions"
    )
    group = models.ForeignKey(QuizQuestionGroup, on_delete=models.CASCADE, null=True)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    question_order = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    score = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("user_attempt", "question")


class QuizInstanceOption(models.Model):
    question_instance = models.ForeignKey(
        QuizInstanceQuestion, on_delete=models.CASCADE, related_name="options"
    )
    option = models.ForeignKey(QuestionOption, on_delete=models.CASCADE)
    option_order = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    selected = models.BooleanField(default=False)

    class Meta:
        unique_together = ("question_instance", "option")
