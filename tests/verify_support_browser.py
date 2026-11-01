"""Exercise the real support page and notice in an isolated headless browser."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


class BodyState(HTMLParser):
    def handle_starttag(self, tag, attrs):
        if tag == "body":
            self.attrs = dict(attrs)


def main():
    root = Path(sys.argv[1]).resolve()
    chrome = next((shutil.which(name) for name in ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"] if shutil.which(name)), None)
    if not chrome:
        raise SystemExit("No Chrome/Chromium executable available for browser verification")
    source = (root / "support.html").read_text(encoding="utf-8")
    source = source.replace('<head>', '<head><script>Object.defineProperty(navigator,"language",{value:"pt-BR",configurable:true})</script>')
    source = source.replace('src="./support-notice.js"', 'src="' + (root / "support-notice.js").as_uri() + '"')
    probe = """<script>document.addEventListener('DOMContentLoaded',()=>{
      try {
        const api=ChimpiSupport;
        if(document.title!=='Apps e suporte')throw Error('Table language');
        if(document.querySelectorAll('#apps tr').length!==13)throw Error('Table rows');
        if(!document.querySelector('#apps a[href*="/OpenCore-Helper/releases/tag/v3.0.1"]'))throw Error('Official download link');
        api.show(api.notice('OpenCore-Helper','2.0.0',api.POLICY,new Date('2026-11-01T00:00:00Z'),'pt-BR'));
        if(document.getElementById('chimpi-support-title').textContent!=='Sua versão está prestes a não ser suportada')throw Error('Before cutoff');
        if(document.querySelectorAll('#chimpi-support-notice a').length!==2)throw Error('Update and table buttons');
        document.querySelector('#chimpi-support-notice button').click();
        if(document.getElementById('chimpi-support-notice'))throw Error('Dismiss');
        api.show(api.notice('OpenCore-Helper','2.0.0',api.POLICY,new Date('2026-11-04T00:00:00Z'),'pt-BR'));
        if(document.getElementById('chimpi-support-title').textContent!=='Sua versão não recebe mais atualizações de segurança')throw Error('After cutoff');
        const box=document.getElementById('chimpi-support-notice').getBoundingClientRect();
        if(box.width<=0||box.right>innerWidth||box.bottom>innerHeight)throw Error('Notice outside viewport');
        document.body.dataset.supportBrowserTest='passed';
      } catch(error){document.body.dataset.supportBrowserTest='failed';document.body.dataset.supportError=error.message}
    })</script>"""
    source = source.replace("</body>", probe + "</body>")
    with tempfile.TemporaryDirectory(prefix="chimpi-browser-") as temp:
        directory = Path(temp)
        page = directory / "support-test.html"
        page.write_text(source, encoding="utf-8")
        for width, height in [(1100, 900), (390, 844)]:
            command = [chrome, "--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--allow-file-access-from-files",
                       "--user-data-dir=" + str(directory / "profile"), "--window-size=" + f"{width},{height}",
                       "--virtual-time-budget=2000", "--dump-dom", page.as_uri()]
            run = subprocess.run(command, capture_output=True, text=True, encoding="utf-8", timeout=40)
            parsed = BodyState()
            parsed.feed(run.stdout)
            state = getattr(parsed, "attrs", {})
            if run.returncode or state.get("data-support-browser-test") != "passed":
                raise AssertionError(f"Browser check {width}x{height}: {state.get('data-support-error', 'page did not complete')}\n{run.stderr[-1200:]}")
            print(f"PASS {width}x{height}: Portuguese table, 13 apps, official links, both date phases, dismiss and viewport")


if __name__ == "__main__":
    main()
