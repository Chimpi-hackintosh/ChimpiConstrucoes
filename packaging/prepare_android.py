from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
app=root/'native'/'android'/'app'/'src'/'main'
shutil.copytree(root/'dist',app/'assets',dirs_exist_ok=True)
icons=app/'res'/'mipmap-xxxhdpi'
icons.mkdir(parents=True,exist_ok=True)
shutil.copy2(root/'dist'/'icon-512.png',icons/'ic_launcher.png')
print('Android assets ready')
