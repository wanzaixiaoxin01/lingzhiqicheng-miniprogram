import { cancelParentAppointment, createLead, getCampuses, getParentAppointments } from "../../services/api";
import { decodeQueryValue } from "../../utils/query";
import { withParentSession } from "../../utils/parent-session";
import { APPOINTMENT_FIELD_ORDER, getAppointmentBounds, validateAppointment } from "../../utils/appointment-validation";

const gradeOptions = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "七年级", "八年级", "九年级", "高一", "高二", "高三"];

function formatAppointmentTime(value = "") {
  if (!value) {
    return "";
  }
  const [date, time = ""] = String(value).replace("T", " ").split(" ");
  return `${date} ${time.slice(0, 5)}`.trim();
}

function formatBeijingDateTime(value = "") {
  const instant = new Date(value);
  if (!value || Number.isNaN(instant.getTime())) {
    return "";
  }
  const beijing = new Date(instant.getTime() + 8 * 60 * 60 * 1000);
  const pad = (number) => String(number).padStart(2, "0");
  return `${beijing.getUTCFullYear()}-${pad(beijing.getUTCMonth() + 1)}-${pad(beijing.getUTCDate())} ${pad(beijing.getUTCHours())}:${pad(beijing.getUTCMinutes())}`;
}

Page({
  data: {
    activeTab: "form",
    fieldErrors: {},
    validationAttempted: false,
    form: {
      name: "",
      phone: "",
      child_name: "",
      child_age: "",
      child_grade: "",
      child_school: "",
      source: "trial",
      campus_id: "",
      course_id: "",
      message: ""
    },
    ageOptions: Array.from({ length: 30 }, (_, index) => `${index + 1}岁`),
    gradeOptions,
    ageIndex: 0,
    gradeIndex: 0,
    campusOptions: [],
    campusIndex: 0,
    campusLoading: false,
    campusError: "",
    appointmentDate: getAppointmentBounds().minAppointmentDate,
    ...getAppointmentBounds(),
    courseTitle: "",
    campusName: "",
    appointments: [],
    historyLoading: true,
    historyError: "",
    submitting: false
  },
  onLoad(options = {}) {
    this.setData({
      appointmentDate: getAppointmentBounds().minAppointmentDate,
      activeTab: options.tab === "history" ? "history" : "form",
      "form.course_id": options.course_id || "",
      "form.campus_id": options.campus_id || "",
      courseTitle: decodeQueryValue(options.course_title || ""),
      campusName: decodeQueryValue(options.campus_name || "")
    });
    this.loadCampuses(options.campus_id || "");
    if (this.data.activeTab === "history") {
      this.loadAppointmentHistory();
    }
  },
  onShow() {
    this.refreshAppointmentBounds();
  },
  refreshAppointmentBounds() {
    this.setData(getAppointmentBounds(this.data.appointmentDate));
  },
  switchAppointmentTab(event) {
    const tab = event.currentTarget.dataset.tab;
    if (!["form", "history"].includes(tab) || tab === this.data.activeTab) {
      return;
    }
    this.setData({ activeTab: tab });
    if (tab === "history") {
      this.loadAppointmentHistory();
    }
  },
  async loadCampuses(requestedCampusId = "") {
    this.setData({ campusLoading: true, campusError: "" });
    try {
      const campusOptions = await getCampuses();
      const campusId = requestedCampusId || this.data.form.campus_id;
      const campusIndex = campusOptions.findIndex((item) => item.id === campusId);
      const selectedCampus = campusIndex >= 0 ? campusOptions[campusIndex] : null;
      this.setData({
        campusOptions,
        campusIndex: Math.max(0, campusIndex),
        campusLoading: false,
        "form.campus_id": selectedCampus ? selectedCampus.id : "",
        campusName: selectedCampus ? selectedCampus.name : ""
      });
    } catch (error) {
      this.setData({ campusLoading: false, campusError: "网点加载失败，请稍后重试" });
    }
  },
  async loadAppointmentHistory() {
    this.setData({ historyLoading: true, historyError: "" });
    try {
      const appointments = (await withParentSession(getParentAppointments)).map((item) => ({
        ...item,
        created_at_label: formatAppointmentTime(item.created_at),
        appointment_at_label: formatBeijingDateTime(item.appointment_at).slice(0, 10),
        can_cancel: item.follow_status === "pending"
      }));
      this.setData({
        appointments,
        historyLoading: false
      });
    } catch (error) {
      this.setData({
        historyLoading: false,
        historyError: error && error.statusCode === 401
          ? "微信登录已失效，点击重新登录"
          : "历史预约加载失败，点击重试"
      });
    }
  },
  updateField(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
    this.revalidateFields([field]);
  },
  selectAge(event) {
    const index = Number(event.detail.value);
    if (Number.isInteger(index) && index >= 0 && index < 30) {
      this.setData({ ageIndex: index, "form.child_age": index + 1 });
      this.revalidateFields(["child_age"]);
    }
  },
  selectGrade(event) {
    const index = Number(event.detail.value);
    if (Number.isInteger(index) && index >= 0 && index < gradeOptions.length) {
      this.setData({ gradeIndex: index, "form.child_grade": gradeOptions[index] });
      this.revalidateFields(["child_grade"]);
    }
  },
  selectCampus(event) {
    const index = Number(event.detail.value);
    const campus = this.data.campusOptions[index];
    if (campus) {
      this.setData({ campusIndex: index, "form.campus_id": campus.id, campusName: campus.name });
      this.revalidateFields(["campus_id"]);
    }
  },
  selectAppointmentDate(event) {
    this.setData({ appointmentDate: event.detail.value });
    this.refreshAppointmentBounds();
    this.revalidateFields(["appointmentDate"]);
  },
  revalidateFields(fields) {
    if (!this.data.validationAttempted) return;
    const errors = validateAppointment(this.data);
    const fieldErrors = { ...this.data.fieldErrors };
    fields.forEach((field) => {
      if (errors[field]) fieldErrors[field] = errors[field];
      else delete fieldErrors[field];
    });
    this.setData({ fieldErrors });
  },
  showFieldErrors(fieldErrors) {
    this.setData({ fieldErrors, validationAttempted: true }, () => {
      const firstField = APPOINTMENT_FIELD_ORDER.find((field) => fieldErrors[field]);
      if (firstField && wx.pageScrollTo) {
        wx.pageScrollTo({ selector: `#field-${firstField}`, offsetTop: -90, duration: 200 });
      }
    });
  },
  callAppointmentCampus(event) {
    const appointment = this.data.appointments.find((item) => item.id === event.currentTarget.dataset.id);
    const phone = String(appointment && appointment.campus_phone || "").trim();
    if (!phone) {
      wx.showToast({ title: "该门店暂未设置联系电话", icon: "none" });
      return;
    }
    wx.makePhoneCall({ phoneNumber: phone });
  },
  async cancelAppointment(event) {
    const appointmentId = event.currentTarget.dataset.id;
    const appointment = this.data.appointments.find((item) => item.id === appointmentId);
    if (!appointment || !appointment.can_cancel) return;
    const confirmed = await new Promise((resolve) => {
      wx.showModal({
        title: "取消预约",
        content: "确定要取消这次到店预约吗？",
        confirmText: "确认取消",
        confirmColor: "#c94f45",
        success: (result) => resolve(Boolean(result.confirm)),
        fail: () => resolve(false)
      });
    });
    if (!confirmed) {
      return;
    }
    try {
      await withParentSession((sessionToken) => cancelParentAppointment(appointmentId, sessionToken));
      wx.showToast({ title: "预约已取消", icon: "success" });
      await this.loadAppointmentHistory();
    } catch (error) {
      wx.showToast({
        title: typeof (error && error.detail) === "string" ? error.detail : "取消失败，请稍后重试",
        icon: "none"
      });
    }
  },
  async submitAppointment() {
    if (this.data.submitting) {
      return;
    }
    this.refreshAppointmentBounds();
    const fieldErrors = validateAppointment(this.data);
    this.showFieldErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      return;
    }
    const appointmentAt = this.data.appointmentDate;
    const payload = { ...this.data.form, appointment_at: appointmentAt };
    this.setData({ submitting: true });
    try {
      await withParentSession((sessionToken) => createLead(payload, sessionToken));
      wx.showToast({ title: "预约成功，服务人员稍后与您联系", icon: "none", duration: 3000 });
      this.setData({
        activeTab: "history",
        fieldErrors: {},
        validationAttempted: false,
        form: {
          name: "",
          phone: "",
          child_name: "",
          child_age: "",
          child_grade: "",
          child_school: "",
          source: "trial",
          campus_id: "",
          course_id: "",
          message: ""
        },
        ageIndex: 0,
        gradeIndex: 0,
        campusIndex: 0,
        appointmentDate: getAppointmentBounds().minAppointmentDate,
        campusName: "",
        courseTitle: ""
      });
      if (wx.pageScrollTo) {
        wx.pageScrollTo({ scrollTop: 0, duration: 200 });
      }
      await this.loadAppointmentHistory();
    } catch (error) {
      const detail = error && error.detail;
      const fields = detail && detail.fields;
      if (fields && typeof fields === "object") {
        const fieldErrors = {};
        for (const field of APPOINTMENT_FIELD_ORDER) {
          if (typeof fields[field] === "string") fieldErrors[field] = fields[field];
        }
        if (typeof fields.appointment_at === "string") {
          fieldErrors.appointmentDate = fields.appointment_at;
        }
        if (Object.keys(fieldErrors).length) {
          this.showFieldErrors(fieldErrors);
          return;
        }
      }
      wx.showToast({
        title: typeof detail === "string" ? detail : "预约提交失败，请稍后重试",
        icon: "none"
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
