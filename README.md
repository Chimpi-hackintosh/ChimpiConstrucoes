# ChimpiConstruções 1.1

Simulador 3D de construção de casas de **Chimpi-hackintosh / SnoopyOS Company**

- **Iniciante:** tutorial com oito etapas, da fundação ao sistema solar
- **Pro:** construção livre sem tutorial, com materiais ilimitados
- **Construir:** coloque e remova blocos, decore a casa e acompanhe o tutorial
- **Play · Explorar:** entre na casa em primeira ou terceira pessoa, abra portas, caminhe e pule
- Alterne entre Construir e Play no mesmo mundo, preservando a casa e sua posição
- Personagem personalizável, pausa e salvamento automático
- Painéis solares, bateria, bicicleta geradora, consumo, rede elétrica e disjuntor
- Português e inglês com idioma automático e opção manual

## Downloads e builds

As compilações ficam na aba **Actions**, nos resultados **Chimpi-hackintosh · Compilar desktop** e **Chimpi-hackintosh · Compilar celular** — abra a execução concluída e baixe o artefato do seu sistema

- **Windows x64:** EXE com runtime incluído, ZIP e instalador NSIS
- **Linux x64:** binário com runtime incluído, distribuído em TAR.GZ
- **macOS:** bundle APP em ZIP, na arquitetura indicada pelo artefato
- **Android:** APK de teste, assinado com chave de desenvolvimento
- **iOS:** IPA sem assinatura para assinatura posterior, e APP de simulador
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

## Construir e Play

Os modos Iniciante e Pro definem o tutorial; Construir e Play definem o que você faz no mundo

- **B / Construir:** câmera da obra, clique para colocar, clique direito para remover, E abre materiais, R gira blocos e Ctrl+Z desfaz
- **P / Play · Explorar:** WASD ou setas para andar, arraste para olhar, G ou E para abrir/fechar portas próximas, Espaço pula e Shift corre
- **F no Play:** alterna primeira e terceira pessoa; a câmera acompanha o personagem e evita atravessar paredes
- **Celular:** toque no modo no topo; use o controle esquerdo para andar, arraste a cena para olhar e use os botões de porta e pulo
- **Pausa:** Esc ou botão de pausa; retome no mesmo modo ou troque para Construir/Play pelo menu

A casa de exemplo já abre no Play, do lado de fora da entrada — aproxime-se da porta e abra para entrar — os degraus de um bloco são automáticos — no Play os cliques preservam os blocos da casa
