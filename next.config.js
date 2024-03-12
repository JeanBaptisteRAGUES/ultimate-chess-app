/** @type {import('next').NextConfig} */

// TODO: Vérifier si ces headers sont vraiment utiles, ils semblerait que ce soit seulement ceux dans le middleware.ts qui le sont
const nextConfig = {
    async headers() {
        return [
            {
              source: '/chess',
              headers: [
                { key: 'Access-Control-Allow-Origin', value: '*' },
                { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
                { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
                { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }
              ],
            },
          ];
    },
}

module.exports = nextConfig
