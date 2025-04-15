// Инициализация Supabase с защитой ключей
const initSupabase = () => {
    const supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
    return supabase.createClient(supabaseUrl, supabaseKey);
};

// Главная функция приложения
const initApp = () => {
    const supabase = initSupabase();
    const registrationForm = document.getElementById('registrationForm');
    
    if (!registrationForm) {
        console.error('Форма регистрации не найдена!');
        return;
    }

    // Обработчик отправки формы (без дублирования)
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Показываем индикатор загрузки
            const submitButton = registrationForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Сохранение...';
            
            // Собираем данные
            const userData = {
                telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'unknown',
                name: document.getElementById('name').value.trim(),
                weight: parseInt(document.getElementById('weight').value),
                height: parseInt(document.getElementById('height').value),
                created_at: new Date().toISOString()
            };

            console.log('Отправка данных:', userData);
            
            // Отправка в Supabase
            const { data, error } = await supabase
                .from('users')
                .insert([userData])
                .select();

            if (error) throw error;
            
            alert(`Данные сохранены! ID: ${data[0].id}`);
            console.log('Успешный ответ:', data);
            
            // Очистка формы после успешного сохранения
            registrationForm.reset();
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Ошибка сохранения: ${error.message}`);
        } finally {
            // Восстанавливаем кнопку
            const submitButton = registrationForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Продолжить';
        }
    });
};

// Запуск приложения после загрузки страницы
document.addEventListener('DOMContentLoaded', initApp);
