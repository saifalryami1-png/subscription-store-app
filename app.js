// حفظ البيانات في LocalStorage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const subscriptions = [
    {
        id: 1,
        name: 'اشتراك أساسي',
        price: 29,
        duration: 'شهري',
        features: ['5 مشاريع', 'دعم أساسي', '1GB تخزين']
    },
    {
        id: 2,
        name: 'اشتراك احترافي',
        price: 79,
        duration: 'شهري',
        features: ['25 مشروع', 'دعم أولوي', '50GB تخزين', 'تحليلات متقدمة']
    },
    {
        id: 3,
        name: 'اشتراك فريق',
        price: 199,
        duration: 'شهري',
        features: ['مشاريع غير محدودة', 'دعم 24/7', '500GB تخزين', 'API كامل', '5 أعضاء فريق']
    },
    {
        id: 4,
        name: 'اشتراك سنوي',
        price: 290,
        duration: 'سنوي',
        features: ['خصم 30%', 'مشاريع غير محدودة', 'دعم أولوي', '1TB تخزين']
    }
];

// تهيئة الصفحة
window.addEventListener('load', () => {
    updateUI();
    renderSubscriptions();
});

// تحديث واجهة المستخدم
function updateUI() {
    const logoutBtn = document.getElementById('logoutBtn');
    const usernameSpan = document.getElementById('username');
    
    if (currentUser) {
        usernameSpan.textContent = currentUser.username;
        logoutBtn.style.display = 'inline-block';
        showPage('storePage');
        renderMySubscriptions();
    } else {
        usernameSpan.textContent = 'ضيف';
        logoutBtn.style.display = 'none';
        showPage('loginPage');
    }
}

// التنقل بين الصفحات
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// تسجيل الدخول
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        updateUI();
    } else {
        alert('بيانات الدخول غير صحيحة');
    }
}

// إنشاء حساب
function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();
    
    if (!username || !email || !password || !confirmPassword) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('كلمات المرور غير متطابقة');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        alert('اسم المستخدم موجود بالفعل');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        subscriptions: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirmPassword').value = '';
    
    updateUI();
    alert('تم إنشاء الحساب بنجاح!');
}

// تسجيل الخروج
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    cart = [];
    localStorage.removeItem('cart');
    updateUI();
}

// الانتقال إلى صفحة التسجيل
function goToSignup() {
    showPage('signupPage');
}

function goToLogin() {
    showPage('loginPage');
}

// عرض الاشتراكات
function renderSubscriptions(filter = 'all') {
    const grid = document.getElementById('subscriptionsGrid');
    grid.innerHTML = '';
    
    let filtered = subscriptions;
    
    if (filter === 'purchased' && currentUser) {
        filtered = subscriptions.filter(s => currentUser.subscriptions.some(sub => sub.id === s.id));
    }
    
    filtered.forEach(sub => {
        const isPurchased = currentUser && currentUser.subscriptions.some(s => s.id === sub.id);
        const isInCart = cart.some(c => c.id === sub.id);
        
        const card = document.createElement('div');
        card.className = 'subscription-card';
        card.innerHTML = `
            <h3>${sub.name}</h3>
            <div class="price">${sub.price} ريال</div>
            <div class="duration">${sub.duration}</div>
            <ul class="features">
                ${sub.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            ${isPurchased ? 
                `<button class="purchased" disabled>✓ مشترك</button>` :
                `<button onclick="addToCart(${sub.id})" ${isInCart ? 'disabled' : ''}>
                    ${isInCart ? 'في السلة' : 'أضف للسلة'}
                </button>`
            }
        `;
        grid.appendChild(card);
    });
}

// تصفية الاشتراكات
function filterSubscriptions(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderSubscriptions(filter);
}

// إضافة للسلة
function addToCart(id) {
    const subscription = subscriptions.find(s => s.id === id);
    if (!cart.find(c => c.id === id)) {
        cart.push(subscription);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        renderSubscriptions();
    }
}

// إزالة من السلة
function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    renderSubscriptions();
}

// تحديث السلة
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center;color:#999;">السلة فارغة</p>';
        totalPrice.textContent = '0';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} ريال</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">حذف</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalPrice.textContent = total;
}

// الانتقال لصفحة الدفع
function checkout() {
    if (cart.length === 0) {
        alert('السلة فارغة');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('checkoutTotal').textContent = total;
    showPage('checkoutPage');
}

// معالجة الدفع
function processPayment() {
    const cardName = document.getElementById('cardName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCVV = document.getElementById('cardCVV').value.trim();
    
    if (!cardName || !cardNumber || !cardExpiry || !cardCVV) {
        alert('الرجاء ملء جميع بيانات البطاقة');
        return;
    }
    
    if (cardNumber.length !== 16) {
        alert('رقم البطاقة يجب أن يكون 16 رقم');
        return;
    }
    
    if (cardCVV.length !== 3) {
        alert('CVV يجب أن يكون 3 أرقام');
        return;
    }
    
    // إضافة الاشتراكات للمستخدم
    if (currentUser) {
        cart.forEach(item => {
            if (!currentUser.subscriptions.find(s => s.id === item.id)) {
                currentUser.subscriptions.push({
                    id: item.id,
                    purchasedAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                });
            }
        });
        
        // تحديث المستخدم
        const index = users.findIndex(u => u.id === currentUser.id);
        users[index] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // تنظيف البيانات
    cart = [];
    localStorage.removeItem('cart');
    document.getElementById('cardName').value = '';
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCVV').value = '';
    
    alert('✅ تم الدفع بنجاح! شكراً لك.');
    backToStore();
}

// العودة للمتجر
function backToStore() {
    showPage('storePage');
    updateCart();
    renderSubscriptions();
}

// عرض اشتراكاتي
function renderMySubscriptions() {
    const container = document.getElementById('mySubscriptions');
    
    if (!currentUser || currentUser.subscriptions.length === 0) {
        container.innerHTML = '<p class="empty-message">لا توجد اشتراكات بعد</p>';
        return;
    }
    
    container.innerHTML = '';
    currentUser.subscriptions.forEach(sub => {
        const subscription = subscriptions.find(s => s.id === sub.id);
        if (subscription) {
            const card = document.createElement('div');
            card.className = 'subscription-card';
            card.innerHTML = `
                <h3>${subscription.name}</h3>
                <div class="price">${subscription.price} ريال</div>
                <div class="duration">${subscription.duration}</div>
                <p style="color:#999;margin:10px 0;">مشترك منذ: ${new Date(sub.purchasedAt).toLocaleDateString('ar-SA')}</p>
                <p style="color:#4caf50;font-weight:bold;">✓ نشط حتى ${new Date(sub.expiresAt).toLocaleDateString('ar-SA')}</p>
                <button class="remove" onclick="cancelSubscription(${sub.id})">إلغاء الاشتراك</button>
            `;
            container.appendChild(card);
        }
    });
}

// إلغاء الاشتراك
function cancelSubscription(id) {
    if (confirm('هل تريد إلغاء هذا الاشتراك؟')) {
        currentUser.subscriptions = currentUser.subscriptions.filter(s => s.id !== id);
        const index = users.findIndex(u => u.id === currentUser.id);
        users[index] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        renderMySubscriptions();
        renderSubscriptions();
        alert('تم إلغاء الاشتراك');
    }
}

// تحديث السلة عند التحميل
updateCart();