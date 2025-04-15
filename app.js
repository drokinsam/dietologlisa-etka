document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Инициализация Supabase
        const supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

        // 2. Проверка подключения
        const { error: testError } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (testError) throw testError;

        // Добавьте перед обработчиком формы
const { data: columns, error: colsError } = await supabase
    .rpc('get_columns', { table_name: 'users' });
console.log('Структура таблицы:', columns, colsError);

        // 3. Обработка формы
        const form = document.getElementById('registrationForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Сохранение...';

            try {
                // 4. Подготовка данных
                const userData = {
                    telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'web_'+Math.random().toString(36).substring(2, 9),
                    name: e.target.name.value.trim(),
                    weight: parseInt(e.target.weight.value),
                    height: parseInt(e.target.height.value)
                };

                console.log('Отправляемые данные:', userData);

                // 5. Отправка данных (упрощенный вариант)
                const { error } = await supabase
                    .from('users')
                    .insert([userData], { returning: 'minimal' });

                if (error) throw error;
                
                alert('✅ Данные успешно сохранены!');
                e.target.reset();
                
            } catch (error) {
                console.error('Ошибка сохранения:', error);
                alert(`❌ Ошибка: ${error.message}\nПроверьте консоль (F12)`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Зарегистрироваться';
            }
        });

    } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert('⚠️ Произошла ошибка при загрузке приложения');
    }
});
