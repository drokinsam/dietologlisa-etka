document.addEventListener('DOMContentLoaded', async () => {
    // 1. Инициализация Supabase
    const supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // 2. Обработка формы
    const form = document.getElementById('registrationForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Сохранение...';

        try {
            // 3. Подготовка данных (без created_at, т.к. он автоматический)
            const userData = {
                telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'web_'+Math.random().toString(36).substring(2, 9),
                name: e.target.name.value.trim(),
                weight: parseInt(e.target.weight.value),
                height: parseInt(e.target.height.value)
            };

            // 4. Упрощенный запрос без .select()
            const { error } = await supabase
                .from('users')
                .insert(userData);

            if (error) throw error;
            
            alert('✅ Данные сохранены!');
            e.target.reset();
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`❌ Ошибка: ${error.message}\nПроверьте консоль (F12)`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Зарегистрироваться';
        }
    });
});
