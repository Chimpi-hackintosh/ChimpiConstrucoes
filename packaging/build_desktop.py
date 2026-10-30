"""Run on the target operating system. Requires PyInstaller, not a cross compiler."""
import os
import argparse
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--installer", action="store_true")
args = parser.parse_args()
out = root / "build-output"
staging = out / "ChimpiConstrucoes"
command = [sys.executable, "-m", "PyInstaller", "--clean", "--noconfirm", "--onedir",
           "--windowed", "--name", "ChimpiConstrucoes", "--distpath", str(out),
           "--workpath", str(root / "build-temp"), "--specpath", str(root / "build-temp"),
           str(root / "desktop" / "launcher.py")]
if sys.platform == "win32":
    if sys.maxsize < 2**32:
        raise SystemExit("Windows build requires x64 Python")
    command[3:3] = ["--icon", str(root / "dist" / "icon.ico")]
elif sys.platform == "darwin":
    command[3:3] = ["--icon", str(root / "dist" / "icon.icns"), "--osx-bundle-identifier", "com.snoopyos.chimpiconstrucoes"]
subprocess.run(command, cwd=root, check=True)
if sys.platform == "darwin":
    staging = out / "ChimpiConstrucoes.app" / "Contents" / "MacOS"
if not staging.is_dir():
    raise SystemExit(f"Missing PyInstaller output: {staging}")
shutil.copytree(root / "dist", staging / "assets", dirs_exist_ok=True)
shutil.copy2(root / "README.md", staging / "README.md")
if (root / "LICENSE").exists():
    shutil.copy2(root / "LICENSE", staging / "LICENSE.txt")
if any(staging.rglob("*.py")) or any(staging.rglob("*.pyw")):
    raise SystemExit("Unexpected Python source file in release staging")
if sys.platform == "darwin":
    subprocess.run(["codesign", "--force", "--deep", "--sign", "-", "--timestamp=none", str(out / "ChimpiConstrucoes.app")], check=True)
    subprocess.run(["codesign", "--verify", "--deep", "--verbose", str(out / "ChimpiConstrucoes.app")], check=True)
print(f"Staging ready: {staging}")
if args.installer:
    if sys.platform != "win32":
        raise SystemExit("NSIS installer requires the Windows build")
    makensis = shutil.which("makensis") or str(Path(os.environ.get("ProgramFiles(x86)", "C:/Program Files (x86)")) / "NSIS" / "makensis.exe")
    subprocess.run([makensis, str(root / "packaging" / "windows.nsi")], cwd=root, check=True)
print("Windows: run makensis packaging/windows.nsi" if sys.platform == "win32" else "Build complete; sign on the target OS before store distribution")
