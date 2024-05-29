import axios from 'axios';
import cheerio from 'cheerio';

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
        const titleElement = $(element).find('.coll-1.name a').last();const title = titleElement.text();const link = titleElement.attr('href');const seeds = $(element).find('.coll-2.seeds').text();const leeches = $(element).find('.coll-3.leeches').text();const uploadDate = $(element).find('.coll-date').text();const size = $(element).find('.coll-4.size').text();
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

async function scrape1337x(query, categories, pages = 1) {
    const categoryURL = { Games: `https://www.1377x.to/category-search/${query}/Games/`, Movies: `https://www.1377x.to/category-search/${query}/Movies/`, Animes: `https://www.1377x.to/category-search/${query}/Anime/`, TV: `https://www.1377x.to/category-search/${query}/TV/`, BaseURL: 'https://www.1377x.to/search' };

    let allTorrents = [];

    if (categories.length === 0 || categories.includes('All')) {
        for (let page = 1; page <= pages; page++) {
            const url = `${categoryURL.BaseURL}/${query}/${page}/`;
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
    } else {
        for (let category of categories) {
            for (let page = 1; page <= pages; page++) {
                const url = `${categoryURL[category]}/${page}/`;
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
        }
    }

    return allTorrents;
}

export { scrape1337x };
