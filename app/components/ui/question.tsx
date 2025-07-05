const faqs = [
    {
      id: 1,
      question: "这个网站是用来干嘛的？有什么用？",
      answer: "个人练习项目并展示个人相关信息"
    },
    {
        id: 2,
        question: "网站会倒闭会变质吗？",
        answer: "99%是不会的，主要成本为阿里云服务器99一年，域名后续续费一年差不多也是99，每年200维持这个网站进行运转。",
    },
    {
        id: 3,
        question: "网站会持续更新吗？",
        answer: "更新幅度可能在一个月两个月，也有可能是两个周，我需要补充更多知识来升级这个网站。",
    },
    {
        id: 4,
        question: "网站看起来好像不太行啊好多问题。",
        answer: <>请点击这个<a href="https://wj.qq.com/s2/22988409/5c06/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">腾讯问卷链接</a>写清楚你的问题，我会收到并回复。</>,
    },
  ]
  
  export default function Example() {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">有疑问？看看这里</h2>
          <dl className="mt-20 divide-y divide-gray-900/10">
            {faqs.map((faq) => (
              <div key={faq.id} className="py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8">
                <dt className="text-base/7 font-semibold text-gray-900 lg:col-span-5">{faq.question}</dt>
                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                  <p className="font-sans text-base/7 text-gray-600">{faq.answer}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    )
  }
  