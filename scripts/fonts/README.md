# Instalação de fontes (Windows)

Coloque aqui os arquivos de fonte (`.ttf`/`.otf`) que deseja instalar no Windows.

## Passos

1. Copie os arquivos de fonte para esta pasta (`scripts/fonts/`).
   - Exemplos: `Hello Paris Script.ttf`, `Hello Paris Serif Regular.ttf`, `La Luxes Serif.otf`.
2. No Windows, abra o PowerShell e, na raiz do projeto, execute:
   
   ```powershell
   ./scripts/install-fonts.ps1
   ```

   - O script solicitará elevação (Administrador) automaticamente.
   - Ele vai instalar todas as fontes `.ttf` e `.otf` encontradas nesta pasta.

3. Reinicie os aplicativos (Word, Photoshop, Figma, etc.) para que as fontes apareçam.

## Observações

- Este repositório não inclui arquivos de fontes comerciais. Adicione-os aqui somente se tiver licença.
- Se preferir, você pode instalar individualmente dando duplo clique no arquivo `.ttf/.otf` e clicando em **Instalar**.