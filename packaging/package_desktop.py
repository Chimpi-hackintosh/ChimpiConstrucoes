import platform
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import zipfile

root=Path(__file__).resolve().parents[1]
out=root/'build-output'
if sys.platform=='darwin':
    app=out/'ChimpiConstrucoes.app'
    archive=out/f'ChimpiConstrucoes-1.1.0-macOS-{platform.machine()}.zip'
    subprocess.run(['ditto','-c','-k','--sequesterRsrc','--keepParent',str(app),str(archive)],check=True)
elif sys.platform=='win32':
    shutil.make_archive(str(out/'ChimpiConstrucoes-1.1.0-Windows-x64'),'zip',out,'ChimpiConstrucoes')
else:
    archive=out/'ChimpiConstrucoes-1.1.0-Linux-x64.tar.gz'
    with tarfile.open(archive,'w:gz') as tar:tar.add(out/'ChimpiConstrucoes',arcname='ChimpiConstrucoes')
print('Release archives ready')
