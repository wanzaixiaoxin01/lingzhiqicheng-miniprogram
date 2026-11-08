import { createLead } from "../../services/api";
import { decodeQueryValue } from "../../utils/query";

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
    campusName: ""
  },
  onLoad(options) {
    this.setData({
      "form.course_id": options.course_id || "",
      "form.campus_id": options.campus_id || "",
      courseTitle: decodeQueryValue(options.course_title || ""),
      campusName: decodeQueryValue(options.campus_name || "")
    });
  },
  updateField(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },
  async submitAppointment() {
    try {
      await createLead(this.data.form);
      wx.showToast({ title: "预约已提交", icon: "success" });
      setTimeout(() => wx.switchTab({ url: "/pages/home/index" }), 800);
    } catch (error) {
      wx.showToast({ title: "请检查表单信息", icon: "none" });
    }
  }
});
