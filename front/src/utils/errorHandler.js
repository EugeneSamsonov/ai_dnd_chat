import { toast } from 'react-toastify';

export const handleApiError = (error) => {
  if (!error.response) {
    toast.error("Нет соединения с сервером. Проверьте сеть или CORS.");
    return;
  }

  const status = error.response.status;
  const data = error.response.data;

  // 2. Обработка по статус-кодам (401, 404, 403, 500)
  if (status === 401) {
    toast.error("Сессия истекла. Войдите заново.", { toastId: "auth-401" });
    return;
  }
  
  if (status === 404) {
    toast.error("Ресурс не найден (404).", { toastId: "not-found" });
    return;
  }

  if (status === 403) {
    toast.error("У вас недостаточно прав для этого действия.");
    return;
  }

  if (status >= 500) {
    toast.error("Ошибка на стороне сервера (500). Попробуйте позже.");
    return;
  }

  // 3. Обработка ошибок валидации (400 Bad Request)
  if (data && typeof data === 'object') {
    let allErrors = [];

    Object.keys(data).forEach((key) => {
      const val = data[key];
      const message = Array.isArray(val) ? val.join(", ") : val;
      
      if (key === 'detail' || key === 'non_field_errors') {
        allErrors.push(message);
      } else {
        allErrors.push(`${key}: ${message}`);
      }
    });

    allErrors.slice(0, 3).forEach((msg) => {
      toast.error(msg);
    });

    if (allErrors.length > 3) {
      toast.info(`И еще ${allErrors.length - 3} ошибки...`);
    }
  } else {
    toast.error("Произошла непредвиденная ошибка.");
  }
};
