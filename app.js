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
