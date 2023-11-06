import requests

def getLabelsDatas(nbLoop):
    label_datas = {}
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
                    labels = item.get('labels', [])  # Assuming 'labels' is the key for labels
                    publication_dates = [album["publicationDate"] for album in item.get("albums") if album["publicationDate"]!=""]
                    genresFromArtistes = item.get("genres")
                    for label in labels:
                        if label in label_datas:
                            label_datas[label]["GenresFromArtistes"] = list(set(genresFromArtistes + label_datas[label]["GenresFromArtistes"]))
                            label_datas[label]["NbTotalArtiste"] += 1
                            label_datas[label]["Artists"].append({"NameArtist" : item.get("name"), "PublicationDates" : publication_dates})
                        else:
                            label_datas[label] = {"NbTotalArtiste": 1, "Artists": [{"NameArtist" : item.get("name"), "PublicationDates" : publication_dates}],
                                                        "GenresFromArtistes": genresFromArtistes}

            else:
                # Handle the API error (e.g., print error message or raise an exception)
                print(f"API request failed with status code {response.status_code}: {response.text}")
        except requests.exceptions.RequestException as e:
            # Handle network-related issues (e.g., connection error)
            print(f"Network error: {e}")
        indexLoop += 1
    return label_datas



print(getLabelsDatas(2))