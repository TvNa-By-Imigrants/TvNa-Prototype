import { goNowLink } from '../../services/mapLinks.js'

export default function ItineraryStepCard({ step, index, onRemove }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-(--indigo) to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-(--indigo)/20">
                    {index + 1}
                </div>
                {index < 2 && <div className="w-0.5 flex-1 bg-(--indigo)/20 my-1"></div>}
            </div>
            <div className="flex-1 pb-6">
                <div className="bg-(--card-bg) rounded-2xl shadow-sm overflow-hidden relative border border-(--muted)/10">
                    <button
                        onClick={() => onRemove(index)}
                        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer shadow-sm transition-colors"
                    >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    <img src={step.image} alt={step.place} className="w-full h-48 object-cover" />
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-(--indigo) bg-(--indigo)/10 px-2 py-0.5 rounded-md">{step.time}</span>
                            <span className="text-sm font-bold text-(--text)">{step.cost}</span>
                        </div>
                        <h3 className="text-lg font-bold text-(--text) mb-1">{step.place}</h3>
                        <p className="text-sm text-(--card-desc) mb-3 leading-relaxed">{step.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs bg-gradient-to-r from-(--indigo)/10 to-purple-500/10 text-(--indigo) px-2.5 py-1 rounded-lg font-semibold">
                                {step.match}% match
                            </span>
                            <span className="text-xs text-(--muted)">{step.reasoning}</span>
                        </div>
                        <a
                            href={goNowLink(step.place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn bg-(--indigo) text-white text-sm py-2 px-4 rounded-xl inline-flex items-center gap-1.5"
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
