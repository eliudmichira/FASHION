import { PageWipe } from "@/components/PageWipe";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageWipe />
      {children}
    </>
  );
}
