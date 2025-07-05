const translations = {
  pages: {
    home: {
      title: "AI-Powered Full-Stack Solutions",
      meta: {
        subtitle: "Crafting the Future of Web",
        description:
          "Explore my portfolio of AI-driven projects, showcasing modern web technologies and compliant, high-performance solutions.",
        og_description:
          "Discover a showcase of AI-powered full-stack development. See how I leverage modern tech to build beautiful, efficient, and compliant web applications.",
      },
      hero: {
        learn_more: "Learn More",
        contact_me: "Contact Me",
        slide1: "Pioneering the next wave of web development with AI-centric solutions.",
        slide2: "Building robust, scalable, and secure applications with modern frameworks.",
        slide3: "Transforming ideas into reality through elegant code and user-focused design.",
      },
      about_section: {
        title: "What I Do",
        subtitle:
          "I specialize in creating high-quality web applications that are both powerful and user-friendly, with a focus on performance and compliance.",
        ai_driven: {
          title: "AI-Driven",
          description: "Leveraging artificial intelligence to build smarter, more efficient applications.",
        },
        compliant: {
          title: "Compliant",
          description: "Ensuring all projects adhere to the highest standards of data privacy and security.",
        },
        modern_tech: {
          title: "Modern Tech",
          description:
            "Utilizing cutting-edge technologies like Remix, Nuxt, and Supabase to deliver exceptional results.",
        },
      },
      message_board: {
        title: "Community Message Board",
        subtitle: "Leave a message, share your thoughts, or just say hi!",
      },
      footer: {
        site_title: "My Portfolio",
        site_description: "A journey through code, design, and innovation.",
        tech_stack: "Tech Stack",
        contact_info: "Get in Touch",
        contact_message: "Feel free to reach out via social media.",
        legal_notice: "Legal Notice",
        copyright: "© 2024 Your Name. All rights reserved.",
      },
    },
  },
};

export function t(key: string): string {
  const keys = key.split(".");
  let result: any = translations;
  try {
    for (const k of keys) {
      result = result[k];
    }
    return result || key;
  } catch (error) {
    return key;
  }
} 