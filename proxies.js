const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape HTTPS proxies from the website
async function scrapeHttpsProxies() {
    try {
        const response = await axios.get('https://us-proxy.org/#list');
        const html = response.data;
        const $ = cheerio.load(html);
        
        const proxies = [];

        // Select the rows in the proxy list table
        $('table#proxylisttable tbody tr').each((index, element) => {
            const tds = $(element).find('td');
            const ip = $(tds[0]).text();
            const port = $(tds[1]).text();
            const protocol = $(tds[4]).text(); // Protocol is in the 5th column

            // Check if the protocol is HTTPS
            if (protocol === 'yes') {
                proxies.push(`http://${ip}:${port}`);
            }
        });

        return proxies;
    } catch (error) {
        console.error('Error fetching proxies:', error);
        return [];
    }
}

// Function to test if a proxy can access YouTube
async function testProxy(proxy) {
    try {
        const response = await axios.get('https://www.youtube.com', {
            proxy: {
                host: proxy.split(':')[1].replace('http://', ''),
                port: parseInt(proxy.split(':')[2]),
            },
            timeout: 5000 // Timeout after 5 seconds
        });
        return response.status === 200; // Return true if the response is successful
    } catch (error) {
        return false; // Return false if there's an error
    }
}

// Main function to scrape and test proxies
(async function() {
    const httpsProxies = await scrapeHttpsProxies();
    console.log('Found HTTPS Proxies:', httpsProxies);

    const workingProxies = [];

    for (const proxy of httpsProxies) {
        const canAccessYouTube = await testProxy(proxy);
        if (canAccessYouTube) {
            workingProxies.push(proxy);
            console.log(`Working Proxy: ${proxy}`);
        } else {
            console.log(`Proxy not working: ${proxy}`);
        }
    }

    console.log('Working Proxies that can access YouTube:', workingProxies);
})();