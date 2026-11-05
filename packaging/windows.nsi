Unicode true
!include "MUI2.nsh"
!include "x64.nsh"
Name "ChimpiConstruções"
Icon "..\dist\icon.ico"
UninstallIcon "..\dist\icon.ico"
OutFile "..\build-output\ChimpiConstrucoes-1.1.0-Windows-Setup.exe"
InstallDir "$PROGRAMFILES64\SnoopyOS Company\ChimpiConstruções"
InstallDirRegKey HKLM "Software\SnoopyOS Company\ChimpiConstrucoes" "InstallDir"
RequestExecutionLevel admin
!define MUI_ABORTWARNING
!define MUI_LANGDLL_REGISTRY_ROOT "HKLM"
!define MUI_LANGDLL_REGISTRY_KEY "Software\SnoopyOS Company\ChimpiConstrucoes"
!define MUI_LANGDLL_REGISTRY_VALUENAME "Installer Language"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "PortugueseBR"
!insertmacro MUI_LANGUAGE "English"
LangString DesktopName ${LANG_PORTUGUESEBR} "Atalho na área de trabalho"
LangString DesktopName ${LANG_ENGLISH} "Desktop shortcut"
LangString Requires64 ${LANG_PORTUGUESEBR} "O ChimpiConstruções requer Windows de 64 bits"
LangString Requires64 ${LANG_ENGLISH} "ChimpiConstruções requires 64-bit Windows"
Function .onInit
  SetRegView 64
  !insertmacro MUI_LANGDLL_DISPLAY
  ${IfNot} ${RunningX64}
    MessageBox MB_ICONSTOP "$(Requires64)"
    Abort
  ${EndIf}
FunctionEnd
Section "ChimpiConstruções" Main
  SectionIn RO
  SetShellVarContext all
  SetOutPath "$INSTDIR"
  File /r "..\build-output\ChimpiConstrucoes\*.*"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateDirectory "$SMPROGRAMS\SnoopyOS Company"
  CreateShortcut "$SMPROGRAMS\SnoopyOS Company\ChimpiConstruções.lnk" "$INSTDIR\ChimpiConstrucoes.exe"
  WriteRegStr HKLM "Software\SnoopyOS Company\ChimpiConstrucoes" "InstallDir" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ChimpiConstrucoes" "DisplayName" "ChimpiConstruções"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ChimpiConstrucoes" "Publisher" "SnoopyOS Company"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ChimpiConstrucoes" "DisplayVersion" "1.1.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ChimpiConstrucoes" "UninstallString" '$"$INSTDIR\Uninstall.exe$"'
SectionEnd
Section /o "$(DesktopName)" Desktop
  SetShellVarContext all
  CreateShortcut "$DESKTOP\ChimpiConstruções.lnk" "$INSTDIR\ChimpiConstrucoes.exe"
SectionEnd
Section "Uninstall"
  SetShellVarContext all
  SetRegView 64
  Delete "$DESKTOP\ChimpiConstruções.lnk"
  Delete "$SMPROGRAMS\SnoopyOS Company\ChimpiConstruções.lnk"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ChimpiConstrucoes"
  DeleteRegKey HKLM "Software\SnoopyOS Company\ChimpiConstrucoes"
  RMDir /r "$INSTDIR"
SectionEnd
