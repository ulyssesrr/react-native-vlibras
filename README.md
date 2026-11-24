# react-native-vlibras

[![versão no npm](https://img.shields.io/npm/v/react-native-vlibras)](https://www.npmjs.com/package/react-native-vlibras)
[![licença MIT](https://img.shields.io/npm/l/react-native-vlibras)](LICENSE)

Tradução para Libras em apps React Native com o [VLibras](https://www.gov.br/governodigital/pt-br/vlibras), um conjunto de ferramentas gratuitas e de código aberto que traduz conteúdos digitais em Português para Libras, desenvolvido pelo governo federal em parceria com a UFPB.

A biblioteca adiciona ao app um botão flutuante do VLibras. Quando o usuário toca nele, abre um player com o avatar do VLibras. A partir daí, tocar num texto ou botão que o app marcou como traduzível mostra a tradução em Libras. Nos botões, a ação original fica num balão e só é executada se o usuário tocar nele, para que pedir a tradução não dispare a ação sem querer.

Funciona em Android e iOS, com a Nova Arquitetura do React Native.

<p align="center">
  <img src="https://raw.githubusercontent.com/ulyssesrr/react-native-vlibras/main/docs/demo.gif" width="320" alt="Demonstração: o usuário toca no botão do VLibras, o player abre com o avatar, é arrastado para o canto da tela, e o avatar traduz para Libras o texto e o cartão tocados; no cartão, a ação fica num balão.">
</p>

## Instalação

Instalar __peer dependencies__

```sh
npm install react-native-webview react-native-worklets react-native-gesture-handler react-native-reanimated
```

Instalar a biblioteca:

```sh
npm install react-native-vlibras
```


## Usage


```js
TODO
```


## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
