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

### React Native CLI

Instale a biblioteca e as dependências dela:

```sh
npm install react-native-vlibras react-native-webview react-native-gesture-handler react-native-reanimated react-native-worklets
```

No iOS, instale também os pods:

```sh
cd ios && pod install
```

> **Plugin do Babel:** o Reanimated 4 exige o plugin `react-native-worklets/plugin` no `babel.config.js`. Para configurá-lo, siga o [guia de instalação do Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#react-native-community-cli).

### Expo

```sh
npx expo install react-native-vlibras react-native-webview react-native-gesture-handler react-native-reanimated react-native-worklets
```

> **Plugin do Babel:** nos projetos criados com o template do Expo (SDK 50 ou mais recente), o plugin do worklets já vem configurado. Nos outros casos, veja o [guia de instalação do Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/).

## Uso

### Configuração

Envolva o app com o `VLibrasProvider`, na raiz, para que ele ocupe a tela inteira:

```tsx
import { VLibrasProvider } from 'react-native-vlibras';

export default function App() {
  return (
    <VLibrasProvider>
      <MeuApp />
    </VLibrasProvider>
  );
}
```

Isso já adiciona o botão flutuante do VLibras. O provider inclui o `GestureHandlerRootView`, então não é preciso adicioná-lo por causa da biblioteca.

### Como funciona para o usuário

1. O usuário toca no botão flutuante e o player do VLibras abre.
2. Com o player aberto, tocar num texto marcado como traduzível mostra a tradução em Libras.
3. Tocar num botão marcado também mostra a tradução, mas a ação do botão não é executada na hora: ela fica num balão ao lado do botão e só é executada se o usuário tocar no balão. Tocar em outro ponto da tela fecha o balão.
4. Com o player fechado, o app funciona normalmente, e os botões executam as ações direto.

### Marcando o conteúdo traduzível

Só o conteúdo marcado é traduzido. Há três formas de marcar, conforme o tipo de elemento.

#### Textos

Use o `useVLibrasTextWrapper` e repasse o que ele retorna para o `Text`:

```tsx
import { Text } from 'react-native';
import { useVLibrasTextWrapper } from 'react-native-vlibras';

function Titulo({ children }: { children: string }) {
  const vlibrasProps = useVLibrasTextWrapper();
  return <Text {...vlibrasProps}>{children}</Text>;
}
```

Se o texto tiver uma ação própria ou uma `ref`, passe-as para o hook, e não direto para o `Text`: `useVLibrasTextWrapper({ onPress, ref })`.

O texto traduzido é o primeiro trecho de texto do `Text`. Em `<Text>Olá, {nome}</Text>`, só "Olá, " seria traduzido. Para traduzir tudo, monte o texto antes: `` <Text>{`Olá, ${nome}`}</Text> ``.

#### Botões e outros elementos tocáveis

Use o `useVLibrasTouchableWrapper`, informando o texto a traduzir e a ação, e repasse a `ref` e o `onPress` que ele retorna. A `ref` é usada para posicionar o balão.

```tsx
import { Pressable, Text, View } from 'react-native';
import { useVLibrasTouchableWrapper } from 'react-native-vlibras';

function Botao({ titulo, onPress }: { titulo: string; onPress: () => void }) {
  const vlibras = useVLibrasTouchableWrapper<View>({ text: titulo, onPress });
  return (
    <Pressable ref={vlibras.ref} onPress={vlibras.onPress}>
      <Text>{titulo}</Text>
    </Pressable>
  );
}
```

O texto traduzido não precisa ser o que aparece na tela. Num botão só com ícone, por exemplo, passe uma descrição como `text: 'Fechar'`.

#### Componentes com vários textos

Para um cartão ou item de lista com vários textos e uma ação, envolva o componente com `withVLibrasTranslationContext`. Dentro dele:

- `useVLibrasRegisterTranslationText` registra um texto a traduzir. Os textos registrados são traduzidos juntos.
- `useVLibrasRegisterPressAction` registra a ação.
- `useVLibrasTranslationContext().onPress` é o `onPress` que deve ir no elemento tocável.

```tsx
import { Pressable, Text } from 'react-native';
import {
  useVLibrasRegisterPressAction,
  useVLibrasRegisterTranslationText,
  useVLibrasTranslationContext,
  withVLibrasTranslationContext,
} from 'react-native-vlibras';

interface CartaoProps {
  titulo: string;
  descricao: string;
  onPress: () => void;
}

const Cartao = withVLibrasTranslationContext(function CartaoConteudo({
  titulo,
  descricao,
  onPress,
}: CartaoProps) {
  useVLibrasRegisterTranslationText(`${titulo}. ${descricao}`);
  useVLibrasRegisterPressAction(onPress);
  const { onPress: onPressTraduzivel } = useVLibrasTranslationContext();
  return (
    <Pressable onPress={onPressTraduzivel}>
      <Text>{titulo}</Text>
      <Text>{descricao}</Text>
    </Pressable>
  );
});
```

Componentes marcados assim podem ser aninhados. Um componente que fica dentro de outro bloco registra o texto e a ação no bloco de fora, em vez de criar um bloco próprio. Assim, um componente de texto reutilizável pode registrar o próprio texto, e o cartão que o contém traduz todos os textos juntos.

### Controlando pelo código

O `useVLibras()` dá acesso ao estado e às ações da biblioteca em qualquer componente dentro do provider. Os mais usados:

- `status`: `'inactive'` com o player fechado, `'loading'` enquanto ele carrega e `'active'` quando está pronto para traduzir.
- `setTranslationEnabled(true | false)`: abre ou fecha o player.
- `translate(texto)`: traduz um texto qualquer. Só funciona com o status `'active'`; nos outros casos, retorna `false` sem traduzir.
- `setFabEnabled(true | false)`: mostra ou esconde o botão flutuante.

Um botão que abre o player e, com ele pronto, traduz uma mensagem:

```tsx
import { Button } from 'react-native';
import { useVLibras } from 'react-native-vlibras';

function VerEmLibras({ mensagem }: { mensagem: string }) {
  const { status, setTranslationEnabled, translate } = useVLibras();
  return (
    <Button
      title={status === 'active' ? 'Traduzir mensagem' : 'Abrir o VLibras'}
      onPress={() =>
        status === 'active' ? translate(mensagem) : setTranslationEnabled(true)
      }
    />
  );
}
```

Uma tela que esconde o botão flutuante enquanto está aberta, por exemplo uma tela de vídeo:

```tsx
import { useEffect } from 'react';
import { useVLibras } from 'react-native-vlibras';

function TelaDeVideo() {
  const { setFabEnabled } = useVLibras();

  useEffect(() => {
    setFabEnabled(false);
    return () => setFabEnabled(true);
  }, [setFabEnabled]);

  // ...
}
```

## Referência da API

### `VLibrasProvider`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `fabDraggable` | `boolean` | `true` | Permite que o usuário arraste o botão flutuante. Com `false`, ele fica fixo no meio da borda direita. |
| `fabX`, `fabY` | `SharedValue<number>` | criadas pelo provider | Posição do botão flutuante controlada pelo app, para definir onde ele começa, movê-lo ou salvá-la. É o deslocamento, em px, do canto superior esquerdo do botão em relação ao do provider. Use `FAB_SIZE` para encostá-lo numa borda. Posições fora da tela são ajustadas ao desenhar. Sem essas props, o botão começa no meio da borda direita. Só valem com `fabDraggable`. |

### `useVLibras()`

Só funciona dentro do `VLibrasProvider`; fora dele, lança um erro.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `status` | `VLibrasStatus` | `'inactive'` com o player fechado, `'loading'` enquanto ele carrega e `'active'` quando está pronto para traduzir. |
| `setTranslationEnabled` | setter de `boolean` | Abre (`true`) ou fecha (`false`) o player. Aceita também uma função, como o `setState` do React. |
| `translate` | `(texto: string) => boolean` | Traduz um texto qualquer. Com o status diferente de `'active'`, retorna `false` sem traduzir. |
| `fabEnabled` | `boolean` | Se o botão flutuante está habilitado. Mesmo habilitado, ele some enquanto o player está aberto. |
| `setFabEnabled` | setter de `boolean` | Mostra ou esconde o botão flutuante. |
| `playerSize` | `VLibrasPlayerSize` ou `undefined` | Tamanho do player (`{ width, height }`, em px). `undefined` usa o padrão de 210 × 350. |
| `setPlayerSize` | setter de `VLibrasPlayerSize` | Muda o tamanho do player. Com `undefined`, volta ao padrão. |
| `fabX`, `fabY` | `SharedValue<number>` | Posição do botão flutuante em uso: a passada ao provider ou a criada por ele. |
| `show` | `(ref, onPress) => void` | Mostra o balão junto ao elemento da `ref`; tocar no balão chama `onPress`. É o que os hooks de marcação usam; serve para criar marcações próprias. |
| `hide` | `() => void` | Fecha o balão. |

### Marcação de conteúdo

| API | Parâmetros | Retorno e uso |
| --- | --- | --- |
| `useVLibrasTextWrapper` | `{ onPress?, ref? }` (opcional) | `{ ref, onPress }`, para repassar ao `Text`. Traduz o primeiro trecho de texto do `Text`. |
| `useVLibrasTouchableWrapper` | `{ text, onPress?, ref? }` | `{ ref, onPress }`, para repassar ao elemento tocável. Traduz `text`. |
| `withVLibrasTranslationContext` | componente | O componente dentro de um bloco de tradução. |
| `VLibrasTranslateBlockProvider` | `children` | O bloco de tradução como componente; é o que o HOC acima usa. Envolve o conteúdo numa `View`, que serve de âncora para o balão. Dentro de outro bloco, não cria um bloco novo. |
| `useVLibrasRegisterTranslationText` | `texto: string` | Registra um texto no bloco. Os textos do bloco são traduzidos juntos. |
| `useVLibrasRegisterPressAction` | ação (opcional) | Registra a ação do bloco. Se mais de um componente registrar uma ação, vale a primeira. |
| `useVLibrasTranslationContext` | — | `{ onPress, registerText, registerAction }` do bloco. O `onPress` vai no elemento tocável. Fora de um bloco, lança um erro. |

### Player avulso

O `VLibrasWebPlayerWrapper` é o player do VLibras sem o provider, para mostrar um player fixo numa tela, por exemplo. Ele não substitui o player que o provider abre pelo botão flutuante.

```tsx
import { useRef, useState } from 'react';
import { View } from 'react-native';
import {
  VLibrasPlayButton,
  VLibrasProgressBar,
  VLibrasWebPlayerWrapper,
  type VLibrasSimplePlayerHandle,
} from 'react-native-vlibras';

function PlayerFixo() {
  const playerRef = useRef<VLibrasSimplePlayerHandle>(null);
  const [pronto, setPronto] = useState(false);
  return (
    <View style={{ width: 210, height: 350 }}>
      <VLibrasWebPlayerWrapper
        ref={playerRef}
        onPlayerStatusChange={(e) => setPronto(e.status !== 'loading')}
      />
      {pronto && playerRef.current && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <VLibrasPlayButton player={playerRef.current} />
          <VLibrasProgressBar player={playerRef.current} />
        </View>
      )}
    </View>
  );
}
```

Com o player pronto, `playerRef.current?.translate('Olá')` traduz um texto.

Props do `VLibrasWebPlayerWrapper`:

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `ref` | `Ref<VLibrasSimplePlayerHandle>` | — | Obrigatória. Dá acesso aos métodos do player. |
| `uri` | `string` | `https://vlibras-player-webjs.pages.dev/` | Endereço da página do player. |
| `speed` | `number` | `1` | Velocidade da animação. |
| `showSubtitles` | `boolean` | `false` | Mostra a legenda com o texto traduzido. |
| `onPlayerStatusChange` | `(e: { text?, status }) => void` | — | Chamado quando o status do player muda para `'idle'`, `'playing'` ou `'paused'`. O primeiro aviso é `'idle'`, quando o player termina de carregar. |
| `onAnimationStatusChange` | `(e: { text, status }) => void` | — | Chamado quando o status da animação muda para `'idle'`, `'playing'` ou `'paused'`. |
| `onAnimationPlay`, `onAnimationPause`, `onAnimationEnd` | `(e: { text }) => void` | — | A tradução de `text` começou, pausou ou terminou. |
| `onAnimationProgress` | `(e: { text, index, length }) => void` | — | Progresso da tradução: `index / length`. |

Métodos do `VLibrasSimplePlayerHandle`:

| Método | Descrição |
| --- | --- |
| `translate(texto)` | Traduz um texto. |
| `pause()`, `resume()` | Pausa e retoma a tradução atual. |
| `getStatus()` | Status atual: `'loading'`, `'idle'`, `'playing'` ou `'paused'`. |
| `addListener(evento, listener)` | Escuta um evento (`'playerStatusChange'`, `'animationStatusChange'`, `'animationPlay'`, `'animationPause'`, `'animationEnd'` ou `'animationProgress'`) e retorna a função que cancela a escuta. |

Componentes visuais, para montar a interface do player:

| Componente | Props principais | Descrição |
| --- | --- | --- |
| `VLibrasPlayButton` | `player` | Botão de reproduzir, pausar e repetir, que acompanha o status do player. |
| `VLibrasProgressBar` | `player`, `height`, `backgroundColor`, `fillColor` | Barra de progresso da tradução. |
| `VLibrasToggleSubtitleButton` | `showSubtitles`, `toggleSubtitles` | Botão de ligar e desligar a legenda. |
| `VLibrasPlayerHeader` | `onClose` | Cabeçalho "VLIBRAS" com o botão de fechar. |
| `VLibrasCloseButton`, `VLibrasImageButton` | props do `Pressable`; o `VLibrasImageButton` recebe também `imageSource` | Botões de imagem. |
| `VLibrasFab` | props do `Pressable`, `size`, `borderRadius` | O botão do VLibras, só visual: quem o renderiza o posiciona. Tamanho padrão: `FAB_SIZE` (56). |

## Como contribuir

- [Fluxo de desenvolvimento](CONTRIBUTING.md#fluxo-de-desenvolvimento)
- [Enviando um pull request](CONTRIBUTING.md#enviando-um-pull-request)
- [Código de conduta](CODE_OF_CONDUCT.md) (em inglês)

## Licença

Este projeto usa a licença MIT. Veja o arquivo [LICENSE](LICENSE).

---

Criado com o [create-react-native-library](https://github.com/callstack/react-native-builder-bob).
