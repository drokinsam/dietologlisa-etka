document.addEventListener('DOMContentLoaded', async () => {
    // Элементы интерфейса
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    // Проверяем, что все элементы существуют
    if (!form || !submitBtn || !errorMessage) {
        console.error('Не найдены необходимые элементы на странице');
        return;
    }

    // Инициализация Supabase
    const initSupabase = () => {
        try {
            const supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
            
            if (typeof supabase === 'undefined') {
                throw new Error('Библиотека Supabase не загружена');
            }
            
            return supabase.createClient(supabaseUrl, supabaseKey);
        } catch (error) {
            console.error('Ошибка инициализации Supabase:', error);
            throw error;
        }
    };

    // Проверка подключения к Supabase
    const testSupabaseConnection = async (client) => {
        try {
            const { error } = await client
                .from('users')
                .select('*')
                .limit(1);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Ошибка подключения к Supabase:', error);
            throw error;
        }
    };

    // Основной код приложения
    try {
        // Инициализируем клиент
        const supabaseClient = initSupabase();
        
        // Проверяем подключение
        await testSupabaseConnection(supabaseClient);
        console.log('Supabase подключен успешно');

        // Обработчик отправки формы
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.textContent = '';
            
            // Блокируем кнопку
            submitBtn.disabled = true;
            submitBtn.textContent = 'Сохранение...';

            try {
                // Подготовка данных
                const userData = {
                    telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'web_' + Math.random().toString(36).substring(2, 9),
                    name: form.name.value.trim(),
                    weight: parseInt(form.weight.value),
                    height: parseInt(form.height.value),
                    created_at: new Date().toISOString()
                };

                console.log('Отправка данных:', userData);

                // Отправка данных
                const { error } = await supabaseClient
                    .from('users')
                    .insert([userData]);

                if (error) throw error;
                
                // Успешное завершение
                alert('✅ Данные успешно сохранены!');
                form.reset();
            } catch (error) {
                console.error('Ошибка сохранения:', error);
                errorMessage.textContent = `Ошибка: ${error.message}`;
            } finally {
                // Разблокируем кнопку
                submitBtn.disabled = false;
                submitBtn.textContent = 'Зарегистрироваться';
            }
        });
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        errorMessage.textContent = 'Произошла ошибка при загрузке приложения. Пожалуйста, обновите страницу.';
    }
});
