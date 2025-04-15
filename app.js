document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Supabase
    const supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Блокируем кнопку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка данных...';

        try {
            // Подготовка данных
            const userData = {
                telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'web_'+Math.random().toString(36).substring(2),
                name: form.name.value.trim(),
                weight: parseInt(form.weight.value),
                height: parseInt(form.height.value),
                created_at: new Date().toISOString()
            };

            console.log('Отправляемые данные:', userData);

            // Отправка в Supabase
            const { error } = await supabase
                .from('users')
                .insert([userData], { returning: 'minimal' });

            if (error) throw error;

            alert('✅ Регистрация успешно завершена!');
            form.reset();
            
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert(`❌ Ошибка: ${error.message}\nПопробуйте еще раз или обратитесь в поддержку`);
        } finally {
            // Разблокируем кнопку
            submitBtn.disabled = false;
            submitBtn.textContent = 'Зарегистрироваться';
        }
    });

    // Проверка подключения к Supabase
    (async () => {
        try {
            const { error } = await supabase
                .from('users')
                .select('*')
                .limit(1);
            
            if (error) throw error;
            console.log('Подключение к Supabase успешно');
        } catch (error) {
            console.error('Ошибка подключения к Supabase:', error);
            alert('Ошибка подключения к базе данных');
        }
    })();
});
