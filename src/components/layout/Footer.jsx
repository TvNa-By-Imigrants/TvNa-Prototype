import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function Footer() {
    const { t } = useLanguage()

    return (
        <footer className="px-6 py-5 bg-(--bg-footer) text-(--text) text-sm border-t border-(--muted)/10">
            <div className="max-w-(--max-width) mx-auto flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex w-8 h-8 rounded-lg overflow-hidden">
                        <img src="/assets/TvNa.png" alt="logo" className="w-full h-full object-fill" />
                    </div>
                    <span className="font-bold text-(--indigo)">TvNa</span>
                </div>
                <div className="flex items-center gap-5">
                    <a href="#" className="font-medium hover:text-(--indigo) transition-colors">{t('footer.about')}</a>
                    <a href="#" className="font-medium hover:text-(--indigo) transition-colors">{t('footer.facebook')}</a>
                    <a href="#" className="font-medium hover:text-(--indigo) transition-colors">{t('footer.instagram')}</a>
                    <a href="#" className="font-medium hover:text-(--indigo) transition-colors">{t('footer.contact')}</a>
                </div>
            </div>
        </footer>
    )
}
