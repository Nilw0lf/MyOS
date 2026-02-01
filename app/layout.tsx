import "@/styles/globals.css";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata = {
  title: "MyOS",
  description: "Local-first personal knowledge OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
