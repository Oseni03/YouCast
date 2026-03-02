from django.urls import path
from . import views

urlpatterns = [
    path('directories/',             views.DirectoryListView.as_view(),       name='directory_list'),
    path('directories/<uuid:directory_id>/', views.DirectoryDetailView.as_view(), name='directory_detail'),
    path('preview/<uuid:channel_id>/',       views.FeedPreviewView.as_view(),      name='feed_preview'),
]