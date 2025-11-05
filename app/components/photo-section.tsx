export default function CursorTeamSection() {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 gap-12">
            {/* Left Content */}
            <div className="flex flex-col justify-start">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-foreground whitespace-nowrap">
                Cursor 是一个专注于打造编程未来的实干型团队。
              </h2>
  
              <a
                href="https://cursor.com/careers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors w-fit"
              >
                加入我们
                <span className="text-lg">→</span>
              </a>
            </div>
  
            {/* Right Image */}
            <div className="relative">
              <img
                src="https://whylookthis.wangjiajun.asia/future.jpg"
                alt="Cursor team collaboration and discussion"
                className="w-full h-auto rounded-lg shadow-lg object-cover aspect-square md:aspect-auto"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }
  