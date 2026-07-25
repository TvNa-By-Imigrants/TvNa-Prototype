import { useState } from 'react'
import ItineraryStepCard from '../cards/ItineraryStepCard.jsx'
import JuyRoForm from './JuyRoForm.jsx'
import { goNowWithStops } from '../../services/mapLinks.js'

export default function ItineraryTimeline({ plan, onStopsChange }) {
    const { stops } = plan
    const [addIndex, setAddIndex] = useState(null)

    const handleRemove = (index) => {
        const newStops = stops.filter((_, i) => i !== index)
        onStopsChange(newStops)
        setAddIndex(null)
    }

    const handleAdd = (place, index) => {
        const prevStop = stops[index - 1]
        const nextStop = stops[index]
        const prevTime = prevStop ? parseInt(prevStop.time) : 13
        const nextTime = nextStop ? parseInt(nextStop.time) : prevTime + 2
        const newTime = Math.min(prevTime + 1, nextTime - 1)
        const newStop = {
            time: `${String(newTime).padStart(2, '0')}:00`,
            place: place.title,
            image: place.image,
            description: place.description,
            cost: `$${place.priceRange?.min || 0}-$${place.priceRange?.max || 0}`,
            match: 90,
            reasoning: "Added via JuyRo"
        }
        const newStops = [...stops]
        newStops.splice(index, 0, newStop)
        onStopsChange(newStops)
        setAddIndex(null)
    }

    if (stops.length === 0) {
        return (
            <div className="flex flex-col items-center py-10">
                <p className="text-(--muted) mb-4">No stops yet. Add activities to get started.</p>
                <button
                    onClick={() => setAddIndex(0)}
                    className="btn bg-(--indigo) text-white py-2 px-5 rounded-full font-medium cursor-pointer"
                >
                    + Add Place
                </button>
                {addIndex === 0 && (
                    <div className="w-full mt-4">
                        <JuyRoForm
                            onAdd={(place) => handleAdd(place, 0)}
                            onClose={() => setAddIndex(null)}
                            currentStops={stops}
                        />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-(--text)">Your Plan</h2>
                    <p className="text-sm text-(--muted)">
                        {plan.duration}h · {plan.groupSize} people · {plan.totalCost}
                    </p>
                </div>
                <a
                    href={goNowWithStops(stops)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-(--indigo) text-white text-sm py-2 px-4 rounded-full flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-[16px]">navigation</span>
                    Go Now
                </a>
            </div>
            <div className="flex flex-col">
                {stops.map((step, i) => (
                    <div key={`${step.place}-${i}`}>
                        <ItineraryStepCard step={step} index={i} onRemove={handleRemove} />

                        {i < stops.length - 1 && (
                            <div className="flex justify-start ml-5 -mt-2 mb-2">
                                {addIndex === i + 1 ? (
                                    <div className="w-full">
                                        <JuyRoForm
                                            onAdd={(place) => handleAdd(place, i + 1)}
                                            onClose={() => setAddIndex(null)}
                                            currentStops={stops}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        className="w-8 h-8 rounded-full border-2 border-dashed border-(--indigo)/50 text-(--indigo) flex items-center justify-center hover:bg-(--indigo)/10 cursor-pointer"
                                        onClick={() => setAddIndex(i + 1)}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex justify-start ml-5 mt-1">
                    {addIndex === stops.length ? (
                        <div className="w-full">
                            <JuyRoForm
                                onAdd={(place) => handleAdd(place, stops.length)}
                                onClose={() => setAddIndex(null)}
                                currentStops={stops}
                            />
                        </div>
                    ) : (
                        <button
                            className="w-8 h-8 rounded-full border-2 border-dashed border-(--indigo)/50 text-(--indigo) flex items-center justify-center hover:bg-(--indigo)/10 cursor-pointer"
                            onClick={() => setAddIndex(stops.length)}
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
