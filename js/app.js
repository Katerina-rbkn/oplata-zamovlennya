
// =====================================================
// USE-CASE 3 — ОПЛАТА ЗАМОВЛЕННЯ
// Демонстраційний прототип
// =====================================================

// 1. ЕКРАНИ

const screens = {
    orders: document.getElementById("orders"),
    details: document.getElementById("paymentDetails"),
    widget: document.getElementById("paymentWidget"),
    processing: document.getElementById("processingScreen"),
    success: document.getElementById("successScreen"),
    declined: document.getElementById("declinedScreen"),
    pending: document.getElementById("pendingScreen"),
    receipt: document.getElementById("receiptScreen")
};

const sidebarButtons = document.querySelectorAll(".step-button");

const nextStepButton = document.getElementById("nextStep");
const restartButton = document.getElementById("restartDemo");

// 2. ВКЛАДКИ ЗАМОВЛЕНЬ

const orderTabs = {
    active: document.getElementById("tabActive"),
    completed: document.getElementById("tabCompleted"),
    paid: document.getElementById("tabPaid")
};

const orderPanels = {
    active: document.getElementById("activeOrders"),
    completed: document.getElementById("completedOrders"),
    paid: document.getElementById("paidOrders")
};

const completedOrderCard =
    document.getElementById("completedOrderCard");

const completedEmpty =
    document.getElementById("completedEmpty");

const paidOrderCard =
    document.getElementById("paidOrderCard");

const paidEmpty =
    document.getElementById("paidEmpty");

const orderPaymentStatus =
    document.getElementById("orderPaymentStatus");

const openPaymentButton =
    document.getElementById("openPayment");

// 3. ПРОМОКОД

const promoInput = document.getElementById("promoCode");
const promoMessage = document.getElementById("promoMessage");

// 4. СУМИ

const amountElements = [
    "totalPrice",
    "widgetAmount",
    "processingAmount",
    "successAmount",
    "declinedAmount",
    "pendingAmount",
    "paidOrderAmount",
    "receiptAmount",
    "printReceiptAmount"
].map(id => document.getElementById(id));

// 5. ОЦІНЮВАННЯ МАЙСТРА

const starButtons = document.querySelectorAll(".star-button");

const ratingHint = document.getElementById("ratingHint");
const reviewComment = document.getElementById("reviewComment");
const reviewMessage = document.getElementById("reviewMessage");

const submitReviewButton =
    document.getElementById("submitReview");

const reviewFormCard =
    document.getElementById("reviewFormCard");

const reviewSavedCard =
    document.getElementById("reviewSavedCard");

const reviewSavedText =
    document.getElementById("reviewSavedText");

const paidReviewSummary =
    document.getElementById("paidReviewSummary");

const successToOrdersButton =
    document.getElementById("successToOrders");

const successToReceiptButton =
    document.getElementById("successToReceipt");

// 6. ЗМІННІ СТАНУ

const originalPrice = 550;

let currentPrice = originalPrice;
let promoApplied = false;

// unpaid, processing, pending, paid, declined
let paymentStatus = "unpaid";

let paymentDate = null;

let selectedRating = 0;
let savedReview = null;
let commentSubmitted = false;

// =====================================================
// 7. ПЕРЕВІРКА ОЦІНЮВАННЯ
// =====================================================

function isReviewRequired() {
    return paymentStatus === "paid" && selectedRating === 0;
}

function isCommentPending() {
    return (
        paymentStatus === "paid" &&
        selectedRating > 0 &&
        !commentSubmitted &&
        reviewComment.value.trim().length > 0
    );
}

function isReviewNavigationBlocked() {
    return isReviewRequired() || isCommentPending();
}

function showReviewRequiredMessage() {

    if (isReviewRequired()) {

        reviewMessage.textContent =
            "Спочатку поставте від 1 до 5 зірочок, " +
            "щоб продовжити.";

        starButtons[0].focus();

    } else if (isCommentPending()) {

        reviewMessage.textContent =
            "Надішліть написаний коментар " +
            "або очистіть поле, щоб продовжити.";

        submitReviewButton.focus();
    }
}

// =====================================================
// 8. ПЕРЕМИКАННЯ ЕКРАНІВ
// =====================================================

function showScreen(name, activeStep = name) {

    if (!screens[name]) {
        return;
    }

    // Після оплати не дозволяємо пропустити оцінювання
    if (
        isReviewNavigationBlocked() &&
        name !== "success"
    ) {
        showReviewRequiredMessage();
        return;
    }

    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    screens[name].classList.add("active");

    // Виділяємо відповідний етап у панелі демонстрації
    sidebarButtons.forEach(button => {

        const active = button.dataset.step === activeStep;

        button.parentElement.classList.toggle(
            "current",
            active
        );

        if (active) {
            button.setAttribute("aria-current", "step");
        } else {
            button.removeAttribute("aria-current");
        }
    });

    // Прокручування нового екрана догори
    const content = screens[name].querySelector(".content");

    if (content) {
        content.scrollTop = 0;
    }
}

// =====================================================
// 9. ПЕРЕМИКАННЯ ВКЛАДОК ЗАМОВЛЕНЬ
// =====================================================

function showOrdersTab(name) {

    Object.keys(orderTabs).forEach(tabName => {

        const selected = tabName === name;

        orderTabs[tabName].classList.toggle(
            "selected",
            selected
        );

        orderTabs[tabName].setAttribute(
            "aria-pressed",
            String(selected)
        );

        orderPanels[tabName].hidden = !selected;
    });
}

// =====================================================
// 10. ОНОВЛЕННЯ СУМ
// =====================================================

function updateAmounts() {

    const amount = `${currentPrice} грн`;

    amountElements.forEach(element => {
        element.textContent = amount;
    });
}

// =====================================================
// 11. СТАТУС ЗАМОВЛЕННЯ
// =====================================================

function updateOrderStatus() {

    const paid = paymentStatus === "paid";

    // Після оплати замовлення зникає з "Виконаних"
    completedOrderCard.hidden = paid;
    completedEmpty.hidden = !paid;

    // І з'являється в "Оплачених"
    paidOrderCard.hidden = !paid;
    paidEmpty.hidden = paid;

    if (paid) {

        orderPaymentStatus.textContent =
            "Оплата: Оплачено";

        orderPaymentStatus.style.color = "#2E9D5B";

        openPaymentButton.textContent =
            "Переглянути оплату";

    } else if (
        paymentStatus === "processing" ||
        paymentStatus === "pending"
    ) {

        orderPaymentStatus.textContent =
            "Оплата: Очікує підтвердження";

        orderPaymentStatus.style.color = "#B87516";

        openPaymentButton.textContent =
            "Перевірити статус";

    } else {

        orderPaymentStatus.textContent =
            "Оплата: Не оплачено";

        orderPaymentStatus.style.color = "";

        openPaymentButton.textContent =
            "Оплатити";
    }

    // Квитанція доступна після оплати й оцінювання
    const receiptStep = document.querySelector(
        '[data-step="receipt"]'
    );

    receiptStep.disabled =
        !paid ||
        selectedRating === 0 ||
        isCommentPending();
}

// =====================================================
// 12. ОНОВЛЕННЯ КВИТАНЦІЇ
// =====================================================

function updateReceipt() {

    if (!paymentDate) {
        return;
    }

    const formattedDate = new Intl.DateTimeFormat(
        "uk-UA",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(paymentDate);

    document.getElementById("receiptDate").textContent =
        formattedDate;

    document.getElementById("printReceiptDate").textContent =
        formattedDate;

    // Рядок знижки показується лише за наявності промокоду
    document.getElementById("receiptDiscountRow").hidden =
        !promoApplied;

    document.getElementById("printReceiptDiscountRow").hidden =
        !promoApplied;

    const discount =
        `−${originalPrice - currentPrice} грн`;

    document.getElementById("receiptDiscount").textContent =
        discount;

    document.getElementById("printReceiptDiscount").textContent =
        discount;

    updateAmounts();
}

// =====================================================
// 13. ПІДСВІЧУВАННЯ ЗІРОЧОК
// =====================================================

function updateRatingStars() {

    starButtons.forEach(button => {

        const value = Number(button.dataset.rating);

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

        ratingHint.textContent =
            `Оцінку ${selectedRating} із 5 збережено автоматично`;

        ratingHint.classList.add("saved");

    } else {

        ratingHint.textContent =
            "Оберіть оцінку, щоб продовжити";

        ratingHint.classList.remove("saved");
    }
}

// =====================================================
// 14. ДОСТУПНІСТЬ НАВІГАЦІЇ
// =====================================================

function updateReviewNavigation() {

    const blocked = isReviewNavigationBlocked();

    successToOrdersButton.disabled = blocked;
    successToReceiptButton.disabled = blocked;
}

// =====================================================
// 15. ВІДОБРАЖЕННЯ ЗБЕРЕЖЕНОЇ ОЦІНКИ
// =====================================================

function updateReviewDisplay() {

    const hasRating = selectedRating > 0;

    // Після надсилання коментаря форма приховується
    reviewFormCard.hidden = commentSubmitted;

    reviewSavedCard.hidden = !commentSubmitted;

    paidReviewSummary.hidden = !hasRating;
    paidReviewSummary.replaceChildren();

    if (hasRating) {

        const stars =
            "★".repeat(selectedRating) +
            "☆".repeat(5 - selectedRating);

        const title = document.createElement("div");

        title.className = "saved-review-title";
        title.textContent = "Ваша оцінка майстра";

        const starsElement = document.createElement("div");

        starsElement.className = "saved-review-stars";
        starsElement.textContent = stars;

        paidReviewSummary.append(
            title,
            starsElement
        );

        // Коментар відображається тільки після надсилання
        if (savedReview && savedReview.comment) {

            const commentElement =
                document.createElement("p");

            commentElement.className =
                "saved-review-comment";

            commentElement.textContent =
                `Коментар: ${savedReview.comment}`;

            paidReviewSummary.appendChild(commentElement);
        }

        if (commentSubmitted) {

            reviewSavedText.textContent =
                `Ваша оцінка майстра: ${stars}`;
        }

    } else {

        reviewSavedText.textContent = "";
    }

    updateReviewNavigation();
    updateOrderStatus();
}

// =====================================================
// 16. КНОПКА НАДСИЛАННЯ КОМЕНТАРЯ
// =====================================================

function updateCommentButton() {

    const hasComment =
        reviewComment.value.trim().length > 0;

    submitReviewButton.disabled =
        selectedRating === 0 ||
        !hasComment ||
        commentSubmitted;
}

// =====================================================
// 17. АВТОМАТИЧНЕ ЗБЕРЕЖЕННЯ ОЦІНКИ
// =====================================================

starButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (
            paymentStatus !== "paid" ||
            commentSubmitted
        ) {
            return;
        }

        selectedRating = Number(button.dataset.rating);

        // Оцінка зберігається одразу після натискання
        savedReview = {
            rating: selectedRating,
            comment: ""
        };

        reviewMessage.textContent = "";

        updateRatingStars();
        updateReviewDisplay();
        updateCommentButton();
    });
});

// =====================================================
// 18. ВВЕДЕННЯ КОМЕНТАРЯ
// =====================================================

reviewComment.addEventListener("input", () => {

    reviewMessage.textContent = "";

    updateCommentButton();
    updateReviewNavigation();
    updateOrderStatus();
});

// =====================================================
// 19. НАДСИЛАННЯ КОМЕНТАРЯ
// =====================================================

submitReviewButton.addEventListener("click", () => {

    if (
        paymentStatus !== "paid" ||
        selectedRating === 0 ||
        commentSubmitted
    ) {
        return;
    }

    const comment = reviewComment.value.trim();

    if (!comment) {
        return;
    }

    savedReview = {
        rating: selectedRating,
        comment: comment
    };

    commentSubmitted = true;
    reviewMessage.textContent = "";

    updateReviewDisplay();
    updateCommentButton();
});

// =====================================================
// 20. СКИДАННЯ ОЦІНЮВАННЯ
// =====================================================

function resetReview() {

    selectedRating = 0;
    savedReview = null;
    commentSubmitted = false;

    reviewComment.value = "";
    reviewMessage.textContent = "";

    updateRatingStars();
    updateReviewDisplay();
    updateCommentButton();
}

// =====================================================
// 21. СКИДАННЯ ПЛАТЕЖУ
// =====================================================

function resetPaymentData() {

    paymentStatus = "unpaid";
    paymentDate = null;

    currentPrice = originalPrice;
    promoApplied = false;

    promoInput.value = "";
    promoMessage.textContent = "";
    promoMessage.className = "promo-message";

    resetReview();
    updateAmounts();
    updateOrderStatus();
}

// =====================================================
// 22. ПЕРЕЗАПУСК ДЕМОНСТРАЦІЇ
// =====================================================

function restartDemo() {

    if (isReviewNavigationBlocked()) {
        showReviewRequiredMessage();
        return;
    }

    resetPaymentData();
    showOrdersTab("completed");
    showScreen("orders");
}

// =====================================================
// 23. УСПІШНА ОПЛАТА
// =====================================================

function completePayment() {

    if (paymentStatus !== "paid") {
        paymentDate = new Date();
    }

    paymentStatus = "paid";

    updateAmounts();
    updateOrderStatus();
    updateReceipt();
    updateReviewNavigation();

    showScreen("success");
}

// =====================================================
// 24. ВІДХИЛЕНИЙ ПЛАТІЖ
// =====================================================

function declinePayment() {

    paymentStatus = "declined";

    updateOrderStatus();
    showScreen("declined");
}

// =====================================================
// 25. ОЧІКУВАННЯ ПІДТВЕРДЖЕННЯ
// =====================================================

function waitForConfirmation() {

    paymentStatus = "pending";

    updateOrderStatus();
    showScreen("pending");
}

// =====================================================
// 26. ВІДКРИТТЯ КВИТАНЦІЇ
// =====================================================

function openReceipt() {

    if (
        paymentStatus !== "paid" ||
        isReviewNavigationBlocked()
    ) {

        if (paymentStatus === "paid") {
            showReviewRequiredMessage();
        }

        return;
    }

    updateReceipt();
    showScreen("receipt");
}

// =====================================================
// 27. ВКЛАДКИ ЗАМОВЛЕНЬ
// =====================================================

orderTabs.active.addEventListener("click", () => {
    showOrdersTab("active");
});

orderTabs.completed.addEventListener("click", () => {
    showOrdersTab("completed");
});

orderTabs.paid.addEventListener("click", () => {
    showOrdersTab("paid");
});

// =====================================================
// 28. КНОПКА ОПЛАТИ ЗАМОВЛЕННЯ
// =====================================================

openPaymentButton.addEventListener("click", () => {

    if (paymentStatus === "paid") {

        showScreen("success");

    } else if (paymentStatus === "pending") {

        showScreen("pending");

    } else if (paymentStatus === "processing") {

        showScreen("processing");

    } else {

        showScreen("details");
    }
});

// =====================================================
// 29. ПОВЕРНЕННЯ ДО ЗАЯВОК
// =====================================================

document.getElementById("backOrders").addEventListener(
    "click",
    () => {

        showOrdersTab("completed");
        showScreen("orders");
    }
);

// =====================================================
// 30. ПРОМОКОД
// =====================================================

document.getElementById("applyPromo").addEventListener(
    "click",
    () => {

        const promo =
            promoInput.value.trim().toUpperCase();

        if (promo === "MASTER10") {

            promoApplied = true;

            currentPrice = Math.round(
                originalPrice * 0.9
            );

            promoMessage.textContent =
                "Промокод застосовано! Знижка 10%.";

            promoMessage.className =
                "promo-message success";

        } else {

            promoApplied = false;
            currentPrice = originalPrice;

            promoMessage.textContent =
                "Промокод недійсний.";

            promoMessage.className =
                "promo-message error";
        }

        updateAmounts();
    }
);

// Якщо промокод змінено, попередня знижка скидається
promoInput.addEventListener("input", () => {

    promoApplied = false;
    currentPrice = originalPrice;

    promoMessage.textContent = "";
    promoMessage.className = "promo-message";

    updateAmounts();
});

// =====================================================
// 31. ПЕРЕХІД ДО LIQPAY
// =====================================================

document.getElementById("goToLiqPay").addEventListener(
    "click",
    () => {

        if (
            paymentStatus !== "unpaid" &&
            paymentStatus !== "declined"
        ) {
            return;
        }

        updateAmounts();
        showScreen("widget");
    }
);

// Повернення з віджета
document.getElementById("backFromWidget").addEventListener(
    "click",
    () => {
        showScreen("details");
    }
);

// Скасування платежу
document.getElementById("cancelWidget").addEventListener(
    "click",
    () => {

        paymentStatus = "unpaid";

        updateOrderStatus();
        showScreen("details");
    }
);

// =====================================================
// 32. ПІДТВЕРДЖЕННЯ ТЕСТОВОЇ ОПЛАТИ
// =====================================================

document.getElementById(
    "confirmWidgetPayment"
).addEventListener("click", () => {

    if (
        paymentStatus !== "unpaid" &&
        paymentStatus !== "declined"
    ) {
        return;
    }

    paymentStatus = "processing";

    updateOrderStatus();
    showScreen("processing");
});

// =====================================================
// 33. ДЕМОНСТРАЦІЯ РЕЗУЛЬТАТІВ ПЛАТЕЖУ
// =====================================================

document.getElementById(
    "simulateSuccess"
).addEventListener("click", completePayment);

document.getElementById(
    "simulateDeclined"
).addEventListener("click", declinePayment);

document.getElementById(
    "simulatePending"
).addEventListener("click", waitForConfirmation);

// =====================================================
// 34. ПОВТОРНА ОПЛАТА
// =====================================================

document.getElementById("retryPayment").addEventListener(
    "click",
    () => {

        if (paymentStatus !== "declined") {
            return;
        }

        paymentStatus = "unpaid";

        updateOrderStatus();
        showScreen("widget");
    }
);

// Повернення після відхиленого платежу
document.getElementById(
    "declinedToOrders"
).addEventListener("click", () => {

    showOrdersTab("completed");
    showScreen("orders");
});

// =====================================================
// 35. ПЕРЕХІД ДО ОПЛАЧЕНИХ ЗАМОВЛЕНЬ
// =====================================================

successToOrdersButton.addEventListener("click", () => {

    if (isReviewNavigationBlocked()) {
        showReviewRequiredMessage();
        return;
    }

    showOrdersTab("paid");
    showScreen("orders");
});

// Перегляд оплаченого замовлення
document.getElementById(
    "viewPaidPayment"
).addEventListener("click", () => {

    if (paymentStatus === "paid") {
        showScreen("success");
    }
});

// Перехід із порожньої вкладки "Виконані"
document.getElementById(
    "emptyGoToPaid"
).addEventListener("click", () => {

    showOrdersTab("paid");
});

// =====================================================
// 36. ПІДТВЕРДЖЕННЯ ПЛАТЕЖУ ПІСЛЯ ОЧІКУВАННЯ
// =====================================================

document.getElementById(
    "simulateConfirmation"
).addEventListener("click", () => {

    if (paymentStatus === "pending") {
        completePayment();
    }
});

// Повернення під час очікування
document.getElementById(
    "pendingToOrders"
).addEventListener("click", () => {

    showOrdersTab("completed");
    showScreen("orders");
});

// =====================================================
// 37. КНОПКИ КВИТАНЦІЇ
// =====================================================

document.getElementById(
    "openReceipt"
).addEventListener("click", openReceipt);

successToReceiptButton.addEventListener(
    "click",
    openReceipt
);

// Повернення з квитанції
document.getElementById(
    "backFromReceipt"
).addEventListener("click", () => {

    showOrdersTab("paid");
    showScreen("orders");
});

document.getElementById(
    "receiptToPaid"
).addEventListener("click", () => {

    showOrdersTab("paid");
    showScreen("orders");
});

// =====================================================
// 38. ДРУК КВИТАНЦІЇ
// =====================================================

document.getElementById(
    "printReceipt"
).addEventListener("click", () => {

    if (
        paymentStatus === "paid" &&
        selectedRating > 0 &&
        !isCommentPending()
    ) {
        window.print();
    }
});

// =====================================================
// 39. НАВІГАЦІЯ ЧЕРЕЗ ПАНЕЛЬ ДЕМОНСТРАЦІЇ
// =====================================================

function navigateDemo(step) {

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

        showScreen("orders");

    } else if (
        step === "details" ||
        step === "promo"
    ) {

        if (paymentStatus !== "unpaid") {
            resetPaymentData();
        }

        showOrdersTab("completed");
        showScreen("details", step);

        if (step === "promo") {
            promoInput.focus();
        }

    } else if (step === "widget") {

        if (paymentStatus !== "unpaid") {
            resetPaymentData();
        }

        showOrdersTab("completed");
        showScreen("widget");

    } else if (step === "processing") {

        if (paymentStatus === "paid") {
            resetPaymentData();
        }

        paymentStatus = "processing";

        updateOrderStatus();
        showOrdersTab("completed");
        showScreen("processing");

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

// =====================================================
// 40. КНОПКИ ЕТАПІВ У ЛІВІЙ ПАНЕЛІ
// =====================================================

sidebarButtons.forEach(button => {

    button.addEventListener("click", () => {

        navigateDemo(button.dataset.step);
    });
});

// =====================================================
// 41. КНОПКА "ДАЛІ ЗА СЦЕНАРІЄМ"
// =====================================================

const mainScenarioSteps = [
    "orders",
    "details",
    "promo",
    "widget",
    "processing",
    "success",
    "receipt"
];

nextStepButton.addEventListener("click", () => {

    if (isReviewNavigationBlocked()) {
        showReviewRequiredMessage();
        return;
    }

    const currentButton = document.querySelector(
        ".screens li.current .step-button"
    );

    const currentStep = currentButton
        ? currentButton.dataset.step
        : "orders";

    const currentIndex =
        mainScenarioSteps.indexOf(currentStep);

    // З альтернативного сценарію повертаємося на початок
    if (currentIndex === -1) {
        navigateDemo("orders");
        return;
    }

    // Після квитанції показуємо оплачені замовлення
    if (
        currentIndex ===
        mainScenarioSteps.length - 1
    ) {

        showOrdersTab("paid");
        showScreen("orders");

        return;
    }

    const nextStep =
        mainScenarioSteps[currentIndex + 1];

    navigateDemo(nextStep);
});

// =====================================================
// 42. ПЕРЕЗАПУСК
// =====================================================

restartButton.addEventListener(
    "click",
    restartDemo
);

// =====================================================
// 43. ПОЧАТКОВИЙ СТАН ПРОТОТИПУ
// =====================================================

restartDemo();
