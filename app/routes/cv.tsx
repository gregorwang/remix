import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { generateImageTokens } from "~/utils/imageToken.server";

// ImageData type
interface ImageData {
  id: string | number;
  src: string;
  alt?: string;
}
// Icon components replaced with emoji for better performance
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="check">✅</span>
);

const UserGroupIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="users">👥</span>
);

const AcademicCapIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="education">🎓</span>
);

const WrenchScrewdriverIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="tools">🔧</span>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="trophy">🏆</span>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="heart">❤️</span>
);

const UserIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="user">👤</span>
);

const ChatBubbleLeftRightIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="chat">💬</span>
);

const ClipboardDocumentListIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="document">📋</span>
);

// Types
interface CVPageData {
  avatarImage: ImageData;
  content: {
    personal: {
      name: string;
      age: string;
      photo_alt: string;
      job_intention: string;
      expected_location: string;
    };
    work_experience: {
      title: string;
      tencent: {
        company: string;
        department: string;
        position: string;
        duration: string;
        description_1: string;
        responsibilities_1: {
          quality_check: string;
          complaint_review: string;
          violation_review: string;
          patrol_inspection: string;
        };
        description_2: string;
        responsibilities_2: {
          queue_management: string;
          daily_quality_check: string;
          rule_learning: string;
          ai_tools: string;
        };
      };
    };
    school_experience: {
      title: string;
      practice: {
        title: string;
        hospital: string;
        activities: {
          medical_learning: string;
          nursing_learning: string;
          patient_communication: string;
          meeting_participation: string;
        };
      };
    };
    education: {
      title: string;
      university: string;
      major: string;
    };
    skills: {
      title: string;
      list: {
        english: string;
        wps: string;
        office: string;
        driving: string;
        first_aid: string;
        chatgpt: string;
      };
      levels: {
        proficient: string;
        general: string;
      };
    };
    certificates: {
      title: string;
      cet6: string;
    };
    hobbies: {
      title: string;
      gaming: string;
      cycling: string;
    };
    self_evaluation: {
      title: string;
      content: string;
    };
  };
}

interface Skill {
  name: string;
  progress: number;
  level: string;
  icon: React.ComponentType<{ className?: string }>; // Icon component type
}

// Links function
export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: "/app/tailwind.css" },
  { rel: "preload", as: "image", href: "Feedback/person.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { 
    rel: "stylesheet", 
    href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap" 
  },
];

// Meta function
export const meta: MetaFunction = () => [
  { title: "汪家俊 - 个人简历" },
  { name: "description", content: "汪家俊的个人简历，腾讯云雀事中质检QC，护理学本科毕业" },
  { name: "keywords", content: "简历,汪家俊,腾讯云雀,质检QC,护理学" },
  { property: "og:title", content: "汪家俊 - 个人简历" },
  { property: "og:description", content: "汪家俊的个人简历，腾讯云雀事中质检QC，护理学本科毕业" },
  { property: "og:type", content: "website" },
  { property: "og:image", content: "https://gregorwang.oss-cn-qingdao.aliyuncs.com/lkjs.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
];

// Loader function - 在服务端生成头像token
export async function loader() {
  // 原始头像数据
  const rawAvatarImage = { id: 'cv-avatar', src: 'Feedback/person.png', alt: '汪家俊的照片' };

  // 生成头像token
  const tokenResults = generateImageTokens([rawAvatarImage.src], 30);
  const tokenMap = new Map(tokenResults.map(result => [result.imageName, result.imageUrl]));

  // 替换为带token的完整URL
  const avatarImage = {
    ...rawAvatarImage,
    src: tokenMap.get(rawAvatarImage.src) || rawAvatarImage.src
  };

  const data: CVPageData = {
    avatarImage,
    content: {
      personal: {
        name: "汪家俊",
        age: "24岁 男",
        photo_alt: "汪家俊的照片",
        job_intention: "求职意向",
        expected_location: "期望地点：青岛市"
      },
      work_experience: {
        title: "工作经历",
        tencent: {
          company: "腾讯云雀",
          department: "第一交付中心",
          position: "事中质检QC",
          duration: "2023年7月 - 至今",
          description_1: "2023年7月5日，入职视频号直播电商业务，最初担任事中违禁信息队列质检员。",
          responsibilities_1: {
            quality_check: "质检供应商审核出的case",
            complaint_review: "日常值班处理客诉复核",
            violation_review: "违规直播间复核与处罚",
            patrol_inspection: "巡查外部直播间"
          },
          description_2: "2024年1月，转入事中食品专审队列，继续担任质检工作。",
          responsibilities_2: {
            queue_management: "协助队列管理建设",
            daily_quality_check: "执行日常质检任务",
            rule_learning: "学习前沿电商规则",
            ai_tools: "运用AI工具辅助工作"
          }
        }
      },
      school_experience: {
        title: "在校经历",
        practice: {
          title: "社会实践",
          hospital: "武汉大学中南医院护理实习",
          activities: {
            medical_learning: "学习医学知识，熟悉医院环境",
            nursing_learning: "跟随带教老师学习护理知识",
            patient_communication: "与病人沟通交流，缓解压力",
            meeting_participation: "参加科室会议，了解管理流程"
          }
        }
      },
      education: {
        title: "教育背景",
        university: "武汉城市学院",
        major: "护理学 本科"
      },
      skills: {
        title: "职业技能",
        list: {
          english: "英语六级",
          wps: "WPS办公软件",
          office: "MS Office",
          driving: "C2驾驶证",
          first_aid: "急救技能",
          chatgpt: "ChatGPT"
        },
        levels: {
          proficient: "熟练",
          general: "一般"
        }
      },
      certificates: {
        title: "资格证书",
        cet6: "英语六级"
      },
      hobbies: {
        title: "兴趣爱好",
        gaming: "单机游戏",
        cycling: "骑自行车"
      },
      self_evaluation: {
        title: "自我评价",
        content: "作为一个responsibility强的员工，我始终对工作保持高度负责。与同事之间保持良好的沟通，善于协作，积极营造和谐的团队氛围。同时，我热衷于学习新知识，特别注重深入理解和掌握行业前沿动态。工作中始终保持耐心与细心，确保任务的高效执行与质量的持续提升。"
      }
    }
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=300", // token数据缓存5分钟
    },
  });
}

export default function CVPage() {
  const { avatarImage, content } = useLoaderData<typeof loader>();

  // State management - 为RSC准备，最小化客户端状态
  const [animationStage, setAnimationStage] = useState(0);

  // 技能数据
  const skillsData: Skill[] = [
    { name: content.skills.list.english, progress: 85, level: content.skills.levels.proficient, icon: ChatBubbleLeftRightIcon },
    { name: content.skills.list.wps, progress: 90, level: content.skills.levels.proficient, icon: ClipboardDocumentListIcon },
    { name: content.skills.list.office, progress: 85, level: content.skills.levels.proficient, icon: ClipboardDocumentListIcon },
    { name: content.skills.list.driving, progress: 70, level: content.skills.levels.general, icon: UserIcon },
    { name: content.skills.list.first_aid, progress: 75, level: content.skills.levels.general, icon: HeartIcon },
    { name: content.skills.list.chatgpt, progress: 95, level: content.skills.levels.proficient, icon: WrenchScrewdriverIcon }
  ];

  // 初始化和清理
  useEffect(() => {
    console.log('🎬 CV页面初始化');
    
    // 初始动画序列
    const animationSequence = [
      { delay: 300, stage: 1 },   // Header
      { delay: 600, stage: 2 },   // Personal info
      { delay: 900, stage: 3 },   // Work experience
      { delay: 1200, stage: 4 },  // Skills & Education
      { delay: 1500, stage: 5 },  // Self evaluation
    ];

    animationSequence.forEach(({ delay, stage }) => {
      setTimeout(() => setAnimationStage(stage), delay);
    });

    return () => {
      console.log('🧹 CV页面清理');
    };
  }, []);

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen bg-primary-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 lg:px-8">
        
        {/* 页面标题和头像 */}
        <m.div 
          className="bg-primary-100 rounded-lg shadow-xl p-6 md:p-8 mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ 
            opacity: animationStage >= 1 ? 1 : 0,
            y: animationStage >= 1 ? 0 : -30 
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* 头像 */}
            <m.div 
              className="flex-shrink-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: animationStage >= 1 ? 1 : 0.8,
                opacity: animationStage >= 1 ? 1 : 0 
              }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <img 
                src={avatarImage.src}
                alt={content.personal.photo_alt}
                onError={() => console.error('Image failed to load:', avatarImage.src)}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg border-4 border-primary-50"
                loading="eager"
                decoding="async"
              />
            </m.div>
            
            {/* 基本信息 */}
            <div className="flex-1 text-center md:text-left">
              <m.h1 
                className="text-4xl font-bold text-primary-950 leading-tight tracking-tight mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: animationStage >= 1 ? 1 : 0,
                  x: animationStage >= 1 ? 0 : -20 
                }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {content.personal.name}
              </m.h1>
              <m.p 
                className="text-lg text-primary-950/70 leading-normal mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: animationStage >= 1 ? 1 : 0,
                  x: animationStage >= 1 ? 0 : -20 
                }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {content.personal.age}
              </m.p>
              <m.div 
                className="flex flex-col md:flex-row gap-3 text-sm font-medium text-primary-950"
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: animationStage >= 1 ? 1 : 0,
                  y: animationStage >= 1 ? 0 : 10 
                }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-base text-accent flex items-center justify-center">💼</span>
                  <span>{content.personal.job_intention}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-base text-accent flex items-center justify-center">📍</span>
                  <span>{content.personal.expected_location}</span>
                </div>
              </m.div>
            </div>
          </div>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 左侧：工作经历和教育背景 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 工作经历 */}
            <m.div 
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ 
                opacity: animationStage >= 3 ? 1 : 0,
                x: animationStage >= 3 ? 0 : -30 
              }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-accent flex items-center justify-center">💼</span>
                </div>
                <h2 className="text-2xl font-bold text-primary-950 leading-snug">{content.work_experience.title}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-accent pl-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-primary-950 leading-snug">{content.work_experience.tencent.company}</h3>
                      <p className="text-base text-accent font-medium leading-normal mt-0.5">{content.work_experience.tencent.position}</p>
                      <p className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.department}</p>
                    </div>
                    <span className="text-sm text-primary-950/70 leading-normal mt-1 md:mt-0">{content.work_experience.tencent.duration}</span>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    <div>
                      <p className="text-base text-primary-950 leading-relaxed mb-2">{content.work_experience.tencent.description_1}</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_1.quality_check}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_1.complaint_review}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_1.violation_review}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_1.patrol_inspection}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-base text-primary-950 leading-relaxed mb-2">{content.work_experience.tencent.description_2}</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_2.queue_management}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_2.daily_quality_check}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_2.rule_learning}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_2.ai_tools}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>

            {/* 在校经历 */}
            <m.div 
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ 
                opacity: animationStage >= 3 ? 1 : 0,
                x: animationStage >= 3 ? 0 : -30 
              }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-primary-950 leading-snug">{content.school_experience.title}</h2>
              </div>
              
              <div className="border-l-4 border-accent pl-4">
                <h3 className="text-xl font-semibold text-primary-950 leading-snug mb-1">{content.school_experience.practice.title}</h3>
                <p className="text-base text-accent font-medium leading-normal mb-3">{content.school_experience.practice.hospital}</p>
                
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-primary-950/70 leading-normal">{content.school_experience.practice.activities.medical_learning}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-primary-950/70 leading-normal">{content.school_experience.practice.activities.nursing_learning}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-primary-950/70 leading-normal">{content.school_experience.practice.activities.patient_communication}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-primary-950/70 leading-normal">{content.school_experience.practice.activities.meeting_participation}</span>
                  </li>
                </ul>
              </div>
            </m.div>
          </div>

          {/* 右侧：技能、教育、证书等 */}
          <div className="space-y-6">
            
            {/* 教育背景 */}
            <m.div 
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ 
                opacity: animationStage >= 4 ? 1 : 0,
                x: animationStage >= 4 ? 0 : 30 
              }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-primary-950 leading-snug">{content.education.title}</h2>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary-950 leading-snug">{content.education.university}</h3>
                <p className="text-base text-accent font-medium leading-normal">{content.education.major}</p>
              </div>
            </m.div>

            {/* 职业技能 */}
            <m.div 
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ 
                opacity: animationStage >= 4 ? 1 : 0,
                x: animationStage >= 4 ? 0 : 30 
              }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <WrenchScrewdriverIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-primary-950 leading-snug">{content.skills.title}</h2>
              </div>
              
              <div className="space-y-3">
                {skillsData.map((skill, index) => (
                  <m.div 
                    key={skill.name}
                    className="space-y-1.5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: animationStage >= 4 ? 1 : 0,
                      y: animationStage >= 4 ? 0 : 20 
                    }}
                    transition={{ duration: 0.6, delay: 0.25 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <skill.icon className="w-4 h-4 text-primary-950/70" />
                        <span className="text-sm font-medium text-primary-950 leading-normal">{skill.name}</span>
                      </div>
                      <span className="text-xs text-primary-950/70 leading-normal tracking-wide">{skill.level}</span>
                    </div>
                    <div className="w-full bg-primary-50 rounded-full h-2">
                      <m.div 
                        className="bg-accent h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: animationStage >= 4 ? `${skill.progress}%` : 0 
                        }}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </m.div>
                ))}
              </div>
            </m.div>

            {/* 资格证书 */}
            <m.div 
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ 
                opacity: animationStage >= 4 ? 1 : 0,
                x: animationStage >= 4 ? 0 : 30 
              }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <TrophyIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-primary-950 leading-snug">{content.certificates.title}</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-accent" />
                <span className="text-base text-primary-950 leading-normal">{content.certificates.cet6}</span>
              </div>
            </m.div>

            {/* 兴趣爱好 */}
            <m.div 
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ 
                opacity: animationStage >= 4 ? 1 : 0,
                x: animationStage >= 4 ? 0 : 30 
              }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <HeartIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-primary-950 leading-snug">{content.hobbies.title}</h2>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  <span className="text-base text-primary-950 leading-normal">{content.hobbies.gaming}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚴</span>
                  <span className="text-base text-primary-950 leading-normal">{content.hobbies.cycling}</span>
                </div>
              </div>
            </m.div>
          </div>
        </div>

        {/* 自我评价 */}
        <m.div 
          className="bg-primary-100 rounded-lg shadow-lg p-6 mt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: animationStage >= 5 ? 1 : 0,
            y: animationStage >= 5 ? 0 : 30 
          }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <UserIcon className="text-xl text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-primary-950 leading-snug">{content.self_evaluation.title}</h2>
          </div>
          
          <p className="text-base leading-relaxed text-primary-950 max-w-4xl">{content.self_evaluation.content}</p>
        </m.div>

        {/* 返回首页链接 */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            prefetch="intent"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
    </LazyMotion>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="bg-primary-100 p-6 md:p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary-950 leading-snug mb-2">简历页面错误</h1>
          <p className="text-base leading-relaxed text-primary-950/70 mb-4">抱歉，个人简历页面暂时无法显示。</p>
          <Link
            to="/"
            className="bg-accent text-white px-6 py-3 rounded text-sm font-medium transition-all duration-300 inline-block shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
