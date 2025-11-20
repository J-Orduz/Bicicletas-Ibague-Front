import { useState } from "react";
import { Link } from "react-router-dom";
// components
import { SubHeader } from "@layouts/SubHeader";
import { ButtonThemeToggle } from "@components/buttonThemeToggle";
import Aurora from "@components/Aurora";
// api
import { useRegisterUserMutation } from "@api/auth";

export const Register = () => {
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
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "La contraseña debe contener al menos una letra y un número";
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
            <h2>Regístrate</h2>
            {/* <p>Únete a BicIbagué y comienza tu aventura</p> */}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ingresa tu nombre"
                className={errors.name ? "input-error" : ""}
                disabled={isLoading}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
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
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres (letras y números)"
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
              {isLoading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="auth-link">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
      <ButtonThemeToggle />
    </section>
  );
};
