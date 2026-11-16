# Das Ruas às Telas

Landing page da reportagem multimídia **“Das Ruas às Telas — A migração dos crimes do mundo físico para o meio digital”**, de Amália Miura e Marina Lima (Laboratório para Reportagem Convergente).

Página estática: HTML + CSS + JavaScript puro. Sem build, sem dependência instalada — as únicas requisições externas são as fontes do Google Fonts.

---

## Como abrir

```bash
cd das-ruas-as-telas
python3 -m http.server 8177
# abra http://localhost:8177
```

Abrir o `index.html` direto no navegador também funciona.

## Estrutura

```
das-ruas-as-telas/
├── index.html
├── assets/
│   ├── css/style.css           → todo o visual (paleta, tipografia, blocos, responsivo)
│   ├── js/main.js              → índice ativo, divisores de pixel, progresso de leitura
│   ├── img/
│   │   ├── capa.jpg            → foto de capa
│   │   ├── materia-01.jpg      → foto de abertura
│   │   ├── materia-02.jpg      → foto do close nas mãos
│   │   ├── cards/              → 7 cards da série (WebP)
│   │   └── favicon.svg
│   ├── infograficos/           → os 4 infográficos interativos (HTML autônomo)
│   └── video/                  → entrevista.mp4 + poster.jpg
├── shots/                      → capturas de tela para revisão
└── README.md
```

> Os arquivos originais do Drive (1,3 GB, incluindo a entrevista em vídeo de 11 min e os áudios brutos) ficam em `../das-ruas-as-telas-fonte-original/`, fora da pasta publicada.

---

## O que já está funcionando

| Recurso | Estado |
|---|---|
| Capa com foto, título grande, subtítulo e assinatura | pronto |
| Índice horizontal fixo, com link ativo conforme o scroll | pronto |
| Divisores de pixel animados entre os blocos | pronto |
| Barra de progresso de leitura no topo | pronto |
| Card “Versão em áudio” (primeiro elemento da reportagem) | estrutura pronta, áudio pendente |
| Blocos: Das ruas às telas · Golpes virtuais · Cyberbullying · Proteção de dados | estrutura pronta, **textos pendentes** |
| Infográfico do gráfico RS (iframe interativo) | pronto — FIG. 02 |
| Infográfico “crimes digitais mais comuns” (iframe) | pronto — FIG. 04 |
| Série de 7 cards (galeria horizontal) | pronto — FIG. 05 |
| Linha do tempo (iframe) | pronto — FIG. 07 |
| Guia de orientação à vítima (iframe) | pronto — FIG. 08 |
| Fotos da matéria | prontas — FIG. 01 e FIG. 03 |
| Vídeo de entrevista (MP4 540p, 4,3 MB) | pronto — FIG. 06, crédito a confirmar |
| Bloco de podcast no fim | espaço reservado |
| Créditos e “voltar ao topo” | pronto |
| Responsivo (desktop, tablet, celular) | pronto |

## Pendências

1. **Textos** — os parágrafos atuais são de exemplo, marcados no HTML com `<!-- PLACEHOLDER -->`.
2. **Versão em áudio** — ao receber o arquivo, trocar o card por um player real.
3. **Podcast** — o bloco `.podcast-slot` vira o player do episódio.
4. **Legendas e créditos** de fotos, vídeo e cards.
5. **Glossário** — o arquivo do Drive veio com conteúdo de outro tema (empréstimo consignado, portabilidade, amortização). Foi deixado de fora até a correção.
6. **Áudios das entrevistas** (Chiru, 18 min; delegado Ercílio, 41 min) estão baixados e prontos, mas ainda não têm lugar definido na página.

---

## Como trocar o conteúdo

### Texto de um bloco

No `index.html`, cada bloco é uma `<section class="block" id="...">` com:

```html
<header class="block-head">
  <p class="eyebrow"><span class="num">01</span> Das ruas às telas</p>
  <h2 class="block-title">Das ruas<br>às telas</h2>
  <p class="block-lead">Linha de apoio do bloco.</p>
</header>

<div class="block-body">
  <p class="dropcap"><span class="cap">P</span>rimeiro parágrafo…</p>
  <p>Segundo parágrafo…</p>
</div>
```

- **Palavras em vermelho:** `<span class="hl">trecho</span>`
- **Citação destacada:**

```html
<blockquote class="pull">
  <p>“Frase do entrevistado.”</p>
  <cite>Nome — função</cite>
</blockquote>
```

- Para acrescentar parágrafos, basta repetir `<p>` dentro de `.block-body`.
- Se o texto não começar com capitular, use `<div class="block-body">` sem a classe `dropcap`.

### Imagem, infográfico ou vídeo

Substitua o miolo do `<figure>`:

```html
<figure class="figure">
  <img src="assets/img/grafico-01.png" alt="Descrição objetiva do gráfico">
  <figcaption><b>FIG. 02</b> — Título e fonte do infográfico.</figcaption>
</figure>
```

Vídeo:

```html
<figure class="figure">
  <video controls playsinline poster="assets/img/poster.jpg">
    <source src="assets/video/entrevista.mp4" type="video/mp4">
  </video>
  <figcaption><b>FIG. 04</b> — Título e crédito do vídeo.</figcaption>
</figure>
```

Vídeo vertical (9:16) fica melhor com a figura limitada: acrescente `style="max-width:420px"` na `<figure>`.

### Áudio da reportagem

Quando o arquivo chegar, troque o bloco `#audioCard` por:

```html
<div class="audio-card">
  <div class="audio-head">
    <span class="audio-kicker">Versão em áudio</span>
    <span class="audio-status">8 min</span>
  </div>
  <audio controls preload="metadata" src="assets/audio/reportagem.mp3" style="width:100%"></audio>
</div>
```

### Podcast

No bloco `#podcast`, troque a `<div class="podcast-slot">` por um `<iframe>` do Spotify/Anchor ou por um `<audio controls>` — ambos já ficam com a largura do card.

---

## Identidade visual

| Token | Valor | Uso |
|---|---|---|
| `--vermelho` | `#9a0d1c` | títulos de bloco, grifos, detalhes |
| `--cinza` | `#b4b4b4` | sombras, filetes, numeração |
| `--preto` | `#000000` | texto corrido |
| `--branco` | `#ffffff` | texto sobre imagem (capa) |

- **Poppins** — títulos em caixa alta, subtítulos, interface.
- **Montserrat** — corpo do texto (18px, entrelinha 1.75, coluna de 700px).
- Texto corrido limitado a ~70 caracteres por linha para leitura confortável.

## Aviso de prévia

O selo “Prévia de layout · textos de exemplo” no canto inferior esquerdo existe para deixar claro que o conteúdo ainda é provisório. Para removê-lo de vez, apague a `<div class="preview-chip">` do `index.html` (ou rode `document.body.dataset.preview = 'off'`).

## Publicação

Qualquer hospedagem estática serve (GitHub Pages, Netlify, Vercel, Hostinger). Basta subir a pasta inteira. Se for publicar em subpasta, os caminhos relativos já funcionam como estão.
