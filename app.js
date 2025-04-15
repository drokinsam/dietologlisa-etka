class DietCoachApp {
    constructor() {
        // 1. Сначала инициализируем все свойства
        this.currentUser = {
            id: 'web_' + Math.random().toString(36).substring(2, 9),
            name: 'Гость',
            isTelegram: false
        };
        this.supabase = null;
        this.weightChart = null;
        
        // 2. Инициализация элементов
        this.tabs = null;
        this.tabContents = null;
        this.profileForm = null;
        this.nameInput = null;
        this.weightInput = null;
        this.heightInput = null;
        this.profileError = null;
        this.mealForm = null;
        this.mealsList = null;
        this.chatMessages = null;
        this.messageInput = null;
        
        // 3. Вызываем методы инициализации
        this.initElements();
        this.setupEventListeners();
        this.initApp();
    }

    initElements = () => {
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
    };

    setupEventListeners = () => {
        // Навигация
        if (this.tabs) {
            this.tabs.forEach(tab => {
                tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
            });
        }
        
        // Профиль
        if (this.profileForm) {
            this.profileForm.addEventListener('submit', (e) => this.saveProfile(e));
        }
        
        // Дневник питания
        if (this.mealForm) {
            this.mealForm.addEventListener('submit', (e) => this.addMeal(e));
        }
        
        // Чат
        const sendBtn = document.getElementById('sendMessage');
        if (sendBtn && this.messageInput) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    };

    initApp = async () => {
        try {
            await this.initSupabase();
            await this.checkTelegramUser();
            await this.loadUserData();
            await this.loadAdditionalData();
            console.log('Приложение инициализировано');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения');
        }
    };

    initSupabase = async () => {
        try {
            this.supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
            this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
            
            if (typeof supabase === 'undefined') {
                throw new Error('Библиотека Supabase не загружена');
            }
            
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        } catch (error) {
            console.error('Ошибка инициализации Supabase:', error);
            throw error;
        }
    };

    // ... остальные методы остаются без изменений ...
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new DietCoachApp();
});
