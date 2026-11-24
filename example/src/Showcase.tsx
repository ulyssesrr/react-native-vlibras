import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import {
  useVLibrasRegisterPressAction,
  useVLibrasRegisterTranslationText,
  useVLibrasTextWrapper,
  useVLibrasTouchableWrapper,
  useVLibrasTranslationContext,
  withVLibrasTranslationContext,
} from 'react-native-vlibras';

/**
 * Tela de vitrine: imita um app de serviços comum para mostrar a biblioteca
 * em uso (é a tela gravada no GIF do README). Usa as três formas de marcar
 * conteúdo como traduzível: texto simples, botão e cartão composto.
 */
export default function Showcase() {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_COLOR} />
      <View style={styles.header}>
        <TranslatableText style={styles.headerTitle}>
          Meus serviços
        </TranslatableText>
        <TranslatableText style={styles.headerSubtitle}>
          Olá! O que você precisa hoje?
        </TranslatableText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <ServiceCard
          title="Agendar atendimento"
          description="Escolha o dia e o horário."
          onPress={openScheduling}
        />
        <ServiceCard
          title="Consultar pedidos"
          description="Veja o andamento das suas solicitações."
          onPress={openRequests}
        />
        <ServiceCard
          title="Documentos"
          description="Emita a segunda via e comprovantes."
          onPress={openDocuments}
        />
        <PrimaryButton title="Falar com o atendimento" onPress={openChat} />
      </ScrollView>
    </View>
  );
}

// Fora do componente para que as ações não mudem a cada render: elas são
// registradas no contexto de tradução dos cartões.
const openScheduling = () =>
  Alert.alert('Agendar atendimento', 'Aqui o app abriria o agendamento.');
const openRequests = () =>
  Alert.alert('Consultar pedidos', 'Aqui o app abriria os pedidos.');
const openDocuments = () =>
  Alert.alert('Documentos', 'Aqui o app abriria os documentos.');
const openChat = () =>
  Alert.alert('Falar com o atendimento', 'Aqui o app abriria o chat.');

/** Texto simples: com a tradução ativa, tocá-lo mostra a tradução. */
function TranslatableText({
  style,
  children,
}: {
  style?: StyleProp<TextStyle>;
  children: string;
}) {
  const vlibrasProps = useVLibrasTextWrapper();
  return (
    <Text style={style} {...vlibrasProps}>
      {children}
    </Text>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

/**
 * Cartão composto: título e descrição são traduzidos juntos, e a ação do
 * cartão fica no balão enquanto a tradução está ativa.
 */
const ServiceCard = withVLibrasTranslationContext(function ServiceCardContent({
  title,
  description,
  onPress,
}: ServiceCardProps) {
  useVLibrasRegisterTranslationText(`${title}. ${description}`);
  useVLibrasRegisterPressAction(onPress);
  const { onPress: translatableOnPress } = useVLibrasTranslationContext();
  return (
    <Pressable style={styles.card} onPress={translatableOnPress}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </Pressable>
  );
});

/** Botão com texto conhecido: traduz o título e guarda a ação no balão. */
function PrimaryButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  const vlibras = useVLibrasTouchableWrapper<View>({ text: title, onPress });
  return (
    <Pressable
      ref={vlibras.ref}
      onPress={vlibras.onPress}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const HEADER_COLOR = '#1d3557';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f4f8',
  },
  header: {
    backgroundColor: HEADER_COLOR,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#d6e2f0',
    fontSize: 16,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 4,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    color: '#1d3557',
    fontSize: 17,
    fontWeight: '600',
  },
  cardDescription: {
    color: '#4a5a6a',
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2a7f62',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
