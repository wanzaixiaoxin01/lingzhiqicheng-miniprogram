export const COURSE_CATEGORIES = [
  "全部",
  "编程与逻辑",
  "英语口语",
  "表达与阅读",
  "练字",
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
  书法: "练字",
  音乐: "音乐与乐器",
  乐器: "音乐与乐器",
  音乐课: "音乐与乐器"
};

export function normalizeCourseCategory(category = "") {
  const value = String(category).trim();
  return CATEGORY_ALIASES[value] || value;
}

export function isInterestCourse(course) {
  return Boolean(normalizeCourseCategory(course && course.category));
}

export function mergeInterestCourses(remoteCourses = []) {
  return remoteCourses
    .filter((course) => isInterestCourse(course) && course.status !== "hidden")
    .map((course) => ({
      ...course,
      category: normalizeCourseCategory(course.category),
      image: course.cover_url || course.image || "",
      tags: Array.isArray(course.tags) ? course.tags : []
    }))
    .sort((left, right) => (left.sort_order || 100) - (right.sort_order || 100));
}

export function filterInterestCourses(courses, category = "全部") {
  if (category === "全部") {
    return courses;
  }
  return courses.filter((course) => course.category === category);
}
