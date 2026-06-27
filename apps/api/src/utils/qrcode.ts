import QRCode from 'qrcode';

export const generateQRCode = async (slug: string) => {
  const url = `http://localhost:5000/${slug}`;
  // Returns a Base64 Data URI that your Next.js img tag can display directly
  return await QRCode.toDataURL(url, {
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
};