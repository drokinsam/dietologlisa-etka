// 1. Сначала загружаем библиотеку Supabase
const loadSupabase = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@supabase/supabase-js@2';
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

// 2. Основная функция приложения
const initApp = async () => {
  try {
    // Ждем загрузки Supabase
    await loadSupabase();
    
    // Инициализируем клиент
    const supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Обработка формы
    const form = document.getElementById('registrationForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Сохранение...';

      try {
        const userData = {
          telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'web_'+Math.random().toString(36).substring(2, 9),
          name: form.name.value.trim(),
          weight: parseInt(form.weight.value),
          height: parseInt(form.height.value)
        };

        const { error } = await supabase
          .from('users')
          .insert([userData], { returning: 'minimal' });

        if (error) throw error;
        
        alert('✅ Данные сохранены!');
        form.reset();
      } catch (error) {
        console.error('Ошибка:', error);
        alert(`❌ Ошибка: ${error.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Зарегистрироваться';
      }
    });

  } catch (error) {
    console.error('Ошибка инициализации:', error);
    alert('Произошла ошибка при загрузке приложения');
  }
};

// Запускаем приложение после загрузки страницы
document.addEventListener('DOMContentLoaded', initApp);
