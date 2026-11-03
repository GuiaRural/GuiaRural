import { Suspense } from "react";
import AppShell from "./components/common/AppShell";
import LanguageSwitcher from "./components/common/LanguageSwitcher";
import MapView from "./components/common/MapView";
import PlaceCard from "./components/common/PlaceCard";
import SearchBar from "./components/common/SearchBar";

export default function Home() {
  return (
    <AppShell>
      <MapView />
      <div className="absolute inset-x-0 top-0 z-10 flex justify-center p-3 sm:p-4">
        <SearchBar />
      </div>
      <div className="absolute right-3 top-24 z-10 sm:right-5 sm:top-28">
        <LanguageSwitcher />
      </div>
      {/* PlaceCard lê ?local= da URL; sem Suspense o build falha (useSearchParams). */}
      <Suspense>
        <PlaceCard />
      </Suspense>
    </AppShell>
  );
}
