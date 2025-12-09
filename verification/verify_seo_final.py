
import os
from playwright.sync_api import sync_playwright, expect

def check_seo_elements(page):
    # Navigate to the local file
    page.goto(f"file://{os.path.abspath('index.html')}")

    # 1. Verify Boot Screen H1 (Immediate visibility)
    # This is critical for "First Result" as it provides immediate keyword content
    # Target specific H1 for boot screen
    h1 = page.get_by_role("heading", name="CHAMATH ADITHYA SYSTEM BOOT")
    expect(h1).to_be_visible()
    print("SUCCESS: Boot Screen H1 found and text verified.")

    # Take screenshot of the boot screen with H1
    page.screenshot(path="verification/final_boot_screen.png")
    print("Screenshot taken: verification/final_boot_screen.png")

    # 2. Verify <noscript> content (for crawlers)
    content = page.content()
    # Check for keywords actually present in the file
    if "<noscript>" in content and "Chamath Adithya" in content:
        # detailed check
        if "Full-Stack Development" in content and "Projects" in content:
             print("SUCCESS: <noscript> tag found with rich content.")
        else:
             print("WARNING: <noscript> tag found but might be missing some keywords.")
             print("Debug Content Snippet:", content[:500]) # Print start of content for debug if needed
    else:
        print("FAILURE: <noscript> tag not found.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            check_seo_elements(page)
        except Exception as e:
            print(f"ERROR: {e}")
        finally:
            browser.close()
