interface HeroTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function HeroText({ children, className = "" }: HeroTextProps) {
  return (
    <h1 className={`text-4xl md:text-6xl font-bold text-center text-gray-900 ${className}`}>
      {children}
    </h1>
  );
}