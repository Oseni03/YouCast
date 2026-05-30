"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from inngest_django.views import inngest_view_path

urlpatterns = [
    path('', include('apps.feeds.urls_rss')),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/channels/', include('apps.channels.urls')),
    path('api/feeds/', include('apps.feeds.urls')),
    path('api/episodes/', include('apps.episodes.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]

urlpatterns += [inngest_view_path]