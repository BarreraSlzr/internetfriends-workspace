interface HeroTextProps {
  children: React.ReactNode;
  className?: string;
  useGloo?: boolean;
  backgroundStrategy?: string;
}

export default function HeroText({ children, className = "", useGloo, backgroundStrategy }: HeroTextProps) {
  // Gloo integration for enhanced visual effects
  const glooClass = useGloo ? 'hero-gloo-enhanced' : '';
  const strategyClass = backgroundStrategy ? `strategy-${backgroundStrategy}` : '';
  
  return (
    <h1 className={`text-4xl md:text-6xl font-bold text-center text-gray-900 ${className} ${glooClass} ${strategyClass}`}>
      {children}
    </h1>
  );
}