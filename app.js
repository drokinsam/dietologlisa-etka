class DietCoachApp {
    constructor() {
        // Инициализируем свойства
        this.currentUser = {
            id: 'web_' + Math.random().toString(36).substring(2, 9),
            name: 'Гость',
            isTelegram: false
        };
        
        this.supabase = null;
        this.weightChart = null;
        
        // Инициализация элементов и приложения
        this.initElements();
        this.setupEventListeners();
        this.initApp();
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
    }

    setupEventListeners() {
        // Навигация
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Профиль
        if (this.profileForm) {
            this.profileForm.addEventListener('submit', (e) => this.saveProfile(e));
        }
        
        // Дневник питания
        if (this.mealForm) {
            this.mealForm.addEventListener('submit', (e) => this.addMeal(e));
        }
        
        // Чат
        if (this.messageInput) {
            document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }

    async initApp() {
        try {
            await this.initSupabase();
            await this.checkTelegramUser();
            await this.loadUserData();
            await this.loadAdditionalData();
            console.log('Приложение успешно инициализировано');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения');
        }
    }

    async initSupabase() {
        try {
            this.supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
            this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
            
            if (typeof supabase === 'undefined') {
                throw new Error('Библиотека Supabase не загружена');
            }
            
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации Supabase:', error);
            throw error;
        }
    }

    async checkTelegramUser() {
        try {
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            if (tgUser) {
                this.currentUser = {
                    id: tgUser.id.toString(),
                    name: tgUser.first_name || 'Пользователь',
                    isTelegram: true
                };
                console.log('Обнаружен пользователь Telegram:', this.currentUser);
            }
        } catch (error) {
            console.error('Ошибка проверки пользователя Telegram:', error);
            throw error;
        }
    }

    async loadUserData() {
        if (!this.currentUser?.id) {
            console.warn('Нет ID пользователя, пропускаем загрузку данных');
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
                if (this.nameInput) this.nameInput.value = data.name || '';
                if (this.weightInput) this.weightInput.value = data.weight || '';
                if (this.heightInput) this.heightInput.value = data.height || '';
                console.log('Данные пользователя загружены:', data);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            throw error;
        }
    }

    async loadAdditionalData() {
        try {
            await Promise.all([
                this.loadMeals(),
                this.loadChatMessages()
            ]);
            this.initWeightChart();
        } catch (error) {
            console.error('Ошибка загрузки дополнительных данных:', error);
            throw error;
        }
    }

    async loadMeals() {
        if (!this.currentUser?.id) {
            console.warn('Нет ID пользователя, пропускаем загрузку дневника');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('meals')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                if (error.code === '42P01') { // Таблица не существует
                    console.warn('Таблица meals не существует');
                    return;
                }
                throw error;
            }
            
            this.renderMeals(data || []);
        } catch (error) {
            console.error('Ошибка загрузки дневника питания:', error);
            throw error;
        }
    }

    renderMeals(meals) {
        if (!this.mealsList) return;
        
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

    getMealTypeName(type) {
        const types = {
            breakfast: 'Завтрак',
            lunch: 'Обед',
            dinner: 'Ужин',
            snack: 'Перекус'
        };
        return types[type] || type;
    }

    // ... (остальные методы остаются без изменений)
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new DietCoachApp();
});
