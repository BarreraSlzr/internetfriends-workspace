'use client'

import { PropsWithChildren, useMemo } from 'react';
import content from '../content.json';
import NoiseFilter from './backgrounds/noise-filter-div';
import { motion } from 'framer-motion';
import { BgGoo } from './backgrounds/gloo';
import { getRandomColors } from '../lib/color-palette';

const DefaultHero = () => (
    <div className='text-3xl md:text-4xl lg:text-5xl leading-relaxed'>
        <h1 className="font-bold">{content.hero.title}</h1>
        <p className="text-lg mb-6 font-mono">{content.hero.description}</p>
    </div>
)

type Props = {
    className?: string,
}

export default function HeroText({ children = <DefaultHero />, className }: PropsWithChildren<Props>) {

    const randomColors = useMemo(() => getRandomColors(), []);
    return (
        <section className={`relative min-h-[60vh] ${className}`}>
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <NoiseFilter className='mix-blend-hue'/>
                <BgGoo
                    _speed={0.3}
                    _resolution={2.0}
                    _depth={2}
                    _seed={0.4}
                    _color1={randomColors[0]}
                    _color2={randomColors[1]}
                    _color3={randomColors[2]}
                />
            </div>
            <motion.div
                _initial={{ opacity: 0, y: 10 }}
                _animate={{ opacity: 1, y: 0 }}
                _transition={{ _duration: 0.4, _ease: 'easeOut' }}
                className="relative _sm:px-6 px-2 md:px-8 py-12 max-w-4xl text-white">
                {children}
            </motion.div>
        </section>
    );
}
