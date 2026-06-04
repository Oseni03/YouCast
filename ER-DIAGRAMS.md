# Opticast ER Diagrams

This file documents the relationships between the Django models used by Opticast.

## Entity Relationship Diagram

```mermaid
erDiagram
    CREATOR {
        id UUID PK
        google_user_id string
        email string
        username string
        avatar_url string
        bio text
        plan_tier string
        stripe_customer_id string
        stripe_subscription_id string
        google_access_token text
        google_refresh_token text
        token_expiry datetime
        is_active boolean
        is_staff boolean
        tos_accepted_at datetime
        created_at datetime
        updated_at datetime
    }

    NOTIFICATION_PREFERENCES {
        creator_id UUID PK FK
        email_notifications boolean
        push_notifications boolean
        marketing_emails boolean
        created_at datetime
        updated_at datetime
    }

    CHANNEL {
        id UUID PK
        creator_id UUID FK
        youtube_channel_id string
        channel_title string
        channel_description text
        channel_thumbnail_url string
        youtube_uploads_playlist_id string
        podcast_title string
        podcast_description text
        artwork_url string
        rss_slug string
        custom_domain string
        language string
        category string
        explicit boolean
        episode_prefix text
        episode_suffix text
        filter_config json
        monitoring_active boolean
        websub_subscribed_at datetime
        websub_expires_at datetime
        last_polled_at datetime
        last_video_published_at datetime
        created_at datetime
        updated_at datetime
    }

    EPISODE {
        id UUID PK
        channel_id UUID FK
        youtube_video_id string
        youtube_url string
        title string
        description text
        youtube_pub_date datetime
        duration_seconds int
        thumbnail_url string
        youtube_chapters json
        audio_url string
        audio_s3_key string
        audio_size_bytes bigint
        audio_format string
        processing_status string
        processing_started_at datetime
        processing_completed_at datetime
        processing_error text
        retry_count int
        episode_number int
        season_number int
        pub_date datetime
        transcript_url string
        download_count bigint
        created_at datetime
        updated_at datetime
    }

    PODCAST_DIRECTORY {
        id UUID PK
        channel_id UUID FK
        platform string
        status string
        feed_url string
        submit_date datetime
        notes text
        created_at datetime
        updated_at datetime
    }

    SUBSCRIPTION {
        id UUID PK
        creator_id UUID FK
        polar_subscription_id string
        polar_customer_id string
        polar_product_id string
        polar_price_id string
        plan_tier string
        status string
        current_period_start datetime
        current_period_end datetime
        cancel_at_period_end boolean
        canceled_at datetime
        created_at datetime
        updated_at datetime
    }

    ORDER_HISTORY {
        id UUID PK
        creator_id UUID FK
        polar_order_id string
        polar_product_id string
        polar_customer_id string
        amount_cents int
        tax_amount_cents int
        currency string
        status string
        billing_reason string
        invoice_url string
        created_at datetime
        updated_at datetime
    }

    ANALYTICS_EVENT {
        id UUID PK
        episode_id UUID FK
        channel_id UUID FK
        timestamp datetime
        ip_hash string
        country_code string
        user_agent text
        podcast_app string
        bytes_served bigint
        is_bot boolean
    }

    CREATOR ||--|| NOTIFICATION_PREFERENCES : "has"
    CREATOR ||--o{ CHANNEL : "owns"
    CREATOR ||--|| SUBSCRIPTION : "has"
    CREATOR ||--o{ ORDER_HISTORY : "places"
    CHANNEL ||--o{ EPISODE : "publishes"
    CHANNEL ||--o{ PODCAST_DIRECTORY : "submissions"
    EPISODE ||--o{ ANALYTICS_EVENT : "receives"
    CHANNEL ||--o{ ANALYTICS_EVENT : "receives"
    CHANNEL }o--|| CREATOR : "belongs to"
    EPISODE }o--|| CHANNEL : "belongs to"
    NOTIFICATION_PREFERENCES }o--|| CREATOR : "belongs to"
    SUBSCRIPTION }o--|| CREATOR : "belongs to"
    ORDER_HISTORY }o--|| CREATOR : "belongs to"
    PODCAST_DIRECTORY }o--|| CHANNEL : "belongs to"
    ANALYTICS_EVENT }o--|| EPISODE : "belongs to"
    ANALYTICS_EVENT }o--|| CHANNEL : "belongs to"
```

## Domain map

- `Creator` is the central user entity for authenticated creators.
- `NotificationPreferences` stores per-creator email and push preferences.
- `Channel` represents a YouTube channel and the corresponding podcast feed.
- `Episode` represents a YouTube video converted into a podcast episode.
- `PodcastDirectory` tracks directory submission status for each channel.
- `Subscription` mirrors billing data from Polar.sh.
- `OrderHistory` stores billing/order events for creators.
- `AnalyticsEvent` records feed download requests with privacy-safe tracing.

## User flow and data flow

```mermaid
flowchart LR
    subgraph User
        U[Creator]
    end

    subgraph Frontend
        AuthUI[Login / Signup / Profile]
        ChannelUI[Connect / Manage Channels]
        EpisodeUI[Episode List / Retry]
        FeedUI[Feed Settings / Directory Submission]
    end

    subgraph BackendAPI
        AuthAPI[/api/auth/\n(auth/login, signup, me)/]
        ChannelAPI[/api/channels/]
        EpisodeAPI[/api/episodes/]
        FeedAPI[/api/feeds/\n(feed RSS endpoints)/]
        BillingAPI[/api/billing/]
        WebSubCB[/api/channels/websub/callback/]
    end

    subgraph Services
        YouTubeSvc[YouTubeService]
        WebSubSvc[WebSubService]
        AudioTask[Inngest/Celery\nAudio Processing]
        AnalyticsTask[Inngest Analytics Event]
    end

    subgraph Storage
        DB[(Postgres)]
        Cloud[(Cloudinary/S3)]
        Cache[(Redis / Job Broker)]
    end

    U -->|credentials / OAuth| AuthUI
    AuthUI -->|POST login/signup| AuthAPI
    AuthAPI -->|create/update| DB
    AuthUI -->|GET profile| AuthAPI

    U -->|click connect channel| ChannelUI
    ChannelUI -->|POST channel| ChannelAPI
    ChannelAPI -->|verify owner| YouTubeSvc
    ChannelAPI -->|store channel| DB
    ChannelAPI -->|subscribe| WebSubSvc
    ChannelAPI -->|schedule poll| Cache

    Services -->|poll / webhook events| ChannelAPI
    WebSubCB -->|video published event| Services
    Services -->|create queued episode| DB
    Services -->|enqueue process| AudioTask

    EpisodeAPI -->|list, create, retry| DB
    EpisodeAPI -->|GET episode URL| DB
    EpisodeAPI -->|retry| AudioTask

    AudioTask -->|download video| YouTubeSvc
    AudioTask -->|normalize audio| Cloud
    AudioTask -->|update status| DB
    AudioTask -->|trigger feed regen| FeedAPI

    FeedUI -->|update feed settings| FeedAPI
    FeedAPI -->|read channel/episode| DB
    FeedAPI -->|serve RSS| U

    U -->|subscribe to RSS| FeedAPI
    FeedAPI -->|enclosure URL| EpisodeAPI
    EpisodeAPI -->|redirect / analytics| AnalyticsTask
    AnalyticsTask -->|store event| DB
    AnalyticsTask -->|track bytes| DB

    BillingAPI -->|mirror Polar| DB
    BillingAPI -->|provide plan info| AuthUI

    AuthAPI -->|notification prefs| DB
    ChannelAPI -->|channel settings| DB
    EpisodeAPI -->|episode metadata| DB
    FeedAPI -->|directory submissions| DB
```

This diagram shows the creator's major interactions, the backend endpoints they hit, and the data stores where the app persists channel, episode, feed, billing, and analytics state.
