import { View, StyleSheet, Button, Text, Alert, Modal } from 'react-native';

import {
  useVLibras,
  useVLibrasTextWrapper,
  VLibrasTooltipWrapper,
} from 'react-native-vlibras';
import { VLibrasButtonWrapper } from '../../src/VLibrasWrapper';
import DemoTouchable from './DemoTouchable';
import DemoText from './DemoText';
import { useState } from 'react';

export default function VLibrasDemo() {
  const { translate, status, fabEnabled, setFabEnabled } = useVLibras();

  const createOnPress = (text: string) => {
    return () => {
      Alert.alert(`PRESSED: ${text}`);
    };
  };

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Button title="TESTE" onPress={() => translate('Meus Benefícios')} />
      <Text style={styles.teste}>{status}</Text>
      <Text style={styles.teste}>{status}</Text>
      <VLibrasTooltipWrapper content={<Text>Content</Text>}>
        <Text style={styles.teste}>Teste 1 2 3</Text>
      </VLibrasTooltipWrapper>
      <Text
        style={styles.teste}
        {...useVLibrasTextWrapper({ onPress: createOnPress('1') })}
      >
        Meus Benefícios
      </Text>
      <VLibrasButtonWrapper
        title="Meus Benefícios"
        onPress={createOnPress('2')}
      />
      <Text style={styles.teste}>{status}</Text>
      <Text style={styles.teste}>{status}</Text>
      <DemoTouchable onPress={createOnPress('3')}>
        <DemoText text="Meu 1 2 3" />
      </DemoTouchable>
      <Text style={styles.teste}>FAB:</Text>
      <Button
        title={`FAB Enabled: ${fabEnabled}`}
        onPress={() => setFabEnabled((val) => !val)}
      />
      <Button
        title={`FAB Enabled: ${fabEnabled}`}
        onPress={() => setFabEnabled((val) => !val)}
      />
      <Text style={styles.teste}>MODAL:</Text>
      <DemoTouchable onPress={() => setModalVisible(true)}>
        <DemoText text="Show Modal" />
      </DemoTouchable>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <View style={styles.container}>
            <Text style={styles.teste}>Olá Mundo!</Text>
            <DemoTouchable onPress={() => setModalVisible(!modalVisible)}>
              <DemoText text="Ocultar Modal" />
            </DemoTouchable>
          </View>
        </View>
      </Modal>
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
  modalView: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
