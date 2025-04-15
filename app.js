// Настройка Supabase
const supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Обработка формы регистрации
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        telegram_id: window.Telegram.WebApp.initDataUnsafe.user?.id || 'unknown',
        name: document.getElementById('name').value,
        weight: document.getElementById('weight').value,
        height: document.getElementById('height').value
    };
    
    // Сохраняем в базу
    const { error } = await supabase
        .from('users')
        .insert([userData]);
    
    if (error) {
        alert('Ошибка: ' + error.message);
    } else {
        alert('Данные сохранены!');
    }
});
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('name').value,
        weight: document.getElementById('weight').value,
        height: document.getElementById('height').value
    };
    
    // Пока просто выводим данные в консоль
    console.log(userData);
    
    // В будущем здесь будет сохранение в базу данных
    alert('Данные сохранены!');
});
