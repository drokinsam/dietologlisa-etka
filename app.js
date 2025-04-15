class DietCoachApp {
    constructor() {
        this.initElements();
        this.setupEventListeners();
        this.currentUser = null;
        this.initApp();
    }

    async initApp() {
        try {
            await this.initSupabase();
            await this.getCurrentUser();
            await this.loadUserData();
            await this.loadMeals();
            await this.loadChatMessages();
            this.initWeightChart();
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('Ошибка загрузки приложения');
        }
    }

    initElements() {
        this.tabs = document.querySelectorAll('.nav-tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.profileForm = document.getElementById('profileForm');
        this.nameInput = document.getElementById('name');
        this.weightInput = document.getElementById('weight');
        this.heightInput = document.getElementById('height');
        this.profileError = document.getElementById('profileError');
        this.mealForm = document.getElementById('mealForm');
        this.mealsList = document.getElementById('mealsList');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
    }

    async initSupabase() {
        try {
            this.supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
            this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
            
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase library not loaded');
            }
            
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase initialized');
        } catch (error) {
            console.error('Supabase init error:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            
            this.currentUser = {
                id: tgUser?.id?.toString() || 'web_' + Math.random().toString(36).substring(2, 9),
                name: tgUser?.first_name || 'Гость',
                isTelegram: !!tgUser
            };
            
            console.log('Current user:', this.currentUser);
            return this.currentUser;
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    }

    async loadUserData() {
        if (!this.currentUser?.id) {
            console.warn('No user ID, skipping profile load');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', this.currentUser.id)
                .maybeSingle();
            
            if (error) throw error;
            
            if (data) {
                this.currentUser = { ...this.currentUser, ...data };
                this.nameInput.value = data.name || '';
                this.weightInput.value = data.weight || '';
                this.heightInput.value = data.height || '';
            }
        } catch (error) {
            console.error('Load user data error:', error);
            throw error;
        }
    }

    async loadMeals() {
        if (!this.currentUser?.id) {
            console.warn('No user ID, skipping meals load');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('meals')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.renderMeals(data || []);
        } catch (error) {
            console.error('Load meals error:', error);
            throw error;
        }
    }

    async loadChatMessages() {
        if (!this.currentUser?.id) {
            console.warn('No user ID, skipping chat load');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${this.currentUser.id},receiver_id.eq.${this.currentUser.id}`)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            this.renderChatMessages(data || []);
        } catch (error) {
            console.error('Load chat error:', error);
            throw error;
        }
    }

    async saveProfile(e) {
        e.preventDefault();
        this.profileError.textContent = '';
        
        try {
            if (!this.currentUser?.id) {
                throw new Error('User not initialized');
            }

            const userData = {
                telegram_id: this.currentUser.id,
                name: this.nameInput.value.trim(),
                weight: parseInt(this.weightInput.value) || null,
                height: parseInt(this.heightInput.value) || null,
                updated_at: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from('users')
                .upsert([userData], { onConflict: 'telegram_id' });
            
            if (error) throw error;
            
            this.currentUser = { ...this.currentUser, ...userData };
            this.showNotification('Данные сохранены!');
            this.initWeightChart();
            
        } catch (error) {
            console.error('Save profile error:', error);
            this.profileError.textContent = `Ошибка: ${error.message}`;
        }
    }

    async addMeal(e) {
        e.preventDefault();
        
        try {
            if (!this.currentUser?.id) {
                throw new Error('User not initialized');
            }

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
            
            this.mealForm.reset();
            await this.loadMeals();
            this.showNotification('Приём пищи добавлен!');
            
        } catch (error) {
            console.error('Add meal error:', error);
            this.showNotification('Ошибка при добавлении', 'error');
        }
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || !this.currentUser?.id) return;
        
        try {
            const messageData = {
                sender_id: this.currentUser.id,
                receiver_id: 'dietitian',
                text: text,
                created_at: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from('messages')
                .insert([messageData]);
            
            if (error) throw error;
            
            this.messageInput.value = '';
            await this.loadChatMessages();
            
        } catch (error) {
            console.error('Send message error:', error);
            this.showNotification('Ошибка отправки сообщения', 'error');
        }
    }

    renderMeals(meals) {
        this.mealsList.innerHTML = meals.length ? '' : '<p>У вас пока нет записей</p>';
        
        meals.forEach(meal => {
            const mealCard = document.createElement('div');
            mealCard.className = 'meal-card';
            mealCard.innerHTML = `
                <h3>${this.getMealTypeName(meal.meal_type)} <small>${new Date(meal.created_at).toLocaleString()}</small></h3>
                <p>${meal.description}</p>
            `;
            this.mealsList.appendChild(mealCard);
        });
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
        
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    initWeightChart() {
        const ctx = document.getElementById('weightChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.weightChart) {
            this.weightChart.destroy();
        }
        
        // Пример данных (замените реальными данными из Supabase)
        const weightData = this.currentUser?.weight ? [
            { date: new Date(Date.now() - 12096e5).toISOString().split('T')[0], weight: this.currentUser.weight + 3 },
            { date: new Date(Date.now() - 6048e5).toISOString().split('T')[0], weight: this.currentUser.weight + 1 },
            { date: new Date().toISOString().split('T')[0], weight: this.currentUser.weight }
        ] : [];
        
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

    getMealTypeName(type) {
        const types = {
            breakfast: 'Завтрак',
            lunch: 'Обед',
            dinner: 'Ужин',
            snack: 'Перекус'
        };
        return types[type] || type;
    }

    switchTab(tabId) {
        this.tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabId));
        this.tabContents.forEach(content => content.classList.toggle('active', content.id === tabId));
        
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
        setTimeout(() => notification.remove(), 3000);
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
        setTimeout(() => errorDiv.remove(), 5000);
    }

    setupEventListeners() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        this.profileForm?.addEventListener('submit', (e) => this.saveProfile(e));
        this.mealForm?.addEventListener('submit', (e) => this.addMeal(e));
        
        const sendBtn = document.getElementById('sendMessage');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            this.messageInput?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DietCoachApp();
});
