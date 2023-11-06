import collections
from collections import Counter

import requests



def getGenresDatas(nbLoop):
    genresDatas = {}
    indexLoop = 0

    while indexLoop < nbLoop:
        try:
            startIndexApi = 200 * indexLoop
            api_url = 'https://wasabi.i3s.unice.fr/api/v1/artist_all/'+str(startIndexApi)
            # Make a GET request to the API
            response = requests.get(api_url)

            # Check if the request was successful (status code 200)
            if response.status_code == 200:
                # Parse and work with the API response data (JSON in this example)
                api_data = response.json()

                # Create a dictionary to store label frequencies

                # Extract and count label occurrences from the response
                for item in api_data:
                    genres = item.get('genres', [])  # Assuming 'labels' is the key for labels
                    publication_dates = [album["publicationDate"] for album in item.get("albums") if album["publicationDate"]!=""]

                    songsPerYears = [{"year": year, "NbSongs": count} for year, count in
                              collections.Counter(publication_dates).items()]

                    ranks = []
                    for album in item.get("albums", []):
                        for song in album.get("songs", []):
                            rank = song.get("rank")
                            if rank is not None and rank != 0:
                                ranks.append({"title": song.get("title"), "rank": rank})

                    # Sort the songs by rank
                    ranks.sort(key=lambda x: x["rank"])

                    # Get the top three ranked songs
                    topThreeRankedSongs = ranks[:3]
                    for genre in genres:
                        if genre in genresDatas:
                            genresDatas[genre]["NbSongsPerYears"] = [{'year': year, 'NbSongs': count} for year, count in Counter(item['year'] for item in genresDatas[genre]["NbSongsPerYears"] + songsPerYears).items()]
                            genresDatas[genre]["topThreeRankedSongs"] += topThreeRankedSongs
                            genresDatas[genre]["topThreeRankedSongs"].sort(key=lambda x: x["rank"])
                            genresDatas[genre]["topThreeRankedSongs"] = genresDatas[genre]["topThreeRankedSongs"][:3]
                        else:
                            genresDatas[genre] = {"NbSongsPerYears": songsPerYears, "topThreeRankedSongs" : topThreeRankedSongs}

            else:
                # Handle the API error (e.g., print error message or raise an exception)
                print(f"API request failed with status code {response.status_code}: {response.text}")
                break
        except requests.exceptions.RequestException as e:
            # Handle network-related issues (e.g., connection error)
            print(f"Network error: {e}")
        indexLoop += 1
    return genresDatas


print(getGenresDatas(1))