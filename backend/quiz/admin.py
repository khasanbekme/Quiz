from django.contrib import admin
from .models import *


admin.site.register(QuestionCategory)
admin.site.register(Question)

admin.site.register(QuestionOption)

admin.site.register(QuizCategory)
admin.site.register(Quiz)

admin.site.register(QuizQuestion)

admin.site.register(QuizInstanceQuestion)

admin.site.register(UserAttempt)

