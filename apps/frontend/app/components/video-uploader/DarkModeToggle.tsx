import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export const DarkModeToggle = ({ darkMode, onToggle }: DarkModeToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
};
