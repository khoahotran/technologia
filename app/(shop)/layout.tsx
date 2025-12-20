export default function ShopLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col">
            {/* <Header variant="default" /> */}
            <main className="flex-1">{children}</main>
            {/* <Footer /> */}
        </div>
    );
}
