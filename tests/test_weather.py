"""Browser regression tests for the offline weather teaching module.
Run: python3 tests/test_weather.py (requires Playwright and Chromium).
"""
from pathlib import Path
import json
import os
import shutil
import sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from build import bundle

checks = []
with sync_playwright() as p:
    options = {"headless": True}
    executable = os.environ.get("CHROMIUM_EXECUTABLE") or shutil.which("chromium")
    if executable:
        options["executable_path"] = executable
    browser = p.chromium.launch(**options)
    page = browser.new_page(viewport={"width": 1512, "height": 982})
    errors, requests = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: requests.append(request.url))
    page.set_content(bundle())
    assert page.locator("#scenario-select option").count() == 5
    assert page.evaluate("state.scenario") == "order"
    page.select_option("#scenario-select", "weather")
    assert page.locator("#weather-controls").is_visible()
    assert not page.locator("#node-agentB").is_visible()
    assert not page.locator("#node-toolB").is_visible()
    assert page.locator("#node-weatherApi").is_visible()
    assert page.evaluate("steps.length") == 10
    checks.append("Fourth story; one specialist; provider distinct from MCP server")

    page.fill("#weather-city", "London")
    page.select_option("#weather-units", "fahrenheit")
    page.locator("#weather-form button[type=submit]").click()
    assert page.evaluate("state.playing")
    page.evaluate("pause();goStep(9)")
    answer = page.locator("#explanation .panel-example").inner_text()
    assert "London" in answer and "57.2" in answer and "fictional sample data" in answer
    assert page.evaluate("SCENARIOS.weather.weather.response.live") is False
    assert page.evaluate("SCENARIOS.weather.weather.response.observed_at") is None
    checks.append("City and units propagate to the tool and final fictional answer")

    page.fill("#weather-city", "   ")
    page.locator("#weather-form button[type=submit]").click()
    assert page.locator("#weather-error").is_visible()
    page.fill("#weather-city", "<img src=x onerror=alert(1)>")
    page.locator("#weather-form button[type=submit]").click()
    assert page.locator("#weather-error").is_visible()
    page.fill("#weather-city", "S\u00e3o Paulo, BR")
    page.locator("#weather-city").press("Enter")
    page.evaluate("pause();goStep(5);setTechnical(true)")
    payload = json.loads(page.locator("#explanation pre").text_content())
    assert payload["arguments"]["city"] == "S\u00e3o Paulo, BR"
    checks.append("Empty/HTML input rejected; international city names and Enter supported")

    page.locator("[data-modal=weatherMapping]").first.click()
    assert "does not change or connect the topology" in page.locator("#modal-body").inner_text()
    for name, value in {"broker":"weather-broker", "agent":"city-weather-agent", "server":"weather-mcp", "tool":"get_current_weather", "provider":"POC Weather API"}.items():
        page.locator(f"#weather-map-form [name={name}]").fill(value)
    page.locator("#weather-map-form button[type=submit]").click()
    assert not page.locator("#modal").is_visible()
    assert page.locator("#agentA-label").inner_text() == "city-weather-agent"
    page.evaluate("goStep(5)")
    assert "get_current_weather" in page.locator("#explanation pre").text_content()
    page.locator("#node-agentA").click()
    assert "city-weather-agent" in page.locator("#explanation h2").inner_text()
    checks.append("POC labels update diagram, payloads, and contextual explanations")

    for result, code in [("not_found", "LOCATION_NOT_FOUND"), ("unavailable", "PROVIDER_UNAVAILABLE")]:
        page.locator("[data-modal=weatherMapping]").first.click()
        page.select_option("#weather-map-form [name=result]", result)
        page.locator("#weather-map-form button[type=submit]").click()
        page.evaluate("goStep(6)")
        payload = json.loads(page.locator("#explanation pre").text_content())
        assert payload["code"] == code and payload["observation"] is None
        assert "temperature" not in payload
        page.evaluate("state.speed=25;reset();play()")
        page.wait_for_function("state.finished", timeout=10000)
        assert not page.evaluate("state.playing")
    checks.append("Location/provider errors complete playback without fabricated readings")

    page.locator("[data-modal=weatherMapping]").first.click()
    page.select_option("#weather-map-form [name=result]", "success")
    page.locator("#weather-map-form button[type=submit]").click()
    for story in ["order", "onboarding", "blocked", "weather"]:
        page.select_option("#scenario-select", story)
        for technical in [False, True]:
            page.evaluate("t=>setTechnical(t)", technical)
            for step in range(11):
                page.evaluate("n=>goStep(n)", step)
                assert page.locator("#explanation h2").is_visible()
                assert page.evaluate("document.body.scrollWidth<=innerWidth")
        page.evaluate("state.speed=25;reset();play()")
        page.wait_for_function("state.finished", timeout=10000)
        assert page.locator(".trace-item").count() == 10
        assert not page.evaluate("state.playing")
        page.locator("#play-btn").click()
        assert page.evaluate("state.index") == 1
        page.evaluate("pause()")
    checks.append("All four stories: 88 step/detail states, full playback, and replay")

    page.select_option("#scenario-select", "onboarding")
    assert page.locator("#node-agentB").is_visible()
    assert not page.locator("#node-weatherApi").is_visible()
    assert page.locator("#node-agentA").evaluate("e=>e.style.top") == "51px"
    assert page.locator("#edge-agentA").get_attribute("d").endswith("L617 96")
    assert page.locator("#agentA-label").inner_text() == "People agent"
    page.evaluate("goStep(9)")
    assert "IT-308" in page.locator("#explanation").inner_text()
    assert "awaiting approval" in page.locator("#explanation").inner_text()
    checks.append("Existing Maya scenario and original network geometry restored")

    page.select_option("#scenario-select", "weather")
    page.set_viewport_size({"width": 390, "height": 844})
    page.evaluate("state.speed=1;goStep(6);play()")
    page.wait_for_timeout(600)
    assert page.locator("#diagram-viewport").evaluate("e=>e.scrollLeft") > 0
    page.locator("#diagram-viewport").dispatch_event("pointerdown")
    assert not page.evaluate("state.playing")
    checks.append("Mobile packet-following and touch-to-pause")
    page.emulate_media(reduced_motion="reduce")
    page.evaluate("goStep(6);play()")
    page.wait_for_timeout(50)
    assert page.locator("#trace-weatherApi").evaluate("e=>getComputedStyle(e).animationName") == "none"
    page.evaluate("pause()")
    checks.append("Weather provider animation honors reduced motion")

    for width in [360, 390, 650, 768, 960, 1024, 1280, 1512, 1920]:
        page.set_viewport_size({"width": width, "height": 982})
        for view in ["explore", "essentials", "faq"]:
            page.evaluate("v=>setPage(v)", view)
            assert page.evaluate("document.body.scrollWidth<=innerWidth"), (width,view)
        page.evaluate("setPage('explore');openModal('weatherMapping')")
        assert page.locator("#modal").evaluate("e=>e.scrollWidth<=e.clientWidth")
        page.keyboard.press("Escape")
    checks.append("Responsive layout and mapping dialog at nine widths")
    assert not errors, errors
    assert not requests, requests
    checks.append("Zero JavaScript errors and zero external network requests")
    browser.close()

print(json.dumps({"result":"passed", "checks":checks}, indent=2))
