import Swal from "sweetalert2";

const SWAL_DEFAULTS = {
  background: "#1a1d29",
  color: "#fff",
  confirmButtonColor: "#5271ff",
};

export function showError(text, title) {
  return Swal.fire({ icon: "error", title, text, ...SWAL_DEFAULTS });
}

export function showSuccess(text, title) {
  return Swal.fire({ icon: "success", title, text, ...SWAL_DEFAULTS });
}

export function showWarning(text, title) {
  return Swal.fire({ icon: "warning", title, text, ...SWAL_DEFAULTS });
}
