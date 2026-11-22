export const APPOINTMENT_FIELD_ORDER = [
  "name", "phone", "campus_id", "appointmentDate",
  "child_name", "child_age", "child_grade", "child_school"
];

export function getAppointmentBounds(selectedDate = "", now = Date.now()) {
  const beijing = new Date(now + 8 * 60 * 60 * 1000).toISOString();
  const minAppointmentDate = beijing.slice(0, 10);
  return {
    minAppointmentDate
  };
}

export function validateAppointment(data, now = Date.now()) {
  const { form, appointmentDate } = data;
  const errors = {};
  for (const [field, label] of [["name", "家长姓名"], ["child_name", "孩子姓名"]]) {
    const value = String(form[field] || "").trim();
    if (!value && field === "name") errors[field] = `请输入${label}`;
    else if (value.length > 80) errors[field] = `${label}不能超过80个字`;
  }
  if (!String(form.phone || "").trim()) errors.phone = "请输入手机号码";
  else if (!/^1[3-9]\d{9}$/.test(String(form.phone).trim())) errors.phone = "请输入有效的11位手机号";
  if (!form.campus_id) errors.campus_id = "请选择预约网点";
  if (!appointmentDate) errors.appointmentDate = "请选择预约日期";
  if (appointmentDate && (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || appointmentDate < getAppointmentBounds("", now).minAppointmentDate)) errors.appointmentDate = "请选择今天或之后的日期";
  if (form.child_age !== "" && form.child_age != null && (!Number.isInteger(form.child_age) || form.child_age < 1 || form.child_age > 30)) {
    errors.child_age = "请选择孩子年龄（1至30岁）";
  }
  if (String(form.child_school || "").trim().length > 120) {
    errors.child_school = "学校名称不能超过120个字";
  }
  return errors;
}
