import AppShell from "./components/common/AppShell";
import LanguageSwitcher from "./components/common/LanguageSwitcher";
import MapPlaceholder from "./components/common/MapPlaceholder";
import SearchBar from "./components/common/SearchBar";

export default function Home() {
  return (
    <AppShell>
      <MapPlaceholder />
      <div className="absolute inset-x-0 top-0 z-10 flex justify-center p-3 sm:p-4">
        <SearchBar />
      </div>
      <div className="absolute right-3 top-24 z-10 sm:right-5 sm:top-28">
        <LanguageSwitcher />
      </div>
    </AppShell>
  );
}
