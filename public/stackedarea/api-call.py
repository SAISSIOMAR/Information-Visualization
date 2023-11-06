import collections
import requests
import json


def getGenresDatas(nbLoop, target_genres):
    genresDatas = {genre: {"NbSongsPerYears": [], "topThreeRankedSongs": []} for genre in target_genres}
    indexLoop = 0

    while indexLoop < nbLoop:
        try:
            startIndexApi = 200 * indexLoop
            api_url = 'https://wasabi.i3s.unice.fr/api/v1/artist_all/' + str(startIndexApi)

            response = requests.get(api_url)

            if response.status_code == 200:
                api_data = response.json()

                for item in api_data:
                    genres = item.get('genres', [])

                    if any(genre in genres for genre in target_genres):
                        publication_dates = [album["publicationDate"] for album in item.get("albums") if album["publicationDate"] != ""]
                        songsPerYears = [{"year": year, "NbSongs": count} for year, count in collections.Counter(publication_dates).items()]

                        ranks = []
                        for album in item.get("albums", []):
                            for song in album.get("songs", []):
                                rank = song.get("rank")
                                rank = int(rank)
                                if rank is not None and rank != 0:
                                    ranks.append({"title": song.get("title"), "rank": rank})

                        ranks.sort(key=lambda x: x["rank"])
                        topThreeRankedSongs = ranks[:3]

                        for genre in genres:
                            if genre in target_genres:
                                # Extend the NbSongsPerYears list
                                for year_count in songsPerYears:
                                    year = year_count["year"]
                                    count = year_count["NbSongs"]
                                    # Find the year within the genre data
                                    year_entry = next((entry for entry in genresDatas[genre]["NbSongsPerYears"] if entry["year"] == year), None)
                                    if year_entry:
                                        # If the year already exists, add the count to it
                                        year_entry["NbSongs"] += count
                                    else:
                                        # Otherwise, add a new entry for the year
                                        genresDatas[genre]["NbSongsPerYears"].append(year_count)

                                # Extend the topThreeRankedSongs
                                genresDatas[genre]["topThreeRankedSongs"].extend(topThreeRankedSongs)
                                genresDatas[genre]["topThreeRankedSongs"].sort(key=lambda x: x["rank"])
                                genresDatas[genre]["topThreeRankedSongs"] = genresDatas[genre]["topThreeRankedSongs"][:3]

            else:
                print(f"API request failed with status code {response.status_code}: {response.text}")
                break
        except requests.exceptions.RequestException as e:
            print(f"Network error: {e}")
        indexLoop += 1

    return genresDatas

target_genres = [
    'J-Rock',
    'Visual Kei',
    'Garage Rock',
    'Punk Rock',
    'Hip Hop,
    'Gangsta Rap',
    'Underground Hip Hop',
    'Alternative Hip Hop',
    'Pop',
    'Pop Rock',
    'Synthpop',
    'Europop',
    'Heavy Metal',
    'Death Metal',
    'Thrash Metal',
    'Black Metal',
    'Electronic',
    'Electro',
    'Trance',
    'Techno',
    'Indie Pop',
    'Indie Rock',
    'Indie Folk',
    'Dancehall',
    'Eurodance',
    'Dance',
    'Dubstep',
    'R&B',
    'Soul',
    'Gospel',
    'Contemporary R&B',
    'Jazz',
    'Jazz Fusion',
    'Free Jazz',
    'Folk',
    'Folk Rock',
    'Americana',
    'Celtic'
]


result = getGenresDatas(50, target_genres)
print(json.dumps(result, indent=4))
