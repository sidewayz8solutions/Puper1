import { NativeModules, Platform } from 'react-native';

const { ReceiptReader } = NativeModules;

export async function getIosReceiptBase64() {
  if (Platform.OS !== 'ios' || !ReceiptReader) {
    throw new Error('ReceiptReader only available on iOS');
  }
  
  try {
    const base64 = await ReceiptReader.getBase64Receipt();
    return base64;
  } catch (error) {
    console.warn('Could not read iOS receipt:', error);
    throw error;
  }