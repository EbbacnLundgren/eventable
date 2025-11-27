export default function Footer() {
  return (
    <footer className="w-full bg-white py-16 px-6 border-t border-gray-300">
      <div className="max-w-5xl mx-auto text-center space-y-6 text-gray-600">
        <h2 className="text-lg font-semibold text-gray-700">
          We Are Eventable!
        </h2>

        <p className="text-sm">
          A seamless way to create, find and explore events. Enjoy!
        </p>

        <p className="text-sm">
          Contact us:{' '}
          <a
            href="mailto:contact@eventable.com"
            className="text-blue-600 underline"
          >
            contacteventable@gmail.com
          </a>
        </p>

        <p className="text-xs text-gray-500 mt-4">© 2025 Eventable</p>
      </div>
    </footer>
  )
}
