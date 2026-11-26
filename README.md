# Alan Fraga — Security Portfolio

Portfólio pessoal de cibersegurança defensiva, operações SOC, análise de logs e automação.

Site estático (HTML, CSS e JavaScript puro), sem build e sem dependências de runtime.

## Recursos

- **Laboratório de triagem de logs**: analisa logs colados pelo usuário no próprio navegador (brute force SSH, injeção web, varredura de caminhos, sudo, firewall e webshell).
- **Console SOC simulado** no hero, com feed de eventos e métricas em tempo real.
- **Command palette** (`Ctrl/Cmd + K` ou `/`) para navegar, abrir estudos de caso e copiar o e-mail.
- **Estudos de caso** em modais nativos, acessíveis por teclado.
- **Filtro de ferramentas** por categoria.
- **Formulário de contato** via `mailto:`, com validação e fallback de cópia de e-mail.
- Tema escuro, layout responsivo, animações com respeito a `prefers-reduced-motion`, navegação por teclado e foco visível.
- SEO: metadados Open Graph/Twitter, JSON-LD (`Person`), sitemap, robots e manifest.

## Estrutura

```
.
├── index.html          # página principal
├── styles.css          # design system e responsividade
├── script.js           # interações, palette e analisador de logs
├── 404.html            # página de erro do GitHub Pages
├── assets/             # imagens, logo, favicon e capa social
├── site.webmanifest
├── robots.txt
└── sitemap.xml
```

> A pasta `portfolio/` é uma versão antiga mantida apenas como referência histórica. O site publicado é o da raiz.

## Rodar localmente

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000`.

## Deploy

Publicado via GitHub Pages a partir da branch `main`:

https://all4nfr4g4.github.io/Alan-Fraga/
