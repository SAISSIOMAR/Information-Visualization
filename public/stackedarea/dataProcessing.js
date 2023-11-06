const genreMappings = {
    "Rock": ["J-Rock", "Visual Kei", "Garage Rock", "Punk Rock"],
    "Hip Hop": ["Hip Hop", "Gangsta Rap", "Underground Hip Hop", "Alternative Hip Hop"],
    "Pop": ["Pop", "Pop Rock", "Synthpop", "Europop"],
    "Metal": ["Heavy Metal", "Death Metal", "Thrash Metal", "Black Metal"],
    "Electronic": ["Electronic", "Electro", "Trance", "Techno"],
    "Indie": ["Indie Pop", "Indie Rock", "Indie Folk"],
    "Dance": ["Dancehall", "Eurodance", "Dance", "Dubstep"],
    "R&B": ["R&B", "Soul", "Gospel", "Contemporary R&B"],
    "Jazz": ["Jazz", "Jazz Fusion", "Free Jazz"],
    "Folk": ["Folk", "Folk Rock", "Americana", "Celtic"]
};

export function processData(data) {
    const processedData = [];
    const uniqueYears = [];

    // Initialize uniqueYears with all years from the data
    for (const subGenre in data) {
        if (data.hasOwnProperty(subGenre)) {
            const subGenreData = data[subGenre].NbSongsPerYears;
            subGenreData.forEach(entry => {
                const year = entry.year;
                if (!uniqueYears.find(item => item.year === year)) {
                    uniqueYears.push({ year });
                }
            });
        }
    }

    // Iterate through each sub-genre and calculate total songs per year for each big genre
    for (const bigGenre in genreMappings) {
        if (genreMappings.hasOwnProperty(bigGenre)) {
            const subGenres = genreMappings[bigGenre];
            uniqueYears.forEach(yearEntry => {
                const year = yearEntry.year;
                yearEntry[bigGenre] = 0;
                subGenres.forEach(subGenre => {
                    const subGenreData = data[subGenre];
                    if (subGenreData) {
                        const yearData = subGenreData.NbSongsPerYears.find(entry => entry.year === year);
                        if (yearData) {
                            yearEntry[bigGenre] += yearData.NbSongs;
                        }
                    }
                });
            });
        }
    }

    // Sort uniqueYears array by year in ascending order
    uniqueYears.sort((a, b) => a.year - b.year);

    // Convert the uniqueYears array to the final processedData format
    uniqueYears.forEach(entry => {
        processedData.push(entry);
    });

    return processedData;
}

export function createYearlyGenreData(data) {
    const yearlyGenreData = [];

    for (const subGenre in data) {
        if (data.hasOwnProperty(subGenre)) {
            const subGenreData = data[subGenre].NbSongsPerYears;

            subGenreData.forEach(entry => {
                const year = entry.year;

                // Add a condition to start from 1955
                if (year >= 1955) {
                    const existingYearData = yearlyGenreData.find(item => item.year === year);

                    if (!existingYearData) {
                        const newYearData = { year };
                        newYearData[subGenre] = entry.NbSongs;
                        yearlyGenreData.push(newYearData);
                    } else {
                        existingYearData[subGenre] = entry.NbSongs;
                    }
                }
            });
        }
    }

    // Sort the data by year in ascending order
    yearlyGenreData.sort((a, b) => a.year - b.year);

    return yearlyGenreData;
}

