document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admissionForm');
  const formSteps = Array.from(document.querySelectorAll('.form-step'));
  let currentStep = 0;

  const showStep = (index) => {
    formSteps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });
  };

  form.addEventListener('click', (e) => {
    if (e.target.classList.contains('next-btn')) {
      if (formSteps[currentStep].checkValidity()) {
        currentStep = Math.min(currentStep + 1, formSteps.length - 1);
        showStep(currentStep);
      } else {
        formSteps[currentStep].reportValidity();
      }
    } else if (e.target.classList.contains('prev-btn')) {
      currentStep = Math.max(currentStep - 1, 0);
      showStep(currentStep);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para enviar el formulario
    alert('Formulario enviado con éxito.');
    form.reset();
    currentStep = 0;
    showStep(currentStep);
  });

  showStep(currentStep);
});
