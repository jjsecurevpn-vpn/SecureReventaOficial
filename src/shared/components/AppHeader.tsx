import { memo } from 'react';
import { useVpn } from '@/features/vpn';
import { LanguageButton } from './AppHeader/LanguageButton';
import { BackButton } from './AppHeader/BackButton';

interface AppHeaderProps {
  onMenuClick: () => void;
}

/** Barra superior de navegación de la app */
export const AppHeader = memo(function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { screen, setScreen, selectedCategory, setSelectedCategory } = useVpn();

  const isSubScreen = screen !== 'home';
  const isCategoryDetail = screen === 'servers' && Boolean(selectedCategory);

  const handleClick = () => {
    if (isCategoryDetail) {
      setSelectedCategory(null);
      return;
    }
    if (isSubScreen) {
      setScreen('home');
    } else {
      onMenuClick();
    }
  };

  return (
    <header className="topbar">
      <BackButton
        isSubScreen={isSubScreen}
        isCategoryDetail={isCategoryDetail}
        onClick={handleClick}
      />

      <div className="row">
        <LanguageButton />
      </div>
    </header>
  );
});
