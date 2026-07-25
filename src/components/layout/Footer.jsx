export default function Footer() {
  return (
    <footer className="px-6 py-4 bg-(--bg-footer) text-(--text) text-[12px]">
      <div className="flex justify-center items-center gap-4">
        <div className="flex w-8 h-8 rounded-full overflow-hidden">
          <img src="/icons.svg" alt="logo" className="w-full h-full object-fill" />
        </div>
        <a href="#" className="font-bold underline hover:text-(--indigo)">About us</a>
        <a href="#" className="font-bold underline hover:text-(--indigo)">Facebook</a>
        <a href="#" className="font-bold underline hover:text-(--indigo)">Instagram</a>
        <a href="#" className="font-bold underline hover:text-(--indigo)">Contact</a>
      </div>
    </footer>
  )
}
