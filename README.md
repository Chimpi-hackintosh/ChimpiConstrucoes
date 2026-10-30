# ChimpiConstruções

Simulador 3D de construção de casas de **Chimpi-hackintosh / SnoopyOS Company**

- **Iniciante:** tutorial com oito etapas, da fundação ao sistema solar
- **Pro:** construção livre sem tutorial, com materiais ilimitados
- Personagem personalizável, três câmeras, construção por blocos, pausa e salvamento
- Painéis solares, bateria, bicicleta geradora, consumo, rede elétrica e disjuntor
- Português e inglês com idioma automático e opção manual

## Downloads e builds

As compilações ficam na aba **Actions**, no resultado **Chimpi-hackintosh · Compilar desktop** — abra a execução concluída e baixe o artefato do seu sistema

- **Windows x64:** EXE com runtime incluído, ZIP e instalador NSIS
- **Linux x64:** binário com runtime incluído, distribuído em TAR.GZ
- **macOS:** bundle APP em ZIP, na arquitetura indicada pelo artefato
- **Python portátil:** `python desktop/launcher.py`, sem dependências de pip
- **Web/PWA:** [jogar pelo navegador](https://chimpi-construcoes.luckyemu1.chatgpt.site)

O jogo usa o navegador do sistema para renderizar a interface local — nos aplicativos desktop compilados, uma janela permite voltar ao jogo ou encerrá-lo — não é necessário instalar Python para executar o pacote compilado

Extraia o pacote completo antes de executar e mantenha `assets/` e as bibliotecas ao lado do aplicativo — configurações e mundos ficam fora da pasta de instalação e podem ser exportados pelo menu de pausa

Os binários são distribuídos sem assinatura comercial — builds iOS para aparelho precisam de assinatura Apple antes de instalar — as etapas de construção e de eletricidade são simplificações para o jogo

## Compilar no próprio sistema

```sh
python -m pip install -r requirements-build.txt
python packaging/build_desktop.py
python packaging/smoke_desktop.py
python packaging/package_desktop.py
```

No Windows x64, instale NSIS e use `python packaging/build_desktop.py --installer`

## Verificações

```sh
node --test tests/*.test.mjs
python -m unittest discover -s tests -p 'test_*.py'
```

Os ícones Lucide e a respectiva licença estão incluídos — os vídeos enviados como referência não são redistribuídos
