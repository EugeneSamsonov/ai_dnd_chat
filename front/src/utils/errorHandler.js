import { toast } from "react-toastify";

export const handleApiError = (e) => {
  const errors = e.response?.data;
  if (errors) {
    Object.keys(errors).forEach((key) => {
      try {
        toast.error(`${key}: ${errors[key].join(", ")}`);
      } catch (e) {
        toast.error(`${key}: ${errors[key]}`);
      }
    });
  } else {
    toast.error("Что-то пошло не так на сервере");
  }
};
