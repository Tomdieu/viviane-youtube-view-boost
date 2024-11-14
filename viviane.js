const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// Proxy list (you'll need a working list of proxy servers here)
const proxies = [
    "http://proxy1.com:8080",
    "http://proxy2.com:8080",
    "http://proxy3.com:8080"
];

// User-agent list for rotation
const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1"
];

// Random sleep function for natural delays
function randomSleep(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return sleep(delay);
}

// Get a random proxy from the list
function getRandomProxy() {
    return proxies[Math.floor(Math.random() * proxies.length)];
}

// Get a random user agent
function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Random browsing actions for more human-like behavior
async function randomNavigation(driver) {
    const actions = driver.actions({ async: true });

    // Simulate scrolling to comments
    await actions.scroll(0, Math.floor(Math.random() * 600) + 200).perform();
    await randomSleep(3000, 7000); // Wait before the next action

    // Optionally click a random related video
    let relatedVideos = await driver.findElements(By.css('ytd-compact-video-renderer'));
    if (relatedVideos.length > 0) {
        let randomVideo = relatedVideos[Math.floor(Math.random() * relatedVideos.length)];
        await randomVideo.click();
        await randomSleep(5000, 10000);
    }

    // Return to the original video
    await driver.navigate().back();
}

// Open a browser instance with randomized proxy and user-agent
async function openBrowserInstanceWithRandomization(url, browser) {
    let driver;
    const proxy = getRandomProxy();
    const userAgent = getRandomUserAgent();

    if (browser === 'firefox') {
        const firefoxOptions = new firefox.Options()
            .addArguments('-private')
            .addArguments(`-user-agent=${userAgent}`);
        firefoxOptions.setProxy({ proxyType: 'manual', httpProxy: proxy, sslProxy: proxy });
        driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build();
    } else if (browser === 'chrome') {
        const chromeOptions = new chrome.Options()
            .addArguments('--incognito')
            .addArguments(`--user-agent=${userAgent}`);
        chromeOptions.setProxy({ proxyType: 'manual', httpProxy: proxy, sslProxy: proxy });
        driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
    }

    await driver.get(url);

    // Wait for the video element to be present, then interact with it
    let videoElement = await driver.wait(until.elementLocated(By.css('video')), 10000);
    await randomSleep(3000, 6000); // Natural delay before starting video interaction
    await videoElement.click(); // Start playing the video

    // Perform random navigation for more human-like behavior
    await randomNavigation(driver);

    return driver;
}

// Open multiple browsers with randomization
async function openMultipleBrowsers(url, count, browser) {
    let drivers = [];
    for (let i = 0; i < count; i++) {
        const driver = await openBrowserInstanceWithRandomization(url, browser);
        drivers.push(driver);
        await randomSleep(5000, 10000); // Wait before opening next instance
    }
    return drivers;
}

// URL of the YouTube video
const youtubeVideoUrl = "https://www.youtube.com/watch?v=5EdVEghU-Xc&mute=1&autoplay=1";

// Main function to open browser instances
(async function() {
    const totalInstances = 4;
    let drivers = await openMultipleBrowsers(youtubeVideoUrl, totalInstances, 'firefox');

     // Wait for 45 seconds to simulate watching the video
     await sleep(45000); // Changed from 30000 to 45000

    // Print the page title of each browser
    for (let i = 0; i < drivers.length; i++) {
        let title = await drivers[i].getTitle();
        console.log(`Browser ${i + 1} title: ${title}`);
    }

    // Close all browsers after a set time
    for (let driver of drivers) {
        await driver.quit();
    }
})();
