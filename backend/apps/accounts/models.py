from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import uuid

class PlanTier(models.TextChoices):
    FREE    = 'free',   'Free'
    STARTER = 'starter', 'Starter'
    PRO     = 'pro',    'Pro'
    AGENCY  = 'agency', 'Agency'


class CreatorManager(BaseUserManager):
    def create_user(self, email, google_user_id, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, google_user_id=google_user_id, **extra_fields)
        user.set_unusable_password()
        user.save(using=self._db)
        return user


class Creator(AbstractBaseUser):
    """
    Custom user model — creators authenticate via Google OAuth only.
    No password-based login. AbstractBaseUser gives us session/token
    infrastructure without the username/password fields.
    """
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    google_user_id      = models.CharField(max_length=255, unique=True)
    email               = models.EmailField(unique=True)
    display_name        = models.CharField(max_length=255, blank=True)
    avatar_url          = models.URLField(blank=True)

    plan_tier           = models.CharField(max_length=20, choices=PlanTier.choices, default=PlanTier.FREE)
    stripe_customer_id  = models.CharField(max_length=255, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)

    # OAuth tokens — stored encrypted at rest (via django-encrypted-model-fields)
    google_access_token  = models.TextField(blank=True)   # EncryptedTextField in prod
    google_refresh_token = models.TextField(blank=True)   # EncryptedTextField in prod
    token_expiry         = models.DateTimeField(null=True, blank=True)

    is_active            = models.BooleanField(default=True)
    is_staff             = models.BooleanField(default=False)
    tos_accepted_at      = models.DateTimeField(null=True, blank=True)

    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['google_user_id']
    objects         = CreatorManager()

    class Meta:
        db_table = 'creators'

    def __str__(self):
        return self.email

    @property
    def has_accepted_tos(self):
        return self.tos_accepted_at is not None

    @property
    def channel_limit(self):
        limits = {
            PlanTier.FREE:    1,
            PlanTier.STARTER: 1,
            PlanTier.PRO:     3,
            PlanTier.AGENCY:  20,
        }
        return limits.get(self.plan_tier, 1)