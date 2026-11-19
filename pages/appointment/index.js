import { createLead, getParentAppointments } from "../../services/api";
import { decodeQueryValue } from "../../utils/query";
import { ensureParentSession } from "../../utils/parent-session";

function formatAppointmentTime(value = "") {
  if (!value) {
    return "";
  }
  const [date, time = ""] = String(value).replace("T", " ").split(" ");
  return `${date} ${time.slice(0, 5)}`.trim();
}

Page({
  data: {
    form: {
      name: "",
      phone: "",
      child_grade: "",
      source: "trial",
      campus_id: "",
      course_id: "",
      message: ""
    },
    courseTitle: "",
    campusName: "",
    appointments: [],
    historyLoading: true,
    historyError: "",
    submitting: false
  },
  onLoad(options = {}) {
    this.setData({
      "form.course_id": options.course_id || "",
      "form.campus_id": options.campus_id || "",
      courseTitle: decodeQueryValue(options.course_title || ""),
      campusName: decodeQueryValue(options.campus_name || "")
    });
    this.loadAppointmentHistory();
  },
  async loadAppointmentHistory() {
    this.setData({ historyLoading: true, historyError: "" });
    try {
      const sessionToken = await ensureParentSession();
      const appointments = (await getParentAppointments(sessionToken)).map((item) => ({
        ...item,
        created_at_label: formatAppointmentTime(item.created_at)
      }));
      const latest = appointments[0];
      const form = this.data.form;
      this.setData({
        appointments,
        historyLoading: false,
        ...(latest ? {
          "form.name": form.name || latest.name || "",
          "form.phone": form.phone || latest.phone || "",
          "form.child_grade": form.child_grade || latest.child_grade || ""
        } : {})
      });
    } catch (error) {
      this.setData({
        historyLoading: false,
        historyError: "历史预约加载失败，可稍后重试"
      });
    }
  },
  updateField(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },
  async submitAppointment() {
    if (this.data.submitting) {
      return;
    }
    this.setData({ submitting: true });
    try {
      const sessionToken = await ensureParentSession();
      await createLead(this.data.form, sessionToken);
      wx.showToast({ title: "预约已提交", icon: "success" });
      this.setData({ "form.message": "" });
      await this.loadAppointmentHistory();
    } catch (error) {
      wx.showToast({
        title: error && error.detail ? "微信身份获取失败" : "请检查表单信息",
        icon: "none"
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
