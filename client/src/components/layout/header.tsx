import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Settings } from "lucide-react";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSettingsButton?: boolean;
  onBack?: () => void;
}

export default function Header({
  title = "Home",
  showBackButton = false,
  showSettingsButton = true,
  onBack,
}: HeaderProps) {
  const [, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <header className={`sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between transition-shadow ${isScrolled ? "shadow-sm" : ""}`}>
      <div className="flex items-center space-x-3">
        {showBackButton && (
          <button 
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {showSettingsButton && (
        <button 
          onClick={handleSettings}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <Settings size={20} />
        </button>
      )}
    </header>
  );
}
