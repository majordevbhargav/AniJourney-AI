"""Backend regression tests for AniJourney AI - iteration 10."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "http://localhost:8001"
API = f"{BASE_URL}/api"

TEST_EMAIL = "traveler@ani.jp"
TEST_PASSWORD = "sakura2026"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def auth_headers(s):
    # ensure user exists (register may 400 if already registered)
    s.post(f"{API}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": "Traveler"})
    r = s.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Login failed: {r.status_code} {r.text}")
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


# ---------- Anime catalog & facets ----------
class TestAnime:
    def test_list_anime_returns_25(self, s):
        r = s.get(f"{API}/anime")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 25, f"Expected 25 anime, got {len(data)}"

    def test_facets(self, s):
        r = s.get(f"{API}/anime/facets")
        assert r.status_code == 200
        d = r.json()
        assert "genres" in d and "moods" in d and "years" in d and "total" in d
        assert d["total"] == 25
        assert isinstance(d["genres"], list) and len(d["genres"]) > 0

    def test_filter_by_genre_music(self, s):
        r = s.get(f"{API}/anime", params={"genre": "Music"})
        assert r.status_code == 200
        titles = [a["title"] for a in r.json()]
        assert len(titles) == 3, f"Expected 3 Music anime, got {len(titles)}: {titles}"
        for expected in ["K-On!", "Sound! Euphonium", "Your Lie in April"]:
            assert expected in titles, f"Missing {expected}"

    def test_search_frieren(self, s):
        r = s.get(f"{API}/anime", params={"q": "frieren"})
        assert r.status_code == 200
        titles = [a["title"].lower() for a in r.json()]
        assert any("frieren" in t for t in titles)

    def test_locations_44(self, s):
        r = s.get(f"{API}/locations")
        assert r.status_code == 200
        assert len(r.json()) == 44


# ---------- Auth security ----------
class TestAuthSecurity:
    def test_weak_password_short(self, s):
        r = s.post(f"{API}/auth/register", json={
            "email": f"TEST_{uuid.uuid4().hex[:8]}@x.com", "password": "abc12", "name": "T"
        })
        assert r.status_code == 422, r.text

    def test_weak_password_no_digit(self, s):
        r = s.post(f"{API}/auth/register", json={
            "email": f"TEST_{uuid.uuid4().hex[:8]}@x.com", "password": "abcdefgh", "name": "T"
        })
        assert r.status_code == 422, r.text

    def test_name_sanitized(self, s):
        email = f"TEST_{uuid.uuid4().hex[:8]}@x.com"
        r = s.post(f"{API}/auth/register", json={
            "email": email, "password": "sakura2026", "name": "<script>alert(1)</script>Hiro"
        })
        # rate-limited (5/min) so allow 429; else expect 200 and sanitized name
        if r.status_code == 429:
            pytest.skip("Rate limited")
        assert r.status_code == 200, r.text
        assert "<script" not in r.json()["user"]["name"]
        assert "Hiro" in r.json()["user"]["name"]

    def test_login_wrong_password_401(self, s):
        r = s.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": "wrongwrong1"})
        assert r.status_code in (401, 429), r.text


# ---------- Login existing user ----------
class TestLogin:
    def test_login_success(self, s):
        r = s.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        assert r.status_code == 200
        assert "access_token" in r.json()


# ---------- Community ----------
class TestCommunity:
    post_id = None

    def test_create_post(self, s, auth_headers):
        r = s.post(f"{API}/community/posts", headers=auth_headers, json={
            "title": "<b>Kyoto trip!</b>",
            "body": "<script>x</script>Loved the Sound! Euphonium locations.",
            "anime_id": "sound-euphonium",
        })
        assert r.status_code == 200, r.text
        TestCommunity.post_id = r.json()["id"]

    def test_create_post_requires_title(self, s, auth_headers):
        r = s.post(f"{API}/community/posts", headers=auth_headers, json={"title": "", "body": "hi"})
        assert r.status_code == 400

    def test_list_posts(self, s):
        r = s.get(f"{API}/community/posts")
        assert r.status_code == 200
        posts = r.json()
        assert isinstance(posts, list) and len(posts) >= 1
        assert "like_count" in posts[0] and "comment_count" in posts[0]
        # sanitized
        assert "<script" not in posts[0]["body"]
        assert "<b>" not in posts[0]["title"]

    def test_toggle_like(self, s, auth_headers):
        assert TestCommunity.post_id
        r = s.post(f"{API}/community/posts/{TestCommunity.post_id}/like", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["liked"] is True
        r2 = s.post(f"{API}/community/posts/{TestCommunity.post_id}/like", headers=auth_headers)
        assert r2.json()["liked"] is False

    def test_add_comment(self, s, auth_headers):
        assert TestCommunity.post_id
        r = s.post(f"{API}/community/comments", headers=auth_headers, json={
            "post_id": TestCommunity.post_id, "text": "<script>bad</script>Nice trip!"
        })
        assert r.status_code == 200
        # get post -> comments array
        r2 = s.get(f"{API}/community/posts/{TestCommunity.post_id}")
        assert r2.status_code == 200
        d = r2.json()
        assert "comments" in d and len(d["comments"]) >= 1
        assert "<script" not in d["comments"][0]["text"]

    def test_post_requires_auth(self, s):
        r = s.post(f"{API}/community/posts", json={"title": "x", "body": "y"})
        assert r.status_code in (401, 403)


# ---------- Marketplace ----------
class TestMarketplace:
    def test_hotels_min_8(self, s):
        r = s.get(f"{API}/marketplace/hotels")
        assert r.status_code == 200
        assert len(r.json()) >= 8

    def test_hotels_city_kyoto(self, s):
        r = s.get(f"{API}/marketplace/hotels", params={"city": "Kyoto"})
        assert r.status_code == 200
        for h in r.json():
            assert h["city"].lower() == "kyoto"

    def test_hotels_max_price(self, s):
        r = s.get(f"{API}/marketplace/hotels", params={"max_price": 15000})
        assert r.status_code == 200
        for h in r.json():
            assert h["price_inr"] <= 15000

    def test_hotels_sort_price(self, s):
        r = s.get(f"{API}/marketplace/hotels", params={"sort": "price"})
        prices = [h["price_inr"] for h in r.json()]
        assert prices == sorted(prices)

    def test_events_min_6_sorted(self, s):
        r = s.get(f"{API}/marketplace/events")
        assert r.status_code == 200
        events = r.json()
        assert len(events) >= 6
        dates = [e["date"] for e in events]
        assert dates == sorted(dates)

    def test_book_authed(self, s, auth_headers):
        r = s.post(f"{API}/marketplace/book", headers=auth_headers, json={
            "item_type": "hotel", "item_id": "hotel-granvia-kyoto"
        })
        assert r.status_code == 200
        assert r.json()["status"] == "pending"

    def test_book_unauthed(self, s):
        r = s.post(f"{API}/marketplace/book", json={"item_type": "hotel", "item_id": "hotel-granvia-kyoto"})
        assert r.status_code in (401, 403)
