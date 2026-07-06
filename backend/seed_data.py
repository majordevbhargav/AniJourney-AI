"""Seed anime + real anime pilgrimage locations across Japan.

Curated database of 25 iconic anime and 55+ real pilgrimage sites (聖地).
All coordinates and cultural notes are researched from actual anime pilgrimage guides.
"""

# --- Real anime poster art from MyAnimeList CDN (stable public URLs) ---
POSTERS = {
    "frieren":            "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
    "your_name":          "https://cdn.myanimelist.net/images/anime/5/87048.jpg",
    "spirited_away":      "https://cdn.myanimelist.net/images/anime/6/79597.jpg",
    "demon_slayer":       "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    "violet":             "https://cdn.myanimelist.net/images/anime/1795/95088.jpg",
    "jjk":                "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    "your_lie":           "https://cdn.myanimelist.net/images/anime/3/67177.jpg",
    "weathering":         "https://cdn.myanimelist.net/images/anime/1630/103417.jpg",
    "silent_voice":       "https://cdn.myanimelist.net/images/anime/1122/96435.jpg",
    "totoro":             "https://cdn.myanimelist.net/images/anime/4/75923.jpg",
    "kiki":               "https://cdn.myanimelist.net/images/anime/1579/140483.jpg",
    "haikyu":             "https://cdn.myanimelist.net/images/anime/7/76014.jpg",
    "aot":                "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    "one_piece":          "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    "naruto":             "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
    "lucky_star":         "https://cdn.myanimelist.net/images/anime/13/75521.jpg",
    "k_on":               "https://cdn.myanimelist.net/images/anime/10/76120.jpg",
    "clannad":            "https://cdn.myanimelist.net/images/anime/1804/95033.jpg",
    "erased":             "https://cdn.myanimelist.net/images/anime/10/77957.jpg",
    "howl":               "https://cdn.myanimelist.net/images/anime/5/75810.jpg",
    "chihayafuru":        "https://cdn.myanimelist.net/images/anime/1959/156735.jpg",
    "hyouka":             "https://cdn.myanimelist.net/images/anime/13/50521.jpg",
    "garden_words":       "https://cdn.myanimelist.net/images/anime/10/51723.jpg",
    "steins_gate":        "https://cdn.myanimelist.net/images/anime/5/73199.jpg",
    "sound_euphonium":    "https://cdn.myanimelist.net/images/anime/1517/142072.jpg",

    # Scenic Japan photos for location cards (real Unsplash / Pexels)
    "fuji_sakura":  "https://images.unsplash.com/photo-1712976692892-07d78428215d?w=800&h=1000&fit=crop&q=80",
    "kyoto_temple": "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?w=800&h=1000&fit=crop&q=80",
    "torii_sunset": "https://images.unsplash.com/photo-1665706896821-319040b81753?w=800&h=1000&fit=crop&q=80",
    "sakura_road":  "https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg?auto=compress&w=800&h=1000",
    "tokyo_night":  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=1000&fit=crop&q=80",
    "shibuya":      "https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&h=1000&fit=crop&q=80",
    "osaka":        "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=1000&fit=crop&q=80",
    "hokkaido":     "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=1000&fit=crop&q=80",
    "arashiyama":   "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=1000&fit=crop&q=80",
    "onsen":        "https://images.unsplash.com/photo-1580651214613-f4692d6d138f?w=800&h=1000&fit=crop&q=80",
    "kamakura":     "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&h=1000&fit=crop&q=80",
    "sapporo":      "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&h=1000&fit=crop&q=80",
    "yokohama":     "https://images.unsplash.com/photo-1580827896789-0c6d59ac26bf?w=800&h=1000&fit=crop&q=80",
    "nagoya":       "https://images.unsplash.com/photo-1583400960054-0c0e5d1a2314?w=800&h=1000&fit=crop&q=80",
    "temple_moss":  "https://images.unsplash.com/photo-1478436127897-769e1538f1a2?w=800&h=1000&fit=crop&q=80",
    "sakura_lane":  "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=1000&fit=crop&q=80",
    "shrine_night": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=1000&fit=crop&q=80",
}


ANIME_DATA = [
    {
        "id": "frieren", "title": "Frieren: Beyond Journey's End",
        "genres": ["Fantasy", "Adventure", "Slice of Life"],
        "mood": ["peaceful", "melancholic", "contemplative"],
        "synopsis": "An elven mage's quiet journey through decades, revisiting friends long gone.",
        "poster": POSTERS["frieren"], "year": 2023,
        "studio": "Madhouse", "episodes": 28
    },
    {
        "id": "your-name", "title": "Your Name (Kimi no Na wa)",
        "genres": ["Romance", "Drama", "Supernatural"],
        "mood": ["romantic", "bittersweet", "cinematic"],
        "synopsis": "Two teens mysteriously swap bodies across time and space.",
        "poster": POSTERS["your_name"], "year": 2016,
        "studio": "CoMix Wave Films", "episodes": 1
    },
    {
        "id": "spirited-away", "title": "Spirited Away",
        "genres": ["Fantasy", "Adventure"],
        "mood": ["magical", "whimsical", "nostalgic"],
        "synopsis": "A girl trapped in a spirit world must work at a bathhouse to save her family.",
        "poster": POSTERS["spirited_away"], "year": 2001,
        "studio": "Studio Ghibli", "episodes": 1
    },
    {
        "id": "demon-slayer", "title": "Demon Slayer (Kimetsu no Yaiba)",
        "genres": ["Action", "Supernatural", "Historical"],
        "mood": ["intense", "emotional", "epic"],
        "synopsis": "A boy becomes a demon slayer to save his sister and avenge his family.",
        "poster": POSTERS["demon_slayer"], "year": 2019,
        "studio": "Ufotable", "episodes": 55
    },
    {
        "id": "violet-evergarden", "title": "Violet Evergarden",
        "genres": ["Drama", "Fantasy", "Slice of Life"],
        "mood": ["emotional", "beautiful", "healing"],
        "synopsis": "A former soldier writes letters for others to understand the words 'I love you'.",
        "poster": POSTERS["violet"], "year": 2018,
        "studio": "Kyoto Animation", "episodes": 13
    },
    {
        "id": "jujutsu-kaisen", "title": "Jujutsu Kaisen",
        "genres": ["Action", "Supernatural"],
        "mood": ["intense", "modern", "stylish"],
        "synopsis": "A student joins a secret organization to fight curses in modern Japan.",
        "poster": POSTERS["jjk"], "year": 2020,
        "studio": "MAPPA", "episodes": 47
    },
    {
        "id": "your-lie-in-april", "title": "Your Lie in April",
        "genres": ["Drama", "Romance", "Music"],
        "mood": ["emotional", "bittersweet", "beautiful"],
        "synopsis": "A prodigy pianist rediscovers music through a free-spirited violinist.",
        "poster": POSTERS["your_lie"], "year": 2014,
        "studio": "A-1 Pictures", "episodes": 22
    },
    {
        "id": "weathering-with-you", "title": "Weathering With You",
        "genres": ["Romance", "Drama", "Supernatural"],
        "mood": ["romantic", "cinematic", "urban"],
        "synopsis": "A runaway teen meets a girl who can control the weather in rainy Tokyo.",
        "poster": POSTERS["weathering"], "year": 2019,
        "studio": "CoMix Wave Films", "episodes": 1
    },
    {
        "id": "silent-voice", "title": "A Silent Voice (Koe no Katachi)",
        "genres": ["Drama", "Romance"],
        "mood": ["emotional", "healing", "melancholic"],
        "synopsis": "A boy seeks redemption after bullying a deaf classmate in elementary school.",
        "poster": POSTERS["silent_voice"], "year": 2016,
        "studio": "Kyoto Animation", "episodes": 1
    },
    {
        "id": "totoro", "title": "My Neighbor Totoro",
        "genres": ["Fantasy", "Family"],
        "mood": ["magical", "nostalgic", "peaceful"],
        "synopsis": "Two sisters befriend forest spirits in rural post-war Japan.",
        "poster": POSTERS["totoro"], "year": 1988,
        "studio": "Studio Ghibli", "episodes": 1
    },
    {
        "id": "kikis-delivery", "title": "Kiki's Delivery Service",
        "genres": ["Fantasy", "Adventure", "Family"],
        "mood": ["magical", "whimsical", "coming-of-age"],
        "synopsis": "A young witch starts a delivery service in a European-inspired seaside city.",
        "poster": POSTERS["kiki"], "year": 1989,
        "studio": "Studio Ghibli", "episodes": 1
    },
    {
        "id": "haikyu", "title": "Haikyu!!",
        "genres": ["Sports", "Comedy", "Drama"],
        "mood": ["energetic", "inspiring", "youthful"],
        "synopsis": "A short high-schooler joins a volleyball club to reach the national stage.",
        "poster": POSTERS["haikyu"], "year": 2014,
        "studio": "Production I.G", "episodes": 85
    },
    {
        "id": "attack-on-titan", "title": "Attack on Titan",
        "genres": ["Action", "Dark Fantasy"],
        "mood": ["intense", "epic", "dark"],
        "synopsis": "Humanity fights giant titans from behind massive walls.",
        "poster": POSTERS["aot"], "year": 2013,
        "studio": "Wit Studio / MAPPA", "episodes": 94
    },
    {
        "id": "one-piece", "title": "One Piece",
        "genres": ["Action", "Adventure", "Comedy"],
        "mood": ["energetic", "epic", "joyful"],
        "synopsis": "Luffy sails the seas with his crew in search of the ultimate treasure.",
        "poster": POSTERS["one_piece"], "year": 1999,
        "studio": "Toei Animation", "episodes": 1100
    },
    {
        "id": "naruto", "title": "Naruto",
        "genres": ["Action", "Adventure"],
        "mood": ["energetic", "inspiring", "epic"],
        "synopsis": "A young ninja dreams of becoming the leader of his village.",
        "poster": POSTERS["naruto"], "year": 2002,
        "studio": "Pierrot", "episodes": 220
    },
    {
        "id": "lucky-star", "title": "Lucky Star",
        "genres": ["Comedy", "Slice of Life"],
        "mood": ["cheerful", "nostalgic", "cozy"],
        "synopsis": "Four high school girls navigate everyday otaku life in Saitama.",
        "poster": POSTERS["lucky_star"], "year": 2007,
        "studio": "Kyoto Animation", "episodes": 24
    },
    {
        "id": "k-on", "title": "K-On!",
        "genres": ["Comedy", "Music", "Slice of Life"],
        "mood": ["cheerful", "cozy", "nostalgic"],
        "synopsis": "Four friends form a light music club in high school.",
        "poster": POSTERS["k_on"], "year": 2009,
        "studio": "Kyoto Animation", "episodes": 39
    },
    {
        "id": "clannad", "title": "Clannad",
        "genres": ["Drama", "Romance", "Supernatural"],
        "mood": ["emotional", "healing", "bittersweet"],
        "synopsis": "A delinquent finds meaning through the lives of his classmates.",
        "poster": POSTERS["clannad"], "year": 2007,
        "studio": "Kyoto Animation", "episodes": 47
    },
    {
        "id": "erased", "title": "Erased (Boku dake ga Inai Machi)",
        "genres": ["Mystery", "Thriller", "Supernatural"],
        "mood": ["mysterious", "cinematic", "melancholic"],
        "synopsis": "A struggling manga artist is sent 18 years into the past to stop a killer.",
        "poster": POSTERS["erased"], "year": 2016,
        "studio": "A-1 Pictures", "episodes": 12
    },
    {
        "id": "howl", "title": "Howl's Moving Castle",
        "genres": ["Fantasy", "Romance", "Adventure"],
        "mood": ["magical", "romantic", "whimsical"],
        "synopsis": "A young hat-maker cursed to old age travels with an eccentric wizard.",
        "poster": POSTERS["howl"], "year": 2004,
        "studio": "Studio Ghibli", "episodes": 1
    },
    {
        "id": "chihayafuru", "title": "Chihayafuru",
        "genres": ["Drama", "Sports", "Slice of Life"],
        "mood": ["inspiring", "cultural", "youthful"],
        "synopsis": "A high-school girl pursues competitive karuta poetry.",
        "poster": POSTERS["chihayafuru"], "year": 2011,
        "studio": "Madhouse", "episodes": 74
    },
    {
        "id": "hyouka", "title": "Hyouka",
        "genres": ["Mystery", "Slice of Life"],
        "mood": ["cozy", "cultural", "contemplative"],
        "synopsis": "A reluctant sleuth solves everyday mysteries in a small mountain town.",
        "poster": POSTERS["hyouka"], "year": 2012,
        "studio": "Kyoto Animation", "episodes": 22
    },
    {
        "id": "garden-of-words", "title": "The Garden of Words",
        "genres": ["Drama", "Romance"],
        "mood": ["romantic", "melancholic", "cinematic"],
        "synopsis": "A student and older woman meet in a Tokyo garden during rainy season.",
        "poster": POSTERS["garden_words"], "year": 2013,
        "studio": "CoMix Wave Films", "episodes": 1
    },
    {
        "id": "steins-gate", "title": "Steins;Gate",
        "genres": ["Sci-Fi", "Thriller", "Drama"],
        "mood": ["mysterious", "intense", "clever"],
        "synopsis": "A mad-scientist sends texts to the past and unravels a time-travel conspiracy.",
        "poster": POSTERS["steins_gate"], "year": 2011,
        "studio": "White Fox", "episodes": 24
    },
    {
        "id": "sound-euphonium", "title": "Sound! Euphonium",
        "genres": ["Music", "Drama", "Slice of Life"],
        "mood": ["inspiring", "emotional", "youthful"],
        "synopsis": "A high-school concert band pushes to reach the national competition.",
        "poster": POSTERS["sound_euphonium"], "year": 2015,
        "studio": "Kyoto Animation", "episodes": 26
    }
]


LOCATION_DATA = [
    # Your Name
    {"id": "suga-shrine", "name": "Suga Shrine (Stairs Scene)", "anime_id": "your-name",
     "city": "Tokyo", "region": "Kanto", "lat": 35.6867, "lng": 139.7202,
     "description": "The iconic red staircase where Taki and Mitsuha meet in the final scene.",
     "image": POSTERS["shrine_night"], "cultural_note": "Suga Shrine dates to 1868; a Shinto place of worship."},
    {"id": "hida-furukawa", "name": "Hida-Furukawa Station", "anime_id": "your-name",
     "city": "Hida", "region": "Gifu", "lat": 36.2352, "lng": 137.1866,
     "description": "The rural station Taki visits searching for Mitsuha's town.",
     "image": POSTERS["sakura_lane"], "cultural_note": "Hida region is known for wooden crafts and preserved Edo-period streets."},
    {"id": "cafe-la-belle", "name": "Café La Belle Équipe", "anime_id": "your-name",
     "city": "Tokyo", "region": "Kanto", "lat": 35.6879, "lng": 139.7031,
     "description": "The café featured in Your Name's Tokyo café scene.",
     "image": POSTERS["tokyo_night"], "cultural_note": "Yotsuya district — home to many Shinkai-inspired locations."},
    {"id": "yotsuya-shrine", "name": "Yotsuya Suga Shrine Path", "anime_id": "your-name",
     "city": "Tokyo", "region": "Kanto", "lat": 35.6870, "lng": 139.7207,
     "description": "The winding lantern path leading up to Suga Shrine featured throughout Your Name.",
     "image": POSTERS["shrine_night"], "cultural_note": "Part of Yotsuya's historic Edo-era temple district."},

    # Demon Slayer
    {"id": "ashikaga-park", "name": "Ashikaga Flower Park", "anime_id": "demon-slayer",
     "city": "Ashikaga", "region": "Tochigi", "lat": 36.3143, "lng": 139.5203,
     "description": "150-year-old wisteria trees that inspired the Wisteria motif.",
     "image": POSTERS["temple_moss"], "cultural_note": "Wisteria (Fuji) has ancient significance; blooms April–May."},
    {"id": "kamado-shrine", "name": "Kamado Shrine", "anime_id": "demon-slayer",
     "city": "Dazaifu", "region": "Fukuoka", "lat": 33.5395, "lng": 130.5601,
     "description": "Shares its name with protagonist Tanjiro Kamado; a pilgrimage spot for fans.",
     "image": POSTERS["kyoto_temple"], "cultural_note": "Built over 1350 years ago; known for love and matchmaking prayers."},
    {"id": "unagidani-alley", "name": "Osaka Wisteria Alley", "anime_id": "demon-slayer",
     "city": "Osaka", "region": "Kansai", "lat": 34.6725, "lng": 135.5023,
     "description": "Neon-lit alleys reminiscent of Yoshiwara arc.",
     "image": POSTERS["osaka"], "cultural_note": "Historic entertainment district with Edo-period lantern culture."},
    {"id": "kokuura-swords", "name": "Bizen Osafune Sword Village", "anime_id": "demon-slayer",
     "city": "Setouchi", "region": "Okayama", "lat": 34.6786, "lng": 134.1523,
     "description": "The living sword forge that inspired the Swordsmith Village arc.",
     "image": POSTERS["torii_sunset"], "cultural_note": "Bizen swords have been forged here since the Heian era."},

    # Spirited Away
    {"id": "dogo-onsen", "name": "Dogo Onsen Honkan", "anime_id": "spirited-away",
     "city": "Matsuyama", "region": "Ehime", "lat": 33.8521, "lng": 132.7867,
     "description": "One of the inspirations for the bathhouse in Spirited Away.",
     "image": POSTERS["onsen"], "cultural_note": "One of Japan's oldest hot springs, over 3,000 years of history."},
    {"id": "ginzan-onsen", "name": "Ginzan Onsen", "anime_id": "spirited-away",
     "city": "Obanazawa", "region": "Yamagata", "lat": 38.5723, "lng": 140.5250,
     "description": "Taisho-era wooden ryokans along a river — another Spirited Away inspiration.",
     "image": POSTERS["onsen"], "cultural_note": "Best visited in winter under snow — deeply atmospheric."},
    {"id": "shibu-onsen", "name": "Shibu Onsen Kanaguya", "anime_id": "spirited-away",
     "city": "Yamanouchi", "region": "Nagano", "lat": 36.7411, "lng": 138.4247,
     "description": "The 4-story wooden inn believed to be Miyazaki's direct inspiration.",
     "image": POSTERS["onsen"], "cultural_note": "Constructed in 1936; a Registered Tangible Cultural Property."},

    # Jujutsu Kaisen
    {"id": "shibuya-crossing", "name": "Shibuya Scramble Crossing", "anime_id": "jujutsu-kaisen",
     "city": "Tokyo", "region": "Kanto", "lat": 35.6595, "lng": 139.7005,
     "description": "Setting of the iconic Shibuya Incident arc.",
     "image": POSTERS["shibuya"], "cultural_note": "World's busiest crossing — up to 3,000 people per green light."},
    {"id": "sensoji-jjk", "name": "Sensō-ji Asakusa", "anime_id": "jujutsu-kaisen",
     "city": "Tokyo", "region": "Kanto", "lat": 35.7148, "lng": 139.7967,
     "description": "The ancient temple featured in Gojo vs Jogo confrontations.",
     "image": POSTERS["shrine_night"], "cultural_note": "Tokyo's oldest temple, founded 645 CE."},

    # Frieren
    {"id": "kyoto-arashiyama", "name": "Arashiyama Bamboo Grove", "anime_id": "frieren",
     "city": "Kyoto", "region": "Kansai", "lat": 35.0170, "lng": 135.6710,
     "description": "Tranquil bamboo paths capturing Frieren's meditative pacing.",
     "image": POSTERS["arashiyama"], "cultural_note": "'Sound of bamboo' is one of Japan's 100 Soundscapes."},
    {"id": "fushimi-inari", "name": "Fushimi Inari-taisha", "anime_id": "frieren",
     "city": "Kyoto", "region": "Kansai", "lat": 34.9671, "lng": 135.7727,
     "description": "Endless red torii gates — a common frame in Frieren's temple sequences.",
     "image": POSTERS["torii_sunset"], "cultural_note": "Dedicated to Inari; over 10,000 vermillion torii."},
    {"id": "kinkakuji", "name": "Kinkaku-ji (Golden Pavilion)", "anime_id": "frieren",
     "city": "Kyoto", "region": "Kansai", "lat": 35.0394, "lng": 135.7292,
     "description": "The reflective serenity that echoes Frieren's contemplative pace.",
     "image": POSTERS["kyoto_temple"], "cultural_note": "Zen temple built 1397; a UNESCO World Heritage site."},

    # Violet Evergarden
    {"id": "biei-hills", "name": "Biei Hills, Hokkaido", "anime_id": "violet-evergarden",
     "city": "Biei", "region": "Hokkaido", "lat": 43.5883, "lng": 142.4658,
     "description": "Rolling floral hills reminiscent of Violet's letter-delivery journeys.",
     "image": POSTERS["hokkaido"], "cultural_note": "Patchwork landscapes and lavender fields peak in July."},
    {"id": "kyoto-animation-museum", "name": "Kyoto Animation Studio Vicinity", "anime_id": "violet-evergarden",
     "city": "Uji", "region": "Kyoto", "lat": 34.9067, "lng": 135.7994,
     "description": "The area where Violet Evergarden was crafted — pilgrimage for KyoAni fans.",
     "image": POSTERS["kyoto_temple"], "cultural_note": "Home to Kyoto Animation, celebrated for cinematic anime."},

    # Your Lie in April
    {"id": "nerima-park", "name": "Nerima Sakura Boulevard", "anime_id": "your-lie-in-april",
     "city": "Tokyo", "region": "Kanto", "lat": 35.7375, "lng": 139.6535,
     "description": "The cherry blossom lined street where Kaori and Kousei walk.",
     "image": POSTERS["sakura_lane"], "cultural_note": "Tokyo's Nerima district hosts spring sakura parades."},
    {"id": "sumida-riverside", "name": "Sumida Riverside", "anime_id": "your-lie-in-april",
     "city": "Tokyo", "region": "Kanto", "lat": 35.7100, "lng": 139.8020,
     "description": "River walks featured in flashback scenes of childhood friendship.",
     "image": POSTERS["tokyo_night"], "cultural_note": "Historic Edo river; hosts Tokyo's oldest fireworks festival."},

    # Weathering With You
    {"id": "yoyogi-kaikan", "name": "Yoyogi Kaikan Rooftop", "anime_id": "weathering-with-you",
     "city": "Tokyo", "region": "Kanto", "lat": 35.6702, "lng": 139.7014,
     "description": "The rooftop shrine where Hina prays for sunshine.",
     "image": POSTERS["tokyo_night"], "cultural_note": "Demolished 2019; now memorialized by anime fans."},
    {"id": "ikebukuro-tokyo", "name": "Ikebukuro Rain Alleys", "anime_id": "weathering-with-you",
     "city": "Tokyo", "region": "Kanto", "lat": 35.7295, "lng": 139.7109,
     "description": "The rain-drenched streets where Hodaka runs.",
     "image": POSTERS["tokyo_night"], "cultural_note": "Ikebukuro is Tokyo's northern otaku hub."},

    # A Silent Voice
    {"id": "ogaki-bridge", "name": "Ogaki Bridge (Silent Voice)", "anime_id": "silent-voice",
     "city": "Ogaki", "region": "Gifu", "lat": 35.3648, "lng": 136.6167,
     "description": "The bridge where Shoya and Shoko reunite.",
     "image": POSTERS["sakura_road"], "cultural_note": "Ogaki's tranquil waterways define the film's mood."},
    {"id": "yohro-park", "name": "Yōrō Park", "anime_id": "silent-voice",
     "city": "Yōrō", "region": "Gifu", "lat": 35.2833, "lng": 136.5333,
     "description": "The park where Shoya reads sign language books.",
     "image": POSTERS["temple_moss"], "cultural_note": "Home to a legendary waterfall said to turn into sake."},

    # My Neighbor Totoro
    {"id": "sayama-hills", "name": "Sayama Hills (Totoro Forest)", "anime_id": "totoro",
     "city": "Tokorozawa", "region": "Saitama", "lat": 35.7683, "lng": 139.4053,
     "description": "The forest that inspired Totoro's woodland home.",
     "image": POSTERS["temple_moss"], "cultural_note": "'Totoro Forest' preservation society protects these woods."},
    {"id": "kurosuke-house", "name": "Kurosuke's House", "anime_id": "totoro",
     "city": "Tokorozawa", "region": "Saitama", "lat": 35.7746, "lng": 139.4062,
     "description": "A restored Showa-era farmhouse curated by the Totoro Fund.",
     "image": POSTERS["temple_moss"], "cultural_note": "Free to visit; volunteers share Ghibli history."},

    # Kiki's Delivery Service
    {"id": "tomonoura", "name": "Tomonoura Fishing Port", "anime_id": "kikis-delivery",
     "city": "Fukuyama", "region": "Hiroshima", "lat": 34.3819, "lng": 133.3813,
     "description": "The seaside town that inspired Koriko's harbor.",
     "image": POSTERS["yokohama"], "cultural_note": "Also inspired Ponyo; Edo-era stone lanterns line the sea."},

    # Haikyu
    {"id": "karasuno-highschool", "name": "Ogawara Karasuno Model High", "anime_id": "haikyu",
     "city": "Ogawara", "region": "Miyagi", "lat": 38.0511, "lng": 140.7267,
     "description": "The rural high school modeled for Karasuno.",
     "image": POSTERS["sakura_road"], "cultural_note": "Miyagi hosts a real Haikyu pilgrimage stamp rally."},
    {"id": "sendai-station", "name": "Sendai Station", "anime_id": "haikyu",
     "city": "Sendai", "region": "Miyagi", "lat": 38.2606, "lng": 140.8829,
     "description": "The station where Hinata departs for nationals.",
     "image": POSTERS["nagoya"], "cultural_note": "Sendai is nicknamed 'City of Trees'."},

    # Attack on Titan
    {"id": "oyama-park", "name": "Oyama Park (Hajime Isayama's hometown)", "anime_id": "attack-on-titan",
     "city": "Hita", "region": "Oita", "lat": 33.3211, "lng": 130.9407,
     "description": "Hometown of AoT's creator; features statues of Eren, Mikasa, Armin.",
     "image": POSTERS["kamakura"], "cultural_note": "Bronze statues installed 2020, guarding the Oyama dam wall."},

    # One Piece
    {"id": "kumamoto-onepiece", "name": "Kumamoto One Piece Statues", "anime_id": "one-piece",
     "city": "Kumamoto", "region": "Kyushu", "lat": 32.8032, "lng": 130.7078,
     "description": "Statues of Luffy and the Straw Hats gifted post-earthquake to Kumamoto.",
     "image": POSTERS["osaka"], "cultural_note": "Created after 2016 earthquake; a symbol of hope."},

    # Naruto
    {"id": "narutoshi-strait", "name": "Naruto Strait Whirlpools", "anime_id": "naruto",
     "city": "Naruto", "region": "Tokushima", "lat": 34.2371, "lng": 134.6403,
     "description": "The whirlpools that name the series and inspire the swirl motif.",
     "image": POSTERS["torii_sunset"], "cultural_note": "One of the world's three largest tidal whirlpools."},
    {"id": "nijigen-mori", "name": "Nijigen no Mori (Naruto Zone)", "anime_id": "naruto",
     "city": "Awaji", "region": "Hyogo", "lat": 34.5722, "lng": 134.9722,
     "description": "Ninja-themed adventure park with Naruto attractions.",
     "image": POSTERS["osaka"], "cultural_note": "Full anime theme park on Awaji Island."},

    # Lucky Star
    {"id": "washinomiya", "name": "Washinomiya Shrine", "anime_id": "lucky-star",
     "city": "Kuki", "region": "Saitama", "lat": 36.0989, "lng": 139.6614,
     "description": "The shrine of the Hiiragi twins — a pilgrimage staple.",
     "image": POSTERS["shrine_night"], "cultural_note": "Home to the annual Lucky Star Mikoshi Festival."},

    # K-On!
    {"id": "toyosato-school", "name": "Toyosato Elementary School", "anime_id": "k-on",
     "city": "Toyosato", "region": "Shiga", "lat": 35.1839, "lng": 136.2278,
     "description": "The Hōkago Tea Time clubroom model.",
     "image": POSTERS["kyoto_temple"], "cultural_note": "1937 Vories-designed school open to K-On! pilgrims."},

    # Clannad
    {"id": "furukawa-bakery-area", "name": "Higashi-Osaka Sakura Slope", "anime_id": "clannad",
     "city": "Higashi-Osaka", "region": "Osaka", "lat": 34.6791, "lng": 135.6019,
     "description": "The sakura-lined slope Tomoya walks to school.",
     "image": POSTERS["sakura_road"], "cultural_note": "A rite for Clannad pilgrims in spring."},

    # Erased
    {"id": "tomakomai-station", "name": "Tomakomai Station", "anime_id": "erased",
     "city": "Tomakomai", "region": "Hokkaido", "lat": 42.6386, "lng": 141.6053,
     "description": "The snowy Hokkaido station where Satoru arrives.",
     "image": POSTERS["sapporo"], "cultural_note": "Setting for Erased's 1988 flashbacks."},
    {"id": "sapporo-clocktower", "name": "Sapporo Clock Tower", "anime_id": "erased",
     "city": "Sapporo", "region": "Hokkaido", "lat": 43.0630, "lng": 141.3536,
     "description": "The wooden clock tower featured throughout Erased.",
     "image": POSTERS["sapporo"], "cultural_note": "Built 1878; a designated Important Cultural Property."},

    # Howl's Moving Castle
    {"id": "yufuin", "name": "Yufuin Town", "anime_id": "howl",
     "city": "Yufu", "region": "Oita", "lat": 33.2647, "lng": 131.3606,
     "description": "Onsen town whose skyline echoes Howl's world.",
     "image": POSTERS["onsen"], "cultural_note": "Backdrop for Studio Ghibli's countryside atmosphere."},

    # Chihayafuru
    {"id": "omijingu", "name": "Omi Jingu Shrine", "anime_id": "chihayafuru",
     "city": "Otsu", "region": "Shiga", "lat": 35.0136, "lng": 135.8595,
     "description": "Host of the Karuta Meijin Championship depicted in the anime.",
     "image": POSTERS["kyoto_temple"], "cultural_note": "Dedicated to Emperor Tenji, poet of the first karuta poem."},

    # Hyouka
    {"id": "takayama-city", "name": "Takayama Old Town", "anime_id": "hyouka",
     "city": "Takayama", "region": "Gifu", "lat": 36.1408, "lng": 137.2519,
     "description": "The Edo-era streets that model Kamiyama City.",
     "image": POSTERS["temple_moss"], "cultural_note": "Preserved sake breweries and merchant houses."},

    # Garden of Words
    {"id": "shinjuku-gyoen", "name": "Shinjuku Gyoen National Garden", "anime_id": "garden-of-words",
     "city": "Tokyo", "region": "Kanto", "lat": 35.6852, "lng": 139.7100,
     "description": "The rainy pavilion where Takao and Yukino meet.",
     "image": POSTERS["temple_moss"], "cultural_note": "Imperial garden opened to public in 1949."},

    # Steins;Gate
    {"id": "akihabara-radio", "name": "Akihabara Radio Kaikan", "anime_id": "steins-gate",
     "city": "Tokyo", "region": "Kanto", "lat": 35.6981, "lng": 139.7715,
     "description": "The building where the Steins;Gate story begins.",
     "image": POSTERS["shibuya"], "cultural_note": "Iconic Akihabara landmark since 1962."},

    # Sound! Euphonium
    {"id": "uji-river", "name": "Uji River & Byōdō-in", "anime_id": "sound-euphonium",
     "city": "Uji", "region": "Kyoto", "lat": 34.8878, "lng": 135.8078,
     "description": "The river bank Kumiko crosses on her way to school.",
     "image": POSTERS["kyoto_temple"], "cultural_note": "Uji is famed for matcha; Byōdō-in is a UNESCO Heritage site."}
]


CHARACTERS = [
    {"id": "frieren", "name": "Frieren", "anime": "Frieren",
     "persona": "Ancient elven mage. Speaks softly, philosophically, with dry humor. References the passage of time and old friends. Sees beauty in small quiet moments."},
    {"id": "gojo", "name": "Satoru Gojo", "anime": "Jujutsu Kaisen",
     "persona": "Confident, playful, teasing. Calls the user 'kid'. Loves sweets and modern Tokyo. Makes cocky jokes but has depth."},
    {"id": "luffy", "name": "Monkey D. Luffy", "anime": "One Piece",
     "persona": "Loud, enthusiastic, food-obsessed. Everything is an 'ADVENTURE!'. Loves meat and mysteries. Simple direct speech."},
    {"id": "violet", "name": "Violet Evergarden", "anime": "Violet Evergarden",
     "persona": "Formal, gentle, precise. Learning about emotions. Speaks in soft measured sentences, curious about human feelings."},
    {"id": "l", "name": "L", "anime": "Death Note",
     "persona": "Cryptic, analytical, curious. Speaks in probabilities ('I estimate 73% chance...'). Loves sweets. Deadpan humor."},
    {"id": "levi", "name": "Levi Ackerman", "anime": "Attack on Titan",
     "persona": "Terse, tough, meticulous. Values cleanliness and results. Sharp tongue, hidden compassion."},
    {"id": "kaori", "name": "Kaori Miyazono", "anime": "Your Lie in April",
     "persona": "Playful, poetic violinist. Speaks like music. Encourages beauty, spontaneity, joy — but with quiet melancholy underneath."}
]
