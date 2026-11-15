import type { NextConfig } from "next";
import path from "path";

// Endereço do backend Spring Boot. O navegador só fala com este site: o Next repassa /api/* ao backend, então não há
// CORS e os cookies de sessão e de CSRF continuam de primeira parte (SameSite=Strict funciona).
// Em desenvolvimento, sem a variável, usa o backend local. Na Vercel ela é obrigatória e precisa ser HTTPS (RNF02):
// melhor o build falhar do que publicar um site apontando para localhost.
const backendUrl = (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");
if (process.env.VERCEL) {
  if (!process.env.BACKEND_URL) {
    throw new Error("BACKEND_URL não definida: configure em Project Settings > Environment Variables a URL HTTPS do backend (Render).");
  }
  if (!backendUrl.startsWith("https://")) {
    throw new Error(`BACKEND_URL precisa ser HTTPS na Vercel (recebido: ${backendUrl}).`);
  }
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Com mais de um package-lock.json acima, o Next infere a raiz errada e o `npm run dev` pode ficar
  // preso em "Compiling...": fixa a raiz do Turbopack na pasta frontend.
  turbopack: { root: path.join(__dirname) },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
