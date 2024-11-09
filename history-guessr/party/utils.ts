    /*
     This code is for scoring the player on each turn of the game
     */
     export const haversineDistance = (latCorrect: number, lonCorrect: number, latGuess: number, lonGuess: number): number => {
        const toRad = (x: number) => x * Math.PI / 180;

        const R = 6371; // Earth radius in kilometers
        const dLat = toRad(latGuess - latCorrect);
        const dLon = toRad(lonGuess - lonCorrect);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(latCorrect)) * Math.cos(toRad(latGuess)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    };

    export const dateDifference = (date1: number, date2: number): number => {
        const diffTime = Math.abs(date1 - date2);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    export const calculateUserScore = ( actualLat: number, actualLon: number, actualDate: number,guessLat: number, guessLon: number, guessDate: number): number => {
        // Haversine formula to calculate distance between two points on Earth
        const MAX_SCORE = 1000;

        // 1. Calculate distance score based on latitude and longitude
        const distance = haversineDistance(actualLat, actualLon, guessLat, guessLon);
        const maxDistance = 20020; // Maximum distance between two points on Earth
        const distanceScore = Math.max(0, MAX_SCORE - (distance / maxDistance) * MAX_SCORE);

        // 2. Calculate date score based on date difference
        const dateDiff = dateDifference(actualDate, guessDate);
        const maxDateDiff = 100;
        const dateScore = Math.max(0, MAX_SCORE - (dateDiff / maxDateDiff) * MAX_SCORE);

        // 3. Combine distance and date scores (could weight differently if needed)
        const finalScore = (distanceScore * 0.7) + (dateScore * 0.3);

        return Math.round(finalScore);
    };