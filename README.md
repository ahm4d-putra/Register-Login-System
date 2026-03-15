
```markdown
User Registration System with Email Verification

A fullstack web application built with **Node.js, Express, HTML, CSS, and Vanilla JavaScript**. This project implements a secure user registration system featuring email verification, password hashing, and a modern glassmorphism UI.
---

✨ Key Features

- **Secure Authentication**: Passwords hashed using `bcrypt`.
- **Email Verification**: Token-based verification using `UUID` and `Nodemailer`.
- **Modern UI**: Dark theme with Glassmorphism design, smooth animations, and responsive layout.
- **Form Validation**: Client-side validation (email format, password strength, required fields).
- **JSON Database**: Lightweight data storage using the file system (no external DB required).

---

🛠️ Installation & Setup

Follow these steps to get the project running on your local machine.

1. Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- A Gmail account (or Mailtrap/Ethereal for testing)

2. Clone or Download
If you have the files ready, navigate to the project directory:
```bash
cd C:\coded\email-sender
```

3. Install Dependencies
Install all required packages defined in `package.json`:

npm install


4. Configure Email Settings (CRITICAL)
Open `utils/mailer.js`. You have two options:

#### Option A: Gmail (Recommended for Production)
You **cannot** use your regular Gmail password. You must generate an **App Password**.
1. Go to your [Google Account Security settings](https://myaccount.google.com/security).
2. Enable **2-Step Verification** if not already active.
3. Search for **"App Passwords"** and create a new one (name it "NodeProject").
4. Copy the 16-character password generated.
5. Update `utils/mailer.js`:

```javascript
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'xxxx xxxx xxxx xxxx' // Your 16-char App Password
    }
};
```

Option B: Ethereal (Recommended for Testing)
If you don't want to use a real email:
1. Go to [Ethereal Email](https://ethereal.email/).
2. Create a free account to get test credentials.
3. Update `utils/mailer.js` with the provided SMTP host, user, and pass.

---

🚀 Running the Server

Start the server with:
```bash
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

🧪 How to Test the Flow

1. Register a New User
- Go to `http://localhost:3000`.
- Fill in the form (Username, Email, Password).
- Click "Create Account".
- You should see a "Check Your Email" message.

2. Verify Email
**If using Gmail:**
- Open your email inbox.
- Click the verification link in the email.
- You will be redirected to the "Email Verified Successfully" page.

If Email fails (Manual Verification):
- Open `database/users.json`.
- Find your user entry.
- Change `"verified": false` to `"verified": true`.
- Save the file.
- Now you can login.

3. Login
- Go to the Login page.
- Enter your credentials.
- If verified, you will see a "Login Successful" message.

---

🔌 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registers a new user and sends verification email. |
| `POST` | `/api/auth/login` | Authenticates user (only if verified). |
| `GET` | `/api/auth/verify?token=...` | Verifies user email via token. |

Request Body Examples

Register:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

Login:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```


## 📜 License

This project is open-sourced under the MIT License.
```
