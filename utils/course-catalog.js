export const COURSE_CATEGORIES = [
  "全部",
  "编程与逻辑",
  "英语口语",
  "表达与阅读",
  "书法",
  "绘画",
  "音乐与乐器"
];

const CATEGORY_ALIASES = {
  编程: "编程与逻辑",
  编程课: "编程与逻辑",
  口语: "英语口语",
  英语: "英语口语",
  英语口语课: "英语口语",
  表达: "表达与阅读",
  表达课: "表达与阅读",
  阅读表达: "表达与阅读",
  音乐: "音乐与乐器",
  乐器: "音乐与乐器",
  音乐课: "音乐与乐器"
};

export const INTEREST_COURSES = [
  {
    id: "interest-programming",
    title: "编程与逻辑",
    category: "编程与逻辑",
    summary: "从积木编程到项目实践，培养拆解问题和创造性解决问题的能力。",
    suitable_grade: "小学 / 初中",
    service_period: "按主题课次安排",
    price_text: "预约咨询",
    tags: ["编程思维", "逻辑训练"],
    content: "通过可视化编程、任务挑战和项目实践，帮助孩子建立清晰的逻辑表达和解决问题的方法。",
    sort_order: 1,
    status: "published",
    isLocal: true
  },
  {
    id: "interest-english-speaking",
    title: "英语口语",
    category: "英语口语",
    summary: "用 AI 陪伴和真实情境对话，让孩子愿意开口、能够表达。",
    suitable_grade: "小学 / 初中",
    service_period: "按主题课次安排",
    price_text: "预约咨询",
    tags: ["AI 陪伴", "情境表达"],
    content: "结合 AI 陪伴工具和系统化口语训练，让孩子在真实场景中积累表达信心。",
    sort_order: 2,
    status: "published",
    isLocal: true
  },
  {
    id: "interest-expression-reading",
    title: "表达与阅读",
    category: "表达与阅读",
    summary: "拓展阅读丰富度，鼓励孩子思考、讨论并勇敢表达自己的观点。",
    suitable_grade: "小学 / 初中",
    service_period: "按主题课次安排",
    price_text: "预约咨询",
    tags: ["阅读积累", "观点表达"],
    content: "通过丰富的阅读材料、讨论和分享，培养孩子的理解力、思考力与表达力。",
    sort_order: 3,
    status: "published",
    isLocal: true
  },
  {
    id: "interest-calligraphy",
    title: "书法",
    category: "书法",
    summary: "从基本笔画到作品练习，在专注书写中建立审美和耐心。",
    suitable_grade: "小学 / 初中",
    service_period: "按主题课次安排",
    price_text: "预约咨询",
    tags: ["硬笔基础", "审美培养"],
    content: "从坐姿、握笔和基本笔画入手，逐步建立规范书写习惯和对汉字之美的感受。",
    sort_order: 4,
    status: "published",
    isLocal: true
  },
  {
    id: "interest-painting",
    title: "绘画",
    category: "绘画",
    summary: "从观察和想象出发，用画笔把自己的感受变成作品。",
    suitable_grade: "小学 / 初中",
    service_period: "按主题课次安排",
    price_text: "预约咨询",
    tags: ["观察力", "想象表达"],
    content: "通过主题创作、色彩练习和作品分享，鼓励孩子观察生活、表达感受并建立审美自信。",
    sort_order: 5,
    status: "published",
    isLocal: true
  },
  {
    id: "interest-music-instruments",
    title: "音乐与乐器",
    category: "音乐与乐器",
    summary: "接触钢琴、吉他等乐器，在节奏与演奏中找到属于自己的热爱。",
    suitable_grade: "小学 / 初中",
    service_period: "按主题课次安排",
    price_text: "预约咨询",
    tags: ["钢琴", "吉他", "节奏训练"],
    content: "提供钢琴、吉他等乐器基础指导，帮助孩子感受节奏、建立兴趣并获得舞台表达的机会。",
    sort_order: 6,
    status: "published",
    isLocal: true
  }
];

export function normalizeCourseCategory(category = "") {
  const value = String(category).trim();
  return CATEGORY_ALIASES[value] || (COURSE_CATEGORIES.includes(value) ? value : "");
}

export function isInterestCourse(course) {
  return Boolean(normalizeCourseCategory(course && course.category));
}

export function mergeInterestCourses(remoteCourses = []) {
  const normalizedRemote = remoteCourses
    .filter(isInterestCourse)
    .map((course) => ({
      ...course,
      category: normalizeCourseCategory(course.category),
      tags: Array.isArray(course.tags) ? course.tags : []
    }));
  const remoteCategories = new Set(normalizedRemote.map((course) => course.category));
  const fallbackCourses = INTEREST_COURSES.filter((course) => !remoteCategories.has(course.category));

  return [...fallbackCourses, ...normalizedRemote].sort((left, right) => {
    const leftIndex = COURSE_CATEGORIES.indexOf(left.category);
    const rightIndex = COURSE_CATEGORIES.indexOf(right.category);
    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }
    return (left.sort_order || 100) - (right.sort_order || 100);
  });
}

export function filterInterestCourses(courses, category = "全部") {
  if (category === "全部") {
    return courses;
  }
  return courses.filter((course) => course.category === category);
}
