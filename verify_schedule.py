from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Wait for title
        print("Waiting for load...")
        expect(page.get_by_text("Entretiens")).to_be_visible()

        # Click Generate button
        print("Clicking Generate...")
        page.get_by_role("button", name="Générer").click()

        # Wait for table
        print("Waiting for table...")
        expect(page.get_by_text("Horaire du")).to_be_visible()

        # Take screenshot of the table specifically
        screenshot_path = "/home/jules/verification/schedule_table_element.png"
        print(f"Taking screenshot to {screenshot_path}")
        # Need to scroll to it or just target it
        page.locator("#schedule-content").scroll_into_view_if_needed()
        page.locator("#schedule-content").screenshot(path=screenshot_path)

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="/home/jules/verification/error.png")
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
