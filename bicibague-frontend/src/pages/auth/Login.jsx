import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
// components
// import { SubHeader } from "@layouts/SubHeader";
import { ButtonThemeToggle } from "@components/ButtonThemeToggle";
import Aurora from "@components/Aurora";
// context
import { useAuth } from "@contexts/AuthContext";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// api
import { useLoginUserMutation } from "@api/auth";

export const Login = () => {
  const navigate = useNavigate();
  const loginUserMutation = useLoginUserMutation();
  const { login } = useAuth();
  const { t } = useTranslation();
  const notify = useNotifier();

  const [formData, setFormData] = useState({
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

    if (!formData.email.trim()) {
      newErrors.email = t('auth.email') + " " + t('common.error').toLowerCase();
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.email') + " " + t('common.error').toLowerCase();
    }

    if (!formData.password) {
      newErrors.password = t('auth.password') + " " + t('common.error').toLowerCase();
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
      console.log("Datos de login:", formData);

      const response = await loginUserMutation.post(formData);

      // Usar el contexto para guardar la autenticación
      login(response.session.access_token, response.user);

      navigate("/");
    } catch (error) {
      setErrors({
        submit: error.errorMutationMsg,
      });
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
            <h2>{t('auth.login')}</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
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
                placeholder={t('auth.password')}
                className={errors.password ? "input-error" : ""}
                disabled={isLoading}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
              <div className="forgot-password">
                <Link
                  to="#"
                  onClick={() => notify.info(t('auth.forgotPasswordInfo'))}
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            {errors.submit && (
              <div className="submit-error">{errors.submit}</div>
            )}

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.login')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {t('auth.noAccount')}{" "}
              <Link to="/register" className="auth-link">
                {t('auth.register')}
              </Link>
            </p>
            <button
              type="button"
              className="btn-landing-link"
              onClick={() => navigate("/landing")}
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
