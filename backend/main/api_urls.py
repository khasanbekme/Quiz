from django.urls import path, include


urlpatterns = [
    path('account/', include('account.api.urls')),
    path('quiz/', include('quiz.api.urls')),
]