"""
Deterministic fixture dataset for AEGIS prototype.
Covers real-world threat archetypes and edge cases:
- Exact official profiles/apps
- Typosquatting (1-character typo, character transposition)
- Affix abuse (support, helpdesk, official, customer care)
- Bio text impersonation and scam solicitation
- Icon / Logo piracy & cloned assets
- Legitimate unrelated entities (false-positive prevention)
- Records with sparse / incomplete metadata
"""

SOCIAL_FIXTURES = [
    # 1. Exact Official Profile (Instagram) - Matches registered asset @acmefinance
    {
        "platform": "instagram",
        "display_name": "Acme Finance",
        "username": "acmefinance",
        "profile_url": "https://instagram.com/acmefinance",
        "bio": "Official global Instagram account for Acme Finance. Banking and enterprise solutions.",
        "follower_count": 482000,
        "claimed_verified": True,
        "logo_reference": "acme_official_logo_v1",
        "provenance": "fixture:instagram_api_v1"
    },
    # 2. Typosquatting: 1-Character Typo (Twitter/X / Instagram)
    {
        "platform": "instagram",
        "display_name": "Acme Finaance Official",
        "username": "acmefinaance",
        "profile_url": "https://instagram.com/acmefinaance",
        "bio": "Acme Finance official updates and customer assistance portal.",
        "follower_count": 140,
        "claimed_verified": False,
        "logo_reference": "acme_logo_clone",
        "provenance": "fixture:instagram_crawler"
    },
    # 3. Typosquatting: Transposition (LinkedIn)
    {
        "platform": "linkedin",
        "display_name": "Amce Finance Corp",
        "username": "amcefinance",
        "profile_url": "https://linkedin.com/company/amcefinance",
        "bio": "Financial consulting and investment services.",
        "follower_count": 890,
        "claimed_verified": False,
        "logo_reference": "acme_logo_variant_blurred",
        "provenance": "fixture:linkedin_crawler"
    },
    # 4. Affix Scam: "Customer Support" / "Helpdesk" (Facebook)
    {
        "platform": "facebook",
        "display_name": "Acme Finance Customer Support Desk",
        "username": "acmefinance_helpdesk",
        "profile_url": "https://facebook.com/acmefinance_helpdesk",
        "bio": "24/7 Official Customer Care & Complaint Cell. Send direct message or WhatsApp us to resolve transaction issues immediately.",
        "follower_count": 32,
        "claimed_verified": False,
        "logo_reference": "acme_official_logo_v1",
        "provenance": "fixture:facebook_graph_sim"
    },
    # 5. Phishing / Giveaway Scam with brand bio copy (TikTok)
    {
        "platform": "tiktok",
        "display_name": "Acme Finance Claims",
        "username": "acme_airdrop_claims",
        "profile_url": "https://tiktok.com/@acme_airdrop_claims",
        "bio": "Acme Finance seasonal giveaway! Click link below to claim bonus rewards now.",
        "follower_count": 12400,
        "claimed_verified": True, # Fake badge claim
        "logo_reference": "acme_logo_clone",
        "provenance": "fixture:tiktok_feed_sim"
    },
    # 6. Lookalike Logo & Bio, but altered handle (YouTube)
    {
        "platform": "youtube",
        "display_name": "Acme Finance Global",
        "username": "acmeglobalfinance_tv",
        "profile_url": "https://youtube.com/@acmeglobalfinance_tv",
        "bio": "Acme Finance enterprise technology demos and executive presentations.",
        "follower_count": 450,
        "claimed_verified": False,
        "logo_reference": "acme_official_logo_v1",
        "provenance": "fixture:youtube_data_sim"
    },
    # 7. Legitimate Unrelated Entity (Should NOT be high risk / false positive test)
    {
        "platform": "instagram",
        "display_name": "Acme Anvil Supplies",
        "username": "acmeanvils",
        "profile_url": "https://instagram.com/acmeanvils",
        "bio": "Handcrafted blacksmithing anvils, forge accessories, and workshop tools since 1984.",
        "follower_count": 18500,
        "claimed_verified": False,
        "logo_reference": "blacksmith_anvil_logo",
        "provenance": "fixture:instagram_crawler"
    },
    # 8. Record with Sparse / Incomplete Metadata
    {
        "platform": "facebook",
        "display_name": "Acme",
        "username": "acme_89324",
        "profile_url": "https://facebook.com/acme_89324",
        "bio": None,
        "follower_count": None,
        "claimed_verified": False,
        "logo_reference": None,
        "provenance": "fixture:facebook_graph_sim"
    }
]


APP_STORE_FIXTURES = [
    # 1. Exact Official Application (Google Play) - Matches package com.acme.finance.app
    {
        "store": "google_play",
        "app_name": "Acme Mobile Banking",
        "package_id": "com.acme.finance.app",
        "listing_url": "https://play.google.com/store/apps/details?id=com.acme.finance.app",
        "publisher": "Acme Financial Group LLC",
        "description": "Secure mobile banking and wallet app by Acme Financial Group. View balances, make transfers, and deposit checks safely.",
        "downloads": 5000000,
        "rating": 4.8,
        "logo_reference": "acme_app_icon_v1",
        "developer_website": "https://acmefinance.com",
        "provenance": "fixture:google_play_scraper"
    },
    # 2. Malicious Lookalike Clone (Google Play)
    {
        "store": "google_play",
        "app_name": "Acme Mobile Bank : Fast Loans",
        "package_id": "com.acme.quickloan.fastpay",
        "listing_url": "https://play.google.com/store/apps/details?id=com.acme.quickloan.fastpay",
        "publisher": "Digital FinTech Softworks",
        "description": "Instant loan approval and wallet access. Login with your Acme account for 24/7 fast funds.",
        "downloads": 240,
        "rating": 1.9,
        "logo_reference": "acme_logo_clone",
        "developer_website": "https://fastloans-freehost.xyz",
        "suspicious_permissions": True,
        "provenance": "fixture:google_play_scraper"
    },
    # 3. Similar App Name with Publisher Mismatch (Apple App Store)
    {
        "store": "apple_app_store",
        "app_name": "Acme Finance Assistant",
        "package_id": "com.unknown.acmeassistant",
        "listing_url": "https://apps.apple.com/app/acme-finance-assistant/id99281726",
        "publisher": "Solo Dev Independent",
        "description": "Personal budget calculator and portfolio tracker designed for Acme customers.",
        "downloads": 1200,
        "rating": 3.4,
        "logo_reference": "generic_wallet_icon",
        "developer_website": None,
        "provenance": "fixture:itunes_search_sim"
    },
    # 4. Lookalike App Icon with Typosquatted Name (Google Play)
    {
        "store": "google_play",
        "app_name": "Amce Bank - Online Secure",
        "package_id": "com.amce.banking.online",
        "listing_url": "https://play.google.com/store/apps/details?id=com.amce.banking.online",
        "publisher": "Apex Global Dev",
        "description": "Secure personal banking services, instant wire transfers, and fraud protection for accounts.",
        "downloads": 50,
        "rating": 2.1,
        "logo_reference": "acme_app_icon_v1", # Cloned official icon!
        "developer_website": "https://amce-security-login.top",
        "suspicious_permissions": True,
        "provenance": "fixture:google_play_scraper"
    },
    # 5. Legitimate Unrelated App Sharing Keyword (Google Play)
    {
        "store": "google_play",
        "app_name": "Acme Sound Effects Board",
        "package_id": "com.retrostudios.acmesounds",
        "listing_url": "https://play.google.com/store/apps/details?id=com.retrostudios.acmesounds",
        "publisher": "Retro Studios Entertainment",
        "description": "Classic cartoon whistle, anvil crash, explosion, and coyote falling soundboard effects.",
        "downloads": 85000,
        "rating": 4.5,
        "logo_reference": "cartoon_soundboard_icon",
        "developer_website": "https://retrosounds.app",
        "provenance": "fixture:google_play_scraper"
    },
    # 6. App Missing Publisher Metadata (Apple App Store)
    {
        "store": "apple_app_store",
        "app_name": "Acme Fast Pay",
        "package_id": "com.fastpay.acmewallet",
        "listing_url": "https://apps.apple.com/app/acme-fast-pay/id12984102",
        "publisher": None,
        "description": "Simple checkout utility for online merchants.",
        "downloads": None,
        "rating": None,
        "logo_reference": "acme_logo_variant_blurred",
        "developer_website": None,
        "provenance": "fixture:itunes_search_sim"
    }
]
