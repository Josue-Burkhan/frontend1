<script>
let currentStep = 0;
const steps = document.querySelectorAll('.form-step');

function showStep(index) {
    steps.forEach((step, i) => {
        step.classList.toggle('active', i === index);
    });
    currentStep = index;
}

function nextStep() {
    if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
}

// Inicializa el primer paso al cargar
document.addEventListener('DOMContentLoaded', () => showStep(0));
</script>