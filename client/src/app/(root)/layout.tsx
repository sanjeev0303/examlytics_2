import LenisProvider from "@/providers/LenisProvider";

export default function RootGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LenisProvider>{children}</LenisProvider>;
}
