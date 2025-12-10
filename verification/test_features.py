
import os
import time
import re
from playwright.sync_api import sync_playwright, expect

def test_features(page):
    # Load the page using a path relative to this script for robustness
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    index_path = os.path.join(project_root, 'index.html')

    page.goto(f"file://{index_path}")

    # Wait for boot sequence to finish
    print("Waiting for boot sequence...")
    page.wait_for_selector("#os-interface", state="visible", timeout=15000)
    print("Boot sequence complete.")

    # Handle auto-opened About Window
    # The script opens 'about-window' 500ms after boot on desktop.
    print("Waiting for auto-opened Profile window...")
    about_window = page.locator("#about-window")
    # Wait for it to be visible to ensure it has opened
    expect(about_window).to_be_visible(timeout=5000)
    print("Profile window auto-opened. Closing it to clear workspace...")

    # Close it (Profile window has aria-label)
    page.click("#about-window button[aria-label='Close Profile']")
    expect(about_window).not_to_have_class(re.compile(r".*\bactive\b.*"))
    # Wait for taskbar item to disappear
    expect(page.locator("#task-about-window")).not_to_be_visible()
    print("Workspace cleared.")

    # --- Test Case 1: Terminal Functionality ---
    print("Testing Terminal...")
    # Open Terminal
    page.click("button[aria-label='Open Terminal']")

    # Wait for terminal window to be active
    terminal_window = page.locator("#terminal-window")
    expect(terminal_window).to_be_visible()

    # Check for active class using regex on the class attribute
    expect(terminal_window).to_have_class(re.compile(r".*\bactive\b.*"))

    # Check Taskbar for Terminal
    taskbar_item = page.locator("#task-terminal-window")
    expect(taskbar_item).to_be_visible()

    # Input 'help' command
    term_input = page.locator("#term-input")
    term_input.fill("help")
    term_input.press("Enter")

    # Verify output
    term_output = page.locator("#terminal-output")
    expect(term_output).to_contain_text("Available commands: help, ls, cat")

    # Input 'whoami' command
    term_input.fill("whoami")
    term_input.press("Enter")
    expect(term_output).to_contain_text("Chamath Adithya | Founder & CTO | SOLVEO")

    # Input 'date' command
    term_input.fill("date")
    term_input.press("Enter")
    # Just check if some text was added, tricky to check exact date without regex, but just checking if command didn't error
    expect(term_output).not_to_contain_text("Command not found: date")

    # Input invalid command
    term_input.fill("invalid_cmd")
    term_input.press("Enter")
    expect(term_output).to_contain_text("Command not found: invalid_cmd")

    # Close Terminal (Terminal has aria-label)
    page.click("#terminal-window button[aria-label='Close Terminal']")
    expect(terminal_window).not_to_have_class(re.compile(r".*\bactive\b.*"))
    expect(taskbar_item).not_to_be_visible()
    print("Terminal tests passed.")

    # --- Test Case 2: Calculator Logic ---
    print("Testing Calculator...")
    # Open Calculator
    page.click("button[aria-label='Open Calculator']")
    calc_window = page.locator("#calc-window")
    expect(calc_window).to_be_visible()

    # 1 + 2 = 3
    page.click("#calc-window button:has-text('1')")
    page.click("#calc-window button:has-text('+')")
    page.click("#calc-window button:has-text('2')")
    page.click("#calc-window button:has-text('=')")

    calc_display = page.locator("#calc-display")
    expect(calc_display).to_have_text("3")

    # Clear
    page.click("#calc-window button:has-text('C')")
    expect(calc_display).to_have_text("0")

    # 5 * 5 = 25
    page.click("#calc-window button:has-text('5')")
    page.click("#calc-window button:has-text('*')")
    page.click("#calc-window button:has-text('5')")
    page.click("#calc-window button:has-text('=')")
    expect(calc_display).to_have_text("25")

    # Error case
    page.click("#calc-window button:has-text('C')")
    page.click("#calc-window button:has-text('*')")
    page.click("#calc-window button:has-text('=')")
    expect(calc_display).to_have_text("ERR")

    # Close Calculator (No aria-label, using onclick)
    page.click("#calc-window button[onclick=\"closeWindow('calc-window')\"]")
    print("Calculator tests passed.")

    # --- Test Case 3: Window Management & Settings ---
    print("Testing Settings & Windows...")
    # Open Settings
    page.click("button[aria-label='Open Settings']")
    settings_window = page.locator("#settings-window")
    expect(settings_window).to_be_visible()

    # Scanlines toggle
    scanlines = page.locator(".scanlines")
    # Initially visible (block)
    expect(scanlines).to_be_visible()

    # Click toggle
    page.click("#scanline-btn")
    # Should be hidden (display: none)
    expect(scanlines).not_to_be_visible()

    # Click toggle again
    page.click("#scanline-btn")
    expect(scanlines).to_be_visible()

    # Theme switching
    # Default is no theme class on body (or empty)
    body = page.locator("body")
    # Click AMBER
    page.click("button:has-text('AMBER')")
    expect(body).to_have_class(re.compile(r".*\btheme-amber\b.*"))

    # Click GREEN
    page.click("button:has-text('GREEN')")
    expect(body).to_have_class(re.compile(r".*\btheme-green\b.*"))

    # Click CYAN (should remove other classes)
    page.click("button:has-text('CYAN')")
    expect(body).not_to_have_class(re.compile(r".*\btheme-amber\b.*"))
    expect(body).not_to_have_class(re.compile(r".*\btheme-green\b.*"))

    # Close Settings (No aria-label, using onclick)
    page.click("#settings-window button[onclick=\"closeWindow('settings-window')\"]")
    print("Settings tests passed.")

    # --- Test Case 4: Start Menu ---
    print("Testing Start Menu...")
    start_menu = page.locator("#start-menu")
    # Start menu uses opacity/pointer-events to hide, not display:none.
    # So to_be_visible() might return true.
    # We check for the class 'hidden-menu'
    expect(start_menu).to_have_class(re.compile(r".*\bhidden-menu\b.*"))

    # Click Start Button
    page.click("button[aria-label='Open Start Menu']")
    # Now it should be visible-menu
    expect(start_menu).to_have_class(re.compile(r".*\bvisible-menu\b.*"))
    expect(start_menu).not_to_have_class(re.compile(r".*\bhidden-menu\b.*"))

    # Click Profile in Start Menu
    page.click("#start-menu button[aria-label='Open Profile']")

    # Start menu should close (have hidden-menu class)
    expect(start_menu).to_have_class(re.compile(r".*\bhidden-menu\b.*"))

    # Profile window should open
    # Note: about_window var is defined earlier
    expect(about_window).to_be_visible()
    expect(about_window).to_have_class(re.compile(r".*\bactive\b.*"))

    # Verify taskbar item is present
    print("Verifying taskbar item...")
    taskbar_item = page.locator("#task-about-window")
    expect(taskbar_item).to_be_visible(timeout=5000)

    # Maximize Profile
    # Check initial size (not maximized) - width should not be 100%
    print("Maximizing Profile...")
    page.click("#about-window button[aria-label='Maximize Profile']")
    expect(about_window).to_have_attribute("style", re.compile(r".*width: 100%.*"))

    # Restore
    print("Restoring Profile...")
    page.click("#about-window button[aria-label='Maximize Profile']")
    expect(about_window).not_to_have_attribute("style", re.compile(r".*width: 100%.*"))

    # Minimize Profile
    print("Minimizing Profile...")
    page.click("#about-window button[aria-label='Minimize Profile']")
    expect(about_window).not_to_have_class(re.compile(r".*\bactive\b.*"))

    # Verify taskbar item is GONE (because minimize = close in this OS)
    print("Verifying taskbar item is gone...")
    expect(taskbar_item).not_to_be_visible()

    print("Start Menu and Window interactions passed.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a desktop viewport
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        try:
            test_features(page)
            print("\nALL TESTS PASSED SUCCESSFULLY!")
        except Exception as e:
            print(f"\nTEST FAILED: {e}")
            page.screenshot(path="verification/test_failure.png")
            raise e
        finally:
            browser.close()
