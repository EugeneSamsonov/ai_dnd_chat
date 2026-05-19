import logging
import ollama
from ollama import ResponseError

# Настраиваем логирование, чтобы видеть ошибки в терминале Django
logger = logging.getLogger(__name__)

class OllamaService:
    # MODEL = "llama3"
    # MODEL = "phi3.5"
    MODEL = "qwen2.5:1.5b"
    # MODEL = "llama3.2:1b"

    @classmethod
    def generate_suggestion(cls, prompt, context_text=""):
        system_prompt = (
            "Ты — ассистент игрока в настольной ролевой игре. "
            "На основе контекста чата предложи вариант текста для следующего сообщения игрока. "
            "Пиши только текст сообщения, без комментариев и кавычек."
        )
        
        full_prompt = f"{system_prompt}\n\nКонтекст игры:\n{context_text}\n\nЗапрос пользователя: {prompt}"
        
        try:
            # Устанавливаем таймаут, чтобы Django не зависал, если модель "задохнулась"
            # Для генерации текста локально 60-90 секунд — это разумный предел
            response = ollama.generate(
                model=cls.MODEL,
                prompt=full_prompt,
                options={
                    "temperature": 0.7,
                    # "num_predict": 150 # Ограничиваем длину ответа, чтобы снизить нагрузку
                }
            )
            return response.get("response", "")

        except ResponseError as e:
            # Ошибка самого сервера Ollama (например, модель не скачана или упал контекст)
            logger.error(f"Ollama ResponseError [Код {e.status_code}]: {e.error}")
            if e.status_code == 404:
                return f"Ошибка ИИ: Модель '{cls.MODEL}' не найдена. Запустите 'ollama run {cls.MODEL}' в терминале."
            return f"Ollama вернул ошибку: {e.error}"

        except ConnectionError:
            # Сервер Ollama вообще не запущен или выключен
            logger.error("Не удалось подключиться к Ollama. Проверьте, запущен ли сервис.")
            return "Ошибка ИИ: Сервер Ollama недоступен. Проверьте запуск приложения Ollama."

        except TimeoutError:
            # Модель "задохнулась" — видеокарта/процессор не справляются по времени
            logger.error(f"Превышено время ожидания ответа от модели {cls.MODEL}. Компьютер перегружен.")
            return "Ошибка ИИ: Модель слишком долго думала и сбросила запрос. Попробуйте модель полегче (например, Qwen или Mistral)."

        except Exception as e:
            # Любая другая непредвиденная ошибка (например, нехватка ОЗУ)
            logger.exception(f"Непредвиденная ошибка при работе с Ollama: {str(e)}")
            return f"Ошибка ИИ: Произошел сбой системы генерации ({type(e).__name__})."
