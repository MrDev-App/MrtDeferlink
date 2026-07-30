import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOOL_ICONS = [
  require('../types/icon.png'),
  require('../types/icon.png'),
  require('../types/icon.png'),
  require('../types/icon.png'),
  require('../types/icon.png'),
  require('../types/icon.png'),
];

const PostsScreen = () => {
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <SafeAreaView style={{}}>
      <Text onPress={() => setModalVisible(true)}>PostsScreen</Text>

      <Modal animationType="slide" visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
            hitSlop={8}
          >
            <Text style={{}}>X</Text>
          </TouchableOpacity>

          <View style={styles.iconRow}>
            {TOOL_ICONS.map((icon, index) => (
              <View key={index} style={styles.iconCircle}>
                <Image
                  source={icon}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>

          <Text style={styles.title}>Bring your tools together</Text>
          <Text style={styles.description}>
            Connect Drive, Gmail, and Notion to get started faster.
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PostsScreen;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#121212',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2c2c2e',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 16,
    gap: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  iconImage: {
    width: 26,
    height: 26,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    color: '#a0a0a5',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
