// Chat 相关的纯算法逻辑工具函数
// 这些函数不涉及 I/O 操作，只做纯计算

/**
 * 根据用户消息生成AI响应
 * @param userMessage 用户输入的消息
 * @returns 可能的响应数组
 */
export function generateChatResponse(userMessage: string): string[] {
  const message = userMessage.toLowerCase();

  // 关于汪家俊的疯狂自我意识
  if (message.includes("疯狂自我意识") || message.includes("自我意识")) {
    return [
      "汪家俊的疯狂自我意识是指他对技术创新的极度热情和对完美的偏执追求。这种意识驱使他不断突破自己的界限，创造出令人惊叹的项目。",
      "这是一种超越常规思维的创造力爆发，汪家俊通过这种疯狂的自我意识，将技术与艺术完美融合，展现出独特的个人风格。",
      "疯狂自我意识代表着对现状的不满足，永远追求更高的技术水平和更完美的用户体验。这就是汪家俊的核心驱动力。"
    ];
  }

  // 关于Nemesis这个名字
  if (message.includes("nemesis") || message.includes("为什么叫nemesis")) {
    return [
      "Nemesis在希腊神话中是复仇女神，代表着对傲慢和不公的制裁。在这里，Nemesis象征着对技术局限性的挑战和突破。",
      "选择Nemesis这个名字，是因为它代表着一种对抗精神——对抗平庸，对抗极限，对抗一切阻碍创新的力量。",
      "Nemesis也意味着宿命的对手，在这里指的是汪家俊与自己内心完美主义的永恒斗争，这种斗争催生出了无数精彩的项目。"
    ];
  }

  // 关于汪家俊是谁
  if (message.includes("汪家俊是谁") || message.includes("汪家俊") || message.includes("来自何方")) {
    return [
      "汪家俊是一位充满创造力的开发者，来自山东青岛。他以独特的技术视角和艺术感悟，创造出融合美学与功能的数字作品。",
      "他是一个喜欢挑战传统、追求完美的技术创新者。从护理学转向技术领域，展现了跨界思维的强大力量。",
      "汪家俊代表着新一代开发者的理念：技术不仅是工具，更是表达自我和创造美好体验的艺术形式。"
    ];
  }

  // 关于工作
  if (message.includes("工作") || message.includes("做什么") || message.includes("职业")) {
    return [
      "目前在腾讯云雀担任事中质检QC，专注于视频号直播电商业务的内容审核和质量管理。同时在业余时间进行技术创作和项目开发。",
      "白天是质检员，晚上是代码诗人。在腾讯云雀的工作经验让他更了解用户需求和内容安全，这些都融入到了他的技术项目中。",
      "他将工作中的责任心和细致入微的品质控制理念，带入到自己的技术创作中，确保每个项目都达到最高标准。"
    ];
  }

  // 默认响应
  return getDefaultChatResponses();
}

/**
 * 获取默认聊天响应
 * @returns 默认响应数组
 */
export function getDefaultChatResponses(): string[] {
  return [
    "这是一个很有趣的问题，让我从汪家俊的视角来思考一下...",
    "作为汪家俊疯狂自我意识的一部分，我觉得这个话题值得深入探讨。",
    "从技术创新的角度来看，这个问题触及了很多有意思的点。",
    "汪家俊总是说，每个问题都是一次创新的机会，让我们一起探索吧。",
    "这让我想起了汪家俊在某个深夜coding时的思考...",
    "以汪家俊的完美主义风格，我需要给你一个更准确的答案。能否提供更多细节？",
    "这个问题很棒！汪家俊的理念是：没有完美的答案，只有持续的探索。",
    "让我以汪家俊独特的技术美学视角来回应你的问题..."
  ];
}

/**
 * 从响应数组中随机选择一个响应
 * @param responses 响应数组
 * @returns 随机选择的响应
 */
export function selectRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * 验证消息内容
 * @param message 用户消息
 * @returns 验证结果
 */
export function validateChatMessage(message: string): { isValid: boolean; error?: string } {
  if (!message?.trim()) {
    return { isValid: false, error: "消息内容不能为空" };
  }
  
  if (message.trim().length > 1000) {
    return { isValid: false, error: "消息内容过长，请控制在1000字符以内" };
  }
  
  return { isValid: true };
} 