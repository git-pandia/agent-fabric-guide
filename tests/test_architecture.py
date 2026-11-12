"""Browser regression tests for the scenario-free architecture tour.
Run: python3 tests/test_architecture.py (requires Playwright and Chromium).
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
html = bundle()
with sync_playwright() as p:
    options = {"headless": True}
    executable = os.environ.get("CHROMIUM_EXECUTABLE") or shutil.which("chromium")
    if executable:
        options["executable_path"] = executable
    browser = p.chromium.launch(**options)
    page = browser.new_page(viewport={"width": 1440, "height": 1050})
    errors, requests = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: requests.append(request.url))
    page.set_content(html)
    assert page.locator("#scenario-select option").count() == 5
    assert page.locator("#scenario-select option").first.get_attribute("value") == "architecture"
    assert page.evaluate("state.scenario") == "order"
    page.select_option("#scenario-select", "architecture")
    assert page.evaluate("steps.length") == 12
    assert page.locator("#architecture-map").is_visible()
    assert not page.locator("#diagram-viewport").is_visible()
    assert not page.locator("#weather-controls").is_visible()
    assert not page.locator(".request-banner").is_visible()
    assert "Tour outline" in page.locator("#tab-trace").inner_text()
    assert "Play architecture" in page.locator("#play-btn").inner_text()
    checks.append("Fifth option added; original landing story preserved; business UI hidden in architecture mode")

    for technical in [False, True]:
        page.evaluate("v=>setTechnical(v)", technical)
        for step in range(13):
            page.evaluate("n=>goStep(n)", step)
            assert page.locator("#explanation h2").is_visible()
            visible = page.locator("#architecture-map").inner_text() + page.locator("#explanation").inner_text()
            assert all(text not in visible for text in ["Maya", "Bengaluru", "IT-308", "CS-204", "Order 1042"])
            if step:
                assert page.locator(".arch-node.is-active").count() > 0
                assert page.locator("#explanation .source-link").count() >= 1
                assert page.locator(".arch-checks").count() == int(technical)
                assert page.locator("#timeline-range").get_attribute("max") == "12"
    checks.append("All 26 chapter/detail states have explanations, sources, highlights, and no business payloads")

    page.locator("[data-arch-node=instances]").click()
    assert page.evaluate("state.index") == 4
    assert "one instance for each configured connection and one per broker" in page.locator("#explanation").inner_text()
    assert "not created for each user question" in page.locator("#explanation").inner_text()
    page.locator("[data-arch-node=proxy]").click()
    assert page.evaluate("state.index") == 7
    assert "single-route proxy" in page.locator("#explanation").inner_text()
    page.locator("#tab-trace").click()
    assert page.locator(".arch-outline button").count() == 12
    page.locator(".arch-outline [data-arch-step='9']").click()
    assert page.evaluate("state.index") == 9
    assert page.locator("#arch-edge-directTool").evaluate("e=>e.classList.contains('is-active')")
    checks.append("Clickable instances, Model Proxy, and outline navigation; optional direct MCP path")

    page.evaluate("state.speed=30;reset();play()")
    page.wait_for_function("state.finished", timeout=12000)
    assert not page.evaluate("state.playing")
    assert "Replay tour" in page.locator("#play-btn").inner_text()
    page.locator("#play-btn").click()
    assert page.evaluate("state.index") == 1
    page.locator("#play-btn").click()
    assert not page.evaluate("state.playing")
    page.locator("#next-btn").click()
    assert page.evaluate("state.index") == 2
    page.locator("#prev-btn").click()
    assert page.evaluate("state.index") == 1
    page.locator("#reset-btn").click()
    assert page.evaluate("state.index") == 0
    page.evaluate("document.activeElement.blur()")
    page.keyboard.press("ArrowRight")
    assert page.evaluate("state.index") == 1
    page.keyboard.press("r")
    assert page.evaluate("state.index") == 0
    page.evaluate("goStep(7);state.speed=1;play()")
    page.wait_for_timeout(150)
    assert page.locator("#architecture-packet").is_visible()
    page.evaluate("pause()")
    checks.append("Full tour, replay, play/pause, previous/next, restart, keyboard, and moving packet")

    for story in ["weather", "order", "onboarding", "blocked", "weather"]:
        page.select_option("#scenario-select", story)
        assert not page.locator("#architecture-map").is_visible()
        assert page.locator("#diagram-viewport").is_visible()
        assert page.evaluate("steps.length") == 10
        assert "Request log" in page.locator("#tab-trace").inner_text()
        for step in range(11):
            page.evaluate("n=>goStep(n)", step)
            assert page.locator("#explanation h2").is_visible()
        if story == "onboarding":
            page.evaluate("goStep(9)")
            assert "IT-308" in page.locator("#explanation").inner_text()
        if story == "weather":
            assert page.locator("#weather-controls").is_visible()
            assert not page.locator("#node-agentB").is_visible()
        page.select_option("#scenario-select", "architecture")
        assert page.locator("#architecture-map").is_visible()
    checks.append("Architecture-to-story round trips preserve all original stories and their diagrams")

    page.evaluate("openModal('intro')")
    assert "Architecture essentials" in page.locator("#modal-title").inner_text()
    assert "late delivery" not in page.locator("#modal-body").inner_text()
    page.keyboard.press("Escape")
    page.evaluate("openModal('sources')")
    assert "Model proxies and LLM connections" in page.locator("#modal-body").inner_text()
    page.keyboard.press("Escape")
    page.evaluate("openModal('help')")
    assert "Tour outline" in page.locator("#modal-body").inner_text()
    page.keyboard.press("Escape")
    checks.append("Intro/help dialogs match architecture mode; new official sources are available")

    for width in [360, 390, 650, 768, 960, 1024, 1280, 1440, 1920]:
        page.set_viewport_size({"width":width,"height":982})
        page.evaluate("goStep(7)")
        page.wait_for_timeout(30)
        assert page.evaluate("document.body.scrollWidth<=innerWidth"), width
        assert page.locator("#architecture-map").is_visible()
    page.set_viewport_size({"width":390,"height":844})
    page.evaluate("goStep(7);play()")
    page.wait_for_timeout(400)
    assert page.locator("#architecture-scroll").evaluate("e=>e.scrollLeft") > 0
    page.locator("#architecture-scroll").dispatch_event("pointerdown")
    assert not page.evaluate("state.playing")
    page.emulate_media(reduced_motion="reduce")
    page.evaluate("goStep(7);play()")
    page.wait_for_timeout(60)
    first = page.locator("#architecture-packet").get_attribute("transform")
    page.wait_for_timeout(100)
    assert first == page.locator("#architecture-packet").get_attribute("transform")
    page.evaluate("pause()")
    checks.append("Nine responsive widths, mobile packet following, touch pause, and reduced-motion support")

    # Exercise URL-parameter branches without requiring browser network access.
    # Only this test document substitutes location.search; production code is unchanged.
    routepage = browser.new_page()
    routepage.on("pageerror", lambda error: errors.append(str(error)))
    for query, expected in [("?story=architecture", "architecture"), ("?story=weather&city=London&units=fahrenheit", "weather")]:
        test_html = html.replace("new URLSearchParams(location.search)", "new URLSearchParams(" + json.dumps(query) + ")")
        routepage.set_content(test_html)
        assert routepage.evaluate("state.scenario") == expected
        if expected == "weather":
            assert routepage.locator("#weather-city").input_value() == "London"
            assert routepage.locator("#weather-units").input_value() == "fahrenheit"
        routepage.close()
        routepage = browser.new_page()
        routepage.on("pageerror", lambda error: errors.append(str(error)))
    checks.append("Architecture and weather URL-parameter branches tested in local documents")
    assert not errors, errors
    assert not requests, requests
    checks.append("Zero JavaScript errors and no data requests from the guide")
    browser.close()
print(json.dumps({"result":"passed","checks":checks},indent=2))
