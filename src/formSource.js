export const userInputs = [
    {
      id: 1,
      label: "Username",
      type: "text",
      placeholder: "john_doe",
      name: "username"
    },
    {
      id: 2,
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      name: "fullName"
    },
    {
      id: 3,
      label: "Email",
      type: "email",
      placeholder: "john_doe@gmail.com",
      name: "email"
    },
    {
      id: 4,
      label: "Phone",
      type: "text",
      placeholder: "+1 234 567 89",
      name: "phone"
    },
    {
      id: 5,
      label: "Password",
      type: "password",
      name: "password"
    },
    {
      id: 6,
      label: "Address",
      type: "text",
      placeholder: "Elton St. 216 NewYork",
      name: "address"
    },
    {
      id: 7,
      label: "Country",
      type: "text",
      placeholder: "USA",
      name: "country"
    },
    {
      id: 8,
      label: "Role",
      type: "select",
      options: ["tenant", "admin"],
      name: "role"
    },
    {
      id: 9,
      label: "Assigned Apartment",
      type: "select",
      name: "apartmentId",
      placeholder: "Select apartment (for tenants only)"
    },
    {
      id: 10,
      label: "Status",
      type: "select",
      options: ["active", "disabled"],
      name: "status",
      placeholder: "Select status"
    },
  ];
  
  export const apartmentInputs = [
    {
      id: 1,
      label: "Apartment Number",
      type: "text",
      placeholder: "Apt 101",
      name: "apartmentNumber"
    },
    {
      id: 2,
      label: "Building",
      type: "text",
      placeholder: "Building A",
      name: "building"
    },
    {
      id: 3,
      label: "Floor",
      type: "number",
      placeholder: "1",
      name: "floor"
    },
    {
      id: 4,
      label: "Bedrooms",
      type: "number",
      placeholder: "2",
      name: "bedrooms"
    },
    {
      id: 5,
      label: "Bathrooms",
      type: "number",
      placeholder: "1",
      name: "bathrooms"
    },
    {
      id: 6,
      label: "Square Feet",
      type: "number",
      placeholder: "800",
      name: "squareFeet"
    },
    {
      id: 7,
      label: "Monthly Rent",
      type: "number",
      placeholder: "1200",
      name: "monthlyRent"
    },
    {
      id: 8,
      label: "Status",
      type: "select",
      options: ["Available", "Occupied", "Under Maintenance"],
      name: "status"
    },
    {
      id: 9,
      label: "Description",
      type: "textarea",
      placeholder: "Apartment description...",
      name: "description"
    },
  ];

  export const paymentInputs = [
    {
      id: 1,
      label: "Tenant",
      type: "select",
      name: "tenantId",
      required: true
    },
    {
      id: 2,
      label: "Apartment",
      type: "select",
      name: "apartmentId",
      required: true
    },
    {
      id: 3,
      label: "Amount",
      type: "number",
      placeholder: "1200",
      name: "amount",
      required: true
    },
    {
      id: 4,
      label: "Payment Type",
      type: "select",
      options: ["Rent", "Deposit", "Late Fee", "Maintenance Fee", "Other"],
      name: "paymentType",
      required: true
    },
    {
      id: 5,
      label: "Payment Method",
      type: "select",
      options: ["Credit Card", "Bank Transfer", "Cash", "Check"],
      name: "paymentMethod",
      required: true
    },
    {
      id: 6,
      label: "Payment Date",
      type: "date",
      name: "paymentDate",
      required: true
    },
    {
      id: 7,
      label: "Status",
      type: "select",
      options: ["Pending", "Paid", "Overdue", "Cancelled"],
      name: "status",
      required: true
    },
    {
      id: 8,
      label: "Description",
      type: "textarea",
      placeholder: "Payment description...",
      name: "description"
    },
  ];

  export const maintenanceInputs = [
    {
      id: 1,
      label: "Apartment",
      type: "select",
      name: "apartmentId",
      required: true
    },
    {
      id: 2,
      label: "Requested By",
      type: "select",
      name: "requestedBy",
      required: true
    },
    {
      id: 3,
      label: "Issue Type",
      type: "select",
      options: ["Plumbing", "Electrical", "HVAC", "Appliance", "Structural", "Other"],
      name: "issueType",
      required: true
    },
    {
      id: 4,
      label: "Priority",
      type: "select",
      options: ["Low", "Medium", "High", "Emergency"],
      name: "priority",
      required: true
    },
    {
      id: 5,
      label: "Issue Description",
      type: "textarea",
      placeholder: "Describe the issue in detail...",
      name: "issue",
      required: true
    },
    {
      id: 6,
      label: "Request Date",
      type: "date",
      name: "requestDate",
      required: true
    },
    {
      id: 7,
      label: "Status",
      type: "select",
      options: ["Pending", "In Progress", "Completed", "Cancelled"],
      name: "status",
      required: true
    },
    {
      id: 8,
      label: "Assigned To",
      type: "text",
      placeholder: "Maintenance staff name",
      name: "assignedTo"
    },
    {
      id: 9,
      label: "Estimated Cost",
      type: "number",
      placeholder: "0.00",
      name: "estimatedCost"
    },
    {
      id: 10,
      label: "Requires Payment",
      type: "checkbox",
      name: "requiresPayment"
    },
    {
      id: 11,
      label: "Notes",
      type: "textarea",
      placeholder: "Additional notes...",
      name: "notes"
    },
  ];
  
  export const productInputs = [
    {
      id: 1,
      label: "Title",
      type: "text",
      placeholder: "Apple Macbook Pro",
    },
    {
      id: 2,
      label: "Description",
      type: "text",
      placeholder: "Description",
    },
    {
      id: 3,
      label: "Category",
      type: "text",
      placeholder: "Computers",
    },
    {
      id: 4,
      label: "Price",
      type: "text",
      placeholder: "100",
    },
    {
      id: 5,
      label: "Stock",
      type: "text",
      placeholder: "in stock",
    },
  ];
  