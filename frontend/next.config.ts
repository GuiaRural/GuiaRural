import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Com mais de um package-lock.json acima, o Next infere a raiz errada e o `npm run dev` pode ficar
  // preso em "Compiling...": fixa a raiz do Turbopack na pasta frontend.
  turbopack: { root: path.join(__dirname) },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
