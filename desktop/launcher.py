"""Local, offline ChimpiConstruções launcher. Python 3.9+; no pip packages."""
from __future__ import annotations

import argparse
import ctypes
import http.server
import json
import locale
import os
from pathlib import Path
import signal
import sys
import threading
import urllib.request
import webbrowser

APP_NAME = "ChimpiConstruções"
VERSION = "1.0.0"
DEFAULT_PORT = 18747


def ui_language() -> str:
    if sys.platform == "win32":
        try:
            count, size = ctypes.c_ulong(), ctypes.c_ulong()
            get_languages = ctypes.windll.kernel32.GetUserPreferredUILanguages
            if get_languages(0x8, ctypes.byref(count), None, ctypes.byref(size)):
                buffer = ctypes.create_unicode_buffer(size.value)
                if get_languages(0x8, ctypes.byref(count), buffer, ctypes.byref(size)):
                    return "pt-BR" if buffer.value.lower().startswith("pt") else "en"
        except (AttributeError, OSError, ValueError):
            pass
    try:
        lang = locale.getlocale()[0] or os.environ.get("LANG", "en")
    except (ValueError, TypeError):
        lang = "en"
    return "pt-BR" if lang.lower().startswith("pt") else "en"


def resource_root() -> Path:
    if getattr(sys, "frozen", False):
        base = Path(sys.executable).resolve().parent
        for candidate in (base / "assets", Path(getattr(sys, "_MEIPASS", base)) / "assets"):
            if (candidate / "index.html").is_file():
                return candidate
    base = Path(__file__).resolve().parent
    for candidate in (base / "assets", base.parent / "dist", base.parent / "assets"):
        if (candidate / "index.html").is_file():
            return candidate
    raise FileNotFoundError("Game assets / arquivos do jogo")


def data_directory() -> Path:
    if os.environ.get("CHIMPI_DATA_DIR"):
        result = Path(os.environ["CHIMPI_DATA_DIR"]).expanduser().resolve()
        result.mkdir(parents=True, exist_ok=True)
        return result
    if sys.platform == "win32":
        path = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local"))
    elif sys.platform == "darwin":
        path = Path.home() / "Library" / "Application Support"
    else:
        path = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
    result = path / "SnoopyOS Company" / APP_NAME
    result.mkdir(parents=True, exist_ok=True)
    return result


class GameHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".webmanifest": "application/manifest+json"}

    def __init__(self, *args, assets: Path, **kwargs):
        self.assets = assets.resolve()
        super().__init__(*args, directory=str(self.assets), **kwargs)

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/state":
            try:
                with self.server.state_lock:
                    payload = self.server.data_file.read_bytes() if self.server.data_file.exists() else b"{}"
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
            except OSError:
                self.send_error(500)
            return
        if self.path.split("?", 1)[0] == "/health":
            payload = json.dumps({"app": APP_NAME, "version": VERSION}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        resolved = Path(self.translate_path(self.path)).resolve()
        try:
            resolved.relative_to(self.assets)
        except ValueError:
            self.send_error(403)
            return
        super().do_GET()

    def do_POST(self):
        expected = f"http://127.0.0.1:{self.server.server_port}"
        if self.headers.get("Host") != f"127.0.0.1:{self.server.server_port}" or self.headers.get("Origin") != expected:
            self.send_error(403)
            return
        if self.path != "/api/state" or self.headers.get_content_type() != "application/json":
            self.send_error(400)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 8_000_000:
                self.send_error(413)
                return
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict) or not set(data).issubset({"settings", "avatar", "worlds", "current"}):
                raise ValueError("Invalid state")
            payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
            with self.server.state_lock:
                temporary = self.server.data_file.with_suffix(".tmp")
                temporary.write_bytes(payload)
                temporary.replace(self.server.data_file)
            self.send_response(204)
            self.end_headers()
        except (ValueError, OSError, json.JSONDecodeError):
            self.send_error(400)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Service-Worker-Allowed", "/")
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def log_message(self, format, *args):
        pass


def make_server(assets: Path, port: int = DEFAULT_PORT, data_path: Path | None = None):
    def handler(*args, **kwargs):
        return GameHandler(*args, assets=assets, **kwargs)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    server.data_file = data_path if data_path is not None else data_directory() / "state.json"
    server.state_lock = threading.Lock()
    return server


def run(expected_platform: str | None = None) -> int:
    language = ui_language()
    pt = language == "pt-BR"
    if expected_platform and sys.platform != expected_platform:
        label = {"win32": "Windows", "linux": "Linux", "darwin": "macOS"}[expected_platform]
        print(("Este pacote funciona apenas em " if pt else "This package runs only on ") + label)
        return 2
    parser = argparse.ArgumentParser(description=APP_NAME)
    parser.add_argument("--no-browser", action="store_true", help="Run server without opening a browser")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--lang", choices=["pt-BR", "en"])
    args = parser.parse_args()
    language = args.lang or language
    pt = language == "pt-BR"
    try:
        assets = resource_root()
        server = make_server(assets, args.port)
    except OSError as error:
        if not args.no_browser and args.port:
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{args.port}/health", timeout=1) as response:
                    running = json.load(response)
                if running.get("app") == APP_NAME:
                    webbrowser.open(f"http://127.0.0.1:{args.port}/?lang={language}")
                    return 0
            except (OSError, ValueError):
                pass
        message = ("Não foi possível iniciar o jogo" if pt else "Could not start the game") + f"\n{error}"
        if sys.platform == "win32":
            ctypes.windll.user32.MessageBoxW(0, message, APP_NAME, 0x10)
        else:
            print(message, file=sys.stderr)
        return 1
    url = f"http://127.0.0.1:{server.server_port}/?lang={language}"
    print(f"{APP_NAME} {VERSION}\n{url}")
    print("Feche este terminal para encerrar o jogo" if pt else "Close this terminal to stop the game")
    if not args.no_browser:
        threading.Timer(0.3, lambda: webbrowser.open(url)).start()
    stop = threading.Event()
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    def shutdown(*_):
        stop.set()

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    try:
        if getattr(sys, "frozen", False) and not args.no_browser:
            import tkinter as tk
            window = tk.Tk()
            window.title(APP_NAME)
            window.geometry("420x210")
            window.resizable(False, False)
            window.configure(bg="#f6f5eb")
            try:
                image = tk.PhotoImage(file=str(assets / "icon-192.png"))
                window.iconphoto(True, image)
            except tk.TclError:
                pass
            title = "Seu mundo está aberto" if pt else "Your world is open"
            body = "Feche esta janela para encerrar o jogo" if pt else "Close this window to stop the game"
            tk.Label(window, text=title, font=("Arial", 17, "bold"), bg="#f6f5eb", fg="#254d3c").pack(pady=(28, 12))
            tk.Label(window, text=body, font=("Arial", 10), bg="#f6f5eb", fg="#728465").pack()
            buttons = tk.Frame(window, bg="#f6f5eb")
            buttons.pack(pady=22)
            tk.Button(buttons, text="Voltar ao jogo" if pt else "Return to game", command=lambda: webbrowser.open(url), padx=14, pady=6).pack(side="left", padx=5)
            def close_window():
                stop.set()
                window.destroy()
            tk.Button(buttons, text="Encerrar" if pt else "Quit", command=close_window, padx=14, pady=6).pack(side="left", padx=5)
            window.protocol("WM_DELETE_WINDOW", close_window)
            window.mainloop()
        else:
            while not stop.wait(0.5):
                pass
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
