"""Create a release bundle with three platform-restricted Python editions."""
from pathlib import Path
import shutil
import tempfile
import zipfile
import os

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path(os.environ.get("CHIMPI_RELEASE_DIR", ROOT / "build-output"))
OUTPUT.mkdir(parents=True, exist_ok=True)
NAME = "ChimpiConstrucoes-1.1.0-Multiplataforma"

with tempfile.TemporaryDirectory(prefix="chimpi-release-") as tmp:
    release = Path(tmp) / NAME
    release.mkdir()
    (release / "LEIA-ME.md").write_text("""# ChimpiConstruções 1.1

Jogo 3D de construção de casas com modos Iniciante e Pro, personagem personalizável, pausa, salvamento e energia solar

## Escolha sua plataforma

- **Linux:** abra a pasta Linux-Python e execute `bash Iniciar-Linux.sh`
- **Windows:** abra a pasta Windows-Python e dê dois cliques em Iniciar-Windows.cmd
- **macOS:** abra a pasta macOS-Python e execute `bash Iniciar-macOS.command`
- **iPhone/iPad/Android:** use a versão web e a opção de instalar/adicionar à tela de início

Versão web: https://chimpi-construcoes.luckyemu1.chatgpt.site

As edições Python exigem Python 3.9 ou mais recente e um navegador — não precisam de pip nem internet — cada iniciador recusa outro sistema

Mantenha a janela do iniciador aberta enquanto joga — para encerrar, feche o terminal — o servidor só escuta em 127.0.0.1

Os arquivos de mundos e configurações ficam no diretório de dados do seu usuário — os recursos do jogo não recebem arquivos pessoais — o botão de exportar permite levar o mundo para outro dispositivo

## Aplicativo sem instalar Python

A versão web pode ser instalada como PWA no computador e no celular — esta distribuição não contém EXE, APP, APK nem IPA pré-compilados/assinados

Cada pasta desktop inclui `Compilar.py` para gerar um aplicativo com runtime Python incluído, executando o build no sistema de destino — exige PyInstaller instalado somente na máquina que compila — no Windows há também o script de instalador NSIS em packaging/windows.nsi

O motor é JavaScript com WebGL e alternativa 3D por Canvas — Python inicia o servidor local e salva os mundos no computador

## Controles

B ou Construir abre a edição: clique esquerdo constrói, direito remove, R gira e E abre materiais — P ou Play permite explorar: WASD anda, Espaço pula, Shift corre, F alterna câmera e G/E abre portas próximas — Esc pausa — no Play os cliques preservam a casa

No celular use o controle virtual, arraste a cena para olhar e use martelo, picareta, porta e seta para agir — os botões laterais controlam rotação e camadas

As regras de construção e do circuito são simplificações para o jogo, inspiradas nos vídeos enviados
""", encoding="utf-8")
    for title, target, starter in [("Linux", "linux", "Iniciar-Linux.sh"),
                                    ("Windows", "win32", "Iniciar-Windows.cmd"),
                                    ("macOS", "darwin", "Iniciar-macOS.command")]:
        folder = release / f"{title}-Python"
        (folder / "app").mkdir(parents=True)
        shutil.copytree(ROOT / "dist", folder / "assets")
        shutil.copy2(ROOT / "desktop" / "launcher.py", folder / "app" / "launcher.py")
        (folder / "app" / "__init__.py").write_text("", encoding="utf-8")
        entry = f"ChimpiConstrucoes-{title}.py"
        (folder / entry).write_text(f'from app.launcher import run\n\nif __name__ == "__main__":\n    raise SystemExit(run({target!r}))\n',encoding="utf-8")
        if title == "Windows":
            content = f'@echo off\r\ncd /d "%~dp0"\r\nwhere py >nul 2>nul\r\nif errorlevel 1 (\r\n  python "{entry}"\r\n) else (\r\n  py -3 "{entry}"\r\n)\r\nif errorlevel 1 pause\r\n'
        else:
            content = f'#!/bin/sh\nCHIMPI_PACKAGE_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"\nexec python3 "$CHIMPI_PACKAGE_DIR/{entry}" "$@"\n'
        (folder / starter).write_bytes(content.encode("utf-8"))
        (folder / starter).chmod(0o755)
        compile_script = '''from pathlib import Path
import shutil, subprocess, sys
root=Path(__file__).resolve().parent
if sys.platform != TARGET:
    raise SystemExit("Execute este build no sistema de destino / Run this build on the target OS")
if TARGET=='win32' and sys.maxsize < 2**32:
    raise SystemExit("Use Python x64 para o build Windows / Use x64 Python for the Windows build")
cmd=[sys.executable,'-m','PyInstaller','--clean','--noconfirm','--onedir','--windowed','--name','ChimpiConstrucoes','--distpath',str(root/'build-output'),'--workpath',str(root/'build-temp'),'--specpath',str(root/'build-temp'),str(root/ENTRY)]
subprocess.run(cmd,cwd=root,check=True)
stage=root/'build-output'/'ChimpiConstrucoes'
if sys.platform=='darwin':stage=root/'build-output'/'ChimpiConstrucoes.app'/'Contents'/'MacOS'
shutil.copytree(root/'assets',stage/'assets',dirs_exist_ok=True)
if any(stage.rglob('*.py')) or any(stage.rglob('*.pyw')):raise SystemExit('Unexpected loose Python sources')
print(stage)
'''
        (folder / "Compilar.py").write_text(f"TARGET={target!r}\nENTRY={entry!r}\n"+compile_script,encoding="utf-8")
        (folder / "LEIA-ME.txt").write_text(f"ChimpiConstruções — {title}\n\nRequer Python 3.9+ e navegador / Requires Python 3.9+ and a browser\n\nIniciar / Start: {starter}\n\nCompilar / Build: python -m pip install 'pyinstaller>=6,<7'\npython Compilar.py\n\nO build deve ser executado em {title} / Run the build on {title}\n\nConsulte LEIA-ME.md na pasta principal para os controles e detalhes\nSee the main LEIA-ME.md for controls and distribution details\n",encoding="utf-8")
        if title=="Windows":
            (folder/"packaging").mkdir()
            shutil.copy2(ROOT/"packaging"/"windows.nsi",folder/"packaging"/"windows.nsi")
    target=OUTPUT/f"{NAME}.zip"
    with zipfile.ZipFile(target,"w",zipfile.ZIP_DEFLATED,compresslevel=8) as archive:
        for file in sorted(release.rglob("*")):
            if file.is_file():archive.write(file,file.relative_to(release.parent))
print(target)
