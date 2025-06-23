import "./chart.scss";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

// Admin data (existing)
const adminData = [
  { name: "January", Total: 1200 },
  { name: "February", Total: 2100 },
  { name: "March", Total: 800 },
  { name: "April", Total: 1600 },
  { name: "May", Total: 900 },
  { name: "June", Total: 1700 },
];

// Tenant data - payment history
const tenantData = [
  { name: "Jan", Payments: 1200 },
  { name: "Feb", Payments: 1200 },
  { name: "Mar", Payments: 1200 },
  { name: "Apr", Payments: 1200 },
  { name: "May", Payments: 1200 },
  { name: "Jun", Payments: 1200 },
];

const Chart = ({ aspect, title }) => {
  const { user } = useAuth();
  
  // Use tenant-specific data and title
  const data = user?.role === 'tenant' ? tenantData : adminData;
  const chartTitle = user?.role === 'tenant' ? 'Payment History (Last 6 Months)' : title;

  return (
    <div className="chart">
      <div className="title">{chartTitle}</div>
      <ResponsiveContainer width="100%" aspect={aspect}>
        <AreaChart
          width={730}
          height={250}
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="var(--text-secondary)" />
          <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey={user?.role === 'tenant' ? "Payments" : "Total"}
            stroke="var(--primary-color)"
            fillOpacity={1}
            fill="url(#total)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
