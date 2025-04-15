// 1. Сначала дожидаемся загрузки страницы И библиотеки Supabase
document.addEventListener('DOMContentLoaded', async () => {
    // 2. Проверяем загрузился ли Supabase
    if (typeof supabase === 'undefined') {
        console.error('Supabase не загружен!');
        return;
    }

    try {
        // 3. Инициализируем клиент Supabase
        const supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

        // 4. Получаем форму
        const form = document.getElementById('registrationForm');
        if (!form) {
            throw new Error('Форма регистрации не найдена!');
        }

        // 5. Обработчик отправки формы
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Сохранение...';

            try {
                const userData = {
                    telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'unknown',
                    name: e.target.name.value.trim(),
                    weight: parseInt(e.target.weight.value),
                    height: parseInt(e.target.height.value),
                    created_at: new Date().toISOString()
                };

                const { data, error } = await supabaseClient
                    .from('users')
                    .insert([userData])
                    .select();

                if (error) throw error;

                alert(`Данные сохранены! ID: ${data[0].id}`);
                e.target.reset();
            } catch (err) {
                console.error('Ошибка:', err);
                alert(`Ошибка: ${err.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Продолжить';
            }
        });

    } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert('Произошла ошибка при загрузке приложения');
    }
});
