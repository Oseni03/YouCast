from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

class PlanTier(models.TextChoices):
    FREE    = 'free',   'Free'
    STARTER = 'starter', 'Starter'
    PRO     = 'pro',    'Pro'
    AGENCY  = 'agency', 'Agency'


class CreatorManager(BaseUserManager):
    def create_user(self, email, password=None, google_user_id=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, google_user_id=google_user_id, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class Creator(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model — creators authenticate via Google OAuth or Email/Password.
    AbstractBaseUser gives us session/token infrastructure.
    """
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    google_user_id      = models.CharField(max_length=255, unique=True, null=True, blank=True)
    email               = models.EmailField(unique=True)
    username            = models.CharField(max_length=255)
    avatar_url          = models.URLField(blank=True)
    bio                 = models.TextField(blank=True)

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
    REQUIRED_FIELDS = []
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