# Agro-Nutrição Trigo Gestão

Desejo criar uma aplicativo para Gestão de uma Empresa.
Eis os PDF que vão nos ajudar a criar: no PDF Manual Mestre tem a descrição do aplicativo, e também o Estatuto e o Código Comercial.

Decisões de alinhamento:
1. Sobre o envio de E-mail: enviar um link e o próprio funcionário cria a sua senha no primeiro acesso (ou uma senha temporária de uso único).
2. A planilha estará conectada ao Google Sheets para ler as partes indicadas (faturamento total, saída total e lucro dos projetos) com botão de sincronização manual. Sem lembretes automáticos após 5 horas.

Retificações Importantes:
1. O nome da empresa e do aplicativo será: Agro-Nutrição Trigo (substituindo o nome AgroEI do PDF por Agro-Nutrição Trigo em todo o sistema).
2. Manter todas as regras do Manual Mestre e do Estatuto exceto os nomes.
3. Adicionar a área e perfil de Funcionário de Vendas:
- Lugar de vendas onde registra as vendas de hortícolas, frangos, ovos, quer por retalho quer a grosso.
- Os preços são definidos por órgão superior hierárquico; o funcionário de venda não poderá alterar os preços base, mas pode dar desconto, sendo que o teto máximo de desconto é definido pelo órgão hierárquico.
- Se o funcionário vender a outro preço ou exceção, deve ter espaço obrigatório para registar a razão/motivo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/49b05647-d0ca-4852-ae39-3c096599cc34).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
