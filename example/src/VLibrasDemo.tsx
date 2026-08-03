import { View, StyleSheet, Button, Text, Alert } from 'react-native';

import {
  useVLibras,
  useVLibrasTextWrapper,
  VLibrasTooltipWrapper,
} from 'react-native-vlibras';
import { VLibrasButtonWrapper } from '../../src/VLibrasWrapper';

export default function VLibrasDemo() {
  const { translate, status } = useVLibras();

  const onPress = () => {
    Alert.alert('PRESSED!');
  };

  return (
    <View style={styles.container}>
      <Button title="TESTE" onPress={() => translate('Meus Benefícios')} />
      <Text style={styles.teste}>{status}</Text>
      <Text style={styles.teste}>{status}</Text>
      <Text style={styles.teste}>{status}</Text>
      <Text style={styles.teste}>{status}</Text>
      <VLibrasTooltipWrapper content={<Text>Content</Text>}>
        <Text style={styles.teste}>Teste 1 2 3</Text>
      </VLibrasTooltipWrapper>
      <Text style={styles.teste} {...useVLibrasTextWrapper({ onPress })}>
        Meus Benefícios
      </Text>
      <VLibrasButtonWrapper title="Meus Benefícios" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // iOS Shadow properties
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Android Shadow property
    elevation: 4,
  },
  playerContainer: {
    zIndex: 1,
    position: 'absolute',
    width: 210,
    height: 350,
  },
  speedControl: {
    fontWeight: 700,
  },
  controlsContainer: {
    padding: 5,
    gap: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
  },
  teste: {
    borderColor: 'red',
    borderWidth: 2,
  },
});

// function VLibrasPlayerHeader() {
//   return (
//     <View
//       style={{
//         height: 40,
//         padding: 0,
//         margin: 0,
//         backgroundColor: '#15479c',
//         borderTopLeftRadius: 8,
//         borderTopRightRadius: 8,
//       }}
//     >
//       <Text style={{
//         color: 'white'
//       }}>VLIBRAS</Text>
//     </View>
//   );
// }
