import asyncio
import httpx
from cache import Cache
from api import tmdb

RATINGS_SERVER = "https://toast-ratings.vercel.app"

LANGUAGE_FLAGS = {
    'it-IT': '🇮🇹', 'en-US': '🇺🇸', 'es-ES': '🇪🇸', 'fr-FR': '🇫🇷', 'de-DE': '🇩🇪',
    'pt-BR': '🇧🇷', 'ru-RU': '🇷🇺', 'zh-CN': '🇨🇳', 'ja-JP': '🇯🇵', 'ko-KR': '🇰🇷',
    'ar-SA': '🇸🇦', 'tr-TR': '🇹🇷', 'hi-IN': '🇮🇳', 'vi-VN': '🇻🇳', 'th-TH': '🇹🇭'
}

# Cache initialization
cache = None

def open_cache():
    global cache
    cache = Cache('translator')

def close_cache():
    if cache:
        cache.close()

def get_cache_lenght():
    return cache.get_lenght() if cache else 0

async def translate_with_api(client: httpx.AsyncClient, text: str, target_lang: str) -> str:
    if not text or target_lang == 'en-US':
        return text
    
    # Check cache
    cache_key = f"{text}_{target_lang}"
    if cache:
        cached = cache.get(cache_key)
        if cached:
            return cached

    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target_lang.split('-')[0]}&dt=t&q={text}"
        response = await client.get(url, timeout=5)
        if response.status_code == 200:
            translated = "".join([part[0] for part in response.json()[0]])
            if cache:
                cache.set(cache_key, translated)
            return translated
    except:
        pass
    
    return text

def translate_episodes(episodes: list, tmdb_id: str, type: str, language: str) -> list:
    return episodes

def translate_catalog(original: dict, tmdb_meta: list, top_stream_poster, toast_ratings, rpdb, rpdb_key, top_stream_key, language: str, addon_url: str, bp: str = '0') -> dict:
    new_catalog = original
    base_url = addon_url.rstrip('/')

    for i, item in enumerate(new_catalog['metas']):
        # 1. Always ensure original poster/background are absolute
        if item.get('poster') and not item['poster'].startswith('http'):
            item['poster'] = f"{base_url}/{item['poster'].lstrip('/')}"
        if item.get('background') and not item['background'].startswith('http'):
            item['background'] = f"{base_url}/{item['background'].lstrip('/')}"

        # 2. Try to translate if we have valid TMDB data
        meta = tmdb_meta[i] if i < len(tmdb_meta) else None
        
        if meta and isinstance(meta, dict) and not meta.get('error'):
            try:
                item_type = item.get('type', 'movie')
                type_key = 'movie_results' if item_type == 'movie' else 'tv_results'
                
                if meta.get(type_key) and len(meta[type_key]) > 0:
                    detail = meta[type_key][0]
                    
                    # Update Title & Description
                    item['name'] = detail.get('title', detail.get('name', item.get('name')))
                    item['description'] = detail.get('overview', item.get('description'))
                    
                    # Update Background
                    if detail.get('backdrop_path'):
                        item['background'] = tmdb.TMDB_BACK_URL + detail['backdrop_path']

                    # Handle Poster Overrides (Priority: BP > RPDB > Toast > TS > TMDB)
                    imdb_id = meta.get('imdb_id')
                    
                    # BetterPoster (btttr.cc)
                    if bp == '1' and imdb_id:
                        item['poster'] = f"https://btttr.cc/poster/imdb/poster-default/{imdb_id}.jpg?lang=ar"
                    
                    # RPDB
                    elif rpdb == '1' and imdb_id:
                        if 't0' in rpdb_key:
                            item['poster'] = f"https://api.ratingposterdb.com/{rpdb_key}/imdb/poster-default/{imdb_id}.jpg"
                        else:
                            item['poster'] = f"https://api.ratingposterdb.com/{rpdb_key}/imdb/poster-default/{imdb_id}.jpg?lang={language.split('-')[0]}"
                    
                    # Toast Ratings
                    elif toast_ratings == '1' and imdb_id:
                        item['poster'] = f"{RATINGS_SERVER}/{item_type}/get_poster/{language}/{imdb_id}.jpg"
                    
                    # Top Stream
                    elif top_stream_poster == '1' and imdb_id and top_stream_key:
                        clean_key = top_stream_key.strip('/')
                        item['poster'] = f"https://api.top-streaming.stream/{clean_key}/imdb/poster-default/{imdb_id}.jpg?lang={language}"
                    
                    # TMDB Default
                    elif detail.get('poster_path'):
                        item['poster'] = tmdb.TMDB_POSTER_URL + detail['poster_path']
            except:
                pass
        
        elif meta and isinstance(meta, dict) and meta.get('error') == 'Invalid API key':
             item['name'] = '⚠️ Invalid TMDB Key'
             item['poster'] = 'https://i.imgur.com/Zi5UZV3.png'

    return new_catalog
