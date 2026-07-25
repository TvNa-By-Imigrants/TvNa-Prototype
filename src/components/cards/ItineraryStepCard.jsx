import { goNowLink } from '../../services/mapLinks.js'

export default function ItineraryStepCard({ step, index, onRemove }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-(--indigo) text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                </div>
                {index < 2 && <div className="w-0.5 flex-1 bg-(--indigo)/30 my-1"></div>}
            </div>
            <div className="flex-1 pb-6">
                <div className="bg-(--card-bg) rounded-xl shadow-md overflow-hidden relative">
                    <button
                        onClick={() => onRemove(index)}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer shadow-md"
                    >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <img src={step.image} alt={step.place} className="w-full h-40 object-cover" />
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-(--indigo)">{step.time}</span>
                            <span className="text-sm font-bold text-(--text)">{step.cost}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-(--text) mb-1">{step.place}</h3>
                        <p className="text-sm text-(--card-desc) mb-2">{step.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs bg-(--indigo)/10 text-(--indigo) px-2 py-1 rounded-full font-medium">
                                {step.match}% match
                            </span>
                            <span className="text-xs text-(--muted)">{step.reasoning}</span>
                        </div>
                        <a
                            href={goNowLink(step.place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn bg-(--indigo) text-white text-sm py-2 px-4 rounded-full inline-flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[16px]">navigation</span>
                            Go Now
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
