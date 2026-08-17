import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kurslarim',
    short_name: 'Kurslarim',
    description: 'Tursunpo\'lat Iskandarov masofaviy ta\'lim platformasi',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDFDFE',
    theme_color: '#FDFDFE',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
