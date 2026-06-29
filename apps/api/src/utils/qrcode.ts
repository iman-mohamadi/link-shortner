import QRCode from 'qrcode';
import { env } from '../config/env';

export const generateQRCode = async (slug: string) => {
  const url = `${env.publicBaseUrl}/${slug}`;
  // Returns a Base64 Data URI that the frontend <img> can render directly.
  return QRCode.toDataURL(url, {
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
};
