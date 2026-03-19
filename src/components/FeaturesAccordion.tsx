'use client'
import { useState } from 'react'

interface FeatureGroup {
    title: string
    icon?: string
    items: { label: string; value: any }[]
}

export default function FeaturesAccordion({ features }: { features: FeatureGroup[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <div className="space-y-0.5"> {/* Reducido espacio entre grupos */}
            {features.map((group, index) => (
                <div key={index} className="border-b border-gray-100 last:border-0">
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full py-3 flex justify-between items-center group transition-all" // py-4 a 3
                    >
                        <div className="flex items-center gap-4">
                            {group.icon && <span className="text-xl">{group.icon}</span>}
                            <span className="font-bold uppercase text-[10px] tracking-[0.15em] text-gray-800 group-hover:text-black transition-colors">
                                {group.title}
                            </span>
                        </div>
                        <svg
                            className={`w-3 h-3 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-black' : 'text-gray-400'}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {openIndex === index && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 pb-4 animate-in fade-in slide-in-from-top-2"> {/* gap-y-4 a 2 y pb-6 a 4 */}
                            {group.items.map((item, i) => (
                                <div key={i} className="flex justify-between border-b border-gray-50 pb-1">
                                    <span className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">{item.label}</span>
                                    <span className="text-[11px] text-black font-bold uppercase tracking-tight">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}