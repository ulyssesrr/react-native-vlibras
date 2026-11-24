# Como contribuir

Contribuições são sempre bem-vindas, de qualquer tamanho!

Queremos que esta comunidade seja acolhedora e respeitosa. Antes de contribuir, leia o [código de conduta](./CODE_OF_CONDUCT.md) (em inglês) e siga-o em todas as interações com o projeto.

## Fluxo de desenvolvimento

Este projeto é um monorepo gerenciado com [Yarn workspaces](https://yarnpkg.com/features/workspaces). Ele tem dois pacotes:

- a biblioteca, na raiz;
- um app de exemplo, na pasta `example/`.

As versões de Node.js, Yarn e Java usadas no projeto estão no [`mise.toml`](./mise.toml). Com o [mise](https://mise.jdx.dev/) instalado, instale todas com:

```sh
mise install
```

Depois, rode `yarn` na raiz para instalar as dependências de todos os pacotes:

```sh
yarn
```

> Como o projeto usa Yarn workspaces, não dá para usar o [`npm`](https://github.com/npm/cli) no desenvolvimento sem migrar o projeto manualmente.

O [app de exemplo](/example/) mostra a biblioteca em uso, e você precisa rodá-lo para testar suas mudanças. Ele usa a versão local da biblioteca: mudanças no código JavaScript aparecem no app sem recompilar, mas mudanças em código nativo exigem recompilar o app.

O app de exemplo tem duas telas, escolhidas pela constante `SCREEN` em [`example/src/App.tsx`](/example/src/App.tsx): a vitrine (`'vitrine'`), que é a tela gravada no GIF do README, e a bancada de testes (`'testes'`).

Os comandos abaixo são rodados na raiz do projeto.

Para iniciar o Metro:

```sh
yarn example start
```

Para rodar o app de exemplo no Android:

```sh
yarn example android
```

Para rodar o app de exemplo no iOS:

```sh
yarn example ios
```

Para confirmar que o app está rodando na Nova Arquitetura, procure nos logs do Metro uma mensagem como esta:

```sh
Running "VlibrasExample" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Ela deve ter `"fabric":true` e `"concurrentRoot":true`.

Para rodar o app de exemplo na web:

```sh
yarn example web
```

Confira se o código passa no TypeScript:

```sh
yarn typecheck
```

Para procurar erros de lint:

```sh
yarn lint
```

Para corrigir erros de formatação:

```sh
yarn lint --fix
```

Se possível, adicione testes para a sua mudança. Para rodar os testes unitários:

```sh
yarn test
```

### Convenção de commits

As mensagens de commit seguem a especificação [Conventional Commits](https://www.conventionalcommits.org/pt-br):

- `fix`: correção de bug, como um crash causado por um método obsoleto.
- `feat`: funcionalidade nova, como um método novo no módulo.
- `refactor`: refatoração, como trocar componentes de classe por hooks.
- `docs`: mudança na documentação, como um exemplo de uso novo.
- `test`: testes novos ou atualizados.
- `chore`: mudança nas ferramentas, como na configuração do CI.

Escreva as mensagens de commit e os comentários no código em português.

A cada commit, os hooks do [lefthook](https://lefthook.dev/) rodam o lint e o typecheck dos arquivos alterados e conferem o formato da mensagem.

### Publicando no npm

Usamos o [release-it](https://github.com/release-it/release-it) para publicar novas versões. Ele cuida das tarefas comuns, como definir a versão pelo semver e criar a tag e a release.

Para publicar uma nova versão:

```sh
yarn release
```

### Scripts

O `package.json` tem scripts para as tarefas comuns:

- `yarn`: instala as dependências do projeto.
- `yarn typecheck`: verifica os tipos com o TypeScript.
- `yarn lint`: verifica o código com o [ESLint](https://eslint.org/).
- `yarn test`: roda os testes unitários com o [Jest](https://jestjs.io/).
- `yarn clean`: apaga as pastas de build da biblioteca e do app de exemplo.
- `yarn release`: publica uma nova versão.
- `yarn example start`: inicia o Metro do app de exemplo.
- `yarn example android`: roda o app de exemplo no Android.
- `yarn example ios`: roda o app de exemplo no iOS.
- `yarn example web`: roda o app de exemplo na web.
- `yarn example build:web`: gera o build web do app de exemplo.

### Enviando um pull request

> **É o seu primeiro pull request?** Você pode aprender com esta série gratuita (em inglês): [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

Ao enviar um pull request:

- Prefira pull requests pequenos, focados numa única mudança.
- Confira se o lint, o typecheck e os testes passam.
- Revise a documentação afetada pela mudança.
- Para mudanças na API ou na implementação, abra antes uma issue para discutir com os mantenedores.
