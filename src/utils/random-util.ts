import {v4 as uuid} from "uuid";

export function randomIndex(arr: any[]){
    return Math.floor(Math.random() * arr.length);
}

export function randomDouble(min:number, max: number, decimals: number): number{

    const range = max - min;
    const randomValue = Math.random() * range + min;
    return parseFloat(randomValue.toFixed(decimals));

}

export function randomAlphaNumeric () {

    const combinations = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomIndex = Math.floor(Math.random() * combinations.length);
    const randomCharacter = combinations.charAt(randomIndex);
    return randomCharacter;    

}

/** basically uuid without hyphens (36 -> 32 chars) */
export function randomCardNumber() {
    return uuid().replace(/-/g, '');
}

export function randomDateBetween(startDate: Date, endDate: Date): Date {

    const timeDiff = endDate.getTime() - startDate.getTime();
    const randomOffset = Math.floor(Math.random() * timeDiff);

    const randomDate = new Date(startDate.getTime() + randomOffset);
  
    return randomDate;
}

export function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const BUS_CODE = "BUS";
export const MRT_CODE = "MRT";

function randomSevenEleven(){

    // Generate a random number between 1 and 778 (inclusive)
    const randomNum = randomInt(1, 778);

    // Pad the number with leading zeros to ensure three digits
    const num = randomNum.toString().padStart(3, "0");

    return `7-11 ${num}`

}

function randomMrt(){

    // Generate a random number between 1 and 778 (inclusive)
    const randomNum = randomInt(1, 778);

    // Pad the number with leading zeros to ensure three digits
    const num = randomNum.toString().padStart(3, "0");

    return `MRT ${num}`

}

// [index, value]
function randomMerchants(){ 

    const merchants = [
        'Restoran Harum Manis',
        'Restoran Palm Beach',
        'Chakra Restaurant',
        'Ishin Japanese Dining',
        'Chynna',
        'Serena Brasserie',
        'Kampachi EQ',
        'Iketeru Restaurant',
        'Chambers Grill',
        'Makan Kitchen',
        'Nook',
        'Beta KL',
        'Yarl Restaurant',
        'Tg Nasi Kandar',
        'Nam Heong Vintage, Pavillion',
        'MTR 1924 Malaysia',
        'Niko Neko Matcha 1.5',
        'LOKL Coffee Co.',
        'VCR',
        'Antipodean Tan & Tan',
    ]

    const idx = randomIndex(merchants);

    return [idx, merchants[idx]]

}

function randomTouristSpots() {

    const locations = [

        'Petronas Twin Tower',
        'Legoland Malaysia',
        'Menara Kuala Lumpur',
        'Batu Caves',
        'Sunway Lagoon',
        'Aquaria KLCC',
        'Resorts World Genting',
        'Merdeka Square',
        'KLCC Park',
        'Pavillion Kuala Lumpur',
        'Taman Negara',
        'Langkawi Skybridge Cable Car',
        'Bako National Park',
        'Islamic Arts Musuem Malaysia',
        'Langkawi Sky Bridge',
        'Mount Kinabalu',
        'Lost World of Tambun',
        'Sri Mahamariamman Temple',
        'Langkawi Island',
        'Petaling Street',
        'Bukit Bintang',
        'Sultan Abdul Samad Building',
        'Tanjung Rhu Beach',
        'Skytrail Jungle Trek',
        'Suria KLCC',
        'KL Forest Eco Park',
        'Gunung Mulu National Park',

    ]

    const idx = randomIndex(locations);

    return locations[idx];

}

export function randomCardLocation() {

    const idx = Math.floor(Math.random() * 3);

    if (idx === 0) {
        return randomSevenEleven();
    }
    else if (idx === 1) {
        return randomMrt();
    }

    return randomTouristSpots();

}

export function randomWalletLocation() {

    const idx = Math.floor(Math.random() * 3);

    if (idx === 0) {
        return randomSevenEleven();
    }
    else if (idx === 1) {
        return randomMrt();
    }

    return randomTouristSpots();

}

export function randomTransactionStatus() {

    const arr = ["SUCCESS", "PENDING", "FAILED"];

    return arr[randomIndex(arr)];

}


