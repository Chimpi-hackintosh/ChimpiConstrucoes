import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("launcher", ROOT / "desktop" / "launcher.py")
launcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(launcher)


class LauncherTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.server = launcher.make_server(ROOT / "dist", 0, Path(self.temp.name) / "state.json")
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = f"http://127.0.0.1:{self.server.server_port}"

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.temp.cleanup()

    def test_local_assets_and_health(self):
        with urllib.request.urlopen(self.url + "/app.js") as r:
            self.assertEqual(r.headers.get_content_type(), "text/javascript")
            self.assertIn(b"startWorld", r.read())
        with urllib.request.urlopen(self.url + "/health") as r:
            self.assertEqual(json.load(r)["app"], "ChimpiConstruções")

    def test_native_state_survives_requests(self):
        payload = {"settings": {"language": "pt-BR"}, "worlds": [], "avatar": {"name": "Teste"}}
        request = urllib.request.Request(self.url + "/api/state", data=json.dumps(payload).encode(),
                                         headers={"Content-Type": "application/json", "Origin": self.url})
        with urllib.request.urlopen(request) as r:
            self.assertEqual(r.status, 204)
        with urllib.request.urlopen(self.url + "/api/state") as r:
            self.assertEqual(json.load(r), payload)
        self.assertTrue(self.server.data_file.exists())

    def test_cross_origin_write_is_rejected(self):
        request = urllib.request.Request(self.url + "/api/state", data=b"{}",
                                         headers={"Content-Type": "application/json", "Origin": "https://example.invalid"})
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request)
        self.assertEqual(caught.exception.code, 403)

    def test_no_directory_listing_or_traversal(self):
        for route in ["/vendor/", "/%2e%2e/desktop/launcher.py"]:
            with self.assertRaises(urllib.error.HTTPError):
                urllib.request.urlopen(self.url + route)


if __name__ == "__main__":
    unittest.main()
