"""Run the frozen executable without a Python installation or graphical display."""
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import tempfile
import urllib.request

root = Path(__file__).resolve().parents[1]
binary = root / 'build-output' / 'ChimpiConstrucoes' / ('ChimpiConstrucoes.exe' if sys.platform=='win32' else 'ChimpiConstrucoes')
if sys.platform=='darwin':binary=root/'build-output'/'ChimpiConstrucoes.app'/'Contents'/'MacOS'/'ChimpiConstrucoes'
temporary=tempfile.TemporaryDirectory(prefix='chimpi-smoke-')
process=subprocess.Popen([str(binary),'--no-browser','--port','18749','--lang','en'],cwd=root.parent,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,env={**os.environ,'CHIMPI_DATA_DIR':temporary.name})
try:
    for attempt in range(60):
        if process.poll() is not None:raise RuntimeError(f'Executable exited: {process.stderr.read().decode(errors="replace")}')
        try:
            with urllib.request.urlopen('http://127.0.0.1:18749/health',timeout=1) as response:
                assert json.load(response)['app']=='ChimpiConstruções'
            break
        except OSError:time.sleep(.5)
    else:raise RuntimeError('Frozen executable did not start')
    with urllib.request.urlopen('http://127.0.0.1:18749/engine.js') as response:assert b'SoftwareRenderer' in response.read()
    data={'settings':{'language':'en'},'worlds':[],'avatar':{'name':'Build test'},'current':None}
    req=urllib.request.Request('http://127.0.0.1:18749/api/state',data=json.dumps(data).encode(),headers={'Content-Type':'application/json','Origin':'http://127.0.0.1:18749'})
    with urllib.request.urlopen(req) as response:assert response.status==204
    with urllib.request.urlopen('http://127.0.0.1:18749/api/state') as response:assert json.load(response)==data
    print('Frozen executable, local assets and persistence verified')
finally:
    process.terminate()
    try:process.wait(timeout=5)
    except subprocess.TimeoutExpired:process.kill();process.wait()
    temporary.cleanup()
