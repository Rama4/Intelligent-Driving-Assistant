from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('/home', views.home, name='home'),
    path('/upload', views.upload_mp3, name='upload'),
    path('/download/', views.download_file, name='download'),
    path('/list_pending_files', views.list_pending_files, name='list_pending_files'),
    path('/collisioncheck', views.check_collision, name='check_collision'),
    path('/drivingscore', views.driving_score, name='driving_score'),
    # New recommendation endpoints
    path('/recommendations/collaborative', views.get_collaborative_recommendations, name='collaborative_recommendations'),
    path('/recommendations/content', views.get_content_based_recommendations, name='content_recommendations'),
]