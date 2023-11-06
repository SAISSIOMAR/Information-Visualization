import requests
import pycountry_convert as pc

def parseGenre(genre):
    if genre in ["Rock","Soft Rock","Rap Rock","Pop Rock","Piano Rock","Symphonic Rock, Electronic Rock","Progressive Rock","Indie Rock","Industrial Rock","Gothic Rock","Glam Rock","Hard Rock","Deutschrock","Experimental Rock","Folk Rock","Art Rock","J-Rock","Psychedelic Rock","Alternative Rock"]:
        return "Rock"
    elif genre in ["Hip Hop","Trip Hop","Southern Hip Hop","Trip Hop","Hardcore Hip Hop, Christian Hip Hop","Australian Hip Hop"]:
        return "Hip Hop"
    elif genre in ["Pop","Electropop","Synthpop","Psychedelic Pop","Power Pop","Experimental Pop","Pop Punk","Indie Pop","French Pop"]:
        return "Pop"
    elif genre in ["Folk", "Filk"]:
        return "Folk"
    elif genre in ["Black Metal","Glam Metal","Melodic Death Metal","Metalcore","Progressive Metal","Power Metal","Folk Metal","Death Metal","Heavy Metal","Gothic Metal","Nu Metal"]:
        return "Metal"
    elif genre in ["Jazz"]:
        return "Jazz"
    elif genre in ["Country"]:
        return "Country"
    elif genre in ["R&B"]:
        return "R&B"
    else:
        return "Others"

def country_to_continent(country_name):
    try:
        country_alpha2 = pc.country_name_to_country_alpha2(country_name)
        country_continent_code = pc.country_alpha2_to_continent_code(country_alpha2)
        country_continent_name = pc.convert_continent_code_to_continent_name(country_continent_code)
        return country_continent_name
    except:
        return "Others"

def getTopThreeRankedSongs(item,genresFromArtistes):
    ranks = []
    for album in item.get("albums", []):
        for song in album.get("songs", []):
            rank = song.get("rank")
            if rank is not None and rank != 0:
                ranks.append({"title": song.get("title"), "rank": rank, "artiste": item.get("name"),
                              "genre": genresFromArtistes})

    # Sort the songs by rank
    ranks.sort(key=lambda x: x["rank"])
    return ranks[:3]

def fixCountry(country):
    if country in ["England", "Scotland", "Wales", "Northern Ireland"]:
        return "United Kingdom"
    elif country == "The Netherlands":
        return "Netherlands"
    else:
        return country

def getCountriesDatas(nbLoop):
    continent_datas = {}
    indexLoop = 0

    while indexLoop < nbLoop:
        try:
            startIndexApi = 200 * indexLoop
            api_url = 'https://wasabi.i3s.unice.fr/api/v1/artist_all/'+str(startIndexApi)
            response = requests.get(api_url)
            if response.status_code == 200:
                api_data = response.json()
                for item in api_data:
                    country = item.get('locationInfo')[0] if len(item.get('locationInfo')) else ""
                    if country=="":
                        country = item.get("location").get("country") if item.get("location") else ""
                        country = "Others" if country=="" else country
                    country = fixCountry(country)
                    continent = country_to_continent(country)
                    genres = {}
                    if continent in continent_datas:
                         genres = continent_datas[continent]
                    artisteAlived = 1 if item.get("lifeSpan")["ended"]==False else 0

                    for album in item.get("albums", []):
                        genre = parseGenre(album.get("genre"))
                        publicationDate = str(album.get("publicationDate"))
                        try:
                            int(publicationDate)
                        except:
                            continue
                        deezerFans = album.get("deezerFans") if album.get("deezerFans") else 0
                        if genre in genres:
                            if publicationDate in genres[genre]:
                                genres[genre][publicationDate]["NbDezerFan"] += deezerFans
                                genres[genre][publicationDate]["NbArtiste"] += 1
                                genres[genre][publicationDate]["NbArtistesAlive"] += artisteAlived
                            else:
                                genres[genre][publicationDate] = {"NbDezerFan":deezerFans, "NbArtiste": 1,"NbArtistesAlive" : artisteAlived }
                        else:
                            genres[genre] = {publicationDate : {"NbDezerFan":deezerFans, "NbArtiste": 1,"NbArtistesAlive" : artisteAlived }}

                    if continent in continent_datas:
                        continent_datas[continent] = genres
                    else:
                        continent_datas[continent] = genres



            else:
                # Handle the API error (e.g., print error message or raise an exception)
                print(f"API request failed with status code {response.status_code}: {response.text}")
        except requests.exceptions.RequestException as e:
            # Handle network-related issues (e.g., connection error)
            print(f"Network error: {e}")
        indexLoop += 1
    return continent_datas

print(getCountriesDatas(20))