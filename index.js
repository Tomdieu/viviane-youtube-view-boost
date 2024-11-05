const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// Configure Firefox options
let firefoxOptions = new firefox.Options();
firefoxOptions.addArguments('-private'); // Open in private mode

// Configure Chrome options
let chromeOptions = new chrome.Options();
chromeOptions.addArguments('--incognito'); // Open in incognito mode

// Function to open a new browser window for each instance
async function openBrowserInstance(url, browser) {
    let driver;
    if (browser === 'firefox') {
        driver = await new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build();
    } else if (browser === 'chrome') {
        driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
    }
    await driver.get(url);
    return driver;
}

// URL of the YouTube video you want to watch at 2x speed
const youtubeVideoUrl = "https://www.youtube.com/watch?v=5EdVEghU-Xc&autoplay=1&speed=2";

// Function to open multiple browser instances simultaneously
async function openMultipleBrowsers(url, count, browser) {
    let drivers = [];
    let promises = [];
    for (let i = 0; i < count; i++) {
        promises.push(openBrowserInstance(url, browser).then(driver => drivers.push(driver)));
    }
    await Promise.all(promises);
    return drivers;
}

// Open 200 browser instances, 4 at a time
const totalInstances = 1;
const batchSize = 4;
let drivers = [];

(async function() {
    for (let i = 0; i < totalInstances; i += batchSize) {
        console.log(`Opening browsers ${i + 1} to ${i + batchSize}`);
        let firefoxDrivers = await openMultipleBrowsers(youtubeVideoUrl, batchSize, 'firefox');
        let chromeDrivers = await openMultipleBrowsers(youtubeVideoUrl, batchSize, 'chrome');
        drivers = drivers.concat(firefoxDrivers, chromeDrivers);
        await sleep(1000); // Add a delay to avoid overwhelming the server
    }

    // Perform tasks here if needed
    // Example: Print the page title of each browser
    for (let i = 0; i < drivers.length; i++) {
        let title = await drivers[i].getTitle();
        console.log(`Browser ${i + 1} title: ${title}`);
    }

    // Close all browsers
    for (let driver of drivers) {
        await driver.quit();
    }
})();