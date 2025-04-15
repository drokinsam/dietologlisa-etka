class DietCoachApp {
    constructor() {
        this.initElements();
        this.initSupabase();
        this.setupEventListeners();
        this.currentUser = null;
    }

    initElements() {
        // Навигация
        this.tabs = document.querySelectorAll('.nav-tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Профиль
        this.profileForm = document.getElementById('profileForm');
        this.nameInput = document.getElementById('name');
        this.weightInput = document.getElementById('weight');
        this.heightInput = document.getElementById('height');
        this.profileError = document.getElementById('profileError');
        
        // Дневник питания
        this.mealForm = document.getElementById('mealForm');
        this.mealsList = document.getElementById('mealsList');
        
        // Чат
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        
        // Статистика
        this.weightChart = null;
    }

    async initSupabase() {
        try {
            this.supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
            this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
            
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase library not loaded');
            }
            
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            
            // Получаем текущего пользователя (из Telegram или создаём нового)
            await this.getCurrentUser();
            
            // Загружаем данные пользователя
            await this.loadUserData();
            
            // Загружаем дневник питания
            await this.loadMeals();
            
            // Загружаем сообщения чата
            await this.loadChatMessages();
            
            // Инициализируем график
            this.initWeightChart();
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Ошибка инициализации приложения');
        }
    }

    setupEventListeners() {
        // Навигация по табам
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Профиль
        this.profileForm.addEventListener('submit', (e) => this.saveProfile(e));
        
        // Дневник питания
        this.mealForm.addEventListener('submit', (e) => this.addMeal(e));
        
        // Чат
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    async getCurrentUser() {
        try {
            // Если в Telegram WebApp - используем данные из Telegram
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            
            if (tgUser) {
                this.currentUser = {
                    id: tgUser.id.toString(),
                    name: tgUser.first_name || 'Пользователь',
                    isTelegram: true
                };
            } else {
                // Для веб-версии создаём временного пользователя
                this.currentUser = {
                    id: 'web_' + Math.random().toString(36).substring(2, 9),
                    name: 'Гость',
                    isTelegram: false
                };
            }
            
            console.log('Текущий пользователь:', this.currentUser);
            
        } catch (error) {
            console.error('Ошибка получения пользователя:', error);
            throw error;
        }
    }

    async loadUserData() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', this.currentUser.id)
                .single();
            
            if (!error && data) {
                this.currentUser = { ...this.currentUser, ...data };
                this.nameInput.value = data.name || '';
                this.weightInput.value = data.weight || '';
                this.heightInput.value = data.height || '';
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    async saveProfile(e) {
        e.preventDefault();
        this.profileError.textContent = '';
        
        try {
            const userData = {
                telegram_id: this.currentUser.id,
                name: this.nameInput.value.trim(),
                weight: parseInt(this.weightInput.value),
                height: parseInt(this.heightInput.value),
                updated_at: new Date().toISOString()
            };
            
            // Сохраняем в Supabase (upsert - обновляем или создаём)
            const { error } = await this.supabase
                .from('users')
                .upsert([userData], { onConflict: 'telegram_id' });
            
            if (error) throw error;
            
            // Обновляем текущего пользователя
            this.currentUser = { ...this.currentUser, ...userData };
            
            // Показываем уведомление
            this.showNotification('Данные успешно сохранены!');
            
            // Обновляем график
            this.initWeightChart();
            
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            this.profileError.textContent = `Ошибка: ${error.message}`;
        }
    }

    async loadMeals() {
        try {
            const { data, error } = await this.supabase
                .from('meals')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.renderMeals(data || []);
            
        } catch (error) {
            console.error('Ошибка загрузки дневника:', error);
        }
    }

    async addMeal(e) {
        e.preventDefault();
        
        try {
            const mealData = {
                user_id: this.currentUser.id,
                meal_type: document.getElementById('mealType').value,
                description: document.getElementById('mealDescription').value.trim(),
                created_at: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from('meals')
                .insert([mealData]);
            
            if (error) throw error;
            
            // Очищаем форму
            this.mealForm.reset();
            
            // Обновляем список
            await this.loadMeals();
            
            this.showNotification('Приём пищи добавлен!');
            
        } catch (error) {
            console.error('Ошибка добавления:', error);
            this.showNotification('Ошибка при добавлении', 'error');
        }
    }

    renderMeals(meals) {
        this.mealsList.innerHTML = '';
        
        if (meals.length === 0) {
            this.mealsList.innerHTML = '<p>У вас пока нет записей</p>';
            return;
        }
        
        meals.forEach(meal => {
            const mealCard = document.createElement('div');
            mealCard.className = 'meal-card';
            
            const mealType = {
                breakfast: 'Завтрак',
                lunch: 'Обед',
                dinner: 'Ужин',
                snack: 'Перекус'
            }[meal.meal_type] || meal.meal_type;
            
            const date = new Date(meal.created_at).toLocaleString();
            
            mealCard.innerHTML = `
                <h3>${mealType} <small>${date}</small></h3>
                <p>${meal.description}</p>
            `;
            
            this.mealsList.appendChild(mealCard);
        });
    }

    async loadChatMessages() {
        try {
            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${this.currentUser.id},receiver_id.eq.${this.currentUser.id}`)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            this.renderChatMessages(data || []);
            
        } catch (error) {
            console.error('Ошибка загрузки чата:', error);
        }
    }

    renderChatMessages(messages) {
        this.chatMessages.innerHTML = '';
        
        messages.forEach(msg => {
            const isCurrentUser = msg.sender_id === this.currentUser.id;
            const messageDiv = document.createElement('div');
            messageDiv.style.textAlign = isCurrentUser ? 'right' : 'left';
            messageDiv.style.margin = '5px';
            messageDiv.style.padding = '8px';
            messageDiv.style.backgroundColor = isCurrentUser ? '#e3f2fd' : '#f1f1f1';
            messageDiv.style.borderRadius = '10px';
            messageDiv.style.display = 'inline-block';
            messageDiv.style.maxWidth = '70%';
            
            messageDiv.innerHTML = `
                <div><strong>${isCurrentUser ? 'Вы' : 'Диетолог'}</strong></div>
                <div>${msg.text}</div>
                <div style="font-size: 0.8em; color: #666;">${new Date(msg.created_at).toLocaleTimeString()}</div>
            `;
            
            this.chatMessages.appendChild(messageDiv);
        });
        
        // Прокручиваем вниз
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;
        
        try {
            const messageData = {
                sender_id: this.currentUser.id,
                receiver_id: 'dietitian', // ID диетолога
                text: text,
                created_at: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from('messages')
                .insert([messageData]);
            
            if (error) throw error;
            
            // Очищаем поле ввода
            this.messageInput.value = '';
            
            // Обновляем чат
            await this.loadChatMessages();
            
        } catch (error) {
            console.error('Ошибка отправки:', error);
            this.showNotification('Ошибка отправки сообщения', 'error');
        }
    }

    initWeightChart() {
        // В реальном приложении нужно загружать историю веса из Supabase
        const ctx = document.getElementById('weightChart').getContext('2d');
        
        if (this.weightChart) {
            this.weightChart.destroy();
        }
        
        // Пример данных (в реальном приложении загружайте из базы)
        const weightData = [
            { date: '2023-01-01', weight: 85 },
            { date: '2023-02-01', weight: 83 },
            { date: '2023-03-01', weight: 81 },
            { date: '2023-04-01', weight: 80 },
            { date: '2023-05-01', weight: 78 }
        ];
        
        this.weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weightData.map(item => item.date),
                datasets: [{
                    label: 'Ваш вес (кг)',
                    data: weightData.map(item => item.weight),
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    switchTab(tabId) {
        // Переключаем активные табы
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        
        // При переключении на статистику обновляем график
        if (tabId === 'stats') {
            this.initWeightChart();
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.backgroundColor = type === 'success' ? '#2e7d32' : '#d32f2f';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.right = '0';
        errorDiv.style.padding = '15px';
        errorDiv.style.backgroundColor = '#d32f2f';
        errorDiv.style.color = 'white';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.zIndex = '1000';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new DietCoachApp();
});
