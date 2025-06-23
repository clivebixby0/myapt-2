import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const { addUser, addApartment, addPayment, addMaintenance, users, apartments } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize form data based on inputs
  useEffect(() => {
    const initialData = {};
    inputs.forEach(input => {
      initialData[input.name] = "";
    });
    
    // For payment form, set fixed apartment if available
    if (location.pathname.includes('/payments/new') && apartments.length > 0) {
      // Set the first apartment as fixed
      initialData.apartmentId = apartments[0].id;
    }
    
    setFormData(initialData);
  }, [inputs, apartments, location.pathname]);

  // Populate select options for dynamic fields
  const getSelectOptions = (inputName) => {
    switch (inputName) {
      case "tenantId":
        // For payments, show all tenants for admin, or just the current user for tenants
        if (location.pathname.includes('/payments/new')) {
          if (user?.role === 'tenant') {
            // Tenants can only create payments for themselves
            const userId = user.id || user.uid;
            return [{
              value: userId,
              label: user.fullName || user.username
            }];
          } else {
            // Admins can select any tenant - filter to show only tenant users
            const tenantUsers = users.filter(user => user.role === 'tenant');
            return tenantUsers.map(user => ({
              value: user.id || user.uid,
              label: `${user.fullName || user.username} (${user.email})`
            }));
          }
        }
        return users
          .filter(user => user.role === 'tenant')
          .map(user => ({
            value: user.id || user.uid,
            label: user.fullName || user.username
          }));
      case "requestedBy":
        return users
          .filter(user => user.role === 'tenant')
          .map(user => ({
            value: user.id || user.uid,
            label: user.fullName || user.username
        }));
      case "apartmentId":
        // For payments, show only the fixed apartment
        if (location.pathname.includes('/payments/new')) {
          if (apartments.length > 0) {
            // Return only the first apartment as fixed
            const fixedApartment = apartments[0];
            return [{
              value: fixedApartment.id,
              label: `${fixedApartment.apartmentNumber} - ${fixedApartment.building} (Fixed)`
            }];
          }
          return [];
        }
        return apartments.map(apt => ({
          value: apt.id,
          label: `${apt.apartmentNumber} - ${apt.building}`
        }));
      default:
        return [];
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    inputs.forEach(input => {
      // Skip validation for optional fields
      const isOptional = input.required === false;
      const isTenantField = input.name === "tenantId" && location.pathname.includes('/payments/new') && user?.role === 'tenant';
      
      // Check if field is required and empty
      if (input.type !== "file" && !formData[input.name] && input.name !== "notes" && input.name !== "description" && !isOptional && !isTenantField) {
        newErrors[input.name] = `${input.label} is required`;
      }
      
      // Email validation
      if (input.type === "email" && formData[input.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[input.name])) {
          newErrors[input.name] = "Please enter a valid email address";
        }
      }
      
      // Phone validation
      if (input.name === "phone" && formData[input.name]) {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(formData[input.name].replace(/\s/g, ""))) {
          newErrors[input.name] = "Please enter a valid phone number";
        }
      }

      // Password validation
      if (input.name === "password" && formData[input.name]) {
        if (formData[input.name].length < 6) {
          newErrors[input.name] = "Password must be at least 6 characters long";
        }
      }

      // Amount validation for payments
      if (input.name === "amount" && formData[input.name]) {
        const amount = parseFloat(formData[input.name]);
        if (isNaN(amount) || amount <= 0) {
          newErrors[input.name] = "Please enter a valid amount greater than 0";
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareFormData = (rawData) => {
    const path = location.pathname;
    const preparedData = { ...rawData };

    // Convert string numbers to actual numbers
    ['floor', 'bedrooms', 'bathrooms', 'squareFeet', 'monthlyRent', 'amount'].forEach(field => {
      if (preparedData[field]) {
        preparedData[field] = Number(preparedData[field]);
      }
    });

    // Handle date fields
    ['paymentDate', 'requestDate'].forEach(field => {
      if (preparedData[field]) {
        preparedData[field] = new Date(preparedData[field]);
      }
    });

    // Add tenant name for payments
    if (path.includes('/payments/new') && preparedData.tenantId) {
      const tenant = users.find(user => (user.id || user.uid) === preparedData.tenantId);
      if (tenant) {
        preparedData.tenantName = tenant.fullName || tenant.username;
      }
    }

    // For tenant users creating payments, automatically set their ID
    if (path.includes('/payments/new') && user?.role === 'tenant') {
      const userId = user.id || user.uid;
      preparedData.tenantId = userId;
      preparedData.tenantName = user.fullName || user.username;
    }

    // Add apartment number for payments
    if (path.includes('/payments/new') && preparedData.apartmentId) {
      const apartment = apartments.find(apt => apt.id === preparedData.apartmentId);
      if (apartment) {
        preparedData.apartmentNumber = apartment.apartmentNumber;
        preparedData.building = apartment.building;
      }
    }

    // Add apartment number for maintenance
    if (path.includes('/maintenance/new') && preparedData.apartmentId) {
      const apartment = apartments.find(apt => apt.id === preparedData.apartmentId);
      if (apartment) {
        preparedData.apartmentNumber = apartment.apartmentNumber;
      }
    }

    // Add requester name for maintenance
    if (path.includes('/maintenance/new') && preparedData.requestedBy) {
      const requester = users.find(user => user.id === preparedData.requestedBy);
      if (requester) {
        preparedData.requesterName = requester.fullName || requester.username;
      }
    }

    // Enforce status logic for users
    if (path.includes('/users/new')) {
      if (preparedData.apartmentId) {
        preparedData.status = 'active';
      } else if (preparedData.status !== 'disabled') {
        preparedData.status = 'active';
      }
      if (preparedData.status !== 'active' && preparedData.status !== 'disabled') {
        preparedData.status = 'active';
      }
    }

    return preparedData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage("");
    
    try {
      // Submit data based on the current route
      const path = location.pathname;
      const preparedData = prepareFormData(formData);
      
      let result;
      
      if (path.includes('/users/new')) {
        result = await addUser(preparedData);
      } else if (path.includes('/apartments/new')) {
        result = await addApartment(preparedData);
      } else if (path.includes('/payments/new')) {
        result = await addPayment(preparedData);
      } else if (path.includes('/maintenance/new')) {
        result = await addMaintenance(preparedData);
      }
      
      if (result && result.success) {
        // Reset form
        const initialData = {};
        inputs.forEach(input => {
          initialData[input.name] = "";
        });
        
        // For payment form, keep the fixed apartment
        if (location.pathname.includes('/payments/new') && apartments.length > 0) {
          initialData.apartmentId = apartments[0].id;
        }
        
        setFormData(initialData);
        setFile("");
        
        setSuccessMessage(`${title} created successfully!`);
        
        // Navigate back to the list page after 2 seconds
        setTimeout(() => {
          const basePath = path.replace('/new', '');
          navigate(basePath);
        }, 2000);
      } else {
        // Handle error from the service
        const errorMessage = result?.error?.message || "Failed to create. Please try again.";
        setErrors({ submit: errorMessage });
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Failed to create. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (input) => {
    const commonProps = {
      value: formData[input.name] || "",
      onChange: (e) => handleInputChange(input.name, e.target.value),
      className: errors[input.name] ? "error" : "",
      placeholder: input.placeholder,
    };

    // For tenant users creating payments, hide tenant selection
    if (input.name === "tenantId" && location.pathname.includes('/payments/new') && user?.role === 'tenant') {
      return null; // Don't render this field for tenants
    }

    // For payment form, make apartment field read-only since it's fixed
    if (input.name === "apartmentId" && location.pathname.includes('/payments/new')) {
      const options = getSelectOptions(input.name);
      if (options.length > 0) {
        return (
          <select {...commonProps} disabled>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      }
    }

    switch (input.type) {
      case "select":
        const options = (input.options && input.options.length > 0)
          ? input.options
          : getSelectOptions(input.name);
        return (
          <select {...commonProps}>
            <option value="">Select {input.label}</option>
            {options.map((option, index) => {
              const optionValue = option.value || option;
              const optionLabel = option.label || option;
              return (
                <option key={index} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );
      
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows="4"
            onChange={(e) => handleInputChange(input.name, e.target.value)}
          />
        );
      
      case "date":
        return (
          <input
            {...commonProps}
            type="date"
            onChange={(e) => handleInputChange(input.name, e.target.value)}
          />
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={input.type}
            onChange={(e) => handleInputChange(input.name, e.target.value)}
          />
        );
    }
  };

  // Show loading state if data is not yet loaded
  if (location.pathname.includes('/payments/new') && (users.length === 0 || apartments.length === 0)) {
    return (
      <div className="new">
        <Sidebar />
        <div className="newContainer">
          <Navbar />
          <div className="top">
            <h1>{title}</h1>
          </div>
          <div className="bottom">
            <div className="loading">Loading form data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => {
                const inputElement = renderInput(input);
                if (inputElement === null) return null; // Skip hidden fields
                
                return (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                    {inputElement}
                  {errors[input.name] && (
                    <span className="error-message">{errors[input.name]}</span>
                  )}
                </div>
                );
              })}
              
              {errors.submit && (
                <div className="error-message submit-error">{errors.submit}</div>
              )}
              
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
              
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
