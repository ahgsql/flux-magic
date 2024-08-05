

export function findNearestAspectRatio(width, height) {
    const aspectRatios = [
        { ratio: "1:1", value: 1 },
        { ratio: "16:9", value: 16 / 9 },
        { ratio: "21:9", value: 21 / 9 },
        { ratio: "2:3", value: 2 / 3 },
        { ratio: "3:2", value: 3 / 2 },
        { ratio: "4:5", value: 4 / 5 },
        { ratio: "5:4", value: 5 / 4 },
        { ratio: "9:16", value: 9 / 16 },
        { ratio: "9:21", value: 9 / 21 }
    ];

    const imageRatio = width / height;
    let closestRatio = aspectRatios[0];
    let minDifference = Math.abs(imageRatio - aspectRatios[0].value);

    for (let i = 1; i < aspectRatios.length; i++) {
        const difference = Math.abs(imageRatio - aspectRatios[i].value);
        if (difference < minDifference) {
            minDifference = difference;
            closestRatio = aspectRatios[i];
        }
    }

    return closestRatio.ratio;
}