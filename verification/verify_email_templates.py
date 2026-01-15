from playwright.sync_api import Page, expect, sync_playwright

def verify_email_template_preview(page: Page):
    # 1. Arrange
    page.goto("http://localhost:3000")

    # 2. Act: Open Sidebar
    page.locator("button.btn-light").first.click(force=True)

    # Wait for sidebar
    sidebar = page.locator(".offcanvas")
    expect(sidebar).to_be_visible()

    # 3. Act: Open Email Templates
    page.get_by_text("Modèles d'emails").click()

    # 4. Assert: Modal is open
    modal = page.locator(".modal-content")
    expect(modal).to_be_visible()

    # 5. Assert: Preview card is visible
    # We want the card in the active tab.
    # React-Bootstrap tabs usually have .tab-pane.active
    preview_card = modal.locator(".tab-pane.active .card").filter(has_text="Aperçu")
    expect(preview_card).to_be_visible()

    # Check default subject preview (Candidate)
    expect(preview_card).to_contain_text("Objet : Confirmation de votre entretien")

    # Check body preview contains replaced example value
    expect(preview_card).to_contain_text("Bonjour Jean Dupont,")

    # 6. Interact: Hover over {{name}} badge to see tooltip
    # Ensure we target the badge in the active tab
    name_badge = modal.locator(".tab-pane.active .badge").filter(has_text="{{name}}")
    name_badge.hover()

    # Wait for tooltip
    tooltip = page.locator(".tooltip")
    expect(tooltip).to_be_visible()
    expect(tooltip).to_contain_text("Ex: Jean Dupont")

    # 7. Screenshot
    page.screenshot(path="verification/email_template_preview.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_email_template_preview(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/email_template_preview_failed.png")
            raise e
        finally:
            browser.close()
