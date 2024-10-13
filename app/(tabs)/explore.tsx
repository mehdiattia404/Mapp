import React, { useState, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, Modal, FlatList, PanResponder, StatusBar, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const stickers = [
  { id: '1', uri: 'https://example.com/sticker1.png' },
  { id: '2', uri: 'https://example.com/sticker2.png' },
  { id: '3', uri: 'https://example.com/sticker3.png' },
  // Add more stickers as needed
];

const Explore = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [stickerPosition, setStickerPosition] = useState({ x: 0, y: 0 });
  const stickerRef = useRef<any>(null);
  const viewShotRef = useRef<ViewShot>(null);

  const handleExplorePress = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleStickerPress = (uri: string) => {
    setSelectedSticker(uri);
    setModalVisible(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        stickerRef.current.setNativeProps({ style: { zIndex: 1 } });
      },
      onPanResponderMove: (_, gestureState) => {
        setStickerPosition({
          x: gestureState.moveX - 50, // Adjust based on sticker size
          y: gestureState.moveY - 50, // Adjust based on sticker size
        });
      },
      onPanResponderRelease: () => {
        stickerRef.current.setNativeProps({ style: { zIndex: 0 } });
      },
    })
  ).current;

  const takeScreenshot = async () => {
    if (viewShotRef.current) {
      try {
        const uri = await viewShotRef.current.capture();
        await saveScreenshot(uri);
      } catch (error) {
        console.error("Error taking screenshot: ", error);
      }
    }
  };

  const saveScreenshot = async (uri: string) => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (permission.granted) {
      const fileUri = `${FileSystem.documentDirectory}screenshot.png`;
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });
      alert('Screenshot saved to your media library!');
    } else {
      alert('Permission to save screenshots is required!');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e0f7fa" />
      <Text style={styles.title}>Explore Screen</Text>
      <TouchableOpacity style={styles.button} onPress={handleExplorePress}>
        <Text style={styles.buttonText}>Select an Image</Text>
      </TouchableOpacity>
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Show Stickers</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={takeScreenshot}>
        <Text style={styles.buttonText}>Take Screenshot</Text>
      </TouchableOpacity>

      {/* Sticker Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <FlatList
            data={stickers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleStickerPress(item.uri)}>
                <Image source={{ uri: item.uri }} style={styles.sticker} />
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ViewShot for Screenshot */}
      <ViewShot ref={viewShotRef} style={styles.screenshotContainer}>
        {selectedSticker && (
          <Image
            ref={stickerRef}
            source={{ uri: selectedSticker }}
            style={[styles.selectedSticker, { left: stickerPosition.x, top: stickerPosition.y }]}
            {...panResponder.panHandlers}
          />
        )}
      </ViewShot>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    padding: Platform.OS === 'web' ? 20 : 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: Platform.OS === 'ios' ? 20 : 10,
  },
  sticker: {
    width: 100,
    height: 100,
    margin: 10,
  },
  selectedSticker: {
    position: 'absolute',
    width: 100,
    height: 100,
    marginTop: 20,
    borderRadius: 10,
  },
  screenshotContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#6200EE',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Explore;
