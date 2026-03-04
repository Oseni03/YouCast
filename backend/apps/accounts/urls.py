from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Email/Password flow
    path('signup/',          views.SignupView.as_view(),                    name='signup'),
    path('login/',           views.EmailLoginView.as_view(),                name='login'),
    path('logout/',          views.LogoutView.as_view(),                    name='logout'),
    path('deactivate/',      views.DeactivateAccountView.as_view(),         name='deactivate'),

    # OAuth flow
    path('google/callback/', views.GoogleOAuthCallbackView.as_view(),      name='google_callback'),
    path('google/token/',    views.GoogleOAuthTokenExchangeView.as_view(),  name='google_token'),

    # Session management
    path('refresh/',         TokenRefreshView.as_view(),                    name='token_refresh'),
    path('logout/',          views.LogoutView.as_view(),                    name='logout'),

    # Creator profile
    path('me/',              views.MeView.as_view(),                        name='me'),
    path('tos/',             views.TOSAcceptView.as_view(),                 name='tos_accept'),
]