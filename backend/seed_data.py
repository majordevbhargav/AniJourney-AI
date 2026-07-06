"""Seed anime + real anime pilgrimage locations across Japan."""

ANIME_DATA = [
    {
        "id": "frieren",
        "title": "Frieren: Beyond Journey's End",
        "genres": ["Fantasy", "Adventure", "Slice of Life"],
        "mood": ["peaceful", "melancholic", "contemplative"],
        "synopsis": "An elven mage's quiet journey through decades, revisiting friends long gone.",
        "poster": "https://images.unsplash.com/photo-1712976692892-07d78428215d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxtb3VudCUyMGZ1amklMjBjaGVycnklMjBibG9zc29tc3xlbnwwfHx8fDE3ODMzMzIwMDV8MA&ixlib=rb-4.1.0&q=85",
        "year": 2023
    },
    {
        "id": "your-name",
        "title": "Your Name (Kimi no Na wa)",
        "genres": ["Romance", "Drama", "Supernatural"],
        "mood": ["romantic", "bittersweet", "cinematic"],
        "synopsis": "Two teens mysteriously swap bodies across time and space.",
        "poster": "https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "year": 2016
    },
    {
        "id": "spirited-away",
        "title": "Spirited Away",
        "genres": ["Fantasy", "Adventure"],
        "mood": ["magical", "whimsical", "nostalgic"],
        "synopsis": "A girl trapped in a spirit world must work at a bathhouse to save her family.",
        "poster": "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85",
        "year": 2001
    },
    {
        "id": "demon-slayer",
        "title": "Demon Slayer (Kimetsu no Yaiba)",
        "genres": ["Action", "Supernatural", "Historical"],
        "mood": ["intense", "emotional", "epic"],
        "synopsis": "A boy becomes a demon slayer to save his sister and avenge his family.",
        "poster": "https://images.unsplash.com/photo-1665706896821-319040b81753?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85",
        "year": 2019
    },
    {
        "id": "violet-evergarden",
        "title": "Violet Evergarden",
        "genres": ["Drama", "Fantasy", "Slice of Life"],
        "mood": ["emotional", "beautiful", "healing"],
        "synopsis": "A former soldier writes letters for others to understand the words 'I love you'.",
        "poster": "https://images.unsplash.com/photo-1712976692892-07d78428215d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxtb3VudCUyMGZ1amklMjBjaGVycnklMjBibG9zc29tc3xlbnwwfHx8fDE3ODMzMzIwMDV8MA&ixlib=rb-4.1.0&q=85",
        "year": 2018
    },
    {
        "id": "jujutsu-kaisen",
        "title": "Jujutsu Kaisen",
        "genres": ["Action", "Supernatural"],
        "mood": ["intense", "modern", "stylish"],
        "synopsis": "A student joins a secret organization to fight curses in modern Japan.",
        "poster": "https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "year": 2020
    }
]

LOCATION_DATA = [
    {
        "id": "suga-shrine",
        "name": "Suga Shrine (Stairs Scene)",
        "anime_id": "your-name",
        "city": "Tokyo",
        "region": "Kanto",
        "lat": 35.6867,
        "lng": 139.7202,
        "description": "The iconic red staircase where Taki and Mitsuha meet in the final scene.",
        "image": "https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "cultural_note": "Suga Shrine dates to 1868 and is a Shinto place of worship."
    },
    {
        "id": "hida-furukawa",
        "name": "Hida-Furukawa Station",
        "anime_id": "your-name",
        "city": "Hida",
        "region": "Gifu",
        "lat": 36.2352,
        "lng": 137.1866,
        "description": "The rural station Taki visits searching for Mitsuha's town.",
        "image": "https://images.unsplash.com/photo-1712976692892-07d78428215d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxtb3VudCUyMGZ1amklMjBjaGVycnklMjBibG9zc29tc3xlbnwwfHx8fDE3ODMzMzIwMDV8MA&ixlib=rb-4.1.0&q=85",
        "cultural_note": "The Hida region is known for wooden crafts and preserved Edo-period streets."
    },
    {
        "id": "ashikaga-park",
        "name": "Ashikaga Flower Park",
        "anime_id": "demon-slayer",
        "city": "Ashikaga",
        "region": "Tochigi",
        "lat": 36.3143,
        "lng": 139.5203,
        "description": "The 150-year-old wisteria trees that inspired the Wisteria motif in Demon Slayer.",
        "image": "https://images.unsplash.com/photo-1665706896821-319040b81753?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85",
        "cultural_note": "Wisteria (Fuji) has ancient significance and blooms in April–May."
    },
    {
        "id": "kamado-shrine",
        "name": "Kamado Shrine",
        "anime_id": "demon-slayer",
        "city": "Dazaifu",
        "region": "Fukuoka",
        "lat": 33.5395,
        "lng": 130.5601,
        "description": "Shares its name with protagonist Tanjiro Kamado; a pilgrimage spot for fans.",
        "image": "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85",
        "cultural_note": "Built over 1350 years ago, it's known for love and matchmaking prayers."
    },
    {
        "id": "dogo-onsen",
        "name": "Dogo Onsen Honkan",
        "anime_id": "spirited-away",
        "city": "Matsuyama",
        "region": "Ehime",
        "lat": 33.8521,
        "lng": 132.7867,
        "description": "One of the inspirations for the bathhouse in Spirited Away.",
        "image": "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85",
        "cultural_note": "One of Japan's oldest hot springs, over 3,000 years of history."
    },
    {
        "id": "ginzan-onsen",
        "name": "Ginzan Onsen",
        "anime_id": "spirited-away",
        "city": "Obanazawa",
        "region": "Yamagata",
        "lat": 38.5723,
        "lng": 140.5250,
        "description": "Taisho-era wooden ryokans along a river — another Spirited Away inspiration.",
        "image": "https://images.unsplash.com/photo-1665706896821-319040b81753?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85",
        "cultural_note": "Best visited in winter under snow — deeply atmospheric."
    },
    {
        "id": "shibuya-crossing",
        "name": "Shibuya Scramble Crossing",
        "anime_id": "jujutsu-kaisen",
        "city": "Tokyo",
        "region": "Kanto",
        "lat": 35.6595,
        "lng": 139.7005,
        "description": "The setting of the iconic Shibuya Incident arc.",
        "image": "https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "cultural_note": "World's busiest crossing — up to 3,000 people per green light."
    },
    {
        "id": "kyoto-arashiyama",
        "name": "Arashiyama Bamboo Grove",
        "anime_id": "frieren",
        "city": "Kyoto",
        "region": "Kansai",
        "lat": 35.0170,
        "lng": 135.6710,
        "description": "Tranquil bamboo paths capturing Frieren's meditative pacing.",
        "image": "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85",
        "cultural_note": "The 'sound of bamboo' is one of Japan's 100 Soundscapes."
    },
    {
        "id": "biei-hills",
        "name": "Biei Hills, Hokkaido",
        "anime_id": "violet-evergarden",
        "city": "Biei",
        "region": "Hokkaido",
        "lat": 43.5883,
        "lng": 142.4658,
        "description": "Rolling floral hills reminiscent of Violet's letter-delivery journeys.",
        "image": "https://images.unsplash.com/photo-1712976692892-07d78428215d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxtb3VudCUyMGZ1amklMjBjaGVycnklMjBibG9zc29tc3xlbnwwfHx8fDE3ODMzMzIwMDV8MA&ixlib=rb-4.1.0&q=85",
        "cultural_note": "Famous for patchwork landscapes and lavender fields in July."
    },
    {
        "id": "fushimi-inari",
        "name": "Fushimi Inari-taisha",
        "anime_id": "frieren",
        "city": "Kyoto",
        "region": "Kansai",
        "lat": 34.9671,
        "lng": 135.7727,
        "description": "Endless red torii gates — a common frame in Frieren's temple sequences.",
        "image": "https://images.unsplash.com/photo-1665706896821-319040b81753?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85",
        "cultural_note": "Dedicated to Inari, god of rice; over 10,000 vermillion torii gates."
    },
    {
        "id": "cafe-la-belle",
        "name": "Café La Belle Équipe",
        "anime_id": "your-name",
        "city": "Tokyo",
        "region": "Kanto",
        "lat": 35.6879,
        "lng": 139.7031,
        "description": "The café featured in Your Name's Tokyo café scene.",
        "image": "https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "cultural_note": "Yotsuya district — home to many Shinkai-inspired locations."
    }
]

CHARACTERS = [
    {"id": "frieren", "name": "Frieren", "anime": "Frieren", "persona": "Ancient elven mage. Speaks softly, philosophically, with dry humor. References the passage of time and old friends. Sees beauty in small quiet moments."},
    {"id": "gojo", "name": "Satoru Gojo", "anime": "Jujutsu Kaisen", "persona": "Confident, playful, teasing. Calls the user 'kid'. Loves sweets and modern Tokyo. Makes cocky jokes but has depth."},
    {"id": "luffy", "name": "Monkey D. Luffy", "anime": "One Piece", "persona": "Loud, enthusiastic, food-obsessed. Everything is an 'ADVENTURE!'. Loves meat and mysteries. Simple direct speech."},
    {"id": "violet", "name": "Violet Evergarden", "anime": "Violet Evergarden", "persona": "Formal, gentle, precise. Learning about emotions. Speaks in soft measured sentences, curious about human feelings."},
    {"id": "l", "name": "L", "anime": "Death Note", "persona": "Cryptic, analytical, curious. Speaks in probabilities ('I estimate 73% chance...'). Loves sweets. Deadpan humor."}
]
