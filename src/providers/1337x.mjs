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

function parseMainPageHTML(html) {
    const $ = cheerio.load(html);
    const torrents = [];

    $('.table-list tbody tr').each((index, element) => {
        const titleElement = $(element).find('.coll-1.name a').last();
        const title = titleElement.text();
        const link = titleElement.attr('href');
        const seeds = $(element).find('.coll-2.seeds').text();
        const leeches = $(element).find('.coll-3.leeches').text();
        const uploadDate = $(element).find('.coll-date').text();
        const size = $(element).find('.coll-4.size').text();

        torrents.push({ title, link: `https://www.1377x.to${link}`, seeds, leeches, uploadDate, size });
    });

    return torrents;
}

async function fetchMagnetURL(torrentPageURL) {
    const html = await fetchPage(torrentPageURL);
    if (html) {
        const $ = cheerio.load(html);
        const magnetURL = $('a[href^="magnet:"]').attr('href');
        const category = $('ul.list li:contains("Category") span').text();
        return { magnetURL, category };
    }
    return null;
}

async function scrape1337x(query, pages = 1) {
    const baseUrl = 'https://www.1377x.to/search';
    let allTorrents = [];

    for (let page = 1; page <= pages; page++) {
        const url = `${baseUrl}/${query}/${page}/`;
        const html = await fetchPage(url);

        if (html) {
            const torrents = parseMainPageHTML(html);
            for (let torrent of torrents) {
                const { magnetURL, category } = await fetchMagnetURL(torrent.link);
                torrent.magnetURL = magnetURL;
                torrent.category = category;
            }
            allTorrents = allTorrents.concat(torrents);
        }
    }

    return allTorrents;
}
/*
const query = 'Deadpool';

scrape1337x(query, 2).then(torrents => {
    torrents = torrents.filter(t => t.category === 'Movie')

    torrents.forEach(torrent => {
        console.log(`Title: ${torrent.title}`);
        console.log(`Magnet URL: ${torrent.magnetURL}`);
        console.log(`Seeds: ${torrent.seeds}`);
        console.log(`Leeches: ${torrent.leeches}`);
        console.log(`Upload Date: ${torrent.uploadDate}`);
        console.log(`Size: ${torrent.size}`);
        console.log(`Category: ${torrent.category}`);
        console.log('---------------------------');
    });
});
*/
export { scrape1337x }
