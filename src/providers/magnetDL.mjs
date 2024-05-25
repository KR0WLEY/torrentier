import axios from 'axios'
import cheerio from 'cheerio'

async function fetchPage(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching the URL: ${url}`);
        return null;
    }
}

function parseHTML(html) {
    const $ = cheerio.load(html);
    const torrents = [];

    $('.fill-table .download tbody tr').each((index, element) => {
        const magnetElement = $(element).find('td.m a');
        const titleElement = $(element).find('td.n a');

        if (magnetElement.length > 0 && titleElement.length > 0) {
            const magnetURL = magnetElement.attr('href');
            const title = titleElement.text().trim();
            const link = `https://www.magnetdl.com${titleElement.attr('href')}`;
            const age = $(element).find('td').eq(2).text().trim();
            const type = $(element).find('td').eq(3).text().trim();
            const files = $(element).find('td').eq(4).text().trim();
            const size = $(element).find('td').eq(5).text().trim();
            const seeders = $(element).find('td').eq(6).text().trim();
            const leechers = $(element).find('td').eq(7).text().trim();

            torrents.push({ title, link, magnetURL, age, type, files, size, seeders, leechers });
        }
    });

    return torrents;
}

async function magnetDLSearch(query, pages = 1) {
    const baseUrl = 'https://www.magnetdl.com';
    let allTorrents = [];
    const formattedQuery = query.replace(/\s+/g, '-');
    for (let page = 1; page <= pages; page++) {
        const url = `${baseUrl}/${query[0].toLowerCase()}/${formattedQuery.toLowerCase()}/`;
        const html = await fetchPage(url);

        if (html) {
            const torrents = parseHTML(html);
            allTorrents = allTorrents.concat(torrents);
        }
    }

    return allTorrents;
}

/*
const query = 'joker';

magnetDLSearch(query, 1).then(torrents => {
    torrents = torrents.filter(t => t.type === 'Movie')
    torrents.forEach(torrent => {
        console.log(`Title: ${torrent.title}`);
        console.log(`Link: ${torrent.link}`);
        console.log(`Magnet URL: ${torrent.magnetURL}`);
        console.log(`Type: ${torrent.type}`);
        console.log(`Size: ${torrent.size}`);
        console.log(`Seeders: ${torrent.seeders}`);
        console.log(`Leechers: ${torrent.leechers}`);
        console.log('---------------------------');
    });
});
*/
export { magnetDLSearch }
