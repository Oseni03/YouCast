# YouCast — Detailed User Test Flows

This document outlines complete user flows to test the YouCast platform from signup through podcast management and billing. Each flow includes preconditions, steps, expected outcomes, and edge cases.

---

## 🔐 Flow 1: Google OAuth Authentication & Signup

### Preconditions

- Browser cookies cleared (fresh session)
- User has a Google account with a YouTube channel
- Frontend is at `http://localhost:3000`

### Happy Path — First-Time Google OAuth User

**Steps:**

1. User navigates to frontend homepage
2. Clicks "Sign in with Google" button
3. Frontend redirects to `GET /api/auth/google/authorize/`
4. Backend generates OAuth consent URL with scopes:
    - `youtube.readonly`
    - `openid`, `email`, `profile`
5. User is redirected to Google's consent screen
6. User grants permissions (YouTube access, profile access)
7. Google redirects to `GET /api/auth/google/callback/?code=...&state=...`
8. Backend exchanges code for Google tokens:
    - Access token (short-lived)
    - Refresh token (long-lived)
    - ID token (user identity)
9. Backend creates new Creator record with:
    - `google_user_id` from ID token
    - `email` from ID token
    - `username` from profile
    - `avatar_url` from profile picture
    - `google_access_token` and `google_refresh_token` encrypted
    - `plan_tier = FREE` (default)
    - `channel_limit = 1` (from FREE tier)
10. Backend generates JWT pair:
    - Access token (15min expiry)
    - Refresh token (7 days expiry)
11. Backend redirects frontend to `/onboarding?access_token=...&refresh_token=...`
12. Frontend stores tokens in secure HTTP-only cookies
13. Frontend shows TOS acceptance page

**Expected Outcomes:**

- ✅ Creator record created in database
- ✅ JWT tokens issued and stored
- ✅ User redirected to onboarding flow
- ✅ `has_youtube_connected` = true
- ✅ No channels created yet

**Edge Cases to Test:**

- ❌ User denies YouTube permissions (incomplete_scopes)
    - Expected: Show error, allow re-authenticate
- ❌ State token mismatch (CSRF protection)
    - Expected: Return 400 error
- ❌ Network failure during token exchange
    - Expected: Retry logic, fallback message
- ❌ Google returns additional scopes user didn't grant
    - Expected: Accept gracefully (OAUTHLIB_RELAX_TOKEN_SCOPE enabled)

---

### Returning Google OAuth User

**Preconditions:**

- Creator already exists in database (previous login)

**Steps:**

1. User navigates to homepage
2. Clicks "Sign in with Google"
3. Google recognizes user and skips consent screen (if scopes unchanged)
4. Backend verifies state, exchanges code
5. Backend retrieves existing Creator by `google_user_id`
6. Backend checks if `token_expiry` is passed:
    - If **valid**: Skips refresh (uses existing tokens)
    - If **expired**: Uses `google_refresh_token` to get new access token
7. Backend updates `updated_at` timestamp
8. Backend issues new JWT pair
9. User redirected to dashboard

**Expected Outcomes:**

- ✅ Creator not duplicated (unique on google_user_id)
- ✅ Tokens refreshed automatically if needed
- ✅ User logged in without re-granting consent

---

## 🔐 Flow 2: Email/Password Authentication (Alternative)

### Preconditions

- User doesn't have Google OAuth setup
- Backend accepts email/password signup

### Signup (Email)

**Steps:**

1. User navigates to `/auth/signup`
2. Enters email and creates password
3. Frontend validates password strength (min 8 chars, mixed case, numbers)
4. Frontend POST to `POST /api/auth/signup/`
    ```json
    {
    	"email": "creator@example.com",
    	"password": "SecurePass123!",
    	"username": "my_channel"
    }
    ```
5. Backend hashes password with Django's PBKDF2
6. Backend creates Creator with:
    - `email` (normalized, lowercased)
    - `password_hash`
    - `plan_tier = FREE`
    - `google_user_id = null`
7. Backend returns JWT pair
8. Frontend stores tokens and shows TOS page

**Expected Outcomes:**

- ✅ Creator created without Google tokens
- ✅ JWT issued
- ✅ `has_youtube_connected` = false (until OAuth added)

**Edge Cases:**

- ❌ Email already registered
    - Expected: 400 "Email already in use"
- ❌ Weak password (e.g., "123456")
    - Expected: 400 "Password does not meet requirements"
- ❌ Invalid email format
    - Expected: 400 validation error

### Login (Email)

**Steps:**

1. User navigates to `/auth/login`
2. Enters email and password
3. Frontend POST to `POST /api/auth/login/`
    ```json
    {
    	"email": "creator@example.com",
    	"password": "SecurePass123!"
    }
    ```
4. Backend verifies password with Django's check_password()
5. If valid, issues JWT pair
6. Frontend stores tokens

**Expected Outcomes:**

- ✅ Valid credentials → JWT issued
- ✅ Logged in and redirected to dashboard

**Edge Cases:**

- ❌ Wrong password
    - Expected: 401 "Invalid credentials"
- ❌ User doesn't exist
    - Expected: 401 (don't reveal whether email exists)
- ❌ Account is_active = false
    - Expected: 401 "Account is disabled"

---

## 📋 Flow 3: Onboarding — TOS & First Channel Setup

### Preconditions

- User just authenticated (Google or Email)
- No channels created yet
- User is at `/onboarding`

### TOS Acceptance

**Steps:**

1. Frontend displays TOS page with full terms
2. User checks "I agree to Terms of Service"
3. Frontend POST to `POST /api/auth/tos/accept/`
4. Backend sets `tos_accepted_at = now()`
5. Backend returns updated Creator

**Expected Outcomes:**

- ✅ `has_accepted_tos` = true
- ✅ User can now create channels

**Edge Cases:**

- ❌ POST without accepting checkbox
    - Expected: 400 error
- ❌ User navigates away before accepting
    - Expected: Return to TOS page on next login

---

### Connect First YouTube Channel

**Steps:**

1. Frontend shows "Connect Your YouTube Channel" form
2. User clicks "Authorize YouTube" button
3. Frontend redirects to `GET /api/auth/google/authorize/?token=<existing_jwt>`
    - Includes existing JWT to maintain session
4. Google OAuth flow again (if refresh token expired)
    - Or skips consent if still authorized
5. Backend redirects to onboarding with channel list
6. User selects which YouTube channel to import
7. Frontend POST to `POST /api/channels/`
    ```json
    {
    	"youtube_channel_id": "UCxxxxx"
    }
    ```
8. Backend calls YouTube API to fetch:
    - `channel_title`
    - `channel_description`
    - `channel_thumbnail_url`
    - `youtube_uploads_playlist_id`
9. Backend creates Channel record:
    - `creator_id = current_user`
    - `youtube_channel_id` (unique)
    - `rss_slug = auto-generated-slug` (unique)
    - `podcast_title = channel_title` (can be customized)
    - `monitoring_active = true`
10. Backend triggers WebSub subscription:
    - Subscribes to YouTube's PubSubHubbub feed for the channel
    - Sets `websub_subscribed_at` and `websub_expires_at`
11. Backend schedules first polling job (15-min fallback)
12. Frontend redirects to channel dashboard

**Expected Outcomes:**

- ✅ Channel created with YouTube metadata
- ✅ `channel_limit` respected (FREE = 1)
- ✅ WebSub subscription active
- ✅ Eligible videos queued for processing

**Edge Cases:**

- ❌ User already connected this channel
    - Expected: 400 "Channel already connected by another user"
- ❌ Private YouTube channel
    - Expected: 403 "Cannot access channel"
- ❌ User has reached channel limit
    - Expected: 400 "Upgrade plan to add more channels"
- ❌ YouTube API quota exceeded
    - Expected: 429 rate limit; retry in UI

---

## 📺 Flow 4: Channel Management

### View Connected Channels

**Preconditions:**

- User authenticated with ≥1 channel

**Steps:**

1. User navigates to `/projects` (channels dashboard)
2. Frontend GET `GET /api/channels/`
3. Backend returns all channels for creator:
    ```json
    [
    	{
    		"id": "uuid-1",
    		"youtube_channel_id": "UCxxxxx",
    		"channel_title": "My Channel",
    		"podcast_title": "My Podcast",
    		"rss_slug": "my-podcast",
    		"monitoring_active": true,
    		"episode_count": 42,
    		"last_video_published_at": "2025-12-01T10:00:00Z",
    		"websub_subscribed_at": "2025-11-15T08:30:00Z",
    		"websub_expires_at": "2025-12-15T08:30:00Z"
    	}
    ]
    ```
4. Frontend displays as cards with status badges

**Expected Outcomes:**

- ✅ All channels listed
- ✅ WebSub status visible
- ✅ Episode count displayed
- ✅ Can click to detail view

---

### View Channel Details & Settings

**Steps:**

1. User clicks on a channel card
2. Frontend GET `GET /api/channels/<channel_id>/`
3. Backend returns full channel including `filter_config`:
    ```json
    {
    	"id": "uuid-1",
    	"youtube_channel_id": "UCxxxxx",
    	"channel_title": "My Channel",
    	"podcast_title": "My Podcast (Customized)",
    	"podcast_description": "Weekly tech interviews",
    	"artwork_url": "https://...",
    	"rss_slug": "my-podcast",
    	"language": "en",
    	"category": "Technology",
    	"explicit": false,
    	"episode_prefix": "Ep. ",
    	"episode_suffix": " | Podcast",
    	"filter_config": {
    		"min_duration_seconds": 600,
    		"title_include_keywords": ["interview", "podcast"],
    		"title_exclude_keywords": ["#shorts"],
    		"include_playlist_ids": [],
    		"exclude_playlist_ids": [""]
    	},
    	"monitoring_active": true,
    	"websub_subscribed_at": "...",
    	"created_at": "..."
    }
    ```
4. Frontend displays settings form with all editable fields

**Expected Outcomes:**

- ✅ All channel metadata displayed
- ✅ Filter rules shown and editable

---

### Update Channel Settings

**Steps:**

1. User modifies fields:
    - Podcast title
    - Description
    - Category
    - Artwork URL
    - Filters (keywords, duration, etc.)
2. Frontend PUT to `PUT /api/channels/<channel_id>/`
3. Backend validates and updates Channel record
4. Backend returns updated channel

**Expected Outcomes:**

- ✅ Changes persisted
- ✅ Next polling applies new filters

**Edge Cases:**

- ❌ `rss_slug` changed to duplicate
    - Expected: 400 "Slug already taken"
- ❌ Invalid artwork URL (404)
    - Expected: Warn user but allow save (will show fallback)
- ❌ Filters changed mid-processing
    - Expected: Apply to new episodes, existing ones unaffected

---

### Refresh Channel Metadata from YouTube

**Steps:**

1. User clicks "Refresh from YouTube" button
2. Frontend POST to `POST /api/channels/<channel_id>/refresh/`
3. Backend calls YouTube API for fresh metadata
4. Backend updates:
    - `channel_title`
    - `channel_description`
    - `channel_thumbnail_url`
5. If WebSub subscription is near expiry, renew it
6. Returns updated channel

**Expected Outcomes:**

- ✅ Latest YouTube data synced
- ✅ WebSub renewed if needed

---

### Get Eligible Videos for Channel

**Steps:**

1. User is viewing a channel's settings
2. Frontend GET `GET /api/channels/<channel_id>/eligible-videos/`
3. Backend queries YouTube uploads playlist
4. Backend applies channel's `filter_config`:
    - Duration >= `min_duration_seconds`
    - Title includes/excludes keywords
    - Playlist filtering
5. Returns list of videos that would be processed

```json
{
	"total": 15,
	"eligible": [
		{
			"youtube_video_id": "abc123",
			"title": "Interview with Jane Doe",
			"duration_seconds": 3600,
			"published_at": "2025-12-01T10:00:00Z",
			"reason_included": "matches filters"
		}
	],
	"excluded": [
		{
			"youtube_video_id": "xyz789",
			"title": "Shorts Compilation #5",
			"duration_seconds": 60,
			"published_at": "2025-11-30T15:00:00Z",
			"reason_excluded": "duration < 600s and '#shorts' in title"
		}
	]
}
```

**Expected Outcomes:**

- ✅ User can see why videos are included/excluded
- ✅ Can adjust filters based on preview

---

### Pause/Resume Monitoring

**Steps:**

1. User toggles "Monitoring Active" switch on channel
2. Frontend PATCH `PATCH /api/channels/<channel_id>/`
    ```json
    { "monitoring_active": false }
    ```
3. Backend updates and persists

**Expected Outcomes:**

- ✅ No new episodes queued while paused
- ✅ WebSub messages ignored (but still received)
- ✅ Polling paused

---

### View WebSub Status

**Steps:**

1. Frontend displays WebSub subscription status
    - Subscribed date
    - Expiration date (24-hour leeway before re-subscribe)
    - Auto-renews in background

**Expected Outcomes:**

- ✅ User can see subscription health
- ✅ Backend auto-renews before expiry (Inngest scheduled job)

---

## 🎙️ Flow 5: Episode Management

### View All Episodes (Multi-Channel)

**Preconditions:**

- User has ≥1 channel with episodes

**Steps:**

1. User navigates to `/projects` (or episodes view)
2. Frontend GET `GET /api/episodes/`
3. Backend returns episodes from all user's channels:
    - Supports pagination (page, page_size)
    - Can filter by channel: `?channel=<uuid>`
    - Can filter by status: `?status=queued|processing|complete|failed|skipped`
    - Can search: `?search=keyword`
4. Frontend displays table with columns:
    - Episode title
    - Channel name
    - Status badge (color-coded)
    - Duration
    - Published date
    - Actions (view, delete, retry)

```json
{
	"count": 156,
	"page": 1,
	"results": [
		{
			"id": "uuid-ep-1",
			"youtube_video_id": "abc123",
			"title": "Interview with Expert",
			"channel_id": "uuid-ch-1",
			"channel_title": "My Channel",
			"processing_status": "complete",
			"duration_seconds": 3600,
			"youtube_pub_date": "2025-12-01T10:00:00Z",
			"pub_date": "2025-12-01T10:00:00Z",
			"processing_completed_at": "2025-12-01T10:45:00Z",
			"download_count": 342,
			"audio_format": "mp3"
		}
	]
}
```

**Expected Outcomes:**

- ✅ Paginated results
- ✅ Filterable by status
- ✅ Searchable by title/description

---

### View Episode Detail

**Steps:**

1. User clicks on episode in list
2. Frontend GET `GET /api/episodes/<episode_id>/`
3. Backend returns full episode:
    ```json
    {
    	"id": "uuid-ep-1",
    	"youtube_video_id": "abc123",
    	"title": "Interview with Expert",
    	"description": "Full description...",
    	"duration_seconds": 3600,
    	"youtube_pub_date": "2025-12-01T10:00:00Z",
    	"thumbnail_url": "https://...",
    	"youtube_chapters": [
    		{ "title": "Intro", "start_seconds": 0 },
    		{ "title": "Main Interview", "start_seconds": 120 },
    		{ "title": "Q&A", "start_seconds": 1800 }
    	],
    	"processing_status": "complete",
    	"processing_started_at": "2025-12-01T10:02:00Z",
    	"processing_completed_at": "2025-12-01T10:45:00Z",
    	"processing_error": null,
    	"retry_count": 0,
    	"audio_url": "https://cloudinary.../episode-uuid.mp3",
    	"audio_size_bytes": 45000000,
    	"audio_format": "mp3",
    	"transcript_url": "https://...",
    	"download_count": 342
    }
    ```
4. Frontend displays detailed panel with:
    - Video thumbnail
    - Title and description
    - Processing timeline
    - Chapters (if available)
    - Audio player (if complete)
    - Download button (for Spotify, Apple, etc.)
    - Retry button (if failed)

**Expected Outcomes:**

- ✅ All episode data visible
- ✅ Audio player functional
- ✅ Chapters displayed
- ✅ Processing errors visible

---

### Manual Episode Submission

**Steps:**

1. User navigates to channel view
2. Clicks "Add Episode Manually" button
3. Frontend shows form with YouTube video ID input
4. User enters video ID (or pastes full URL)
5. Frontend POST to `POST /api/episodes/`
    ```json
    {
    	"channel_id": "uuid-ch-1",
    	"youtube_video_id": "abc123"
    }
    ```
6. Backend fetches video details from YouTube API
7. Backend creates Episode record with `processing_status = QUEUED`
8. Backend sends Inngest event: `youtube/audio.extract`
9. Frontend shows success toast

**Expected Outcomes:**

- ✅ Episode created
- ✅ Processing queued
- ✅ User sees it in episode list immediately (status: Queued)

**Edge Cases:**

- ❌ Video doesn't exist
    - Expected: 404 "YouTube video not found"
- ❌ Episode already exists (same youtube_video_id)
    - Expected: 400 "Episode already exists"
- ❌ Video filtered out by channel rules
    - Expected: Allow creation anyway (override manual submission)

---

### Episode Processing Pipeline (Background)

**Preconditions:**

- Episode created with `processing_status = QUEUED`

**Steps (Inngest Workflow):**

1. Inngest receives event: `youtube/audio.extract`
2. **Audio Extraction** (via yt-dlp):
    - Download best audio stream from YouTube
    - Extract metadata (chapters, duration, transcript)
    - Status → `PROCESSING`
3. **Loudness Normalization** (via FFmpeg):
    - Apply normalization to -16 LUFS (EBU R128 standard)
    - Maintain audio quality
4. **Format Conversion**:
    - Re-encode to MP3 (128 kbps) or AAC
5. **Upload to Storage** (Cloudinary):
    - Generate signed URL with 1-year expiry
    - Store permanent reference in `audio_s3_key`
6. **Update Episode Record**:
    - `processing_status = COMPLETE`
    - `audio_url = signed_url`
    - `audio_s3_key = reference`
    - `audio_size_bytes = size`
    - `processing_completed_at = now()`
7. Inngest retries on failure (max 3 retries):
    - If failure persists: `processing_status = FAILED`, log error

**Expected Outcomes:**

- ✅ Audio file processed and stored
- ✅ Episode appears in RSS feed
- ✅ User can play/download

**Edge Cases:**

- ❌ Video is age-restricted or restricted in user's region
    - Expected: Status → FAILED, error msg: "Age-restricted content"
- ❌ Video already deleted from YouTube
    - Expected: Status → FAILED, error msg: "Video unavailable"
- ❌ Audio extraction timeout (>30 min)
    - Expected: Inngest retries, then fails
- ❌ Cloudinary upload fails
    - Expected: Inngest retries

---

### Retry Failed Episode

**Preconditions:**

- Episode with `processing_status = FAILED`
- `retry_count < 3`

**Steps:**

1. User clicks "Retry" button on failed episode detail
2. Frontend POST to `POST /api/episodes/<episode_id>/retry/`
3. Backend validates:
    - `processing_status == FAILED`
    - `retry_count < 3`
4. Backend updates episode:
    - `processing_status = QUEUED`
    - `processing_error = ''`
    - `retry_count += 1`
5. Backend sends Inngest event: `youtube/audio.extract`
6. Frontend shows loading state → success toast

**Expected Outcomes:**

- ✅ Episode requeued
- ✅ Processing restarts

**Edge Cases:**

- ❌ Already retried 3 times
    - Expected: 400 "Maximum retry limit (3) reached"
- ❌ Episode status is COMPLETE (not failed)
    - Expected: 400 "Only failed episodes can be retried"

---

### Skip/Delete Episode

**Steps:**

1. User clicks "Remove" button on episode
2. Frontend shows confirmation dialog
3. User confirms
4. Frontend DELETE to `DELETE /api/episodes/<episode_id>/`
5. Backend soft-deletes or marks as `SKIPPED`
6. Backend deletes audio file from Cloudinary
7. Episode no longer in RSS feed

**Expected Outcomes:**

- ✅ Episode removed from dashboard
- ✅ Audio cleaned up
- ✅ Not in podcast feeds

---

## 📡 Flow 6: RSS Feed & Directory Submission

### Generate RSS Feed

**Preconditions:**

- Channel has ≥1 COMPLETE episode

**Steps (Background):**

1. Creator publishes channel or changes settings
2. Frontend can preview RSS: GET `GET /api/feeds/preview/<channel_id>/`
3. Backend generates RSS 2.0 XML:
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0"
         xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
         xmlns:podcast="https://podcastindex.org/namespace/1.0/">
      <channel>
        <title>My Podcast</title>
        <link>https://youcast.app/feed/my-podcast</link>
        <description>Weekly tech interviews</description>
        <language>en</language>
        <itunes:category text="Technology" />
        <itunes:explicit>false</itunes:explicit>
        <itunes:image href="https://artwork.url" />
        <item>
          <title>Interview with Expert</title>
          <description>Full description with prefix/suffix applied</description>
          <pubDate>Mon, 01 Dec 2025 10:00:00 GMT</pubDate>
          <enclosure
            url="https://youcast.app/episodes/audio/uuid/"
            length="45000000"
            type="audio/mpeg" />
          <itunes:duration>01:00:00</itunes:duration>
          <podcast:chapters version="1.2" url="..." />
        </item>
      </channel>
    </rss>
    ```
4. RSS is generated on-demand from episodes
5. Public endpoint: `GET /feed/<rss_slug>/` (no auth)

**Expected Outcomes:**

- ✅ Valid RSS 2.0 feed
- ✅ Apple Podcasts compatible
- ✅ Spotify-compatible format
- ✅ Chapters and transcripts included (if available)

**Edge Cases:**

- ❌ No episodes completed yet
    - Expected: Empty feed with channel metadata only
- ❌ Custom domain not configured
    - Expected: Use default youcast.app domain
- ❌ Audio URLs expired
    - Expected: Refresh signed URLs on feed generation

---

### Preview RSS Feed

**Steps:**

1. User navigates to channel → "Preview Feed"
2. Frontend GET `GET /api/feeds/preview/<channel_id>/`
3. Backend generates feed and returns XML
4. Frontend displays:
    - XML text (readonly)
    - Validation status
    - Podcast app icons (Spotify, Apple, Amazon)
    - "Submit to Directory" links

**Expected Outcomes:**

- ✅ User can see exact feed that will be published
- ✅ Can validate before submitting to directories

---

### Submit to Podcast Directories

**Steps:**

1. User clicks "Submit to Spotify" (or Apple/Amazon)
2. Frontend opens directory submission wizard:
    - Step 1: Pre-fill with channel metadata
    - Step 2: Review feed preview
    - Step 3: Authenticate with directory (OAuth)
    - Step 4: Select feed URL
    - Step 5: Submit
3. Backend tracks submission:
    - Creates DirectorySubmission record
    - Logs timestamp and status
4. Directory (Spotify, etc.) validates and indexes feed
5. Podcast appears in directory (24-48 hours)

**Expected Outcomes:**

- ✅ Submission recorded in backend
- ✅ User receives confirmation email from directory
- ✅ Podcast appears in search results (eventually)

**Edge Cases:**

- ❌ Invalid feed URL
    - Expected: Directory returns 400, user can fix and resubmit
- ❌ Duplicate podcast (already submitted by another user)
    - Expected: Directory notifies, offer to claim existing
- ❌ Feed content violates policy (explicit content not marked)
    - Expected: Directory rejects, user must fix metadata

---

## 💳 Flow 7: Billing & Subscription

### View Current Subscription

**Preconditions:**

- User authenticated

**Steps:**

1. User navigates to `/settings/billing`
2. Frontend GET `GET /api/billing/subscription/`
3. Backend returns current subscription status:
    ```json
    {
    	"plan_tier": "pro",
    	"status": "active",
    	"current_period_start": "2025-11-01T00:00:00Z",
    	"current_period_end": "2025-12-01T00:00:00Z",
    	"cancel_at_period_end": false,
    	"channel_limit": 3,
    	"features": {
    		"custom_domain": true,
    		"analytics": true,
    		"directory_submission": true
    	}
    }
    ```
4. Frontend displays:
    - Current plan name and price
    - Billing period dates
    - Feature list
    - "Upgrade Plan", "Manage Subscription", "Cancel Plan" buttons

**Expected Outcomes:**

- ✅ Current plan displayed
- ✅ Feature list accurate for tier

---

### Upgrade to Paid Plan

**Preconditions:**

- User on FREE tier

**Steps:**

1. User clicks "Upgrade Plan" button
2. Frontend navigates to `/billing/upgrade`
3. Frontend displays pricing cards:
    - Starter: $19/mo (1 channel, basic analytics)
    - Pro: $49/mo (3 channels, advanced analytics, custom domain)
    - Agency: $149/mo (20 channels, API access, priority support)
4. User selects "Pro" and clicks "Subscribe"
5. Frontend POST to `POST /api/billing/checkout/`
    ```json
    { "product_id": "pro_monthly" }
    ```
6. Backend creates Polar checkout session
7. Backend returns `checkout_url`
8. Frontend redirects to Polar checkout page
9. User enters payment details (Stripe)
10. Polar confirms payment
11. Polar webhook sent to `POST /api/billing/webhook/`
12. Backend creates Subscription record:
    - `polar_subscription_id`
    - `plan_tier = pro`
    - `status = active`
    - `current_period_end = now() + 1 month`
13. Backend updates Creator:
    - `plan_tier = pro`
    - `stripe_customer_id = polar_customer_id`
14. Polar redirects user to success page
15. Frontend shows success message

**Expected Outcomes:**

- ✅ Subscription created in Polar
- ✅ Creator plan_tier updated to PRO
- ✅ Channel limit increased to 3
- ✅ New features unlocked

**Edge Cases:**

- ❌ Payment declined
    - Expected: Polar shows error, return to checkout
- ❌ User closes checkout without completing
    - Expected: Subscription not created, user can retry
- ❌ Network error after payment
    - Expected: Webhook still processed, subscription created

---

### View Billing History

**Steps:**

1. User on `/settings/billing`
2. Frontend GET `GET /api/billing/orders/`
3. Backend returns all OrderHistory records for creator:
    ```json
    [
    	{
    		"id": "uuid-1",
    		"amount_cents": 4900,
    		"currency": "usd",
    		"status": "paid",
    		"created_at": "2025-11-01T10:00:00Z",
    		"invoice_url": "https://polar.sh/invoice/..."
    	}
    ]
    ```
4. Frontend displays table with:
    - Invoice date
    - Amount
    - Status badge
    - Download link

**Expected Outcomes:**

- ✅ All past invoices listed
- ✅ Can download invoices from Polar

---

### Manage Subscription (Customer Portal)

**Steps:**

1. User clicks "Manage Subscription" button
2. Frontend POST to `POST /api/billing/portal/`
3. Backend creates Polar customer portal session
4. Backend returns `portal_url`
5. Frontend redirects to Polar portal
6. User can:
    - View subscription details
    - Update payment method
    - Upgrade/downgrade plan
    - Cancel subscription
    - View invoices
7. Polar redirects back to youcast.app on close

**Expected Outcomes:**

- ✅ Seamless redirect to Polar
- ✅ All subscription management in one place

---

### Cancel Subscription

**Steps:**

1. User navigates to Polar customer portal (or clicks "Cancel Plan")
2. User confirms cancellation
3. Polar processes cancellation
4. Polar sends webhook to `POST /api/billing/webhook/`
5. Backend updates Subscription:
    - `status = canceled`
    - `cancel_at_period_end = true`
    - `canceled_at = now()`
6. Creator can still use features until `current_period_end`
7. After period ends, Creator reverts to FREE tier

**Expected Outcomes:**

- ✅ Subscription marked as canceled
- ✅ Downgrade to FREE tier on period end
- ✅ Can re-subscribe at any time

**Edge Cases:**

- ❌ User cancels but still wants to use features
    - Expected: Resubscribe anytime before period end

---

## 📊 Flow 8: Analytics & Download Tracking

### Record Episode Download

**Preconditions:**

- Episode in RSS feed with `audio_url`
- Podcast app (Spotify, Apple, etc.) requests audio file

**Steps (Public Endpoint - No Auth):**

1. Podcast app GETs `GET /episodes/audio/<episode_id>/`
2. Backend receives request with IP address
3. Backend hashes IP immediately:
    ```python
    ip_hash = hashlib.sha256(raw_ip.encode()).hexdigest()
    ```

    - Never logs raw IP (privacy-first)
4. Backend sends Inngest event:
    ```json
    {
    	"name": "analytics/episode.downloaded",
    	"data": {
    		"episode_id": "uuid",
    		"ip_hash": "abc123def...",
    		"user_agent": "Podcast.app/1.2.3",
    		"timestamp": "2025-12-01T10:00:00Z"
    	}
    }
    ```
5. Backend returns 302 redirect to signed audio URL
    - Signed URL valid for 1 year (allows offline caching)
6. Podcast app follows redirect and downloads audio

**Expected Outcomes:**

- ✅ Download counted (by ip_hash, not user ID)
- ✅ Episode `download_count` incremented
- ✅ Podcast app gets audio file

**Edge Cases:**

- ❌ Episode audio_url expired
    - Expected: Backend refreshes signed URL before redirecting
- ❌ Episode deleted
    - Expected: 404 "Episode not found"
- ❌ High volume of requests from same IP
    - Expected: Handled by Inngest batching, counted accurately

---

### View Analytics Dashboard

**Preconditions:**

- Channel has episodes with downloads

**Steps:**

1. User navigates to `/projects/<channel_id>/analytics`
2. Frontend GET `GET /api/analytics/channel/<channel_id>/`
3. Backend returns analytics summary:
    ```json
    {
    	"channel_id": "uuid",
    	"channel_title": "My Channel",
    	"total_downloads": 10420,
    	"downloads_this_week": 523,
    	"downloads_last_week": 612,
    	"top_episodes": [
    		{
    			"id": "uuid-ep-1",
    			"title": "Interview with Jane",
    			"downloads": 1234
    		}
    	],
    	"by_podcast_app": {
    		"Spotify": 4200,
    		"Apple Podcasts": 3100,
    		"Google Podcasts": 1500,
    		"Other": 1620
    	},
    	"by_country": [
    		{ "country": "US", "downloads": 5200 },
    		{ "country": "UK", "downloads": 1800 },
    		{ "country": "CA", "downloads": 950 }
    	]
    }
    ```
4. Frontend displays:
    - Total downloads (KPI card)
    - Downloads this week vs. last week (trend)
    - Top 5 episodes (bar chart)
    - Podcast app breakdown (pie chart)
    - Geographic breakdown (world map or table)

**Expected Outcomes:**

- ✅ Dashboard shows accurate IABv2 analytics
- ✅ Data updates in real-time (or near real-time)
- ✅ Trends visible

---

### Weekly Analytics Email Digest

**Preconditions:**

- User opted in for emails
- Week ended

**Steps (Scheduled):**

1. Inngest scheduler triggers weekly at Sunday 9 AM UTC
2. For each creator with active channels:
3. Backend queries download counts for past 7 days
4. Backend sends email via Resend:
    - Subject: "Your Weekly Podcast Analytics"
    - Template with:
        - Total downloads this week
        - Top 3 episodes
        - Week-over-week comparison
        - Call-to-action to view full dashboard
5. User receives email

**Expected Outcomes:**

- ✅ Email received
- ✅ Accurate data
- ✅ Links back to dashboard

---

## 🔄 Flow 9: WebSub & Real-Time Video Detection

### Initial WebSub Subscription

**Preconditions:**

- Channel created
- Backend has YouTube API access

**Steps (During Channel Creation):**

1. After channel created, backend subscribes to YouTube's WebSub:
    ```
    POST https://pubsubhubbub.appspot.com/subscribe
    hub.callback=https://youcast.app/api/channels/websub/callback/
    hub.topic=https://www.youtube.com/xml/feeds/videos.xml?channel_id=UCxxxxx
    hub.lease_seconds=432000
    ```
2. YouTube verifies callback:
    - Sends GET with `hub.challenge`
    - Backend echoes back challenge
3. YouTube confirms subscription (HTTP 204)
4. Backend sets:
    - `websub_subscribed_at = now()`
    - `websub_expires_at = now() + 5 days`

**Expected Outcomes:**

- ✅ WebSub subscription confirmed
- ✅ Ready to receive push notifications

---

### Receive WebSub Notification

**Preconditions:**

- Channel subscribed to WebSub
- Creator uploads new video to YouTube channel

**Steps:**

1. Creator uploads video to their YouTube channel
2. YouTube publishes to feed in ~30 seconds
3. YouTube sends POST to `POST /api/channels/websub/callback/`:
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <entry>
        <yt:videoId>abc123</yt:videoId>
        <published>2025-12-01T10:00:00Z</published>
        <title>New Video Title</title>
      </entry>
    </feed>
    ```
4. Backend parses WebSub feed
5. Backend calls YouTube API for full video details:
    - Title, description, duration, chapters, thumbnail
6. Backend checks if already in database (by video_id)
7. If new and passes filters: Create Episode with `QUEUED` status
8. Backend sends Inngest event: `youtube/audio.extract`
9. Processing pipeline begins

**Expected Outcomes:**

- ✅ New episode detected within 1 minute of upload
- ✅ Processing starts automatically
- ✅ User sees episode in dashboard (status: Queued)

**Edge Cases:**

- ❌ Video is a Short (duration <60 seconds)
    - Expected: Check filter rules; if excluded, skip
- ❌ WebSub callback missing signature
    - Expected: Reject for security
- ❌ Video deleted or privated before processing starts
    - Expected: Processing fails gracefully, mark as FAILED

---

### WebSub Re-subscription (Auto-Renewal)

**Preconditions:**

- Channel has active WebSub subscription
- Expiration approaching (< 24 hours)

**Steps (Scheduled Inngest Job):**

1. Daily job checks all channel subscriptions
2. For subscriptions expiring in < 24 hours:
3. Backend re-subscribes (same process as initial):
    ```
    POST https://pubsubhubbub.appspot.com/subscribe
    ```
4. YouTube confirms
5. Backend updates `websub_expires_at = now() + 5 days`
6. Subscription remains active indefinitely

**Expected Outcomes:**

- ✅ No gap in WebSub coverage
- ✅ All new videos detected

---

### Polling Fallback (15-min)

**Preconditions:**

- WebSub subscription exists but may be unreliable

**Steps (Scheduled Inngest Job):**

1. Every 15 minutes, for each active channel:
2. Backend calls YouTube API for latest videos from uploads playlist
3. Compares against `last_polled_at` + `last_video_published_at`
4. Detects any new videos missed by WebSub
5. Creates Episodes for new videos (same flow as WebSub)
6. Updates `last_polled_at`

**Expected Outcomes:**

- ✅ No videos missed (even if WebSub fails)
- ✅ Catches up within 15 minutes

---

## 🛡️ Flow 10: Security & Edge Cases

### Token Refresh

**Preconditions:**

- User has valid JWT access token and refresh token
- Access token expires in 15 minutes

**Steps:**

1. Frontend makes request with expired access token
2. Backend returns 401 Unauthorized
3. Frontend automatically sends refresh token to `POST /api/auth/refresh/`:
    ```json
    { "refresh": "<refresh_token>" }
    ```
4. Backend validates refresh token:
    - Checks signature
    - Checks expiry (7 days)
    - Checks if revoked
5. Backend issues new access token (15 min)
6. Frontend retries original request with new token

**Expected Outcomes:**

- ✅ User stays logged in for 7 days
- ✅ Access tokens rotate for security

**Edge Cases:**

- ❌ Refresh token expired
    - Expected: 401 "Token expired"; user must re-login
- ❌ Refresh token revoked (logout)
    - Expected: 401 "Invalid token"

---

### Logout

**Steps:**

1. User clicks "Logout" button
2. Frontend DELETE to `DELETE /api/auth/logout/`
3. Backend:
    - Revokes refresh token (adds to blacklist)
    - Clears session
4. Frontend:
    - Clears JWT cookies
    - Redirects to login page

**Expected Outcomes:**

- ✅ User logged out
- ✅ Cannot use old refresh token

---

### CORS Protection

**Preconditions:**

- Frontend at `http://localhost:3000` (dev)
- Backend at `http://localhost:8000`

**Steps:**

1. Frontend makes API request (browser automatic)
2. Browser sends Origin header: `Origin: http://localhost:3000`
3. Backend checks against CORS_ALLOWED_ORIGINS
4. If allowed, returns:
    ```
    Access-Control-Allow-Origin: http://localhost:3000
    Access-Control-Allow-Credentials: true
    ```

**Expected Outcomes:**

- ✅ Requests succeed from allowed origins
- ❌ Requests blocked from untrusted origins

---

### Rate Limiting (Future)

**Preconditions:**

- Client makes many requests rapidly

**Expected Behavior (when implemented):**

- ❌ >100 requests/min → 429 Too Many Requests
- ❌ OAuth endpoints rate-limited to prevent brute force
- ✅ Legitimate usage unaffected

---

## 📋 Summary Test Checklist

### Authentication

- [ ] Google OAuth signup (first-time)
- [ ] Google OAuth login (returning user)
- [ ] Email/password signup
- [ ] Email/password login
- [ ] Token refresh
- [ ] Logout
- [ ] CSRF protection (state token)

### Onboarding

- [ ] TOS acceptance
- [ ] First channel connection
- [ ] Channel limit enforcement (FREE = 1)
- [ ] YouTube OAuth scopes

### Channels

- [ ] Create channel
- [ ] List channels
- [ ] View channel details
- [ ] Update channel settings
- [ ] Refresh channel metadata from YouTube
- [ ] View eligible videos preview
- [ ] Pause/resume monitoring
- [ ] View WebSub status
- [ ] Verify rss_slug uniqueness

### Episodes

- [ ] List episodes (all channels)
- [ ] Filter episodes (by channel, status, search)
- [ ] View episode detail
- [ ] Manual episode submission
- [ ] Processing pipeline (audio extraction)
- [ ] Retry failed episode
- [ ] Delete episode
- [ ] Download count accuracy

### RSS Feed

- [ ] Generate RSS feed
- [ ] Preview RSS feed
- [ ] Submit to Spotify
- [ ] Submit to Apple Podcasts
- [ ] Submit to Amazon Music
- [ ] Feed validation (RSS 2.0)
- [ ] Chapters in feed
- [ ] Transcripts in feed (Podcasting 2.0)

### Billing

- [ ] View current subscription
- [ ] View available plans
- [ ] Upgrade to Pro
- [ ] Upgrade to Agency
- [ ] Manage subscription (Polar portal)
- [ ] Cancel subscription
- [ ] View billing history
- [ ] Invoice download

### Analytics

- [ ] Episode download count
- [ ] Download by podcast app
- [ ] Download by country/region
- [ ] Top episodes report
- [ ] Weekly email digest
- [ ] IP hashing (privacy)
- [ ] No raw IPs logged

### WebSub & Video Detection

- [ ] WebSub subscription (initial)
- [ ] WebSub notification received
- [ ] WebSub re-subscription (before expiry)
- [ ] Polling fallback (15-min)
- [ ] Auto-detect new videos (within 1 min)
- [ ] Filter application (duration, keywords, etc.)
- [ ] Handle deleted/private videos

### Error Handling

- [ ] Google OAuth failure (denied permissions)
- [ ] YouTube API quota exceeded
- [ ] Audio extraction timeout
- [ ] Cloudinary upload failure
- [ ] Invalid video ID
- [ ] Channel already connected
- [ ] Plan limit exceeded
- [ ] Expired access token

---

## 🚀 How to Run Tests

### Using Postman/Insomnia

1. Import backend API collection
2. Set base URL to `http://localhost:8000`
3. Run flows in sequence
4. Verify each step's response

### Using Playwright/Cypress

1. Automate frontend flows end-to-end
2. Test Google OAuth mock (use a test Google account)
3. Verify UI updates match API responses
4. Test error states

### Manual Testing

1. Start frontend: `npm run dev` (port 3000)
2. Start backend: `python manage.py runserver 0.0.0.0:8000` (port 8000)
3. Start Inngest dev server: `inngest dev`
4. Follow each flow step-by-step
5. Document any deviations or bugs

---

## 📝 Test Data Requirements

### Google Test Account

- Email: `test-creator@gmail.com`
- YouTube Channel: "Test Channel" (with 5+ test videos)
- Some videos < 1 min (Shorts, should be filtered)
- Some videos > 1 min (eligible for podcast)

### Polar Test Credentials

- Use Polar's test mode keys
- Test card: `4242 4242 4242 4242` (succeeds)
- Test card: `4000 0000 0000 0002` (fails)

### Test Videos

- Public video (processable)
- Age-restricted video (should fail)
- Deleted video (should fail during processing)
- Very long video (>6 hours, test timeout handling)
