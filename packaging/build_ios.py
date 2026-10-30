from pathlib import Path
import platform
import plistlib
import shutil
import subprocess
import zipfile

root=Path(__file__).resolve().parents[1]
out=root/'build-output'
out.mkdir(exist_ok=True)
for sdk,arch,label in [('iphoneos','arm64','iOS-unsigned'),('iphonesimulator',platform.machine(),'iOS-Simulator')]:
    directory=out/label
    app=directory/('Payload/ChimpiConstrucoes.app' if sdk=='iphoneos' else 'ChimpiConstrucoes.app')
    app.mkdir(parents=True,exist_ok=True)
    sdkpath=subprocess.check_output(['xcrun','--sdk',sdk,'--show-sdk-path'],text=True).strip()
    target=f'{arch}-apple-ios15.0'+('-simulator' if sdk=='iphonesimulator' else '')
    subprocess.run(['xcrun','--sdk',sdk,'swiftc','-swift-version','5','-parse-as-library','-target',target,'-sdk',sdkpath,'-O','-framework','UIKit','-framework','WebKit','-framework','Network','-o',str(app/'ChimpiConstrucoes'),str(root/'native'/'ios'/'ChimpiApp.swift')],check=True)
    shutil.copytree(root/'dist',app/'assets',dirs_exist_ok=True)
    info={'CFBundleIdentifier':'com.snoopyos.chimpiconstrucoes','CFBundleName':'ChimpiConstrucoes','CFBundleDisplayName':'ChimpiConstruções','CFBundleExecutable':'ChimpiConstrucoes','CFBundlePackageType':'APPL','CFBundleVersion':'1','CFBundleShortVersionString':'1.0.0','MinimumOSVersion':'15.0','LSRequiresIPhoneOS':True,'UIDeviceFamily':[1,2],'CFBundleSupportedPlatforms':['iPhoneOS' if sdk=='iphoneos' else 'iPhoneSimulator'],'UISupportedInterfaceOrientations':['UIInterfaceOrientationPortrait','UIInterfaceOrientationLandscapeLeft','UIInterfaceOrientationLandscapeRight'],'UILaunchScreen':{},'UIUserInterfaceStyle':'Light','NSAppTransportSecurity':{'NSAllowsLocalNetworking':True,'NSAllowsArbitraryLoadsInWebContent':True}}
    (app/'Info.plist').write_bytes(plistlib.dumps(info))
    if sdk=='iphonesimulator':subprocess.run(['codesign','--force','--sign','-','--timestamp=none',str(app)],check=True)
    archive=out/('ChimpiConstrucoes-1.0.0-iOS-unsigned.ipa' if sdk=='iphoneos' else f'ChimpiConstrucoes-1.0.0-iOS-Simulator-{arch}.zip')
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
        for file in app.rglob('*'):
            if file.is_file():z.write(file,file.relative_to(directory))
    print(archive)
print('Device IPA needs Apple signing and provisioning before installation')
