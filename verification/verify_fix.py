
import os
import time
from playwright.sync_api import sync_playwright

def verify_fix(page):
    page.goto(f"file://{os.path.abspath('index.html')}")
    try:
        page.wait_for_selector("#os-interface", state="visible", timeout=10000)
        time.sleep(2) # wait for animations
        page.screenshot(path="verification/fixed_state.png")
        print("Fixed screenshot saved.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        verify_fix(page)
        browser.close()
