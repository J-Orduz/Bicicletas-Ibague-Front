import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
// components
import { SubHeader } from "@layouts/SubHeader";
import { ButtonThemeToggle } from "@components/ButtonThemeToggle";
import Aurora from "@components/Aurora";
// api
import { useRegisterUserMutation } from "@api/auth";

export const Register = () => {
  const { t } = useTranslation();
  const registerUserMutation = useRegisterUserMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('auth.nameRequired');
    } else if (formData.name.trim().length < 3) {
      newErrors.name = t('auth.nameMinLength');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength');
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('auth.passwordFormat');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Datos de registro:", formData);

      // cambiar name a nombre
      const { name, email, password } = formData;
      const response = await registerUserMutation.post({
        nombre: name,
        email,
        password,
      });

      //   navigate('/');
      alert(response.message);
    } catch (error) {
      setErrors({ submit: error.errorMutationMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-container">
      <Aurora
        colorStops={[
          getComputedStyle(document.documentElement)
            .getPropertyValue("--primary-color")
            .trim() || "#ff922d",
          getComputedStyle(document.documentElement)
            .getPropertyValue("--primary-color-light")
            .trim() || "#ffb380",
          getComputedStyle(document.documentElement)
            .getPropertyValue("--primary-color-dark")
            .trim() || "#e07b1f",
        ]}
        blend={0.5}
        amplitude={1.0}
        speed={0.6}
      />
      <div className="auth-bg-overlay" />

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{t('auth.register')}</h2>
            {/* <p>Únete a BicIbagué y comienza tu aventura</p> */}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">{t('auth.fullName')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.enterName')}
                className={errors.name ? "input-error" : ""}
                disabled={isLoading}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('auth.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className={errors.email ? "input-error" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('auth.password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.passwordPlaceholder')}
                className={errors.password ? "input-error" : ""}
                disabled={isLoading}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {errors.submit && (
              <div className="submit-error">{errors.submit}</div>
            )}

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? t('auth.registering') : t('auth.createAccount')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {t('auth.hasAccount')}{" "}
              <Link to="/login" className="auth-link">
                {t('auth.login')}
              </Link>
            </p>
            <button
              type="button"
              className="btn-landing-link"
              onClick={() => (window.location.href = "/landing")}
              style={{ marginTop: 16 }}
            >
              {t('auth.backToHome')}
            </button>
          </div>
        </div>
      </div>
      <ButtonThemeToggle />
    </section>
  );
};
