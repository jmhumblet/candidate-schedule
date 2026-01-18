from playwright.sync_api import Page, expect, sync_playwright
import time

def test_layout(page: Page):
    # 1. Arrange
    print("Navigating...")
    page.goto("http://localhost:3000/candidate-schedule")

    # 2. Act
    print("Filling form...")
    page.get_by_label("Poste").fill("Développeur")
    page.locator("#candidatesInput").fill("Alice\nBob")

    # Click Generate
    print("Clicking Generate...")
    page.get_by_role("button", name="Générer").click()

    # 3. Assert
    print("Waiting for results...")
    expect(page.get_by_text("Horaire du")).to_be_visible()

    # 4. Screenshot Top
    print("Taking top screenshot...")
    page.screenshot(path="verification/layout_top.png")

    # 5. Scroll to reveal Timeline
    print("Scrolling...")
    # The scrollable container in App.tsx has class "overflow-auto"
    # It's the first one?
    page.locator(".overflow-auto").last.evaluate("element => element.scrollTop = element.scrollHeight")

    # Wait for scroll/render
    time.sleep(1)

    # Verify alignment of "Chronologie des candidats"
    # It should look aligned with the content above (ScheduleTable).
    # Since I removed margin, it should align with the container padding.

    print("Taking bottom screenshot...")
    page.screenshot(path="verification/layout_bottom.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Set viewport to something reasonable
        page.set_viewport_size({"width": 1280, "height": 800})
        try:
            test_layout(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
