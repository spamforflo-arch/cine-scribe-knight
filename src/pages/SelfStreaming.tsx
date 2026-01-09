import { AppHeader } from "@/components/layout/AppHeader";
import { MyLibrarySection } from "@/components/library/MyLibrarySection";

const SelfStreaming = () => {
  return (
    <div className="min-h-screen bg-background grain flex flex-col">
      <AppHeader />
      <main className="flex-1 pt-14">
        <div className="container mx-auto px-4 py-8">
          <MyLibrarySection />
        </div>
      </main>
    </div>
  );
};

export default SelfStreaming;
