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
                    labels = item.get("labels")

                    ranks = []
                    nbRankedSong = 0
                    for album in item.get("albums", []):
                        for song in album.get("songs", []):
                            rank = song.get("rank")
                            if rank is not None and rank != 0:
                                ranks.append(rank)
                                nbRankedSong += 1
                    averageRankSongs = 0
                    if len(ranks) > 0:
                        averageRankSongs = round(sum(ranks) / len(ranks))

                    artisteDatas = {"NameArtist" : item.get("name"), "PublicationDates" : publication_dates,
                                                                  "AverageRankSongs": averageRankSongs, "NBRankedSongs": nbRankedSong}
                    country = [item.get("location").get("country")]
                    for genre in genres:
                        if genre in genresDatas:
                            genresDatas[genre]["Countries"] = list(set(country + genresDatas[genre]["Countries"]))
                            genresDatas[genre]["labels"] = list(set(labels + genresDatas[genre]["labels"]))
                            genresDatas[genre]["NbTotalArtiste"] += 1
                            genresDatas[genre]["Artists"].append(artisteDatas)
                        else:
                            genresDatas[genre] = {"NbTotalArtiste": 1, "Artists": [artisteDatas],
                                                        "labels": labels, "Countries" : country}

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