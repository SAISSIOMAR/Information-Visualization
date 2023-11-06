import requests


def getArtistsDatas(nbLoop):
    artistsDatas = {}
    indexLoop = 0

    while indexLoop < nbLoop:
        try:
            startIndexApi = 200 * indexLoop
            api_url = 'https://wasabi.i3s.unice.fr/api/v1/artist_all/'+str(startIndexApi)
            response = requests.get(api_url)

            # Check if the request was successful (status code 200)
            if response.status_code == 200:
                # Parse and work with the API response data (JSON in this example)
                api_data = response.json()

                # Create a dictionary to store label frequencies

                # Extract and count label occurrences from the response
                for item in api_data:
                    artistName = item.get("name")
                    num_albums = len(item.get("albums"))
                    num_songs = sum(len(album["songs"]) for album in item.get("albums"))
                    ranks = []
                    nbRankedSong = 0
                    for album in item.get("albums", []):
                        for song in album.get("songs", []):
                            rank = song.get("rank")
                            if rank is not None and rank!=0:
                                ranks.append(rank)
                                nbRankedSong+=1
                    averageRankSongs = 0
                    if len(ranks)>0:
                        averageRankSongs = round(sum(ranks) / len(ranks))

                    artistsDatas[artistName] = { "NbMusique": num_songs, "NbAlbums": num_albums, "AverageRankSongs": averageRankSongs, "NBRankedSongs": nbRankedSong,
                                                 "Genres": item.get("genres"), "Location": item.get("locationInfo"), "Country" : item.get("location").get("country") }

            else:
                # Handle the API error (e.g., print error message or raise an exception)
                print(f"API request failed with status code {response.status_code}: {response.text}")
        except requests.exceptions.RequestException as e:
            # Handle network-related issues (e.g., connection error)
            print(f"Network error: {e}")

        indexLoop += 1
    return artistsDatas

print(getArtistsDatas(1))