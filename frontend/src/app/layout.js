import { Inter } from "next/font/google";
import "./styles/globals.css";
import { ConfiguratorProvider } from "./contexts/Configurator";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SCARA ROBOT",
  description: "UAO SCARA ROBOT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the app with the ConfiguratorProvider */}
        <ConfiguratorProvider>
          {children}
        </ConfiguratorProvider>
      </body>
    </html>
  );
}
