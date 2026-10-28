
/* =====================================================
   USE-CASE 3 — ОПЛАТА ЗАМОВЛЕННЯ
   З анімацією переходів між екранами
   ===================================================== */

const $ = id => document.getElementById(id);

// Екрани застосунку
const screens = {
    orders: $("orders"),
    details: $("paymentDetails"),
    widget: $("paymentWidget"),
    processing: $("processingScreen"),
    success: $("successScreen"),
    declined: $("declinedScreen"),
    pending: $("pendingScreen"),
    receipt: $("receiptScreen")
};

// Елементи навігації
const sidebarButtons = [
    ...document.querySelectorAll(".step-button")
];

const orderTabs = {
    active: $("tabActive"),
    completed: $("tabCompleted"),
    paid: $("tabPaid")
};

const orderPanels = {
    active: $("activeOrders"),
    completed: $("completedOrders"),
    paid: $("paidOrders")
};

const starButtons = [
    ...document.querySelectorAll(".star-button")
];

// Елементи, у яких показується сума
const amountIds = [
    "totalPrice",
    "widgetAmount",
    "processingAmount",
    "successAmount",
    "declinedAmount",
    "pendingAmount",
    "paidOrderAmount",
    "receiptAmount",
    "printReceiptAmount"
];

// =====================================================
// 1. ПОЧАТКОВІ ДАНІ
// =====================================================

const originalPrice = 550;

let currentPrice = originalPrice;
let promoApplied = false;

// Можливі стани:
// unpaid, processing, pending, declined, paid
let paymentStatus = "unpaid";

let paymentDate = null;

// Оцінювання майстра
let selectedRating = 0;
let savedReview = null;
let commentSubmitted = false;

// =====================================================
// 2. НАЛАШТУВАННЯ АНІМАЦІЇ
// =====================================================

// Враховуємо налаштування зменшення руху
const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

// Тривалість переходу — 340 мс, як у дівчат
const DURATION = reducedMotion ? 0 : 340;

// Плавність анімації
const EASING = "cubic-bezier(.22,.8,.24,1)";

// Порядок екранів у сценарії
const screenOrder = {
    orders: 0,
    details: 1,
    widget: 2,
    processing: 3,
    success: 4,
    declined: 4,
    pending: 4,
    receipt: 5
};

// Захист від одночасних переходів
let transitioning = false;

// =====================================================
// 3. ПЕРЕВІРКА ОЦІНЮВАННЯ
// =====================================================

function isReviewRequired() {
    return (
        paymentStatus === "paid" &&
        selectedRating === 0
    );
}

function isCommentPending() {
    return (
        paymentStatus === "paid" &&
        selectedRating > 0 &&
        !commentSubmitted &&
        $("reviewComment").value.trim().length > 0
    );
}

function isReviewNavigationBlocked() {
    return isReviewRequired() || isCommentPending();
}

function showReviewRequiredMessage() {

    if (isReviewRequired()) {

        $("reviewMessage").textContent =
            "Спочатку поставте від 1 до 5 зірочок, " +
            "щоб продовжити.";

        starButtons[0].focus();

    } else if (isCommentPending()) {

        $("reviewMessage").textContent =
            "Надішліть коментар або очистіть поле, " +
            "щоб продовжити.";

        $("submitReview").focus();
    }
}

// =====================================================
// 4. АНІМАЦІЯ ПЕРЕХОДІВ МІЖ ЕКРАНАМИ
// =====================================================

function showScreen(
    name,
    activeStep = name,
    mode = "auto"
) {

    const next = screens[name];

    if (!next || transitioning) {
        return;
    }

    // Не дозволяємо пропустити оцінювання
    if (
        isReviewNavigationBlocked() &&
        name !== "success"
    ) {
        showReviewRequiredMessage();
        return;
    }

    // Знаходимо поточний екран
    const previous = Object.values(screens).find(
        el => el.classList.contains("active")
    );

    const previousName = Object.keys(screens).find(
        key => screens[key] === previous
    );

    // Оновлюємо активний пункт лівої панелі
    sidebarButtons.forEach(button => {

        const active =
            button.dataset.step === activeStep;

        button.parentElement.classList.toggle(
            "current",
            active
        );

        if (active) {
            button.setAttribute(
                "aria-current",
                "step"
            );
        } else {
            button.removeAttribute("aria-current");
        }
    });

    // Прокручуємо новий екран догори
    const content = next.querySelector(".content");

    if (content) {
        content.scrollTop = 0;
    }

    // Якщо екран той самий, нічого не анімуємо
    if (previous === next) {
        return;
    }

    // Тимчасово показуємо новий екран
    next.classList.add("active");

    // Перший запуск або вимкнені анімації
    if (
        !previous ||
        DURATION === 0 ||
        mode === "instant"
    ) {

        if (previous) {
            previous.classList.remove("active");
        }

        return;
    }

    transitioning = true;

    // Автоматично визначаємо напрямок
    if (mode === "auto") {

        const diff =
            screenOrder[name] -
            screenOrder[previousName];

        if (diff === 1) {
            mode = "push";
        } else if (diff === -1) {
            mode = "back";
        } else {
            mode = "fade";
        }
    }

    let outgoingFrames;
    let incomingFrames;

    // ПЕРЕХІД ВПЕРЕД
    // Новий екран виїжджає справа
    if (mode === "push") {

        outgoingFrames = [
            {
                transform: "translateX(0)",
                opacity: 1
            },
            {
                transform: "translateX(-22%)",
                opacity: 0.55
            }
        ];

        incomingFrames = [
            {
                transform: "translateX(100%)"
            },
            {
                transform: "translateX(0)"
            }
        ];

    // ПЕРЕХІД НАЗАД
    // Поточний екран виїжджає вправо
    } else if (mode === "back") {

        outgoingFrames = [
            {
                transform: "translateX(0)"
            },
            {
                transform: "translateX(100%)"
            }
        ];

        incomingFrames = [
            {
                transform: "translateX(-22%)",
                opacity: 0.55
            },
            {
                transform: "translateX(0)",
                opacity: 1
            }
        ];

    // ПЛАВНА ЗМІНА ЕКРАНІВ
    } else {

        outgoingFrames = [
            { opacity: 1 },
            { opacity: 1 }
        ];

        incomingFrames = [
            { opacity: 0 },
            { opacity: 1 }
        ];
    }

    // Визначаємо порядок накладання екранів
    previous.style.zIndex =
        mode === "back" ? "3" : "2";

    next.style.zIndex =
        mode === "back" ? "2" : "3";

    const options = {
        duration: DURATION,
        easing: EASING,
        fill: "both"
    };

    // Запускаємо анімацію старого екрана
    const outgoing = previous.animate(
        outgoingFrames,
        options
    );

    // Запускаємо анімацію нового екрана
    const incoming = next.animate(
        incomingFrames,
        options
    );

    // Після завершення приховуємо старий екран
    Promise.allSettled([
        outgoing.finished,
        incoming.finished
    ]).then(() => {

        previous.classList.remove("active");

        outgoing.cancel();
        incoming.cancel();

        previous.style.zIndex = "";
        next.style.zIndex = "";

        transitioning = false;
    });
}

// =====================================================
// 5. АНІМАЦІЯ ВКЛАДОК ЗАМОВЛЕНЬ
// =====================================================

function showOrdersTab(name) {

    const oldName = Object.keys(orderTabs).find(
        key => orderTabs[key].classList.contains(
            "selected"
        )
    );

    // Змінюємо активну вкладку
    Object.keys(orderTabs).forEach(key => {

        const selected = key === name;

        orderTabs[key].classList.toggle(
            "selected",
            selected
        );

        orderTabs[key].setAttribute(
            "aria-pressed",
            String(selected)
        );

        orderPanels[key].hidden = !selected;
    });

    // Плавна поява вмісту нової вкладки
    if (
        oldName !== name &&
        DURATION > 0
    ) {

        orderPanels[name].animate(
            [
                {
                    opacity: 0,
                    transform: "translateY(10px)"
                },
                {
                    opacity: 1,
                    transform: "translateY(0)"
                }
            ],
            {
                duration: 260,
                easing: EASING
            }
        );
    }
}

// =====================================================
// 6. ОНОВЛЕННЯ СУМ
// =====================================================

function updateAmounts() {

    amountIds.forEach(id => {

        $(id).textContent =
            `${currentPrice} грн`;
    });
}

// =====================================================
// 7. СТАТУС ЗАМОВЛЕННЯ
// =====================================================

function updateOrderStatus() {

    const paid = paymentStatus === "paid";

    // Після оплати прибираємо замовлення
    // з вкладки "Виконані"
    $("completedOrderCard").hidden = paid;
    $("completedEmpty").hidden = !paid;

    // Додаємо його до вкладки "Оплачені"
    $("paidOrderCard").hidden = !paid;
    $("paidEmpty").hidden = paid;

    if (paid) {

        $("orderPaymentStatus").textContent =
            "Оплата: Оплачено";

        $("orderPaymentStatus").style.color =
            "#2E9D5B";

        $("openPayment").textContent =
            "Переглянути оплату";

    } else if (
        ["processing", "pending"].includes(
            paymentStatus
        )
    ) {

        $("orderPaymentStatus").textContent =
            "Оплата: Очікує підтвердження";

        $("orderPaymentStatus").style.color =
            "#B87516";

        $("openPayment").textContent =
            "Перевірити статус";

    } else {

        $("orderPaymentStatus").textContent =
            "Оплата: Не оплачено";

        $("orderPaymentStatus").style.color = "";

        $("openPayment").textContent =
            "Оплатити";
    }

    // Квитанція доступна після оцінювання
    document.querySelector(
        '[data-step="receipt"]'
    ).disabled =
        !paid ||
        selectedRating === 0 ||
        isCommentPending();
}

// =====================================================
// 8. КВИТАНЦІЯ
// =====================================================

function updateReceipt() {

    if (!paymentDate) {
        return;
    }

    const date = new Intl.DateTimeFormat(
        "uk-UA",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(paymentDate);

    $("receiptDate").textContent = date;
    $("printReceiptDate").textContent = date;

    // Показуємо знижку, якщо був промокод
    $("receiptDiscountRow").hidden =
        !promoApplied;

    $("printReceiptDiscountRow").hidden =
        !promoApplied;

    const discount =
        `−${originalPrice - currentPrice} грн`;

    $("receiptDiscount").textContent =
        discount;

    $("printReceiptDiscount").textContent =
        discount;

    updateAmounts();
}

// =====================================================
// 9. ОЦІНЮВАННЯ МАЙСТРА
// =====================================================

function updateRatingStars() {

    starButtons.forEach(button => {

        const value = Number(
            button.dataset.rating
        );

        button.classList.toggle(
            "selected",
            value <= selectedRating
        );

        button.setAttribute(
            "aria-pressed",
            String(value === selectedRating)
        );
    });

    if (selectedRating > 0) {

        $("ratingHint").textContent =
            `Оцінку ${selectedRating} із 5 ` +
            "збережено автоматично";

    } else {

        $("ratingHint").textContent =
            "Оберіть оцінку, щоб продовжити";
    }

    $("ratingHint").classList.toggle(
        "saved",
        selectedRating > 0
    );
}

function updateReviewNavigation() {

    const blocked = isReviewNavigationBlocked();

    $("successToOrders").disabled = blocked;
    $("successToReceipt").disabled = blocked;
}

function updateCommentButton() {

    $("submitReview").disabled =
        selectedRating === 0 ||
        !$("reviewComment").value.trim() ||
        commentSubmitted;
}

// Відображення оцінки та коментаря
function updateReviewDisplay() {

    const hasRating = selectedRating > 0;

    $("reviewFormCard").hidden =
        commentSubmitted;

    $("reviewSavedCard").hidden =
        !commentSubmitted;

    $("paidReviewSummary").hidden =
        !hasRating;

    $("paidReviewSummary").replaceChildren();

    if (hasRating) {

        const stars =
            "★".repeat(selectedRating) +
            "☆".repeat(5 - selectedRating);

        const title = document.createElement(
            "div"
        );

        title.className = "saved-review-title";
        title.textContent = "Ваша оцінка майстра";

        const line = document.createElement(
            "div"
        );

        line.className = "saved-review-stars";
        line.textContent = stars;

        $("paidReviewSummary").append(
            title,
            line
        );

        // Коментар показується після надсилання
        if (savedReview?.comment) {

            const comment =
                document.createElement("p");

            comment.className =
                "saved-review-comment";

            comment.textContent =
                `Коментар: ${savedReview.comment}`;

            $("paidReviewSummary").appendChild(
                comment
            );
        }

        if (commentSubmitted) {

            $("reviewSavedText").textContent =
                `Ваша оцінка майстра: ${stars}`;
        }

    } else {

        $("reviewSavedText").textContent = "";
    }

    updateReviewNavigation();
    updateOrderStatus();
}

// Скидання оцінювання
function resetReview() {

    selectedRating = 0;
    savedReview = null;
    commentSubmitted = false;

    $("reviewComment").value = "";
    $("reviewMessage").textContent = "";

    updateRatingStars();
    updateReviewDisplay();
    updateCommentButton();
}

// Натискання на зірочки
starButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (
            paymentStatus !== "paid" ||
            commentSubmitted
        ) {
            return;
        }

        selectedRating = Number(
            button.dataset.rating
        );

        // Автоматично зберігаємо оцінку
        savedReview = {
            rating: selectedRating,
            comment: ""
        };

        $("reviewMessage").textContent = "";

        updateRatingStars();
        updateReviewDisplay();
        updateCommentButton();
    });
});

// Введення коментаря
$("reviewComment").addEventListener(
    "input",
    () => {

        $("reviewMessage").textContent = "";

        updateCommentButton();
        updateReviewNavigation();
        updateOrderStatus();
    }
);

// Надсилання коментаря
$("submitReview").addEventListener(
    "click",
    () => {

        if (
            paymentStatus !== "paid" ||
            selectedRating === 0 ||
            commentSubmitted
        ) {
            return;
        }

        const comment =
            $("reviewComment").value.trim();

        if (!comment) {
            return;
        }

        savedReview = {
            rating: selectedRating,
            comment: comment
        };

        commentSubmitted = true;

        $("reviewMessage").textContent = "";

        updateReviewDisplay();
        updateCommentButton();
    }
);

// =====================================================
// 10. СКИДАННЯ ДАНИХ
// =====================================================

function resetPaymentData() {

    paymentStatus = "unpaid";
    paymentDate = null;

    currentPrice = originalPrice;
    promoApplied = false;

    $("promoCode").value = "";
    $("promoMessage").textContent = "";
    $("promoMessage").className =
        "promo-message";

    resetReview();

    updateAmounts();
    updateOrderStatus();
}

function restartDemo() {

    if (isReviewNavigationBlocked()) {
        showReviewRequiredMessage();
        return;
    }

    resetPaymentData();

    showOrdersTab("completed");

    showScreen(
        "orders",
        "orders",
        "fade"
    );
}

// =====================================================
// 11. РЕЗУЛЬТАТИ ПЛАТЕЖУ
// =====================================================

// Успішний платіж
function completePayment() {

    if (paymentStatus !== "paid") {
        paymentDate = new Date();
    }

    paymentStatus = "paid";

    updateReviewNavigation();
    updateOrderStatus();
    updateReceipt();

    showScreen("success");
}

// Відхилений платіж
function declinePayment() {

    paymentStatus = "declined";

    updateOrderStatus();
    showScreen("declined");
}

// Очікування підтвердження
function waitForConfirmation() {

    paymentStatus = "pending";

    updateOrderStatus();
    showScreen("pending");
}

// Відкриття квитанції
function openReceipt() {

    if (
        paymentStatus !== "paid" ||
        isReviewNavigationBlocked()
    ) {
        return;
    }

    updateReceipt();
    showScreen("receipt");
}

// =====================================================
// 12. ВКЛАДКИ ЗАМОВЛЕНЬ
// =====================================================

Object.keys(orderTabs).forEach(name => {

    orderTabs[name].addEventListener(
        "click",
        () => showOrdersTab(name)
    );
});

// =====================================================
// 13. ПЕРЕХІД ДО ДЕТАЛЕЙ ОПЛАТИ
// =====================================================

$("openPayment").addEventListener(
    "click",
    () => {

        if (paymentStatus === "paid") {

            showScreen("success");

        } else if (paymentStatus === "pending") {

            showScreen("pending");

        } else if (
            paymentStatus === "processing"
        ) {

            showScreen("processing");

        } else {

            showScreen("details");
        }
    }
);

// Повернення до замовлень
$("backOrders").addEventListener(
    "click",
    () => {

        showOrdersTab("completed");

        showScreen(
            "orders",
            "orders",
            "back"
        );
    }
);

// =====================================================
// 14. ПРОМОКОД
// =====================================================

$("applyPromo").addEventListener(
    "click",
    () => {

        const promo = $("promoCode")
            .value.trim()
            .toUpperCase();

        if (promo === "MASTER10") {

            promoApplied = true;

            currentPrice = Math.round(
                originalPrice * 0.9
            );

            $("promoMessage").textContent =
                "Промокод застосовано! Знижка 10%.";

            $("promoMessage").className =
                "promo-message success";

        } else {

            promoApplied = false;
            currentPrice = originalPrice;

            $("promoMessage").textContent =
                "Промокод недійсний.";

            $("promoMessage").className =
                "promo-message error";
        }

        updateAmounts();
    }
);

// При зміні промокоду знижка скидається
$("promoCode").addEventListener(
    "input",
    () => {

        promoApplied = false;
        currentPrice = originalPrice;

        $("promoMessage").textContent = "";

        $("promoMessage").className =
            "promo-message";

        updateAmounts();
    }
);

// =====================================================
// 15. LIQPAY
// =====================================================

// Перехід до віджета
$("goToLiqPay").addEventListener(
    "click",
    () => {

        if (
            !["unpaid", "declined"].includes(
                paymentStatus
            )
        ) {
            return;
        }

        updateAmounts();
        showScreen("widget");
    }
);

// Повернення з LiqPay
$("backFromWidget").addEventListener(
    "click",
    () => {

        showScreen(
            "details",
            "details",
            "back"
        );
    }
);

// Скасування платежу
$("cancelWidget").addEventListener(
    "click",
    () => {

        paymentStatus = "unpaid";

        updateOrderStatus();

        showScreen(
            "details",
            "details",
            "back"
        );
    }
);

// Підтвердження тестової оплати
$("confirmWidgetPayment").addEventListener(
    "click",
    () => {

        if (
            !["unpaid", "declined"].includes(
                paymentStatus
            )
        ) {
            return;
        }

        paymentStatus = "processing";

        updateOrderStatus();
        showScreen("processing");
    }
);

// =====================================================
// 16. ДЕМОНСТРАЦІЙНІ РЕЗУЛЬТАТИ
// =====================================================

$("simulateSuccess").addEventListener(
    "click",
    completePayment
);

$("simulateDeclined").addEventListener(
    "click",
    declinePayment
);

$("simulatePending").addEventListener(
    "click",
    waitForConfirmation
);

// =====================================================
// 17. ПОВТОРНА ОПЛАТА
// =====================================================

$("retryPayment").addEventListener(
    "click",
    () => {

        if (paymentStatus !== "declined") {
            return;
        }

        paymentStatus = "unpaid";

        updateOrderStatus();

        showScreen(
            "widget",
            "widget",
            "back"
        );
    }
);

// Повернення після відхиленого платежу
$("declinedToOrders").addEventListener(
    "click",
    () => {

        showOrdersTab("completed");

        showScreen(
            "orders",
            "orders",
            "fade"
        );
    }
);

// =====================================================
// 18. УСПІШНА ОПЛАТА
// =====================================================

// Перехід до оплачених замовлень
$("successToOrders").addEventListener(
    "click",
    () => {

        if (isReviewNavigationBlocked()) {
            showReviewRequiredMessage();
            return;
        }

        showOrdersTab("paid");

        showScreen(
            "orders",
            "orders",
            "fade"
        );
    }
);

// Перегляд оплаченої заявки
$("viewPaidPayment").addEventListener(
    "click",
    () => {

        if (paymentStatus === "paid") {

            showScreen(
                "success",
                "success",
                "fade"
            );
        }
    }
);

// Перехід із порожньої вкладки
$("emptyGoToPaid").addEventListener(
    "click",
    () => {

        showOrdersTab("paid");
    }
);

// =====================================================
// 19. ОЧІКУВАННЯ ПІДТВЕРДЖЕННЯ
// =====================================================

$("simulateConfirmation").addEventListener(
    "click",
    () => {

        if (paymentStatus === "pending") {
            completePayment();
        }
    }
);

$("pendingToOrders").addEventListener(
    "click",
    () => {

        showOrdersTab("completed");

        showScreen(
            "orders",
            "orders",
            "fade"
        );
    }
);

// =====================================================
// 20. КВИТАНЦІЯ
// =====================================================

$("openReceipt").addEventListener(
    "click",
    openReceipt
);

$("successToReceipt").addEventListener(
    "click",
    openReceipt
);

// Повернення з квитанції
$("backFromReceipt").addEventListener(
    "click",
    () => {

        showOrdersTab("paid");

        showScreen(
            "orders",
            "orders",
            "back"
        );
    }
);

$("receiptToPaid").addEventListener(
    "click",
    () => {

        showOrdersTab("paid");

        showScreen(
            "orders",
            "orders",
            "fade"
        );
    }
);

// Друк квитанції
$("printReceipt").addEventListener(
    "click",
    () => {

        if (
            paymentStatus === "paid" &&
            !isReviewNavigationBlocked()
        ) {
            window.print();
        }
    }
);

// =====================================================
// 21. ЛІВА ПАНЕЛЬ ДЕМОНСТРАЦІЇ
// =====================================================

function navigateDemo(step) {

    if (transitioning) {
        return;
    }

    if (isReviewNavigationBlocked()) {
        showReviewRequiredMessage();
        return;
    }

    if (step === "orders") {

        showOrdersTab(
            paymentStatus === "paid"
                ? "paid"
                : "completed"
        );

        showScreen(
            "orders",
            "orders",
            "fade"
        );

    } else if (
        step === "details" ||
        step === "promo"
    ) {

        if (paymentStatus !== "unpaid") {
            resetPaymentData();
        }

        showOrdersTab("completed");

        showScreen(
            "details",
            step,
            "fade"
        );

        if (step === "promo") {
            $("promoCode").focus();
        }

    } else if (step === "widget") {

        if (paymentStatus !== "unpaid") {
            resetPaymentData();
        }

        showOrdersTab("completed");

        showScreen(
            "widget",
            "widget",
            "fade"
        );

    } else if (step === "processing") {

        if (paymentStatus === "paid") {
            resetPaymentData();
        }

        paymentStatus = "processing";

        updateOrderStatus();
        showOrdersTab("completed");

        showScreen(
            "processing",
            "processing",
            "fade"
        );

    } else if (step === "success") {

        completePayment();

    } else if (step === "declined") {

        if (paymentStatus === "paid") {
            resetPaymentData();
        }

        declinePayment();

    } else if (step === "pending") {

        if (paymentStatus === "paid") {
            resetPaymentData();
        }

        waitForConfirmation();

    } else if (step === "receipt") {

        openReceipt();
    }
}

// Кнопки лівої панелі
sidebarButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            navigateDemo(
                button.dataset.step
            );
        }
    );
});

// =====================================================
// 22. КНОПКА "ДАЛІ ЗА СЦЕНАРІЄМ"
// =====================================================

const mainFlow = [
    "orders",
    "details",
    "promo",
    "widget",
    "processing",
    "success",
    "receipt"
];

$("nextStep").addEventListener(
    "click",
    () => {

        if (transitioning) {
            return;
        }

        if (isReviewNavigationBlocked()) {
            showReviewRequiredMessage();
            return;
        }

        const current = document.querySelector(
            ".screens li.current .step-button"
        );

        const step = current
            ? current.dataset.step
            : "orders";

        const index = mainFlow.indexOf(step);

        // Альтернативний сценарій
        if (index === -1) {

            navigateDemo("orders");
            return;
        }

        // Кінець сценарію
        if (index === mainFlow.length - 1) {

            navigateDemo("orders");
            return;
        }

        // Наступний крок
        navigateDemo(
            mainFlow[index + 1]
        );
    }
);

// =====================================================
// 23. ПОЧАТИ СПОЧАТКУ
// =====================================================

$("restartDemo").addEventListener(
    "click",
    () => {

        if (!transitioning) {
            restartDemo();
        }
    }
);

// =====================================================
// 24. ЗАХИСТ ВІД ПОВТОРНИХ НАТИСКАНЬ
// =====================================================

// Під час анімації не обробляємо
// повторні натискання всередині телефона

document.querySelector(".phone").addEventListener(
    "click",
    event => {

        if (transitioning) {

            event.preventDefault();

            event.stopImmediatePropagation();
        }
    },
    true
);

// =====================================================
// 25. ПОЧАТКОВИЙ ЗАПУСК
// =====================================================

restartDemo();
