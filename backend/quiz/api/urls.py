from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuestionCategoryViewSet,
    QuestionViewSet,
    QuestionOptionViewSet,
    ExcelUploadView,
    QuizCategoryViewset,
    QuizViewSet,
    QuizQuestionViewset,
    QuizQuestionGroupViewSet,
    questionIds,
    swapQuestions,
    swapQuestionGroups,
    QuizQuestionBulkView,
    AllowedGradeApiView,
    AllowedUserViewSet,
    AllowedUserBulkView,
    UserQuizView,
)

router = DefaultRouter()
router.register(r"question-category", QuestionCategoryViewSet)
router.register(r"question", QuestionViewSet)
router.register(r"question-options", QuestionOptionViewSet)

router.register(r"quiz-category", QuizCategoryViewset)
router.register(r"quiz", QuizViewSet)
router.register(r"quiz-question", QuizQuestionViewset)
router.register(r"quiz-question-group", QuizQuestionGroupViewSet)
router.register(r"allowed-user", AllowedUserViewSet)


urlpatterns = [
    path("", include(router.urls)),
    path(
        "quiz-question-bulk/", QuizQuestionBulkView.as_view(), name="quiz-question-bulk"
    ),
    path("quiz-questions-ids/", questionIds, name="question-ids"),
    path("swap-questions/", swapQuestions, name="swap-questions"),
    path("swap-question-groups/", swapQuestionGroups, name="swap-question-groups"),
    path(
        "allowed-grade/<int:pk>/", AllowedGradeApiView.as_view(), name="allowed-grade"
    ),
    path(
        "allowed-user-bulk/<int:pk>/",
        AllowedUserBulkView.as_view(),
        name="allowed-user-bulk",
    ),
    path("excel-upload/", ExcelUploadView.as_view(), name="excel-upload"),
    path("user-quiz/", UserQuizView.as_view(), name="user-quiz"),
    path("user-quiz/<int:pk>/", UserQuizView.as_view(), name="user-quiz-retrieve"),
]
