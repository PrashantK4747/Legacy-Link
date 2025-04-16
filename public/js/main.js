document.addEventListener('DOMContentLoaded', function() {
    const togglePasswordIcons = document.querySelectorAll('.login__password');

    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            // Find the closest parent and then the input field
            const passwordInput = this.parentElement.querySelector('input[type="password"], input[type="text"]');

            if (passwordInput && passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('ri-eye-off-fill');
                this.classList.add('ri-eye-fill');
            } else if (passwordInput) {
                passwordInput.type = 'password';
                this.classList.remove('ri-eye-fill');
                this.classList.add('ri-eye-off-fill');
            }
        });
    });
});