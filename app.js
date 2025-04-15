// Функция для безопасного создания клиента Supabase
const initializeSupabase = async () => {
  try {
    // Проверяем, загружена ли библиотека Supabase
    if (typeof supabase === 'undefined') {
      throw new Error('Supabase library not loaded');
    }

    const supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
    
    return supabase.createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Supabase initialization failed:', error);
    throw error;
  }
};

// Функция для проверки структуры таблицы
const checkTableStructure = async (supabaseClient) => {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .limit(0); // Запрос без реальных данных
    
    if (error) throw error;
    
    console.log('Table structure verified');
    return true;
  } catch (error) {
    console.error('Table verification failed:', error);
    throw new Error('Table structure check failed: ' + error.message);
  }
};

// Основная функция приложения
const initializeApp = async () => {
  try {
    // 1. Инициализация Supabase
    const supabaseClient = await initializeSupabase();
    
    // 2. Проверка структуры таблицы
    await checkTableStructure(supabaseClient);
    
    // 3. Получаем форму
    const form = document.getElementById('registrationForm');
    if (!form) {
      throw new Error('Registration form not found');
    }

    // 4. Обработчик отправки формы
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = e.target.querySelector('button[type="submit"]');
      try {
        // Блокируем кнопку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Сохранение...';

        // Подготовка данных
        const userData = {
          telegram_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'web_' + Math.random().toString(36).substring(2, 9),
          name: e.target.name.value.trim(),
          weight: parseInt(e.target.weight.value),
          height: parseInt(e.target.height.value),
          created_at: new Date().toISOString()
        };

        console.log('Submitting data:', userData);

        // Отправка данных
        const { error } = await supabaseClient
          .from('users')
          .insert([userData], { returning: 'minimal' });

        if (error) throw error;
        
        // Успешное завершение
        alert('✅ Данные успешно сохранены!');
        form.reset();
      } catch (error) {
        console.error('Submission error:', error);
        alert(`❌ Ошибка: ${error.message}`);
      } finally {
        // Разблокируем кнопку в любом случае
        submitBtn.disabled = false;
        submitBtn.textContent = 'Зарегистрироваться';
      }
    });

    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Application initialization failed:', error);
    alert('⚠️ Ошибка при загрузке приложения: ' + error.message);
  }
};

// Запускаем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', initializeApp);
