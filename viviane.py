from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import threading

# Configure Firefox options (disable headless mode to watch the video)
firefox_options = Options()
# firefox_options.headless = True  # Uncomment this to run in headless mode
firefox_options.add_argument("-private")  # Open in private mode

# Create a new Firefox profile and set preferences to allow autoplay
profile = webdriver.FirefoxProfile()
profile.set_preference("media.autoplay.default", 0)  # Allow all autoplay
profile.set_preference("media.autoplay.allow-muted", True)  # Allow muted autoplay

# Function to open a new browser window for each instance
def open_browser_instance(url):
    driver = webdriver.Firefox(firefox_profile=profile, options=firefox_options)  # Change this if using a different browser
    driver.get(url)
    
    # Wait for the video element to be present and click it to start playing
    try:
        video_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "video"))
        )
        driver.execute_script("arguments[0].scrollIntoView();", video_element)
        
        video_element.click()
    except Exception as e:
        print(f"Error clicking video: {e}")
    
    return driver

# URL of the YouTube video you want to watch
youtube_video_url = "https://www.youtube.com/watch?v=5EdVEghU-Xc"

# Function to open multiple browser instances simultaneously
def open_multiple_browsers(url, count):
    drivers = []
    threads = []
    for i in range(count):
        thread = threading.Thread(target=lambda i=i: drivers.append(open_browser_instance(url)))
        threads.append(thread)
        thread.start()
    for thread in threads:
        thread.join()
    return drivers

# Open 200 browser instances, 4 at a time
total_instances = 1
batch_size = 2
drivers = []

for i in range(0, total_instances, batch_size):
    print(f"Opening browsers {i+1} to {i+batch_size}")
    drivers.extend(open_multiple_browsers(youtube_video_url, batch_size))
    time.sleep(1)  # Add a delay to avoid overwhelming the server

# Perform tasks here if needed
# Example: Print the page title of each browser
for i, driver in enumerate(drivers):
    print(f"Browser {i+1} title: {driver.title}")

# Close all browsers
for driver in drivers:
    driver.quit()