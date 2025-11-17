import { NativeModules, Platform } from 'react-native';

const { ReceiptReader } = NativeModules;

export async function getIosReceiptBase64() {
  if (Platform.OS !== 'ios') {
    throw new Error('ReceiptReader only available on iOS');
  }
  
  if (!ReceiptReader) {
    throw new Error('ReceiptReader native module not found');
  }
  
  const base64 = await ReceiptReader.getBase64Receipt();
  return base64;
}
