import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "./_components/AppLayout";

export const metadata: Metadata = {
    title: "MoneyFlow - Gestão por Períodos",
    description: "Aplicação de gestão financeira por períodos contábeis",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body>
                <AppLayout>{children}</AppLayout>
            </body>
        </html>
    );
}

