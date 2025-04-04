import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface ITheme {
  theme: string;
  onThemeChange: (theme: string) => void;
}

type Props = {
  children: ReactNode;
};

const ThemeContext = createContext({} as ITheme);
const STORE_CONSTANT: string = "THEME";

export const ThemeProvider = ({ children }: Props) => {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const savedTheme: string | null = localStorage.getItem(STORE_CONSTANT);
    if (savedTheme) {
      setTheme(savedTheme as string);
    }
  }, []);

  const handleChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    localStorage.setItem(STORE_CONSTANT, selectedTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        onThemeChange: handleChange,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 