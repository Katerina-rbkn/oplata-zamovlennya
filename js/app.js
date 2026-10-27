
// USE-CASE 3 — ОПЛАТА ЗАМОВЛЕННЯ
// Сервіс виклику побутових майстрів
// Демонстраційний прототип

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

const restartButton = document.getElementById("restartDemo");

const nextStepButton = document.getElementById("nextStep");



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


const promoInput = document.getElementById("promoCode");

const promoMessage = document.getElementById("promoMessage");

const amountElements = [
    document.getElementById("totalPrice"),
    document.getElementById("widgetAmount"),
    document.getElementById("processingAmount"),
    document.getElementById("successAmount"),
    document.getElementById("declinedAmount"),
    document.getElementById("pendingAmount"),
    document.getElementById("paidOrderAmount"),
    document.getElementById("receiptAmount"),
    document.getElementById("printReceiptAmount")
];


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


// Початкова вартість послуги
const originalPrice = 550;

// Поточна сума до сплати
let currentPrice = originalPrice;

// Статус платежу:
// unpaid, processing, pending, paid, declined
let paymentStatus = "unpaid";

// Дата успішної оплати
let paymentDate = null;

// Чи застосовано промокод
let promoApplied = false;

// Оцінка майстра від 0 до 5
let selectedRating = 0;

// Збережений відгук
let savedReview = null;

// Чи надіслано коментар
let commentSubmitted = false;


// Після успішної оплати потрібно поставити зірочки
function isReviewRequired() {
    return paymentStatus === "paid" && selectedRating === 0;
}

// Перевірка ненадісланого коментаря
function isCommentPending() {
    return (
        paymentStatus === "paid" &&
        selectedRating > 0 &&
        !commentSubmitted &&
        reviewComment.value.trim().length > 0
    );
}

// Чи можна залишити екран успішної оплати
function isReviewNavigationBlocked() {
    return isReviewRequired() || isCommentPending();
}

// Повідомлення клієнту
function showReviewRequiredMessage() {

    if (isReviewRequired()) {

        reviewMessage.textContent =
            "Спочатку поставте від 1 до 5 зірочок, " +
            "щоб продовжити.";

        starButtons[0].focus();

    } else if (isCommentPending()) {

        reviewMessage.textContent =
            "Щоб зберегти коментар, натисніть " +
            "«Надіслати коментар» або очистіть поле.";

        submitReviewButton.focus();
    }
}

function showScreen(name, activeStep = name) {

    // Не дозволяємо залишити успішну оплату,
    // якщо не поставлено оцінку або не завершено коментар
    if (
        isReviewNavigationBlocked() &&
        name !== "success"
    ) {
        showReviewRequiredMessage();
        return;
    }

    // Приховуємо всі екрани
    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    // Показуємо потрібний екран
    screens[name].classList.add("active");

    // Виділяємо відповідний етап у лівій панелі
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

    // Прокручуємо новий екран догори
    const content = screens[name].querySelector(".content");

    if (content) {
        content.scrollTop = 0;
    }
}

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

function updateAmounts() {

    const amount = `${currentPrice} грн`;

    amountElements.forEach(element => {
        element.textContent = amount;
    });
}

function updateOrderStatus() {

    const paid = paymentStatus === "paid";

    // Після оплати прибираємо замовлення
    // з вкладки "Виконані"
    completedOrderCard.hidden = paid;
    completedEmpty.hidden = !paid;

    // І переносимо до вкладки "Оплачені"
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

    // Відображення знижки
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

function updateRatingStars() {

    starButtons.forEach(button => {

        const value = Number(button.dataset.rating);

        // Підсвічуємо всі зірочки до вибраної оцінки
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


function updateReviewNavigation() {

    const blocked = isReviewNavigationBlocked();

    successToOrdersButton.disabled = blocked;

    successToReceiptButton.disabled = blocked;
}


function updateReviewDisplay() {

    const hasRating = selectedRating > 0;

    // Після надсилання коментаря
    // показуємо картку подяки
    reviewFormCard.hidden = commentSubmitted;

    reviewSavedCard.hidden = !commentSubmitted;

    // Показуємо оцінку в оплаченому замовленні
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

        // Коментар відображається лише після надсилання
        if (
            savedReview &&
            savedReview.comment
        ) {

            const commentElement =
                document.createElement("p");

            commentElement.className =
                "saved-review-comment";

            commentElement.textContent =
                `Коментар: ${savedReview.comment}`;

            paidReviewSummary.appendChild(
                commentElement
            );
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


function updateCommentButton() {

    const hasComment =
        reviewComment.value.trim().length > 0;

    submitReviewButton.disabled =
        selectedRating === 0 ||
        !hasComment ||
        commentSubmitted;
}


starButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (
            paymentStatus !== "paid" ||
            commentSubmitted
        ) {
            return;
        }

        // Отримуємо вибрану кількість зірочок
        selectedRating = Number(button.dataset.rating);

        // Автоматично зберігаємо оцінку
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

reviewComment.addEventListener("input", () => {

    reviewMessage.textContent = "";

    updateCommentButton();

    // Якщо коментар введений, його потрібно
    // надіслати або очистити перед переходом
    updateReviewNavigation();
    updateOrderStatus();
});


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

    // Зберігаємо оцінку разом із коментарем
    savedReview = {
        rating: selectedRating,
        comment: comment
    };

    commentSubmitted = true;

    reviewMessage.textContent = "";

    updateReviewDisplay();
    updateCommentButton();
});

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

function restartDemo() {

    if (isReviewNavigationBlocked()) {
        showReviewRequiredMessage();
        return;
    }

    resetPaymentData();

    showOrdersTab("completed");

    showScreen("orders");
}


function completePayment() {

    // Дату записуємо лише один раз
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


function declinePayment() {

    paymentStatus = "declined";

    updateOrderStatus();

    showScreen("declined");
}


function waitForConfirmation() {

    paymentStatus = "pending";

    updateOrderStatus();

    showScreen("pending");
}



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


orderTabs.active.addEventListener("click", () => {
    showOrdersTab("active");
});

orderTabs.completed.addEventListener("click", () => {
    showOrdersTab("completed");
});

orderTabs.paid.addEventListener("click", () => {
    showOrdersTab("paid");
});


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


document.getElementById("backOrders").addEventListener(
    "click",
    () => {

        showOrdersTab("completed");

        showScreen("orders");
    }
);


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


promoInput.addEventListener("input", () => {

    promoApplied = false;

    currentPrice = originalPrice;

    promoMessage.textContent = "";

    promoMessage.className = "promo-message";

    updateAmounts();
});


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

document.getElementById("backFromWidget").addEventListener(
    "click",
    () => {

        showScreen("details");
    }
);


document.getElementById("cancelWidget").addEventListener(
    "click",
    () => {

        paymentStatus = "unpaid";

        updateOrderStatus();

        showScreen("details");
    }
);


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


document.getElementById(
    "simulateSuccess"
).addEventListener("click", completePayment);

document.getElementById(
    "simulateDeclined"
).addEventListener("click", declinePayment);

document.getElementById(
    "simulatePending"
).addEventListener("click", waitForConfirmation);


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


document.getElementById(
    "declinedToOrders"
).addEventListener("click", () => {

    showOrdersTab("completed");

    showScreen("orders");
});


successToOrdersButton.addEventListener("click", () => {

    if (isReviewNavigationBlocked()) {
        showReviewRequiredMessage();
        return;
    }

    showOrdersTab("paid");

    showScreen("orders");
});


document.getElementById(
    "viewPaidPayment"
).addEventListener("click", () => {

    if (paymentStatus === "paid") {
        showScreen("success");
    }
});

document.getElementById(
    "emptyGoToPaid"
).addEventListener("click", () => {

    showOrdersTab("paid");
});


document.getElementById(
    "simulateConfirmation"
).addEventListener("click", () => {

    if (paymentStatus === "pending") {
        completePayment();
    }
});


document.getElementById(
    "pendingToOrders"
).addEventListener("click", () => {

    showOrdersTab("completed");

    showScreen("orders");
});

document.getElementById(
    "openReceipt"
).addEventListener("click", openReceipt);

successToReceiptButton.addEventListener(
    "click",
    openReceipt
);

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

document.getElementById(
    "printReceipt"
).addEventListener("click", () => {

    if (
        paymentStatus === "paid" &&
        selectedRating > 0
    ) {
        window.print();
    }
});

function navigateDemo(step) {

    // Після успішної оплати спочатку потрібна оцінка
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

        // Новий демонстраційний платіж
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

sidebarButtons.forEach(button => {

    button.addEventListener("click", () => {

        const step = button.dataset.step;

        navigateDemo(step);
    });
});


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

    // Знаходимо активний етап
    const currentButton = document.querySelector(
        ".screens li.current .step-button"
    );

    const currentStep = currentButton
        ? currentButton.dataset.step
        : "orders";

    const currentIndex =
        mainScenarioSteps.indexOf(currentStep);

    // Якщо зараз альтернативний сценарій,
    // переходимо до основного сценарію
    if (currentIndex === -1) {
        navigateDemo("orders");
        return;
    }

    // Якщо це останній етап,
    // повертаємося до оплачених замовлень
    if (
        currentIndex ===
        mainScenarioSteps.length - 1
    ) {

        showOrdersTab("paid");

        showScreen("orders");

        return;
    }

    // Наступний етап основного сценарію
    const nextStep =
        mainScenarioSteps[currentIndex + 1];

    navigateDemo(nextStep);
});


restartButton.addEventListener(
    "click",
    restartDemo
);

restartDemo();
