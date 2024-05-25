// not yet implemented
import Nyaa from 'nyaa-si';

async function NyaaSearch(query) {
    const options = {
        baseUrl: 'https://nyaa.si',
        mode: 'html'
    };
    const nyaa = new Nyaa(options);
    const queryOptions = {
        page: 1,
        category: 'all', // all, anime, audio, literature, live-action, pictures, software, games
        filter: 'no filter', // no filter, trusted only, no remakes
        sort: 'seeders', // date, downloads, size, seeders, leechers, comments
        order: 'desc', // desc, asc
    };
    const result = await nyaa.search(query, queryOptions);
    return result;
}

const query = 'Naruto shippuden';
NyaaSearch(query)
    .then(result => {
        console.log('Search Result:', result);
    })
    .catch(error => {
        console.error('Error:', error);
    });

export { NyaaSearch }
